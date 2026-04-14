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
 * Get the filesystem path to the WordPress installation root (contains wp-config.php).
 * This is one level above wp-content: {site.path}/app/public
 * @param {string} siteId
 * @returns {string|null}
 */
function getSiteWpPath(siteId) {
  const site = getSite(siteId);
  if (!site) return null;
  return site.path ? (__webpack_require__(/*! path */ "path").join)(site.path, 'app', 'public') : null;
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
  getSiteWpPath,
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
  // All handlers return { success, data } or { success, error, errors? }
  // so the renderer can handle results uniformly without try/catch.

  ipcMain.handle('sgd:profiles:list', async () => {
    return profileStore.getProfiles();
  });
  ipcMain.handle('sgd:profiles:get', async (_e, id) => {
    return profileStore.getProfileById(id);
  });
  ipcMain.handle('sgd:profiles:create', async (_e, data) => {
    return profileStore.createProfile(data);
  });
  ipcMain.handle('sgd:profiles:update', async (_e, id, patch) => {
    return profileStore.updateProfile(id, patch);
  });

  // Legacy save channel — used by the wizard's Step7_SaveProfile.
  // Routes to create or update based on whether an id is present.
  ipcMain.handle('sgd:profiles:save', async (_e, profile) => {
    if (profile.id) {
      const {
        id,
        ...patch
      } = profile;
      return profileStore.updateProfile(id, patch);
    }
    return profileStore.createProfile(profile);
  });
  ipcMain.handle('sgd:profiles:delete', async (_e, id) => {
    return profileStore.deleteProfile(id);
  });
  ipcMain.handle('sgd:profiles:validate', async (_e, data, isUpdate) => {
    return profileStore.validateProfileData(data, isUpdate);
  });

  // ─── Keys ──────────────────────────────────────────────────────────────────

  ipcMain.handle('sgd:keys:generate', async (_e, keyId) => {
    return keyManager.generateSshKeyPairForProfile(keyId);
  });
  ipcMain.handle('sgd:keys:getPublic', async (_e, keyId) => {
    return keyManager.getPublicKeyContents(keyId);
  });
  ipcMain.handle('sgd:keys:exists', async (_e, keyId) => {
    return keyManager.keyPairExists(keyId);
  });
  ipcMain.handle('sgd:keys:delete', async (_e, keyId) => {
    return keyManager.deleteKeyPair(keyId);
  });

  // ─── SSH ───────────────────────────────────────────────────────────────────

  ipcMain.handle('sgd:ssh:test', async (_e, profileId) => {
    const profileResult = profileStore.getProfileById(profileId);
    if (!profileResult.success) return profileResult;
    const profile = profileResult.data;
    const runId = `conn-${Date.now().toString(36)}`;
    logger.startRun(profileId, 'connection_test', runId, {
      host: `${profile.sshHost}:${profile.sshPort || 18765}`,
      user: profile.sshUser
    });
    const result = await sshService.testConnection(profile);
    logger.appendEntry(profileId, {
      level: result.success ? 'success' : 'error',
      runId,
      actionType: 'connection_test',
      message: result.success ? `Connected to ${result.data.host} as ${result.data.user}` : `Connection failed: ${result.error}`,
      metadata: result.success ? {
        host: result.data.host,
        output: result.data.output
      } : {
        error: result.error
      }
    });
    logger.finishRun(profileId, runId, result.success ? 'success' : 'failure', result.success ? {
      host: result.data.host
    } : {
      error: result.error
    });
    return result;
  });

  // Test SSH without a saved profile — accepts raw profile data from the wizard.
  // Only sshHost, sshPort, sshUser, and keyId are used; all other fields are ignored.
  ipcMain.handle('sgd:ssh:test:direct', async (_e, profileData) => {
    if (!profileData || !profileData.sshHost || !profileData.sshUser || !profileData.keyId) {
      return {
        success: false,
        error: 'SSH host, username, and key ID are required.'
      };
    }
    const safe = {
      sshHost: profileData.sshHost,
      sshPort: profileData.sshPort,
      sshUser: profileData.sshUser,
      keyId: profileData.keyId
    };
    return sshService.testConnection(safe);
  });

  // ─── Deploy ────────────────────────────────────────────────────────────────

  // Preflight: returns local/remote path info for the deploy config screen.
  ipcMain.handle('sgd:deploy:preflight', async (_e, profileId, targets) => {
    return deployService.getPreflightInfo(profileId, targets);
  });

  // Deploy events are streamed back via IPC push (sgd:log:entry),
  // not as a single resolved value.
  ipcMain.handle('sgd:deploy:code', async (event, profileId, options) => {
    const profileResult = profileStore.getProfileById(profileId);
    if (!profileResult.success) return profileResult;
    return deployService.runCodeDeploy(profileResult.data, options, entry => {
      event.sender.send('sgd:log:entry', entry);
    });
  });
  ipcMain.handle('sgd:deploy:full', async (event, profileId, options) => {
    const profileResult = profileStore.getProfileById(profileId);
    if (!profileResult.success) return profileResult;
    return deployService.runFullDeploy(profileResult.data, options, entry => {
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
  ipcMain.handle('sgd:logs:runs', async (_e, profileId) => {
    return logger.getRuns(profileId);
  });
  ipcMain.handle('sgd:logs:run-entries', async (_e, profileId, runId) => {
    return logger.getRunEntries(profileId, runId);
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

/***/ "./src/main/services/archiver-service.js"
/*!***********************************************!*\
  !*** ./src/main/services/archiver-service.js ***!
  \***********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/**
 * ArchiverService
 *
 * Creates zip archives of local WordPress directories for upload during
 * a code-only deploy. Uses the `archiver` npm package (streaming write,
 * no temp file for the whole tree — entries are streamed into the zip).
 *
 * Archive structure:
 *   Each sourceItem maps a local directory → a top-level name inside the zip.
 *   Example:
 *     { localPath: '/path/to/wp-content/themes',  archiveName: 'themes'  }
 *     { localPath: '/path/to/wp-content/plugins', archiveName: 'plugins' }
 *
 *   Produces a zip like:
 *     themes/                  ← archiveName becomes the top-level dir
 *       twentytwentythree/
 *         ... files ...
 *     plugins/
 *       akismet/
 *         ... files ...
 *
 *   On the remote server, `unzip -o -d /tmp/sgd-xxx /tmp/sgd-xxx/deploy.zip`
 *   will reconstruct themes/, plugins/ etc. directly under /tmp/sgd-xxx/.
 *   Then each dir can be rsync'd / cp'd to the remote web root in isolation.
 */



const archiverLib = __webpack_require__(/*! archiver */ "archiver");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const os = __webpack_require__(/*! os */ "os");

// ─── Result helpers ────────────────────────────────────────────────────────────
function _ok(data) {
  return {
    success: true,
    data
  };
}
function _err(error) {
  return {
    success: false,
    error
  };
}

// ─── Archive creation ──────────────────────────────────────────────────────────

/**
 * Create a zip archive from an array of source directory descriptors.
 *
 * @param {Array<{ localPath: string, archiveName: string }>} sourceItems
 * @param {string}   destPath     Absolute path for the output .zip file.
 * @param {function} [onProgress] Called with { bytes, total } during write.
 * @returns {Promise<
 *   { success: true,  data: { destPath: string, sizeBytes: number } } |
 *   { success: false, error: string }
 * >}
 */
function createArchive(sourceItems, destPath, onProgress) {
  return new Promise(resolve => {
    // Ensure the destination directory exists
    try {
      fs.mkdirSync(path.dirname(destPath), {
        recursive: true
      });
    } catch (err) {
      return resolve(_err(`Cannot create temp directory: ${err.message}`));
    }
    let output;
    try {
      output = fs.createWriteStream(destPath);
    } catch (err) {
      return resolve(_err(`Cannot open archive file for writing: ${err.message}`));
    }
    const archive = archiverLib('zip', {
      zlib: {
        level: 6
      }
    });
    let settled = false;
    function settle(result) {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    }
    output.on('close', () => {
      settle(_ok({
        destPath,
        sizeBytes: archive.pointer()
      }));
    });
    archive.on('error', err => {
      settle(_err(`Archive creation failed: ${err.message}`));
    });
    archive.on('warning', err => {
      // ENOENT is non-fatal (file was deleted between scan and zip)
      if (err.code !== 'ENOENT') {
        settle(_err(`Archive warning treated as error: ${err.message}`));
      }
    });
    if (onProgress) {
      archive.on('progress', progress => {
        onProgress({
          bytes: progress.fs.processedBytes,
          total: progress.fs.totalBytes
        });
      });
    }
    archive.pipe(output);
    for (const item of sourceItems) {
      if (!fs.existsSync(item.localPath)) {
        // Caller already validated — silently skip anything that disappeared
        continue;
      }
      // false = use archiveName as the directory name inside the zip
      archive.directory(item.localPath, item.archiveName);
    }
    archive.finalize();
  });
}

// ─── Temp path helpers ─────────────────────────────────────────────────────────

/**
 * Build the local temp archive path for a deploy run.
 * All deploy artefacts for a run live under os.tmpdir()/sgd-deploy/{runId}/.
 *
 * @param   {string} runId  UUID for this deploy run.
 * @returns {string} Absolute path to deploy.zip
 */
function getTempArchivePath(runId) {
  return path.join(os.tmpdir(), 'sgd-deploy', runId, 'deploy.zip');
}

/**
 * Delete the local temp directory for a deploy run.
 * Called in the finally block of deploy-service — safe to call even if the
 * directory was never created.
 *
 * @param {string} runId
 */
function cleanupLocal(runId) {
  try {
    const dir = path.join(os.tmpdir(), 'sgd-deploy', runId);
    fs.rmSync(dir, {
      recursive: true,
      force: true
    });
  } catch (_) {
    // Silently swallow — local temp cleanup failure should never abort a deploy
  }
}
module.exports = {
  createArchive,
  getTempArchivePath,
  cleanupLocal
};

/***/ },

/***/ "./src/main/services/database-service.js"
/*!***********************************************!*\
  !*** ./src/main/services/database-service.js ***!
  \***********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/**
 * DatabaseService
 *
 * Handles all database operations for the full deploy pipeline.
 * Called exclusively by DeployService — never exposed to the renderer.
 *
 * ── Local export strategy ────────────────────────────────────────────────────
 *   1. Try `wp db export <path> --path=<wpRoot>` (WP-CLI in system PATH)
 *   2. Fall back to parsing wp-config.php + running `mysqldump`
 *   Both CLI tools need to be available in PATH. Error messages tell the user
 *   what to install if neither is found.
 *
 * ── Remote operation strategy ────────────────────────────────────────────────
 *   All remote operations run via the SSH exec handle from ssh-service.
 *   WP-CLI is tried first on every operation; falls back to raw mysql/mysqldump
 *   by reading credentials from the remote wp-config.php via `php -r`.
 *
 * ── Safety guarantees ────────────────────────────────────────────────────────
 *   - Remote DB backup is ALWAYS created before any import; if the backup
 *     itself fails, the import is aborted and an error is returned.
 *   - No passwords are logged; they are only passed as CLI args.
 *   - Search-replace and cache-flush failures are non-fatal (logged as warnings)
 *     because the files were already synced successfully.
 */



const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const os = __webpack_require__(/*! os */ "os");
const {
  exec
} = __webpack_require__(/*! child_process */ "child_process");
const localAdapter = __webpack_require__(/*! ../adapters/local-app */ "./src/main/adapters/local-app.js");
const sftpSvc = __webpack_require__(/*! ./sftp-service */ "./src/main/services/sftp-service.js");

// ─── Result helpers ────────────────────────────────────────────────────────────
function _ok(data) {
  return {
    success: true,
    data
  };
}
function _err(error) {
  return {
    success: false,
    error
  };
}
function _emit(level, message, onLog) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString()
  };
  onLog && onLog(entry);
}

/**
 * Single-quote a remote path for safe inclusion in a POSIX shell command.
 * Handles embedded single-quotes by breaking out of the quoting, escaping, re-entering.
 */
function _q(p) {
  return "'" + String(p).replace(/'/g, "'\\''") + "'";
}

/**
 * Double-quote a local path for use in shell commands on both Windows and Unix.
 * Strips literal double-quotes from paths (paths should never contain them).
 */
function _lq(p) {
  return '"' + String(p).replace(/"/g, '') + '"';
}

// ─── Temp-path helpers ─────────────────────────────────────────────────────────

/** Temp directory used for this run's SQL export (shares runId with archiver). */
function getTempSqlDir(runId) {
  return path.join(os.tmpdir(), 'sgd-deploy', runId);
}

/** Absolute local path for the exported SQL file for a given runId. */
function getTempSqlPath(runId) {
  return path.join(getTempSqlDir(runId), 'database.sql');
}

/** Delete the temp SQL dir — always called in deploy-service's finally block. */
function cleanupLocalSql(runId) {
  const dir = getTempSqlDir(runId);
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, {
        recursive: true,
        force: true
      });
    } catch (_) {}
  }
}

// ─── Subprocess runner ─────────────────────────────────────────────────────────

/**
 * Run a shell command and collect its output.
 * Uses child_process.exec so shell features (PATH lookup, .bat/.cmd on Windows)
 * work transparently on all platforms.
 *
 * @param {string} cmd      Shell command string (already-quoted args)
 * @param {object} [opts]   { cwd?: string }
 * @returns {Promise<{ exitCode: number, stdout: string, stderr: string }>}
 */
function _run(cmd, opts = {}) {
  return new Promise(resolve => {
    exec(cmd, {
      cwd: opts.cwd || process.cwd(),
      maxBuffer: 100 * 1024 * 1024,
      // 100 MB
      env: process.env
    }, (err, stdout, stderr) => {
      const exitCode = err ? err.code ?? -1 : 0;
      resolve({
        exitCode,
        stdout: stdout || '',
        stderr: stderr || ''
      });
    });
  });
}

// ─── wp-config.php parser ──────────────────────────────────────────────────────

/**
 * Parse a local wp-config.php file to extract DB credentials.
 * Returns null if the file cannot be read or expected values are absent.
 *
 * Handles both `define('DB_NAME', 'value')` and `define( "DB_NAME", "value" )` forms.
 *
 * @param   {string} wpRoot   Absolute path to the WordPress installation root.
 * @returns {{ dbName, dbUser, dbPassword, dbHost, dbPort } | null}
 */
function _parseWpConfig(wpRoot) {
  const configPath = path.join(wpRoot, 'wp-config.php');
  let content;
  try {
    content = fs.readFileSync(configPath, 'utf8');
  } catch {
    return null;
  }
  function _extract(key) {
    const re = new RegExp(`define\\s*\\(\\s*['"]${key}['"]\\s*,\\s*['"]([^'"]*)['"\\s]*\\)`, 'i');
    const m = content.match(re);
    return m ? m[1] : null;
  }
  const dbName = _extract('DB_NAME');
  const dbUser = _extract('DB_USER');
  const dbPassword = _extract('DB_PASSWORD') || '';
  const rawHost = _extract('DB_HOST') || 'localhost';
  if (!dbName || !dbUser) return null;

  // DB_HOST in Local often includes a port: "127.0.0.1:10011"
  const colonIdx = rawHost.lastIndexOf(':');
  const dbHost = colonIdx !== -1 ? rawHost.slice(0, colonIdx) : rawHost;
  const dbPort = colonIdx !== -1 ? rawHost.slice(colonIdx + 1) : '3306';
  return {
    dbName,
    dbUser,
    dbPassword,
    dbHost,
    dbPort
  };
}

// ─── Local DB export ───────────────────────────────────────────────────────────

/**
 * Try exporting the local DB using WP-CLI.
 * @private
 */
async function _wpCliExport(wpRoot, sqlPath, onLog) {
  _emit('info', '  Trying WP-CLI export…', onLog);
  fs.mkdirSync(path.dirname(sqlPath), {
    recursive: true
  });
  const res = await _run(`wp db export ${_lq(sqlPath)} --path=${_lq(wpRoot)} --allow-root --quiet`, {
    cwd: wpRoot
  });
  if (res.exitCode !== 0) {
    return _err((res.stderr || res.stdout).trim() || `wp exited ${res.exitCode}`);
  }
  if (!fs.existsSync(sqlPath) || fs.statSync(sqlPath).size === 0) {
    return _err('wp db export succeeded but output file is empty or missing');
  }
  return _ok({});
}

/**
 * Fallback: export local DB using mysqldump + credentials parsed from wp-config.php.
 * @private
 */
async function _mysqldumpExport(wpRoot, sqlPath, onLog) {
  _emit('info', '  Trying mysqldump export…', onLog);
  const creds = _parseWpConfig(wpRoot);
  if (!creds) {
    return _err('Cannot parse wp-config.php to obtain database credentials');
  }
  fs.mkdirSync(path.dirname(sqlPath), {
    recursive: true
  });

  // NOTE: password is passed via CLI arg — acceptable on a local dev machine
  // where there is no shared process list to inspect.
  const pwArg = creds.dbPassword ? `-p"${creds.dbPassword.replace(/"/g, '')}"` : '';
  const cmd = ['mysqldump', `-h"${creds.dbHost}"`, `-P${creds.dbPort}`, `-u"${creds.dbUser}"`, pwArg, '--single-transaction', '--routines', '--triggers', '--no-tablespaces', `--result-file=${_lq(sqlPath)}`, `"${creds.dbName}"`].filter(Boolean).join(' ');
  const res = await _run(cmd, {
    cwd: wpRoot
  });
  if (res.exitCode !== 0) {
    const summary = (res.stderr || res.stdout).trim().split('\n').slice(-3).join(' | ');
    return _err(`mysqldump failed (exit ${res.exitCode}): ${summary}`);
  }
  if (!fs.existsSync(sqlPath) || fs.statSync(sqlPath).size === 0) {
    return _err('mysqldump ran but output file is empty or missing');
  }
  return _ok({});
}

/**
 * Export the local WordPress database to a temp SQL file.
 *
 * Tries WP-CLI first, then falls back to mysqldump. Returns a clear error
 * if both tools are absent from PATH, telling the user what to install.
 *
 * @param {string}   siteId   Local site ID (from profile.localSiteId)
 * @param {string}   sqlPath  Absolute file path for the .sql output
 * @param {function} onLog
 * @returns {Promise<
 *   { success: true,  data: { sqlPath: string, sizeBytes: number } } |
 *   { success: false, error: string }
 * >}
 */
async function exportLocalDatabase(siteId, sqlPath, onLog) {
  const wpRoot = localAdapter.getSiteWpPath(siteId);
  if (!wpRoot || !fs.existsSync(wpRoot)) {
    return _err(`WordPress root not found for site "${siteId}".\n` + `Expected path: ${wpRoot || '(unknown)'}\n` + 'Make sure the Local site is present and has not been moved.');
  }
  _emit('info', `Exporting local database from ${wpRoot}…`, onLog);
  let result = await _wpCliExport(wpRoot, sqlPath, onLog);
  if (!result.success) {
    _emit('warning', `  WP-CLI: ${result.error}`, onLog);
    _emit('info', '  Falling back to mysqldump…', onLog);
    result = await _mysqldumpExport(wpRoot, sqlPath, onLog);
  }
  if (!result.success) {
    return _err('Local database export failed. Neither WP-CLI nor mysqldump succeeded.\n\n' + `mysqldump error: ${result.error}\n\n` + 'To resolve: ensure WP-CLI (wp) or mysqldump is available in your system PATH.\n' + 'WP-CLI: https://wp-cli.org  |  mysqldump is bundled with MySQL/MariaDB clients.');
  }
  const sizeBytes = fs.statSync(sqlPath).size;
  _emit('success', `Local database exported: ${(sizeBytes / 1024).toFixed(1)} KB`, onLog);
  return _ok({
    sqlPath,
    sizeBytes
  });
}

// ─── Upload SQL file ───────────────────────────────────────────────────────────

/**
 * Upload the exported SQL file to the remote server via SFTP.
 *
 * @param {object}   profile
 * @param {string}   localSqlPath
 * @param {string}   remoteSqlPath
 * @param {function} onLog
 * @returns {Promise<{ success: true, data: { remoteSqlPath } } | { success: false, error }>}
 */
async function uploadSqlFile(profile, localSqlPath, remoteSqlPath, onLog) {
  if (!fs.existsSync(localSqlPath)) {
    return _err(`SQL export file not found: ${localSqlPath}\n` + 'The database export step may have failed silently. ' + 'Review the export log entries above for details.');
  }
  const sizeBytes = fs.statSync(localSqlPath).size;
  _emit('info', `Uploading SQL file (${(sizeBytes / 1024).toFixed(1)} KB)…`, onLog);
  let lastPct = -1;
  const res = await sftpSvc.uploadFile(profile, localSqlPath, remoteSqlPath, ({
    percent
  }) => {
    const band = Math.floor(percent / 25) * 25;
    if (band > lastPct) {
      lastPct = band;
      _emit('info', `  SQL upload: ${percent}%`, onLog);
    }
  });
  if (!res.success) return res;
  _emit('success', 'SQL file uploaded', onLog);
  return _ok({
    remoteSqlPath
  });
}

// ─── Remote credential reader ────────────────────────────────────────────────────

/**
 * Read database credentials from a remote wp-config.php file via a PHP one-liner.
 * Returns null on failure so the caller can decide how to handle it.
 *
 * @param {object} sshConn
 * @param {string} webRoot  Absolute remote path (trailing slash removed)
 * @returns {Promise<{ DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } | null>}
 */
async function _readRemoteWpCreds(sshConn, webRoot) {
  let out = '';
  await sshConn.exec(
  // Minimal PHP one-liner: extracts define() values and emits JSON.
  // Quoted in double-quote shell context; backslashes escape $ signs.
  `php -r "` + `\\$c=@file_get_contents(${_q(webRoot + '/wp-config.php')});` + `preg_match_all('/define\\s*\\([\\s\'\"]*([A-Z_]+)[\\s\'\"]*,[\\s\'\"]*([^\'\"]*)[\\s\'\"]*\\)/i',''+\\$c,\\$m);` + `echo json_encode(array_combine(\\$m[1],\\$m[2]));` + `" 2>&1`, chunk => {
    out += chunk;
  });
  let creds = null;
  try {
    creds = JSON.parse(out.trim());
  } catch (_) {}
  if (!creds || !creds.DB_NAME || !creds.DB_USER) return null;
  return creds;
}

// ─── Remote DB backup ──────────────────────────────────────────────────────────

/**
 * Create a remote database backup BEFORE any import.
 * This call is NOT skippable — if backup fails, the import must be aborted.
 *
 * Tries WP-CLI first. Falls back to reading DB credentials from the remote
 * wp-config.php via a one-liner PHP command, then running mysqldump.
 *
 * @param {object} sshConn       Live SSH connection ({exec, end})
 * @param {string} remoteWebRoot e.g. '/home/user/public_html'
 * @param {string} backupPath    Absolute remote path for the .sql backup
 * @param {function} onLog
 * @returns {Promise<
 *   { success: true,  data: { backupPath: string } } |
 *   { success: false, error: string }
 * >}
 */
async function backupRemoteDatabase(sshConn, remoteWebRoot, backupPath, onLog) {
  const webRoot = remoteWebRoot.replace(/\/$/, '');
  const backupDir = backupPath.substring(0, backupPath.lastIndexOf('/'));
  _emit('info', `Creating remote DB backup → ${backupPath}`, onLog);

  // Ensure backup directory exists
  await sshConn.exec(`mkdir -p ${_q(backupDir)} 2>&1`);

  // ── Attempt 1: WP-CLI ────────────────────────────────────────────────────
  let out = '';
  let res = await sshConn.exec(`wp db export ${_q(backupPath)} --path=${_q(webRoot)} --allow-root 2>&1`, chunk => {
    out += chunk;
  });
  if (res.exitCode === 0) {
    // Verify the file has content
    let sizeOut = '';
    await sshConn.exec(`stat -c %s ${_q(backupPath)} 2>/dev/null || echo 0`, c => {
      sizeOut += c;
    });
    if (parseInt(sizeOut.trim(), 10) > 0) {
      _emit('success', `Remote DB backup created via WP-CLI: ${backupPath}`, onLog);
      return _ok({
        backupPath
      });
    }
  }
  const wpCliErr = out.trim().split('\n').slice(-2).join(' ');
  _emit('warning', `  WP-CLI backup failed: ${wpCliErr || `exit ${res.exitCode}`}`, onLog);
  _emit('info', '  Falling back to remote mysqldump…', onLog);

  // ── Attempt 2: Read wp-config.php via PHP, then mysqldump ────────────────
  const creds = await _readRemoteWpCreds(sshConn, webRoot);
  if (!creds) {
    return _err('Remote DB backup failed.\n' + `WP-CLI error: ${wpCliErr}\n` + 'mysqldump fallback also failed: could not read remote wp-config.php credentials.\n' + 'Import aborted to protect the production database.');
  }

  // Use lastIndexOf so an IPv6 address like [::1]:3306 is handled correctly.
  const rawHost = creds.DB_HOST || 'localhost';
  const colonIdx = rawHost.lastIndexOf(':');
  const host = colonIdx !== -1 ? rawHost.slice(0, colonIdx) : rawHost;
  const port = colonIdx !== -1 ? rawHost.slice(colonIdx + 1) : '3306';

  // Pass the password via the MYSQL_PWD environment variable instead of a CLI
  // flag to keep it out of the remote process list (visible in `ps aux`).
  const pwEnv = creds.DB_PASSWORD ? `MYSQL_PWD=${_q(creds.DB_PASSWORD)} ` : '';
  out = '';
  res = await sshConn.exec(`${pwEnv}mysqldump -h ${_q(host)} -P ${port} -u ${_q(creds.DB_USER)} ` + `--single-transaction --routines --triggers --no-tablespaces ` + `${_q(creds.DB_NAME)} > ${_q(backupPath)} 2>&1`, chunk => {
    out += chunk;
  });
  if (res.exitCode !== 0) {
    return _err(`Remote mysqldump backup failed (exit ${res.exitCode}): ${out.trim()}\n` + 'Import aborted to protect the production database.');
  }
  _emit('success', `Remote DB backup created via mysqldump: ${backupPath}`, onLog);
  return _ok({
    backupPath
  });
}

// ─── Remote DB import ──────────────────────────────────────────────────────────

/**
 * Import the uploaded SQL file into the remote WordPress database.
 *
 * Tries WP-CLI first. Falls back to the mysql CLI using credentials parsed
 * from the remote wp-config.php.
 *
 * @param {object} sshConn
 * @param {string} remoteWebRoot
 * @param {string} remoteSqlPath   Absolute remote path to the uploaded .sql file
 * @param {function} onLog
 * @returns {Promise<
 *   { success: true,  data: { method: 'wp-cli'|'mysql-cli' } } |
 *   { success: false, error: string }
 * >}
 */
async function importRemoteDatabase(sshConn, remoteWebRoot, remoteSqlPath, onLog) {
  const webRoot = remoteWebRoot.replace(/\/$/, '');
  _emit('info', 'Importing database on remote server…', onLog);

  // ── Attempt 1: WP-CLI ────────────────────────────────────────────────────
  let out = '';
  let res = await sshConn.exec(`wp db import ${_q(remoteSqlPath)} --path=${_q(webRoot)} --allow-root 2>&1`, chunk => {
    out += chunk;
  });
  if (res.exitCode === 0) {
    _emit('success', 'Database imported via WP-CLI', onLog);
    return _ok({
      method: 'wp-cli'
    });
  }
  const wpCliErr = out.trim().split('\n').slice(-2).join(' ');
  _emit('warning', `  WP-CLI import failed: ${wpCliErr || `exit ${res.exitCode}`}`, onLog);
  _emit('info', '  Falling back to mysql CLI import…', onLog);

  // ── Attempt 2: mysql CLI with credentials from remote wp-config.php ──────
  const creds = await _readRemoteWpCreds(sshConn, webRoot);
  if (!creds) {
    return _err(`Database import failed: WP-CLI unavailable and could not read remote wp-config.php.\n` + `WP-CLI error: ${wpCliErr}`);
  }

  // Use lastIndexOf so an IPv6 address like [::1]:3306 is handled correctly.
  const rawHost = creds.DB_HOST || 'localhost';
  const colonIdx = rawHost.lastIndexOf(':');
  const host = colonIdx !== -1 ? rawHost.slice(0, colonIdx) : rawHost;
  const port = colonIdx !== -1 ? rawHost.slice(colonIdx + 1) : '3306';

  // Pass the password via MYSQL_PWD env var so it is not visible in `ps aux`.
  const pwEnv = creds.DB_PASSWORD ? `MYSQL_PWD=${_q(creds.DB_PASSWORD)} ` : '';
  out = '';
  res = await sshConn.exec(`${pwEnv}mysql -h ${_q(host)} -P ${port} -u ${_q(creds.DB_USER)} ` + `${_q(creds.DB_NAME)} < ${_q(remoteSqlPath)} 2>&1`, chunk => {
    out += chunk;
  });
  if (res.exitCode !== 0) {
    return _err(`Database import via mysql CLI failed (exit ${res.exitCode}): ${out.trim()}`);
  }
  _emit('success', 'Database imported via mysql CLI', onLog);
  return _ok({
    method: 'mysql-cli'
  });
}

// ─── Search-replace ────────────────────────────────────────────────────────────

/**
 * Run `wp search-replace` to swap the local dev domain for the production domain
 * in all database tables. Non-exact URLs (serialised PHP, JSON, etc.) are handled
 * by `--precise`.
 *
 * Also upgrades http:// → https:// for the production domain if it uses HTTPS.
 *
 * @param {object} sshConn
 * @param {string} remoteWebRoot
 * @param {string} localDomain      e.g. "http://mysite.local"
 * @param {string} productionDomain e.g. "https://example.com"
 * @param {function} onLog
 * @returns {Promise<{ success: true, data } | { success: false, error }>}
 */
async function runSearchReplace(sshConn, remoteWebRoot, localDomain, productionDomain, onLog) {
  const webRoot = remoteWebRoot.replace(/\/$/, '');
  _emit('info', `  ${localDomain}  →  ${productionDomain}`, onLog);
  let out = '';
  const res = await sshConn.exec(`wp search-replace ${_q(localDomain)} ${_q(productionDomain)} ` + `--all-tables --precise --recurse-objects ` + `--path=${_q(webRoot)} --allow-root 2>&1`, chunk => {
    out += chunk;
  });
  const summary = out.trim().split('\n').filter(Boolean).slice(-3).join(' | ');
  if (res.exitCode !== 0) {
    return _err(`wp search-replace failed (exit ${res.exitCode}): ${summary}`);
  }
  _emit('success', `search-replace: ${summary}`, onLog);

  // Also upgrade bare http:// variant of production domain → https:// if applicable
  if (productionDomain.startsWith('https://')) {
    const httpProd = productionDomain.replace(/^https:\/\//, 'http://');
    let out2 = '';
    await sshConn.exec(`wp search-replace ${_q(httpProd)} ${_q(productionDomain)} ` + `--all-tables --precise --recurse-objects ` + `--path=${_q(webRoot)} --allow-root 2>&1`, chunk => {
      out2 += chunk;
    });
    // Non-fatal; log only if something changed
    const changed = out2.match(/\d+ replacements/);
    if (changed) _emit('info', `  http→https upgrade: ${changed[0]}`, onLog);
  }
  return _ok({
    summary
  });
}

// ─── Remote cache flush ────────────────────────────────────────────────────────

/**
 * Flush the remote WordPress object cache after deploy.
 * THIS IS NON-FATAL — cache failures are logged as warnings, not errors.
 * A working deploy with a stale cache pointer is far better than a failed deploy.
 *
 * @param {object} sshConn
 * @param {string} remoteWebRoot
 * @param {function} onLog
 * @returns {Promise<{ success: true, data: {} }>}  Always resolves success.
 */
async function clearRemoteCache(sshConn, remoteWebRoot, onLog) {
  const webRoot = remoteWebRoot.replace(/\/$/, '');
  _emit('info', 'Flushing remote WordPress cache…', onLog);
  let out = '';
  const res = await sshConn.exec(`wp cache flush --path=${_q(webRoot)} --allow-root 2>&1`, chunk => {
    out += chunk;
  });
  if (res.exitCode !== 0) {
    _emit('warning', `Cache flush returned exit ${res.exitCode}: ${out.trim()}`, onLog);
  } else {
    _emit('success', 'Remote WordPress cache flushed', onLog);
  }
  return _ok({});
}

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  // Temp-path helpers
  getTempSqlPath,
  getTempSqlDir,
  cleanupLocalSql,
  // Local operations
  exportLocalDatabase,
  // Remote operations
  uploadSqlFile,
  backupRemoteDatabase,
  importRemoteDatabase,
  runSearchReplace,
  clearRemoteCache
};

/***/ },

/***/ "./src/main/services/deploy-service.js"
/*!*********************************************!*\
  !*** ./src/main/services/deploy-service.js ***!
  \*********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/**
 * DeployService
 *
 * Orchestrates the code-only deployment pipeline for SiteGround Deploy.
 *
 * ── Code-only deploy flow ───────────────────────────────────────────────────
 *   1.  Validate inputs (profile has localSiteId, source dirs exist locally)
 *   2.  Build source items from options.targets
 *   3.  Create a zip archive of selected directories (archiver-service)
 *   4.  Upload the archive via SFTP to a temp dir on the remote server
 *   5.  SSH: unzip the archive into the same temp dir
 *   6.  SSH: rsync (fallback: rm+cp) each target dir to the remote web root
 *   7.  SSH: delete the remote temp dir
 *   8.  Local: delete the local temp archive
 *   9.  Mark the profile's lastDeployedAt timestamp
 *
 * ── Remote temp dir layout ──────────────────────────────────────────────────
 *   /tmp/sgd-deploy-{runId}/
 *     deploy.zip           ← uploaded archive
 *     themes/              ← extracted by unzip
 *     plugins/
 *     ...
 *
 * ── Remote sync command ─────────────────────────────────────────────────────
 *   Prefers rsync (available on all SiteGround plans).
 *   Falls back to rm -rf + cp -rp for servers that don't have rsync.
 *
 *   rsync -az --delete --exclude='.git' \
 *     '/tmp/sgd-deploy-xxx/themes/' '/remote/web/root/wp-content/themes/'
 *
 * ── Log entry shape ─────────────────────────────────────────────────────────
 *   { level: 'info'|'success'|'warning'|'error', message: string, timestamp: ISO }
 *   Callbacks are called in real time and entries are also persisted to disk.
 */



const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const {
  v4: uuidv4
} = __webpack_require__(/*! uuid */ "uuid");
const localAdapter = __webpack_require__(/*! ../adapters/local-app */ "./src/main/adapters/local-app.js");
const archiverSvc = __webpack_require__(/*! ./archiver-service */ "./src/main/services/archiver-service.js");
const sftpSvc = __webpack_require__(/*! ./sftp-service */ "./src/main/services/sftp-service.js");
const sshService = __webpack_require__(/*! ./ssh-service */ "./src/main/services/ssh-service.js");
const dbSvc = __webpack_require__(/*! ./database-service */ "./src/main/services/database-service.js");
const profileStore = __webpack_require__(/*! ./profile-store */ "./src/main/services/profile-store.js");
const logger = __webpack_require__(/*! ./logger */ "./src/main/services/logger.js");

// ─── Supported deploy targets ──────────────────────────────────────────────────
// key   = what the user / UI passes in options.targets[]
// value = subdir name under wp-content (local and remote)
const KNOWN_TARGETS = {
  themes: 'themes',
  plugins: 'plugins',
  'mu-plugins': 'mu-plugins',
  uploads: 'uploads'
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _ok(data) {
  return {
    success: true,
    data
  };
}
function _err(error) {
  return {
    success: false,
    error
  };
}
function _emit(level, message, onLog, profileId, extra) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...extra
  };
  onLog && onLog(entry);
  logger.appendEntry(profileId || null, entry);
}

/** Human-readable byte size string. */
function _fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Quote a remote path for safe inclusion in a shell command.
 * Wraps in single quotes and escapes embedded single quotes.
 */
function _q(p) {
  return "'" + String(p).replace(/'/g, "'\\''") + "'";
}

// ─── Preflight ────────────────────────────────────────────────────────────────

/**
 * Return metadata about a planned deployment without actually running it.
 * The renderer calls this to populate the deploy configuration screen.
 *
 * @param {string}   profileId
 * @param {string[]} targets   e.g. ['themes', 'plugins']
 * @returns {{
 *   success: true,
 *   data: {
 *     profileId, profileName,
 *     localSiteId, localSiteName, wpContentPath, wpContentReachable,
 *     remoteWebRoot, sshHost,
 *     targets: Array<{ target, localPath, localExists, remotePath }>
 *   }
 * } | { success: false, error: string }}
 */
function getPreflightInfo(profileId, targets) {
  const profileResult = profileStore.getProfileById(profileId);
  if (!profileResult.success) return profileResult;
  const profile = profileResult.data;
  const siteId = profile.localSiteId || null;
  const site = siteId ? localAdapter.getSite(siteId) : null;
  const wpContentPath = siteId ? localAdapter.getSiteWpContentPath(siteId) : null;
  const requestedTargets = Array.isArray(targets) && targets.length > 0 ? targets : ['themes', 'plugins'];
  const resolvedTargets = requestedTargets.map(target => {
    const subDir = KNOWN_TARGETS[target] || target;
    const localPath = wpContentPath ? path.join(wpContentPath, subDir) : null;
    const remoteBase = (profile.remoteWebRoot || '').replace(/\/$/, '');
    const remotePath = remoteBase ? `${remoteBase}/wp-content/${subDir}` : null;
    return {
      target,
      localPath,
      localExists: localPath ? fs.existsSync(localPath) : false,
      remotePath
    };
  });
  return _ok({
    profileId,
    profileName: profile.name,
    localSiteId: siteId,
    localSiteName: site ? site.name : null,
    wpContentPath: wpContentPath,
    wpContentReachable: wpContentPath ? fs.existsSync(wpContentPath) : false,
    remoteWebRoot: profile.remoteWebRoot,
    productionDomain: profile.productionDomain || null,
    sshHost: `${profile.sshHost}:${profile.sshPort || 18765}`,
    targets: resolvedTargets
  });
}

// ─── Code-only deploy ─────────────────────────────────────────────────────────

/**
 * Run a code-only deployment.
 *
 * @param {object}   profile              Saved profile (raw object, not envelope).
 * @param {object}   options
 * @param {string[]} [options.targets]    Default: ['themes', 'plugins']
 * @param {function} onLog               Real-time log entry callback.
 * @returns {Promise<
 *   { success: true,  data: { runId: string, targets: string[] } } |
 *   { success: false, error: string }
 * >}
 */
async function runCodeDeploy(profile, options = {}, onLog) {
  const pid = profile.id || null;
  const runId = uuidv4();
  const emit = (lvl, msg, meta) => _emit(lvl, msg, onLog, pid, {
    runId,
    actionType: 'code_deploy',
    profileId: pid,
    ...(meta && {
      metadata: meta
    })
  });
  let sshConn = null;
  let _outcome = 'failure';
  let _outcomeMeta = null;
  logger.startRun(pid, 'code_deploy', runId, {
    host: `${profile.sshHost}:${profile.sshPort || 18765}`
  });
  try {
    emit('info', `── Code deploy started ── ${profile.name} ──`);
    emit('info', `Run ID: ${runId.slice(0, 8)}`);

    // ── 1. Resolve local wp-content ──────────────────────────────────────────
    if (!profile.localSiteId) {
      return _err('This profile is not linked to a Local site. ' + 'Profiles created before deploy support was added may need to be recreated, ' + 'or delete and re-run the setup wizard.');
    }
    const wpContentPath = localAdapter.getSiteWpContentPath(profile.localSiteId);
    if (!wpContentPath || !fs.existsSync(wpContentPath)) {
      return _err(`Local wp-content directory not found: ${wpContentPath || '(unknown)'}. ` + 'Make sure the Local site is present and the site path has not been moved.');
    }

    // Normalise and validate early — Windows users may type backslashes.
    const remoteWebRootVal = (profile.remoteWebRoot || '').replace(/\\/g, '/').replace(/\/$/, '');
    if (!remoteWebRootVal || !remoteWebRootVal.startsWith('/')) {
      return _err('Remote web root is not set or is not a valid absolute path. ' + 'It must start with "/" (e.g. /home/username/public_html). ' + 'Edit the profile and try again.');
    }
    emit('info', `Local wp-content: ${wpContentPath}`);
    emit('info', `Remote web root:  ${remoteWebRootVal}`);

    // ── 2. Build source items ────────────────────────────────────────────────
    const requestedTargets = Array.isArray(options.targets) && options.targets.length > 0 ? options.targets : ['themes', 'plugins'];
    const sourceItems = [];
    for (const target of requestedTargets) {
      const subDir = KNOWN_TARGETS[target] || target;
      const localPath = path.join(wpContentPath, subDir);
      if (!fs.existsSync(localPath)) {
        emit('warning', `Skipping "${target}" — not found at ${localPath}`);
        continue;
      }
      sourceItems.push({
        localPath,
        archiveName: subDir
      });
      emit('info', `  ✓ Queued: ${target}`);
    }
    if (sourceItems.length === 0) {
      return _err('None of the selected directories exist on disk. Nothing to deploy.\n' + 'Check that the Local site has wp-content/themes and wp-content/plugins.');
    }

    // ── 3. Create local archive ──────────────────────────────────────────────
    const localArchivePath = archiverSvc.getTempArchivePath(runId);
    emit('info', 'Creating archive…');
    let lastLoggedBucket = -1;
    const archiveResult = await archiverSvc.createArchive(sourceItems, localArchivePath, ({
      bytes,
      total
    }) => {
      // Log a progress line at 0%, 25%, 50%, 75%, 100% of known size
      if (total > 0) {
        const bucket = Math.floor(bytes / total * 4);
        if (bucket > lastLoggedBucket) {
          lastLoggedBucket = bucket;
          emit('info', `  Archiving… ${_fmt(bytes)} / ${_fmt(total)}`);
        }
      }
    });
    if (!archiveResult.success) {
      return _err(`Archive step failed: ${archiveResult.error}`);
    }
    if (!archiveResult.data.sizeBytes) {
      return _err('Archive was created but is empty — no files were added. ' + 'Check that the selected local wp-content directories exist and are not empty.');
    }
    emit('success', `Archive ready: ${_fmt(archiveResult.data.sizeBytes)}`);

    // ── 4. Upload archive via SFTP ───────────────────────────────────────────
    const remoteTempDir = `/tmp/sgd-deploy-${runId}`;
    const remoteArchivePath = `${remoteTempDir}/deploy.zip`;
    emit('info', `Uploading to ${profile.sshHost}…`);
    let lastPct = -1;
    const uploadResult = await sftpSvc.uploadFile(profile, localArchivePath, remoteArchivePath, ({
      bytes,
      total,
      percent
    }) => {
      const band = Math.floor(percent / 25) * 25; // 0, 25, 50, 75, 100
      if (band > lastPct) {
        lastPct = band;
        emit('info', `  Upload: ${percent}% (${_fmt(bytes)} / ${_fmt(total)})`);
      }
    });
    if (!uploadResult.success) {
      return _err(`Upload failed: ${uploadResult.error}`);
    }
    emit('success', `Archive uploaded to ${remoteArchivePath}`);

    // ── 5. Open SSH exec connection ──────────────────────────────────────────
    emit('info', 'Opening SSH connection…');
    const connResult = await sshService.openConnection(profile);
    if (!connResult.success) {
      return _err(`SSH connection failed: ${connResult.error}`);
    }
    sshConn = connResult.data;
    emit('success', 'SSH connection open');

    // ── 6. Extract archive on remote ─────────────────────────────────────────
    emit('info', 'Extracting archive on remote…');
    let unzipOut = '';
    const unzipResult = await sshConn.exec(`unzip -o -d ${_q(remoteTempDir)} ${_q(remoteArchivePath)} 2>&1`, chunk => {
      unzipOut += chunk;
    });
    if (unzipResult.exitCode !== 0) {
      const tail = unzipOut.trim().split('\n').slice(-5).join('\n');
      return _err(`Remote extraction failed (exit ${unzipResult.exitCode}):\n${tail || 'unzip returned a non-zero exit code'}`);
    }
    emit('success', 'Archive extracted');

    // ── 7. Sync each target dir to remote web root ───────────────────────────
    const remoteWebRoot = remoteWebRootVal;
    for (const item of sourceItems) {
      const target = item.archiveName;
      const srcDir = `${remoteTempDir}/${target}`;
      const destDir = `${remoteWebRoot}/wp-content/${target}`;
      emit('info', `Syncing ${target}…`);

      // rsync preferred (faster, delta, --delete removes stale files).
      // cp fallback for edge cases where rsync is not installed.
      const syncCmd = [`if command -v rsync > /dev/null 2>&1; then`, `  rsync -az --delete --exclude='.git' ${_q(srcDir + '/')} ${_q(destDir + '/')};`, `else`, `  rm -rf ${_q(destDir)} && cp -rp ${_q(srcDir)} ${_q(remoteWebRoot + '/wp-content/')};`, `fi`].join(' ');
      let syncOut = '';
      const syncResult = await sshConn.exec(syncCmd, chunk => {
        syncOut += chunk;
      });
      if (syncResult.exitCode !== 0) {
        return _err(`Sync failed for "${target}" (exit ${syncResult.exitCode}):\n${syncOut.trim()}`);
      }
      emit('success', `  ✓ ${target} → ${destDir}`);
    }

    // ── 8. Remote cleanup ────────────────────────────────────────────────────
    emit('info', 'Cleaning up remote temp files…');
    await sshConn.exec(`rm -rf ${_q(remoteTempDir)}`);
    emit('info', 'Remote cleanup complete');

    // ── 9. Mark deployed ─────────────────────────────────────────────────────
    if (pid) {
      profileStore.markDeployed(pid);
    }
    emit('success', `── Deploy complete! (${sourceItems.map(i => i.archiveName).join(', ')}) ──`);
    _outcome = 'success';
    _outcomeMeta = {
      targets: sourceItems.map(i => i.archiveName)
    };
    return _ok({
      runId,
      targets: sourceItems.map(i => i.archiveName)
    });
  } catch (err) {
    _outcomeMeta = {
      error: err.message
    };
    emit('error', `Unexpected error: ${err.message}`);
    return _err(`Unexpected error during deploy: ${err.message}`);
  } finally {
    logger.finishRun(pid, runId, _outcome, _outcomeMeta);
    // Always close the SSH connection
    if (sshConn) {
      try {
        await sshConn.end();
      } catch (_) {}
    }
    // Always delete the local temp archive
    archiverSvc.cleanupLocal(runId);
  }
}

// ─── Full deploy ─────────────────────────────────────────────────────────────

/**
 * Full deploy: exports the local database, syncs the ENTIRE wp-content
 * directory, then imports the database on the remote server.
 *
 * Pipeline:
 *   1.  Validate profile
 *   2.  Export local database → temp .sql  (WP-CLI → mysqldump fallback)
 *   3.  Archive all wp-content subdirectories
 *   4.  Upload archive via SFTP
 *   5.  Upload .sql file via SFTP
 *   6.  Open SSH exec connection
 *   7.  Remote DB backup  ← ABORTS if this fails
 *   8.  Extract archive on remote
 *   9.  Sync all wp-content subdirs (rsync → cp fallback)
 *   10. Import .sql on remote  (WP-CLI → mysql CLI fallback)
 *   11. Search-replace: local domain → production domain
 *   12. Flush remote WordPress cache
 *   13. Remote temp dir cleanup
 *   14. Mark profile lastDeployedAt
 *
 * Local cleanup (archive + SQL) always runs in the finally block.
 *
 * @param {object}   profile
 * @param {object}   options
 * @param {boolean}  options.confirmed  Must be true — required from UI.
 * @param {function} onLog
 */
async function runFullDeploy(profile, options = {}, onLog) {
  if (!options || !options.confirmed) {
    return _err('Deploy cancelled — confirmation not provided.');
  }
  const pid = profile.id || null;
  const runId = uuidv4();
  const emit = (lvl, msg, meta) => _emit(lvl, msg, onLog, pid, {
    runId,
    actionType: 'full_deploy',
    profileId: pid,
    ...(meta && {
      metadata: meta
    })
  });
  const dbLog = entry => {
    const rich = {
      ...entry,
      runId,
      actionType: 'full_deploy',
      profileId: pid
    };
    onLog && onLog(rich);
    logger.appendEntry(pid, rich);
  };
  let sshConn = null;
  let _outcome = 'failure';
  let _outcomeMeta = null;
  logger.startRun(pid, 'full_deploy', runId, {
    host: `${profile.sshHost}:${profile.sshPort || 18765}`,
    mode: 'full'
  });
  try {
    emit('info', `── Full deploy started ── ${profile.name} ──`);
    emit('info', `Run ID: ${runId.slice(0, 8)}`);
    emit('warning', 'Entire wp-content will be synced. Remote database will be backed up then overwritten.');

    // ── 1. Validate ──────────────────────────────────────────────────────────
    if (!profile.localSiteId) {
      return _err('Profile is not linked to a Local site. ' + 'Re-run the setup wizard to repair the link.');
    }
    const wpContentPath = localAdapter.getSiteWpContentPath(profile.localSiteId);
    if (!wpContentPath || !fs.existsSync(wpContentPath)) {
      return _err(`Local wp-content not found: ${wpContentPath || '(unknown)'}`);
    }

    // Normalise and validate early — Windows users may type backslashes.
    const remoteWebRootVal = (profile.remoteWebRoot || '').replace(/\\/g, '/').replace(/\/$/, '');
    if (!remoteWebRootVal || !remoteWebRootVal.startsWith('/')) {
      return _err('Remote web root is not set or is not a valid absolute path. ' + 'It must start with "/" (e.g. /home/username/public_html). ' + 'Edit the profile and try again.');
    }
    emit('info', `Source:      ${wpContentPath}`);
    emit('info', `Destination: ${remoteWebRootVal}/wp-content`);

    // ── 2. Discover wp-content subdirectories ─────────────────────────────────
    let wpDirs;
    try {
      wpDirs = fs.readdirSync(wpContentPath, {
        withFileTypes: true
      }).filter(e => e.isDirectory()).map(e => e.name);
    } catch (e) {
      return _err(`Cannot read local wp-content: ${e.message}`);
    }
    if (wpDirs.length === 0) {
      return _err('No subdirectories found in local wp-content. Nothing to deploy.');
    }
    const sourceItems = wpDirs.map(name => ({
      localPath: path.join(wpContentPath, name),
      archiveName: name
    }));
    emit('info', `Directories: ${wpDirs.join(', ')}`);

    // ── 3. Export local database ──────────────────────────────────────────────
    emit('info', '── Exporting local database…');
    const localSqlPath = dbSvc.getTempSqlPath(runId);
    const dbExportResult = await dbSvc.exportLocalDatabase(profile.localSiteId, localSqlPath, dbLog);
    if (!dbExportResult.success) {
      return _err(`Local database export failed:\n${dbExportResult.error}`);
    }

    // ── 4. Create local archive ───────────────────────────────────────────────
    const localArchivePath = archiverSvc.getTempArchivePath(runId);
    emit('info', '── Creating archive of entire wp-content…');
    let lastBucket = -1;
    const archiveResult = await archiverSvc.createArchive(sourceItems, localArchivePath, ({
      bytes,
      total
    }) => {
      if (total > 0) {
        const bucket = Math.floor(bytes / total * 4);
        if (bucket > lastBucket) {
          lastBucket = bucket;
          emit('info', `  Archiving… ${_fmt(bytes)} / ${_fmt(total)}`);
        }
      }
    });
    if (!archiveResult.success) return _err(`Archive failed: ${archiveResult.error}`);
    if (!archiveResult.data.sizeBytes) {
      return _err('Archive was created but is empty — no files were added. ' + 'Check that the local wp-content directory is not empty.');
    }
    emit('success', `Archive ready: ${_fmt(archiveResult.data.sizeBytes)}`);

    // ── 5. Upload archive via SFTP ────────────────────────────────────────────
    const remoteTempDir = `/tmp/sgd-deploy-${runId}`;
    const remoteArchivePath = `${remoteTempDir}/deploy.zip`;
    emit('info', '── Uploading files…');
    let lastPct = -1;
    const uploadResult = await sftpSvc.uploadFile(profile, localArchivePath, remoteArchivePath, ({
      bytes,
      total,
      percent
    }) => {
      const band = Math.floor(percent / 25) * 25;
      if (band > lastPct) {
        lastPct = band;
        emit('info', `  Archive upload: ${percent}% (${_fmt(bytes)} / ${_fmt(total)})`);
      }
    });
    if (!uploadResult.success) return _err(`Archive upload failed: ${uploadResult.error}`);
    emit('success', 'Archive uploaded');

    // ── 6. Upload SQL file via SFTP ───────────────────────────────────────────
    const remoteSqlPath = `${remoteTempDir}/database.sql`;
    const sqlUploadResult = await dbSvc.uploadSqlFile(profile, localSqlPath, remoteSqlPath, dbLog);
    if (!sqlUploadResult.success) return _err(`SQL upload failed: ${sqlUploadResult.error}`);

    // ── 7. Open SSH connection ────────────────────────────────────────────────
    emit('info', '── Opening SSH connection…');
    const connResult = await sshService.openConnection(profile);
    if (!connResult.success) return _err(`SSH connection failed: ${connResult.error}`);
    sshConn = connResult.data;
    emit('success', 'SSH connection open');
    const remoteWebRoot = remoteWebRootVal;

    // ── 8. Remote DB backup (MANDATORY — aborts on failure) ───────────────────
    emit('info', '── Creating remote database backup…');
    const backupsDir = `${remoteWebRoot}/sgd-db-backups`;
    const dbBackupPath = `${backupsDir}/db-${runId.slice(0, 8)}-${Date.now()}.sql`;
    const backupResult = await dbSvc.backupRemoteDatabase(sshConn, remoteWebRoot, dbBackupPath, dbLog);
    if (!backupResult.success) {
      return _err(`Remote database backup failed:\n${backupResult.error}`);
    }

    // ── 9. Extract archive on remote ──────────────────────────────────────────
    emit('info', '── Extracting archive on remote…');
    let unzipOut = '';
    const unzipResult = await sshConn.exec(`unzip -o -d ${_q(remoteTempDir)} ${_q(remoteArchivePath)} 2>&1`, chunk => {
      unzipOut += chunk;
    });
    if (unzipResult.exitCode !== 0) {
      const tail = unzipOut.trim().split('\n').slice(-5).join('\n');
      return _err(`Extraction failed (exit ${unzipResult.exitCode}):\n${tail}`);
    }
    emit('success', 'Archive extracted');

    // ── 10. Sync all wp-content subdirs ───────────────────────────────────────
    emit('info', '── Syncing wp-content directories…');
    for (const item of sourceItems) {
      const subDir = item.archiveName;
      const srcDir = `${remoteTempDir}/${subDir}`;
      const destDir = `${remoteWebRoot}/wp-content/${subDir}`;
      emit('info', `  Syncing ${subDir}…`);
      const syncCmd = [`if command -v rsync > /dev/null 2>&1; then`, `  rsync -az --delete --exclude='.git' ${_q(srcDir + '/')} ${_q(destDir + '/')};`, `else`, `  rm -rf ${_q(destDir)} && cp -rp ${_q(srcDir)} ${_q(remoteWebRoot + '/wp-content/')};`, `fi`].join(' ');
      let syncOut = '';
      const syncResult = await sshConn.exec(syncCmd, chunk => {
        syncOut += chunk;
      });
      if (syncResult.exitCode !== 0) {
        return _err(`Sync failed for "${subDir}" (exit ${syncResult.exitCode}):\n${syncOut.trim()}`);
      }
      emit('success', `    ✓ ${subDir}`);
    }

    // ── 11. Import database on remote ─────────────────────────────────────────
    emit('info', '── Importing database…');
    const importResult = await dbSvc.importRemoteDatabase(sshConn, remoteWebRoot, remoteSqlPath, dbLog);
    if (!importResult.success) {
      // Files synced OK but DB import failed — recoverable with manual steps.
      emit('error', `DB import failed: ${importResult.error}`);
      emit('warning', 'wp-content files were synced successfully.');
      emit('warning', `Remote DB backup is at: ${dbBackupPath}`);
      emit('info', `Manual import: wp db import ${remoteSqlPath} --path=${_q(remoteWebRoot)} --allow-root`);
    } else {
      // ── 12. Search-replace ────────────────────────────────────────────────
      const localDomain = localAdapter.getSiteLocalDomain(profile.localSiteId);
      const prodDomain = profile.productionDomain || null;
      if (prodDomain && localDomain && localDomain !== prodDomain) {
        emit('info', '── Running domain search-replace…');
        const srResult = await dbSvc.runSearchReplace(sshConn, remoteWebRoot, localDomain, prodDomain, dbLog);
        if (!srResult.success) {
          emit('warning', `search-replace failed (non-fatal): ${srResult.error}`);
          emit('info', `Run manually: wp search-replace '${localDomain}' '${prodDomain}' --all-tables --path=${_q(remoteWebRoot)}`);
        }
      } else if (!prodDomain) {
        emit('warning', 'No productionDomain set on profile — search-replace skipped.');
        emit('info', 'Set a production domain in the profile to enable automatic domain swap.');
      }

      // ── 13. Flush remote cache ─────────────────────────────────────────────
      await dbSvc.clearRemoteCache(sshConn, remoteWebRoot, dbLog);
    }

    // ── 14. Remote cleanup ────────────────────────────────────────────────────
    emit('info', 'Cleaning up remote temp files…');
    await sshConn.exec(`rm -rf ${_q(remoteTempDir)}`);
    emit('info', 'Remote cleanup complete.');
    emit('success', `Remote DB backup retained at: ${dbBackupPath}`);

    // ── 15. Mark deployed ─────────────────────────────────────────────────────
    if (pid) profileStore.markDeployed(pid);
    emit('success', `── Full deploy complete — ${sourceItems.length} directories synced ──`);
    _outcome = 'success';
    _outcomeMeta = {
      synced: sourceItems.map(i => i.archiveName),
      dbImported: importResult.success
    };
    return _ok({
      runId,
      mode: 'full',
      synced: sourceItems.map(i => i.archiveName),
      dbBackupPath,
      dbImported: importResult.success
    });
  } catch (err) {
    _outcomeMeta = {
      error: err.message
    };
    emit('error', `Unexpected error: ${err.message}`);
    return _err(`Unexpected error: ${err.message}`);
  } finally {
    logger.finishRun(pid, runId, _outcome, _outcomeMeta);
    if (sshConn) {
      try {
        await sshConn.end();
      } catch (_) {}
    }
    archiverSvc.cleanupLocal(runId);
    dbSvc.cleanupLocalSql(runId);
  }
}
module.exports = {
  getPreflightInfo,
  runCodeDeploy,
  runFullDeploy
};

/***/ },

/***/ "./src/main/services/key-manager.js"
/*!******************************************!*\
  !*** ./src/main/services/key-manager.js ***!
  \******************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
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



const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const {
  app
} = __webpack_require__(/*! electron */ "electron");
const {
  generateKeyPair: cryptoGenerateKeyPair
} = __webpack_require__(/*! crypto */ "crypto");

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
  fs.mkdirSync(dir, {
    recursive: true
  });
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
  const keyType = 'ssh-ed25519';
  const pubWire = Buffer.concat([_sshBuf(keyType), _sshBuf(rawPub)]);
  // OpenSSH private key = seed || pubkey = 64 bytes
  const privFull = Buffer.concat([seed, rawPub]);
  const checkVal = Math.floor(Math.random() * 0xFFFFFFFE) + 1 >>> 0;
  const check = _u32(checkVal);
  let privBlock = Buffer.concat([check, check, _sshBuf(keyType), _sshBuf(rawPub), _sshBuf(privFull), _sshBuf('siteground-deploy') // key comment
  ]);

  // Pad to 8-byte alignment with sequential bytes 0x01, 0x02, ...
  let padByte = 1;
  while (privBlock.length % 8 !== 0) {
    privBlock = Buffer.concat([privBlock, Buffer.from([padByte++ & 0xFF])]);
  }
  const keyData = Buffer.concat([Buffer.from('openssh-key-v1\x00'), _sshBuf('none'),
  // ciphername
  _sshBuf('none'),
  // kdfname
  _sshBuf(Buffer.alloc(0)),
  // kdfoptions (empty)
  _u32(1),
  // number of keys
  _sshBuf(pubWire), _sshBuf(privBlock)]);
  const b64 = keyData.toString('base64').match(/.{1,70}/g).join('\n');
  return `-----BEGIN OPENSSH PRIVATE KEY-----\n${b64}\n-----END OPENSSH PRIVATE KEY-----\n`;
}

