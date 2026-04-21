/**
 * ExportService
 *
 * Handles full-fidelity export and import of deployment profiles, including
 * the SSH key files that accompany each profile.
 *
 * ── Export format ─────────────────────────────────────────────────────────────
 *   A single .sgdexport file (JSON) containing:
 *   {
 *     version:    1,
 *     exportedAt: ISO string,
 *     profiles: [
 *       {
 *         ...all profile fields...,
 *         _privateKey: "-----BEGIN OPENSSH PRIVATE KEY-----\n...",
 *         _publicKey:  "ssh-ed25519 AAAA..."
 *       }
 *     ]
 *   }
 *   The _privateKey / _publicKey fields are stripped before writing back to
 *   profileStore; they only exist inside the export bundle.
 *
 * ── Security note ─────────────────────────────────────────────────────────────
 *   The export file contains raw private keys. Treat it like a password file.
 *   This service makes no attempt to encrypt the file — encryption/passphrase
 *   protection is a future enhancement. The renderer displays a prominent warning.
 *
 * ── Import collision strategy ─────────────────────────────────────────────────
 *   Import is split into two IPC calls:
 *     1. sgd:export:import:pick  — open file dialog, parse, return preview + conflicts
 *     2. sgd:export:import:apply — apply with per-profile decisions
 *
 *   Per-profile decisions (passed by renderer after showing conflict UI):
 *     'skip'      — do nothing, leave existing profile untouched
 *     'overwrite' — update the existing profile's data; overwrite its key files
 *     'rename'    — import as new profile with name suffix " (imported)";
 *                   assign a fresh keyId so the new keys don't collide
 *
 *   Profiles with no local conflict are always imported as new (fresh internal id).
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { dialog, app } = require('electron');
const { v4: uuidv4 }  = require('uuid');

const profileStore = require('./profile-store');
const keyManager   = require('./key-manager');

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPORT_VERSION = 1;
const FILE_FILTERS   = [{ name: 'SiteGround Deploy Export', extensions: ['sgdexport'] }];

// ─── Result helpers ───────────────────────────────────────────────────────────

function _ok(data)   { return { success: true,  data  }; }
function _err(error) { return { success: false, error }; }

// ─── Key directory helper ─────────────────────────────────────────────────────

function _keyDir() {
  const dir = path.join(app.getPath('userData'), 'siteground-deploy', 'keys');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function _privPath(keyId) { return path.join(_keyDir(), keyId); }
function _pubPath(keyId)  { return path.join(_keyDir(), `${keyId}.pub`); }

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Export selected profiles (by ID) to a .sgdexport file.
 * Opens a native save dialog so the user chooses the destination.
 * If profileIds is empty/null, all profiles are exported.
 *
 * @param {string[]|null} profileIds
 * @returns {Promise<{ success: true, data: { filePath, count } } | { success: false, error }>}
 */
async function exportProfiles(profileIds) {
  const allRes = profileStore.getProfiles();
  if (!allRes.success) return allRes;

  const toExport = (Array.isArray(profileIds) && profileIds.length)
    ? allRes.data.filter((p) => profileIds.includes(p.id))
    : allRes.data;

  if (toExport.length === 0) {
    return _err('No profiles selected for export.');
  }

  const { filePath, canceled } = await dialog.showSaveDialog({
    title:       'Export SiteGround Deploy Profiles',
    defaultPath: `sgd-profiles-${new Date().toISOString().slice(0, 10)}.sgdexport`,
    filters:     FILE_FILTERS,
  });

  if (canceled || !filePath) {
    return _err('Export cancelled.');
  }

  // Bundle each profile with its key file contents
  const exportedProfiles = [];

  for (const profile of toExport) {
    const entry = { ...profile };

    if (profile.keyId) {
      const privPath = keyManager.getPrivateKeyPath(profile.keyId);
      if (privPath && fs.existsSync(privPath)) {
        entry._privateKey = fs.readFileSync(privPath, 'utf8');
      }

      const pubRes = keyManager.getPublicKeyContents(profile.keyId);
      if (pubRes.success) {
        entry._publicKey = pubRes.data.publicKey;
      }
    }

    exportedProfiles.push(entry);
  }

  const bundle = {
    version:    EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    profiles:   exportedProfiles,
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(bundle, null, 2), 'utf8');
  } catch (e) {
    return _err(`Could not write export file: ${e.message}`);
  }

  return _ok({ filePath, count: exportedProfiles.length });
}

// ─── Import — stage 1: pick & parse ──────────────────────────────────────────

/**
 * Open a file picker, parse the .sgdexport file, and return a preview.
 * Does NOT write anything — the caller (renderer) shows conflict UI and then
 * calls applyImport() with resolved decisions.
 *
 * @returns {Promise<{
 *   success: true,
 *   data: {
 *     profiles:   object[],        parsed profile records (with _privateKey/_publicKey)
 *     conflicts:  string[],        ids of profiles that already exist locally
 *     exportedAt: string,
 *     filePath:   string,
 *   }
 * } | { success: false, error: string }>}
 */
