import React from 'react';

/**
 * StepIndicator
 * Shows which wizard step is current using dot indicators.
 *
 * @param {number} total    - total number of steps
 * @param {number} current  - 0-based current step index
 */
export default function StepIndicator({ total, current }) {
  return (
    <div className="sgd-wizard__step-indicator" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const cls =
          i < current
            ? 'sgd-wizard__dot sgd-wizard__dot--complete'
            : i === current
            ? 'sgd-wizard__dot sgd-wizard__dot--active'
            : 'sgd-wizard__dot';
        return <div key={i} className={cls} />;
      })}
    </div>
  );
}
