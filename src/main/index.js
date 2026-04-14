/**
 * Main process entry point.
 *
 * Local calls this with a `context` object that exposes:
 *   context.electron     – the Electron module
 *   context.app          – the Local app instance (version-specific, use adapter)
 *
 * All IPC handlers are registered here. Real logic lives in service modules.
 */

const { ipcMain } = require('electron');
const localAdapter = require('./adapters/local-app');
const profileStore = require('./services/profile-store');
const keyManager = require('./services/key-manager');
const sshService = require('./services/ssh-service');
const deployService = require('./services/deploy-service');
const logger = require('./services/logger');

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
      const { id, ...patch } = profile;
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
      user: profile.sshUser,
    });

    const result = await sshService.testConnection(profile);

    logger.appendEntry(profileId, {
      level:      result.success ? 'success' : 'error',
      runId,
      actionType: 'connection_test',
      message:    result.success
        ? `Connected to ${result.data.host} as ${result.data.user}`
        : `Connection failed: ${result.error}`,
      metadata: result.success
        ? { host: result.data.host, output: result.data.output }
        : { error: result.error },
    });

    logger.finishRun(
      profileId, runId,
      result.success ? 'success' : 'failure',
      result.success ? { host: result.data.host } : { error: result.error }
    );

    return result;
  });

  // Test SSH without a saved profile — accepts raw profile data from the wizard.
  // Only sshHost, sshPort, sshUser, and keyId are used; all other fields are ignored.
  ipcMain.handle('sgd:ssh:test:direct', async (_e, profileData) => {
    if (!profileData || !profileData.sshHost || !profileData.sshUser || !profileData.keyId) {
      return { success: false, error: 'SSH host, username, and key ID are required.' };
    }
    const safe = {
      sshHost: profileData.sshHost,
      sshPort: profileData.sshPort,
      sshUser: profileData.sshUser,
      keyId:   profileData.keyId,
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
    return deployService.runCodeDeploy(profileResult.data, options, (entry) => {
      event.sender.send('sgd:log:entry', entry);
    });
  });

  ipcMain.handle('sgd:deploy:full', async (event, profileId, options) => {
    const profileResult = profileStore.getProfileById(profileId);
    if (!profileResult.success) return profileResult;
    return deployService.runFullDeploy(profileResult.data, options, (entry) => {
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
