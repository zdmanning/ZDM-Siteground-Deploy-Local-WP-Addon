/**
 * Archiver service (stub)
 *
 * Creates a zip archive of local file paths for upload during code deploy.
 * Uses the `archiver` npm package for streaming zip creation.
 *
 * @param {string[]} sourcePaths  - absolute local paths to include
 * @param {string}   destPath     - absolute path for the output .zip file
 * @returns {Promise<string>}     - resolves with destPath when complete
 */

const archiverLib = require('archiver');
const fs = require('fs');
const path = require('path');

async function createArchive(sourcePaths, destPath) {
  // TODO: implement real zip using archiver
  console.log('[Archiver] createArchive stub — would zip:', sourcePaths, '→', destPath);
  // Write an empty placeholder so SFTP upload can be tested
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, '', 'binary');
  return destPath;
}

module.exports = { createArchive };
