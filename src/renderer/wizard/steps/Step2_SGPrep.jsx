/**
 * Step 2 — SiteGround Preparation
 * Instructs the user to locate or create an SSH user in SiteGround
 * before proceeding. The add-on will generate the actual key in a later step.
 */
import React from 'react';

export default function Step2_SGPrep({ onNext, onBack }) {
  return (
    <div className="sgd-wizard__step">
      <div className="sgd-wizard__step-icon">🌐</div>
      <h2 className="sgd-wizard__heading">Prepare SiteGround first</h2>
      <p className="sgd-wizard__subheading">
        Before we generate your SSH key, you need to locate your SSH credentials
        in the SiteGround User Area.
      </p>

      <div className="sgd-wizard__body">
        <div className="sgd-alert sgd-alert--warning">
          <strong>Do this now before clicking Next.</strong> You will need the SSH
          host and username from SiteGround to fill in the next screen.
        </div>

        <div className="sgd-steps-list">
          <div className="sgd-steps-list__item">
            <div className="sgd-steps-list__num">1</div>
            <div>
              <strong>Log in to the SiteGround User Area</strong>
              <p>
                Go to{' '}
                <span className="sgd-code-inline">my.siteground.com</span> and
                sign in to your account.
              </p>
            </div>
          </div>

          <div className="sgd-steps-list__item">
            <div className="sgd-steps-list__num">2</div>
            <div>
              <strong>Open the SSH Manager for your site</strong>
              <p>
                Navigate to <strong>Site Tools</strong> for your target
                site, then go to{' '}
                <strong>Devs → SSH Keys Manager</strong>.
              </p>
            </div>
          </div>

          <div className="sgd-steps-list__item">
            <div className="sgd-steps-list__num">3</div>
            <div>
              <strong>Note your SSH credentials</strong>
              <p>
                Your login credentials (host, username, and port) are located right there on the right side of the same page under <strong>SSH Credentials</strong>.
              </p>
            </div>
          </div>

          <div className="sgd-steps-list__item">
            <div className="sgd-steps-list__num">4</div>
            <div>
              <strong>Do not create an SSH key there yet</strong>
              <p>
                This wizard will generate a new SSH key pair for you locally.
                You'll paste the public key into SiteGround in a later step —
                not now.
              </p>
            </div>
          </div>
        </div>

        <div className="sgd-alert sgd-alert--info" style={{ marginTop: 16 }}>
          <strong>SiteGround uses port 18765</strong> for SSH, not the standard
          port 22. This will be pre-filled for you on the next screen.
        </div>
      </div>

      <div className="sgd-wizard__actions">
        <button className="sgd-btn sgd-btn--secondary" onClick={onBack}>
          ← Back
        </button>
        <button className="sgd-btn sgd-btn--primary" onClick={onNext}>
          I have my SSH details → Next
        </button>
      </div>
    </div>
  );
}