// ─── Result helpers ───────────────────────────────────────────────────────────

function _ok(data) {
  return {
    success: true,
    data
  };
}
function _err(error) {
  return {
    success: false,
    error
  };
}

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
    return _err(`A key pair already exists for this profile. ` + 'Delete the existing key before generating a new one.');
  }
  let privPath = null;
  let pubPath = null;
  try {
    ensureKeyStorageDirectory();

    // Generate in DER format — async so we never block Local's main process thread.
    // Using sync was causing Local's MySQL service heartbeat to miss its window.
    const {
      publicKey: pubDer,
      privateKey: privDer
    } = await new Promise((resolve, reject) => {
      cryptoGenerateKeyPair('ed25519', {
        publicKeyEncoding: {
          type: 'spki',
          format: 'der'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'der'
        }
      }, (err, pub, priv) => {
        if (err) reject(err);else resolve({
          publicKey: pub,
          privateKey: priv
        });
      });
    });

    // SPKI  Ed25519 DER: 12-byte ASN.1 header + 32-byte public key
    // PKCS8 Ed25519 DER: 16-byte ASN.1 header + 32-byte private seed
    const rawPub = pubDer.slice(12);
    const seed = privDer.slice(16);
    const openSSHPriv = _toOpenSSHPrivateKey(seed, rawPub);
    const openSSHPub = _toOpenSSHPublicKey(rawPub);
    privPath = privateKeyPath(keyId);
    pubPath = publicKeyPath(keyId);

    // 0o600 = owner read/write only — required for ssh clients to accept the key
    fs.writeFileSync(privPath, openSSHPriv, {
      encoding: 'utf8',
      mode: 0o600
    });
    fs.writeFileSync(pubPath, openSSHPub + '\n', 'utf8');
    return _ok({
      keyId,
      publicKey: openSSHPub,
      privateKeyPath: privPath,
      publicKeyPath: pubPath
    });
  } catch (err) {
    // Atomically clean up partial files so the next call starts fresh
    try {
      if (privPath && fs.existsSync(privPath)) fs.unlinkSync(privPath);
    } catch (_) {}
    try {
      if (pubPath && fs.existsSync(pubPath)) fs.unlinkSync(pubPath);
    } catch (_) {}
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
    return _err(`Public key not found for this profile. ` + 'The key pair may not have been generated yet.');
  }
  const publicKey = fs.readFileSync(p, 'utf8').trim();
  return _ok({
    keyId,
    publicKey,
    publicKeyPath: p
  });
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
  const exists = Boolean(keyId) && fs.existsSync(privateKeyPath(keyId)) && fs.existsSync(publicKeyPath(keyId));
  return _ok({
    exists,
    keyId: keyId || ''
  });
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
    const pub = publicKeyPath(keyId);
    if (fs.existsSync(priv)) fs.unlinkSync(priv);
    if (fs.existsSync(pub)) fs.unlinkSync(pub);
    return _ok({
      deleted: true
    });
  } catch (err) {
    return _err(`Failed to delete key files: ${err.message}`);
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
  // ── Path accessors (used by profile-store to embed paths in profile records) ─
  privateKeyPath,
  publicKeyPath,
  // ── Legacy aliases ───────────────────────────────────────────────────────────
  generateKeyPair,
  getPublicKey
};

