/**
 * ArchiverService
 *
 * Creates zip archives of local WordPress directories for upload during
 * a code-only deploy. Uses the `archiver` npm package (streaming write,
 * no temp file for the whole tree — entries are streamed into the zip).
 *
 * Archive structure:
 *   Each sourceItem maps a local directory → a top-level name inside the zip.
 *   Example:
 *     { localPath: '/path/to/wp-content/themes',  archiveName: 'themes'  }
 *     { localPath: '/path/to/wp-content/plugins', archiveName: 'plugins' }
 *
 *   Produces a zip like:
 *     themes/                  ← archiveName becomes the top-level dir
 *       twentytwentythree/
 *         ... files ...
 *     plugins/
 *       akismet/
 *         ... files ...
 *
 *   On the remote server, `unzip -o -d /tmp/sgd-xxx /tmp/sgd-xxx/deploy.zip`
 *   will reconstruct themes/, plugins/ etc. directly under /tmp/sgd-xxx/.
 *   Then each dir can be rsync'd / cp'd to the remote web root in isolation.
 */

'use strict';

const archiverLib = require('archiver');
const fs          = require('fs');
const path        = require('path');
const os          = require('os');

// ─── Result helpers ────────────────────────────────────────────────────────────
function _ok(data)   { return { success: true,  data  }; }
function _err(error) { return { success: false, error }; }

// ─── Archive creation ──────────────────────────────────────────────────────────

/**
 * Create a zip or tar archive from an array of source directory descriptors.
 *
 * @param {Array<{ localPath: string, archiveName: string }>} sourceItems
 * @param {string}   destPath     Absolute path for the output archive file.
 * @param {string}   [format]     'zip' (default) or 'tar'.
 * @param {function} [onProgress] Called with { bytes, total } during write.
 */
function createArchive(sourceItems, destPath, format, onProgress) {
  // Support legacy 3-arg calls where format was omitted and onProgress was 3rd arg
  if (typeof format === 'function') {
    onProgress = format;
    format = 'zip';
  }
  format = (format === 'tar') ? 'tar' : 'zip';
  return new Promise((resolve) => {
    try {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
    } catch (err) {
      return resolve(_err(`Cannot create temp directory: ${err.message}`));
    }

    let output;
    try {
      // highWaterMark: 16MB write buffer — reduces disk I/O stalls on large archives
      output = fs.createWriteStream(destPath, { highWaterMark: 16 * 1024 * 1024 });
    } catch (err) {
      return resolve(_err(`Cannot open archive file for writing: ${err.message}`));
    }

    const archive = format === 'tar'
      ? archiverLib('tar', {
          // No compression — raw tar. Zero CPU cost; decompresses instantly
          // on the server with `tar xf`. Best for uploads-heavy deploys.
          gzip: false,
          statConcurrency: 8,
        })
      : archiverLib('zip', {
          zlib: {
            // level 1 = fastest compression — good for PHP/CSS/JS text files,
            // and doesn't waste CPU on already-compressed images/videos.
            level: 1,
            memLevel: 9,   // max zlib memory — speeds up compression
          },
          statConcurrency: 8,   // stat up to 8 files at once while building entries
        });
    let settled = false;

    function settle(result) {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    }

    output.on('close', () => {
      settle(_ok({ destPath, sizeBytes: archive.pointer() }));
    });

    archive.on('error', (err) => {
      settle(_err(`Archive creation failed: ${err.message}`));
    });

    archive.on('warning', (err) => {
      // ENOENT is non-fatal (file was deleted between scan and zip)
      if (err.code !== 'ENOENT') {
        settle(_err(`Archive warning treated as error: ${err.message}`));
      }
    });

    if (onProgress) {
      archive.on('progress', (progress) => {
        onProgress({
          bytes: progress.fs.processedBytes,
          total: progress.fs.totalBytes,
        });
      });
    }

    archive.pipe(output);

    for (const item of sourceItems) {
      if (!fs.existsSync(item.localPath)) {
        // Caller already validated — silently skip anything that disappeared
        continue;
      }
      // false = use archiveName as the directory name inside the zip
      archive.directory(item.localPath, item.archiveName);
    }

    archive.finalize();
  });
}

// ─── Temp path helpers ─────────────────────────────────────────────────────────

/**
 * Build the local temp archive path for a deploy run.
 * All deploy artefacts for a run live under os.tmpdir()/sgd-deploy/{runId}/.
 *
 * @param   {string} runId  UUID for this deploy run.
 * @returns {string} Absolute path to deploy.zip
 */
function getTempArchivePath(runId, format) {
  const ext = (format === 'tar') ? 'tar' : 'zip';
  return path.join(os.tmpdir(), 'sgd-deploy', runId, `deploy.${ext}`);
}

/**
 * Delete the local temp directory for a deploy run.
 * Called in the finally block of deploy-service — safe to call even if the
 * directory was never created.
 *
 * @param {string} runId
 */
function cleanupLocal(runId) {
  try {
    const dir = path.join(os.tmpdir(), 'sgd-deploy', runId);
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (_) {
    // Silently swallow — local temp cleanup failure should never abort a deploy
  }
}

module.exports = { createArchive, getTempArchivePath, cleanupLocal };


