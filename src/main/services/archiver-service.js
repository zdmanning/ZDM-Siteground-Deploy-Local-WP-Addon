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
 * Create a zip archive from an array of source directory descriptors.
 *
 * @param {Array<{ localPath: string, archiveName: string }>} sourceItems
 * @param {string}   destPath     Absolute path for the output .zip file.
 * @param {function} [onProgress] Called with { bytes, total } during write.
 * @returns {Promise<
 *   { success: true,  data: { destPath: string, sizeBytes: number } } |
 *   { success: false, error: string }
 * >}
 */
function createArchive(sourceItems, destPath, onProgress) {
  return new Promise((resolve) => {
    // Ensure the destination directory exists
    try {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
    } catch (err) {
      return resolve(_err(`Cannot create temp directory: ${err.message}`));
    }

    let output;
    try {
      output = fs.createWriteStream(destPath);
    } catch (err) {
      return resolve(_err(`Cannot open archive file for writing: ${err.message}`));
    }

    const archive = archiverLib('zip', { zlib: { level: 6 } });
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
function getTempArchivePath(runId) {
  return path.join(os.tmpdir(), 'sgd-deploy', runId, 'deploy.zip');
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