/***/ },

/***/ "./src/main/services/logger.js"
/*!*************************************!*\
  !*** ./src/main/services/logger.js ***!
  \*************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/**
 * Logger
 *
 * Structured append-only log for deploy activity.
 * Persisted to disk via electron-store.
 *
 * ── Entry shape ──────────────────────────────────────────────────────────────
 * {
 *   id:         string,        // 8-char hex, stable React key
 *   timestamp:  string,        // ISO 8601
 *   profileId:  string|null,
 *   runId:      string|null,   // links entry to a run summary
 *   actionType: string,        // 'code_deploy' | 'full_deploy' | 'connection_test' | 'system'
 *   level:      string,        // 'info' | 'success' | 'warning' | 'error'
 *   message:    string,
 *   metadata:   object|null,
 * }
 *
 * ── Run shape ─────────────────────────────────────────────────────────────────
 * {
 *   runId:      string,
 *   profileId:  string|null,
 *   actionType: string,
 *   startedAt:  string,        // ISO
 *   finishedAt: string|null,
 *   outcome:    'running' | 'success' | 'failure',
 *   durationMs: number|null,
 *   metadata:   object|null,   // { host, targets, mode, error, … }
 * }
 *
 * ── Storage layout (electron-store "siteground-deploy-logs") ─────────────────
 *   logs.<profileId>  Array<Entry>  — flat entry list, newest at end
 *   runs.<profileId>  Array<Run>    — run summaries, newest at end
 */



