import React, { useState, useEffect } from 'react';
import { deleteOrphanedKeys, getSettings, updateSettings } from '../ipc';

export default function Settings({ onBack }) {
  const [keyStatus, setKeyStatus] = useState(null);  // null | 'running' | { deleted: number } | { error: string }
  const [confirmDefault, setConfirmDefault] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    getSettings().then((res) => {
      if (res.success) setConfirmDefault(Boolean(res.data.confirmDefault));
      setSettingsLoaded(true);
    });
  }, []);

  async function handleConfirmDefaultChange(val) {
    setConfirmDefault(val);
    await updateSettings({ confirmDefault: val });
  }

  async function handleClearOrphanedKeys() {
    setKeyStatus('running');
    const result = await deleteOrphanedKeys();
    if (result.success) {
      setKeyStatus({ deleted: result.data.deleted });
    } else {
      setKeyStatus({ error: result.error });
    }
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>Settings</h2>
      </div>

      <div className="sgd-card">
        <div className="sgd-card__title">SiteGround Deploy v1.0.0</div>
        <div className="sgd-card__meta" style={{ marginTop: 4 }}>
          Deploy Local WordPress sites to SiteGround via SSH.
        </div>
      </div>

      <div className="sgd-card">
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Default SSH port</p>
        <p style={{ margin: 0, fontSize: 12, color: '#6c757d' }}>
          SiteGround uses port <strong>18765</strong>. This is pre-filled when
          creating a new profile and does not need to be changed unless your
          hosting plan uses a different port.
        </p>
      </div>

      <div className="sgd-card">
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>SSH key storage</p>
        <p style={{ margin: 0, fontSize: 12, color: '#6c757d' }}>
          Generated key pairs are stored in Local's data directory on this machine.
          Private keys never leave this computer.
        </p>
      </div>

      <div className="sgd-card">
        <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Danger-zone confirmation checkbox default</p>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6c757d' }}>
          Controls whether the <em>"I have read the above"</em> checkbox on full deploy
          and database deploy screens starts pre-checked or unchecked. Individual profiles
          can override this setting.
        </p>
        {settingsLoaded ? (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={confirmDefault}
              onChange={(e) => handleConfirmDefaultChange(e.target.checked)}
            />
            Pre-check the confirmation checkbox by default
          </label>
        ) : (
          <span style={{ fontSize: 12, color: '#6c757d' }}>Loading…</span>
        )}
      </div>

      <div className="sgd-card">
        <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Clear orphaned keys</p>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6c757d' }}>
          Deletes any key files on disk that no longer have a matching profile.
          Keys belonging to existing profiles are never touched.
        </p>
        <button
          className="sgd-btn sgd-btn--danger sgd-btn--sm"
          onClick={handleClearOrphanedKeys}
          disabled={keyStatus === 'running'}
        >
          {keyStatus === 'running' ? 'Clearing…' : 'Clear Orphaned Keys'}
        </button>
        {keyStatus && keyStatus !== 'running' && (
          <p style={{ margin: '8px 0 0', fontSize: 12, color: keyStatus.error ? '#dc3545' : '#28a745' }}>
            {keyStatus.error
              ? `Error: ${keyStatus.error}`
              : keyStatus.deleted === 0
                ? 'No orphaned keys found.'
                : `Cleared ${keyStatus.deleted} orphaned key${keyStatus.deleted !== 1 ? 's' : ''}.`}
          </p>
        )}
      </div>

      {/* Placeholder for future settings */}
      <div className="sgd-alert sgd-alert--info" style={{ marginTop: 16 }}>
        Additional settings (WP-CLI path, remote backup directory, etc.) will
        appear here in a future release.
      </div>
    </div>
  );
}
