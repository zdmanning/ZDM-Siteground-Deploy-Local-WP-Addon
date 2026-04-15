import React, { useEffect, useState, useCallback } from 'react';
import {
  getProfile,
  updateProfile,
  deleteProfile,
  testSSHConnection,
  repairLocalSiteMysql,
} from '../ipc';
import FormField from '../components/FormField';

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
    setStatus(res.success ? 'done' : 'error');
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
    sshHost:          profile.sshHost          || '',
    sshPort:          String(profile.sshPort   || 18765),
    sshUser:          profile.sshUser          || '',
    remoteWebRoot:    profile.remoteWebRoot     || '',
    productionDomain: profile.productionDomain || '',
    deployMode:       profile.deployMode?.defaultMode || 'code',
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
      name:             fields.name.trim(),
      sshHost:          fields.sshHost.trim(),
      sshPort:          Number(fields.sshPort) || 18765,
      sshUser:          fields.sshUser.trim(),
      remoteWebRoot:    fields.remoteWebRoot.trim(),
      productionDomain: fields.productionDomain.trim(),
      deployMode:       { defaultMode: fields.deployMode },
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
            placeholder="sgXXX.siteground.com"
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

      <FormField
        id="pd-domain"
        label="Production domain"
        error={errors.productionDomain}
        hint="Full URL, e.g. https://example.com"
        required
      >
        <input
          id="pd-domain"
          type="url"
          value={fields.productionDomain}
          onChange={(e) => set('productionDomain', e.target.value)}
          placeholder="https://example.com"
        />
      </FormField>

      <FormField id="pd-mode" label="Default deploy mode">
        <select
          id="pd-mode"
          value={fields.deployMode}
          onChange={(e) => set('deployMode', e.target.value)}
        >
          <option value="code">Code only — themes + plugins (safe)</option>
          <option value="full">Full deploy — code + database (danger)</option>
        </select>
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

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ProfileDetail({ profileId, onDeploy, onViewLogs, onBack }) {
  const [profile,     setProfile]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [loadErr,     setLoadErr]     = useState(null);
  const [mode,        setMode]        = useState('view'); // view | edit | delete

  const load = useCallback(() => {
    setLoading(true);
    setLoadErr(null);
    getProfile(profileId)
      .then((result) => {
        if (result.success === false) throw new Error(result.error || 'Profile not found.');
        setProfile(result.data || result);
      })
      .catch((err) => setLoadErr(err.message))
      .finally(() => setLoading(false));
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
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack}>
          ← Profiles
        </button>
        <div className="sgd-detail__title-block">
          <h2 className="sgd-detail__title">{profile.name}</h2>
          <span className="sgd-detail__subtitle">{profile.productionDomain}</span>
        </div>
        {mode === 'view' && (
          <div className="sgd-detail__header-actions">
            <button className="sgd-btn sgd-btn--ghost sgd-btn--sm" onClick={() => setMode('edit')}>
              Edit
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
            <InfoRow label="Domain"      value={profile.productionDomain} />
            <InfoRow label="Deploy mode" value={defaultMode === 'full' ? 'Full deploy (code + database)' : 'Code only (themes + plugins)'} />
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

          {/* Primary actions */}
          <div className="sgd-detail__actions">
            <button className="sgd-btn sgd-btn--primary" onClick={() => onDeploy(profileId)}>
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

      {/* ── Delete confirmation mode ───────────────────────────────────────── */}
      {mode === 'delete' && (
        <DeletePanel
          profile={profile}
          onDeleted={onBack}
          onCancel={() => setMode('view')}
        />
      )}
    </div>
  );
}