const {
  randomBytes
} = __webpack_require__(/*! crypto */ "crypto");
const Store = __webpack_require__(/*! electron-store */ "electron-store");
const store = new Store({
  name: 'siteground-deploy-logs',
  defaults: {
    logs: {},
    runs: {}
  }
});
const MAX_ENTRIES_PER_PROFILE = 1000;
const MAX_RUNS_PER_PROFILE = 100;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _shortId() {
  return randomBytes(4).toString('hex'); // 8-char hex
}
function _label(actionType) {
  const map = {
    code_deploy: 'Code deploy',
    full_deploy: 'Full deploy',
    connection_test: 'Connection test',
    system: 'System'
  };
  return map[actionType] || 'Run';
}
function _key(profileId) {
  return profileId || '__global__';
}
function _getLogs(profileId) {
  return store.get(`logs.${_key(profileId)}`, []);
}
function _setLogs(profileId, entries) {
  store.set(`logs.${_key(profileId)}`, entries);
}
function _getRuns(profileId) {
  return store.get(`runs.${_key(profileId)}`, []);
}
function _setRuns(profileId, runs) {
  store.set(`runs.${_key(profileId)}`, runs);
}

// ─── Entry API ────────────────────────────────────────────────────────────────

/**
 * Append a structured log entry. Fills in defaults for absent fields.
 *
 * @param {string|null} profileId
 * @param {object}      entry
 */
