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

const logger = require('./logger');

/**
 * @param {string} level
 * @param {string} message
 * @param {function} onLog
 */
function _emit(level, message, onLog) {
  const entry = { level, message, timestamp: new Date().toISOString() };
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
  return { success: false, error: 'Code deploy not yet implemented' };
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
    return { success: false, error: 'Deploy cancelled — confirmation not provided.' };
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
  return { success: false, error: 'Full deploy not yet implemented' };
}

module.exports = {
  runCodeDeploy,
  runFullDeploy,
};
