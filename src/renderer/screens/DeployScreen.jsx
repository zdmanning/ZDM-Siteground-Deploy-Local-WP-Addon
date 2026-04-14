import React, { useState, useEffect, useRef } from 'react';
import { getProfile, runCodeDeploy, runFullDeploy, onLogEntry } from '../ipc';

const CONFIRM_PHRASE = 'deploy to production';

export default function DeployScreen({ profileId, onViewLogs, onBack }) {
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState('code'); // 'code' | 'full'
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);         // { success, error?, backupPath? }
  const [logEntries, setLogEntries] = useState([]);

  // Full-deploy confirmation state
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const confirmed_computed = confirmPhrase.trim().toLowerCase() === CONFIRM_PHRASE;

  const logRef = useRef(null);

  useEffect(() => {
    getProfile(profileId).then(setProfile);
  }, [profileId]);

  // Subscribe to real-time log streaming
  useEffect(() => {
    const unsub = onLogEntry((entry) => {
      setLogEntries((prev) => [...prev, entry]);
    });
    return unsub;
  }, []);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logEntries]);

  async function handleDeploy() {
    setRunning(true);
    setResult(null);
    setLogEntries([]);

    const options = mode === 'full' ? { confirmed: confirmed_computed } : {};
    const fn = mode === 'full' ? runFullDeploy : runCodeDeploy;
    const res = await fn(profileId, options);

    setResult(res);
    setRunning(false);
  }

  const canDeploy = mode === 'code' || (mode === 'full' && confirmed_computed && confirmed);

  if (!profile) return <p>Loading…</p>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>Deploy — {profile.name}</h2>
      </div>

      {/* Mode selector */}
      <div className="sgd-card">
        <p style={{ margin: '0 0 10px', fontWeight: 600 }}>Deploy mode</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {['code', 'full'].map((m) => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="deploy-mode"
                value={m}
                checked={mode === m}
                onChange={() => { setMode(m); setConfirmPhrase(''); setConfirmed(false); }}
              />
              {m === 'code' ? 'Code only (themes + plugins)' : 'Full deploy (code + database)'}
            </label>
          ))}
        </div>
      </div>

      {/* Full deploy danger confirmation */}
      {mode === 'full' && (
        <div className="sgd-alert sgd-alert--danger">
          <strong>⚠ Danger — database will be overwritten.</strong>
          <p style={{ margin: '8px 0' }}>
            This will replace the database at <strong>{profile.productionDomain}</strong> with
            your local database. A remote backup will be created first, but this action cannot
            be reversed automatically.
          </p>
          <div className="sgd-field" style={{ marginBottom: 8 }}>
            <label>Type <em>{CONFIRM_PHRASE}</em> to confirm:</label>
            <input
              type="text"
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              autoComplete="off"
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I have verified the correct profile is selected and I understand this will overwrite production data.
          </label>
        </div>
      )}

      {/* Deploy button */}
      <div style={{ margin: '16px 0' }}>
        <button
          className={`sgd-btn ${mode === 'full' ? 'sgd-btn--danger' : 'sgd-btn--primary'}`}
          onClick={handleDeploy}
          disabled={running || !canDeploy}
        >
          {running ? 'Deploying…' : mode === 'full' ? 'Deploy (code + database)' : 'Deploy code'}
        </button>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`sgd-alert ${result.success ? '' : 'sgd-alert--danger'}`}
          style={result.success ? { background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724' } : {}}>
          {result.success
            ? `Deploy complete.${result.backupPath ? ` Remote backup: ${result.backupPath}` : ''}`
            : `Deploy failed: ${result.error}`}
        </div>
      )}

      {/* Live log */}
      {logEntries.length > 0 && (
        <div className="sgd-log" ref={logRef}>
          {logEntries.map((e, i) => (
            <div key={i} className={`sgd-log__entry--${e.level}`}>
              <span style={{ color: '#555', marginRight: 8 }}>
                {new Date(e.timestamp).toLocaleTimeString()}
              </span>
              {e.message}
            </div>
          ))}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 12 }}>
          <button className="sgd-btn sgd-btn--ghost sgd-btn--sm" onClick={() => onViewLogs(profileId)}>
            View full log history
          </button>
        </div>
      )}
    </div>
  );
}
