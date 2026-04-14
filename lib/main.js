/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main/adapters/local-app.js"
/*!****************************************!*\
  !*** ./src/main/adapters/local-app.js ***!
  \****************************************/
(module, __unused_webpack_exports, __webpack_require__) {

/**
 * LocalAppAdapter
 *
 * Single point of contact for all Local for WordPress API calls.
 * Local's internal API changes between versions. By routing every call
 * through this file, we guarantee that version-change blast radius is
 * limited to one place.
 *
 * If a Local API method is unavailable or changed, update ONLY this file.
 * All other services and IPC handlers call this adapter exclusively —
 * never @getflywheel/local directly.
 */

let _context = null;

/**
 * Called once from main/index.js with the context object Local provides.
 * @param {object} context
 */
function init(context) {
  _context = context;
}

/**
 * Safely attempt to get Local's service container.
 * Returns null if unavailable (older/newer Local version).
 */
function _getServiceContainer() {
  try {
    // Local >= 6 exposes this from the main-process module
    const {
      getServiceContainer
    } = __webpack_require__(/*! @getflywheel/local/main */ "@getflywheel/local/main");
    return getServiceContainer();
  } catch {
    return null;
  }
}

/**
 * Get all Local sites as a plain serialisable array.
 * Returns [] if unavailable.
 * @returns {Array<object>}
 */
function getAllSites() {
  try {
    const container = _getServiceContainer();
    if (!container) return [];
    const siteData = container.cradle.siteData;
    // getSites() returns an object keyed by siteId in most versions
    const sites = siteData.getSites ? siteData.getSites() : {};
    return Object.values(sites).map(_normaliseSite);
  } catch (err) {
    console.error('[SiteGroundDeploy] LocalAdapter.getAllSites failed:', err.message);
    return [];
  }
}

/**
 * Get a single Local site by ID.
 * Returns null if not found.
 * @param {string} siteId
 * @returns {object|null}
 */
function getSite(siteId) {
  try {
    const container = _getServiceContainer();
    if (!container) return null;
    const siteData = container.cradle.siteData;
    const site = siteData.getSiteById ? siteData.getSiteById(siteId) : siteData.getSites()[siteId];
    return site ? _normaliseSite(site) : null;
  } catch (err) {
    console.error('[SiteGroundDeploy] LocalAdapter.getSite failed:', err.message);
    return null;
  }
}

/**
 * Get the local-domain URL for a site (e.g. "http://mysite.local")
 * @param {string} siteId
 * @returns {string|null}
 */
function getSiteLocalDomain(siteId) {
  const site = getSite(siteId);
  if (!site) return null;
  return site.domain ? `http://${site.domain}` : null;
}

/**
 * Get the filesystem path to the site's wp-content folder.
 * @param {string} siteId
 * @returns {string|null}
 */
function getSiteWpContentPath(siteId) {
  const site = getSite(siteId);
  if (!site) return null;
  // Local stores the root path in site.path; wp-content is always at app/public
  return site.path ? (__webpack_require__(/*! path */ "path").join)(site.path, 'app', 'public', 'wp-content') : null;
}

/**
 * Normalise a Local site object to a stable, serialisable shape.
 * Guards against API changes in what fields are present.
 * @param {object} raw
 * @returns {object}
 */
function _normaliseSite(raw) {
  return {
    id: raw.id || raw.siteId || null,
    name: raw.name || 'Unknown Site',
    domain: raw.domain || raw.localDomain || null,
    path: raw.path || raw.sitePath || null,
    phpVersion: raw.phpVersion || null,
    mysqlVersion: raw.mysqlVersion || null
  };
}
module.exports = {
  init,
  getAllSites,
  getSite,
  getSiteLocalDomain,
  getSiteWpContentPath
};

/***/ },

/***/ "./src/main/index.js"
/*!***************************!*\
  !*** ./src/main/index.js ***!
  \***************************/
