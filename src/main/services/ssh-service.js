/**
 * SSHService
 *
 * Handles SSH connection testing and remote command execution.
 * Uses the ssh2 library directly for maximum control over streams and errors.
 * All connections use key-based auth — passwords are never stored or used.
 *
 * SiteGround-specific defaults:
 *   port: 18765  (not standard 22)
 *   keepaliveInterval: 10000
 *   readyTimeout: 20000
 *
 * Private keys are read from disk by keyManager in OpenSSH PEM format
 * (-----BEGIN OPENSSH PRIVATE KEY-----). Do not send key content to the renderer.
 */

const { Client } = require('ssh2');
const fs = require('fs');
const keyManager = require('./key-manager');

/**
 * Build an ssh2 ConnectConfig from a profile.
 * Reads the private key from disk — key content never touches the renderer.
 *
 * @param {object} profile
 * @returns {object} ssh2 ConnectConfig
 * @throws {Error} if the private key file is missing
 */
function _buildConnectConfig(profile) {
  const privateKeyPath = keyManager.getPrivateKeyPath(profile.keyId);
  if (!privateKeyPath) {
    throw new Error(
      `No private key found for keyId ${profile.keyId}. ` +
      'The key may have been deleted or the profile was created on another machine.'
    );
  }

  return {
    host:              profile.sshHost,
    port:              Number(profile.sshPort) || 18765,
    username:          profile.sshUser,
    privateKey:        fs.readFileSync(privateKeyPath, 'utf8'),  // OpenSSH PEM
    keepaliveInterval: 10000,
    readyTimeout:      20000,
    // Disable host key checking for now.
    // TODO: implement TOFU (trust-on-first-use) host key pinning per profile.
    hostVerifier:      () => true,
  };
}

/**
 * Test an SSH connection. Returns { success: true } on success or
 * { success: false, error: string } on any failure.
 * Never throws — all errors are returned in the result object.
 *
 * @param {object} profile  Profile or raw wizard data containing sshHost, sshPort, sshUser, keyId
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
function testConnection(profile) {
  return new Promise((resolve) => {
    if (!profile || !profile.sshHost || !profile.sshUser) {
      return resolve({ success: false, error: 'SSH host and username are required.' });
    }

    let config;
    try {
      config = _buildConnectConfig(profile);
    } catch (err) {
      return resolve({ success: false, error: err.message });
    }

    const conn = new Client();
    let settled = false;

    function settle(result) {
      if (!settled) {
        settled = true;
        try { conn.destroy(); } catch (_) { /* already closed */ }
        resolve(result);
      }
    }

    conn
      .on('ready', () => {
        settle({ success: true });
      })
      .on('error', (err) => {
        settle({ success: false, error: _friendlyError(err) });
      })
      .connect(config);
  });
}

/**
 * Execute a single command on the remote server.
 * Streams stdout/stderr to the onData callback as string chunks.
 *
 * @param {object}   profile
 * @param {string}   command
 * @param {function} onData   Called with each stdout/stderr string chunk
 * @returns {Promise<{ exitCode: number }>}
 */
function execCommand(profile, command, onData) {
  return new Promise((resolve, reject) => {
    let config;
    try {
      config = _buildConnectConfig(profile);
    } catch (err) {
      return reject(err);
    }

    const conn = new Client();

    conn
      .on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          stream
            .on('close', (exitCode) => {
              conn.end();
              resolve({ exitCode: exitCode || 0 });
            })
            .on('data', (data)         => onData && onData(data.toString()))
            .stderr.on('data', (data)  => onData && onData(data.toString()));
        });
      })
      .on('error', (err) => reject(err))
      .connect(config);
  });
}

/**
 * Open a persistent SSH connection and return a handle for multiple sequential
 * exec calls (used by the deploy engine to avoid reconnecting between steps).
 * Caller MUST call handle.end() when finished.
 *
 * @param {object} profile
 * @returns {Promise<{ exec: Function, end: Function }>}
 */
function openConnection(profile) {
  return new Promise((resolve, reject) => {
    let config;
    try {
      config = _buildConnectConfig(profile);
    } catch (err) {
      return reject(err);
    }

    const conn = new Client();

    conn
      .on('ready', () => {
        resolve({
          exec: (command, onData) =>
            new Promise((res, rej) =>
              conn.exec(command, (err, stream) => {
                if (err) return rej(err);
                stream
                  .on('close', (code) => res({ exitCode: code || 0 }))
                  .on('data',       (d) => onData && onData(d.toString()))
                  .stderr.on('data',(d) => onData && onData(d.toString()));
              })
            ),
          end: () => new Promise((res) => { conn.end(); res(); }),
        });
      })
      .on('error', (err) => reject(err))
      .connect(config);
  });
}

// ─── Error message helpers ─────────────────────────────────────────────────────

/**
 * Convert an ssh2 error into a user-friendly message.
 */
function _friendlyError(err) {
  const msg = err.message || String(err);
  const code = err.code || '';

  if (code === 'ECONNREFUSED')  return `Connection refused at ${err.address || 'host'}:${err.port || ''}. Check the host and port.`;
  if (code === 'ETIMEDOUT')     return 'Connection timed out. The server may be unreachable or the port may be blocked by a firewall.';
  if (code === 'ENOTFOUND')     return 'Host not found. Check that the hostname is correct.';
  if (/auth/i.test(msg))        return 'Authentication failed. Make sure you copied the public key into SiteGround and saved it.';
  if (/handshake/i.test(msg))   return 'SSH handshake failed. The server may not support Ed25519 keys.';
  return msg;
}

module.exports = {
  testConnection,
  execCommand,
  openConnection,
};

