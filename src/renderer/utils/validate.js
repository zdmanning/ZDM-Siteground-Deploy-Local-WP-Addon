/**
 * Validation utilities for the wizard connection form.
 * Returns a plain errors object: { fieldName: 'error message' }
 * An empty object means valid.
 */

/**
 * Validate the connection details collected in Step 3.
 * @param {object} data  wizard data object
 * @returns {object}     { fieldName: errorString } — empty if valid
 */
export function validateConnectionForm(data) {
  const errors = {};

  // Profile name
  if (!data.name?.trim()) {
    errors.name = 'Required.';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Must be at least 2 characters.';
  }

  // SSH host — basic hostname pattern, no protocol prefix
  if (!data.sshHost?.trim()) {
    errors.sshHost = 'Required.';
  } else if (/^https?:\/\//i.test(data.sshHost.trim())) {
    errors.sshHost = 'Enter the hostname only — no http:// prefix (e.g. sg-server-123.siteground.com).';
  } else if (!/^[a-zA-Z0-9]([a-zA-Z0-9\-\.]*[a-zA-Z0-9])?$/.test(data.sshHost.trim())) {
    errors.sshHost = 'Enter a valid hostname (e.g. sg-server-123.siteground.com).';
  }

  // SSH port
  const port = Number(data.sshPort);
  if (!data.sshPort && data.sshPort !== 0) {
    errors.sshPort = 'Required. SiteGround uses port 18765.';
  } else if (isNaN(port) || port < 1 || port > 65535) {
    errors.sshPort = 'Must be a number between 1–65535. SiteGround default is 18765.';
  }

  // SSH username
  if (!data.sshUser?.trim()) {
    errors.sshUser = 'Required.';
  }

  // Remote web root — must be an absolute path
  if (!data.remoteWebRoot?.trim()) {
    errors.remoteWebRoot = 'Required.';
  } else if (!data.remoteWebRoot.trim().startsWith('/')) {
    errors.remoteWebRoot =
      'Must be an absolute Unix path starting with / ' +
      '(e.g. /home/customer/www/example.com/public_html).';
  }

  // Production domain — must be a valid http/https URL
  if (!data.productionDomain?.trim()) {
    errors.productionDomain = 'Required.';
  } else {
    try {
      const url = new URL(data.productionDomain.trim());
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.productionDomain = 'Must start with https:// (e.g. https://example.com).';
      }
    } catch {
      errors.productionDomain =
        'Enter a valid URL including the protocol (e.g. https://example.com).';
    }
  }

  return errors;
}

/**
 * Returns true if the errors object has no entries.
 * @param {object} errors
 * @returns {boolean}
 */
export function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}
