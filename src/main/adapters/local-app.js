/**
 * LocalAppAdapter
 *
 * Single point of contact for all Local for WordPress API calls.
 * Local's internal API changes between versions. By routing every call
 * through this file, we guarantee that version-change blast radius is
 * limited to one place.
 *
 * If a Local API method is unavailable or changed, update ONLY this file.
 * All other services and IPC handlers call this adapter exclusively —
 * never @getflywheel/local directly.
 */

let _context = null;

/**
 * Called once from main/index.js with the context object Local provides.
 * @param {object} context
 */
function init(context) {
  _context = context;
}

/**
 * Safely attempt to get Local's service container.
 * Returns null if unavailable (older/newer Local version).
 */
function _getServiceContainer() {
  try {
    // Local >= 6 exposes this from the main-process module
    const { getServiceContainer } = require('@getflywheel/local/main');
    return getServiceContainer();
  } catch {
    return null;
  }
}

/**
 * Get all Local sites as a plain serialisable array.
 * Returns [] if unavailable.
 * @returns {Array<object>}
 */
function getAllSites() {
  try {
    const container = _getServiceContainer();
    if (!container) return [];
    const siteData = container.cradle.siteData;
    // getSites() returns an object keyed by siteId in most versions
    const sites = siteData.getSites ? siteData.getSites() : {};
    return Object.values(sites).map(_normaliseSite);
  } catch (err) {
    console.error('[SiteGroundDeploy] LocalAdapter.getAllSites failed:', err.message);
    return [];
  }
}

/**
 * Get a single Local site by ID.
 * Returns null if not found.
 * @param {string} siteId
 * @returns {object|null}
 */
function getSite(siteId) {
  try {
    const container = _getServiceContainer();
    if (!container) return null;
    const siteData = container.cradle.siteData;
    const site = siteData.getSiteById
      ? siteData.getSiteById(siteId)
      : siteData.getSites()[siteId];
    return site ? _normaliseSite(site) : null;
  } catch (err) {
    console.error('[SiteGroundDeploy] LocalAdapter.getSite failed:', err.message);
    return null;
  }
}

/**
 * Get the local-domain URL for a site (e.g. "http://mysite.local")
 * @param {string} siteId
 * @returns {string|null}
 */
function getSiteLocalDomain(siteId) {
  const site = getSite(siteId);
  if (!site) return null;
  return site.domain ? `http://${site.domain}` : null;
}

/**
 * Get the filesystem path to the WordPress installation root (contains wp-config.php).
 * This is one level above wp-content: {site.path}/app/public
 * @param {string} siteId
 * @returns {string|null}
 */
function getSiteWpPath(siteId) {
  const site = getSite(siteId);
  if (!site) return null;
  return site.path
    ? require('path').join(site.path, 'app', 'public')
    : null;
}

/**
 * Get the filesystem path to the site's wp-content folder.
 * @param {string} siteId
 * @returns {string|null}
 */
function getSiteWpContentPath(siteId) {
  const site = getSite(siteId);
  if (!site) return null;
  // Local stores the root path in site.path; wp-content is always at app/public
  return site.path
    ? require('path').join(site.path, 'app', 'public', 'wp-content')
    : null;
}

/**
 * Normalise a Local site object to a stable, serialisable shape.
 * Guards against API changes in what fields are present.
 * @param {object} raw
 * @returns {object}
 */
function _normaliseSite(raw) {
  return {
    id: raw.id || raw.siteId || null,
    name: raw.name || 'Unknown Site',
    domain: raw.domain || raw.localDomain || null,
    path: raw.path || raw.sitePath || null,
    phpVersion: raw.phpVersion || null,
    mysqlVersion: raw.mysqlVersion || null,
    mysqlPort: raw.services?.mysql?.ports?.MYSQL || null,
  };
}

/**
 * Get the TCP port Local's MySQL service is listening on for a site.
 * Reads from the site's live my.cnf config in Local's run directory.
 * This is guaranteed current even if sites.json is stale or ports were reassigned after a restart.
 * Returns null if unavailable (site not running, older Local version).
 * @param {string} siteId
 * @returns {string|null}
 */
function getSiteMysqlPort(siteId) {
  try {
    const { app } = require('electron');
    const fs = require('fs');
    const path = require('path');
    // Local stores per-run service config at %APPDATA%\Local\run\<siteId>\conf\mysql\my.cnf
    const cfgPath = path.join(app.getPath('userData'), '..', 'Local', 'run', siteId, 'conf', 'mysql', 'my.cnf');
    if (!fs.existsSync(cfgPath)) return null;

    const cfg = fs.readFileSync(cfgPath, 'utf8');
    // Match: port = 10026
    const m = cfg.match(/^\s*port\s*=\s*(\d+)/m);
    return m ? m[1] : null;
  } catch (err) {
    console.error('[SiteGroundDeploy] getSiteMysqlPort failed:', err.message);
    return null;
  }
}

module.exports = {
  init,
  getAllSites,
  getSite,
  getSiteLocalDomain,
  getSiteWpPath,
  getSiteWpContentPath,
  getSiteMysqlPort,
};
