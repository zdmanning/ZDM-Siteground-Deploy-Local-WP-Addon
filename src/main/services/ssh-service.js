/**
 * SSHService
 *
 * Handles SSH connection testing and remote command execution.
 * Uses the ssh2 library directly for maximum control over streams and errors.
 * All connections use key-based auth — passwords are never stored or used.
 *
 * SiteGround-specific defaults:
 *   port:              18765  (SiteGround does NOT use standard port 22)
 *   keepaliveInterval: 10 000 ms
 *   readyTimeout:      20 000 ms  (20 s — generous for cold starts)
 *
 * Private keys are read from disk in OpenSSH PEM format.
 * Key content NEVER leaves the main process — the renderer only receives
 * the result envelope (success ✓ / error message).
 *
 * ── Result envelope ────────────────────────────────────────────────────────────
 *   { success: true,  data: { ... } }
 *   { success: false, error: string }
 * All exported functions resolve with this shape and never throw.
 */

'use strict';

const { Client } = require('ssh2');
const fs         = require('fs');
const keyManager = require('./key-manager');

// ─── Connection config builder ─────────────────────────────────────────────────

/**
 * Build an ssh2 ConnectConfig from a profile.
 * Reads the private key from disk — content never touches the renderer.
 *
 * @param {object} profile
 * @returns {object}  ssh2 ConnectConfig
 * @throws {Error}    if the private key file is missing
 */
async function _buildConnectConfig(profile) {
  const privateKeyPath = keyManager.getPrivateKeyPath(profile.keyId);
  if (!privateKeyPath) {
    const e = new Error(
      `No private key found for keyId ${profile.keyId}. ` +
      'The key may have been deleted or the profile was created on another machine.'
    );
    e.code = 'MISSING_KEY';
    throw e;
  }

  let privateKey;
  try {
    privateKey = await fs.promises.readFile(privateKeyPath, 'utf8');
  } catch (err) {
    const e = new Error(`Cannot read private key file: ${err.message}`);
    e.code = 'KEY_READ_ERROR';
    throw e;
  }

  return {
    host:              profile.sshHost,
    port:              Number(profile.sshPort) || 18765,
    username:          profile.sshUser,
    privateKey,
    keepaliveInterval: 10_000,
    readyTimeout:      20_000,
    // Disable host key checking for now.
    // TODO: implement TOFU (trust-on-first-use) host key pinning per profile.
    hostVerifier:      () => true,
  };
}

// ─── Error message helpers ─────────────────────────────────────────────────────

/**
 * Convert a raw ssh2/Node.js network error into a user-friendly string.
 * Covers every realistic failure path for SiteGround SSH connections.
 *
 * @param {Error}  err
 * @param {object} [opts]
 * @param {string} [opts.host]  Used in ECONNREFUSED / ENOTFOUND messages
 * @returns {string}
 */
function _friendlyError(err, opts = {}) {
  const msg  = (err.message || String(err)).toLowerCase();
  const code = err.code || '';
  const host = opts.host || 'server';

  // ── Network-level ──────────────────────────────────────────────────────────
  if (code === 'MISSING_KEY' || code === 'KEY_READ_ERROR') {
    return (
      'SSH key file not found on this machine. ' +
      'Return to Step 4 and regenerate the key for this profile.'
    );
  }
  if (code === 'ECONNREFUSED') {
    return (
      `Connection refused by ${host}. ` +
      'Check that the SSH port is correct — SiteGround uses port 18765, not 22.'
    );
  }
  if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT') {
    return (
      'Connection timed out. The server may be unreachable, or the port is ' +
      'blocked by a firewall. Try again or check your SiteGround SSH settings.'
    );
  }
  if (code === 'ENOTFOUND') {
    return (
      `Host "${host}" could not be resolved. ` +
      'Check the SSH hostname in your SiteGround account.'
    );
  }
  if (code === 'ECONNRESET') {
    return 'The connection was reset by the server. Try again.';
  }

  // ── Authentication ─────────────────────────────────────────────────────────
  if (msg.includes('all configured authentication methods failed') ||
      msg.includes('authentication failed') ||
      msg.includes('no supported authentication methods') ||
      msg.includes('permission denied')) {
    return (
      'Authentication failed. Make sure you copied the public key into ' +
      'SiteGround > SSH Keys, clicked Activate, and waited 30 – 60 s for it to propagate.'
    );
  }
  if (msg.includes('publickey') && msg.includes('denied')) {
    return (
      'Public key rejected by the server. Verify the key is Active in SiteGround. ' +
      'If you regenerated the key, you must re-add the new public key.'
    );
  }

  // ── Protocol ───────────────────────────────────────────────────────────────
  if (msg.includes('handshake') || msg.includes('kex') || msg.includes('unsupported')) {
    return (
      'SSH handshake failed. The server may not support Ed25519 keys or the ' +
      'connection was interrupted during negotiation.'
    );
  }
  if (msg.includes('host key') || msg.includes('fingerprint')) {
    return (
      'Host key mismatch. If you recently changed servers, the saved host key ' +
      'is no longer valid.'
    );
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  return err.message || String(err);
}

// ─── Result helpers ────────────────────────────────────────────────────────────

function _ok(data)   { return { success: true,  data  }; }
function _err(error) { return { success: false, error }; }

// ─── Exported service functions ────────────────────────────────────────────────

/**
 * Test an SSH connection by connecting AND running a harmless command.
 *
 * Running `pwd` verifies that:
 *   1. The TCP connection can be established
 *   2. The SSH handshake succeeds
 *   3. The private key is accepted (authentication)
 *   4. A shell session can be opened (exec permission)
 *
 * Resolves with a structured result — never throws.
 *
 * @param {object} profile  Profile or raw wizard data with: sshHost, sshPort, sshUser, keyId
 * @returns {Promise<
 *   { success: true,  data: { host: string, user: string, output: string } } |
 *   { success: false, error: string }
 * >}
 */
