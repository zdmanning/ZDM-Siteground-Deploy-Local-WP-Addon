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

const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');

const store = new Store({
  name: 'siteground-deploy-profiles',
  defaults: { profiles: [] },
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
  return profiles.find((p) => p.id === id) || null;
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
    const idx = profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...profile };
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
    createdAt: new Date().toISOString(),
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
  const idx = profiles.findIndex((p) => p.id === id);
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
  const next = profiles.filter((p) => p.id !== id);
  store.set('profiles', next);
  return next.length < profiles.length;
}

module.exports = {
  listProfiles,
  getProfile,
  saveProfile,
  markDeployed,
  deleteProfile,
};
