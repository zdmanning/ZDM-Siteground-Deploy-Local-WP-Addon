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

'use strict';

const path              = require('path');
const fs                = require('fs');
const os                = require('os');
const { exec }          = require('child_process');

const localAdapter = require('../adapters/local-app');
const sftpSvc      = require('./sftp-service');

// ─── Result helpers ────────────────────────────────────────────────────────────
function _ok(data)   { return { success: true,  data  }; }
function _err(error) { return { success: false, error }; }

function _emit(level, message, onLog) {
  const entry = { level, message, timestamp: new Date().toISOString() };
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
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
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
  return new Promise((resolve) => {
    exec(
      cmd,
      {
        cwd:       opts.cwd || process.cwd(),
        maxBuffer: 100 * 1024 * 1024, // 100 MB
        env:       process.env,
      },
      (err, stdout, stderr) => {
        const exitCode = err ? (err.code ?? -1) : 0;
        resolve({ exitCode, stdout: stdout || '', stderr: stderr || '' });
      }
    );
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
    const re = new RegExp(
      `define\\s*\\(\\s*['"]${key}['"]\\s*,\\s*['"]([^'"]*)['"\\s]*\\)`,
      'i'
    );
    const m = content.match(re);
    return m ? m[1] : null;
  }

  const dbName     = _extract('DB_NAME');
  const dbUser     = _extract('DB_USER');
  const dbPassword = _extract('DB_PASSWORD') || '';
  const rawHost    = _extract('DB_HOST') || 'localhost';

  if (!dbName || !dbUser) return null;

  // DB_HOST in Local often includes a port: "127.0.0.1:10011"
  const colonIdx = rawHost.lastIndexOf(':');
  const dbHost = colonIdx !== -1 ? rawHost.slice(0, colonIdx) : rawHost;
  const dbPort = colonIdx !== -1 ? rawHost.slice(colonIdx + 1) : '3306';

  return { dbName, dbUser, dbPassword, dbHost, dbPort };
}

// ─── Local DB export ───────────────────────────────────────────────────────────

/**
 * Try exporting the local DB using WP-CLI.
 * @private
 */
async function _wpCliExport(wpRoot, sqlPath, onLog) {
  _emit('info', '  Trying WP-CLI export…', onLog);
  fs.mkdirSync(path.dirname(sqlPath), { recursive: true });

  const res = await _run(
    `wp db export ${_lq(sqlPath)} --path=${_lq(wpRoot)} --allow-root --quiet`,
    { cwd: wpRoot }
  );

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

  fs.mkdirSync(path.dirname(sqlPath), { recursive: true });

  // NOTE: password is passed via CLI arg — acceptable on a local dev machine
  // where there is no shared process list to inspect.
  const pwArg = creds.dbPassword ? `-p"${creds.dbPassword.replace(/"/g, '')}"` : '';
  const cmd = [
    'mysqldump',
    `-h"${creds.dbHost}"`,
    `-P${creds.dbPort}`,
    `-u"${creds.dbUser}"`,
    pwArg,
    '--single-transaction',
    '--routines',
    '--triggers',
    '--no-tablespaces',
    `--result-file=${_lq(sqlPath)}`,
    `"${creds.dbName}"`,
  ].filter(Boolean).join(' ');

  const res = await _run(cmd, { cwd: wpRoot });
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
    return _err(
      `WordPress root not found for site "${siteId}".\n` +
      `Expected path: ${wpRoot || '(unknown)'}\n` +
      'Make sure the Local site is present and has not been moved.'
    );
  }

  _emit('info', `Exporting local database from ${wpRoot}…`, onLog);

  let result = await _wpCliExport(wpRoot, sqlPath, onLog);

  if (!result.success) {
    _emit('warning', `  WP-CLI: ${result.error}`, onLog);
    _emit('info',    '  Falling back to mysqldump…', onLog);
    result = await _mysqldumpExport(wpRoot, sqlPath, onLog);
  }

  if (!result.success) {
    return _err(
      'Local database export failed. Neither WP-CLI nor mysqldump succeeded.\n\n' +
      `mysqldump error: ${result.error}\n\n` +
      'To resolve: ensure WP-CLI (wp) or mysqldump is available in your system PATH.\n' +
      'WP-CLI: https://wp-cli.org  |  mysqldump is bundled with MySQL/MariaDB clients.'
    );
  }

  const sizeBytes = fs.statSync(sqlPath).size;
  _emit('success', `Local database exported: ${(sizeBytes / 1024).toFixed(1)} KB`, onLog);
  return _ok({ sqlPath, sizeBytes });
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
    return _err(
      `SQL export file not found: ${localSqlPath}\n` +
      'The database export step may have failed silently. ' +
      'Review the export log entries above for details.'
    );
  }
  const sizeBytes = fs.statSync(localSqlPath).size;
  _emit('info', `Uploading SQL file (${(sizeBytes / 1024).toFixed(1)} KB)…`, onLog);

  let lastPct = -1;
  const res = await sftpSvc.uploadFile(
    profile,
    localSqlPath,
    remoteSqlPath,
    ({ percent }) => {
      const band = Math.floor(percent / 25) * 25;
      if (band > lastPct) {
        lastPct = band;
        _emit('info', `  SQL upload: ${percent}%`, onLog);
      }
    }
  );

  if (!res.success) return res;
  _emit('success', 'SQL file uploaded', onLog);
  return _ok({ remoteSqlPath });
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
    `php -r "` +
      `\\$c=@file_get_contents(${_q(webRoot + '/wp-config.php')});` +
      `preg_match_all('/define\\s*\\([\\s\'\"]*([A-Z_]+)[\\s\'\"]*,[\\s\'\"]*([^\'\"]*)[\\s\'\"]*\\)/i',''+\\$c,\\$m);` +
      `echo json_encode(array_combine(\\$m[1],\\$m[2]));` +
    `" 2>&1`,
    (chunk) => { out += chunk; }
  );

  let creds = null;
  try { creds = JSON.parse(out.trim()); } catch (_) {}
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
  let res = await sshConn.exec(
    `wp db export ${_q(backupPath)} --path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode === 0) {
    // Verify the file has content
    let sizeOut = '';
    await sshConn.exec(
      `stat -c %s ${_q(backupPath)} 2>/dev/null || echo 0`,
      (c) => { sizeOut += c; }
    );
    if (parseInt(sizeOut.trim(), 10) > 0) {
      _emit('success', `Remote DB backup created via WP-CLI: ${backupPath}`, onLog);
      return _ok({ backupPath });
    }
  }

  const wpCliErr = out.trim().split('\n').slice(-2).join(' ');
  _emit('warning', `  WP-CLI backup failed: ${wpCliErr || `exit ${res.exitCode}`}`, onLog);
  _emit('info',    '  Falling back to remote mysqldump…', onLog);

  // ── Attempt 2: Read wp-config.php via PHP, then mysqldump ────────────────
  const creds = await _readRemoteWpCreds(sshConn, webRoot);

  if (!creds) {
    return _err(
      'Remote DB backup failed.\n' +
      `WP-CLI error: ${wpCliErr}\n` +
      'mysqldump fallback also failed: could not read remote wp-config.php credentials.\n' +
      'Import aborted to protect the production database.'
    );
  }

  // Use lastIndexOf so an IPv6 address like [::1]:3306 is handled correctly.
  const rawHost = creds.DB_HOST || 'localhost';
  const colonIdx = rawHost.lastIndexOf(':');
  const host    = colonIdx !== -1 ? rawHost.slice(0, colonIdx) : rawHost;
  const port    = colonIdx !== -1 ? rawHost.slice(colonIdx + 1) : '3306';

  // Pass the password via the MYSQL_PWD environment variable instead of a CLI
  // flag to keep it out of the remote process list (visible in `ps aux`).
  const pwEnv   = creds.DB_PASSWORD ? `MYSQL_PWD=${_q(creds.DB_PASSWORD)} ` : '';

  out = '';
  res = await sshConn.exec(
    `${pwEnv}mysqldump -h ${_q(host)} -P ${port} -u ${_q(creds.DB_USER)} ` +
    `--single-transaction --routines --triggers --no-tablespaces ` +
    `${_q(creds.DB_NAME)} > ${_q(backupPath)} 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode !== 0) {
    return _err(
      `Remote mysqldump backup failed (exit ${res.exitCode}): ${out.trim()}\n` +
      'Import aborted to protect the production database.'
    );
  }

  _emit('success', `Remote DB backup created via mysqldump: ${backupPath}`, onLog);
  return _ok({ backupPath });
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
  let res = await sshConn.exec(
    `wp db import ${_q(remoteSqlPath)} --path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode === 0) {
    _emit('success', 'Database imported via WP-CLI', onLog);
    return _ok({ method: 'wp-cli' });
  }

  const wpCliErr = out.trim().split('\n').slice(-2).join(' ');
  _emit('warning', `  WP-CLI import failed: ${wpCliErr || `exit ${res.exitCode}`}`, onLog);
  _emit('info',    '  Falling back to mysql CLI import…', onLog);

  // ── Attempt 2: mysql CLI with credentials from remote wp-config.php ──────
  const creds = await _readRemoteWpCreds(sshConn, webRoot);

  if (!creds) {
    return _err(
      `Database import failed: WP-CLI unavailable and could not read remote wp-config.php.\n` +
      `WP-CLI error: ${wpCliErr}`
    );
  }

  // Use lastIndexOf so an IPv6 address like [::1]:3306 is handled correctly.
  const rawHost = creds.DB_HOST || 'localhost';
  const colonIdx = rawHost.lastIndexOf(':');
  const host    = colonIdx !== -1 ? rawHost.slice(0, colonIdx) : rawHost;
  const port    = colonIdx !== -1 ? rawHost.slice(colonIdx + 1) : '3306';

  // Pass the password via MYSQL_PWD env var so it is not visible in `ps aux`.
  const pwEnv   = creds.DB_PASSWORD ? `MYSQL_PWD=${_q(creds.DB_PASSWORD)} ` : '';

  out = '';
  res = await sshConn.exec(
    `${pwEnv}mysql -h ${_q(host)} -P ${port} -u ${_q(creds.DB_USER)} ` +
    `${_q(creds.DB_NAME)} < ${_q(remoteSqlPath)} 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode !== 0) {
    return _err(
      `Database import via mysql CLI failed (exit ${res.exitCode}): ${out.trim()}`
    );
  }

  _emit('success', 'Database imported via mysql CLI', onLog);
  return _ok({ method: 'mysql-cli' });
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
  const res = await sshConn.exec(
    `wp search-replace ${_q(localDomain)} ${_q(productionDomain)} ` +
    `--all-tables --precise --recurse-objects ` +
    `--path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { out += chunk; }
  );

  const summary = out.trim().split('\n').filter(Boolean).slice(-3).join(' | ');

  if (res.exitCode !== 0) {
    return _err(`wp search-replace failed (exit ${res.exitCode}): ${summary}`);
  }

  _emit('success', `search-replace: ${summary}`, onLog);

  // Also upgrade bare http:// variant of production domain → https:// if applicable
  if (productionDomain.startsWith('https://')) {
    const httpProd = productionDomain.replace(/^https:\/\//, 'http://');
    let out2 = '';
    await sshConn.exec(
      `wp search-replace ${_q(httpProd)} ${_q(productionDomain)} ` +
      `--all-tables --precise --recurse-objects ` +
      `--path=${_q(webRoot)} --allow-root 2>&1`,
      (chunk) => { out2 += chunk; }
    );
    // Non-fatal; log only if something changed
    const changed = out2.match(/\d+ replacements/);
    if (changed) _emit('info', `  http→https upgrade: ${changed[0]}`, onLog);
  }

  return _ok({ summary });
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
  const res = await sshConn.exec(
    `wp cache flush --path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { out += chunk; }
  );

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
  clearRemoteCache,
};