async function pickAndParseImport() {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title:      'Import SiteGround Deploy Profiles',
    filters:    [
      ...FILE_FILTERS,
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });

  if (canceled || !filePaths || !filePaths.length) {
    return _err('Import cancelled.');
  }

  let bundle;
  try {
    const raw = fs.readFileSync(filePaths[0], 'utf8');
    bundle = JSON.parse(raw);
  } catch (e) {
    return _err(`Could not read import file: ${e.message}`);
  }

  if (
    !bundle ||
    bundle.version !== EXPORT_VERSION ||
    !Array.isArray(bundle.profiles) ||
    bundle.profiles.length === 0
  ) {
    return _err('Invalid or unrecognised export file. Make sure the file was created by SiteGround Deploy.');
  }

  const existingRes = profileStore.getProfiles();
  const existingIds = new Set(existingRes.success ? existingRes.data.map((p) => p.id) : []);
  const conflicts   = bundle.profiles.filter((p) => existingIds.has(p.id)).map((p) => p.id);

  return _ok({
    profiles:   bundle.profiles,
    conflicts,
    exportedAt: bundle.exportedAt || null,
    filePath:   filePaths[0],
  });
}

// ─── Import — stage 2: apply ──────────────────────────────────────────────────

/**
 * Apply an import with per-profile conflict decisions supplied by the renderer.
 *
 * decisions: Record<profileId, 'skip' | 'overwrite' | 'rename'>
 * Profiles without a conflict entry are always imported fresh.
 *
 * @param {object[]} profiles   parsed profiles from pickAndParseImport
 * @param {Record<string, 'skip'|'overwrite'|'rename'>} decisions
 * @returns {{ success: true, data: { imported, skipped, overwritten, renamed } }}
 */
async function applyImport(profiles, decisions = {}) {
  const existingRes = profileStore.getProfiles();
  const existingMap = new Map(
    existingRes.success ? existingRes.data.map((p) => [p.id, p]) : []
  );

  let imported = 0, skipped = 0, overwritten = 0, renamed = 0;

  for (const profile of profiles) {
    // Strip the export-only key content fields from the profile data
    const { _privateKey, _publicKey, ...profileData } = profile;

    const isConflict = existingMap.has(profileData.id);
    const decision   = isConflict ? (decisions[profileData.id] || 'skip') : null;

    if (decision === 'skip') {
      skipped++;
      continue;
    }

    if (decision === 'overwrite') {
      // Overwrite: the existing keyId is immutable, so write imported key
      // content to the existing profile's key files, then patch the profile data.
      const existing  = existingMap.get(profileData.id);
      const useKeyId  = existing.keyId;
      const privPath  = _privPath(useKeyId);
      const pubPath   = _pubPath(useKeyId);

      if (_privateKey) {
        fs.writeFileSync(privPath, _privateKey, { encoding: 'utf8', mode: 0o600 });
      }
      if (_publicKey) {
        fs.writeFileSync(pubPath, _publicKey.trim() + '\n', 'utf8');
      }

      // Build patch — exclude immutable fields that updateProfile rejects
      // (_privateKey/_publicKey were already stripped from profileData above)
      const { id, createdAt, keyId, ...patchable } = profileData;
      const overwriteRes = profileStore.updateProfile(profileData.id, {
        ...patchable,
        privateKeyPath: privPath,
        publicKeyPath:  pubPath,
      });

      if (overwriteRes.success) overwritten++;
      continue;
    }

    if (decision === 'rename') {
      // Rename: fresh keyId, name suffix, new internal profile id (createProfile assigns it)
      const newKeyId  = uuidv4();
      const privPath  = _privPath(newKeyId);
      const pubPath   = _pubPath(newKeyId);

      if (_privateKey) {
        fs.writeFileSync(privPath, _privateKey, { encoding: 'utf8', mode: 0o600 });
      }
      if (_publicKey) {
        fs.writeFileSync(pubPath, _publicKey.trim() + '\n', 'utf8');
      }

      const { id, createdAt, updatedAt, lastDeployedAt, keyId, ...rest } = profileData;
      const renameRes = profileStore.createProfile({
        ...rest,
        name:  `${rest.name} (imported)`,
        keyId: newKeyId,
      });

      if (renameRes.success) renamed++;
      continue;
    }

    // No conflict — fresh import. Preserve the exported keyId (it isn't in use locally).
    // createProfile will call _keyPaths(keyId) which reads the file we're about to write.
    const useKeyId = profileData.keyId || uuidv4();
    const privPath = _privPath(useKeyId);
    const pubPath  = _pubPath(useKeyId);

    if (_privateKey) {
      fs.writeFileSync(privPath, _privateKey, { encoding: 'utf8', mode: 0o600 });
    }
    if (_publicKey) {
      fs.writeFileSync(pubPath, _publicKey.trim() + '\n', 'utf8');
    }

    // Strip id so createProfile assigns a fresh one; keep keyId so _keyPaths resolves
    const { id, createdAt, updatedAt, lastDeployedAt, ...rest } = profileData;
    const importRes = profileStore.createProfile({ ...rest, keyId: useKeyId });

    if (importRes.success) imported++;
  }

  return _ok({ imported, skipped, overwritten, renamed });
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = { exportProfiles, pickAndParseImport, applyImport };
