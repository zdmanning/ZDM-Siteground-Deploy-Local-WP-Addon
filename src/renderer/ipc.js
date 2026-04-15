/**
 * IPC Bridge
 *
 * Thin wrapper around Electron's ipcRenderer.invoke / ipcRenderer.on.
 * All renderer-to-main communication goes through this module.
 * Never call ipcRenderer directly outside of this file.
 */

// Use require() — not window.require() — so webpack's external config resolves
// this to Electron's real ipcRenderer (same as the reference add-on pattern).
// eslint-disable-next-line import/no-commonjs
const { ipcRenderer } = require('electron');

// ─── Profiles ─────────────────────────────────────────────────────────────────

/** Returns { success, data: Array<profile> } */
export const listProfiles    = ()          => ipcRenderer.invoke('sgd:profiles:list');
/** Returns { success, data: profile } */
export const getProfile      = (id)        => ipcRenderer.invoke('sgd:profiles:get', id);
/** Returns { success, data: profile } | { success: false, error, errors? } */
export const createProfile   = (data)      => ipcRenderer.invoke('sgd:profiles:create', data);
/** Returns { success, data: profile } | { success: false, error, errors? } */
export const updateProfile   = (id, patch) => ipcRenderer.invoke('sgd:profiles:update', id, patch);
/** Legacy wizard save — routes to create or update internally */
export const saveProfile     = (profile)   => ipcRenderer.invoke('sgd:profiles:save', profile);
/** Returns { success, data: { deleted: true } } */
export const deleteProfile   = (id)        => ipcRenderer.invoke('sgd:profiles:delete', id);
/** Returns { valid, errors } — no write */
export const validateProfile = (data, isUpdate) => ipcRenderer.invoke('sgd:profiles:validate', data, isUpdate);

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const generateKey           = (keyId) => ipcRenderer.invoke('sgd:keys:generate', keyId);
export const getPublicKey          = (keyId) => ipcRenderer.invoke('sgd:keys:getPublic', keyId);
export const keyExists             = (keyId) => ipcRenderer.invoke('sgd:keys:exists',    keyId);
export const deleteKey             = (keyId) => ipcRenderer.invoke('sgd:keys:delete',    keyId);
export const deleteOrphanedKeys    = ()      => ipcRenderer.invoke('sgd:keys:deleteOrphaned');

// ─── SSH ──────────────────────────────────────────────────────────────────────

/**
 * Test SSH using a saved profile ID (used from profile detail view).
 */
export const testSSHConnection = (profileId) =>
  ipcRenderer.invoke('sgd:ssh:test', profileId);

/**
 * Test SSH using raw profile data — no save required.
 * Used during the wizard so we can test before committing to storage.
 * @param {object} profileData  wizard data object with sshHost, sshPort, etc.
 */
export const testSSHConnectionDirect = (profileData) =>
  ipcRenderer.invoke('sgd:ssh:test:direct', profileData);

// ─── Deploy ───────────────────────────────────────────────────────────────────

export const deployPreflight = (profileId, targets) =>
  ipcRenderer.invoke('sgd:deploy:preflight', profileId, targets);

export const runCodeDeploy = (profileId, options) =>
  ipcRenderer.invoke('sgd:deploy:code', profileId, options);

export const runFullDeploy = (profileId, options) =>
  ipcRenderer.invoke('sgd:deploy:full', profileId, options);

export const cancelDeploy = (profileId) =>
  ipcRenderer.invoke('sgd:deploy:cancel', profileId);

export const deleteRemoteBackups = (profileId) =>
  ipcRenderer.invoke('sgd:deploy:delete-backups', profileId);

// ─── Logs ─────────────────────────────────────────────────────────────────────

export const getLogs       = (profileId)        => ipcRenderer.invoke('sgd:logs:list', profileId);
export const clearLogs     = (profileId)        => ipcRenderer.invoke('sgd:logs:clear', profileId);
export const getRuns       = (profileId)        => ipcRenderer.invoke('sgd:logs:runs', profileId);
export const getRunEntries = (profileId, runId) => ipcRenderer.invoke('sgd:logs:run-entries', profileId, runId);

/**
 * Subscribe to real-time log entries streamed during a deploy.
 * Returns an unsubscribe function.
 *
 * @param {function} callback - called with each log entry
 * @returns {function} unsubscribe
 */
export function onLogEntry(callback) {
  const handler = (_event, entry) => callback(entry);
  ipcRenderer.on('sgd:log:entry', handler);
  return () => ipcRenderer.removeListener('sgd:log:entry', handler);
}

// ─── Local sites ──────────────────────────────────────────────────────────────

export const getAllLocalSites = () => ipcRenderer.invoke('sgd:local:sites');
export const getLocalSite = (siteId) => ipcRenderer.invoke('sgd:local:site', siteId);
export const repairLocalSiteMysql = (siteId) => ipcRenderer.invoke('sgd:local:mysql:repair', siteId);

