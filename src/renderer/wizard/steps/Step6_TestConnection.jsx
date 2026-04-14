/**
 * Step 6 — Test SSH Connection
 * Calls the backend with the raw profile data (no save required yet).
 * Shows clear pass / fail states.
 * Allows the user to skip if the backend is not yet implemented,
 * with a visible warning in the summary.
 */
import React, { useState } from 'react';
import { testSSHConnectionDirect } from '../../ipc';
import StatusBadge from '../../components/StatusBadge';

const STATUS = {
  IDLE: 'idle',
  TESTING: 'testing',
  SUCCESS: 'success',
  FAILED: 'failed',
};

export default function Step6_TestConnection({ data, onChange, onNext, onBack }) {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState(null);
  const [cmdOutput, setCmdOutput] = useState(null);

  async function runTest() {
    setStatus(STATUS.TESTING);
    setErrorMsg(null);
    setCmdOutput(null);

    try {
      const result = await testSSHConnectionDirect(data);

      if (result.success) {
        onChange({ connectionTestPassed: true });
        setCmdOutput((result.data && result.data.output) || null);
        setStatus(STATUS.SUCCESS);
      } else {
        onChange({ connectionTestPassed: false });
        setStatus(STATUS.FAILED);
        setErrorMsg(result.error || 'Connection refused or timed out.');
      }
    } catch (err) {
      onChange({ connectionTestPassed: false });
      setStatus(STATUS.FAILED);
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    }
  }

  function handleSkip() {
    onChange({ connectionTestPassed: false });
    onNext();
  }

  return (
    <div className="sgd-wizard__step">
      <div className="sgd-wizard__step-icon">
        {status === STATUS.SUCCESS ? '✅' : status === STATUS.FAILED ? '❌' : '🔒'}
      </div>
      <h2 className="sgd-wizard__heading">Test SSH connection</h2>
      <p className="sgd-wizard__subheading">
        Verify that this machine can reach your SiteGround server using the key
        you just activated.
      </p>

      <div className="sgd-wizard__body">
        {/* Connection summary card */}
        <div className="sgd-card sgd-card--compact" style={{ marginBottom: 16 }}>
          <table className="sgd-summary-table">
            <tbody>
              <tr>
                <td>Host</td>
                <td>
                  <span className="sgd-code-inline">
                    {data.sshHost}:{data.sshPort}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Username</td>
                <td>
                  <span className="sgd-code-inline">{data.sshUser}</span>
                </td>
              </tr>
              <tr>
                <td>Auth</td>
                <td>Ed25519 key (key ID: {data.keyId?.slice(0, 8)}…)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Status display */}
        {status === STATUS.IDLE && (
          <p style={{ color: '#6c757d', margin: 0 }}>
            Click <strong>Test Connection</strong> to verify SSH access.
          </p>
        )}

        {status === STATUS.TESTING && (
          <div className="sgd-keygen-status sgd-keygen-status--working">
            <div className="sgd-spinner" />
            <div>
              <strong>Testing connection…</strong>
              <p>Attempting to open an SSH session to {data.sshHost}.</p>
            </div>
          </div>
        )}

        {status === STATUS.SUCCESS && (
          <>
            <div className="sgd-alert" style={{ background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724' }}>
              <strong>✓ Connection successful.</strong> Your SSH key is working
              and the server is reachable. You can now save this profile.
            </div>
            {cmdOutput && (
              <div className="sgd-ssh-probe">
                <div className="sgd-ssh-probe__label">Server response (<code>pwd &amp;&amp; whoami</code>)</div>
                <pre className="sgd-ssh-probe__output">{cmdOutput}</pre>
              </div>
            )}
          </>
        )}

        {status === STATUS.FAILED && (
          <>
            <div className="sgd-alert sgd-alert--danger">
              <strong>Connection failed:</strong> {errorMsg}
            </div>
            <div className="sgd-alert sgd-alert--info" style={{ marginTop: 8 }}>
              <strong>Common causes:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                <li>The SSH key is not yet Active in SiteGround</li>
                <li>Wrong SSH host or username</li>
                <li>Wrong SSH port (SiteGround uses <strong>18765</strong>)</li>
                <li>SiteGround SSH access not enabled for this hosting plan</li>
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="sgd-wizard__actions">
        <button
          className="sgd-btn sgd-btn--secondary"
          onClick={onBack}
          disabled={status === STATUS.TESTING}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          {/* Always allow skip as an escape hatch — profile can be tested later */}
          {status !== STATUS.SUCCESS && (
            <button
              className="sgd-btn sgd-btn--ghost"
              onClick={handleSkip}
              disabled={status === STATUS.TESTING}
              title="Save profile without verifying — you can test it later from the profile detail view"
            >
              Skip for now
            </button>
          )}

          {status === STATUS.SUCCESS ? (
            <button className="sgd-btn sgd-btn--primary" onClick={onNext}>
              Save profile →
            </button>
          ) : (
            <button
              className="sgd-btn sgd-btn--primary"
              onClick={runTest}
              disabled={status === STATUS.TESTING}
            >
              {status === STATUS.FAILED ? 'Retry test' : 'Test connection'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
