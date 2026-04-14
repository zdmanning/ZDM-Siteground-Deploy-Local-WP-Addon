import React, { useEffect, useState } from 'react';
import { getProfile, testSSHConnection } from '../ipc';
import StatusBadge from '../components/StatusBadge';

export default function ProfileDetail({ profileId, onDeploy, onViewLogs, onBack }) {
  const [profile, setProfile] = useState(null);
  const [testStatus, setTestStatus] = useState('idle'); // idle | testing | success | error
  const [testError, setTestError] = useState(null);

  useEffect(() => {
    getProfile(profileId).then((result) => setProfile(result.data || result));
  }, [profileId]);

  async function handleTest() {
    setTestStatus('testing');
    setTestError(null);
    const result = await testSSHConnection(profileId);
    if (result.success) {
      setTestStatus('success');
    } else {
      setTestStatus('error');
      setTestError(result.error || 'Connection failed.');
    }
  }

  if (!profile) return <p>Loading…</p>;

  const rows = [
    ['SSH host', `${profile.sshHost}:${profile.sshPort}`],
    ['Username', profile.sshUser],
    ['Remote web root', profile.remoteWebRoot],
    ['Production domain', profile.productionDomain],
    ['Created', new Date(profile.createdAt).toLocaleString()],
    ['Last deployed', profile.lastDeployedAt ? new Date(profile.lastDeployedAt).toLocaleString() : 'Never'],
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>{profile.name}</h2>
      </div>

      <div className="sgd-card">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #e2e6ea' }}>
                <td style={{ padding: '7px 8px 7px 0', color: '#6c757d', width: '38%' }}>{label}</td>
                <td style={{ padding: '7px 0', fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SSH test */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button
          className="sgd-btn sgd-btn--ghost sgd-btn--sm"
          onClick={handleTest}
          disabled={testStatus === 'testing'}
        >
          {testStatus === 'testing' ? 'Testing…' : 'Test SSH connection'}
        </button>
        {testStatus === 'success' && <StatusBadge status="success" />}
        {testStatus === 'error' && <StatusBadge status="error" label={testError} />}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="sgd-btn sgd-btn--primary" onClick={() => onDeploy(profileId)}>
          Deploy →
        </button>
        <button className="sgd-btn sgd-btn--secondary" onClick={() => onViewLogs(profileId)}>
          View logs
        </button>
      </div>
    </div>
  );
}
