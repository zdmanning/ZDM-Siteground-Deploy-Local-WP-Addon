/**
 * KeyManager
 *
 * Generates and manages Ed25519 SSH key pairs for deployment profiles.
 *
 * ── Storage layout (Windows) ──────────────────────────────────────────────────
 *   %APPDATA%\Roaming\Local\siteground-deploy\keys\
 *     {keyId}          private key  (OpenSSH PEM, mode 0o600)
 *     {keyId}.pub      public key   (OpenSSH wire format)
 *
 *   Example:
 *     C:\Users\Alice\AppData\Roaming\Local\siteground-deploy\keys\
 *       550e8400-e29b-41d4-a716-446655440000
 *       550e8400-e29b-41d4-a716-446655440000.pub
 *
 * ── Key formats ──────────────────────────────────────────────────────────────
 *   Private: OpenSSH private key format  (-----BEGIN OPENSSH PRIVATE KEY-----)
 *            ssh2 v1.x requires this; PKCS8 PEM is NOT supported for Ed25519.
 *   Public:  OpenSSH wire format         (ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...)
 *            Paste directly into SiteGround > SSH Keys manager.
 *
 * ── Security rules ───────────────────────────────────────────────────────────
 *   - Private key content NEVER leaves the main process.
 *   - The renderer only ever receives the public key string.
 *   - Private key files are written with mode 0o600 (owner read/write only).
 *   - On write failure, partial files are cleaned up before returning error.
 *   - generateSshKeyPairForProfile refuses to overwrite an existing key.
 *
 * ── Result envelopes ─────────────────────────────────────────────────────────
 *   All public functions return:
 *     { success: true,  data: <result> }
 *     { success: false, error: string }
 *
 * ── Crypto implementation note ────────────────────────────────────────────────
 *   Uses Node.js built-in crypto.generateKeyPairSync('ed25519').
 *   No native binaries, no system SSH tools, no internet required.
 *   DER offset constants (SPKI header = 12 bytes, PKCS8 header = 16 bytes)
 *   are fixed for Ed25519 per RFC 8410 / X.509 SubjectPublicKeyInfo.
 */

'use strict';

const path = require('path');
const fs   = require('fs');
const { app }                 = require('electron');
const { generateKeyPair: cryptoGenerateKeyPair } = require('crypto');

// ─── Directory helpers ────────────────────────────────────────────────────────

/**
 * Return the absolute path to the key storage directory, creating it if
 * it does not exist. On Windows this resolves to:
 *   C:\Users\<user>\AppData\Roaming\Local\siteground-deploy\keys
 *
 * @returns {string}
 */
function ensureKeyStorageDirectory() {
  const dir = path.join(app.getPath('userData'), 'siteground-deploy', 'keys');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * Absolute path to the private key file for a given keyId.
 * @param {string} keyId
 * @returns {string}
 */
function privateKeyPath(keyId) {
  return path.join(ensureKeyStorageDirectory(), keyId);
}

/**
 * Absolute path to the public key file for a given keyId.
 * @param {string} keyId
 * @returns {string}
 */
function publicKeyPath(keyId) {
  return path.join(ensureKeyStorageDirectory(), `${keyId}.pub`);
}

// ─── OpenSSH format assembly ──────────────────────────────────────────────────
// Convert raw DER-extracted key bytes into formats ssh2 and SiteGround expect.

/** Write a big-endian uint32 into a 4-byte Buffer. */
function _u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0);
  return b;
}

/** Encode a string or Buffer as an SSH wire-format length-prefixed field. */
function _sshBuf(data) {
  const b = typeof data === 'string' ? Buffer.from(data) : data;
  return Buffer.concat([_u32(b.length), b]);
}

/**
 * Convert a raw 32-byte Ed25519 public key to OpenSSH public key string.
 * Output: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... siteground-deploy"
 *
 * @param {Buffer} rawPub  32-byte Ed25519 public key
 * @returns {string}
 */
function _toOpenSSHPublicKey(rawPub) {
  const keyType = 'ssh-ed25519';
  const wire = Buffer.concat([_sshBuf(keyType), _sshBuf(rawPub)]);
  return `${keyType} ${wire.toString('base64')} siteground-deploy`;
}

/**
 * Build an OpenSSH private key PEM from raw seed and public key bytes.
 * Format reference: https://github.com/openssh/openssh-portable/blob/master/PROTOCOL.key
 *
 * @param {Buffer} seed    32-byte Ed25519 private seed
 * @param {Buffer} rawPub  32-byte Ed25519 public key
 * @returns {string}  PEM string (-----BEGIN OPENSSH PRIVATE KEY-----)
 */
