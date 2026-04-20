import React, { useEffect, useState, useCallback } from 'react';
import { listProfiles, deleteProfile, testSSHConnection } from '../ipc';

// Which profile id has the delete confirmation open
const MODE_IDLE    = 'idle';
const MODE_TESTING = 'testing';
const MODE_DONE    = 'done';

function DeployModePill({ mode }) {
  const label      = mode === 'full' ? 'Full deploy' : mode === 'db' ? 'DB only' : 'Code only';
  const background = mode === 'full' ? '#fff3cd' : mode === 'db' ? '#f8d7da' : '#cce5ff';
  const color      = mode === 'full' ? '#856404' : mode === 'db' ? '#721c24' : '#004085';
  const style = {
    display:       'inline-block',
    padding:       '1px 8px',
    borderRadius:  10,
    fontSize:      10,
    fontWeight:    700,
    background,
    color,
  };
  return <span style={style}>{label}</span>;
}

function ProfileCard({ profile, onSelect, onDeploy, onDeleted }) {
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [deleting,   setDeleting]     = useState(false);
  const [testMode,   setTestMode]     = useState(MODE_IDLE); // idle|testing|done
  const [testResult, setTestResult]   = useState(null);      // { success, error? }

  const defaultMode = profile.deployMode?.defaultMode || 'code';

  async function handleDelete(e) {
    e.stopPropagation();
    setDeleting(true);
    await deleteProfile(profile.id);
    onDeleted(profile.id);
  }

  async function handleTest(e) {
    e.stopPropagation();
    setTestMode(MODE_TESTING);
    setTestResult(null);
    const result = await testSSHConnection(profile.id);
    setTestResult(result);
    setTestMode(MODE_DONE);
  }

  function stopProp(e) { e.stopPropagation(); }

  return (
    <div className="sgd-profile-card" onClick={() => onSelect(profile.id)}>
      {/* ── Top row: name + deploy mode + last-deployed ───────────────────── */}
      <div className="sgd-profile-card__header">
        <div className="sgd-profile-card__title-row">
          <span className="sgd-profile-card__name">{profile.name}</span>
          <DeployModePill mode={defaultMode} />
        </div>
        <div className="sgd-profile-card__meta">
          {profile.lastDeployedAt
            ? `Last deployed ${new Date(profile.lastDeployedAt).toLocaleString()}`
            : 'Never deployed'}
        </div>
      </div>

      {/* ── Connection info ────────────────────────────────────────────────── */}
      <div className="sgd-profile-card__info">
        <div className="sgd-profile-card__info-row">
          <span className="sgd-profile-card__info-label">Host</span>
          <code className="sgd-profile-card__info-val">{profile.sshHost}:{profile.sshPort || 18765}</code>
        </div>
        <div className="sgd-profile-card__info-row">
          <span className="sgd-profile-card__info-label">User</span>
          <code className="sgd-profile-card__info-val">{profile.sshUser}</code>
        </div>
        <div className="sgd-profile-card__info-row">
          <span className="sgd-profile-card__info-label">Domain</span>
          <span className="sgd-profile-card__info-val">{profile.productionDomain}</span>
        </div>
      </div>

      {/* ── SSH test result ────────────────────────────────────────────────── */}
      {testMode === MODE_TESTING && (
        <div className="sgd-profile-card__test-result sgd-profile-card__test-result--working" onClick={stopProp}>
          <span className="sgd-spinner sgd-spinner--sm" />
          Testing SSH connection…
        </div>
      )}
      {testMode === MODE_DONE && testResult && (
        <div
          className={`sgd-profile-card__test-result ${testResult.success
            ? 'sgd-profile-card__test-result--ok'
            : 'sgd-profile-card__test-result--fail'}`}
          onClick={stopProp}
        >
          {testResult.success
            ? `✓ Connected — ${testResult.data?.output || 'SSH OK'}`
            : `✗ ${testResult.error}`}
        </div>
      )}

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      {deleteOpen && (
        <div className="sgd-profile-card__confirm" onClick={stopProp}>
          <span>Delete <strong>{profile.name}</strong>? This cannot be undone.</span>
          <div className="sgd-profile-card__confirm-actions">
            <button
              className="sgd-btn sgd-btn--danger sgd-btn--sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button
              className="sgd-btn sgd-btn--secondary sgd-btn--sm"
              onClick={(e) => { e.stopPropagation(); setDeleteOpen(false); }}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Action buttons ─────────────────────────────────────────────────── */}
      <div className="sgd-profile-card__actions" onClick={stopProp}>
        <button
          className="sgd-btn sgd-btn--primary sgd-btn--sm"
          onClick={(e) => { e.stopPropagation(); onDeploy(profile.id, defaultMode); }}
        >
          Deploy
        </button>
        <button
          className="sgd-btn sgd-btn--ghost sgd-btn--sm"
          onClick={handleTest}
          disabled={testMode === MODE_TESTING}
        >
          {testMode === MODE_TESTING ? 'Testing…' : 'Test SSH'}
        </button>
        <button
          className="sgd-btn sgd-btn--secondary sgd-btn--sm"
          onClick={(e) => { e.stopPropagation(); onSelect(profile.id); }}
        >
          Edit
        </button>
        <button
          className="sgd-btn sgd-btn--danger sgd-btn--sm"
          onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); setTestMode(MODE_IDLE); }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({ site, onNewProfile, onSelectProfile, onDeploy, onSettings }) {
  const [profiles, setProfiles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [loadErr,  setLoadErr]  = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setLoadErr(null);
    listProfiles()
      .then((result) => {
        if (result.success === false) throw new Error(result.error || 'Failed to load profiles.');
        setProfiles(result.data || result);
      })
      .catch((err) => setLoadErr(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeleted = (id) => setProfiles((prev) => prev.filter((p) => p.id !== id));

  const handleDeploy = onDeploy
    ? onDeploy
    : (profileId) => onSelectProfile(profileId); // fallback — detail view has a deploy button

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="sgd-page-header">
        <h2 className="sgd-page-header__title">Deployment profiles</h2>
        <button className="sgd-btn sgd-btn--primary" onClick={onNewProfile}>
          + New profile
        </button>
      </div>

      {/* ── Loading ──────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="sgd-loading-rows">
          <div className="sgd-loading-row" />
          <div className="sgd-loading-row" />
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {!loading && loadErr && (
        <div className="sgd-alert sgd-alert--danger">
          <strong>Could not load profiles:</strong> {loadErr}
          <button
            className="sgd-btn sgd-btn--secondary sgd-btn--sm"
            style={{ marginLeft: 12 }}
            onClick={load}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {!loading && !loadErr && profiles.length === 0 && (
        <div className="sgd-empty">
          <div className="sgd-empty__icon">🚀</div>
          <strong>No profiles yet</strong>
          <p>
            A profile holds the SSH credentials and settings for one SiteGround server.
            Create one to start deploying.
          </p>
          <button className="sgd-btn sgd-btn--primary" onClick={onNewProfile} style={{ marginTop: 14 }}>
            Create first profile
          </button>
        </div>
      )}

      {/* ── Profile list ─────────────────────────────────────────────────────── */}
      {!loading && !loadErr && profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          onSelect={onSelectProfile}
          onDeploy={handleDeploy}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}
