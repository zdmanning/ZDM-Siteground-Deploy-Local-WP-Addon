/**
 * DeployService
 *
 * Orchestrates the code-only deployment pipeline for SiteGround Deploy.
 *
 * ── Code-only deploy flow ───────────────────────────────────────────────────
 *   1.  Validate inputs (profile has localSiteId, source dirs exist locally)
 *   2.  Build source items from options.targets
 *   3.  Create a zip archive of selected directories (archiver-service)
 *   4.  Upload the archive via SFTP to a temp dir on the remote server
 *   5.  SSH: unzip the archive into the same temp dir
 *   6.  SSH: rsync (fallback: rm+cp) each target dir to the remote web root
 *   7.  SSH: delete the remote temp dir
 *   8.  Local: delete the local temp archive
 *   9.  Mark the profile's lastDeployedAt timestamp
 *
 * ── Remote temp dir layout ──────────────────────────────────────────────────
 *   /tmp/sgd-deploy-{runId}/
 *     deploy.zip           ← uploaded archive
 *     themes/              ← extracted by unzip
 *     plugins/
 *     ...
 *
 * ── Remote sync command ─────────────────────────────────────────────────────
 *   Prefers rsync (available on all SiteGround plans).
 *   Falls back to rm -rf + cp -rp for servers that don't have rsync.
 *
 *   rsync -az --delete --exclude='.git' \
 *     '/tmp/sgd-deploy-xxx/themes/' '/remote/web/root/wp-content/themes/'
 *
 * ── Log entry shape ─────────────────────────────────────────────────────────
 *   { level: 'info'|'success'|'warning'|'error', message: string, timestamp: ISO }
 *   Callbacks are called in real time and entries are also persisted to disk.
 */

'use strict';

const path   = require('path');
const fs     = require('fs');
const os     = require('os');
const { v4: uuidv4 } = require('uuid');

const localAdapter  = require('../adapters/local-app');
const archiverSvc    = require('./archiver-service');
const sftpSvc        = require('./sftp-service');
const sshService     = require('./ssh-service');
const dbSvc          = require('./database-service');
const profileStore   = require('./profile-store');
const settingsStore  = require('./settings-store');
const logger         = require('./logger');