function _toOpenSSHPrivateKey(seed, rawPub) {
  const keyType   = 'ssh-ed25519';
  const pubWire   = Buffer.concat([_sshBuf(keyType), _sshBuf(rawPub)]);
  // OpenSSH private key = seed || pubkey = 64 bytes
  const privFull  = Buffer.concat([seed, rawPub]);
  const checkVal  = (Math.floor(Math.random() * 0xFFFFFFFE) + 1) >>> 0;
  const check     = _u32(checkVal);

  let privBlock = Buffer.concat([
    check, check,
    _sshBuf(keyType),
    _sshBuf(rawPub),
    _sshBuf(privFull),
    _sshBuf('siteground-deploy'),   // key comment
  ]);

  // Pad to 8-byte alignment with sequential bytes 0x01, 0x02, ...
  let padByte = 1;
  while (privBlock.length % 8 !== 0) {
    privBlock = Buffer.concat([privBlock, Buffer.from([padByte++ & 0xFF])]);
  }

  const keyData = Buffer.concat([
    Buffer.from('openssh-key-v1\x00'),
    _sshBuf('none'),              // ciphername
    _sshBuf('none'),              // kdfname
    _sshBuf(Buffer.alloc(0)),     // kdfoptions (empty)
    _u32(1),                      // number of keys
    _sshBuf(pubWire),
    _sshBuf(privBlock),
  ]);

  const b64 = keyData.toString('base64').match(/.{1,70}/g).join('\n');
  return `-----BEGIN OPENSSH PRIVATE KEY-----\n${b64}\n-----END OPENSSH PRIVATE KEY-----\n`;
}

// ─── Result helpers ───────────────────────────────────────────────────────────

function _ok(data)   { return { success: true,  data  }; }
function _err(error) { return { success: false, error }; }

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate an Ed25519 SSH key pair for a deployment profile.
 *
 * Primary entry point for the onboarding wizard (Step 4 / Step4_KeyGen.jsx).
 * The wizard passes the pre-assigned keyId from WizardContainer so the key
 * identity is stable even if the user navigates back and the step re-mounts.
 *
 * How the wizard calls this:
 *   // In Step4_KeyGen.jsx
 *   const result = await generateKey(data.keyId);   // IPC channel sgd:keys:generate
 *   if (!result.success) { showError(result.error); return; }
 *   onChange({ publicKey: result.data.publicKey });  // stored in wizard state
 *   // Step 5 reads result.data.publicKey for the clipboard copy UI
 *
 * @param {string} keyId  UUID v4 pre-assigned in WizardContainer
 * @returns {Promise<
 *   { success: true,  data: { keyId, publicKey, privateKeyPath, publicKeyPath } } |
 *   { success: false, error: string }
 * >}
 */
async function generateSshKeyPairForProfile(keyId) {
  if (!keyId || typeof keyId !== 'string') {
    return _err('keyId is required and must be a string.');
  }

  // Refuse to silently overwrite — caller must deleteKeyPair first if regenerating
  if (fs.existsSync(privateKeyPath(keyId))) {
    return _err(
      `A key pair already exists for this profile. ` +
      'Delete the existing key before generating a new one.'
    );
  }

  let privPath = null;
  let pubPath  = null;

  try {
    ensureKeyStorageDirectory();

    // Generate in DER format — async so we never block Local's main process thread.
    // Using sync was causing Local's MySQL service heartbeat to miss its window.
    const { publicKey: pubDer, privateKey: privDer } = await new Promise((resolve, reject) => {
      cryptoGenerateKeyPair('ed25519', {
        publicKeyEncoding:  { type: 'spki',  format: 'der' },
        privateKeyEncoding: { type: 'pkcs8', format: 'der' },
      }, (err, pub, priv) => {
        if (err) reject(err);
        else resolve({ publicKey: pub, privateKey: priv });
      });
    });

    // SPKI  Ed25519 DER: 12-byte ASN.1 header + 32-byte public key
    // PKCS8 Ed25519 DER: 16-byte ASN.1 header + 32-byte private seed
    const rawPub = pubDer.slice(12);
    const seed   = privDer.slice(16);

    const openSSHPriv = _toOpenSSHPrivateKey(seed, rawPub);
    const openSSHPub  = _toOpenSSHPublicKey(rawPub);

    privPath = privateKeyPath(keyId);
    pubPath  = publicKeyPath(keyId);

    // 0o600 = owner read/write only — required for ssh clients to accept the key
    fs.writeFileSync(privPath, openSSHPriv, { encoding: 'utf8', mode: 0o600 });
    fs.writeFileSync(pubPath,  openSSHPub + '\n', 'utf8');

    return _ok({
      keyId,
      publicKey:      openSSHPub,
      privateKeyPath: privPath,
      publicKeyPath:  pubPath,
    });

  } catch (err) {
    // Atomically clean up partial files so the next call starts fresh
    try { if (privPath && fs.existsSync(privPath)) fs.unlinkSync(privPath); } catch (_) {}
    try { if (pubPath  && fs.existsSync(pubPath))  fs.unlinkSync(pubPath);  } catch (_) {}

    return _err(`Key generation failed: ${err.message}`);
  }
}

