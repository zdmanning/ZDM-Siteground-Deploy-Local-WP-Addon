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
    const profile = profileStore.getProfile(profileId);
    if (!profile) return { success: false, error: 'Profile not found.' };
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
    return deployService.runCodeDeploy(profile, options, (entry) => {
      event.sender.send('sgd:log:entry', entry);
    });
  });

  ipcMain.handle('sgd:deploy:full', async (event, profileId, options) => {
    const profile = profileStore.getProfile(profileId);
    return deployService.runFullDeploy(profile, options, (entry) => {
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