function appendEntry(profileId, entry) {
  const normalized = {
    id: _shortId(),
    timestamp: entry.timestamp || new Date().toISOString(),
    profileId: profileId || null,
    runId: entry.runId || null,
    actionType: entry.actionType || 'system',
    level: entry.level || 'info',
    message: entry.message || '',
    metadata: entry.metadata || null
  };
  const entries = _getLogs(profileId);
  entries.push(normalized);
  _setLogs(profileId, entries.slice(-MAX_ENTRIES_PER_PROFILE));
}

/**
 * Get all stored log entries for a profile, oldest-first.
 * @param {string|null} profileId
 * @returns {Array<object>}
 */
function getLog(profileId) {
  return _getLogs(profileId);
}

/**
 * Get all entries belonging to a specific run.
 * @param {string|null} profileId
 * @param {string}      runId
 * @returns {Array<object>}
 */
function getRunEntries(profileId, runId) {
  return _getLogs(profileId).filter(e => e.runId === runId);
}

/**
 * Clear all log entries and run records for a profile.
 * @param {string|null} profileId
 */
function clearLog(profileId) {
  _setLogs(profileId, []);
  _setRuns(profileId, []);
}

// ─── Run API ──────────────────────────────────────────────────────────────────

/**
 * Record that a new run has started.
 * Does NOT write a log entry — let the caller emit its own messages.
 *
 * @param {string|null} profileId
 * @param {string}      actionType  'code_deploy' | 'full_deploy' | 'connection_test'
 * @param {string}      runId
 * @param {object|null} metadata    e.g. { host, targets, mode }
 */