/**
 * Read the public key string from disk.
 * Safe to return to the renderer — public keys are not sensitive data.
 *
 * @param {string} keyId
 * @returns {{ success: true,  data: { keyId, publicKey, publicKeyPath } } |
 *           { success: false, error: string }}
 */
function getPublicKeyContents(keyId) {
  if (!keyId) return _err('keyId is required.');

  const p = publicKeyPath(keyId);
  if (!fs.existsSync(p)) {
    return _err(
      `Public key not found for this profile. ` +
      'The key pair may not have been generated yet.'
    );
  }

  const publicKey = fs.readFileSync(p, 'utf8').trim();
  return _ok({ keyId, publicKey, publicKeyPath: p });
}

/**
 * Return the absolute path to the private key file.
 * FOR MAIN PROCESS USE ONLY — never send this path or content to the renderer.
 * Used exclusively by ssh-service when building the ssh2 connection config.
 *
 * @param {string} keyId
 * @returns {string|null}  Absolute path, or null if the file does not exist.
 */
function getPrivateKeyPath(keyId) {
  const p = privateKeyPath(keyId);
  return fs.existsSync(p) ? p : null;
}

/**
 * Check whether a complete key pair (both files) exists for the given keyId.
 * Used by Step4_KeyGen to skip generation if the user navigated back and the
 * key was already created in an earlier pass through the wizard.
 *
 * @param {string} keyId
 * @returns {{ success: true, data: { exists: boolean, keyId: string } }}
 */
function keyPairExists(keyId) {
  const exists =
    Boolean(keyId) &&
    fs.existsSync(privateKeyPath(keyId)) &&
    fs.existsSync(publicKeyPath(keyId));

  return _ok({ exists, keyId: keyId || '' });
}

/**
 * Delete both key files for a keyId.
 * Called when a profile is deleted so orphaned keys do not accumulate.
 * Silently succeeds if the files are already absent.
 *
 * @param {string} keyId
 * @returns {{ success: true, data: { deleted: boolean } } |
 *           { success: false, error: string }}
 */
function deleteKeyPair(keyId) {
  if (!keyId) return _err('keyId is required.');

  try {
    const priv = privateKeyPath(keyId);
    const pub  = publicKeyPath(keyId);
    if (fs.existsSync(priv)) fs.unlinkSync(priv);
    if (fs.existsSync(pub))  fs.unlinkSync(pub);
    return _ok({ deleted: true });
  } catch (err) {
    return _err(`Failed to delete key files: ${err.message}`);
  }
}

/**
 * Delete key files for any keyId that is NOT in the knownProfileIds set.
 * Safe to call when profiles are in an inconsistent state — it never touches
 * keys that belong to a live profile.
 *
 * @param {string[]} knownProfileIds  Array of profile IDs that still exist.
 * @returns {{ success: true, data: { deleted: number } } |
 *           { success: false, error: string }}
 */
function deleteOrphanedKeys(knownProfileIds) {
  try {
    const dir = ensureKeyStorageDirectory();
    const known = new Set(Array.isArray(knownProfileIds) ? knownProfileIds : []);
    const files = fs.readdirSync(dir);

    // Collect unique base IDs (filenames without .pub extension)
    const ids = new Set(files.map(f => f.endsWith('.pub') ? f.slice(0, -4) : f));

    let deleted = 0;
    for (const id of ids) {
      if (!known.has(id)) {
        const priv = privateKeyPath(id);
        const pub  = publicKeyPath(id);
        if (fs.existsSync(priv)) { fs.unlinkSync(priv); deleted++; }
        if (fs.existsSync(pub))  { fs.unlinkSync(pub); }
      }
    }

    return _ok({ deleted });
  } catch (err) {
    return _err(`Failed to delete orphaned keys: ${err.message}`);
  }
}

// ─── Legacy aliases (preserved for existing IPC handlers) ────────────────────

/**
 * @deprecated  Prefer generateSshKeyPairForProfile.
 * Wraps it for the existing sgd:keys:generate IPC channel — throws on failure
 * so the existing IPC handler's try/catch layer still catches errors.
 */
async function generateKeyPair(keyId) {
  const result = await generateSshKeyPairForProfile(keyId);
  if (!result.success) throw new Error(result.error);
  return result.data;
}

/**
 * @deprecated  Prefer getPublicKeyContents.
 * Returns the raw public key string or null for the existing IPC channel.
 */
function getPublicKey(keyId) {
  const result = getPublicKeyContents(keyId);
  return result.success ? result.data.publicKey : null;
}

module.exports = {
  // ── Primary API ─────────────────────────────────────────────────────────────
  ensureKeyStorageDirectory,
  generateSshKeyPairForProfile,
  getPublicKeyContents,
  getPrivateKeyPath,
  keyPairExists,
  deleteKeyPair,
  deleteOrphanedKeys,

  // ── Path accessors (used by profile-store to embed paths in profile records) ─
  privateKeyPath,
  publicKeyPath,

  // ── Legacy aliases ───────────────────────────────────────────────────────────
  generateKeyPair,
  getPublicKey,
};
