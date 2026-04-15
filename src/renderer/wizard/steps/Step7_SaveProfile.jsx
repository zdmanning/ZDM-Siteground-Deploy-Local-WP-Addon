/**
 * Step 7 — Review and Save Profile
 * Shows a full summary of all collected data.
 * The actual profile save happens here — not before.
 * Handles both new saves and updates if the user navigated back and returned.
 */
import React, { useState } from 'react';
import { saveProfile } from '../../ipc';
import StatusBadge from '../../components/StatusBadge';

const STATUS = {
  IDLE: 'idle',
  SAVING: 'saving',
  DONE: 'done',
  ERROR: 'error',
};

export default function Step7_SaveProfile({ data, onChange, onNext, onBack }) {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);

  async function handleSave() {
    setStatus(STATUS.SAVING);
    setError(null);
    try {
      const result = await saveProfile(data);
      // saveProfile now returns { success, data: profile } or { success: false, error }
      const saved = result.data || result;
      if (result.success === false) throw new Error(result.error || 'Save failed.');
      onChange({ id: saved.id });
      setStatus(STATUS.DONE);
    } catch (err) {
      setStatus(STATUS.ERROR);
      setError(err?.message || 'Save failed. Please try again.');
    }
  }

  const rows = [
    { label: 'Profile name',       value: data.name },
    { label: 'SSH host',           value: `${data.sshHost}:${data.sshPort}` },
    { label: 'SSH username',       value: data.sshUser },
    { label: 'Remote web root',    value: data.remoteWebRoot },
    {
      label: 'SSH key',
      value: `Ed25519 · ID: ${data.keyId?.slice(0, 8)}…`,
    },
    {
      label: 'Connection test',
      value: data.connectionTestPassed ? 'Passed ✓' : 'Not tested / skipped',
      highlight: !data.connectionTestPassed,
    },
  ];

  return (
    <div className="sgd-wizard__step">
      <div className="sgd-wizard__step-icon">💾</div>
      <h2 className="sgd-wizard__heading">Review and save</h2>
      <p className="sgd-wizard__subheading">
        Confirm your settings below, then save the profile. You can edit any
        field by going back.
      </p>

      <div className="sgd-wizard__body">
        {!data.connectionTestPassed && (
          <div className="sgd-alert sgd-alert--warning" style={{ marginBottom: 12 }}>
            <strong>Connection not verified.</strong> The SSH test was skipped
            or failed. You can save the profile and test it later from the
            profile detail view, but deploys will fail until connectivity is
            confirmed.
          </div>
        )}

        <div className="sgd-card sgd-card--compact">
          <table className="sgd-summary-table">
            <tbody>
              {rows.map(({ label, value, highlight }) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td style={highlight ? { color: '#856404' } : {}}>
                    {label === 'Remote web root' || label === 'SSH host' || label === 'SSH username' ? (
                      <span className="sgd-code-inline">{value}</span>
                    ) : value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {status === STATUS.ERROR && (
          <div className="sgd-alert sgd-alert--danger" style={{ marginTop: 12 }}>
            <strong>Could not save profile:</strong> {error}
          </div>
        )}

        {status === STATUS.DONE && (
          <div className="sgd-alert" style={{ background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', marginTop: 12 }}>
            <strong>Profile saved successfully.</strong>
          </div>
        )}
      </div>

      <div className="sgd-wizard__actions">
        <button
          className="sgd-btn sgd-btn--secondary"
          onClick={onBack}
          disabled={status === STATUS.SAVING || status === STATUS.DONE}
        >
          ← Back
        </button>

        {status === STATUS.DONE ? (
          <button className="sgd-btn sgd-btn--primary" onClick={onNext}>
            Finish →
          </button>
        ) : (
          <button
            className="sgd-btn sgd-btn--primary"
            onClick={handleSave}
            disabled={status === STATUS.SAVING}
          >
            {status === STATUS.SAVING ? 'Saving…' : status === STATUS.ERROR ? 'Retry save' : 'Save profile'}
          </button>
        )}
      </div>
    </div>
  );
}


