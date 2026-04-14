/**
 * SFTPService
 *
 * Uploads files from the local machine to the remote server via SFTP.
 * Uses ssh2-sftp-client which is built on top of ssh2.
 *
 * All connections use key-based auth — passwords are never used.
 * Key content is read from disk here. It never reaches the renderer.
 *
 * ── Result envelope ────────────────────────────────────────────────────────────
 *   { success: true,  data: { remotePath } }
 *   { success: false, error: string }
 */

'use strict';

const SftpClient = require('ssh2-sftp-client');
const fs         = require('fs');
const path       = require('path');
const keyManager = require('./key-manager');

function _ok(data)   { return { success: true,  data  }; }
function _err(error) { return { success: false, error }; }

/**
 * Upload a local file to a remote path via SFTP.
 * Automatically creates the remote parent directory if it does not exist.
 *
 * @param {object}   profile
 * @param {string}   localPath    Absolute path to the local file.
 * @param {string}   remotePath   Absolute path on the remote server.
 *                                Must use forward slashes (POSIX).
 * @param {function} [onProgress] Called with { bytes, total, percent }.
 * @returns {Promise<
 *   { success: true,  data: { remotePath: string } } |
 *   { success: false, error: string }
 * >}
 */
async function uploadFile(profile, localPath, remotePath, onProgress) {
  // ── Resolve key ───────────────────────────────────────────────────────────
  const privateKeyPath = keyManager.getPrivateKeyPath(profile.keyId);
  if (!privateKeyPath) {
    return _err(
      'SSH private key not found. The key may have been deleted or the profile ' +
      'is missing a keyId. Open the profile and regenerate the key.'
    );
  }

  let privateKey;
  try {
    privateKey = await fs.promises.readFile(privateKeyPath, 'utf8');
  } catch (err) {
    return _err(`Cannot read SSH private key: ${err.message}`);
  }

  // ── Validate local file ───────────────────────────────────────────────────
  if (!fs.existsSync(localPath)) {
    return _err(`Local file not found: ${localPath}`);
  }

  const localStat  = fs.statSync(localPath);
  const totalBytes = localStat.size;

  // ── SFTP upload ───────────────────────────────────────────────────────────
  const sftp = new SftpClient('sgd-sftp');
  try {
    await sftp.connect({
      host:              profile.sshHost,
      port:              Number(profile.sshPort) || 18765,
      username:          profile.sshUser,
      privateKey,
      keepaliveInterval: 10_000,
      readyTimeout:      20_000,
      // Disable host key verification — same policy as ssh-service.js
      // TODO: TOFU host key pinning per profile.
      hostVerifier:      () => true,
    });

    // Ensure the remote parent directory exists.
    // mkdir(path, recursive?) — recursive=true silently succeeds if path exists.
    const remoteDir = path.posix.dirname(remotePath);
    try {
      await sftp.mkdir(remoteDir, true);
    } catch (mkdirErr) {
      // Suppress only "already exists" — surface genuine errors (e.g. permission denied).
      const msg = (mkdirErr.message || '').toLowerCase();
      if (!msg.includes('exist') && !msg.includes('failure') && mkdirErr.code !== 4) {
        throw mkdirErr;
      }
    }

    await sftp.fastPut(localPath, remotePath, {
      step: (transferred, _chunk, total) => {
        if (onProgress) {
          const t = total || totalBytes;
          onProgress({
            bytes:   transferred,
            total:   t,
            percent: t > 0 ? Math.round((transferred / t) * 100) : 0,
          });
        }
      },
    });

    return _ok({ remotePath });

  } catch (err) {
    return _err(_friendlyError(err));
  } finally {
    try { await sftp.end(); } catch (_) {}
  }
}

// ─── Error mapping ─────────────────────────────────────────────────────────────

function _friendlyError(err) {
  const msg  = (err.message || '').toLowerCase();
  const code = err.code || '';

  if (code === 'ECONNREFUSED') return 'SFTP: Connection refused. Check the SSH host and port.';
  if (code === 'ETIMEDOUT')    return 'SFTP: Connection timed out.';
  if (code === 'ENOTFOUND')    return 'SFTP: Host not found. Check the hostname.';
  if (code === 'ECONNRESET')   return 'SFTP: Connection was reset by the server. Try again.';
  if (msg.includes('permission denied')) return 'SFTP: Permission denied — check the SSH key is still active in SiteGround.';
  if (msg.includes('no such file'))      return `SFTP: Remote path parent does not exist: ${err.message}`;
  if (msg.includes('authentication'))    return 'SFTP: Authentication failed — SSH key may need to be re-added to SiteGround.';
  return err.message || String(err);
}

module.exports = { uploadFile };