(module, __unused_webpack_exports, __webpack_require__) {

/**
 * Main process entry point.
 *
 * Local calls this with a `context` object that exposes:
 *   context.electron     – the Electron module
 *   context.app          – the Local app instance (version-specific, use adapter)
 *
 * All IPC handlers are registered here. Real logic lives in service modules.
 */

const {
  ipcMain
} = __webpack_require__(/*! electron */ "electron");
const localAdapter = __webpack_require__(/*! ./adapters/local-app */ "./src/main/adapters/local-app.js");
const profileStore = __webpack_require__(/*! ./services/profile-store */ "./src/main/services/profile-store.js");
const keyManager = __webpack_require__(/*! ./services/key-manager */ "./src/main/services/key-manager.js");
const sshService = __webpack_require__(/*! ./services/ssh-service */ "./src/main/services/ssh-service.js");
const deployService = __webpack_require__(/*! ./services/deploy-service */ "./src/main/services/deploy-service.js");
const logger = __webpack_require__(/*! ./services/logger */ "./src/main/services/logger.js");
module.exports = function (context) {
  // Give the local adapter a reference to Local's context so it can
  // safely call Local APIs through the isolation layer.
  localAdapter.init(context);

  // ─── Profiles ──────────────────────────────────────────────────────────────

  ipcMain.handle('sgd:profiles:list', async () => {
    return profileStore.listProfiles();
  });
  ipcMain.handle('sgd:profiles:get', async (_e, id) => {
    return profileStore.getProfile(id);
  });
  ipcMain.handle('sgd:profiles:save', async (_e, profile) => {
    return profileStore.saveProfile(profile);
  });
  ipcMain.handle('sgd:profiles:delete', async (_e, id) => {
    return profileStore.deleteProfile(id);
  });

  // ─── Keys ──────────────────────────────────────────────────────────────────

  ipcMain.handle('sgd:keys:generate', async (_e, keyId) => {
    return keyManager.generateKeyPair(keyId);
  });
  ipcMain.handle('sgd:keys:getPublic', async (_e, keyId) => {
    return keyManager.getPublicKey(keyId);
  });
  ipcMain.handle('sgd:keys:delete', async (_e, keyId) => {
    return keyManager.deleteKeyPair(keyId);
  });

  // ─── SSH ───────────────────────────────────────────────────────────────────

  ipcMain.handle('sgd:ssh:test', async (_e, profileId) => {
    const profile = profileStore.getProfile(profileId);
    if (!profile) return {
      success: false,
      error: 'Profile not found.'
    };
    return sshService.testConnection(profile);
  });

  // Test SSH without a saved profile — accepts raw profile data from the wizard
  ipcMain.handle('sgd:ssh:test:direct', async (_e, profileData) => {
    return sshService.testConnection(profileData);
  });

  // ─── Deploy ────────────────────────────────────────────────────────────────

  // Deploy events are streamed back via IPC push (sgd:log:entry),
  // not as a single resolved value.
  ipcMain.handle('sgd:deploy:code', async (event, profileId, options) => {
    const profile = profileStore.getProfile(profileId);
    return deployService.runCodeDeploy(profile, options, entry => {
      event.sender.send('sgd:log:entry', entry);
    });
  });
  ipcMain.handle('sgd:deploy:full', async (event, profileId, options) => {
    const profile = profileStore.getProfile(profileId);
    return deployService.runFullDeploy(profile, options, entry => {
      event.sender.send('sgd:log:entry', entry);
    });
  });

  // ─── Logs ──────────────────────────────────────────────────────────────────

  ipcMain.handle('sgd:logs:list', async (_e, profileId) => {
    return logger.getLog(profileId);
  });
  ipcMain.handle('sgd:logs:clear', async (_e, profileId) => {
    return logger.clearLog(profileId);
  });

  // ─── Local site info (via adapter) ─────────────────────────────────────────

  ipcMain.handle('sgd:local:sites', async () => {
    return localAdapter.getAllSites();
  });
  ipcMain.handle('sgd:local:site', async (_e, siteId) => {
    return localAdapter.getSite(siteId);
  });
};

/***/ },

/***/ "./src/main/services/deploy-service.js"
/*!*********************************************!*\
  !*** ./src/main/services/deploy-service.js ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

/**
 * DeployService
 *
 * Orchestrates code-only and full (code + database) deployment flows.
 * Delegates to the archiver, SFTP transfer, and SSH command execution.
 *
 * Both public methods accept an `onLog` callback that receives structured
 * log entries in real time, which are forwarded over IPC to the renderer.
 *
 * Log entry shape:
 * {
 *   level: 'info' | 'success' | 'warning' | 'error',
 *   message: string,
 *   timestamp: string  // ISO
 * }
 */

const logger = __webpack_require__(/*! ./logger */ "./src/main/services/logger.js");

/**
 * @param {string} level
 * @param {string} message
 * @param {function} onLog
 */
