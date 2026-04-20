/**
 * ProfileStore
 *
 * Persists deployment profiles using electron-store (JSON on disk).
 *
 * Storage location (Windows):
 *   %APPDATA%\Local\siteground-deploy\profiles.json
 *   → C:\Users\<user>\AppData\Roaming\Local\siteground-deploy\profiles.json
 *
 * electron-store handles atomic writes and cross-platform paths automatically.
 * We never construct the path manually — that's the point of using the library.
 *
 * Profile shape (all fields stored per record):
 * {
 *   id:                string        uuid v4 — assigned on create, immutable
 *   name:              string        friendly label e.g. "BIOHM Production"
 *   sshHost:           string        hostname or IP, no protocol prefix
 *   sshPort:           number        SiteGround default 18765
 *   sshUser:           string        SSH username on the remote server
 *   remoteWebRoot:     string        absolute remote path e.g. /home/user/www
 *   productionDomain:  string        full URL e.g. https://example.com
 *   localSiteId:       string|null   Local for WordPress site ID (nullable)
 *   keyId:             string        uuid — references a key pair in key-manager
 *   privateKeyPath:    string        absolute path to private key file on disk
 *   publicKeyPath:     string        absolute path to public key file on disk
 *   deployMode:        object        { defaultMode: 'code'|'full'|'db' }
 *   confirmDefault:    boolean|null  Danger-zone checkbox default. null = use global setting.
 *   createdAt:         string        ISO timestamp
 *   updatedAt:         string        ISO timestamp
 *   lastDeployedAt:    string|null   ISO timestamp of most recent successful deploy
 *   meta:              object        free-form future-safe bag — never removed on update
 * }
 *
 * All public functions return a structured result object:
 *   { success: true,  data: <result> }
 *   { success: false, error: string, errors?: Record<string,string> }
 *
 * Raw passwords are NEVER stored.
 */

'use strict';

const Store   = require('electron-store');
const { v4: uuidv4 } = require('uuid');
const keyManager   = require('./key-manager');
const validator    = require('./profile-validator');

// ─── Storage ──────────────────────────────────────────────────────────────────

const store = new Store({
  name: 'siteground-deploy-profiles',
  // Schema enforces the correct root shape; individual profile fields are
  // kept flexible so forward-compatible fields survive round-trips.
  schema: {
    profiles: {
      type: 'array',
      default: [],
    },
  },
});

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Read the full profiles array from disk.
 * @returns {Array<object>}
 */
function _readAll() {
  return store.get('profiles', []);
}

/**
 * Overwrite the profiles array on disk.
 * @param {Array<object>} profiles
 */
function _writeAll(profiles) {
  store.set('profiles', profiles);
}

/**
 * Build the canonical key file paths for a keyId so the profile always
 * has the current on-disk locations, even if the userData path changes.
 */
function _keyPaths(keyId) {
  return {
    privateKeyPath: keyManager.getPrivateKeyPath(keyId) || '',
    publicKeyPath:  keyManager.getPublicKey(keyId) ? keyManager.getPrivateKeyPath(keyId) + '.pub' : '',
  };
}

