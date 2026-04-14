import React from 'react';

export default function Settings({ onBack }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>Settings</h2>
      </div>

      <div className="sgd-card">
        <div className="sgd-card__title">SiteGround Deploy v0.1.0</div>
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

      {/* Placeholder for future settings */}
      <div className="sgd-alert sgd-alert--info" style={{ marginTop: 16 }}>
        Additional settings (WP-CLI path, remote backup directory, etc.) will
        appear here in a future release.
      </div>
    </div>
  );
}
