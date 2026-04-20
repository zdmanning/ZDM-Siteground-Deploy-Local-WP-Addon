/**
 * SettingsStore
 *
 * Persists global addon settings using electron-store (JSON on disk).
 *
 * Storage location (Windows):
 *   %APPDATA%\Local\siteground-deploy\settings.json
 *
 * Settings shape:
 * {
 *   confirmDefault: boolean   Whether the danger-zone checkbox is pre-checked by
 *                             default on the deploy screen. Per-profile overrides
 *                             take precedence over this value.
 *                             Default: false (unchecked — safer out-of-the-box).
 * }
 */

'use strict';

const Store = require('electron-store');

const store = new Store({
  name: 'siteground-deploy-settings',
  schema: {
    confirmDefault: {
      type: 'boolean',
      default: false,
    },
  },
  defaults: {
    confirmDefault: false,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _ok(data)  { return { success: true,  data }; }
function _err(msg)  { return { success: false, error: msg }; }

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Return all settings as a plain object.
 * @returns {{ success: true, data: object }}
 */
function getSettings() {
  return _ok({
    confirmDefault: store.get('confirmDefault', false),
  });
}

/**
 * Partially update settings. Only recognised keys are written.
 * @param {object} patch
 * @returns {{ success: true, data: object } | { success: false, error: string }}
 */
function updateSettings(patch) {
  if (!patch || typeof patch !== 'object') {
    return _err('patch must be a non-null object.');
  }

  if ('confirmDefault' in patch) {
    if (typeof patch.confirmDefault !== 'boolean') {
      return _err('confirmDefault must be a boolean.');
    }
    store.set('confirmDefault', patch.confirmDefault);
  }

  return getSettings();
}

module.exports = { getSettings, updateSettings };