function _deriveProductionDomain(webRoot) {
  if (!webRoot) return '';
  const match = webRoot.match(/\/www\/([^\/]+)/);
  if (match) return `https://${match[1]}`;
  const dm = webRoot.match(/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (dm) return `https://${dm[1]}`;
  return 'https://example.com';
}

/**
 * Merge default fields onto an incoming profile object.
 * Never overwrites fields the caller explicitly supplied.
 */
function _applyDefaults(data) {
  const prodDomain = _deriveProductionDomain(data.remoteWebRoot);
  return {
    localSiteId:      null,
    deployMode:       { defaultMode: 'code' },
    confirmDefault:   null,
    lastDeployedAt:   null,
    meta:             {},
    ...data,
    productionDomain: data.productionDomain || prodDomain,
  };
}

/**
 * Wrap a value in a success result envelope.
 * @param {*} data
 */
function _ok(data) {
  return { success: true, data };
}

/**
 * Wrap an error string in a failure result envelope.
 * @param {string}                     message
 * @param {Record<string,string>} [errors]  field-level errors from validation
 */
function _err(message, errors) {
  return errors
    ? { success: false, error: message, errors }
    : { success: false, error: message };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Return all profiles.
 *
 * @returns {{ success: true, data: Array<object> }}
 */
function getProfiles() {
  return _ok(_readAll());
}

/**
 * Return a single profile by ID.
 *
 * @param {string} id
 * @returns {{ success: true, data: object } | { success: false, error: string }}
 */
function getProfileById(id) {
  if (!id) return _err('id is required.');
  const profile = _readAll().find((p) => p.id === id) || null;
  if (!profile) return _err(`Profile "${id}" not found.`);
  return _ok(profile);
}

/**
 * Create a new profile.
 * Validates all required fields before writing.
 * Automatically resolves and embeds key file paths from keyId.
 *
 * @param {object} data  - profile fields (id and timestamps must NOT be supplied by caller)
 * @returns {{ success: true, data: object } | { success: false, error: string, errors?: object }}
 */
function createProfile(data) {
  // Caller must not pass an id — we own that
  if (data.id) return _err('id must not be set on create — it is assigned automatically.');

  // Guard against raw passwords
  if (data.password || data.sshPassword) {
    return _err('Passwords must not be stored in profiles. Use SSH key authentication.');
  }

  const check = validator.validateProfile(data);
  if (!check.valid) {
    return _err('Validation failed. Please correct the highlighted fields.', check.errors);
  }

  const now = new Date().toISOString();
  const id  = uuidv4();

  const keyPaths = _keyPaths(data.keyId);

  const profile = _applyDefaults({
    ...data,
    ...keyPaths,
    id,
    sshPort:    Number(data.sshPort) || 18765,
    createdAt:  now,
    updatedAt:  now,
    lastDeployedAt: null,
    meta:       data.meta || {},
  });

  const profiles = _readAll();
  profiles.push(profile);
  _writeAll(profiles);

  return _ok(profile);
}

/**
 * Update an existing profile by ID.
 * Only the fields present in `patch` are changed.
 * id, createdAt, and keyId are immutable after creation.
 *
 * @param {string} id
 * @param {object} patch
 * @returns {{ success: true, data: object } | { success: false, error: string, errors?: object }}
 */
function updateProfile(id, patch) {
  if (!id) return _err('id is required.');

  // Guard immutable fields
  const immutable = ['id', 'createdAt', 'keyId'];
  for (const f of immutable) {
    if (f in patch) return _err(`"${f}" cannot be changed after creation.`);
  }

  // Guard against raw passwords
  if (patch.password || patch.sshPassword) {
    return _err('Passwords must not be stored in profiles. Use SSH key authentication.');
  }

  const check = validator.validateProfilePatch(patch);
  if (!check.valid) {
    return _err('Validation failed. Please correct the highlighted fields.', check.errors);
  }

  const profiles = _readAll();
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx < 0) return _err(`Profile "${id}" not found.`);

  profiles[idx] = {
    ...profiles[idx],
    ...patch,
    // Coerce port to number if it was patched
    ...(patch.sshPort != null ? { sshPort: Number(patch.sshPort) } : {}),
    id,                                     // immutable
    createdAt:  profiles[idx].createdAt,    // immutable
    keyId:      profiles[idx].keyId,        // immutable
    // Preserve existing meta and deep-merge new meta keys
    meta: { ...profiles[idx].meta, ...(patch.meta || {}) },
    updatedAt: new Date().toISOString(),
  };

  _writeAll(profiles);
  return _ok(profiles[idx]);
}

/**
 * Delete a profile by ID.
 *
 * @param {string} id
 * @returns {{ success: true, data: { deleted: true } } | { success: false, error: string }}
 */
function deleteProfile(id) {
  if (!id) return _err('id is required.');

  const profiles = _readAll();
  const next = profiles.filter((p) => p.id !== id);

  if (next.length === profiles.length) {
    return _err(`Profile "${id}" not found.`);
  }

  _writeAll(next);
  return _ok({ deleted: true });
}

/**
 * Mark a profile as deployed (sets lastDeployedAt to now).
 * Called by DeployService at the end of a successful deploy — not exposed to the renderer.
 *
 * @param {string} id
 * @returns {{ success: true, data: object } | { success: false, error: string }}
 */
function markDeployed(id) {
  return updateProfile(id, { lastDeployedAt: new Date().toISOString() });
}

/**
 * Validate profile data without writing anything.
 * Useful for renderer-side pre-flight checks via IPC.
 *
 * @param {object}  data
 * @param {boolean} isUpdate
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
function validateProfileData(data, isUpdate = false) {
  return validator.validateProfile(data, { isUpdate });
}

// ─── Legacy aliases (used by existing IPC handlers) ───────────────────────────
// Keep these so main/index.js doesn't need to change until a later refactor.
const listProfiles = () => getProfiles().data;
const getProfile   = (id) => getProfileById(id).data || null;
const saveProfile  = (data) => {
  // Wizard calls saveProfile with the full wizard data object.
  // If it has an id, treat as update; otherwise create.
  if (data.id) {
    const { id, ...patch } = data;
    const result = updateProfile(id, patch);
    return result.success ? result.data : (() => { throw new Error(result.error); })();
  }
  const result = createProfile(data);
  if (!result.success) throw new Error(result.error);
  return result.data;
};

module.exports = {
  // Primary API — return { success, data|error } envelopes
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  markDeployed,
  validateProfileData,

  // Legacy aliases — kept for compatibility with existing IPC handlers
  listProfiles,
  getProfile,
  saveProfile,
};