function _emit(level, message, onLog) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString()
  };
  onLog && onLog(entry);
  logger.appendEntry(null, entry); // profileId threaded in callers below
}

/**
 * Run a code-only deployment:
 *   1. Archive selected local paths
 *   2. SFTP upload archive to remote
 *   3. SSH extract archive on remote
 *   4. SSH fix permissions
 *   5. SSH clean up remote archive
 *
 * @param {object}   profile   - saved deployment profile
 * @param {object}   options   - { sourcePaths: string[] }
 * @param {function} onLog     - real-time log callback
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function runCodeDeploy(profile, options, onLog) {
  // TODO: implement full code deploy flow
  _emit('info', `Starting code deploy to ${profile.sshHost}…`, onLog);
  _emit('info', 'Archive step (not yet implemented)', onLog);
  _emit('info', 'Upload step (not yet implemented)', onLog);
  _emit('warning', 'Code deploy stub — no files were transferred.', onLog);
  logger.markDeployRun(profile.id);
  return {
    success: false,
    error: 'Code deploy not yet implemented'
  };
}

/**
 * Run a full deployment (code + database):
 *   1. All steps of runCodeDeploy
 *   2. Export local database via WP-CLI / mysqldump
 *   3. SFTP upload SQL file
 *   4. SSH: create remote database backup (ALWAYS before import)
 *   5. SSH: import new database
 *   6. SSH: wp search-replace local domain → production domain
 *   7. SSH: wp rewrite flush + wp cache flush
 *
 * @param {object}   profile
 * @param {object}   options   - { sourcePaths: string[], confirmed: boolean }
 * @param {function} onLog
 * @returns {Promise<{ success: boolean, backupPath?: string, error?: string }>}
 */
async function runFullDeploy(profile, options, onLog) {
  if (!options.confirmed) {
    return {
      success: false,
      error: 'Deploy cancelled — confirmation not provided.'
    };
  }

  // TODO: implement full deploy flow
  _emit('info', `Starting FULL deploy to ${profile.sshHost}…`, onLog);
  _emit('info', 'Code deploy phase (stub)', onLog);
  _emit('info', 'Database export phase (stub)', onLog);
  _emit('info', 'Remote backup phase (stub)', onLog);
  _emit('info', 'Database import phase (stub)', onLog);
  _emit('info', 'Search-replace phase (stub)', onLog);
  _emit('warning', 'Full deploy stub — nothing was changed on the remote server.', onLog);
  logger.markDeployRun(profile.id);
  return {
    success: false,
    error: 'Full deploy not yet implemented'
  };
}
module.exports = {
  runCodeDeploy,
  runFullDeploy
};

/***/ },

/***/ "./src/main/services/key-manager.js"
/*!******************************************!*\
  !*** ./src/main/services/key-manager.js ***!
  \******************************************/
(module, __unused_webpack_exports, __webpack_require__) {

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

const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const {
  app
} = __webpack_require__(/*! electron */ "electron");
const {
  generateKeyPairSync
} = __webpack_require__(/*! crypto */ "crypto");

// ─── Key directory ─────────────────────────────────────────────────────────────

function _keysDir() {
  const dir = path.join(app.getPath('userData'), 'siteground-deploy', 'keys');
  fs.mkdirSync(dir, {
    recursive: true
  });
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
  const checkVal = Math.floor(Math.random() * 0xFFFFFFFE) + 1 >>> 0;
  const check = _u32(checkVal);

  // Inner private-key block (before padding)
  let privBlock = Buffer.concat([check, check, _sshBuf(keyType), _sshBuf(rawPub), _sshBuf(privKeyFull), _sshBuf('siteground-deploy') // comment
  ]);

  // Pad to 8-byte boundary using bytes 0x01, 0x02, 0x03, ...
  let padByte = 1;
  while (privBlock.length % 8 !== 0) {
    privBlock = Buffer.concat([privBlock, Buffer.from([padByte++ & 0xFF])]);
  }

  // Outer structure
  const keyData = Buffer.concat([Buffer.from('openssh-key-v1\x00'),
  // magic string
  _sshBuf('none'),
  // ciphername
  _sshBuf('none'),
  // kdfname
  _sshBuf(Buffer.alloc(0)),
  // kdfoptions (empty)
  _u32(1),
  // number of keys
  _sshBuf(pubWire),
  // public key
  _sshBuf(privBlock) // private key block
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
  const {
    publicKey: pubDer,
    privateKey: privDer
  } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: {
      type: 'spki',
      format: 'der'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der'
    }
  });

  // Extract raw 32-byte keys from the fixed DER structures:
  //   SPKI  DER for Ed25519: 12-byte ASN.1 header + 32 bytes public key
  //   PKCS8 DER for Ed25519: 16-byte ASN.1 header + 32 bytes seed
  const rawPub = pubDer.slice(12);
  const seed = privDer.slice(16);
  const openSSHPriv = _toOpenSSHPrivateKey(seed, rawPub);
  const openSSHPub = _toOpenSSHPublicKey(rawPub);

  // mode 0o600: owner read/write only — private key must not be world-readable
  fs.writeFileSync(_privateKeyPath(keyId), openSSHPriv, {
    encoding: 'utf8',
    mode: 0o600
  });
  fs.writeFileSync(_publicKeyPath(keyId), openSSHPub + '\n', 'utf8');
  return {
    keyId,
    publicKey: openSSHPub
  };
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
  deleteKeyPair
};

/***/ },

