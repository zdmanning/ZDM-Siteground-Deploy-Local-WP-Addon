/**
 * DatabaseService
 *
 * Handles local database export (via WP-CLI or direct mysqldump fallback)
 * and remote database operations (backup, import, search-replace).
 *
 * This module is called exclusively by DeployService — it is never exposed
 * to the renderer process.
 */

const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const localAdapter = require('../adapters/local-app');

/**
 * Export the local site database to a temporary SQL file.
 * Tries WP-CLI first, falls back to direct mysqldump.
 *
 * @param {string} siteId      - Local site ID
 * @param {string} destDir     - Directory to write the .sql file into
 * @returns {Promise<string>}  - Absolute path to the exported .sql file
 */
async function exportLocalDatabase(siteId, destDir) {
  // TODO: implement via WP-CLI / mysqldump using localAdapter to get DB creds
  const timestamp = Date.now();
  const outPath = path.join(destDir, `deploy-export-${timestamp}.sql`);
  console.log('[DatabaseService] exportLocalDatabase stub — would write to:', outPath);
  // Write a placeholder file so SFTP upload code can be tested independently
  fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(outPath, '-- SQL EXPORT PLACEHOLDER\n', 'utf8');
  return outPath;
}

/**
 * Create a remote database backup via mysqldump over SSH.
 * ALWAYS runs before any import — not skippable.
 *
 * @param {object} sshHandle   - open SSH connection handle from ssh-service
 * @param {object} remoteDbConfig  - { user, password, database, backupDir }
 * @param {function} onLog
 * @returns {Promise<string>}  - Remote path to the backup file
 */
async function backupRemoteDatabase(sshHandle, remoteDbConfig, onLog) {
  // TODO: implement real remote mysqldump
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${remoteDbConfig.backupDir}/pre-deploy-${timestamp}.sql`;
  onLog && onLog({ level: 'info', message: `Remote backup target: ${backupPath}`, timestamp: new Date().toISOString() });
  console.log('[DatabaseService] backupRemoteDatabase stub — backup path:', backupPath);
  return backupPath;
}

/**
 * Import a SQL file into the remote database via SSH mysql command.
 *
 * @param {object} sshHandle
 * @param {string} remoteSqlPath  - Path to already-uploaded SQL file on remote
 * @param {object} remoteDbConfig - { user, password, database }
 * @param {function} onLog
 * @returns {Promise<void>}
 */
async function importRemoteDatabase(sshHandle, remoteSqlPath, remoteDbConfig, onLog) {
  // TODO: implement real remote import
  onLog && onLog({ level: 'info', message: `Would import ${remoteSqlPath} into ${remoteDbConfig.database}`, timestamp: new Date().toISOString() });
  console.log('[DatabaseService] importRemoteDatabase stub');
}

/**
 * Run wp search-replace to swap the local domain for the production domain.
 *
 * @param {object} sshHandle
 * @param {string} remoteWebRoot
 * @param {string} localDomain        - e.g. "http://mysite.local"
 * @param {string} productionDomain   - e.g. "https://example.com"
 * @param {function} onLog
 * @returns {Promise<void>}
 */
async function runSearchReplace(sshHandle, remoteWebRoot, localDomain, productionDomain, onLog) {
  // TODO: implement real wp search-replace via ssh
  onLog && onLog({
    level: 'info',
    message: `Would run: wp search-replace '${localDomain}' '${productionDomain}' --all-tables`,
    timestamp: new Date().toISOString(),
  });
  console.log('[DatabaseService] runSearchReplace stub');
}

module.exports = {
  exportLocalDatabase,
  backupRemoteDatabase,
  importRemoteDatabase,
  runSearchReplace,
};