// ─── Supported deploy targets ──────────────────────────────────────────────────
// key   = what the user / UI passes in options.targets[]
// value = subdir name under wp-content (local and remote)
const KNOWN_TARGETS = {
  themes:        'themes',
  plugins:       'plugins',
  'mu-plugins':  'mu-plugins',
  uploads:       'uploads',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _ok(data)   { return { success: true,  data  }; }
function _err(error) { return { success: false, error }; }

function _emit(level, message, onLog, profileId, extra) {
  const entry = { level, message, timestamp: new Date().toISOString(), ...extra };
  onLog && onLog(entry);
  logger.appendEntry(profileId || null, entry);
}

/** Human-readable byte size string. */
function _fmt(bytes) {
  if (bytes < 1024)             return `${bytes} B`;
  if (bytes < 1024 * 1024)      return `${(bytes / 1024).toFixed(1)} KB`;
  return                               `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Quote a remote path for safe inclusion in a shell command.
 * Wraps in single quotes and escapes embedded single quotes.
 */
function _q(p) {
  return "'" + String(p).replace(/'/g, "'\\''") + "'";
}

// ─── Cancellation ────────────────────────────────────────────────────────────────

class DeployCancelledError extends Error {
  constructor() {
    super('Deploy cancelled by user');
    this.name = 'DeployCancelledError';
  }
}

function makeToken() {
  let rejectFn = null;
  const cancelPromise = new Promise((_, reject) => { rejectFn = reject; });
  return {
    isCancelled:   false,
    cancelPromise,
    cancel() {
      this.isCancelled = true;
      if (rejectFn) rejectFn(new DeployCancelledError());
    },
  };
}

/** One active deploy token per profile. Maps profileId → token. */
const activeDeployTokens = new Map();

// ─── Preflight ────────────────────────────────────────────────────────────────

/**
 * Return metadata about a planned deployment without actually running it.
 * The renderer calls this to populate the deploy configuration screen.
 *
 * @param {string}   profileId
 * @param {string[]} targets   e.g. ['themes', 'plugins']
 * @returns {{
 *   success: true,
 *   data: {
 *     profileId, profileName,
 *     localSiteId, localSiteName, wpContentPath, wpContentReachable,
 *     remoteWebRoot, sshHost,
 *     targets: Array<{ target, localPath, localExists, remotePath }>
 *   }
 * } | { success: false, error: string }}
 */
function getPreflightInfo(profileId, targets) {
  const profileResult = profileStore.getProfileById(profileId);
  if (!profileResult.success) return profileResult;

  const profile        = profileResult.data;
  const siteId         = profile.localSiteId || null;
  const site           = siteId ? localAdapter.getSite(siteId) : null;
  const wpContentPath  = siteId ? localAdapter.getSiteWpContentPath(siteId) : null;

  const requestedTargets = Array.isArray(targets) && targets.length > 0
    ? targets
    : ['themes', 'plugins'];

  const resolvedTargets = requestedTargets.map((target) => {
    const subDir    = KNOWN_TARGETS[target] || target;
    const localPath = wpContentPath ? path.join(wpContentPath, subDir) : null;
    const remoteBase = (profile.remoteWebRoot || '').replace(/\/$/, '');
    const remotePath = remoteBase ? `${remoteBase}/wp-content/${subDir}` : null;

    return {
      target,
      localPath,
      localExists: localPath ? fs.existsSync(localPath) : false,
      remotePath,
    };
  });

  // Discover all subdirectories in wp-content (used for full deploy exclusion UI)
  let wpContentDirs = [];
  const wpContentReachable = wpContentPath ? fs.existsSync(wpContentPath) : false;
  if (wpContentReachable) {
    try {
      wpContentDirs = fs.readdirSync(wpContentPath, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort();
    } catch (_) { /* non-fatal */ }
  }

  return _ok({
    profileId,
    profileName:           profile.name,
    localSiteId:           siteId,
    localSiteName:         site ? site.name : null,
    wpContentPath:         wpContentPath,
    wpContentReachable,
    wpContentDirs,
    remoteWebRoot:         profile.remoteWebRoot,
    productionDomain:      profile.productionDomain || null,
    sshHost:               `${profile.sshHost}:${profile.sshPort || 18765}`,
    targets:               resolvedTargets,
    resolvedConfirmDefault: (() => {
      // Per-profile override takes priority; null means fall back to global.
      if (profile.confirmDefault !== null && profile.confirmDefault !== undefined) {
        return Boolean(profile.confirmDefault);
      }
      const globalSettings = settingsStore.getSettings();
      return globalSettings.success ? Boolean(globalSettings.data.confirmDefault) : false;
    })(),
  });
}

// ─── Code-only deploy ─────────────────────────────────────────────────────────

/**
 * Run a code-only deployment.
 *
 * @param {object}   profile              Saved profile (raw object, not envelope).
 * @param {object}   options
 * @param {string[]} [options.targets]    Default: ['themes', 'plugins']
 * @param {function} onLog               Real-time log entry callback.
 * @returns {Promise<
 *   { success: true,  data: { runId: string, targets: string[] } } |
 *   { success: false, error: string }
 * >}
 */
async function runCodeDeploy(profile, options = {}, onLog) {
  const pid   = profile.id || null;
  const runId = uuidv4();
  const emit  = (lvl, msg, meta) =>
    _emit(lvl, msg, onLog, pid, { runId, actionType: 'code_deploy', profileId: pid, ...(meta && { metadata: meta }) });

  let sshConn      = null;
  let remoteTempDir = null;
  let _outcome     = 'failure';
  let _outcomeMeta = null;

  const token = makeToken();
  if (pid) activeDeployTokens.set(pid, token);

  logger.startRun(pid, 'code_deploy', runId, {
    host: `${profile.sshHost}:${profile.sshPort || 18765}`,
  });

  try {
    emit('info', `── Code deploy started ── ${profile.name} ──`);
    emit('info', `Run ID: ${runId.slice(0, 8)}`);

    // ── 1. Resolve local wp-content ──────────────────────────────────────────
    if (!profile.localSiteId) {
      return _err(
        'This profile is not linked to a Local site. ' +
        'Profiles created before deploy support was added may need to be recreated, ' +
        'or delete and re-run the setup wizard.'
      );
    }

    const wpContentPath = localAdapter.getSiteWpContentPath(profile.localSiteId);
    if (!wpContentPath || !fs.existsSync(wpContentPath)) {
      return _err(
        `Local wp-content directory not found: ${wpContentPath || '(unknown)'}. ` +
        'Make sure the Local site is present and the site path has not been moved.'
      );
    }

    // Normalise and validate early — Windows users may type backslashes.
    const remoteWebRootVal = (profile.remoteWebRoot || '').replace(/\\/g, '/').replace(/\/$/, '');
    if (!remoteWebRootVal || !remoteWebRootVal.startsWith('/')) {
      return _err(
        'Remote web root is not set or is not a valid absolute path. ' +
        'It must start with "/" (e.g. /home/username/public_html). ' +
        'Edit the profile and try again.'
      );
    }

    emit('info', `Local wp-content: ${wpContentPath}`);
    emit('info', `Remote web root:  ${remoteWebRootVal}`);

    // ── 2. Build source items ────────────────────────────────────────────────
    // options.paths takes priority (specific sub-paths like 'plugins/woocommerce').
    // Falls back to options.targets (top-level dir names like 'plugins').
    const sourceItems = [];

    if (Array.isArray(options.paths) && options.paths.length > 0) {
      for (const relPath of options.paths) {
        // Sanitise: must be a relative path with no traversal
        const normalised = relPath.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
        if (!normalised || normalised.includes('..')) {
          emit('warning', `Skipping invalid path: "${relPath}"`);
          continue;
        }
        const localPath = path.join(wpContentPath, ...normalised.split('/'));
        if (!fs.existsSync(localPath)) {
          emit('warning', `Skipping "${normalised}" — not found at ${localPath}`);
          continue;
        }
        sourceItems.push({ localPath, archiveName: normalised });
        emit('info', `  ✓ Queued: ${normalised}`);
      }
    } else {
      const requestedTargets = Array.isArray(options.targets) && options.targets.length > 0
        ? options.targets
        : ['themes', 'plugins'];

      for (const target of requestedTargets) {
        const subDir    = KNOWN_TARGETS[target] || target;
        const localPath = path.join(wpContentPath, subDir);
        if (!fs.existsSync(localPath)) {
          emit('warning', `Skipping "${target}" — not found at ${localPath}`);
          continue;
        }
        sourceItems.push({ localPath, archiveName: subDir });
        emit('info', `  ✓ Queued: ${target}`);
      }
    }

    if (sourceItems.length === 0) {
      return _err(
        'None of the selected directories exist on disk. Nothing to deploy.\n' +
        'Check that the Local site has wp-content/themes and wp-content/plugins.'
      );
    }

    // ── 3. Create local archive ──────────────────────────────────────────────
    const archiveFormat    = (options.format === 'tar') ? 'tar' : 'zip';
    const localArchivePath = archiverSvc.getTempArchivePath(runId, archiveFormat);
    emit('info', `Creating ${archiveFormat.toUpperCase()} archive…`);

    // Build exclude list — .git and .vscode are excluded unless the profile
    // explicitly opts in via deployIncludeGit / deployIncludeVscode.
    const excludeFolders = [];
    if (!profile.deployIncludeGit)    excludeFolders.push('.git');
    if (!profile.deployIncludeVscode) excludeFolders.push('.vscode');

    let lastLoggedBucket = -1;
    const archiveResult = await archiverSvc.createArchive(
      sourceItems,
      localArchivePath,
      archiveFormat,
      ({ bytes, total }) => {
        if (total > 0) {
          const bucket = Math.floor((bytes / total) * 4);
          if (bucket > lastLoggedBucket) {
            lastLoggedBucket = bucket;
            emit('info', `  Archiving… ${_fmt(bytes)} / ${_fmt(total)}`);
          }
        }
      },
      excludeFolders
    );

    if (!archiveResult.success) {
      return _err(`Archive step failed: ${archiveResult.error}`);
    }
    if (!archiveResult.data.sizeBytes) {
      return _err(
        'Archive was created but is empty — no files were added. ' +
        'Check that the selected local wp-content directories exist and are not empty.'
      );
    }

    emit('success', `${archiveFormat.toUpperCase()} archive ready: ${_fmt(archiveResult.data.sizeBytes)}`);
    if (token.isCancelled) throw new DeployCancelledError();

    // ── 4. Upload archive via SFTP ───────────────────────────────────────────
    remoteTempDir               = `/tmp/sgd-deploy-${runId}`;
    const remoteArchiveFile     = `deploy.${archiveFormat}`;
    const remoteArchivePath     = `${remoteTempDir}/${remoteArchiveFile}`;

    emit('info', `Uploading to ${profile.sshHost}…`);
    let lastPct = -1;

    const uploadResult = await Promise.race([
      sftpSvc.uploadFile(
        profile,
        localArchivePath,
        remoteArchivePath,
        ({ bytes, total, percent }) => {
          const band = Math.floor(percent / 25) * 25;
          if (band > lastPct) {
            lastPct = band;
            emit('info', `  Upload: ${percent}% (${_fmt(bytes)} / ${_fmt(total)})`);
          }
        },
        token
      ),
      token.cancelPromise,
    ]);

    if (!uploadResult.success) {
      return _err(`Upload failed: ${uploadResult.error}`);
    }

    emit('success', `Archive uploaded to ${remoteArchivePath}`);

    // ── 5. Open SSH exec connection ──────────────────────────────────────────
    emit('info', 'Opening SSH connection…');
    const connResult = await sshService.openConnection(profile);
    if (!connResult.success) {
      return _err(`SSH connection failed: ${connResult.error}`);
    }

    sshConn = connResult.data;
    emit('success', 'SSH connection open');

    // ── 6. Extract archive on remote ─────────────────────────────────────────
    if (token.isCancelled) throw new DeployCancelledError();
    emit('info', 'Extracting archive on remote…');
    let unzipOut = '';
    const extractCmd = archiveFormat === 'tar'
      ? `mkdir -p ${_q(remoteTempDir)} && tar xf ${_q(remoteArchivePath)} -C ${_q(remoteTempDir)} 2>&1`
      : `unzip -o -d ${_q(remoteTempDir)} ${_q(remoteArchivePath)} 2>&1`;
    const unzipResult = await Promise.race([
      sshConn.exec(extractCmd, (chunk) => { unzipOut += chunk; }),
      token.cancelPromise,
    ]);

    if (unzipResult.exitCode !== 0) {
      const tail = unzipOut.trim().split('\n').slice(-5).join('\n');
      return _err(
        `Remote extraction failed (exit ${unzipResult.exitCode}):\n${tail || 'unzip returned a non-zero exit code'}`
      );
    }

    emit('success', 'Archive extracted');

    // ── 7. Sync each target dir to remote web root ───────────────────────────
    const remoteWebRoot = remoteWebRootVal;

    for (const item of sourceItems) {
      if (token.isCancelled) throw new DeployCancelledError();
      const target  = item.archiveName;
      const srcDir  = `${remoteTempDir}/${target}`;
      const destDir = `${remoteWebRoot}/wp-content/${target}`;
      const destParent = path.posix.dirname(destDir);

      emit('info', `Syncing ${target}…`);

      const rsyncExcludes = excludeFolders.map((f) => `--exclude=${_q(f)}`).join(' ');
      const syncCmd = [
        // Ensure parent dir exists (needed when syncing sub-paths like plugins/woocommerce)
        `mkdir -p ${_q(destParent)};`,
        `if command -v rsync > /dev/null 2>&1; then`,
        `  rsync -az --delete ${rsyncExcludes} ${_q(srcDir + '/')} ${_q(destDir + '/')};`,
        `else`,
        `  rm -rf ${_q(destDir)} && cp -rp ${_q(srcDir)} ${_q(destParent + '/')};`,
        `fi`,
      ].join(' ');

      let syncOut = '';
      const syncResult = await Promise.race([
        sshConn.exec(syncCmd, (chunk) => { syncOut += chunk; }),
        token.cancelPromise,
      ]);

      if (syncResult.exitCode !== 0) {
        return _err(
          `Sync failed for "${target}" (exit ${syncResult.exitCode}):\n${syncOut.trim()}`
        );
      }

      emit('success', `  ✓ ${target} → ${destDir}`);
    }

    // ── 8. Flush remote caches ────────────────────────────────────────────────
    await dbSvc.clearRemoteCache(sshConn, remoteWebRoot, (entry) => emit(entry.level, entry.message));

    // ── 9. Remote cleanup ────────────────────────────────────────────────────
    emit('info', 'Cleaning up remote temp files…');
    await sshConn.exec(`rm -rf ${_q(remoteTempDir)}`);
    emit('info', 'Remote cleanup complete');

    // ── 10. Mark deployed ────────────────────────────────────────────────────
    if (pid) {
      profileStore.markDeployed(pid);
    }

    emit('success', `── Deploy complete! (${sourceItems.map((i) => i.archiveName).join(', ')}) ──`);
    _outcome     = 'success';
    _outcomeMeta = { targets: sourceItems.map((i) => i.archiveName) };
    return _ok({ runId, targets: sourceItems.map((i) => i.archiveName) });

  } catch (err) {
    if (err instanceof DeployCancelledError) {
      emit('warning', '── Deploy cancelled by user ──');
      _outcome     = 'cancelled';
      _outcomeMeta = { cancelled: true };
      if (remoteTempDir) {
        const cleanConn = sshConn || (await sshService.openConnection(profile).then((r) => r.success ? r.data : null).catch(() => null));
        if (cleanConn) {
          try { await cleanConn.exec(`rm -rf ${_q(remoteTempDir)}`); } catch (_) {}
          if (!sshConn) { try { await cleanConn.end(); } catch (_) {} }
        }
      }
      return _err('Deploy cancelled');
    }
    _outcomeMeta = { error: err.message };
    emit('error', `Unexpected error: ${err.message}`);
    return _err(`Unexpected error during deploy: ${err.message}`);

  } finally {
    logger.finishRun(pid, runId, _outcome, _outcomeMeta);
    if (pid) activeDeployTokens.delete(pid);
    if (sshConn) { try { await sshConn.end(); } catch (_) {} }
    archiverSvc.cleanupLocal(runId);
  }
}

// ─── Full deploy ─────────────────────────────────────────────────────────────

/**
 * Full deploy: exports the local database, syncs the ENTIRE wp-content
 * directory, then imports the database on the remote server.
 *
 * Pipeline:
 *   1.  Validate profile
 *   2.  Export local database → temp .sql  (WP-CLI → mysqldump fallback)
 *   3.  Archive all wp-content subdirectories
 *   4.  Upload archive via SFTP
 *   5.  Upload .sql file via SFTP
 *   6.  Open SSH exec connection
 *   7.  Remote DB backup  ← ABORTS if this fails
 *   8.  Extract archive on remote
 *   9.  Sync all wp-content subdirs (rsync → cp fallback)
 *   10. Import .sql on remote  (WP-CLI → mysql CLI fallback)
 *   11. Search-replace: local domain → production domain
 *   12. Flush remote WordPress cache
 *   13. Remote temp dir cleanup
 *   14. Mark profile lastDeployedAt
 *
 * Local cleanup (archive + SQL) always runs in the finally block.
 *
 * @param {object}   profile
 * @param {object}   options
 * @param {boolean}  options.confirmed  Must be true — required from UI.
 * @param {function} onLog
 */
async function runFullDeploy(profile, options = {}, onLog) {
  if (!options || !options.confirmed) {
    return _err('Deploy cancelled — confirmation not provided.');
  }

  const pid   = profile.id || null;
  const runId = uuidv4();
  const emit  = (lvl, msg, meta) =>
    _emit(lvl, msg, onLog, pid, { runId, actionType: 'full_deploy', profileId: pid, ...(meta && { metadata: meta }) });
  const dbLog = (entry) => {
    const rich = { ...entry, runId, actionType: 'full_deploy', profileId: pid };
    onLog && onLog(rich);
    logger.appendEntry(pid, rich);
  };

  let sshConn       = null;
  let remoteTempDir = null;
  let _outcome      = 'failure';
  let _outcomeMeta  = null;
  let localTablePrefix = null;
  let remoteTablePrefix = null;

  const token = makeToken();
  if (pid) activeDeployTokens.set(pid, token);

  logger.startRun(pid, 'full_deploy', runId, {
    host: `${profile.sshHost}:${profile.sshPort || 18765}`,
    mode: 'full',
  });

  try {
    emit('info',    `── Full deploy started ── ${profile.name} ──`);
    emit('info',    `Run ID: ${runId.slice(0, 8)}`);
    emit('warning', 'Entire wp-content will be synced. Remote database will be backed up then overwritten.');

    // ── 1. Validate ──────────────────────────────────────────────────────────
    if (!profile.localSiteId) {
      return _err(
        'Profile is not linked to a Local site. ' +
        'Re-run the setup wizard to repair the link.'
      );
    }

    const wpContentPath = localAdapter.getSiteWpContentPath(profile.localSiteId);
    if (!wpContentPath || !fs.existsSync(wpContentPath)) {
      return _err(`Local wp-content not found: ${wpContentPath || '(unknown)'}`);
    }

    // Normalise and validate early — Windows users may type backslashes.
    const remoteWebRootVal = (profile.remoteWebRoot || '').replace(/\\/g, '/').replace(/\/$/, '');
    if (!remoteWebRootVal || !remoteWebRootVal.startsWith('/')) {
      return _err(
        'Remote web root is not set or is not a valid absolute path. ' +
        'It must start with "/" (e.g. /home/username/public_html). ' +
        'Edit the profile and try again.'
      );
    }

    emit('info', `Source:      ${wpContentPath}`);
    emit('info', `Destination: ${remoteWebRootVal}/wp-content`);

    // ── 2. Discover wp-content subdirectories ─────────────────────────────────
    let wpDirs;
    try {
      wpDirs = fs.readdirSync(wpContentPath, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e)  => e.name);
    } catch (e) {
      return _err(`Cannot read local wp-content: ${e.message}`);
    }

    if (wpDirs.length === 0) {
      return _err('No subdirectories found in local wp-content. Nothing to deploy.');
    }

    // Apply exclusions — always exclude the addon's own backup folder, plus any
    // directories the user explicitly opted out of in the UI.
    const ALWAYS_EXCLUDE = ['sgd-db-backups'];
    const userExcludes   = Array.isArray(options.excludeDirs) ? options.excludeDirs : [];
    const excludeSet     = new Set([...ALWAYS_EXCLUDE, ...userExcludes]);

    const filteredDirs = wpDirs.filter((name) => !excludeSet.has(name));
    if (filteredDirs.length === 0) {
      return _err('All wp-content directories are excluded. Nothing to deploy.');
    }
    if (userExcludes.length > 0) {
      emit('info', `Excluded directories: ${userExcludes.join(', ')}`);
    }

    const sourceItems = filteredDirs.map((name) => ({
      localPath:   path.join(wpContentPath, name),
      archiveName: name,
    }));
    emit('info', `Directories: ${filteredDirs.join(', ')}`);

    // ── 3. Export local database ──────────────────────────────────────────────
    emit('info', '── Exporting local database…');
    const localSqlPath   = dbSvc.getTempSqlPath(runId);
    const dbExportResult = await dbSvc.exportLocalDatabase(
      profile.localSiteId,
      localSqlPath,
      dbLog
    );
    if (!dbExportResult.success) {
      return _err(`Local database export failed:\n${dbExportResult.error}`);
    }

    const localPrefixResult = dbSvc.getLocalTablePrefix(profile.localSiteId);
    if (!localPrefixResult.success) {
      return _err(`Could not determine the local table prefix:\n${localPrefixResult.error}`);
    }
    localTablePrefix = localPrefixResult.data.tablePrefix;
    emit('info', `Local DB table prefix: ${localTablePrefix}`);

    // ── 4. Create local archive ───────────────────────────────────────────────
    const archiveFormat    = (options.format === 'tar') ? 'tar' : 'zip';
    const localArchivePath = archiverSvc.getTempArchivePath(runId, archiveFormat);
    emit('info', `── Creating ${archiveFormat.toUpperCase()} archive of entire wp-content…`);

    // Build exclude list — same safety defaults as code deploy
    const excludeFolders = [];
    if (!profile.deployIncludeGit)    excludeFolders.push('.git');
    if (!profile.deployIncludeVscode) excludeFolders.push('.vscode');

    let lastBucket = -1;
    const archiveResult = await archiverSvc.createArchive(
      sourceItems,
      localArchivePath,
      archiveFormat,
      ({ bytes, total }) => {
        if (total > 0) {
          const bucket = Math.floor((bytes / total) * 4);
          if (bucket > lastBucket) {
            lastBucket = bucket;
            emit('info', `  Archiving… ${_fmt(bytes)} / ${_fmt(total)}`);
          }
        }
      },
      excludeFolders
    );

    if (!archiveResult.success) return _err(`Archive failed: ${archiveResult.error}`);
    if (!archiveResult.data.sizeBytes) {
      return _err(
        'Archive was created but is empty — no files were added. ' +
        'Check that the local wp-content directory is not empty.'
      );
    }
    emit('success', `${archiveFormat.toUpperCase()} archive ready: ${_fmt(archiveResult.data.sizeBytes)}`);
    if (token.isCancelled) throw new DeployCancelledError();

    // ── 5. Upload archive via SFTP ────────────────────────────────────────────
    remoteTempDir               = `/tmp/sgd-deploy-${runId}`;
    const remoteArchiveFile     = `deploy.${archiveFormat}`;
    const remoteArchivePath     = `${remoteTempDir}/${remoteArchiveFile}`;

    emit('info', '── Uploading files…');
    let lastPct = -1;
    const uploadResult = await Promise.race([
      sftpSvc.uploadFile(
        profile,
        localArchivePath,
        remoteArchivePath,
        ({ bytes, total, percent }) => {
          const band = Math.floor(percent / 25) * 25;
          if (band > lastPct) {
            lastPct = band;
            emit('info', `  Archive upload: ${percent}% (${_fmt(bytes)} / ${_fmt(total)})`);
          }
        },
        token
      ),
      token.cancelPromise,
    ]);
    if (!uploadResult.success) return _err(`Archive upload failed: ${uploadResult.error}`);
    emit('success', 'Archive uploaded');

    // ── 6. Upload SQL file via SFTP ───────────────────────────────────────────
    const remoteSqlPath   = `${remoteTempDir}/database.sql`;
    const sqlUploadResult = await dbSvc.uploadSqlFile(
      profile,
      localSqlPath,
      remoteSqlPath,
      dbLog
    );
    if (!sqlUploadResult.success) return _err(`SQL upload failed: ${sqlUploadResult.error}`);

    // ── 7. Open SSH connection ────────────────────────────────────────────────
    emit('info', '── Opening SSH connection…');
    const connResult = await sshService.openConnection(profile);
    if (!connResult.success) return _err(`SSH connection failed: ${connResult.error}`);
    sshConn = connResult.data;
    emit('success', 'SSH connection open');

    const remoteWebRoot = remoteWebRootVal;

    // ── 8. Remote DB backup (MANDATORY — aborts on failure) ───────────────────
    emit('info', '── Creating remote database backup…');
    const backupsDir   = `${remoteWebRoot}/sgd-db-backups`;
    const dbBackupPath = `${backupsDir}/db-${runId.slice(0, 8)}-${Date.now()}.sql`;

    const backupResult = await dbSvc.backupRemoteDatabase(
      sshConn,
      remoteWebRoot,
      dbBackupPath,
      dbLog
    );
    if (!backupResult.success) {
      return _err(`Remote database backup failed:\n${backupResult.error}`);
    }

    const remotePrefixResult = await dbSvc.getRemoteTablePrefix(sshConn, remoteWebRoot);
    if (!remotePrefixResult.success) {
      return _err(`Could not determine the remote table prefix:\n${remotePrefixResult.error}`);
    }
    remoteTablePrefix = remotePrefixResult.data.tablePrefix;
    emit('info', `Remote DB table prefix: ${remoteTablePrefix} (${remotePrefixResult.data.source || 'unknown source'})`);

    // ── 9. Extract archive on remote ──────────────────────────────────────────
    emit('info', '── Extracting archive on remote…');
    let unzipOut = '';
    const extractCmd = archiveFormat === 'tar'
      ? `mkdir -p ${_q(remoteTempDir)} && tar xf ${_q(remoteArchivePath)} -C ${_q(remoteTempDir)} 2>&1`
      : `unzip -o -d ${_q(remoteTempDir)} ${_q(remoteArchivePath)} 2>&1`;
    const unzipResult = await sshConn.exec(extractCmd, (chunk) => { unzipOut += chunk; });
    if (unzipResult.exitCode !== 0) {
      const tail = unzipOut.trim().split('\n').slice(-5).join('\n');
      return _err(`Extraction failed (exit ${unzipResult.exitCode}):\n${tail}`);
    }
    emit('success', 'Archive extracted');

    // ── 10. Sync all wp-content subdirs ───────────────────────────────────────
    emit('info', '── Syncing wp-content directories…');

    // Only sync dirs that were actually extracted — empty local dirs are
    // silently skipped by the archiver (zip has no empty-dir entries), so
    // they won't exist in the remote temp dir and rsync would fail on them.
    let extractedDirsOut = '';
    await sshConn.exec(
      `for d in ${sourceItems.map((i) => _q(`${remoteTempDir}/${i.archiveName}`)).join(' ')}; do [ -d "$d" ] && basename "$d"; done`,
      (chunk) => { extractedDirsOut += chunk; }
    );
    const extractedSet = new Set(extractedDirsOut.trim().split('\n').map((s) => s.trim()).filter(Boolean));
    const skippedEmpty = sourceItems.filter((i) => !extractedSet.has(i.archiveName)).map((i) => i.archiveName);
    if (skippedEmpty.length > 0) {
      emit('info', `  Skipping empty/missing directories: ${skippedEmpty.join(', ')}`);
    }

    for (const item of sourceItems) {
      const subDir  = item.archiveName;
      if (!extractedSet.has(subDir)) continue; // empty dir — nothing to sync
      const srcDir  = `${remoteTempDir}/${subDir}`;
      const destDir = `${remoteWebRoot}/wp-content/${subDir}`;
      emit('info', `  Syncing ${subDir}…`);
      const rsyncExcludes = excludeFolders.map((f) => `--exclude=${_q(f)}`).join(' ');
      const syncCmd = [
        `if command -v rsync > /dev/null 2>&1; then`,
        `  rsync -az --delete ${rsyncExcludes} ${_q(srcDir + '/')} ${_q(destDir + '/')};`,
        `else`,
        `  rm -rf ${_q(destDir)} && cp -rp ${_q(srcDir)} ${_q(remoteWebRoot + '/wp-content/')};`,
        `fi`,
      ].join(' ');
      let syncOut = '';
      const syncResult = await sshConn.exec(syncCmd, (chunk) => { syncOut += chunk; });
      if (syncResult.exitCode !== 0) {
        return _err(`Sync failed for "${subDir}" (exit ${syncResult.exitCode}):\n${syncOut.trim()}`);
      }
      emit('success', `    ✓ ${subDir}`);
    }

    // ── 11. Import database on remote ─────────────────────────────────────────
    emit('info', '── Importing database…');
    const importResult = await dbSvc.importRemoteDatabase(
      sshConn,
      remoteWebRoot,
      remoteSqlPath,
      dbLog
    );

    if (!importResult.success) {
      // Files synced OK but DB import failed — recoverable with manual steps.
      emit('error',   `DB import failed: ${importResult.error}`);
      emit('warning', 'wp-content files were synced successfully.');
      emit('warning', `Remote DB backup is at: ${dbBackupPath}`);
      emit('info',    `Manual import: wp db import ${remoteSqlPath} --path=${_q(remoteWebRoot)} --allow-root`);
    } else {
      if (localTablePrefix && remoteTablePrefix && localTablePrefix !== remoteTablePrefix) {
        emit('warning', `Remote table prefix mismatch detected: ${remoteTablePrefix} -> ${localTablePrefix}`);

        const prefixUpdateResult = await dbSvc.updateRemoteTablePrefix(
          sshConn,
          remoteWebRoot,
          localTablePrefix,
          dbLog
        );

        if (!prefixUpdateResult.success) {
          return _err(
            `Database imported, but remote wp-config still points at ${remoteTablePrefix} tables.\n` +
            `${prefixUpdateResult.error}\n\n` +
            `Remote DB backup: ${dbBackupPath}`
          );
        }

      }

      const activeTablePrefix = localTablePrefix || remoteTablePrefix;
      const stalePrefixResult = await dbSvc.getRemoteStaleTablePrefixes(
        sshConn,
        remoteWebRoot,
        activeTablePrefix
      );

      if (!stalePrefixResult.success) {
        emit('warning', `Stale table discovery failed (non-fatal): ${stalePrefixResult.error}`);
      } else {
        for (const stalePrefix of stalePrefixResult.data.prefixes) {
          const cleanupResult = await dbSvc.dropRemoteTablesByPrefix(
            sshConn,
            remoteWebRoot,
            stalePrefix,
            dbLog
          );

          if (!cleanupResult.success) {
            emit('warning', `Old ${stalePrefix}* table cleanup failed (non-fatal): ${cleanupResult.error}`);
          }
        }
      }

      // ── 12. Search-replace ────────────────────────────────────────────────
      const localDomain = localAdapter.getSiteLocalDomain(profile.localSiteId);
      const prodDomain  = profile.productionDomain || null;

      if (prodDomain && localDomain && localDomain !== prodDomain) {
        emit('info', '── Running domain search-replace…');
        const srResult = await dbSvc.runSearchReplace(
          sshConn, remoteWebRoot, localDomain, prodDomain,
          dbLog
        );
        if (!srResult.success) {
          emit('warning', `search-replace failed (non-fatal): ${srResult.error}`);
          emit('info',    `Run manually: wp search-replace '${localDomain}' '${prodDomain}' --all-tables --path=${_q(remoteWebRoot)}`);
        }
      } else if (!prodDomain) {
        emit('warning', 'No productionDomain set on profile — search-replace skipped.');
        emit('info',    'Set a production domain in the profile to enable automatic domain swap.');
      }

      // ── 13. Flush remote cache ─────────────────────────────────────────────
      await dbSvc.clearRemoteCache(sshConn, remoteWebRoot, dbLog);
    }

    // ── 14. Remote cleanup ────────────────────────────────────────────────────
    emit('info', 'Cleaning up remote temp files…');
    await sshConn.exec(`rm -rf ${_q(remoteTempDir)}`);
    emit('info',    'Remote cleanup complete.');
    emit('success', `Remote DB backup retained at: ${dbBackupPath}`);

    // ── 15. Mark deployed ─────────────────────────────────────────────────────
    if (pid) profileStore.markDeployed(pid);

    emit('success', `── Full deploy complete — ${sourceItems.length} directories synced ──`);
    _outcome     = 'success';
    _outcomeMeta = { synced: sourceItems.map((i) => i.archiveName), dbImported: importResult.success };
    return _ok({
      runId,
      mode:       'full',
      synced:     sourceItems.map((i) => i.archiveName),
      dbBackupPath,
      dbImported: importResult.success,
    });

  } catch (err) {
    if (err instanceof DeployCancelledError) {
      emit('warning', '── Deploy cancelled by user ──');
      _outcome     = 'cancelled';
      _outcomeMeta = { cancelled: true };
      if (remoteTempDir) {
        const cleanConn = sshConn || (await sshService.openConnection(profile).then((r) => r.success ? r.data : null).catch(() => null));
        if (cleanConn) {
          try { await cleanConn.exec(`rm -rf ${_q(remoteTempDir)}`); } catch (_) {}
          if (!sshConn) { try { await cleanConn.end(); } catch (_) {} }
        }
      }
      return _err('Deploy cancelled');
    }
    _outcomeMeta = { error: err.message };
    emit('error', `Unexpected error: ${err.message}`);
    return _err(`Unexpected error: ${err.message}`);

  } finally {
    logger.finishRun(pid, runId, _outcome, _outcomeMeta);
    if (pid) activeDeployTokens.delete(pid);
    if (sshConn) { try { await sshConn.end(); } catch (_) {} }
    archiverSvc.cleanupLocal(runId);
    dbSvc.cleanupLocalSql(runId);
  }
}

/**
 * Delete remote SQL backups (the entire `sgd-db-backups` directory).
 * @param {string} profileId
 * @returns {Promise<{ success: true } | { success: false, error: string }>}
 */
async function deleteRemoteBackups(profileId) {
  const profileResult = profileStore.getProfileById(profileId);
  if (!profileResult.success) return profileResult;

  const profile = profileResult.data;
  const sshRes = await sshService.openConnection(profile);
  if (!sshRes.success) return sshRes;

  const sshConn = sshRes.data;
  try {
    const webRoot = (profile.remoteWebRoot || '').trim().replace(/\/$/, '');
    if (!webRoot || webRoot.length < 5) return _err('Invalid remote web root.');
    
    const backupsDir = `${webRoot}/sgd-db-backups`;
    let out = '';
    const res = await sshConn.exec(`rm -rf ${_q(backupsDir)} 2>&1`, (c) => out += c);
    
    if (res.exitCode !== 0) {
      return _err(`Failed to delete remote backups. Exit code ${res.exitCode}: ${out}`);
    }
    return _ok({});
  } catch (err) {
    return _err(`Error deleting remote backups: ${err.message}`);
  } finally {
    try { await sshConn.end(); } catch (_) {}
  }
}

/**
 * Cancel an in-progress deploy for a profile.
 * Safe to call even if no deploy is running.
 */
function cancelDeploy(profileId) {
  const token = activeDeployTokens.get(profileId);
  if (token) {
    token.cancel();
    return _ok({ cancelled: true });
  }
  return _ok({ cancelled: false, reason: 'No active deploy for this profile' });
}

// ─── Database-only deploy ─────────────────────────────────────────────────────

/**
 * Deploy only the local database to the remote server.
 * Mirrors the DB steps from runFullDeploy (export → backup → import →
 * search-replace → cache flush) without touching any files.
 *
 * @param {object}   profile  Saved profile (raw object).
 * @param {object}   options  { confirmed: boolean }
 * @param {function} onLog    Real-time log entry callback.
 */
async function runDbDeploy(profile, options = {}, onLog) {
  const pid   = profile.id || null;
  const runId = uuidv4();

  const emit  = (lvl, msg) =>
    _emit(lvl, msg, onLog, pid, { runId, actionType: 'db_deploy', profileId: pid });
  const dbLog = (entry) => {
    const rich = { ...entry, runId, actionType: 'db_deploy', profileId: pid };
    onLog && onLog(rich);
    logger.appendEntry(pid, rich);
  };

  let sshConn       = null;
  let remoteTempDir = null;
  let localTablePrefix  = null;
  let remoteTablePrefix = null;
  let dbBackupPath      = null;
  let _outcome     = 'failure';
  let _outcomeMeta = null;

  const token = makeToken();
  if (pid) activeDeployTokens.set(pid, token);

  logger.startRun(pid, 'db_deploy', runId, {
    host: `${profile.sshHost}:${profile.sshPort || 18765}`,
  });

  try {
    emit('info', `── Database deploy started ── ${profile.name} ──`);
    emit('info', `Run ID: ${runId.slice(0, 8)}`);

    // ── 1. Validate profile ───────────────────────────────────────────────────
    if (!profile.localSiteId) {
      return _err('This profile is not linked to a Local site.');
    }

    const remoteWebRootVal = (profile.remoteWebRoot || '').replace(/\\/g, '/').replace(/\/$/, '');
    if (!remoteWebRootVal || !remoteWebRootVal.startsWith('/')) {
      return _err('Remote web root is not set or is not a valid absolute path.');
    }

    emit('info', `Remote web root: ${remoteWebRootVal}`);

    // ── 2. Export local database ──────────────────────────────────────────────
    emit('info', '── Exporting local database…');
    const localSqlPath   = dbSvc.getTempSqlPath(runId);
    const dbExportResult = await dbSvc.exportLocalDatabase(
      profile.localSiteId,
      localSqlPath,
      dbLog
    );
    if (!dbExportResult.success) {
      return _err(`Local database export failed:\n${dbExportResult.error}`);
    }

    const localPrefixResult = dbSvc.getLocalTablePrefix(profile.localSiteId);
    if (!localPrefixResult.success) {
      return _err(`Could not determine the local table prefix:\n${localPrefixResult.error}`);
    }
    localTablePrefix = localPrefixResult.data.tablePrefix;
    emit('info', `Local DB table prefix: ${localTablePrefix}`);

    if (token.isCancelled) throw new DeployCancelledError();

    // ── 3. Upload SQL via SFTP ────────────────────────────────────────────────
    remoteTempDir       = `/tmp/sgd-deploy-${runId}`;
    const remoteSqlPath = `${remoteTempDir}/database.sql`;

    emit('info', '── Uploading database file…');
    const sqlUploadResult = await dbSvc.uploadSqlFile(
      profile,
      localSqlPath,
      remoteSqlPath,
      dbLog
    );
    if (!sqlUploadResult.success) return _err(`SQL upload failed: ${sqlUploadResult.error}`);

    if (token.isCancelled) throw new DeployCancelledError();

    // ── 4. Open SSH connection ────────────────────────────────────────────────
    emit('info', '── Opening SSH connection…');
    const connResult = await sshService.openConnection(profile);
    if (!connResult.success) return _err(`SSH connection failed: ${connResult.error}`);
    sshConn = connResult.data;
    emit('success', 'SSH connection open');

    const remoteWebRoot = remoteWebRootVal;

    // ── 5. Remote DB backup (MANDATORY) ──────────────────────────────────────
    emit('info', '── Creating remote database backup…');
    const backupsDir = `${remoteWebRoot}/sgd-db-backups`;
    dbBackupPath     = `${backupsDir}/db-${runId.slice(0, 8)}-${Date.now()}.sql`;

    const backupResult = await dbSvc.backupRemoteDatabase(
      sshConn,
      remoteWebRoot,
      dbBackupPath,
      dbLog
    );
    if (!backupResult.success) {
      return _err(`Remote database backup failed:\n${backupResult.error}`);
    }

    const remotePrefixResult = await dbSvc.getRemoteTablePrefix(sshConn, remoteWebRoot);
    if (!remotePrefixResult.success) {
      return _err(`Could not determine the remote table prefix:\n${remotePrefixResult.error}`);
    }
    remoteTablePrefix = remotePrefixResult.data.tablePrefix;
    emit('info', `Remote DB table prefix: ${remoteTablePrefix}`);

    if (token.isCancelled) throw new DeployCancelledError();

    // ── 6. Import database ────────────────────────────────────────────────────
    emit('info', '── Importing database…');
    const importResult = await dbSvc.importRemoteDatabase(
      sshConn,
      remoteWebRoot,
      remoteSqlPath,
      dbLog
    );

    if (!importResult.success) {
      emit('error',   `DB import failed: ${importResult.error}`);
      emit('warning', `Remote DB backup is at: ${dbBackupPath}`);
      emit('info',    `Manual import: wp db import ${remoteSqlPath} --path=${_q(remoteWebRoot)} --allow-root`);
    } else {
      // ── 7. Prefix update if mismatched ──────────────────────────────────────
      if (localTablePrefix && remoteTablePrefix && localTablePrefix !== remoteTablePrefix) {
        emit('warning', `Table prefix mismatch: remote ${remoteTablePrefix} → local ${localTablePrefix}`);
        const prefixUpdateResult = await dbSvc.updateRemoteTablePrefix(
          sshConn, remoteWebRoot, localTablePrefix, dbLog
        );
        if (!prefixUpdateResult.success) {
          return _err(
            `Database imported, but remote wp-config prefix update failed.\n` +
            `${prefixUpdateResult.error}\n\nRemote DB backup: ${dbBackupPath}`
          );
        }
      }

      // ── 8. Drop stale tables ────────────────────────────────────────────────
      const activeTablePrefix  = localTablePrefix || remoteTablePrefix;
      const stalePrefixResult  = await dbSvc.getRemoteStaleTablePrefixes(
        sshConn, remoteWebRoot, activeTablePrefix
      );
      if (!stalePrefixResult.success) {
        emit('warning', `Stale table discovery failed (non-fatal): ${stalePrefixResult.error}`);
      } else {
        for (const stalePrefix of stalePrefixResult.data.prefixes) {
          const cleanupResult = await dbSvc.dropRemoteTablesByPrefix(
            sshConn, remoteWebRoot, stalePrefix, dbLog
          );
          if (!cleanupResult.success) {
            emit('warning', `Old ${stalePrefix}* table cleanup failed (non-fatal): ${cleanupResult.error}`);
          }
        }
      }

      // ── 9. Search-replace ───────────────────────────────────────────────────
      const localDomain = localAdapter.getSiteLocalDomain(profile.localSiteId);
      const prodDomain  = profile.productionDomain || null;

      if (prodDomain && localDomain && localDomain !== prodDomain) {
        emit('info', '── Running domain search-replace…');
        const srResult = await dbSvc.runSearchReplace(
          sshConn, remoteWebRoot, localDomain, prodDomain, dbLog
        );
        if (!srResult.success) {
          emit('warning', `search-replace failed (non-fatal): ${srResult.error}`);
          emit('info',    `Run manually: wp search-replace '${localDomain}' '${prodDomain}' --all-tables --path=${_q(remoteWebRoot)}`);
        }
      } else if (!prodDomain) {
        emit('warning', 'No productionDomain set on profile — search-replace skipped.');
      }

      // ── 10. Flush remote cache ──────────────────────────────────────────────
      await dbSvc.clearRemoteCache(sshConn, remoteWebRoot, dbLog);
    }

    // ── 11. Remote cleanup ────────────────────────────────────────────────────
    emit('info', 'Cleaning up remote temp files…');
    await sshConn.exec(`rm -rf ${_q(remoteTempDir)}`);
    emit('info',    'Remote cleanup complete.');
    emit('success', `Remote DB backup retained at: ${dbBackupPath}`);

    // ── 12. Mark deployed ─────────────────────────────────────────────────────
    if (pid) profileStore.markDeployed(pid);

    emit('success', '── Database deploy complete ──');
    _outcome     = 'success';
    _outcomeMeta = { dbImported: importResult.success };
    return _ok({ runId, mode: 'db', dbBackupPath, dbImported: importResult.success });

  } catch (err) {
    if (err instanceof DeployCancelledError) {
      emit('warning', '── Deploy cancelled by user ──');
      _outcome     = 'cancelled';
      _outcomeMeta = { cancelled: true };
      if (remoteTempDir) {
        const cleanConn = sshConn || (await sshService.openConnection(profile).then((r) => r.success ? r.data : null).catch(() => null));
        if (cleanConn) {
          try { await cleanConn.exec(`rm -rf ${_q(remoteTempDir)}`); } catch (_) {}
          if (!sshConn) { try { await cleanConn.end(); } catch (_) {} }
        }
      }
      return _err('Deploy cancelled');
    }
    _outcomeMeta = { error: err.message };
    emit('error', `Unexpected error: ${err.message}`);
    return _err(`Unexpected error during database deploy: ${err.message}`);

  } finally {
    logger.finishRun(pid, runId, _outcome, _outcomeMeta);
    if (pid) activeDeployTokens.delete(pid);
    if (sshConn) { try { await sshConn.end(); } catch (_) {} }
    dbSvc.cleanupLocalSql(runId);
  }
}

// ─── Pull backup path helper ──────────────────────────────────────────────────

/**
 * Build the local backup path for a pull operation.
 * Structure: {wpContentPath}/sgd-backups/local/{MM-DD-YY}/{HH-MM-SS-AM|PM}/
 *
 * @param {string} wpContentPath  Absolute path to wp-content on this machine.
 * @param {string} type           'db' or 'files'
 * @param {string} filename       e.g. 'database.sql' or 'themes.zip'
 * @returns {{ dir: string, filePath: string, dateLabel: string, timeLabel: string }}
 */
function _pullBackupPath(wpContentPath, type, filename) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const month = pad(now.getMonth() + 1);
  const day   = pad(now.getDate());
  const year  = String(now.getFullYear()).slice(-2);
  const dateLabel = `${month}-${day}-${year}`;

  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeLabel = `${pad(hours)}-${pad(now.getMinutes())}-${pad(now.getSeconds())}-${ampm}`;

  const dir = path.join(wpContentPath, 'sgd-backups', 'local', dateLabel, timeLabel, type);
  return { dir, filePath: path.join(dir, filename), dateLabel, timeLabel };
}

// ─── Code pull ────────────────────────────────────────────────────────────────

/**
 * Pull selected wp-content directories from the remote server to local.
 *
 * Pipeline:
 *   1.  Validate profile + local paths
 *   2.  Backup local target directories → wp-content/sgd-backups/local/{date}/{time}/files/
 *   3.  SSH: tar the selected remote dirs into a temp zip on the server
 *   4.  SFTP download the zip to local temp
 *   5.  Unzip over the local wp-content directories (Node built-in unzip via AdmZip)
 *   6.  Remote + local temp cleanup
 *
 * @param {object}   profile
 * @param {object}   options
 * @param {string[]} [options.targets]  Default: ['themes', 'plugins']
 * @param {function} onLog
 */
async function runCodePull(profile, options = {}, onLog) {
  const pid   = profile.id || null;
  const runId = uuidv4();
  const emit  = (lvl, msg, meta) =>
    _emit(lvl, msg, onLog, pid, { runId, actionType: 'code_pull', profileId: pid, ...(meta && { metadata: meta }) });

  let sshConn       = null;
  let remoteTempDir = null;
  let _outcome      = 'failure';
  let _outcomeMeta  = null;

  const token = makeToken();
  if (pid) activeDeployTokens.set(pid, token);

  logger.startRun(pid, 'code_pull', runId, {
    host: `${profile.sshHost}:${profile.sshPort || 18765}`,
  });

  try {
    emit('info', `── Code pull started ── ${profile.name} ──`);
    emit('info', `Run ID: ${runId.slice(0, 8)}`);

    if (!profile.localSiteId) {
      return _err('Profile is not linked to a Local site. Re-run the setup wizard.');
    }

    const wpContentPath = localAdapter.getSiteWpContentPath(profile.localSiteId);
    if (!wpContentPath || !fs.existsSync(wpContentPath)) {
      return _err(`Local wp-content not found: ${wpContentPath || '(unknown)'}`);
    }

    const remoteWebRootVal = (profile.remoteWebRoot || '').replace(/\\/g, '/').replace(/\/$/, '');
    if (!remoteWebRootVal || !remoteWebRootVal.startsWith('/')) {
      return _err('Remote web root is not set or is not a valid absolute path.');
    }

    const requestedTargets = Array.isArray(options.targets) && options.targets.length > 0
      ? options.targets
      : ['themes', 'plugins'];

    emit('info', `Targets: ${requestedTargets.join(', ')}`);
    emit('info', `Remote web root: ${remoteWebRootVal}`);

    // ── 1. Backup local target directories ───────────────────────────────────
    emit('info', '── Backing up local directories before pull…');
    const backupMeta = _pullBackupPath(wpContentPath, 'files', 'placeholder');
    emit('info', `  Backup folder: sgd-backups/local/${backupMeta.dateLabel}/${backupMeta.timeLabel}/files/`);

    for (const target of requestedTargets) {
      const subDir    = KNOWN_TARGETS[target] || target;
      const localPath = path.join(wpContentPath, subDir);
      if (!fs.existsSync(localPath)) {
        emit('info', `  Skipping backup of "${subDir}" — not present locally yet`);
        continue;
      }
      const bk = _pullBackupPath(wpContentPath, 'files', `${subDir}.zip`);
      fs.mkdirSync(bk.dir, { recursive: true });
      emit('info', `  Backing up ${subDir}…`);
      const bkResult = await archiverSvc.createArchive(
        [{ localPath, archiveName: subDir }],
        bk.filePath,
        'zip',
        null
      );
      if (!bkResult.success) {
        return _err(`Pre-pull backup failed for "${subDir}": ${bkResult.error}`);
      }
      emit('success', `  ✓ Backed up ${subDir} (${_fmt(bkResult.data.sizeBytes)})`);
    }

    // ── 2. Open SSH ───────────────────────────────────────────────────────────
    emit('info', '── Opening SSH connection…');
    const connResult = await sshService.openConnection(profile);
    if (!connResult.success) return _err(`SSH connection failed: ${connResult.error}`);
    sshConn = connResult.data;
    emit('success', 'SSH connection open');

    // ── 3. Zip selected dirs on remote ────────────────────────────────────────
    remoteTempDir = `/tmp/sgd-pull-${runId}`;
    const remoteZipPath = `${remoteTempDir}/pull.zip`;
    emit('info', '── Creating archive on remote server…');

    let mkdirOut = '';
    await sshConn.exec(`mkdir -p ${_q(remoteTempDir)}`, (c) => { mkdirOut += c; });

    // Build list of remote dirs that actually exist
    const remoteTargets = [];
    for (const target of requestedTargets) {
      const subDir     = KNOWN_TARGETS[target] || target;
      const remotePath = `${remoteWebRootVal}/wp-content/${subDir}`;
      let existOut = '';
      await sshConn.exec(`[ -d ${_q(remotePath)} ] && echo yes || echo no`, (c) => { existOut += c; });
      if (existOut.trim() === 'yes') {
        remoteTargets.push({ subDir, remotePath });
        emit('info', `  ✓ Found remote: wp-content/${subDir}`);
      } else {
        emit('warning', `  Skipping "${subDir}" — not found on remote`);
      }
    }

    if (remoteTargets.length === 0) {
      return _err('None of the selected directories exist on the remote server.');
    }

    if (token.isCancelled) throw new DeployCancelledError();

    // zip -r pull.zip themes/ plugins/ (relative to wp-content)
    const remoteWpContent = `${remoteWebRootVal}/wp-content`;
    const zipArgs = remoteTargets.map((t) => _q(t.subDir)).join(' ');
    let zipOut = '';
    const zipResult = await Promise.race([
      sshConn.exec(
        `cd ${_q(remoteWpContent)} && zip -r ${_q(remoteZipPath)} ${zipArgs} 2>&1`,
        (c) => { zipOut += c; }
      ),
      token.cancelPromise,
    ]);

    if (zipResult.exitCode !== 0) {
      return _err(`Remote zip failed (exit ${zipResult.exitCode}):\n${zipOut.trim().split('\n').slice(-5).join('\n')}`);
    }

    // Get zip size for logging
    let sizeOut = '';
    await sshConn.exec(`stat -c %s ${_q(remoteZipPath)} 2>/dev/null || echo 0`, (c) => { sizeOut += c; });
    const zipSize = parseInt(sizeOut.trim(), 10) || 0;
    emit('success', `Remote archive ready: ${_fmt(zipSize)}`);

    if (token.isCancelled) throw new DeployCancelledError();

    // ── 4. SFTP download ──────────────────────────────────────────────────────
    const localTempZip = path.join(os.tmpdir(), 'sgd-pull', runId, 'pull.zip');
    fs.mkdirSync(path.dirname(localTempZip), { recursive: true });

    emit('info', `Downloading from ${profile.sshHost}…`);
    let lastPct = -1;

    const dlResult = await Promise.race([
      sftpSvc.downloadFile(
        profile,
        remoteZipPath,
        localTempZip,
        ({ percent }) => {
          const band = Math.floor(percent / 25) * 25;
          if (band > lastPct) {
            lastPct = band;
            emit('info', `  Download: ${percent}%`);
          }
        },
        token
      ),
      token.cancelPromise,
    ]);

    if (!dlResult.success) return _err(`Download failed: ${dlResult.error}`);
    emit('success', `Downloaded: ${_fmt(fs.statSync(localTempZip).size)}`);

    if (token.isCancelled) throw new DeployCancelledError();

    // ── 5. Extract over local wp-content ─────────────────────────────────────
    emit('info', '── Extracting to local wp-content…');
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(localTempZip);
    zip.extractAllTo(wpContentPath, /* overwrite */ true);
    emit('success', `Extracted to ${wpContentPath}`);

    // ── 6. Remote cleanup ─────────────────────────────────────────────────────
    await sshConn.exec(`rm -rf ${_q(remoteTempDir)}`);
    emit('info', 'Remote temp files removed');

    profileStore.markDeployed(pid);

    emit('success', `── Pull complete! (${remoteTargets.map((t) => t.subDir).join(', ')}) ──`);
    _outcome     = 'success';
    _outcomeMeta = { targets: remoteTargets.map((t) => t.subDir) };
    return _ok({ runId, targets: remoteTargets.map((t) => t.subDir) });

  } catch (err) {
    if (err instanceof DeployCancelledError) {
      emit('warning', '── Pull cancelled by user ──');
      _outcome     = 'cancelled';
      _outcomeMeta = { cancelled: true };
      if (remoteTempDir && sshConn) {
        try { await sshConn.exec(`rm -rf ${_q(remoteTempDir)}`); } catch (_) {}
      }
      return _err('Pull cancelled');
    }
    _outcomeMeta = { error: err.message };
    emit('error', `Unexpected error: ${err.message}`);
    return _err(`Unexpected error during pull: ${err.message}`);

  } finally {
    logger.finishRun(pid, runId, _outcome, _outcomeMeta);
    if (pid) activeDeployTokens.delete(pid);
    if (sshConn) { try { await sshConn.end(); } catch (_) {} }
    // Clean up local temp zip
    try {
      const dir = path.join(os.tmpdir(), 'sgd-pull', runId);
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (_) {}
  }
}

// ─── DB pull ──────────────────────────────────────────────────────────────────

/**
 * Pull the remote database to local, backing up local DB first.
 *
 * Pipeline:
 *   1.  Validate profile
 *   2.  Export local DB → wp-content/sgd-backups/local/{date}/{time}/db/database.sql
 *   3.  SSH: export remote DB → /tmp/sgd-pull-{runId}/database.sql
 *   4.  SFTP download the .sql
 *   5.  Import into local MySQL (WP-CLI → mysql CLI fallback)
 *   6.  Search-replace: production domain → local domain
 *   7.  Remote temp cleanup
 *
 * @param {object}   profile
 * @param {object}   options
 * @param {boolean}  options.confirmed  Must be true.
 * @param {function} onLog
 */
async function runDbPull(profile, options = {}, onLog) {
  if (!options || !options.confirmed) {
    return _err('Pull cancelled — confirmation not provided.');
  }

  const pid   = profile.id || null;
  const runId = uuidv4();
  const emit  = (lvl, msg, meta) =>
    _emit(lvl, msg, onLog, pid, { runId, actionType: 'db_pull', profileId: pid, ...(meta && { metadata: meta }) });
  const dbLog = (entry) => {
    const rich = { ...entry, runId, actionType: 'db_pull', profileId: pid };
    onLog && onLog(rich);
    logger.appendEntry(pid, rich);
  };

  let sshConn       = null;
  let remoteTempDir = null;
  let _outcome      = 'failure';
  let _outcomeMeta  = null;

  const token = makeToken();
  if (pid) activeDeployTokens.set(pid, token);

  logger.startRun(pid, 'db_pull', runId, {
    host: `${profile.sshHost}:${profile.sshPort || 18765}`,
    mode: 'db_pull',
  });

  try {
    emit('info',    `── DB pull started ── ${profile.name} ──`);
    emit('info',    `Run ID: ${runId.slice(0, 8)}`);
    emit('warning', 'Local database will be backed up then overwritten from the remote server.');

    if (!profile.localSiteId) {
      return _err('Profile is not linked to a Local site. Re-run the setup wizard.');
    }

    const wpContentPath = localAdapter.getSiteWpContentPath(profile.localSiteId);
    if (!wpContentPath || !fs.existsSync(wpContentPath)) {
      return _err(`Local wp-content not found: ${wpContentPath || '(unknown)'}`);
    }

    const remoteWebRootVal = (profile.remoteWebRoot || '').replace(/\\/g, '/').replace(/\/$/, '');
    if (!remoteWebRootVal || !remoteWebRootVal.startsWith('/')) {
      return _err('Remote web root is not set or is not a valid absolute path.');
    }

    // ── 1. Backup local DB ────────────────────────────────────────────────────
    emit('info', '── Backing up local database…');
    const bk = _pullBackupPath(wpContentPath, 'db', 'database.sql');
    fs.mkdirSync(bk.dir, { recursive: true });

    const localBackupResult = await dbSvc.exportLocalDatabase(
      profile.localSiteId,
      bk.filePath,
      dbLog
    );
    if (!localBackupResult.success) {
      return _err(`Pre-pull local DB backup failed:\n${localBackupResult.error}`);
    }
    emit('success', `✓ Local DB backed up → sgd-backups/local/${bk.dateLabel}/${bk.timeLabel}/db/database.sql`);

    // ── 2. Open SSH ───────────────────────────────────────────────────────────
    emit('info', '── Opening SSH connection…');
    const connResult = await sshService.openConnection(profile);
    if (!connResult.success) return _err(`SSH connection failed: ${connResult.error}`);
    sshConn = connResult.data;
    emit('success', 'SSH connection open');

    // ── 3. Export remote DB ───────────────────────────────────────────────────
    remoteTempDir = `/tmp/sgd-pull-${runId}`;
    const remoteSqlPath = `${remoteTempDir}/database.sql`;
    emit('info', '── Exporting remote database…');

    await sshConn.exec(`mkdir -p ${_q(remoteTempDir)} 2>&1`);

    if (token.isCancelled) throw new DeployCancelledError();

    // Try WP-CLI first, then mysqldump fallback (same as backup logic)
    let exportOut = '';
    let exportRes = await Promise.race([
      sshConn.exec(
        `wp db export ${_q(remoteSqlPath)} --path=${_q(remoteWebRootVal)} --allow-root 2>&1`,
        (c) => { exportOut += c; }
      ),
      token.cancelPromise,
    ]);

    if (exportRes.exitCode !== 0) {
      emit('warning', `  WP-CLI export failed: ${exportOut.trim().split('\n').slice(-2).join(' | ')}`);
      emit('info', '  Falling back to remote mysqldump…');

      const creds = await dbSvc._readRemoteWpCreds ? null : null; // private — use backupRemoteDatabase pattern
      exportOut = '';
      exportRes = await Promise.race([
        sshConn.exec(
          // Use the same approach as backupRemoteDatabase — read creds from wp-config via cat+parse
          `eval $(php -r "` +
          `\\$c=file_get_contents('${remoteWebRootVal}/wp-config.php');` +
          `preg_match(\"/define\\\\s*\\\\(\\\\s*\\\\'DB_NAME\\\\'\\\\s*,\\\\s*\\\\'([^\\\\']+)/\",\\$c,\\$m); echo 'DB_NAME='.\\\$m[1].'\\n';` +
          `preg_match(\"/define\\\\s*\\\\(\\\\s*\\\\'DB_USER\\\\'\\\\s*,\\\\s*\\\\'([^\\\\']+)/\",\\$c,\\$m); echo 'DB_USER='.\\\$m[1].'\\n';` +
          `preg_match(\"/define\\\\s*\\\\(\\\\s*\\\\'DB_PASSWORD\\\\'\\\\s*,\\\\s*\\\\'([^\\\\']*)/\",\\$c,\\$m); echo 'DB_PASSWORD='.\\\$m[1].'\\n';` +
          `preg_match(\"/define\\\\s*\\\\(\\\\s*\\\\'DB_HOST\\\\'\\\\s*,\\\\s*\\\\'([^\\\\']+)/\",\\$c,\\$m); echo 'DB_HOST='.\\\$m[1].'\\n';` +
          `") && MYSQL_PWD="$DB_PASSWORD" mysqldump -h"$DB_HOST" -u"$DB_USER" --single-transaction --routines --triggers --no-tablespaces "$DB_NAME" > ${_q(remoteSqlPath)} 2>&1`,
          (c) => { exportOut += c; }
        ),
        token.cancelPromise,
      ]);

      if (exportRes.exitCode !== 0) {
        return _err(`Remote DB export failed:\n${exportOut.trim().split('\n').slice(-5).join('\n')}`);
      }
    }

    // Verify size
    let szOut = '';
    await sshConn.exec(`stat -c %s ${_q(remoteSqlPath)} 2>/dev/null || echo 0`, (c) => { szOut += c; });
    const sqlSize = parseInt(szOut.trim(), 10) || 0;
    if (sqlSize === 0) {
      return _err('Remote DB export produced an empty file. Export may have failed silently.');
    }
    emit('success', `Remote DB exported: ${_fmt(sqlSize)}`);

    if (token.isCancelled) throw new DeployCancelledError();

    // ── 4. SFTP download ──────────────────────────────────────────────────────
    const localTempSql = path.join(os.tmpdir(), 'sgd-pull', runId, 'database.sql');
    fs.mkdirSync(path.dirname(localTempSql), { recursive: true });

    emit('info', `Downloading SQL from ${profile.sshHost}…`);
    let lastPct = -1;

    const dlResult = await Promise.race([
      sftpSvc.downloadFile(
        profile,
        remoteSqlPath,
        localTempSql,
        ({ percent }) => {
          const band = Math.floor(percent / 25) * 25;
          if (band > lastPct) {
            lastPct = band;
            emit('info', `  Download: ${percent}%`);
          }
        },
        token
      ),
      token.cancelPromise,
    ]);

    if (!dlResult.success) return _err(`SQL download failed: ${dlResult.error}`);
    emit('success', `SQL downloaded: ${_fmt(fs.statSync(localTempSql).size)}`);

    if (token.isCancelled) throw new DeployCancelledError();

    // ── 5. Import into local DB ───────────────────────────────────────────────
    emit('info', '── Importing into local database…');
    const importResult = await dbSvc.importLocalDatabase(
      profile.localSiteId,
      localTempSql,
      dbLog
    );
    if (!importResult.success) return _err(importResult.error);

    // ── 6. Search-replace: production → local ─────────────────────────────────
    emit('info', '── Running search-replace…');
    const productionDomain = (profile.productionDomain || '').replace(/\/$/, '');
    const localDomain      = localAdapter.getSiteLocalDomain(profile.localSiteId) || '';

    if (productionDomain && localDomain) {
      await dbSvc.runLocalSearchReplace(
        profile.localSiteId,
        productionDomain,
        localDomain,
        dbLog
      );
    } else {
      emit('warning', 'Skipping search-replace — production domain or local domain not set in profile.');
    }

    // ── 7. Remote cleanup ─────────────────────────────────────────────────────
    emit('info', 'Cleaning up remote temp files…');
    await sshConn.exec(`rm -rf ${_q(remoteTempDir)}`);

    profileStore.markDeployed(pid);

    emit('success', '── DB pull complete! ──');
    _outcome     = 'success';
    _outcomeMeta = {};
    return _ok({ runId });

  } catch (err) {
    if (err instanceof DeployCancelledError) {
      emit('warning', '── Pull cancelled by user ──');
      _outcome     = 'cancelled';
      _outcomeMeta = { cancelled: true };
      if (remoteTempDir && sshConn) {
        try { await sshConn.exec(`rm -rf ${_q(remoteTempDir)}`); } catch (_) {}
      }
      return _err('Pull cancelled');
    }
    _outcomeMeta = { error: err.message };
    emit('error', `Unexpected error: ${err.message}`);
    return _err(`Unexpected error during DB pull: ${err.message}`);

  } finally {
    logger.finishRun(pid, runId, _outcome, _outcomeMeta);
    if (pid) activeDeployTokens.delete(pid);
    if (sshConn) { try { await sshConn.end(); } catch (_) {} }
    try {
      const dir = path.join(os.tmpdir(), 'sgd-pull', runId);
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (_) {}
    dbSvc.cleanupLocalSql(runId);
  }
}

module.exports = {
  getPreflightInfo,
  runCodeDeploy,
  runFullDeploy,
  runDbDeploy,
  runCodePull,
  runDbPull,
  cancelDeploy,
  deleteRemoteBackups,
};


