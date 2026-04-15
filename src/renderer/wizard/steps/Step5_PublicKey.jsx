/**
 * Step 5 — Public Key Display
 * Shows the generated public key with a copy button.
 * Gives explicit step-by-step instructions for pasting it into SiteGround.
 * User must confirm they have activated the key before proceeding.
 */
import React, { useState } from 'react';
import CopyableCode from '../../components/CopyableCode';

export default function Step5_PublicKey({ data, onNext, onBack }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="sgd-wizard__step">
      <div className="sgd-wizard__step-icon">📋</div>
      <h2 className="sgd-wizard__heading">Add your public key to SiteGround</h2>
      <p className="sgd-wizard__subheading">
        Copy the key below and paste it exactly as shown into your SiteGround
        SSH Keys Manager. Do not modify it.
      </p>

      <div className="sgd-wizard__body">
        <CopyableCode
          value={data.publicKey}
          label="Your public key — copy this entire value"
        />

        <div className="sgd-steps-list" style={{ marginTop: 20 }}>
          <div className="sgd-steps-list__item">
            <div className="sgd-steps-list__num">1</div>
            <div>
              <strong>Go to your SiteGround User Area</strong>
              <p>
                Open{' '}
                <span className="sgd-code-inline">my.siteground.com</span> in
                your browser.
              </p>
            </div>
          </div>

          <div className="sgd-steps-list__item">
            <div className="sgd-steps-list__num">2</div>
            <div>
              <strong>Navigate to SSH Keys Manager</strong>
              <p>
                In your site's <strong>Site Tools</strong>, go to <strong>Devs → SSH Keys Manager</strong>, then select the <strong>Import</strong> tab.
              </p>
            </div>
          </div>

          <div className="sgd-steps-list__item">
            <div className="sgd-steps-list__num">3</div>
            <div>
              <strong>Import your new SSH key</strong>
              <p>
                Choose a name for your key (e.g. "Local Deploy") and paste the public key from above into the{' '}
                <strong>Public Key</strong> field. It must begin with{' '}
                <span className="sgd-code-inline">ssh-ed25519</span>.
              </p>
            </div>
          </div>

          <div className="sgd-steps-list__item">
            <div className="sgd-steps-list__num">4</div>
            <div>
              <strong>Your SSH Credentials</strong>
              <p>
                The login credentials such as <strong>host</strong>, <strong>username</strong>, and <strong>port</strong> are right there on the right side of the same page.
              </p>
            </div>
          </div>

          <div className="sgd-steps-list__item">
            <div className="sgd-steps-list__num">5</div>
            <div>
              <strong>Activate the key</strong>
              <p>
                After saving, make sure the key shows as{' '}
                <strong>Active</strong> in the SSH Keys Manager list.
                An inactive key will be rejected.
              </p>
            </div>
          </div>
        </div>

        <div className="sgd-alert sgd-alert--warning" style={{ marginTop: 16 }}>
          <strong>Leave this screen open</strong> while you complete the steps
          above in SiteGround. Come back here when the key shows as Active.
        </div>

        <label className="sgd-checkbox-label" style={{ marginTop: 16 }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          I have pasted the public key into SiteGround and it is now{' '}
          <strong>Active</strong>.
        </label>
      </div>

      <div className="sgd-wizard__actions">
        <button className="sgd-btn sgd-btn--secondary" onClick={onBack}>
          ← Back
        </button>
        <button
          className="sgd-btn sgd-btn--primary"
          onClick={onNext}
          disabled={!confirmed}
        >
          Test connection →
        </button>
      </div>
    </div>
  );
}
