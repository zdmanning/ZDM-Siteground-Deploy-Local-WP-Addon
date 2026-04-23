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
 * @returns {{ dbName, dbUser, dbPassword, dbHost, dbPort, tablePrefix } | null}
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
  const tablePrefixMatch = content.match(/\$table_prefix\s*=\s*['"]([^'"]+)['"]\s*;/i);
  const tablePrefix = tablePrefixMatch ? tablePrefixMatch[1] : null;

  if (!dbName || !dbUser) return null;

  // DB_HOST in Local often includes a port: "127.0.0.1:10011"
  const colonIdx = rawHost.lastIndexOf(':');
  const dbHost = colonIdx !== -1 ? rawHost.slice(0, colonIdx) : rawHost;
  const dbPort = colonIdx !== -1 ? rawHost.slice(colonIdx + 1) : '3306';

  return { dbName, dbUser, dbPassword, dbHost, dbPort, tablePrefix };
}

function getLocalTablePrefix(siteId) {
  const wpRoot = localAdapter.getSiteWpPath(siteId);
  if (!wpRoot || !fs.existsSync(wpRoot)) {
    return _err(`WordPress root not found for site "${siteId}".`);
  }

  const cfg = _parseWpConfig(wpRoot);
  if (!cfg || !cfg.tablePrefix) {
    return _err('Could not determine the local table prefix from wp-config.php.');
  }

  return _ok({ tablePrefix: cfg.tablePrefix, wpRoot });
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
async function _mysqldumpExport(wpRoot, sqlPath, onLog, siteId) {
  _emit('info', '  Trying mysqldump export…', onLog);

  const creds = _parseWpConfig(wpRoot);
  if (!creds) {
    return _err('Cannot parse wp-config.php to obtain database credentials');
  }

  // Local's MySQL never uses the wp-config DB_HOST port — it runs on a
  // per-site random port stored in sites.json (services.mysql.ports.MYSQL).
  // Override whatever _parseWpConfig found with the real port.
  const localPort = siteId ? localAdapter.getSiteMysqlPort(siteId) : null;
  if (localPort) {
    creds.dbHost = '127.0.0.1';   // named pipe workaround — force TCP
    creds.dbPort = String(localPort);
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
    result = await _mysqldumpExport(wpRoot, sqlPath, onLog, siteId);
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

// ─── Local DB import ──────────────────────────────────────────────────────────────

/**
 * Import a SQL file into the local WordPress database.
 * Tries WP-CLI first, then falls back to the mysql CLI.
 *
 * @param {string}   siteId
 * @param {string}   sqlPath  Absolute path to the .sql file to import.
 * @param {function} onLog
 */
async function importLocalDatabase(siteId, sqlPath, onLog) {
  const wpRoot = localAdapter.getSiteWpPath(siteId);
  if (!wpRoot || !fs.existsSync(wpRoot)) {
    return _err(`WordPress root not found for site "${siteId}".`);
  }
  if (!fs.existsSync(sqlPath)) {
    return _err(`SQL file not found: ${sqlPath}`);
  }

  _emit('info', 'Importing database into local site…', onLog);

  // Try WP-CLI first
  let res = await _run(
    `wp db import ${_lq(sqlPath)} --path=${_lq(wpRoot)} --allow-root`,
    { cwd: wpRoot }
  );

  if (res.exitCode === 0) {
    _emit('success', 'Local database imported via WP-CLI', onLog);
    return _ok({ method: 'wp-cli' });
  }

  _emit('warning', `  WP-CLI import failed: ${(res.stderr || res.stdout).trim()}`, onLog);
  _emit('info',    '  Falling back to mysql CLI…', onLog);

  const creds = _parseWpConfig(wpRoot);
  if (!creds) {
    return _err('Cannot parse wp-config.php to obtain local database credentials.');
  }

  const localPort = siteId ? localAdapter.getSiteMysqlPort(siteId) : null;
  if (localPort) {
    creds.dbHost = '127.0.0.1';
    creds.dbPort = String(localPort);
  }

  const pwArg = creds.dbPassword ? `-p"${creds.dbPassword.replace(/"/g, '')}"` : '';
  const cmd = [
    'mysql',
    `-h"${creds.dbHost}"`,
    `-P${creds.dbPort}`,
    `-u"${creds.dbUser}"`,
    pwArg,
    `"${creds.dbName}"`,
    `< ${_lq(sqlPath)}`,
  ].filter(Boolean).join(' ');

  res = await _run(cmd, { cwd: wpRoot });
  if (res.exitCode !== 0) {
    const summary = (res.stderr || res.stdout).trim().split('\n').slice(-3).join(' | ');
    return _err(
      'Local database import failed. Neither WP-CLI nor mysql CLI succeeded.\n' +
      `mysql error: ${summary}`
    );
  }

  _emit('success', 'Local database imported via mysql CLI', onLog);
  return _ok({ method: 'mysql-cli' });
}

// ─── Local search-replace ───────────────────────────────────────────────────────

/**
 * Run `wp search-replace` locally to swap the production domain for the local
 * dev domain after a DB pull.
 *
 * @param {string}   siteId
 * @param {string}   productionDomain  e.g. "https://example.com"
 * @param {string}   localDomain       e.g. "http://mysite.local"
 * @param {function} onLog
 */
async function runLocalSearchReplace(siteId, productionDomain, localDomain, onLog) {
  const wpRoot = localAdapter.getSiteWpPath(siteId);
  if (!wpRoot || !fs.existsSync(wpRoot)) {
    return _err(`WordPress root not found for site "${siteId}".`);
  }

  _emit('info', `Search-replace: ${productionDomain} → ${localDomain}`, onLog);

  const res = await _run(
    `wp search-replace ${_lq(productionDomain)} ${_lq(localDomain)} ` +
    `--all-tables --precise --recurse-objects --skip-plugins --skip-themes ` +
    `--path=${_lq(wpRoot)} --allow-root`,
    { cwd: wpRoot }
  );

  if (res.exitCode !== 0) {
    const summary = (res.stderr || res.stdout).trim().split('\n').slice(-3).join(' | ');
    _emit('warning', `Local search-replace failed (exit ${res.exitCode}): ${summary}`, onLog);
    // Non-fatal — site still works; URLs will just point to production temporarily
    return _ok({ skipped: true, reason: summary });
  }

  const summary = (res.stdout || '').trim().split('\n').filter(Boolean).slice(-3).join(' | ');
  _emit('success', `Search-replace done: ${summary}`, onLog);
  return _ok({});
}

// ─── Remote credential reader ────────────────────────────────────────────────────

async function _readRemoteWpCredsViaWpCli(sshConn, webRoot) {
  const fields = [
    ['DB_NAME', 'constant'],
    ['DB_USER', 'constant'],
    ['DB_PASSWORD', 'constant'],
    ['DB_HOST', 'constant'],
    ['table_prefix', 'variable'],
  ];
  const result = { TABLE_PREFIX: null };

  for (const [key, type] of fields) {
    let out = '';
    const res = await sshConn.exec(
      `wp config get ${key} --type=${type} --path=${_q(webRoot)} --allow-root 2>&1`,
      (chunk) => { out += chunk; }
    );

    if (res.exitCode !== 0) return null;

    const value = out.trim().split('\n').filter(Boolean).pop() || '';
    if (!value) return null;

    if (key === 'table_prefix') result.TABLE_PREFIX = value;
    else result[key] = value;
  }

  return result;
}

async function _readRemoteWpConfigText(sshConn, webRoot) {
  let out = '';
  const res = await sshConn.exec(
    `cat ${_q(webRoot + '/wp-config.php')} 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode !== 0 || !out.trim()) return null;
  return out;
}

function _parseWpConfigText(content) {
  if (!content || typeof content !== 'string') return null;

  function extractDefine(key) {
    const re = new RegExp(
      `define\\s*\\(\\s*['\"]${key}['\"]\\s*,\\s*(['\"])([\\s\\S]*?)\\1\\s*\\)`,
      'i'
    );
    const match = content.match(re);
    return match ? match[2].trim() : null;
  }

  const prefixMatch = content.match(/\$table_prefix\s*=\s*(?:['\"]([^'\"]+)['\"]|([A-Za-z0-9_]+))\s*;/i);
  const creds = {
    DB_NAME: extractDefine('DB_NAME'),
    DB_USER: extractDefine('DB_USER'),
    DB_PASSWORD: extractDefine('DB_PASSWORD') || '',
    DB_HOST: extractDefine('DB_HOST') || 'localhost',
    TABLE_PREFIX: prefixMatch ? (prefixMatch[1] || prefixMatch[2] || null) : null,
  };

  return creds.DB_NAME && creds.DB_USER ? creds : null;
}

function _getDbHostParts(rawHost) {
  const hostValue = rawHost || 'localhost';
  const colonIdx = hostValue.lastIndexOf(':');
  return {
    host: colonIdx !== -1 ? hostValue.slice(0, colonIdx) : hostValue,
    port: colonIdx !== -1 ? hostValue.slice(colonIdx + 1) : '3306',
  };
}

async function _readRemoteWpCreds(sshConn, webRoot) {
  const rawConfig = await _readRemoteWpConfigText(sshConn, webRoot);
  const parsedConfig = _parseWpConfigText(rawConfig);
  if (parsedConfig) {
    return parsedConfig;
  }

  const wpCliCreds = await _readRemoteWpCredsViaWpCli(sshConn, webRoot);
  if (wpCliCreds && wpCliCreds.DB_NAME && wpCliCreds.DB_USER) {
    return wpCliCreds;
  }

  return null;
}

async function _readRemoteTablePrefixViaWpCli(sshConn, webRoot) {
  let out = '';
  const res = await sshConn.exec(
    `wp config get table_prefix --type=variable --path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode !== 0) return null;

  const value = out.trim().split('\n').filter(Boolean).pop() || '';
  return value || null;
}

async function _inferRemoteTablePrefixFromDb(sshConn, webRoot) {
  const creds = await _readRemoteWpCreds(sshConn, webRoot);
  if (!creds) return null;

  const { host, port } = _getDbHostParts(creds.DB_HOST);
  const pwEnv = creds.DB_PASSWORD ? `MYSQL_PWD=${_q(creds.DB_PASSWORD)} ` : '';

  let out = '';
  const res = await sshConn.exec(
    `${pwEnv}mysql -N -B -h ${_q(host)} -P ${port} -u ${_q(creds.DB_USER)} ` +
    `${_q(creds.DB_NAME)} -e ${_q('SHOW TABLES')} 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode !== 0) return null;

  const tables = out.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const knownSuffixes = ['options', 'posts', 'users', 'usermeta', 'terms', 'term_taxonomy'];

  for (const suffix of knownSuffixes) {
    const match = tables.find((table) => table.endsWith(`_${suffix}`));
    if (match) {
      return match.slice(0, match.length - suffix.length);
    }
  }

  return null;
}

async function getRemoteTablePrefix(sshConn, remoteWebRoot) {
  const webRoot = remoteWebRoot.replace(/\/$/, '');
  const creds = await _readRemoteWpCreds(sshConn, webRoot);

  if (creds && creds.TABLE_PREFIX) {
    return _ok({ tablePrefix: creds.TABLE_PREFIX, source: 'wp-config-text' });
  }

  const wpCliPrefix = await _readRemoteTablePrefixViaWpCli(sshConn, webRoot);
  if (wpCliPrefix) {
    return _ok({ tablePrefix: wpCliPrefix, source: 'wp-cli' });
  }

  const inferredPrefix = await _inferRemoteTablePrefixFromDb(sshConn, webRoot);
  if (inferredPrefix) {
    return _ok({ tablePrefix: inferredPrefix, source: 'database-tables' });
  }

  return _err('Could not determine the remote table prefix from wp-config.php or the remote database.');
}

async function updateRemoteTablePrefix(sshConn, remoteWebRoot, tablePrefix, onLog) {
  const webRoot = remoteWebRoot.replace(/\/$/, '');
  const configPath = webRoot + '/wp-config.php';

  async function lintRemoteConfig() {
    let lintOut = '';
    const lintRes = await sshConn.exec(
      `php -l ${_q(configPath)} 2>&1`,
      (chunk) => { lintOut += chunk; }
    );

    if (lintRes.exitCode !== 0) {
      return _err(`Remote wp-config syntax check failed: ${lintOut.trim()}`);
    }

    return _ok({});
  }

  _emit('info', `Aligning remote wp-config table prefix -> ${tablePrefix}`, onLog);

  let out = '';
  let res = await sshConn.exec(
    `wp config set table_prefix ${_q(tablePrefix)} --type=variable --path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode === 0) {
    const lintResult = await lintRemoteConfig();
    if (!lintResult.success) {
      return lintResult;
    }
    _emit('success', `Remote wp-config now uses table prefix ${tablePrefix}`, onLog);
    return _ok({ tablePrefix, method: 'wp-cli' });
  }

  _emit('warning', `  WP-CLI wp-config update failed: ${out.trim() || `exit ${res.exitCode}`}`, onLog);

  const phpSource = [
    `$f = base64_decode('${Buffer.from(configPath).toString('base64')}');`,
    `$p = base64_decode('${Buffer.from(String(tablePrefix)).toString('base64')}');`,
    `$c = @file_get_contents($f);`,
    `if ($c === false) { fwrite(STDERR, 'Cannot read wp-config.php'); exit(1); }`,
    `$n = preg_replace("/\\$table_prefix\\s*=\\s*(?:['\"]([^'\"]+)['\"]|([A-Za-z0-9_]+))\\s*;/i", "\\$table_prefix = '" . $p . "';", $c, 1, $count);`,
    `if (!$count) { fwrite(STDERR, 'table_prefix entry not found'); exit(1); }`,
    `if (@file_put_contents($f, $n) === false) { fwrite(STDERR, 'Cannot write wp-config.php'); exit(1); }`,
    `echo 'updated';`,
  ].join(' ');
  const encodedPhp = Buffer.from(phpSource).toString('base64');

  out = '';
  res = await sshConn.exec(
    `php -r "eval(base64_decode('${encodedPhp}'));" 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode !== 0) {
    return _err(`Remote wp-config update failed (exit ${res.exitCode}): ${out.trim()}`);
  }

  const lintResult = await lintRemoteConfig();
  if (!lintResult.success) {
    return lintResult;
  }

  _emit('success', `Remote wp-config now uses table prefix ${tablePrefix}`, onLog);
  return _ok({ tablePrefix, method: 'php-fallback' });
}

function _escapeSqlLikePrefix(prefix) {
  return String(prefix)
    .replace(/\\/g, '\\\\')
    .replace(/_/g, '\\_')
    .replace(/%/g, '\\%');
}

function _escapeMysqlIdentifier(name) {
  return '`' + String(name).replace(/`/g, '``') + '`';
}

const KNOWN_WORDPRESS_CORE_TABLE_SUFFIXES = [
  'commentmeta',
  'comments',
  'links',
  'options',
  'postmeta',
  'posts',
  'term_relationships',
  'term_taxonomy',
  'termmeta',
  'terms',
  'usermeta',
  'users',
];

function _inferWordPressPrefixesFromTables(tables) {
  const prefixCounts = new Map();

  for (const table of tables) {
    for (const suffix of KNOWN_WORDPRESS_CORE_TABLE_SUFFIXES) {
      if (table.endsWith(`_${suffix}`)) {
        const prefix = table.slice(0, table.length - suffix.length);
        prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
        break;
      }
    }
  }

  return [...prefixCounts.entries()]
    .filter(([, count]) => count >= 6)
    .map(([prefix]) => prefix);
}

async function getRemoteStaleTablePrefixes(sshConn, remoteWebRoot, keepPrefix) {
  const webRoot = remoteWebRoot.replace(/\/$/, '');
  const creds = await _readRemoteWpCreds(sshConn, webRoot);

  if (!creds) {
    return _err('Could not read remote DB credentials for stale table discovery.');
  }

  const { host, port } = _getDbHostParts(creds.DB_HOST);
  const pwEnv = creds.DB_PASSWORD ? `MYSQL_PWD=${_q(creds.DB_PASSWORD)} ` : '';

  let out = '';
  const res = await sshConn.exec(
    `${pwEnv}mysql -N -B -h ${_q(host)} -P ${port} -u ${_q(creds.DB_USER)} ` +
    `${_q(creds.DB_NAME)} -e ${_q('SHOW TABLES')} 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode !== 0) {
    return _err(`Stale prefix discovery failed (exit ${res.exitCode}): ${out.trim()}`);
  }

  const tables = out.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const prefixes = _inferWordPressPrefixesFromTables(tables)
    .filter((prefix) => prefix && prefix !== keepPrefix);

  return _ok({ prefixes });
}

async function dropRemoteTablesByPrefix(sshConn, remoteWebRoot, tablePrefix, onLog) {
  const webRoot = remoteWebRoot.replace(/\/$/, '');
  const creds = await _readRemoteWpCreds(sshConn, webRoot);

  if (!creds) {
    return _err('Could not read remote DB credentials for stale table cleanup.');
  }

  const { host, port } = _getDbHostParts(creds.DB_HOST);
  const pwEnv = creds.DB_PASSWORD ? `MYSQL_PWD=${_q(creds.DB_PASSWORD)} ` : '';
  const likePrefix = _escapeSqlLikePrefix(tablePrefix) + '%';

  let out = '';
  const listSql = `SHOW TABLES LIKE '${likePrefix}'`;
  const listRes = await sshConn.exec(
    `${pwEnv}mysql -N -B -h ${_q(host)} -P ${port} -u ${_q(creds.DB_USER)} ` +
    `${_q(creds.DB_NAME)} -e ${_q(listSql)} 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (listRes.exitCode !== 0) {
    return _err(`Stale table list failed (exit ${listRes.exitCode}): ${out.trim()}`);
  }

  const tables = out.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const tableCount = tables.length;
  if (tableCount === 0) {
    _emit('info', `No stale ${tablePrefix}* tables found to clean up`, onLog);
    return _ok({ deleted: 0 });
  }

  _emit('info', `Removing ${tableCount} stale ${tablePrefix}* tables from the remote database...`, onLog);

  out = '';
  const dropSql = [
    'SET FOREIGN_KEY_CHECKS=0',
    `DROP TABLE IF EXISTS ${tables.map(_escapeMysqlIdentifier).join(', ')}`,
    'SET FOREIGN_KEY_CHECKS=1',
  ].join('; ');

  const dropRes = await sshConn.exec(
    `${pwEnv}mysql -N -B -h ${_q(host)} -P ${port} -u ${_q(creds.DB_USER)} ` +
    `${_q(creds.DB_NAME)} -e ${_q(dropSql)} 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (dropRes.exitCode !== 0) {
    return _err(`Stale table cleanup failed (exit ${dropRes.exitCode}): ${out.trim()}`);
  }

  _emit('success', `Removed ${tableCount} stale ${tablePrefix}* tables`, onLog);
  return _ok({ deleted: tableCount });
}

// ─── Remote DB backup ──────────────────────────────────────────────────────────

async function backupRemoteDatabase(sshConn, remoteWebRoot, backupPath, onLog) {
  const webRoot = remoteWebRoot.replace(/\/$/, '');
  const backupDir = backupPath.substring(0, backupPath.lastIndexOf('/'));

  _emit('info', `Creating remote DB backup -> ${backupPath}`, onLog);
  await sshConn.exec(`mkdir -p ${_q(backupDir)} 2>&1`);

  const creds = await _readRemoteWpCreds(sshConn, webRoot);
  if (!creds) {
    return _err(
      'Remote DB backup failed.\n' +
      'Could not read remote wp-config.php credentials.\n' +
      'Import aborted to protect the production database.'
    );
  }

  const { host, port } = _getDbHostParts(creds.DB_HOST);
  const pwEnv = creds.DB_PASSWORD ? `MYSQL_PWD=${_q(creds.DB_PASSWORD)} ` : '';

  let out = '';
  let res = await sshConn.exec(
    `${pwEnv}mysqldump -h ${_q(host)} -P ${port} -u ${_q(creds.DB_USER)} ` +
    `--single-transaction --routines --triggers --no-tablespaces ` +
    `${_q(creds.DB_NAME)} > ${_q(backupPath)} 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode === 0) {
    let sizeOut = '';
    await sshConn.exec(
      `stat -c %s ${_q(backupPath)} 2>/dev/null || echo 0`,
      (c) => { sizeOut += c; }
    );
    if (parseInt(sizeOut.trim(), 10) > 0) {
      _emit('success', `Remote DB backup created via mysqldump: ${backupPath}`, onLog);
      return _ok({ backupPath, method: 'mysqldump' });
    }
  }

  const mysqlErr = out.trim().split('\n').slice(-3).join(' | ');
  _emit('warning', `  mysqldump backup failed: ${mysqlErr || `exit ${res.exitCode}`}`, onLog);
  _emit('info', '  Falling back to WP-CLI export…', onLog);

  out = '';
  res = await sshConn.exec(
    `wp db export ${_q(backupPath)} --path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode === 0) {
    let sizeOut = '';
    await sshConn.exec(
      `stat -c %s ${_q(backupPath)} 2>/dev/null || echo 0`,
      (c) => { sizeOut += c; }
    );
    if (parseInt(sizeOut.trim(), 10) > 0) {
      _emit('success', `Remote DB backup created via WP-CLI: ${backupPath}`, onLog);
      return _ok({ backupPath, method: 'wp-cli' });
    }
  }

  const wpCliErr = out.trim().split('\n').slice(-3).join(' | ');
  return _err(
    'Remote DB backup failed.\n' +
    `mysqldump error: ${mysqlErr || `exit ${res.exitCode}`}\n` +
    `WP-CLI error: ${wpCliErr || `exit ${res.exitCode}`}\n` +
    'Import aborted to protect the production database.'
  );
}

// ─── Remote DB import ──────────────────────────────────────────────────────────

async function importRemoteDatabase(sshConn, remoteWebRoot, remoteSqlPath, onLog) {
  const webRoot = remoteWebRoot.replace(/\/$/, '');
  _emit('info', 'Importing database on remote server…', onLog);

  const creds = await _readRemoteWpCreds(sshConn, webRoot);
  if (!creds) {
    return _err('Database import failed: could not read remote wp-config.php credentials.');
  }

  const { host, port } = _getDbHostParts(creds.DB_HOST);
  const pwEnv = creds.DB_PASSWORD ? `MYSQL_PWD=${_q(creds.DB_PASSWORD)} ` : '';

  let out = '';
  let res = await sshConn.exec(
    `${pwEnv}mysql -h ${_q(host)} -P ${port} -u ${_q(creds.DB_USER)} ` +
    `${_q(creds.DB_NAME)} < ${_q(remoteSqlPath)} 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode === 0) {
    _emit('success', 'Database imported via mysql CLI', onLog);
    return _ok({ method: 'mysql-cli' });
  }

  const mysqlErr = out.trim().split('\n').slice(-3).join(' | ');
  _emit('warning', `  mysql CLI import failed: ${mysqlErr || `exit ${res.exitCode}`}`, onLog);
  _emit('info', '  Falling back to WP-CLI import…', onLog);

  out = '';
  res = await sshConn.exec(
    `wp db import ${_q(remoteSqlPath)} --path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode === 0) {
    _emit('success', 'Database imported via WP-CLI', onLog);
    return _ok({ method: 'wp-cli' });
  }

  const wpCliErr = out.trim().split('\n').slice(-3).join(' | ');
  return _err(
    'Database import failed.\n' +
    `mysql CLI error: ${mysqlErr || `exit ${res.exitCode}`}\n` +
    `WP-CLI error: ${wpCliErr || `exit ${res.exitCode}`}`
  );
}

async function _updateRemoteSiteUrlsViaMysql(sshConn, remoteWebRoot, productionDomain, onLog) {
  const webRoot = remoteWebRoot.replace(/\/$/, '');
  const creds = await _readRemoteWpCreds(sshConn, webRoot);

  if (!creds || !creds.TABLE_PREFIX) {
    return _err('Could not read remote DB credentials or table prefix for site URL fallback.');
  }

  const { host, port } = _getDbHostParts(creds.DB_HOST);
  const pwEnv = creds.DB_PASSWORD ? `MYSQL_PWD=${_q(creds.DB_PASSWORD)} ` : '';
  const optionsTable = _escapeMysqlIdentifier(`${creds.TABLE_PREFIX}options`);
  const escapedUrl = String(productionDomain).replace(/'/g, "''");
  const sql =
    `UPDATE ${optionsTable} ` +
    `SET option_value = '${escapedUrl}' ` +
    `WHERE option_name IN ('home','siteurl')`;

  let out = '';
  const res = await sshConn.exec(
    `${pwEnv}mysql -N -B -h ${_q(host)} -P ${port} -u ${_q(creds.DB_USER)} ` +
    `${_q(creds.DB_NAME)} -e ${_q(sql)} 2>&1`,
    (chunk) => { out += chunk; }
  );

  if (res.exitCode !== 0) {
    return _err(`MySQL site URL fallback failed (exit ${res.exitCode}): ${out.trim()}`);
  }

  _emit('success', `Fallback updated home/siteurl in ${creds.TABLE_PREFIX}options`, onLog);
  return _ok({ method: 'mysql-options-update' });
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
  const bareLocal = localDomain.replace(/^https?:\/\//, '');
  const localHttp = 'http://' + bareLocal;
  const localHttps = 'https://' + bareLocal;

  _emit('info', `  ${localHttp}  →  ${productionDomain}`, onLog);

  let outHttp = '';
  const resHttp = await sshConn.exec(
    `wp search-replace ${_q(localHttp)} ${_q(productionDomain)} ` +
    `--all-tables --precise --recurse-objects --skip-plugins --skip-themes ` +
    `--path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { outHttp += chunk; }
  );

  _emit('info', `  ${localHttps}  →  ${productionDomain}`, onLog);

  let outHttps = '';
  const resHttps = await sshConn.exec(
    `wp search-replace ${_q(localHttps)} ${_q(productionDomain)} ` +
    `--all-tables --precise --recurse-objects --skip-plugins --skip-themes ` +
    `--path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { outHttps += chunk; }
  );

  const summaryHttps = outHttps.trim().split('\n').filter(Boolean).slice(-3).join(' | ');

  if (resHttp.exitCode !== 0 && resHttps.exitCode !== 0) {
    _emit('warning', `WP-CLI search-replace failed (HTTP: exit ${resHttp.exitCode}, HTTPS: ${summaryHttps || `exit ${resHttps.exitCode}`})`, onLog);
    _emit('info', 'Falling back to direct MySQL update of home/siteurl only…', onLog);
    return _updateRemoteSiteUrlsViaMysql(sshConn, remoteWebRoot, productionDomain, onLog);
  }

  _emit('success', `search-replace (https context): ${summaryHttps}`, onLog);

  // Also upgrade bare http:// variant of production domain → https:// if applicable
  if (productionDomain.startsWith('https://')) {
    const httpProd = productionDomain.replace(/^https:\/\//, 'http://');
    let out2 = '';
    await sshConn.exec(
      `wp search-replace ${_q(httpProd)} ${_q(productionDomain)} ` +
      `--all-tables --precise --recurse-objects --skip-plugins --skip-themes ` +
      `--path=${_q(webRoot)} --allow-root 2>&1`,
      (chunk) => { out2 += chunk; }
    );
    // Non-fatal; log only if something changed
    const changed = out2.match(/\d+ replacements/);
    if (changed) _emit('info', `  http→https upgrade: ${changed[0]}`, onLog);
  }

  return _ok({ summary: summaryHttps });
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

  _emit('info', 'Flushing Elementor CSS cache…', onLog);
  let elOut = '';
  const elRes = await sshConn.exec(
    `wp elementor flush_css --path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { elOut += chunk; }
  );
  
  if (elRes.exitCode === 0) {
    _emit('success', 'Elementor CSS cache flushed', onLog);
  } else {
    _emit('warning', `Elementor CSS flush returned exit ${elRes.exitCode}.`, onLog);
  }

  _emit('info', 'Flushing SiteGround cache…', onLog);
  let sgOut = '';
  const sgRes = await sshConn.exec(
    `wp sg purge --path=${_q(webRoot)} --allow-root 2>&1`,
    (chunk) => { sgOut += chunk; }
  );

  if (sgRes.exitCode === 0) {
    _emit('success', 'SiteGround cache purged', onLog);
  } else {
    _emit('warning', `wp sg purge unavailable (sg-cachepress not active) — clearing file cache directly…`, onLog);
    // Delete the SG file cache directory directly (wp-content/cache/sgo-cache/)
    const fileCacheDir = webRoot.replace(/\/+$/, '') + '/wp-content/cache/sgo-cache/';
    let rmOut = '';
    const rmRes = await sshConn.exec(
      `rm -rf ${_q(fileCacheDir)} 2>&1 && echo "OK"`,
      (chunk) => { rmOut += chunk; }
    );
    if (rmRes.exitCode === 0 && rmOut.includes('OK')) {
      _emit('success', 'SiteGround file cache cleared', onLog);
    } else {
      _emit('warning', `File cache clear returned exit ${rmRes.exitCode}: ${rmOut.trim()}`, onLog);
    }
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
  importLocalDatabase,
  getLocalTablePrefix,
  runLocalSearchReplace,

  // Remote operations
  uploadSqlFile,
  backupRemoteDatabase,
  getRemoteTablePrefix,
  getRemoteStaleTablePrefixes,
  updateRemoteTablePrefix,
  dropRemoteTablesByPrefix,
  importRemoteDatabase,
  runSearchReplace,
  clearRemoteCache,
};