async function testConnection(profile) {
  if (!profile || !profile.sshHost || !profile.sshUser) {
    return _err('SSH host and username are required.');
  }

  let config;
  try {
    config = await _buildConnectConfig(profile);
  } catch (err) {
    return _err(_friendlyError(err, { host: profile.sshHost }));
  }

  return new Promise((resolve) => {

    const conn     = new Client();
    let   settled  = false;

    function settle(result) {
      if (!settled) {
        settled = true;
        try { conn.destroy(); } catch (_) {}
        resolve(result);
      }
    }

    conn
      .on('ready', () => {
        // Run a harmless diagnostic command. `pwd` confirms shell access.
        // Also run `whoami` to confirm the username, separated by " | ".
        conn.exec('pwd && whoami', (err, stream) => {
          if (err) {
            // Connection opened but exec failed — still a meaningful partial success.
            // Treat it as success (auth worked) but note the exec error.
            return settle(_ok({
              host:   profile.sshHost,
              user:   profile.sshUser,
              output: '(shell exec unavailable — but auth succeeded)',
            }));
          }

          let output = '';
          stream
            .on('close', (exitCode) => {
              settle(_ok({
                host:     profile.sshHost,
                user:     profile.sshUser,
                output:   output.trim() || '(no output)',
                exitCode: exitCode || 0,
              }));
            })
            .on('data',           (d) => { output += d.toString(); })
            .stderr.on('data',    (d) => { output += d.toString(); });
        });
      })
      .on('error', (err) => {
        settle(_err(_friendlyError(err, { host: profile.sshHost })));
      })
      .connect(config);

    // Belt-and-suspenders timeout in case ssh2's own readyTimeout misfires
    setTimeout(() => {
      settle(_err(
        'Connection timed out after 25 s. The server may be unreachable or the ' +
        'port is blocked by a firewall.'
      ));
    }, 25_000);
  });
}

/**
 * Execute a single command on the remote server.
 * Streams stdout/stderr to onData as string chunks.
 *
 * @param {object}   profile
 * @param {string}   command
 * @param {function} [onData]  Called with each stdout/stderr chunk
 * @returns {Promise<{ success: true, data: { exitCode: number } } | { success: false, error: string }>}
 */
async function execCommand(profile, command, onData) {
  let config;
  try {
    config = await _buildConnectConfig(profile);
  } catch (err) {
    return _err(_friendlyError(err, { host: profile.sshHost }));
  }

  return new Promise((resolve) => {

    const conn = new Client();

    conn
      .on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return resolve(_err(`Exec failed: ${err.message}`));
          }
          stream
            .on('close', (code) => {
              conn.end();
              resolve(_ok({ exitCode: code || 0 }));
            })
            .on('data',        (d) => onData && onData(d.toString()))
            .stderr.on('data', (d) => onData && onData(d.toString()));
        });
      })
      .on('error', (err) => {
        resolve(_err(_friendlyError(err, { host: profile.sshHost })));
      })
      .connect(config);
  });
}

/**
 * Open a persistent SSH connection and return a handle for multiple sequential
 * exec calls (used by the deploy engine to avoid reconnecting between steps).
 * Caller MUST call handle.end() when finished.
 *
 * @param {object} profile
 * @returns {Promise<{ success: true, data: { exec: Function, end: Function } } | { success: false, error: string }>}
 */
async function openConnection(profile) {
  return new Promise(async (resolve) => {
    let config;
    try {
      config = await _buildConnectConfig(profile);
    } catch (err) {
      return resolve(_err(_friendlyError(err, { host: profile.sshHost })));
    }

    const conn    = new Client();
    let   settled = false;

    function settle(result) {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    }

    conn
      .on('ready', () => {
        settle(_ok({
          /**
           * Run a remote command. Resolves with { exitCode } — never rejects.
           * @param {string}   command
           * @param {function} [onData]      Called with each stdout/stderr chunk.
           * @param {number}   [timeoutMs]   Per-command timeout in ms (default 120 s).
           *                                 On timeout resolves { exitCode: -1, _timedOut: true }.
           */
          exec: (command, onData, timeoutMs = 120_000) =>
            new Promise((res) => {
              const timer = setTimeout(() => {
                res({ exitCode: -1, _timedOut: true });
              }, timeoutMs);

              conn.exec(command, (err, stream) => {
                if (err) {
                  clearTimeout(timer);
                  // Resolve (not reject) so callers always get an envelope.
                  return res({ exitCode: -1, _execError: err.message });
                }
                stream
                  .on('close', (code) => {
                    clearTimeout(timer);
                    res({ exitCode: code || 0 });
                  })
                  .on('data',        (d) => onData && onData(d.toString()))
                  .stderr.on('data', (d) => onData && onData(d.toString()));
              });
            }),

          end: () => new Promise((res) => { conn.end(); res(); }),
        }));
      })
      .on('error', (err) => {
        settle(_err(_friendlyError(err, { host: profile.sshHost })));
      })
      .connect(config);

    // Belt-and-suspenders timeout — same as testConnection.
    // Guards against ssh2's readyTimeout silently misfiring.
    setTimeout(() => {
      settle(_err(
        'SSH connection timed out after 25 s. The server may be unreachable or ' +
        'the port is blocked by a firewall.'
      ));
    }, 25_000);
  });
}

module.exports = {
  testConnection,
  execCommand,
  openConnection,
};
