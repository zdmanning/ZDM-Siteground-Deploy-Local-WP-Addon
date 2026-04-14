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

const Store = require('electron-store');

const store = new Store({
  name: 'siteground-deploy-logs',
  defaults: { logs: {} },
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
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  appendEntry,
  getLog,
  clearLog,
  markDeployRun,
};
