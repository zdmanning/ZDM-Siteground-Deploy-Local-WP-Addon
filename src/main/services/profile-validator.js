/**
 * ProfileValidator
 *
 * Pure validation helpers for profile data.
 * No I/O — takes a plain object, returns a structured result.
 * Used by ProfileStore before any write, and can be called from IPC handlers
 * to give the renderer early feedback without touching storage.
 *
 * Every function returns:
 *   { valid: boolean, errors: { [field]: string } }
 */

'use strict';

// ─── Field rules ──────────────────────────────────────────────────────────────

const RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 80,
    label: 'Profile name',
  },
  sshHost: {
    required: true,
    label: 'SSH host',
    test(v) {
      // Reject URLs — host only, no protocol
      if (/^https?:\/\//i.test(v)) return 'Enter a hostname only, not a URL (remove "https://").';
      // Rough hostname/IP check
      if (!/^[a-z0-9]([a-z0-9\-\.]*[a-z0-9])?$/i.test(v)) return 'Must be a valid hostname or IP address.';
      return null;
    },
  },
  sshPort: {
    required: true,
    label: 'SSH port',
    test(v) {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1 || n > 65535) return 'Must be a number between 1 and 65535.';
      return null;
    },
  },
  sshUser: {
    required: true,
    minLength: 1,
    maxLength: 64,
    label: 'SSH username',
  },
  remoteWebRoot: {
    required: true,
    label: 'Remote web root',
    test(v) {
      if (!v.startsWith('/')) return 'Must be an absolute path starting with "/".';
      if (v.includes('..'))   return 'Must not contain "..".';
      return null;
    },
  },
  keyId: {
    required: true,
    label: 'Key ID',
    test(v) {
      // uuid v4 pattern
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)) {
        return 'Must be a valid UUID v4.';
      }
      return null;
    },
  },
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _checkField(field, value) {
  const rule = RULES[field];
  if (!rule) return null;

  const str = value === undefined || value === null ? '' : String(value).trim();

  if (rule.required && str.length === 0) {
    return `${rule.label} is required.`;
  }

  if (str.length > 0) {
    if (rule.minLength && str.length < rule.minLength) {
      return `${rule.label} must be at least ${rule.minLength} characters.`;
    }
    if (rule.maxLength && str.length > rule.maxLength) {
      return `${rule.label} must be ${rule.maxLength} characters or fewer.`;
    }
    if (rule.test) {
      const msg = rule.test(str);
      if (msg) return msg;
    }
  }

  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validate a complete profile object before create or update.
 *
 * @param {object} data                - raw profile data from caller
 * @param {{ isUpdate?: boolean }} opts - if isUpdate, only validates fields that are present
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
function validateProfile(data, { isUpdate = false } = {}) {
  const errors = {};

  const fields = Object.keys(RULES);

  for (const field of fields) {
    // On updates, skip fields that were not supplied
    if (isUpdate && !(field in data)) continue;

    const msg = _checkField(field, data[field]);
    if (msg) errors[field] = msg;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate a partial profile for update operations.
 * Only validates fields actually present in the patch object.
 *
 * @param {object} patch
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
function validateProfilePatch(patch) {
  return validateProfile(patch, { isUpdate: true });
}

/**
 * Validate a single field in isolation.
 * Useful for real-time form feedback in the renderer.
 *
 * @param {string} field
 * @param {*}      value
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateField(field, value) {
  const msg = _checkField(field, value);
  return { valid: !msg, error: msg };
}

module.exports = {
  validateProfile,
  validateProfilePatch,
  validateField,
};