/***/ "./src/main/services/logger.js"
/*!*************************************!*\
  !*** ./src/main/services/logger.js ***!
  \*************************************/
(module, __unused_webpack_exports, __webpack_require__) {

/**
 * Logger
 *
 * Append-only in-memory + disk log for deploy activity.
 * Log entries are stored per-profile in electron-store.
 * The renderer receives entries in real time via IPC push (sgd:log:entry),
 * and can also request the full log history via sgd:logs:list.
 *
 * Entry shape:
 * {
 *   level: 'info' | 'success' | 'warning' | 'error',
 *   message: string,
 *   timestamp: string  // ISO
 * }
 */

const Store = __webpack_require__(/*! electron-store */ "electron-store");
const store = new Store({
  name: 'siteground-deploy-logs',
  defaults: {
    logs: {}
  }
});
const MAX_ENTRIES_PER_PROFILE = 500;

/**
 * Append a log entry for a given profile.
 * If profileId is null the entry is written to a global "session" log.
 *
 * @param {string|null} profileId
 * @param {{ level: string, message: string, timestamp: string }} entry
 */
function appendEntry(profileId, entry) {
  const key = profileId || '__global__';
  const logs = store.get(`logs.${key}`, []);
  logs.push(entry);
  // Trim to keep the store from growing unbounded
  const trimmed = logs.slice(-MAX_ENTRIES_PER_PROFILE);
  store.set(`logs.${key}`, trimmed);
}

/**
 * Get all stored log entries for a profile.
 * @param {string|null} profileId
 * @returns {Array<object>}
 */
function getLog(profileId) {
  const key = profileId || '__global__';
  return store.get(`logs.${key}`, []);
}

/**
 * Clear the log for a profile.
 * @param {string|null} profileId
 */
function clearLog(profileId) {
  const key = profileId || '__global__';
  store.set(`logs.${key}`, []);
}

/**
 * Record that a deploy run occurred. Appends a separator/header entry.
 * @param {string} profileId
 */
function markDeployRun(profileId) {
  appendEntry(profileId, {
    level: 'info',
    message: '─── Deploy run started ───',
    timestamp: new Date().toISOString()
  });
}
module.exports = {
  appendEntry,
  getLog,
  clearLog,
  markDeployRun
};

/***/ },

/***/ "./src/main/services/profile-store.js"
/*!********************************************!*\
  !*** ./src/main/services/profile-store.js ***!
  \********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

/**
 * ProfileStore
 *
 * Persists deployment profiles to disk using electron-store.
 * Storage location: %APPDATA%\Local\siteground-deploy\profiles.json (Windows)
 *
 * A profile shape:
 * {
 *   id: string,           // uuid v4
 *   name: string,         // friendly name e.g. "BIOHM Production"
 *   sshHost: string,
 *   sshPort: number,      // SiteGround default: 18765
 *   sshUser: string,
 *   remoteWebRoot: string,
 *   productionDomain: string,
 *   localSiteId: string|null,
 *   keyId: string,        // references a key pair in key-manager
 *   createdAt: string,    // ISO
 *   lastDeployedAt: string|null
 * }
 */

const Store = __webpack_require__(/*! electron-store */ "electron-store");
const {
  v4: uuidv4
} = __webpack_require__(/*! uuid */ "uuid");
const store = new Store({
  name: 'siteground-deploy-profiles',
  defaults: {
    profiles: []
  }
});

