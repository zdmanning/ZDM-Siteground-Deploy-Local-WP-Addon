import React from 'react';

/**
 * FormField
 *
 * Wraps a label, an input/select/textarea child, an optional hint, and
 * an optional inline validation error. Highlights the border red on error.
 *
 * Usage:
 *   <FormField id="sgd-name" label="Profile name" error={errors.name}>
 *     <input id="sgd-name" ... />
 *   </FormField>
 */
export default function FormField({ id, label, hint, error, required, children }) {
  return (
    <div className={`sgd-field${error ? ' sgd-field--error' : ''}`}>
      {label && (
        <label htmlFor={id}>
          {label}
          {required && <span className="sgd-field__required"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="sgd-field__hint">{hint}</p>}
      {error && (
        <p className="sgd-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