function startRun(profileId, actionType, runId, metadata) {
  const run = {
    runId,
    profileId: profileId || null,
    actionType: actionType || 'system',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    outcome: 'running',
    durationMs: null,
    metadata: metadata || null
  };
  const runs = _getRuns(profileId);
  runs.push(run);
  _setRuns(profileId, runs.slice(-MAX_RUNS_PER_PROFILE));
}

/**
 * Mark a run as finished, updating outcome, duration, and metadata.
 * Does NOT write a log entry — deploy-service already emits a summary line.
 *
 * @param {string|null}         profileId
 * @param {string}              runId
 * @param {'success'|'failure'} outcome
 * @param {object|null}         metadata  Final details (targets synced, error…)
 */
function finishRun(profileId, runId, outcome, metadata) {
  const runs = _getRuns(profileId);
  for (let i = runs.length - 1; i >= 0; i--) {
    if (runs[i].runId === runId) {
      const finishedAt = new Date().toISOString();
      runs[i] = {
        ...runs[i],
        finishedAt,
        outcome,
        durationMs: runs[i].startedAt ? Date.now() - new Date(runs[i].startedAt).getTime() : null,
        metadata: metadata ? {
          ...runs[i].metadata,
          ...metadata
        } : runs[i].metadata
      };
      break;
    }
  }
  _setRuns(profileId, runs);
}

/**
 * Get all run summaries for a profile, most-recent first.
 * @param {string|null} profileId
 * @returns {Array<object>}
 */
function getRuns(profileId) {
  return [..._getRuns(profileId)].reverse();
}

// ─── Compat shim ─────────────────────────────────────────────────────────────

/** @deprecated Use startRun / finishRun instead. */
function markDeployRun(profileId) {
  appendEntry(profileId, {
    level: 'info',
    actionType: 'system',
    message: '─── Deploy run started ───'
  });
}

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  appendEntry,
  getLog,
  getRunEntries,
  clearLog,
  startRun,
  finishRun,
  getRuns,
  markDeployRun
};

/***/ },

/***/ "./src/main/services/profile-store.js"
/*!********************************************!*\
  !*** ./src/main/services/profile-store.js ***!
  \********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
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
 *   deployMode:        object        { defaultMode: 'code'|'full' }
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



const Store = __webpack_require__(/*! electron-store */ "electron-store");
const {
  v4: uuidv4
} = __webpack_require__(/*! uuid */ "uuid");
const keyManager = __webpack_require__(/*! ./key-manager */ "./src/main/services/key-manager.js");
const validator = __webpack_require__(/*! ./profile-validator */ "./src/main/services/profile-validator.js");