/**
 * @returns {Array<object>}
 */
function listProfiles() {
  return store.get('profiles', []);
}

/**
 * @param {string} id
 * @returns {object|null}
 */
function getProfile(id) {
  const profiles = listProfiles();
  return profiles.find(p => p.id === id) || null;
}

/**
 * Create or update a profile. If profile.id exists it is updated,
 * otherwise a new record is inserted.
 * @param {object} profile
 * @returns {object} saved profile with guaranteed id
 */
function saveProfile(profile) {
  const profiles = listProfiles();
  if (profile.id) {
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = {
        ...profiles[idx],
        ...profile
      };
      store.set('profiles', profiles);
      return profiles[idx];
    }
  }
  const newProfile = {
    sshPort: 18765,
    localSiteId: null,
    lastDeployedAt: null,
    ...profile,
    id: profile.id || uuidv4(),
    createdAt: new Date().toISOString()
  };
  profiles.push(newProfile);
  store.set('profiles', profiles);
  return newProfile;
}

/**
 * Mark a profile as just deployed (updates lastDeployedAt).
 * @param {string} id
 */
function markDeployed(id) {
  const profiles = listProfiles();
  const idx = profiles.findIndex(p => p.id === id);
  if (idx >= 0) {
    profiles[idx].lastDeployedAt = new Date().toISOString();
    store.set('profiles', profiles);
  }
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function deleteProfile(id) {
  const profiles = listProfiles();
  const next = profiles.filter(p => p.id !== id);
  store.set('profiles', next);
  return next.length < profiles.length;
}
module.exports = {
  listProfiles,
  getProfile,
  saveProfile,
  markDeployed,
  deleteProfile
};

/***/ },

/***/ "./src/main/services/ssh-service.js"
/*!******************************************!*\
  !*** ./src/main/services/ssh-service.js ***!
  \******************************************/
(module, __unused_webpack_exports, __webpack_require__) {

/**
 * SSHService
 *
 * Handles SSH connection testing and remote command execution.
 * Uses the ssh2 library directly for maximum control over streams and errors.
 * All connections use key-based auth — passwords are never stored or used.
 *
 * SiteGround-specific defaults:
 *   port: 18765  (not standard 22)
 *   keepaliveInterval: 10000
 *   readyTimeout: 20000
 *
 * Private keys are read from disk by keyManager in OpenSSH PEM format
 * (-----BEGIN OPENSSH PRIVATE KEY-----). Do not send key content to the renderer.
 */

const {
  Client
} = __webpack_require__(/*! ssh2 */ "ssh2");
const fs = __webpack_require__(/*! fs */ "fs");
const keyManager = __webpack_require__(/*! ./key-manager */ "./src/main/services/key-manager.js");

/**
 * Build an ssh2 ConnectConfig from a profile.
 * Reads the private key from disk — key content never touches the renderer.
 *
 * @param {object} profile
 * @returns {object} ssh2 ConnectConfig
 * @throws {Error} if the private key file is missing
 */
function _buildConnectConfig(profile) {
  const privateKeyPath = keyManager.getPrivateKeyPath(profile.keyId);
  if (!privateKeyPath) {
    throw new Error(`No private key found for keyId ${profile.keyId}. ` + 'The key may have been deleted or the profile was created on another machine.');
  }
  return {
    host: profile.sshHost,
    port: Number(profile.sshPort) || 18765,
    username: profile.sshUser,
    privateKey: fs.readFileSync(privateKeyPath, 'utf8'),
    // OpenSSH PEM
    keepaliveInterval: 10000,
    readyTimeout: 20000,
    // Disable host key checking for now.
    // TODO: implement TOFU (trust-on-first-use) host key pinning per profile.
    hostVerifier: () => true
  };
}

/**
 * Test an SSH connection. Returns { success: true } on success or
 * { success: false, error: string } on any failure.
 * Never throws — all errors are returned in the result object.
 *
 * @param {object} profile  Profile or raw wizard data containing sshHost, sshPort, sshUser, keyId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
function testConnection(profile) {
  return new Promise(resolve => {
    if (!profile || !profile.sshHost || !profile.sshUser) {
      return resolve({
        success: false,
        error: 'SSH host and username are required.'
      });
    }
    let config;
    try {
      config = _buildConnectConfig(profile);
    } catch (err) {
      return resolve({
        success: false,
        error: err.message
      });
    }
    const conn = new Client();
    let settled = false;
    function settle(result) {
      if (!settled) {
        settled = true;
        try {
          conn.destroy();
        } catch (_) {/* already closed */}
        resolve(result);
      }
    }
    conn.on('ready', () => {
      settle({
        success: true
      });
    }).on('error', err => {
      settle({
        success: false,
        error: _friendlyError(err)
      });
    }).connect(config);
  });
}

