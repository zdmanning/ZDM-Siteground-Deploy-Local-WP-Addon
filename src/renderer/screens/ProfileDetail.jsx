import React, { useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getProfile,
  updateProfile,
  deleteProfile,
  createProfile,
  getLocalSite,
  getAllLocalSites,
  testSSHConnection,
  testSSHConnectionDirect,
  generateKey,
  deleteKey,
  rotateProfileKey,
  repairLocalSiteMysql,
  deleteRemoteBackups,
} from '../ipc';
import FormField from '../components/FormField';
import CopyableCode from '../components/CopyableCode';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return <h3 className="sgd-detail__section-title">{children}</h3>;
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="sgd-detail__info-row">
      <span className="sgd-detail__info-label">{label}</span>
      {mono
        ? <code className="sgd-detail__info-val sgd-detail__info-val--mono">{value}</code>
        : <span className="sgd-detail__info-val">{value}</span>}
    </div>
  );
}

// ─── SSH test section ─────────────────────────────────────────────────────────

function SSHTestPanel({ profileId }) {
  const [status,  setStatus]  = useState('idle'); // idle|testing|success|error
  const [result,  setResult]  = useState(null);

  async function run() {
    setStatus('testing');
    setResult(null);
    const res = await testSSHConnection(profileId);
    setResult(res);
    setStatus(res.success ? 'success' : 'error');
  }

  return (
    <div className="sgd-detail__ssh-test">
      <div className="sgd-detail__ssh-test-header">
        <SectionTitle>SSH connection</SectionTitle>
        <button
          className="sgd-btn sgd-btn--ghost sgd-btn--sm"
          onClick={run}
          disabled={status === 'testing'}
        >
          {status === 'testing' ? (
            <><span className="sgd-spinner sgd-spinner--sm" style={{ marginRight: 6 }} />Testing…</>
          ) : status === 'idle' ? 'Test connection' : 'Test again'}
        </button>
      </div>

      {status === 'testing' && (
        <div className="sgd-detail__ssh-working">
          <span className="sgd-spinner sgd-spinner--sm" />
          Attempting SSH connection…
        </div>
      )}

      {status === 'success' && result && (
        <div className="sgd-detail__ssh-ok">
          <div className="sgd-detail__ssh-ok-banner">✓ Connection successful</div>
          {result.data?.output && (
            <div className="sgd-ssh-probe" style={{ marginTop: 8 }}>
              <div className="sgd-ssh-probe__label">Server response (<code>pwd &amp;&amp; whoami</code>)</div>
              <pre className="sgd-ssh-probe__output">{result.data.output}</pre>
            </div>
          )}
        </div>
      )}

      {status === 'error' && result && (
        <div className="sgd-alert sgd-alert--danger" style={{ marginTop: 8 }}>
          <strong>Connection failed:</strong> {result.error}
        </div>
      )}
    </div>
  );
}

function LocalMysqlRepairPanel({ profile }) {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  async function runRepair() {
    if (!profile.localSiteId) return;
    setStatus('running');
    setResult(null);

    const res = await repairLocalSiteMysql(profile.localSiteId);
    setResult(res);
    setStatus('idle');
  }

  return (
    <div className="sgd-card sgd-card--compact">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <SectionTitle>Local MySQL repair</SectionTitle>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6c757d' }}>
            Checks the linked Local site for a stale mysqld process on the wrong port and clears only that site's stale MySQL state.
          </p>
        </div>
        <button
          className="sgd-btn sgd-btn--ghost sgd-btn--sm"
          onClick={runRepair}
          disabled={!profile.localSiteId || status === 'running'}
        >
          {status === 'running' ? 'Repairing…' : 'Repair Local MySQL'}
        </button>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: '#6c757d' }}>
        Linked Local site ID: <code>{profile.localSiteId || 'Not linked'}</code>
      </div>

      {!profile.localSiteId && (
        <div className="sgd-alert sgd-alert--warning" style={{ marginTop: 10 }}>
          This profile is not linked to a Local site, so the repair action is unavailable.
        </div>
      )}

      {result?.success && (
        <div className="sgd-alert sgd-alert--info" style={{ marginTop: 10 }}>
          <strong>{result.data.message}</strong>
          <div style={{ marginTop: 6 }}>
            Expected port: <code>{result.data.expectedPort}</code>
            {result.data.stalePorts?.length > 0 ? <> · Cleared stale ports: <code>{result.data.stalePorts.join(', ')}</code></> : null}
            {result.data.killedPids?.length > 0 ? <> · Killed PIDs: <code>{result.data.killedPids.join(', ')}</code></> : null}
          </div>
        </div>
      )}

      {result && result.success === false && (
        <div className="sgd-alert sgd-alert--danger" style={{ marginTop: 10 }}>
          <strong>Repair failed:</strong> {result.error}
        </div>
      )}
    </div>
  );
}


