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
const { v4: uuidv4 } = require('uuid');

const localAdapter  = require('../adapters/local-app');
const archiverSvc   = require('./archiver-service');
const sftpSvc       = require('./sftp-service');
const sshService    = require('./ssh-service');
const dbSvc         = require('./database-service');
const profileStore  = require('./profile-store');
const logger        = require('./logger');

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

  return _ok({
    profileId,
    profileName:        profile.name,
    localSiteId:        siteId,
    localSiteName:      site ? site.name : null,
    wpContentPath:      wpContentPath,
    wpContentReachable: wpContentPath ? fs.existsSync(wpContentPath) : false,
    remoteWebRoot:      profile.remoteWebRoot,
    productionDomain:   profile.productionDomain || null,
    sshHost:            `${profile.sshHost}:${profile.sshPort || 18765}`,
    targets:            resolvedTargets,
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

  let sshConn = null;
  let _outcome     = 'failure';
  let _outcomeMeta = null;

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
    const requestedTargets = Array.isArray(options.targets) && options.targets.length > 0
      ? options.targets
      : ['themes', 'plugins'];

    const sourceItems = [];
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

    if (sourceItems.length === 0) {
      return _err(
        'None of the selected directories exist on disk. Nothing to deploy.\n' +
        'Check that the Local site has wp-content/themes and wp-content/plugins.'
      );
    }

    // ── 3. Create local archive ──────────────────────────────────────────────
    const localArchivePath = archiverSvc.getTempArchivePath(runId);
    emit('info', 'Creating archive…');

    let lastLoggedBucket = -1;
    const archiveResult = await archiverSvc.createArchive(
      sourceItems,
      localArchivePath,
      ({ bytes, total }) => {
        // Log a progress line at 0%, 25%, 50%, 75%, 100% of known size
        if (total > 0) {
          const bucket = Math.floor((bytes / total) * 4);
          if (bucket > lastLoggedBucket) {
            lastLoggedBucket = bucket;
            emit('info', `  Archiving… ${_fmt(bytes)} / ${_fmt(total)}`);
          }
        }
      }
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

    emit('success', `Archive ready: ${_fmt(archiveResult.data.sizeBytes)}`);

    // ── 4. Upload archive via SFTP ───────────────────────────────────────────
    const remoteTempDir    = `/tmp/sgd-deploy-${runId}`;
    const remoteArchivePath = `${remoteTempDir}/deploy.zip`;

    emit('info', `Uploading to ${profile.sshHost}…`);
    let lastPct = -1;

    const uploadResult = await sftpSvc.uploadFile(
      profile,
      localArchivePath,
      remoteArchivePath,
      ({ bytes, total, percent }) => {
        const band = Math.floor(percent / 25) * 25; // 0, 25, 50, 75, 100
        if (band > lastPct) {
          lastPct = band;
          emit('info', `  Upload: ${percent}% (${_fmt(bytes)} / ${_fmt(total)})`);
        }
      }
    );

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
    emit('info', 'Extracting archive on remote…');
    let unzipOut = '';
    const unzipResult = await sshConn.exec(
      `unzip -o -d ${_q(remoteTempDir)} ${_q(remoteArchivePath)} 2>&1`,
      (chunk) => { unzipOut += chunk; }
    );

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
      const target  = item.archiveName;
      const srcDir  = `${remoteTempDir}/${target}`;
      const destDir = `${remoteWebRoot}/wp-content/${target}`;

      emit('info', `Syncing ${target}…`);

      // rsync preferred (faster, delta, --delete removes stale files).
      // cp fallback for edge cases where rsync is not installed.
      const syncCmd = [
        `if command -v rsync > /dev/null 2>&1; then`,
        `  rsync -az --delete --exclude='.git' ${_q(srcDir + '/')} ${_q(destDir + '/')};`,
        `else`,
        `  rm -rf ${_q(destDir)} && cp -rp ${_q(srcDir)} ${_q(remoteWebRoot + '/wp-content/')};`,
        `fi`,
      ].join(' ');

      let syncOut = '';
      const syncResult = await sshConn.exec(syncCmd, (chunk) => { syncOut += chunk; });

      if (syncResult.exitCode !== 0) {
        return _err(
          `Sync failed for "${target}" (exit ${syncResult.exitCode}):\n${syncOut.trim()}`
        );
      }

      emit('success', `  ✓ ${target} → ${destDir}`);
    }

    // ── 8. Remote cleanup ────────────────────────────────────────────────────
    emit('info', 'Cleaning up remote temp files…');
    await sshConn.exec(`rm -rf ${_q(remoteTempDir)}`);
    emit('info', 'Remote cleanup complete');

    // ── 9. Mark deployed ─────────────────────────────────────────────────────
    if (pid) {
      profileStore.markDeployed(pid);
    }

    emit('success', `── Deploy complete! (${sourceItems.map((i) => i.archiveName).join(', ')}) ──`);
    _outcome     = 'success';
    _outcomeMeta = { targets: sourceItems.map((i) => i.archiveName) };
    return _ok({ runId, targets: sourceItems.map((i) => i.archiveName) });

  } catch (err) {
    _outcomeMeta = { error: err.message };
    emit('error', `Unexpected error: ${err.message}`);
    return _err(`Unexpected error during deploy: ${err.message}`);

  } finally {
    logger.finishRun(pid, runId, _outcome, _outcomeMeta);
    // Always close the SSH connection
    if (sshConn) {
      try { await sshConn.end(); } catch (_) {}
    }
    // Always delete the local temp archive
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

  let sshConn = null;
  let _outcome     = 'failure';
  let _outcomeMeta = null;

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

    const sourceItems = wpDirs.map((name) => ({
      localPath:   path.join(wpContentPath, name),
      archiveName: name,
    }));
    emit('info', `Directories: ${wpDirs.join(', ')}`);

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

    // ── 4. Create local archive ───────────────────────────────────────────────
    const localArchivePath = archiverSvc.getTempArchivePath(runId);
    emit('info', '── Creating archive of entire wp-content…');

    let lastBucket = -1;
    const archiveResult = await archiverSvc.createArchive(
      sourceItems,
      localArchivePath,
      ({ bytes, total }) => {
        if (total > 0) {
          const bucket = Math.floor((bytes / total) * 4);
          if (bucket > lastBucket) {
            lastBucket = bucket;
            emit('info', `  Archiving… ${_fmt(bytes)} / ${_fmt(total)}`);
          }
        }
      }
    );

    if (!archiveResult.success) return _err(`Archive failed: ${archiveResult.error}`);
    if (!archiveResult.data.sizeBytes) {
      return _err(
        'Archive was created but is empty — no files were added. ' +
        'Check that the local wp-content directory is not empty.'
      );
    }
    emit('success', `Archive ready: ${_fmt(archiveResult.data.sizeBytes)}`);

    // ── 5. Upload archive via SFTP ────────────────────────────────────────────
    const remoteTempDir     = `/tmp/sgd-deploy-${runId}`;
    const remoteArchivePath = `${remoteTempDir}/deploy.zip`;

    emit('info', '── Uploading files…');
    let lastPct = -1;
    const uploadResult = await sftpSvc.uploadFile(
      profile,
      localArchivePath,
      remoteArchivePath,
      ({ bytes, total, percent }) => {
        const band = Math.floor(percent / 25) * 25;
        if (band > lastPct) {
          lastPct = band;
          emit('info', `  Archive upload: ${percent}% (${_fmt(bytes)} / ${_fmt(total)})`);
        }
      }
    );
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

    // ── 9. Extract archive on remote ──────────────────────────────────────────
    emit('info', '── Extracting archive on remote…');
    let unzipOut = '';
    const unzipResult = await sshConn.exec(
      `unzip -o -d ${_q(remoteTempDir)} ${_q(remoteArchivePath)} 2>&1`,
      (chunk) => { unzipOut += chunk; }
    );
    if (unzipResult.exitCode !== 0) {
      const tail = unzipOut.trim().split('\n').slice(-5).join('\n');
      return _err(`Extraction failed (exit ${unzipResult.exitCode}):\n${tail}`);
    }
    emit('success', 'Archive extracted');

    // ── 10. Sync all wp-content subdirs ───────────────────────────────────────
    emit('info', '── Syncing wp-content directories…');
    for (const item of sourceItems) {
      const subDir  = item.archiveName;
      const srcDir  = `${remoteTempDir}/${subDir}`;
      const destDir = `${remoteWebRoot}/wp-content/${subDir}`;
      emit('info', `  Syncing ${subDir}…`);
      const syncCmd = [
        `if command -v rsync > /dev/null 2>&1; then`,
        `  rsync -az --delete --exclude='.git' ${_q(srcDir + '/')} ${_q(destDir + '/')};`,
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
    _outcomeMeta = { error: err.message };
    emit('error', `Unexpected error: ${err.message}`);
    return _err(`Unexpected error: ${err.message}`);

  } finally {
    logger.finishRun(pid, runId, _outcome, _outcomeMeta);
    if (sshConn) { try { await sshConn.end(); } catch (_) {} }
    archiverSvc.cleanupLocal(runId);
    dbSvc.cleanupLocalSql(runId);
  }
}

module.exports = {
  getPreflightInfo,
  runCodeDeploy,
  runFullDeploy,
};

