/**
 * Step 4 — SSH Key Generation
 * Auto-starts key generation on mount.
 * Shows a loading state while generating, then a success confirmation.
 * On success, stores the publicKey in wizard data (for display in Step 5).
 * On error, allows retry.
 */
import React, { useState, useEffect } from 'react';
import { generateKey } from '../../ipc';

const STATUS = {
  IDLE: 'idle',
  GENERATING: 'generating',
  DONE: 'done',
  ERROR: 'error',
};

export default function Step4_KeyGen({ data, onChange, onNext, onBack }) {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);

  // Auto-start on mount
  useEffect(() => {
    generate();
  }, []);

  async function generate() {
    setStatus(STATUS.GENERATING);
    setError(null);
    try {
      const result = await generateKey(data.keyId);
      if (result && result.success === false) {
        throw new Error(result.error || 'Key generation failed.');
      }
      const { publicKey } = (result && result.data) ? result.data : result;
      onChange({ publicKey });
      setStatus(STATUS.DONE);
    } catch (err) {
      setStatus(STATUS.ERROR);
      setError(err?.message || 'Key generation failed. Please try again.');
    }
  }

  return (
    <div className="sgd-wizard__step">
      <div className="sgd-wizard__step-icon">
        {status === STATUS.DONE ? '✅' : status === STATUS.ERROR ? '❌' : '⚙️'}
      </div>
      <h2 className="sgd-wizard__heading">Generating your SSH key</h2>
      <p className="sgd-wizard__subheading">
        Creating a unique Ed25519 key pair on this machine — no internet
        connection required.
      </p>

      <div className="sgd-wizard__body">
        {status === STATUS.GENERATING && (
          <div className="sgd-keygen-status sgd-keygen-status--working">
            <div className="sgd-spinner" aria-label="Generating key…" />
            <div>
              <strong>Generating key pair…</strong>
              <p>Creating your private and public keys locally. This takes only a moment.</p>
            </div>
          </div>
        )}

        {status === STATUS.ERROR && (
          <>
            <div className="sgd-alert sgd-alert--danger">
              <strong>Key generation failed:</strong> {error}
            </div>
            <button
              className="sgd-btn sgd-btn--secondary"
              onClick={generate}
              style={{ marginTop: 8 }}
            >
              Retry key generation
            </button>
          </>
        )}

        {status === STATUS.DONE && (
          <>
            <div className="sgd-keygen-status sgd-keygen-status--done">
              <span className="sgd-keygen-status__check">✓</span>
              <div>
                <strong>Key pair generated successfully</strong>
                <p>
                  Your <strong>private key</strong> is saved securely on this
                  machine — it will never leave your computer.
                </p>
                <p>
                  Your <strong>public key</strong> is ready to be copied into
                  SiteGround on the next screen.
                </p>
              </div>
            </div>

            <div className="sgd-alert sgd-alert--info" style={{ marginTop: 12 }}>
              <strong>Key type:</strong> Ed25519 &nbsp;·&nbsp;{' '}
              <strong>Key ID:</strong>{' '}
              <span className="sgd-code-inline">{data.keyId}</span>
            </div>
          </>
        )}

        {status === STATUS.IDLE && (
          <p style={{ color: '#6c757d' }}>Preparing key generation…</p>
        )}
      </div>

      <div className="sgd-wizard__actions">
        <button
          className="sgd-btn sgd-btn--secondary"
          onClick={onBack}
          disabled={status === STATUS.GENERATING}
        >
          ← Back
        </button>
        <button
          className="sgd-btn sgd-btn--primary"
          onClick={onNext}
          disabled={status !== STATUS.DONE}
        >
          View public key →
        </button>
      </div>
    </div>
  );
}