// ─── Remote backups cleanup ──────────────────────────────────────────────────

function RemoteBackupsPanel({ profile }) {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  async function runDelete() {
    if (!profile.remoteWebRoot) return;
    if (!window.confirm('WARNING: This will permanently delete the entire sgd-db-backups directory on your remote server. Continue?')) return;
    setStatus('running');
    setResult(null);

    try { const res = await deleteRemoteBackups(profile.id); setResult(res); setStatus(res.success ? 'done' : 'error'); } catch (err) { setResult({ success: false, error: err.message }); setStatus('error'); }
  }

  return (
    <div className="..." style={{ borderTop: '1px solid #dee2e6', paddingTop: 16, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <SectionTitle>Delete Remote DB Backups</SectionTitle>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6c757d' }}>
            Permanently delete old backups kept in the sgd-db-backups folder on the remote server.
          </p>
        </div>
        <button
          className="sgd-btn sgd-btn--danger sgd-btn--sm"
          onClick={runDelete}
          disabled={!profile.remoteWebRoot || status === 'running'}
        >
          {status === 'running' ? 'Deleting…' : 'Delete all backups'}
        </button>
      </div>

      {result?.success && (
        <div className="sgd-alert sgd-alert--success" style={{ marginTop: 10, fontSize: 13, background: '#d4edda', color: '#155724', padding: '8px 12px', borderRadius: 4 }}>
          <strong>Backup folder deleted successfully.</strong>
        </div>
      )}

      {result && result.success === false && (
        <div className="sgd-alert sgd-alert--danger" style={{ marginTop: 10 }}>
          <strong>Deletion failed:</strong> {result.error}
        </div>
      )}
    </div>
  );
}

// ─── Clone panel ─────────────────────────────────────────────────────────────

function ClonePanel({ profile, onCloned, onCancel }) {
  const [fields, setFields] = useState({
    name:          `Copy of ${profile.name}`,
    remoteWebRoot: profile.remoteWebRoot || '',
    localSiteId:   profile.localSiteId   || '',
  });
  const [localSites, setLocalSites] = useState(null); // null = loading
  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);
  const [saveErr,    setSaveErr]    = useState(null);

  useEffect(() => {
    getAllLocalSites()
      .then((sites) => {
        // getAllSites returns a plain array (no wrapper object)
        setLocalSites(Array.isArray(sites) ? sites : (sites?.data ?? []));
      })
      .catch(() => setLocalSites([]));
  }, []);

  function set(key, val) {
    setFields((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveErr(null);
    setErrors({});

    const data = {
      name:          fields.name.trim(),
      sshHost:       profile.sshHost,
      sshPort:       profile.sshPort,
      sshUser:       profile.sshUser,
      remoteWebRoot: fields.remoteWebRoot.trim(),
      keyId:         profile.keyId,
      localSiteId:   fields.localSiteId || null,
      deployMode:    profile.deployMode,
      confirmDefault: profile.confirmDefault !== undefined ? profile.confirmDefault : null,
    };

    const res = await createProfile(data);

    if (res.success === false) {
      if (res.errors) setErrors(res.errors);
      setSaveErr(res.error || 'Clone failed. Check the fields above.');
      setSaving(false);
      return;
    }

    onCloned((res.data || res).id);
  }

  const displayWebRoot = (() => {
    let v = fields.remoteWebRoot || '';
    if (v.startsWith('/home/customer/www/')) v = v.slice('/home/customer/www/'.length);
    if (v.endsWith('/public_html')) v = v.slice(0, v.length - '/public_html'.length);
    return v.replace(/\/$/, '');
  })();

  const siteOptions = localSites
    ? localSites.slice().sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <div className="sgd-detail__edit-form">
      <SectionTitle>Clone profile</SectionTitle>
      <p style={{ marginBottom: 16, fontSize: 13, color: '#6c757d' }}>
        Creates a new profile that shares the same SSH credentials and key.
        Change the name, remote domain, and which Local site to link.
      </p>

      <FormField id="cl-name" label="New profile name" error={errors.name} required>
        <input
          id="cl-name"
          type="text"
          value={fields.name}
          onChange={(e) => set('name', e.target.value)}
          autoComplete="off"
        />
      </FormField>

      <FormField
        id="cl-root"
        label="Remote web root"
        error={errors.remoteWebRoot}
        hint="The domain name of the new remote site"
        required
      >
        <div className="sgd-input-with-prefix">
          <span className="sgd-input-prefix">/home/customer/www/</span>
          <input
            id="cl-root"
            type="text"
            value={displayWebRoot}
            onChange={(e) => {
              const mid = e.target.value.replace(/\/$/, '');
              set('remoteWebRoot', mid ? '/home/customer/www/' + mid + '/public_html' : '/home/customer/www/');
            }}
            placeholder="newsite.com"
          />
          <span className="sgd-input-suffix">/public_html</span>
        </div>
      </FormField>

      <FormField
        id="cl-site"
        label="Linked Local site"
        hint="Which Local WP site deploys to this profile"
      >
        {localSites === null ? (
          <div style={{ fontSize: 13, color: '#6c757d' }}>
            <span className="sgd-spinner sgd-spinner--sm" style={{ marginRight: 6 }} />
            Loading sites…
          </div>
        ) : (
          <select
            id="cl-site"
            value={fields.localSiteId}
            onChange={(e) => set('localSiteId', e.target.value)}
          >
            <option value="">— None —</option>
            {siteOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.domain ? ` (${s.domain})` : ''}
              </option>
            ))}
          </select>
        )}
      </FormField>

      {saveErr && (
        <div className="sgd-alert sgd-alert--danger" style={{ marginBottom: 12 }}>
          {saveErr}
        </div>
      )}

      <div className="sgd-detail__edit-actions">
        <button className="sgd-btn sgd-btn--primary" onClick={handleSave} disabled={saving || localSites === null}>
          {saving ? 'Cloning…' : 'Create clone'}
        </button>
        <button className="sgd-btn sgd-btn--secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Delete confirmation panel ────────────────────────────────────────────────

function DeletePanel({ profile, onDeleted, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState(null);

  async function confirm() {
    setBusy(true);
    setErr(null);
    const res = await deleteProfile(profile.id);
    if (res.success === false) {
      setErr(res.error || 'Delete failed.');
      setBusy(false);
    } else {
      onDeleted();
    }
  }

  return (
    <div className="sgd-detail__delete-confirm">
      <p>
        Permanently delete <strong>{profile.name}</strong>?<br />
        The SSH key files stored on this machine will also be removed.
        This cannot be undone.
      </p>
      {err && <div className="sgd-alert sgd-alert--danger" style={{ marginBottom: 10 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="sgd-btn sgd-btn--danger sgd-btn--sm" onClick={confirm} disabled={busy}>
          {busy ? 'Deleting…' : 'Yes, delete profile'}
        </button>
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditForm({ profile, onSaved, onCancel }) {
  const [fields, setFields] = useState({
    name:             profile.name             || '',
    sshHost:             profile.sshHost          || '',
    sshPort:             String(profile.sshPort   || 18765),
    sshUser:             profile.sshUser          || '',
    remoteWebRoot:       profile.remoteWebRoot     || '',
    productionDomain:    profile.productionDomain || '',
    deployMode:          profile.deployMode?.defaultMode || 'code',
    confirmDefault:      profile.confirmDefault !== undefined ? profile.confirmDefault : null,
    deployIncludeGit:    Boolean(profile.deployIncludeGit),
    deployIncludeVscode: Boolean(profile.deployIncludeVscode),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState(null);

  function set(key, val) {
    setFields((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveErr(null);
    setErrors({});

    const patch = {
      name:                fields.name.trim(),
      sshHost:             fields.sshHost.trim(),
      sshPort:             Number(fields.sshPort) || 18765,
      sshUser:             fields.sshUser.trim(),
      remoteWebRoot:       fields.remoteWebRoot.trim(),
      productionDomain:    fields.productionDomain.trim(),
      deployMode:          { defaultMode: fields.deployMode },
      confirmDefault:      fields.confirmDefault,
      deployIncludeGit:    fields.deployIncludeGit,
      deployIncludeVscode: fields.deployIncludeVscode,
    };

    const res = await updateProfile(profile.id, patch);

    if (res.success === false) {
      if (res.errors) setErrors(res.errors);
      setSaveErr(res.error || 'Save failed. Check the fields above.');
      setSaving(false);
      return;
    }

    onSaved(res.data || res);
  }

  return (
    <div className="sgd-detail__edit-form">
      <SectionTitle>Edit profile</SectionTitle>

      <FormField id="pd-name" label="Profile name" error={errors.name} required>
        <input
          id="pd-name"
          type="text"
          value={fields.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="My SiteGround site"
          autoComplete="off"
        />
      </FormField>

      <div className="sgd-form-row">
        <FormField id="pd-host" label="SSH host" error={errors.sshHost} required>
          <input
            id="pd-host"
            type="text"
            value={fields.sshHost}
            onChange={(e) => set('sshHost', e.target.value)}
            placeholder="ssh.yourdomain.com"
            autoComplete="off"
          />
        </FormField>
        <FormField id="pd-port" label="Port" error={errors.sshPort} style={{ flex: '0 0 80px' }}>
          <input
            id="pd-port"
            type="number"
            value={fields.sshPort}
            onChange={(e) => set('sshPort', e.target.value)}
            style={{ width: 80 }}
            min={1}
            max={65535}
          />
        </FormField>
      </div>

      <FormField id="pd-user" label="SSH username" error={errors.sshUser} required>
        <input
          id="pd-user"
          type="text"
          value={fields.sshUser}
          onChange={(e) => set('sshUser', e.target.value)}
          placeholder="username"
          autoComplete="off"
        />
      </FormField>

      <FormField
        id="pd-root"
        label="Remote web root"
        error={errors.remoteWebRoot}
        hint="Just enter your domain name, e.g. example.com"
        required
      >
        <div className="sgd-input-with-prefix">
          <span className="sgd-input-prefix">/home/customer/www/</span>
          <input
            id="pd-root"
            type="text"
            value={(() => {
              let v = fields.remoteWebRoot || '';
              if (v.startsWith('/home/customer/www/')) v = v.slice('/home/customer/www/'.length);
              if (v.endsWith('/public_html')) v = v.slice(0, v.length - '/public_html'.length);
              return v.replace(/\/$/, '');
            })()}
            onChange={(e) => {
              const mid = e.target.value.replace(/\/$/, '');
              set('remoteWebRoot', mid ? '/home/customer/www/' + mid + '/public_html' : '/home/customer/www/');
            }}
            placeholder="example.com"
          />
          <span className="sgd-input-suffix">/public_html</span>
        </div>
</FormField>
<FormField id="pd-mode" label="Default deploy mode">
<select
          id="pd-mode"
          value={fields.deployMode}
          onChange={(e) => set('deployMode', e.target.value)}
        >
          <option value="code">Code only — themes + plugins (safe)</option>
          <option value="full">Full deploy — code + database (danger)</option>
          <option value="db">Database only — overwrite remote DB (danger)</option>
        </select>
      </FormField>

      <FormField id="pd-confirm" label="Confirmation checkbox default" hint="Overrides the global addon setting for this profile only">
        <select
          id="pd-confirm"
          value={fields.confirmDefault === null ? 'inherit' : fields.confirmDefault ? 'checked' : 'unchecked'}
          onChange={(e) => {
            const v = e.target.value;
            set('confirmDefault', v === 'inherit' ? null : v === 'checked');
          }}
        >
          <option value="inherit">Inherit from global addon setting</option>
          <option value="checked">Always pre-checked for this profile</option>
          <option value="unchecked">Always unchecked for this profile</option>
        </select>
      </FormField>

      <FormField id="pd-deploy-opts" label="Deploy options" hint="These folders are excluded from all deploys by default for safety">
        <label className="sgd-checkbox-label" style={{ marginBottom: 6 }}>
          <input
            type="checkbox"
            checked={fields.deployIncludeGit}
            onChange={(e) => set('deployIncludeGit', e.target.checked)}
          />
          Include <code>.git</code> folder in deploys <em>(not recommended)</em>
        </label>
        <label className="sgd-checkbox-label">
          <input
            type="checkbox"
            checked={fields.deployIncludeVscode}
            onChange={(e) => set('deployIncludeVscode', e.target.checked)}
          />
          Include <code>.vscode</code> folder in deploys <em>(not recommended)</em>
        </label>
      </FormField>

      {saveErr && (
        <div className="sgd-alert sgd-alert--danger" style={{ marginBottom: 12 }}>
          {saveErr}
        </div>
      )}

      <div className="sgd-detail__edit-actions">
        <button className="sgd-btn sgd-btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button className="sgd-btn sgd-btn--secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Regenerate SSH key panel ─────────────────────────────────────────────────
//
// Flow:
//   'keygen'    → auto-generates a NEW key pair on mount (spinner)
//   'addkey'    → shows public key + SiteGround instructions + confirmation checkbox
//   'testing'   → runs testSSHConnectionDirect with new keyId (spinner)
//   'done'      → rotation committed; shows success; user clicks Done to dismiss
//   'error'     → terminal failure (key gen or rotation failed); close only
//
// Old key safety:
//   The old key is NOT deleted until after the profile record is committed AND
//   the main process confirms no other profile (clone) shares that keyId.
//   If the user cancels at any point before 'done', the orphaned new key is deleted.

function RegenerateKeyPanel({ profile, onComplete, onCancel }) {
  // Generate a stable UUID for the new key once on mount
  const [newKeyId]                       = useState(() => uuidv4());
  const [step,          setStep]         = useState('keygen'); // keygen|addkey|testing|done|error
  const [publicKey,     setPublicKey]    = useState(null);
  const [addConfirmed,  setAddConfirmed] = useState(false);
  const [testStatus,    setTestStatus]   = useState('idle'); // idle|testing|failed
  const [testError,     setTestError]    = useState(null);
  const [testOutput,    setTestOutput]   = useState(null);
  const [rotatedProfile, setRotatedProfile] = useState(null);
  const [oldKeyDeleted,  setOldKeyDeleted]  = useState(false);
  const [errorMsg,      setErrorMsg]     = useState(null);
  const [committing,    setCommitting]   = useState(false);

  // Auto-start key generation on mount
  useEffect(() => {
    (async () => {
      const result = await generateKey(newKeyId);
      if (!result || result.success === false) {
        setErrorMsg(result?.error || 'Key generation failed.');
        setStep('error');
        return;
      }
      setPublicKey(result.data.publicKey);
      setStep('addkey');
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCancel() {
    // Clean up the orphaned new key if it was generated but never committed.
    if (step !== 'done') {
      try { await deleteKey(newKeyId); } catch (_) {}
    }
    onCancel();
  }

  async function runTest() {
    setTestStatus('testing');
    setTestError(null);
    setTestOutput(null);

    let testResult;
    try {
      testResult = await testSSHConnectionDirect({
        sshHost: profile.sshHost,
        sshPort: profile.sshPort,
        sshUser: profile.sshUser,
        keyId:   newKeyId,
      });
    } catch (err) {
      setTestStatus('failed');
      setTestError(err?.message || 'Unexpected error during connection test.');
      return;
    }

    if (!testResult.success) {
      setTestStatus('failed');
      setTestError(testResult.error || 'Connection refused or timed out.');
      return;
    }

    // Connection test passed — capture output and commit the rotation.
    setTestOutput(testResult.data?.output || null);
    setTestStatus('idle');
    setCommitting(true);

    const rotateResult = await rotateProfileKey(profile.id, newKeyId);
    setCommitting(false);

    if (!rotateResult.success) {
      setErrorMsg(`Key rotation failed: ${rotateResult.error}`);
      setStep('error');
      return;
    }

    setRotatedProfile(rotateResult.data.profile);
    setOldKeyDeleted(rotateResult.data.oldKeyDeleted === true);
    setStep('done');
  }

  // ── Keygen spinner ────────────────────────────────────────────────────────
  if (step === 'keygen') {
    return (
      <div className="sgd-detail__edit-form">
        <SectionTitle>Regenerate SSH key</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: '#495057' }}>
          <span className="sgd-spinner sgd-spinner--sm" />
          Generating new Ed25519 key pair…
        </div>
      </div>
    );
  }

  // ── Terminal error ────────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="sgd-detail__edit-form">
        <SectionTitle>Regenerate SSH key</SectionTitle>
        <div className="sgd-alert sgd-alert--danger" style={{ marginBottom: 16 }}>
          <strong>Error:</strong> {errorMsg}
        </div>
        <p style={{ fontSize: 13, color: '#6c757d', marginBottom: 16 }}>
          Your profile has not been changed. The old SSH key is still active.
        </p>
        <button className="sgd-btn sgd-btn--secondary" onClick={handleCancel}>
          Close
        </button>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="sgd-detail__edit-form">
        <SectionTitle>Regenerate SSH key</SectionTitle>
        <div className="sgd-alert sgd-alert--success" style={{ marginBottom: 16 }}>
          ✓ New SSH key is active and has been saved to your profile.
          {oldKeyDeleted
            ? <> The old key has been removed from this machine.</>
            : <> The old key was kept because another profile (a clone) shares it.</>
          }
        </div>
        {testOutput && (
          <div className="sgd-ssh-probe" style={{ marginBottom: 16 }}>
            <div className="sgd-ssh-probe__label">Verified server response (<code>pwd &amp;&amp; whoami</code>)</div>
            <pre className="sgd-ssh-probe__output">{testOutput}</pre>
          </div>
        )}
        <button className="sgd-btn sgd-btn--primary" onClick={() => onComplete(rotatedProfile)}>
          Done
        </button>
      </div>
    );
  }

  // ── Main flow: addkey (+ testing/committing overlay) ──────────────────────
  const busy = testStatus === 'testing' || committing;

  return (
    <div className="sgd-detail__edit-form">
      <SectionTitle>Regenerate SSH key</SectionTitle>

      <div className="sgd-alert sgd-alert--warning" style={{ marginBottom: 16 }}>
        <strong>Your current SSH key is still active.</strong> It will only be
        deleted after the new key is verified and the profile is saved.
        You can cancel at any time with no impact to your existing setup.
      </div>

      <p style={{ fontSize: 13, color: '#495057', marginBottom: 12 }}>
        A new key pair has been generated. Add the public key to SiteGround,
        then test the connection to confirm it works before we swap it in.
      </p>

      <CopyableCode
        value={publicKey || ''}
        label="New public key — copy this entire value"
      />

      <div className="sgd-steps-list" style={{ marginTop: 16, marginBottom: 16 }}>
        <div className="sgd-steps-list__item">
          <div className="sgd-steps-list__num">1</div>
          <div>
            <strong>Open SiteGround Site Tools → Devs → SSH Keys Manager</strong>
            <p>Select the <strong>Import</strong> tab, enter a name (e.g. "Local Deploy"), and paste the key above into the <strong>Public Key</strong> field.</p>
          </div>
        </div>
        <div className="sgd-steps-list__item">
          <div className="sgd-steps-list__num">2</div>
          <div>
            <strong>Activate the key</strong>
            <p>After saving, confirm it shows as <strong>Active</strong> in the list. An inactive key will be rejected.</p>
          </div>
        </div>
        <div className="sgd-steps-list__item">
          <div className="sgd-steps-list__num">3</div>
          <div>
            <strong>Check the box below and test</strong>
            <p>The test uses the <em>new</em> key — if it passes, the profile is updated and the old key is removed.</p>
          </div>
        </div>
      </div>

      {testStatus === 'failed' && testError && (
        <div className="sgd-alert sgd-alert--danger" style={{ marginBottom: 12 }}>
          <strong>Connection failed:</strong> {testError}
          <div style={{ marginTop: 6, fontSize: 12 }}>
            Make sure the key is <strong>Active</strong> in SiteGround's SSH Keys Manager, then try again.
          </div>
        </div>
      )}

      {testOutput && testStatus !== 'failed' && (
        <div className="sgd-ssh-probe" style={{ marginBottom: 12 }}>
          <div className="sgd-ssh-probe__label">Server response (<code>pwd &amp;&amp; whoami</code>)</div>
          <pre className="sgd-ssh-probe__output">{testOutput}</pre>
        </div>
      )}

      <label className="sgd-checkbox-label" style={{ marginBottom: 16 }}>
        <input
          type="checkbox"
          checked={addConfirmed}
          onChange={(e) => setAddConfirmed(e.target.checked)}
          disabled={busy}
        />
        I have added the new key to SiteGround and it is <strong>Active</strong>.
      </label>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          className="sgd-btn sgd-btn--primary"
          onClick={runTest}
          disabled={!addConfirmed || busy}
        >
          {testStatus === 'testing'
            ? <><span className="sgd-spinner sgd-spinner--sm" style={{ marginRight: 6 }} />Testing…</>
            : committing
              ? <><span className="sgd-spinner sgd-spinner--sm" style={{ marginRight: 6 }} />Saving…</>
              : testStatus === 'failed'
                ? 'Test again'
                : '▶ Test & activate new key'}
        </button>
        <button
          className="sgd-btn sgd-btn--secondary"
          onClick={handleCancel}
          disabled={busy}
        >
          Cancel
        </button>
        <span style={{ fontSize: 12, color: '#6c757d' }}>
          {!addConfirmed
            ? 'Check the confirmation box above to enable the test.'
            : testStatus === 'failed'
              ? 'Check that the key is Active in SiteGround, then test again.'
              : 'Connection test verifies the new key works before committing the swap.'}
        </span>
      </div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ProfileDetail({ profileId, onDeploy, onViewLogs, onBack, onCloned }) {
  const [profile,     setProfile]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [loadErr,     setLoadErr]     = useState(null);
  const [mode,        setMode]        = useState('view'); // view | edit | delete | clone | regenkey
  const [siteName,    setSiteName]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const result = await getProfile(profileId);
      if (result.success === false) throw new Error(result.error || 'Profile not found.');
      const p = result.data || result;
      setProfile(p);
      if (p.localSiteId) {
        try {
          const siteRes = await getLocalSite(p.localSiteId);
          const name = siteRes?.data?.name || siteRes?.name;
          if (name) setSiteName(name);
        } catch (_) { /* ignore — site name is cosmetic */ }
      }
    } catch (err) {
      setLoadErr(err.message);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div>
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        <div className="sgd-loading-rows">
          <div className="sgd-loading-row" />
          <div className="sgd-loading-row" />
          <div className="sgd-loading-row" />
        </div>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div>
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        <div className="sgd-alert sgd-alert--danger">
          <strong>Could not load profile:</strong> {loadErr}
          <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" style={{ marginLeft: 12 }} onClick={load}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const defaultMode = profile.deployMode?.defaultMode || 'code';

  return (
    <div className="sgd-detail">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="sgd-detail__header">
        <div className="sgd-detail__header-top">
          <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack}>
            ← Profiles
          </button>
          <div className="sgd-detail__title-block">
            <h2 className="sgd-detail__title">{profile.name}</h2>
            <span className="sgd-detail__subtitle">{profile.remoteWebRoot}</span>
          </div>
        </div>
        {mode === 'view' && (
          <div className="sgd-detail__header-actions">
            <button className="sgd-btn sgd-btn--ghost sgd-btn--sm" onClick={() => setMode('clone')}>
              Clone
            </button>
            <button className="sgd-btn sgd-btn--ghost sgd-btn--sm" onClick={() => setMode('edit')}>
              Edit
            </button>
            <button className="sgd-btn sgd-btn--ghost sgd-btn--sm" onClick={() => setMode('regenkey')}>
              Regen key
            </button>
            <button className="sgd-btn sgd-btn--danger sgd-btn--sm" onClick={() => setMode('delete')}>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* ── View mode ─────────────────────────────────────────────────────── */}
      {mode === 'view' && (
        <>
          {/* Summary */}
          <div className="sgd-card sgd-card--compact">
            <SectionTitle>Connection</SectionTitle>
            <InfoRow label="SSH host"    value={`${profile.sshHost}:${profile.sshPort || 18765}`} mono />
            <InfoRow label="Username"    value={profile.sshUser}       mono />
            <InfoRow label="Web root"    value={profile.remoteWebRoot} mono />
            <InfoRow label="Deploy mode" value={defaultMode === 'full' ? 'Full deploy (code + database)' : defaultMode === 'db' ? 'Database only (overwrite remote DB)' : 'Code only (themes + plugins)'} />
            <InfoRow
              label="Linked local site"
              value={
                profile.localSiteId
                  ? (siteName ? `${siteName} (${profile.localSiteId})` : profile.localSiteId)
                  : 'Not linked'
              }
              mono={!siteName && !!profile.localSiteId}
            />
            <InfoRow label="Created"     value={new Date(profile.createdAt).toLocaleString()} />
            <InfoRow
              label="Last deployed"
              value={profile.lastDeployedAt
                ? new Date(profile.lastDeployedAt).toLocaleString()
                : 'Never'}
            />
          </div>

          {/* SSH test */}
          <SSHTestPanel profileId={profileId} />

          {/* Local site repair */}
          <LocalMysqlRepairPanel profile={profile} />

          {/* Remote DB Backups */}
          <RemoteBackupsPanel profile={profile} />

          {/* Primary actions */}
          <div className="sgd-detail__actions">
            <button className="sgd-btn sgd-btn--primary" onClick={() => onDeploy(profileId, defaultMode)}>
              Deploy →
            </button>
            <button className="sgd-btn sgd-btn--secondary" onClick={() => onViewLogs(profileId)}>
              View logs
            </button>
          </div>
        </>
      )}

      {/* ── Edit mode ─────────────────────────────────────────────────────── */}
      {mode === 'edit' && (
        <EditForm
          profile={profile}
          onSaved={(updated) => { setProfile(updated); setMode('view'); }}
          onCancel={() => setMode('view')}
        />
      )}

      {/* ── Clone mode ────────────────────────────────────────────────────── */}
      {mode === 'clone' && (
        <ClonePanel
          profile={profile}
          onCloned={(newId) => onCloned(newId)}
          onCancel={() => setMode('view')}
        />
      )}

      {/* ── Delete confirmation mode ───────────────────────────────────────── */}
      {mode === 'delete' && (
        <DeletePanel
          profile={profile}
          onDeleted={onBack}
          onCancel={() => setMode('view')}
        />
      )}

      {/* ── Regenerate SSH key mode ────────────────────────────────────────── */}
      {mode === 'regenkey' && (
        <RegenerateKeyPanel
          profile={profile}
          onComplete={(updatedProfile) => {
            if (updatedProfile) setProfile(updatedProfile);
            setMode('view');
          }}
          onCancel={() => setMode('view')}
        />
      )}
    </div>
  );
}













