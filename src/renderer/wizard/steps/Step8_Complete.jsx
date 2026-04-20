/**
 * Step 8 — Complete
 * Confirms the profile is saved and ready to use.
 * Offers two exits: go to the profile detail view, or go straight to deploy.
 */
import React from 'react';

export default function Step8_Complete({ data, onComplete, onGoToDeploy }) {
  return (
    <div className="sgd-wizard__step sgd-wizard__step--centered">
      <div className="sgd-wizard__step-icon sgd-wizard__step-icon--large">🎉</div>
      <h2 className="sgd-wizard__heading">You're all set!</h2>
      <p className="sgd-wizard__subheading">
        <strong>{data.name}</strong> is saved and ready to use.
      </p>

      <div className="sgd-wizard__body">
        <div className="sgd-alert" style={{ background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', marginBottom: 20 }}>
          <strong>Profile created:</strong> {data.name}
          <br />
          <span style={{ fontSize: '12px' }}>
            Targets: <strong>{data.remoteWebRoot}</strong>
          </span>
        </div>

        <div className="sgd-info-list">
          <div className="sgd-info-list__item">
            <span className="sgd-info-list__icon">♻️</span>
            <div>
              <strong>Reusable</strong>
              <p>
                Your connection settings are saved. Select this profile any time
                from the dashboard to deploy again — no re-setup needed.
              </p>
            </div>
          </div>
          <div className="sgd-info-list__item">
            <span className="sgd-info-list__icon">�</span>
            <div>
              <strong>Three deploy modes available</strong>
              <p>
                <strong>Code only</strong> pushes themes and plugins.{' '}
                <strong>Full deploy</strong> also replaces the production database.{' '}
                <strong>Database only</strong> overwrites just the remote database.
              </p>
            </div>
          </div>
          {!data.connectionTestPassed && (
            <div className="sgd-info-list__item">
              <span className="sgd-info-list__icon">⚠️</span>
              <div>
                <strong>Connection not yet tested</strong>
                <p>
                  Open the profile and click <em>Test SSH connection</em> before
                  running your first deploy to confirm everything is working.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sgd-wizard__actions sgd-wizard__actions--centered">
        <button
          className="sgd-btn sgd-btn--secondary"
          onClick={() => onComplete(data)}
        >
          View profile
        </button>
        <button
          className="sgd-btn sgd-btn--primary"
          onClick={() => onGoToDeploy ? onGoToDeploy(data) : onComplete(data)}
        >
          Deploy now →
        </button>
      </div>
    </div>
  );
}


