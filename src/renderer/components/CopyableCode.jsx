import React, { useState } from 'react';

/**
 * CopyableCode
 * Displays a block of text (e.g. an SSH public key) with a copy button.
 */
export default function CopyableCode({ value, label }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="sgd-copyable">
      {label && <p className="sgd-copyable__label">{label}</p>}
      <div className="sgd-copyable__block">
        <code className="sgd-copyable__code">{value || '—'}</code>
        <button
          className="sgd-btn sgd-btn--secondary sgd-btn--sm sgd-copyable__btn"
          onClick={handleCopy}
          disabled={!value}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
