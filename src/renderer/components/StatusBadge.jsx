import React from 'react';

/**
 * StatusBadge
 * @param {'success'|'error'|'warning'|'pending'} status
 * @param {string} [label] - override the default label
 */
export default function StatusBadge({ status, label }) {
  const labels = {
    success: 'Connected',
    error: 'Failed',
    warning: 'Warning',
    pending: 'Pending',
  };
  return (
    <span className={`sgd-badge sgd-badge--${status}`}>
      {label || labels[status] || status}
    </span>
  );
}
