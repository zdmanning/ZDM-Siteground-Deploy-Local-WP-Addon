/**
 * Step 1 — Introduction
 * Explains what the add-on does, what SSH is at a high level,
 * and that setup is mostly one-time.
 */
import React from 'react';

export default function Step1_Intro({ onNext, onCancel }) {
  return (
    <div className="sgd-wizard__step">
      <div className="sgd-wizard__step-icon">🚀</div>
      <h2 className="sgd-wizard__heading">SiteGround Deploy</h2>
      <p className="sgd-wizard__subheading">
        Deploy your Local WordPress site to SiteGround — directly from this panel.
      </p>

      <div className="sgd-wizard__body">
        <p>
          This add-on connects your <strong>Local site</strong> to a{' '}
          <strong>SiteGround-hosted WordPress site</strong> using SSH — a secure,
          encrypted tunnel for transferring files and running remote commands.
        </p>

        <div className="sgd-info-list">
          <div className="sgd-info-list__item">
            <span className="sgd-info-list__icon">📁</span>
            <div>
              <strong>Code deploy</strong>
              <p>Push your themes and plugins to production in seconds.</p>
            </div>
          </div>
          <div className="sgd-info-list__item">
            <span className="sgd-info-list__icon">🗄️</span>
            <div>
              <strong>Full deploy</strong>
              <p>
                Optionally push your local database too — with automatic remote
                backup and URL search-replace built in.
              </p>
            </div>
          </div>
          <div className="sgd-info-list__item">
            <span className="sgd-info-list__icon">🔑</span>
            <div>
              <strong>SSH key authentication</strong>
              <p>
                Your SSH key pair is generated locally and stored on this machine.
                No passwords involved.
              </p>
            </div>
          </div>
          <div className="sgd-info-list__item">
            <span className="sgd-info-list__icon">♻️</span>
            <div>
              <strong>Saved profiles</strong>
              <p>
                Set up once, deploy many times. Your connection settings are stored
                so you never re-enter them.
              </p>
            </div>
          </div>
        </div>

        <div className="sgd-alert sgd-alert--info" style={{ marginTop: 16 }}>
          <strong>This setup takes about 5 minutes</strong> and is a one-time process
          per deployment target. You'll need access to your SiteGround User Area.
        </div>
      </div>

      <div className="sgd-wizard__actions">
        <button className="sgd-btn sgd-btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="sgd-btn sgd-btn--primary" onClick={onNext}>
          Get started →
        </button>
      </div>
    </div>
  );
}
