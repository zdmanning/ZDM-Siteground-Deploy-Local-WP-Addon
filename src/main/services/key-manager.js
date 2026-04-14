/**
 * KeyManager
 *
 * Generates Ed25519 SSH key pairs using Node.js built-in crypto.
 * Keys are stored at:
 *   %APPDATA%\Local\siteground-deploy\keys\{keyId}       (private, OpenSSH PEM)
 *   %APPDATA%\Local\siteground-deploy\keys\{keyId}.pub   (public, OpenSSH format)
 *
 * The private key NEVER leaves this module or the local filesystem.
 * The renderer process only ever receives the public key string.
 *
 * Key format notes:
 *   - Private key: OpenSSH private key format (-----BEGIN OPENSSH PRIVATE KEY-----)
 *     Required by ssh2 v1.x; PKCS8 PEM is NOT supported by ssh2 for Ed25519.
 *   - Public key: OpenSSH wire format (ssh-ed25519 AAAAC3...)
 *     Copy this directly into SiteGround's SSH key manager.
 */

const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { generateKeyPairSync } = require('crypto');

// ─── Key directory ─────────────────────────────────────────────────────────────

function _keysDir() {
  const dir = path.join(app.getPath('userData'), 'siteground-deploy', 'keys');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function _privateKeyPath(keyId) {
  return path.join(_keysDir(), keyId);
}

function _publicKeyPath(keyId) {
  return path.join(_keysDir(), `${keyId}.pub`);
}

// ─── Key format helpers ────────────────────────────────────────────────────────

/**
 * Write a big-endian uint32 into a 4-byte Buffer.
 */
function _u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0);
  return b;
}

/**
 * Encode a string or Buffer as an SSH wire-format length-prefixed field.
 */
function _sshBuf(data) {
  const b = typeof data === 'string' ? Buffer.from(data) : data;
  return Buffer.concat([_u32(b.length), b]);
}

/**
 * Convert raw 32-byte Ed25519 public key bytes to OpenSSH public key string.
 * Result format: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... siteground-deploy"
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
 * Build an OpenSSH private key PEM from raw seed and raw public key bytes.
 * ssh2 v1.x requires OpenSSH format for Ed25519; PKCS8 PEM is not supported.
 *
 * Format reference: https://github.com/openssh/openssh-portable/blob/master/PROTOCOL.key
 *
 * @param {Buffer} seed    32-byte Ed25519 private seed
 * @param {Buffer} rawPub  32-byte Ed25519 public key
 * @returns {string}  PEM string (-----BEGIN OPENSSH PRIVATE KEY-----)
 */
function _toOpenSSHPrivateKey(seed, rawPub) {
  const keyType = 'ssh-ed25519';

  // Public key wire encoding (used in both the outer header and inner block)
  const pubWire = Buffer.concat([_sshBuf(keyType), _sshBuf(rawPub)]);

  // Ed25519 private key used by OpenSSH = seed (32 bytes) || pubkey (32 bytes) = 64 bytes
  const privKeyFull = Buffer.concat([seed, rawPub]);

  // Check integer — appears twice; both must match (any non-zero uint32 works)
  const checkVal = (Math.floor(Math.random() * 0xFFFFFFFE) + 1) >>> 0;
  const check = _u32(checkVal);

  // Inner private-key block (before padding)
  let privBlock = Buffer.concat([
    check,
    check,
    _sshBuf(keyType),
    _sshBuf(rawPub),
    _sshBuf(privKeyFull),
    _sshBuf('siteground-deploy'),  // comment
  ]);

  // Pad to 8-byte boundary using bytes 0x01, 0x02, 0x03, ...
  let padByte = 1;
  while (privBlock.length % 8 !== 0) {
    privBlock = Buffer.concat([privBlock, Buffer.from([padByte++ & 0xFF])]);
  }

  // Outer structure
  const keyData = Buffer.concat([
    Buffer.from('openssh-key-v1\x00'),  // magic string
    _sshBuf('none'),                     // ciphername
    _sshBuf('none'),                     // kdfname
    _sshBuf(Buffer.alloc(0)),           // kdfoptions (empty)
    _u32(1),                             // number of keys
    _sshBuf(pubWire),                    // public key
    _sshBuf(privBlock),                  // private key block
  ]);

  const b64 = keyData.toString('base64').match(/.{1,70}/g).join('\n');
  return `-----BEGIN OPENSSH PRIVATE KEY-----\n${b64}\n-----END OPENSSH PRIVATE KEY-----\n`;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate an Ed25519 key pair, save both files to disk, and return the
 * public key string (safe to send to the renderer process).
 *
 * Uses Node.js built-in crypto — no system binaries or native modules required.
 *
 * @param {string} keyId  UUID — caller decides this before the key is generated
 * @returns {Promise<{ keyId: string, publicKey: string }>}
 */
async function generateKeyPair(keyId) {
  // Generate key material using Node.js crypto
  const { publicKey: pubDer, privateKey: privDer } = generateKeyPairSync('ed25519', {
    publicKeyEncoding:  { type: 'spki',   format: 'der' },
    privateKeyEncoding: { type: 'pkcs8',  format: 'der' },
  });

  // Extract raw 32-byte keys from the fixed DER structures:
  //   SPKI  DER for Ed25519: 12-byte ASN.1 header + 32 bytes public key
  //   PKCS8 DER for Ed25519: 16-byte ASN.1 header + 32 bytes seed
  const rawPub = pubDer.slice(12);
  const seed   = privDer.slice(16);

  const openSSHPriv = _toOpenSSHPrivateKey(seed, rawPub);
  const openSSHPub  = _toOpenSSHPublicKey(rawPub);

  // mode 0o600: owner read/write only — private key must not be world-readable
  fs.writeFileSync(_privateKeyPath(keyId), openSSHPriv, { encoding: 'utf8', mode: 0o600 });
  fs.writeFileSync(_publicKeyPath(keyId),  openSSHPub + '\n', 'utf8');

  return { keyId, publicKey: openSSHPub };
}

/**
 * Read the public key from disk (safe to send to renderer).
 * @param {string} keyId
 * @returns {string|null}
 */
function getPublicKey(keyId) {
  const p = _publicKeyPath(keyId);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8').trim();
}

/**
 * Return the path to the private key (for use by ssh2 — stays in main process).
 * Never send this path or content to the renderer.
 * @param {string} keyId
 * @returns {string|null}
 */
function getPrivateKeyPath(keyId) {
  const p = _privateKeyPath(keyId);
  return fs.existsSync(p) ? p : null;
}

/**
 * Delete both key files. Called when a profile is deleted.
 * @param {string} keyId
 */
function deleteKeyPair(keyId) {
  const priv = _privateKeyPath(keyId);
  const pub = _publicKeyPath(keyId);
  if (fs.existsSync(priv)) fs.unlinkSync(priv);
  if (fs.existsSync(pub)) fs.unlinkSync(pub);
}

module.exports = {
  generateKeyPair,
  getPublicKey,
  getPrivateKeyPath,
  deleteKeyPair,
};