/**
 * Execute a single command on the remote server.
 * Streams stdout/stderr to the onData callback as string chunks.
 *
 * @param {object}   profile
 * @param {string}   command
 * @param {function} onData   Called with each stdout/stderr string chunk
 * @returns {Promise<{ exitCode: number }>}
 */
function execCommand(profile, command, onData) {
  return new Promise((resolve, reject) => {
    let config;
    try {
      config = _buildConnectConfig(profile);
    } catch (err) {
      return reject(err);
    }
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        stream.on('close', exitCode => {
          conn.end();
          resolve({
            exitCode: exitCode || 0
          });
        }).on('data', data => onData && onData(data.toString())).stderr.on('data', data => onData && onData(data.toString()));
      });
    }).on('error', err => reject(err)).connect(config);
  });
}

/**
 * Open a persistent SSH connection and return a handle for multiple sequential
 * exec calls (used by the deploy engine to avoid reconnecting between steps).
 * Caller MUST call handle.end() when finished.
 *
 * @param {object} profile
 * @returns {Promise<{ exec: Function, end: Function }>}
 */
function openConnection(profile) {
  return new Promise((resolve, reject) => {
    let config;
    try {
      config = _buildConnectConfig(profile);
    } catch (err) {
      return reject(err);
    }
    const conn = new Client();
    conn.on('ready', () => {
      resolve({
        exec: (command, onData) => new Promise((res, rej) => conn.exec(command, (err, stream) => {
          if (err) return rej(err);
          stream.on('close', code => res({
            exitCode: code || 0
          })).on('data', d => onData && onData(d.toString())).stderr.on('data', d => onData && onData(d.toString()));
        })),
        end: () => new Promise(res => {
          conn.end();
          res();
        })
      });
    }).on('error', err => reject(err)).connect(config);
  });
}

// ─── Error message helpers ─────────────────────────────────────────────────────

/**
 * Convert an ssh2 error into a user-friendly message.
 */
function _friendlyError(err) {
  const msg = err.message || String(err);
  const code = err.code || '';
  if (code === 'ECONNREFUSED') return `Connection refused at ${err.address || 'host'}:${err.port || ''}. Check the host and port.`;
  if (code === 'ETIMEDOUT') return 'Connection timed out. The server may be unreachable or the port may be blocked by a firewall.';
  if (code === 'ENOTFOUND') return 'Host not found. Check that the hostname is correct.';
  if (/auth/i.test(msg)) return 'Authentication failed. Make sure you copied the public key into SiteGround and saved it.';
  if (/handshake/i.test(msg)) return 'SSH handshake failed. The server may not support Ed25519 keys.';
  return msg;
}
module.exports = {
  testConnection,
  execCommand,
  openConnection
};

/***/ },

/***/ "@getflywheel/local/main"
/*!******************************************!*\
  !*** external "@getflywheel/local/main" ***!
  \******************************************/
(module) {

"use strict";
module.exports = require("@getflywheel/local/main");

/***/ },

/***/ "electron"
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
(module) {

"use strict";
module.exports = require("electron");

/***/ },

/***/ "electron-store"
/*!*********************************!*\
  !*** external "electron-store" ***!
  \*********************************/
(module) {

"use strict";
module.exports = require("electron-store");

/***/ },

/***/ "ssh2"
/*!***********************!*\
  !*** external "ssh2" ***!
  \***********************/
(module) {

"use strict";
module.exports = require("ssh2");

/***/ },

/***/ "uuid"
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
(module) {

"use strict";
module.exports = require("uuid");

/***/ },

/***/ "crypto"
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
(module) {

"use strict";
module.exports = require("crypto");

/***/ },

/***/ "fs"
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
(module) {

"use strict";
module.exports = require("fs");

/***/ },

/***/ "path"
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
(module) {

"use strict";
module.exports = require("path");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main/index.js");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.js.map