/**
 * Step 3 — Connection Details Form
 * Collects all SSH credentials and profile metadata.
 * Validates on submit — all fields must pass before proceeding.
 */
import React, { useState } from 'react';
import FormField from '../../components/FormField';
import { validateConnectionForm, isFormValid } from '../../utils/validate';

export default function Step3_ConnectionInfo({ data, onChange, onNext, onBack }) {
  // Only show errors after the first submit attempt
  const [submitted, setSubmitted] = useState(false);

  const errors = submitted ? validateConnectionForm(data) : {};
  const valid = isFormValid(validateConnectionForm(data));

  function handleNext(e) {
    e.preventDefault();
    setSubmitted(true);
    if (isFormValid(validateConnectionForm(data))) {
      onNext();
    }
  }

  function field(name) {
    return {
      value: data[name] ?? '',
      onChange: (e) => onChange({ [name]: e.target.value }),
    };
  }

  return (
    <div className="sgd-wizard__step">
      <div className="sgd-wizard__step-icon">🔌</div>
      <h2 className="sgd-wizard__heading">Connection details</h2>
      <p className="sgd-wizard__subheading">
        Enter the SSH credentials for your SiteGround site. You noted these
        in the previous step.
      </p>

      <form className="sgd-wizard__body" onSubmit={handleNext} noValidate>

        <FormField
          id="sgd-name"
          label="Profile name"
          hint="A friendly label for this deployment target."
          error={errors.name}
          required
        >
          <input
            id="sgd-name"
            type="text"
            placeholder="e.g. BIOHM Production"
            autoComplete="off"
            {...field('name')}
          />
        </FormField>

        <div className="sgd-form-row">
          <FormField
            id="sgd-host"
            label="SSH host"
            hint="The hostname from SiteGround's SSH Manager page."
            error={errors.sshHost}
            required
          >
            <input
              id="sgd-host"
              type="text"
              placeholder="e.g. sg-server-123.siteground.com"
              autoComplete="off"
              spellCheck={false}
              {...field('sshHost')}
            />
          </FormField>

          <FormField
            id="sgd-port"
            label="SSH port"
            hint="SiteGround default."
            error={errors.sshPort}
            required
          >
            <input
              id="sgd-port"
              type="number"
              min={1}
              max={65535}
              value={data.sshPort ?? 18765}
              onChange={(e) => onChange({ sshPort: Number(e.target.value) })}
              style={{ width: '90px' }}
            />
          </FormField>
        </div>

        <FormField
          id="sgd-user"
          label="SSH username"
          hint='Your SiteGround SSH username — usually starts with "u" (e.g. u12345678).'
          error={errors.sshUser}
          required
        >
          <input
            id="sgd-user"
            type="text"
            placeholder="e.g. u12345678"
            autoComplete="off"
            spellCheck={false}
            {...field('sshUser')}
          />
        </FormField>

        <FormField
          id="sgd-webroot"
          label="Remote web root path"
          hint="The absolute path to your site's public_html folder on the server."
          error={errors.remoteWebRoot}
          required
        >
          <input
            id="sgd-webroot"
            type="text"
            placeholder="/home/customer/www/example.com/public_html"
            autoComplete="off"
            spellCheck={false}
            {...field('remoteWebRoot')}
          />
        </FormField>

        <FormField
          id="sgd-domain"
          label="Production domain"
          hint="The live site URL — used for database search-replace during full deploys."
          error={errors.productionDomain}
          required
        >
          <input
            id="sgd-domain"
            type="text"
            placeholder="https://example.com"
            autoComplete="off"
            spellCheck={false}
            {...field('productionDomain')}
          />
        </FormField>

        {submitted && !valid && (
          <div className="sgd-alert sgd-alert--danger" style={{ marginTop: 8 }}>
            Please fix the errors above before continuing.
          </div>
        )}

        <div className="sgd-wizard__actions">
          <button type="button" className="sgd-btn sgd-btn--secondary" onClick={onBack}>
            ← Back
          </button>
          <button type="submit" className="sgd-btn sgd-btn--primary">
            Generate SSH key →
          </button>
        </div>
      </form>
    </div>
  );
}
