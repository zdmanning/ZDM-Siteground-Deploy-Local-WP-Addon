/**
 * SFTP service (stub)
 *
 * Uploads files from local disk to the remote server via SFTP.
 * Uses ssh2-sftp-client built on top of the same ssh2 connection.
 */

async function uploadFile(profile, localPath, remotePath, onProgress) {
  // TODO: implement real SFTP upload using ssh2-sftp-client
  console.log(`[SFTPService] uploadFile stub: ${localPath} → ${remotePath}`);
  onProgress && onProgress({ bytes: 0, total: 0 });
  return { success: false, error: 'SFTP upload not yet implemented' };
}

module.exports = { uploadFile };