// ─── Storage ──────────────────────────────────────────────────────────────────

const store = new Store({
  name: 'siteground-deploy-profiles',
  // Schema enforces the correct root shape; individual profile fields are
  // kept flexible so forward-compatible fields survive round-trips.
  schema: {
    profiles: {
      type: 'array',
      default: []
    }
  }
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
    publicKeyPath: keyManager.getPublicKey(keyId) ? keyManager.getPrivateKeyPath(keyId) + '.pub' : ''
  };
}

/**
 * Merge default fields onto an incoming profile object.
 * Never overwrites fields the caller explicitly supplied.
 */
function _applyDefaults(data) {
  return {
    localSiteId: null,
    deployMode: {
      defaultMode: 'code'
    },
    lastDeployedAt: null,
    meta: {},
    ...data
  };
}

/**
 * Wrap a value in a success result envelope.
 * @param {*} data
 */
function _ok(data) {
  return {
    success: true,
    data
  };
}

/**
 * Wrap an error string in a failure result envelope.
 * @param {string}                     message
 * @param {Record<string,string>} [errors]  field-level errors from validation
 */
function _err(message, errors) {
  return errors ? {
    success: false,
    error: message,
    errors
  } : {
    success: false,
    error: message
  };
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
  const profile = _readAll().find(p => p.id === id) || null;
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
  const id = uuidv4();
  const keyPaths = _keyPaths(data.keyId);
  const profile = _applyDefaults({
    ...data,
    ...keyPaths,
    id,
    sshPort: Number(data.sshPort) || 18765,
    createdAt: now,
    updatedAt: now,
    lastDeployedAt: null,
    meta: data.meta || {}
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
  const idx = profiles.findIndex(p => p.id === id);
  if (idx < 0) return _err(`Profile "${id}" not found.`);
  profiles[idx] = {
    ...profiles[idx],
    ...patch,
    // Coerce port to number if it was patched
    ...(patch.sshPort != null ? {
      sshPort: Number(patch.sshPort)
    } : {}),
    id,
    // immutable
    createdAt: profiles[idx].createdAt,
    // immutable
    keyId: profiles[idx].keyId,
    // immutable
    // Preserve existing meta and deep-merge new meta keys
    meta: {
      ...profiles[idx].meta,
      ...(patch.meta || {})
    },
    updatedAt: new Date().toISOString()
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
  const next = profiles.filter(p => p.id !== id);
  if (next.length === profiles.length) {
    return _err(`Profile "${id}" not found.`);
  }
  _writeAll(next);
  return _ok({
    deleted: true
  });
}

/**
 * Mark a profile as deployed (sets lastDeployedAt to now).
 * Called by DeployService at the end of a successful deploy — not exposed to the renderer.
 *
 * @param {string} id
 * @returns {{ success: true, data: object } | { success: false, error: string }}
 */
function markDeployed(id) {
  return updateProfile(id, {
    lastDeployedAt: new Date().toISOString()
  });
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
  return validator.validateProfile(data, {
    isUpdate
  });
}

// ─── Legacy aliases (used by existing IPC handlers) ───────────────────────────
// Keep these so main/index.js doesn't need to change until a later refactor.
const listProfiles = () => getProfiles().data;
const getProfile = id => getProfileById(id).data || null;
const saveProfile = data => {
  // Wizard calls saveProfile with the full wizard data object.
  // If it has an id, treat as update; otherwise create.
  if (data.id) {
    const {
      id,
      ...patch
    } = data;
    const result = updateProfile(id, patch);
    return result.success ? result.data : (() => {
      throw new Error(result.error);
    })();
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
  saveProfile
};

/***/ },

/***/ "./src/main/services/profile-validator.js"
/*!************************************************!*\
  !*** ./src/main/services/profile-validator.js ***!
  \************************************************/
(module) {

"use strict";
/**
 * ProfileValidator
 *
 * Pure validation helpers for profile data.
 * No I/O — takes a plain object, returns a structured result.
 * Used by ProfileStore before any write, and can be called from IPC handlers
 * to give the renderer early feedback without touching storage.
 *
 * Every function returns:
 *   { valid: boolean, errors: { [field]: string } }
 */



// ─── Field rules ──────────────────────────────────────────────────────────────
const RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 80,
    label: 'Profile name'
  },
  sshHost: {
    required: true,
    label: 'SSH host',
    test(v) {
      // Reject URLs — host only, no protocol
      if (/^https?:\/\//i.test(v)) return 'Enter a hostname only, not a URL (remove "https://").';
      // Rough hostname/IP check
      if (!/^[a-z0-9]([a-z0-9\-\.]*[a-z0-9])?$/i.test(v)) return 'Must be a valid hostname or IP address.';
      return null;
    }
  },
  sshPort: {
    required: true,
    label: 'SSH port',
    test(v) {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1 || n > 65535) return 'Must be a number between 1 and 65535.';
      return null;
    }
  },
  sshUser: {
    required: true,
    minLength: 1,
    maxLength: 64,
    label: 'SSH username'
  },
  remoteWebRoot: {
    required: true,
    label: 'Remote web root',
    test(v) {
      if (!v.startsWith('/')) return 'Must be an absolute path starting with "/".';
      if (v.includes('..')) return 'Must not contain "..".';
      return null;
    }
  },
  productionDomain: {
    required: true,
    label: 'Production domain',
    test(v) {
      try {
        const u = new URL(v);
        if (!['http:', 'https:'].includes(u.protocol)) return 'Must start with http:// or https://';
      } catch {
        return 'Must be a valid URL (e.g. https://example.com).';
      }
      return null;
    }
  },
  keyId: {
    required: true,
    label: 'Key ID',
    test(v) {
      // uuid v4 pattern
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)) {
        return 'Must be a valid UUID v4.';
      }
      return null;
    }
  }
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _checkField(field, value) {
  const rule = RULES[field];
  if (!rule) return null;
  const str = value === undefined || value === null ? '' : String(value).trim();
  if (rule.required && str.length === 0) {
    return `${rule.label} is required.`;
  }
  if (str.length > 0) {
    if (rule.minLength && str.length < rule.minLength) {
      return `${rule.label} must be at least ${rule.minLength} characters.`;
    }
    if (rule.maxLength && str.length > rule.maxLength) {
      return `${rule.label} must be ${rule.maxLength} characters or fewer.`;
    }
    if (rule.test) {
      const msg = rule.test(str);
      if (msg) return msg;
    }
  }
  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validate a complete profile object before create or update.
 *
 * @param {object} data                - raw profile data from caller
 * @param {{ isUpdate?: boolean }} opts - if isUpdate, only validates fields that are present
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
function validateProfile(data, {
  isUpdate = false
} = {}) {
  const errors = {};
  const fields = Object.keys(RULES);
  for (const field of fields) {
    // On updates, skip fields that were not supplied
    if (isUpdate && !(field in data)) continue;
    const msg = _checkField(field, data[field]);
    if (msg) errors[field] = msg;
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate a partial profile for update operations.
 * Only validates fields actually present in the patch object.
 *
 * @param {object} patch
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
function validateProfilePatch(patch) {
  return validateProfile(patch, {
    isUpdate: true
  });
}

/**
 * Validate a single field in isolation.
 * Useful for real-time form feedback in the renderer.
 *
 * @param {string} field
 * @param {*}      value
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateField(field, value) {
  const msg = _checkField(field, value);
  return {
    valid: !msg,
    error: msg
  };
}
module.exports = {
  validateProfile,
  validateProfilePatch,
  validateField
};

/***/ },

/***/ "./src/main/services/sftp-service.js"
/*!*******************************************!*\
  !*** ./src/main/services/sftp-service.js ***!
  \*******************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/**
 * SFTPService
 *
 * Uploads files from the local machine to the remote server via SFTP.
 * Uses ssh2-sftp-client which is built on top of ssh2.
 *
 * All connections use key-based auth — passwords are never used.
 * Key content is read from disk here. It never reaches the renderer.
 *
 * ── Result envelope ────────────────────────────────────────────────────────────
 *   { success: true,  data: { remotePath } }
 *   { success: false, error: string }
 */



const SftpClient = __webpack_require__(/*! ssh2-sftp-client */ "ssh2-sftp-client");
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const keyManager = __webpack_require__(/*! ./key-manager */ "./src/main/services/key-manager.js");
function _ok(data) {
  return {
    success: true,
    data
  };
}
function _err(error) {
  return {
    success: false,
    error
  };
}

/**
 * Upload a local file to a remote path via SFTP.
 * Automatically creates the remote parent directory if it does not exist.
 *
 * @param {object}   profile
 * @param {string}   localPath    Absolute path to the local file.
 * @param {string}   remotePath   Absolute path on the remote server.
 *                                Must use forward slashes (POSIX).
 * @param {function} [onProgress] Called with { bytes, total, percent }.
 * @returns {Promise<
 *   { success: true,  data: { remotePath: string } } |
 *   { success: false, error: string }
 * >}
 */
async function uploadFile(profile, localPath, remotePath, onProgress) {
  // ── Resolve key ───────────────────────────────────────────────────────────
  const privateKeyPath = keyManager.getPrivateKeyPath(profile.keyId);
  if (!privateKeyPath) {
    return _err('SSH private key not found. The key may have been deleted or the profile ' + 'is missing a keyId. Open the profile and regenerate the key.');
  }
  let privateKey;
  try {
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  } catch (err) {
    return _err(`Cannot read SSH private key: ${err.message}`);
  }

  // ── Validate local file ───────────────────────────────────────────────────
  if (!fs.existsSync(localPath)) {
    return _err(`Local file not found: ${localPath}`);
  }
  const localStat = fs.statSync(localPath);
  const totalBytes = localStat.size;

  // ── SFTP upload ───────────────────────────────────────────────────────────
  const sftp = new SftpClient('sgd-sftp');
  try {
    await sftp.connect({
      host: profile.sshHost,
      port: Number(profile.sshPort) || 18765,
      username: profile.sshUser,
      privateKey,
      keepaliveInterval: 10_000,
      readyTimeout: 20_000,
      // Disable host key verification — same policy as ssh-service.js
      // TODO: TOFU host key pinning per profile.
      hostVerifier: () => true
    });

    // Ensure the remote parent directory exists.
    // mkdir(path, recursive?) — recursive=true silently succeeds if path exists.
    const remoteDir = path.posix.dirname(remotePath);
    try {
      await sftp.mkdir(remoteDir, true);
    } catch (mkdirErr) {
      // Suppress only "already exists" — surface genuine errors (e.g. permission denied).
      const msg = (mkdirErr.message || '').toLowerCase();
      if (!msg.includes('exist') && !msg.includes('failure') && mkdirErr.code !== 4) {
        throw mkdirErr;
      }
    }
    await sftp.fastPut(localPath, remotePath, {
      step: (transferred, _chunk, total) => {
        if (onProgress) {
          const t = total || totalBytes;
          onProgress({
            bytes: transferred,
            total: t,
            percent: t > 0 ? Math.round(transferred / t * 100) : 0
          });
        }
      }
    });
    return _ok({
      remotePath
    });
  } catch (err) {
    return _err(_friendlyError(err));
  } finally {
    try {
      await sftp.end();
    } catch (_) {}
  }
}

// ─── Error mapping ─────────────────────────────────────────────────────────────

function _friendlyError(err) {
  const msg = (err.message || '').toLowerCase();
  const code = err.code || '';
  if (code === 'ECONNREFUSED') return 'SFTP: Connection refused. Check the SSH host and port.';
  if (code === 'ETIMEDOUT') return 'SFTP: Connection timed out.';
  if (code === 'ENOTFOUND') return 'SFTP: Host not found. Check the hostname.';
  if (code === 'ECONNRESET') return 'SFTP: Connection was reset by the server. Try again.';
  if (msg.includes('permission denied')) return 'SFTP: Permission denied — check the SSH key is still active in SiteGround.';
  if (msg.includes('no such file')) return `SFTP: Remote path parent does not exist: ${err.message}`;
  if (msg.includes('authentication')) return 'SFTP: Authentication failed — SSH key may need to be re-added to SiteGround.';
  return err.message || String(err);
}
module.exports = {
  uploadFile
};

/***/ },

/***/ "./src/main/services/ssh-service.js"
/*!******************************************!*\
  !*** ./src/main/services/ssh-service.js ***!
  \******************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/**
 * SSHService
 *
 * Handles SSH connection testing and remote command execution.
 * Uses the ssh2 library directly for maximum control over streams and errors.
 * All connections use key-based auth — passwords are never stored or used.
 *
 * SiteGround-specific defaults:
 *   port:              18765  (SiteGround does NOT use standard port 22)
 *   keepaliveInterval: 10 000 ms
 *   readyTimeout:      20 000 ms  (20 s — generous for cold starts)
 *
 * Private keys are read from disk in OpenSSH PEM format.
 * Key content NEVER leaves the main process — the renderer only receives
 * the result envelope (success ✓ / error message).
 *
 * ── Result envelope ────────────────────────────────────────────────────────────
 *   { success: true,  data: { ... } }
 *   { success: false, error: string }
 * All exported functions resolve with this shape and never throw.
 */



const {
  Client
} = __webpack_require__(/*! ssh2 */ "ssh2");
const fs = __webpack_require__(/*! fs */ "fs");
const keyManager = __webpack_require__(/*! ./key-manager */ "./src/main/services/key-manager.js");

// ─── Connection config builder ─────────────────────────────────────────────────

/**
 * Build an ssh2 ConnectConfig from a profile.
 * Reads the private key from disk — content never touches the renderer.
 *
 * @param {object} profile
 * @returns {object}  ssh2 ConnectConfig
 * @throws {Error}    if the private key file is missing
 */
function _buildConnectConfig(profile) {
  const privateKeyPath = keyManager.getPrivateKeyPath(profile.keyId);
  if (!privateKeyPath) {
    const e = new Error(`No private key found for keyId ${profile.keyId}. ` + 'The key may have been deleted or the profile was created on another machine.');
    e.code = 'MISSING_KEY';
    throw e;
  }
  let privateKey;
  try {
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  } catch (err) {
    const e = new Error(`Cannot read private key file: ${err.message}`);
    e.code = 'KEY_READ_ERROR';
    throw e;
  }
  return {
    host: profile.sshHost,
    port: Number(profile.sshPort) || 18765,
    username: profile.sshUser,
    privateKey,
    keepaliveInterval: 10_000,
    readyTimeout: 20_000,
    // Disable host key checking for now.
    // TODO: implement TOFU (trust-on-first-use) host key pinning per profile.
    hostVerifier: () => true
  };
}

// ─── Error message helpers ─────────────────────────────────────────────────────

/**
 * Convert a raw ssh2/Node.js network error into a user-friendly string.
 * Covers every realistic failure path for SiteGround SSH connections.
 *
 * @param {Error}  err
 * @param {object} [opts]
 * @param {string} [opts.host]  Used in ECONNREFUSED / ENOTFOUND messages
 * @returns {string}
 */
function _friendlyError(err, opts = {}) {
  const msg = (err.message || String(err)).toLowerCase();
  const code = err.code || '';
  const host = opts.host || 'server';

  // ── Network-level ──────────────────────────────────────────────────────────
  if (code === 'MISSING_KEY' || code === 'KEY_READ_ERROR') {
    return 'SSH key file not found on this machine. ' + 'Return to Step 4 and regenerate the key for this profile.';
  }
  if (code === 'ECONNREFUSED') {
    return `Connection refused by ${host}. ` + 'Check that the SSH port is correct — SiteGround uses port 18765, not 22.';
  }
  if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT') {
    return 'Connection timed out. The server may be unreachable, or the port is ' + 'blocked by a firewall. Try again or check your SiteGround SSH settings.';
  }
  if (code === 'ENOTFOUND') {
    return `Host "${host}" could not be resolved. ` + 'Check the SSH hostname in your SiteGround account.';
  }
  if (code === 'ECONNRESET') {
    return 'The connection was reset by the server. Try again.';
  }

  // ── Authentication ─────────────────────────────────────────────────────────
  if (msg.includes('all configured authentication methods failed') || msg.includes('authentication failed') || msg.includes('no supported authentication methods') || msg.includes('permission denied')) {
    return 'Authentication failed. Make sure you copied the public key into ' + 'SiteGround > SSH Keys, clicked Activate, and waited 30 – 60 s for it to propagate.';
  }
  if (msg.includes('publickey') && msg.includes('denied')) {
    return 'Public key rejected by the server. Verify the key is Active in SiteGround. ' + 'If you regenerated the key, you must re-add the new public key.';
  }

  // ── Protocol ───────────────────────────────────────────────────────────────
  if (msg.includes('handshake') || msg.includes('kex') || msg.includes('unsupported')) {
    return 'SSH handshake failed. The server may not support Ed25519 keys or the ' + 'connection was interrupted during negotiation.';
  }
  if (msg.includes('host key') || msg.includes('fingerprint')) {
    return 'Host key mismatch. If you recently changed servers, the saved host key ' + 'is no longer valid.';
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  return err.message || String(err);
}

// ─── Result helpers ────────────────────────────────────────────────────────────

function _ok(data) {
  return {
    success: true,
    data
  };
}
function _err(error) {
  return {
    success: false,
    error
  };
}

// ─── Exported service functions ────────────────────────────────────────────────

/**
 * Test an SSH connection by connecting AND running a harmless command.
 *
 * Running `pwd` verifies that:
 *   1. The TCP connection can be established
 *   2. The SSH handshake succeeds
 *   3. The private key is accepted (authentication)
 *   4. A shell session can be opened (exec permission)
 *
 * Resolves with a structured result — never throws.
 *
 * @param {object} profile  Profile or raw wizard data with: sshHost, sshPort, sshUser, keyId
 * @returns {Promise<
 *   { success: true,  data: { host: string, user: string, output: string } } |
 *   { success: false, error: string }
 * >}
 */
function testConnection(profile) {
  return new Promise(resolve => {
    if (!profile || !profile.sshHost || !profile.sshUser) {
      return resolve(_err('SSH host and username are required.'));
    }
    let config;
    try {
      config = _buildConnectConfig(profile);
    } catch (err) {
      return resolve(_err(_friendlyError(err, {
        host: profile.sshHost
      })));
    }
    const conn = new Client();
    let settled = false;
    function settle(result) {
      if (!settled) {
        settled = true;
        try {
          conn.destroy();
        } catch (_) {}
        resolve(result);
      }
    }
    conn.on('ready', () => {
      // Run a harmless diagnostic command. `pwd` confirms shell access.
      // Also run `whoami` to confirm the username, separated by " | ".
      conn.exec('pwd && whoami', (err, stream) => {
        if (err) {
          // Connection opened but exec failed — still a meaningful partial success.
          // Treat it as success (auth worked) but note the exec error.
          return settle(_ok({
            host: profile.sshHost,
            user: profile.sshUser,
            output: '(shell exec unavailable — but auth succeeded)'
          }));
        }
        let output = '';
        stream.on('close', exitCode => {
          settle(_ok({
            host: profile.sshHost,
            user: profile.sshUser,
            output: output.trim() || '(no output)',
            exitCode: exitCode || 0
          }));
        }).on('data', d => {
          output += d.toString();
        }).stderr.on('data', d => {
          output += d.toString();
        });
      });
    }).on('error', err => {
      settle(_err(_friendlyError(err, {
        host: profile.sshHost
      })));
    }).connect(config);

    // Belt-and-suspenders timeout in case ssh2's own readyTimeout misfires
    setTimeout(() => {
      settle(_err('Connection timed out after 25 s. The server may be unreachable or the ' + 'port is blocked by a firewall.'));
    }, 25_000);
  });
}

/**
 * Execute a single command on the remote server.
 * Streams stdout/stderr to onData as string chunks.
 *
 * @param {object}   profile
 * @param {string}   command
 * @param {function} [onData]  Called with each stdout/stderr chunk
 * @returns {Promise<{ success: true, data: { exitCode: number } } | { success: false, error: string }>}
 */
function execCommand(profile, command, onData) {
  return new Promise(resolve => {
    let config;
    try {
      config = _buildConnectConfig(profile);
    } catch (err) {
      return resolve(_err(_friendlyError(err, {
        host: profile.sshHost
      })));
    }
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return resolve(_err(`Exec failed: ${err.message}`));
        }
        stream.on('close', code => {
          conn.end();
          resolve(_ok({
            exitCode: code || 0
          }));
        }).on('data', d => onData && onData(d.toString())).stderr.on('data', d => onData && onData(d.toString()));
      });
    }).on('error', err => {
      resolve(_err(_friendlyError(err, {
        host: profile.sshHost
      })));
    }).connect(config);
  });
}

/**
 * Open a persistent SSH connection and return a handle for multiple sequential
 * exec calls (used by the deploy engine to avoid reconnecting between steps).
 * Caller MUST call handle.end() when finished.
 *
 * @param {object} profile
 * @returns {Promise<{ success: true, data: { exec: Function, end: Function } } | { success: false, error: string }>}
 */
function openConnection(profile) {
  return new Promise(resolve => {
    let config;
    try {
      config = _buildConnectConfig(profile);
    } catch (err) {
      return resolve(_err(_friendlyError(err, {
        host: profile.sshHost
      })));
    }
    const conn = new Client();
    let settled = false;
    function settle(result) {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    }
    conn.on('ready', () => {
      settle(_ok({
        /**
         * Run a remote command. Resolves with { exitCode } — never rejects.
         * @param {string}   command
         * @param {function} [onData]      Called with each stdout/stderr chunk.
         * @param {number}   [timeoutMs]   Per-command timeout in ms (default 120 s).
         *                                 On timeout resolves { exitCode: -1, _timedOut: true }.
         */
        exec: (command, onData, timeoutMs = 120_000) => new Promise(res => {
          const timer = setTimeout(() => {
            res({
              exitCode: -1,
              _timedOut: true
            });
          }, timeoutMs);
          conn.exec(command, (err, stream) => {
            if (err) {
              clearTimeout(timer);
              // Resolve (not reject) so callers always get an envelope.
              return res({
                exitCode: -1,
                _execError: err.message
              });
            }
            stream.on('close', code => {
              clearTimeout(timer);
              res({
                exitCode: code || 0
              });
            }).on('data', d => onData && onData(d.toString())).stderr.on('data', d => onData && onData(d.toString()));
          });
        }),
        end: () => new Promise(res => {
          conn.end();
          res();
        })
      }));
    }).on('error', err => {
      settle(_err(_friendlyError(err, {
        host: profile.sshHost
      })));
    }).connect(config);

    // Belt-and-suspenders timeout — same as testConnection.
    // Guards against ssh2's readyTimeout silently misfiring.
    setTimeout(() => {
      settle(_err('SSH connection timed out after 25 s. The server may be unreachable or ' + 'the port is blocked by a firewall.'));
    }, 25_000);
  });
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

/***/ "archiver"
/*!***************************!*\
  !*** external "archiver" ***!
  \***************************/
(module) {

"use strict";
module.exports = require("archiver");

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

/***/ "ssh2-sftp-client"
/*!***********************************!*\
  !*** external "ssh2-sftp-client" ***!
  \***********************************/
(module) {

"use strict";
module.exports = require("ssh2-sftp-client");

/***/ },

/***/ "uuid"
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
(module) {

"use strict";
module.exports = require("uuid");

/***/ },

/***/ "child_process"
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
(module) {

"use strict";
module.exports = require("child_process");

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

/***/ "os"
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
(module) {

"use strict";
module.exports = require("os");

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