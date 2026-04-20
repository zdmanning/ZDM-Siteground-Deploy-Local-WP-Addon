import React, { useState, useEffect, useRef, useCallback } from 'react';
import { deployPreflight, runCodeDeploy, runFullDeploy, runDbDeploy, cancelDeploy, onLogEntry, listLocalDir } from '../ipc';

// ─── Constants ────────────────────────────────────────────────────────────────

const CODE_DIRS = [
  { key: 'themes',     warning: null },
  { key: 'plugins',    warning: null },
  { key: 'mu-plugins', warning: null },
  { key: 'uploads',    warning: 'uploads can be very large \u2014 this may take a long time' },
];

const DEFAULT_SELECTED_PATHS = ['themes', 'plugins'];

const LEVEL_CLASS = {
  info:    'sgd-log__line--info',
  success: 'sgd-log__line--success',
  warning: 'sgd-log__line--warning',
  error:   'sgd-log__line--error',
};

// ─── Mode selector ────────────────────────────────────────────────────────────

// SVG cylinder icon — reliable cross-platform substitute for the emoji
function DbIcon({ size = 18 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 18 18"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <ellipse cx="9" cy="4.5" rx="6.5" ry="2.2" />
      <path d="M2.5 4.5v9c0 1.21 2.91 2.2 6.5 2.2s6.5-.99 6.5-2.2v-9c0 1.21-2.91 2.2-6.5 2.2s-6.5-.99-6.5-2.2z" />
      <ellipse cx="9" cy="9" rx="6.5" ry="2.2" opacity="0.3" />
    </svg>
  );
}

function ModeTabs({ mode, onChange }) {
  return (
    <div className="sgd-deploy-mode-tabs">
      <button
        type="button"
        className={`sgd-deploy-mode-tab${mode === 'code' ? ' sgd-deploy-mode-tab--active' : ''}`}
        onClick={() => onChange('code')}
      >
        <span className="sgd-deploy-mode-tab__icon">📦</span>
        <span className="sgd-deploy-mode-tab__text">
          <strong>Code-only</strong>
          <small>Selected wp-content directories</small>
        </span>
      </button>

      <button
        type="button"
        className={`sgd-deploy-mode-tab${mode === 'full' ? ' sgd-deploy-mode-tab--active sgd-deploy-mode-tab--full-active' : ''}`}
        onClick={() => onChange('full')}
      >
        <span className="sgd-deploy-mode-tab__icon">⚡</span>
        <span className="sgd-deploy-mode-tab__text">
          <strong>Full deploy</strong>
          <small>Entire wp-content + database</small>
        </span>
      </button>

      <button
        type="button"
        className={`sgd-deploy-mode-tab${mode === 'db' ? ' sgd-deploy-mode-tab--active sgd-deploy-mode-tab--full-active' : ''}`}
        onClick={() => onChange('db')}
      >
        <span className="sgd-deploy-mode-tab__icon"><DbIcon /></span>
        <span className="sgd-deploy-mode-tab__text">
          <strong>Database only</strong>
          <small>Export local DB → overwrite remote</small>
        </span>
      </button>
    </div>
  );
}

// ─── Deploy summary card ──────────────────────────────────────────────────────

function SummaryCard({ preflight, mode, selectedPaths }) {
  const modeLabel = mode === 'full'
    ? 'Full deploy \u2014 entire wp-content + database'
    : mode === 'db'
      ? 'Database only \u2014 export local DB \u2192 overwrite remote'
      : selectedPaths.length > 0
      ? `Code-only \u2014 ${selectedPaths.join(', ')}`
      : 'Code-only \u2014 (none selected)';

  return (
    <div className="sgd-card sgd-deploy-summary-card">
      <h3 className="sgd-deploy-info-card__title">Deploy summary</h3>
      <div className="sgd-deploy-summary-rows">
        <SummaryRow label="Profile"     value={preflight.profileName} />
        <SummaryRow label="Host"        value={preflight.sshHost} />
        <SummaryRow label="Remote path" value={preflight.remoteWebRoot} mono />
        <SummaryRow label="Domain"      value={preflight.productionDomain || '—'} />
        <SummaryRow
          label="Mode"
          value={modeLabel}
          highlight={mode === 'full' ? 'danger' : null}
        />
      </div>
    </div>
  );
}

function SummaryRow({ label, value, mono, highlight }) {
  const cls = [
    'sgd-deploy-summary-value',
    mono             ? 'sgd-deploy-summary-value--mono'   : '',
    highlight === 'danger' ? 'sgd-deploy-summary-value--danger' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="sgd-deploy-summary-row">
      <span className="sgd-deploy-summary-label">{label}</span>
      <span className={cls}>{value}</span>
    </div>
  );
}

// ─── Path row (local source card) ────────────────────────────────────────────

function PathRow({ label, value, ok }) {
  return (
    <div className="sgd-deploy-path-row">
      <span className="sgd-deploy-path-label">{label}</span>
      <span
        className={`sgd-deploy-path-value${ok === false ? ' sgd-deploy-path-value--error' : ''}`}
        title={value || ''}
      >
        {value || <em className="sgd-muted">not found</em>}
      </span>
      {ok === false && <span className="sgd-deploy-path-badge sgd-deploy-path-badge--error">missing</span>}
      {ok === true  && <span className="sgd-deploy-path-badge sgd-deploy-path-badge--ok">found</span>}
    </div>
  );
}

// ─── Indeterminate checkbox ───────────────────────────────────────────────────

function IndeterminateCheckbox({ checked, indeterminate, className, onChange, disabled }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate && !checked);
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className={className}
    />
  );
}

// ─── Directory tree picker (code-only) ───────────────────────────────────────

function DirTreePicker({ profileId, preflight, selectedPaths, onChange, disabled }) {
  const [expanded,    setExpanded]    = useState({});
  const [dirContents, setDirContents] = useState({});
  const [loading,     setLoading]     = useState({});

  const knownKeys  = CODE_DIRS.map((d) => d.key);
  const existingAll = (preflight.wpContentDirs || []);
  const knownExist  = knownKeys.filter((k) => existingAll.includes(k));
  const extras      = existingAll.filter((d) => !knownKeys.includes(d));
  const topDirs     = [...knownExist, ...extras];

  const isDirFullySelected    = (dir) => selectedPaths.includes(dir);
  const isDirPartiallySelected = (dir) =>
    !selectedPaths.includes(dir) && selectedPaths.some((p) => p.startsWith(dir + '/'));
  const isChildSelected = (childPath) => {
    const parent = childPath.split('/')[0];
    return selectedPaths.includes(parent) || selectedPaths.includes(childPath);
  };

  function toggleDir(dir) {
    if (isDirFullySelected(dir)) {
      onChange(selectedPaths.filter((p) => p !== dir));
    } else {
      onChange([...selectedPaths.filter((p) => !p.startsWith(dir + '/')), dir]);
    }
  }

  function toggleChild(childPath) {
    const parent = childPath.split('/')[0];
    if (isDirFullySelected(parent)) {
      const siblings = (dirContents[parent] || [])
        .filter((e) => e.isDir)
        .map((e) => `${parent}/${e.name}`)
        .filter((p) => p !== childPath);
      onChange([...selectedPaths.filter((p) => p !== parent), ...siblings]);
    } else if (selectedPaths.includes(childPath)) {
      onChange(selectedPaths.filter((p) => p !== childPath));
    } else {
      onChange([...selectedPaths, childPath]);
    }
  }

  async function toggleExpand(dir) {
    const nowExpanded = !expanded[dir];
    setExpanded((prev) => ({ ...prev, [dir]: nowExpanded }));
    if (nowExpanded && !dirContents[dir]) {
      setLoading((prev) => ({ ...prev, [dir]: true }));
      const res = await listLocalDir(profileId, dir);
      setLoading((prev) => ({ ...prev, [dir]: false }));
      if (res.success) setDirContents((prev) => ({ ...prev, [dir]: res.data }));
    }
  }

  const knownMeta = Object.fromEntries(CODE_DIRS.map((d) => [d.key, d]));

  return (
    <div className="sgd-dir-tree">
      {topDirs.map((dir) => {
        const meta         = knownMeta[dir];
        const isExpanded   = Boolean(expanded[dir]);
        const isFullSel    = isDirFullySelected(dir);
        const isPartSel    = isDirPartiallySelected(dir);
        const isLoading    = Boolean(loading[dir]);
        const children     = dirContents[dir] || [];
        const localInfo    = preflight.targets?.find((t) => t.target === dir);
        const localMissing = localInfo ? localInfo.localExists === false : false;

        return (
          <div key={dir} className="sgd-dir-tree__row">
            <div className={`sgd-dir-tree__item${disabled ? ' sgd-dir-tree__item--disabled' : ''}`}>
              <IndeterminateCheckbox
                className="sgd-deploy-target__checkbox"
                checked={isFullSel}
                indeterminate={isPartSel}
                disabled={disabled}
                onChange={() => toggleDir(dir)}
              />
              <button
                type="button"
                className={`sgd-dir-tree__expand${isExpanded ? ' sgd-dir-tree__expand--open' : ''}`}
                onClick={() => toggleExpand(dir)}
                title={isExpanded ? 'Collapse' : 'Expand to pick specific items'}
              >
                {isLoading ? <span className="sgd-spinner sgd-spinner--xs" /> : '›'}
              </button>
              <span className="sgd-deploy-target__name">{dir}</span>
              {localMissing && (
                <span className="sgd-deploy-target__badge sgd-deploy-target__badge--missing">
                  not found locally
                </span>
              )}
              {meta?.warning && !localMissing && (
                <span className="sgd-deploy-target__badge sgd-deploy-target__badge--warn">
                  ⚠ {meta.warning}
                </span>
              )}
            </div>

            {isExpanded && (
              <div className="sgd-dir-tree__children">
                {children.length === 0 && !isLoading && (
                  <span className="sgd-dir-tree__empty">empty</span>
                )}
                {children.map((child) => {
                  const childPath = `${dir}/${child.name}`;
                  const childSel  = isChildSelected(childPath);
                  return (
                    <label
                      key={child.name}
                      className={`sgd-dir-tree__child${disabled ? ' sgd-dir-tree__item--disabled' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="sgd-deploy-target__checkbox"
                        checked={childSel}
                        disabled={disabled || !child.isDir}
                        onChange={() => child.isDir && toggleChild(childPath)}
                      />
                      <span className={`sgd-dir-tree__child-icon${child.isDir ? '' : ' sgd-dir-tree__child-icon--file'}`}>
                        {child.isDir ? '📁' : '📄'}
                      </span>
                      <span className="sgd-deploy-target__name">{child.name}</span>
                      {!child.isDir && (
                        <span className="sgd-dir-tree__child-hint">deploy the parent folder to include files</span>
                      )}
                    </label>
                  );
                })}
                {isFullSel && children.length > 0 && (
                  <p className="sgd-dir-tree__full-hint">
                    Entire <code>{dir}/</code> selected. Uncheck above or click a sub-folder to narrow the selection.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Full deploy exclusion list ─────────────────────────────────────────────

// Directories the addon always excludes regardless of user choice
const ALWAYS_EXCLUDED = ['sgd-db-backups'];

// Directories pre-checked as excluded by default (if they exist on the remote)
const DEFAULT_EXCLUDED = ['backups-dup-lite', 'updraft'];

function ArchiveFormatPicker({ value, onChange }) {
  return (
    <div className="sgd-card sgd-deploy-format-picker">
      <h3 className="sgd-deploy-format-picker__title">Archive format</h3>
      <p className="sgd-deploy-format-picker__hint">
        Archive size is shown in the deploy log after it creates.
      </p>
      <div className="sgd-deploy-format-picker__options">
        <label className={`sgd-deploy-format-picker__option${value === 'tar' ? ' sgd-deploy-format-picker__option--active' : ''}`}>
          <input type="radio" name="archiveFormat" value="tar"
            checked={value === 'tar'} onChange={() => onChange('tar')} />
          <div className="sgd-deploy-format-picker__option-body">
            <strong>TAR</strong>
            <span className="sgd-deploy-format-picker__desc">No compression — fastest, ideal for large uploads folders</span>
          </div>
        </label>
        <label className={`sgd-deploy-format-picker__option${value === 'zip' ? ' sgd-deploy-format-picker__option--active' : ''}`}>
          <input type="radio" name="archiveFormat" value="zip"
            checked={value === 'zip'} onChange={() => onChange('zip')} />
          <div className="sgd-deploy-format-picker__option-body">
            <strong>ZIP</strong>
            <span className="sgd-deploy-format-picker__desc">Compressed — smaller upload, slower to create</span>
          </div>
        </label>
      </div>
    </div>
  );
}

function ExcludeDirectories({ dirs, excluded, onChange }) {

  // Dirs the user can actually toggle (hide the always-excluded ones)
  const toggleable = dirs.filter((d) => !ALWAYS_EXCLUDED.includes(d));

  function toggle(dir) {
    onChange(
      excluded.includes(dir)
        ? excluded.filter((d) => d !== dir)
        : [...excluded, dir]
    );
  }

  return (
    <div className="sgd-deploy-exclude">
      <h4 className="sgd-deploy-exclude__title">Exclude directories from this deploy</h4>
      <p className="sgd-deploy-exclude__hint">
        Checked directories will be <strong>skipped</strong> — they won't be zipped or uploaded.
        Useful for large folders like uploads that haven't changed.
      </p>
      <div className="sgd-deploy-exclude__list">
        {toggleable.map((dir) => (
          <label key={dir} className="sgd-deploy-exclude__item">
            <input
              type="checkbox"
              checked={excluded.includes(dir)}
              onChange={() => toggle(dir)}
              className="sgd-deploy-exclude__checkbox"
            />
            <span className="sgd-deploy-exclude__name">{dir}</span>
            {dir === 'uploads' && (
              <span className="sgd-deploy-target__badge sgd-deploy-target__badge--warn">
                ⚠ usually large
              </span>
            )}
          </label>
        ))}
      </div>
      {excluded.length > 0 && (
        <p className="sgd-deploy-exclude__summary">
          Skipping: <strong>{excluded.join(', ')}</strong>
        </p>
      )}
    </div>
  );
}

// ─── Full deploy danger zone ──────────────────────────────────────────────────

function FullDeployDangerZone({ dbConfirmed, onConfirmChange, productionDomain, mode = 'full' }) {
  const isDbOnly = mode === 'db';
  return (
    <div className="sgd-deploy-danger-zone">
      <div className="sgd-deploy-danger-zone__header">
        <span className="sgd-deploy-danger-zone__icon">⚠</span>
        <h3 className="sgd-deploy-danger-zone__title">
          {isDbOnly ? 'Database deploy — read carefully before proceeding' : 'Full deploy — read carefully before proceeding'}
        </h3>
      </div>

      <div className="sgd-deploy-danger-zone__body">
        <p className="sgd-deploy-danger-zone__lead">
          {isDbOnly
            ? <>Database deploy overwrites the <strong>production database</strong> from your Local site. No files are changed.</>
            : <>Full deploy syncs the <strong>entire wp-content directory</strong> from your Local site to the production server, then overwrites the remote database.</>}
        </p>

        <ul className="sgd-deploy-danger-zone__list">
          <li>
            <span className="sgd-dz-bullet sgd-dz-bullet--safe">🛡</span>
            <span>
              A <strong>database backup</strong> is created on the remote server{' '}
              <em>before</em> any changes are made. Its path is shown in the activity log.
            </span>
          </li>
          {!isDbOnly && (
            <li>
              <span className="sgd-dz-bullet sgd-dz-bullet--warn">⚙</span>
              <span>
                <strong>All subdirectories</strong> in wp-content (themes, plugins, uploads,
                and any others) are synced. Files present remotely but not locally will be{' '}
                <strong>deleted</strong>.
              </span>
            </li>
          )}
          <li>
            <span className="sgd-dz-bullet sgd-dz-bullet--danger">✕</span>
            <span>
              The <strong>production database</strong>
              {productionDomain ? <> at <strong> {productionDomain}</strong></> : null} will
              be overwritten.{' '}
              <strong>This cannot be automatically undone.</strong>
            </span>
          </li>
          <li>
            <span className="sgd-dz-bullet sgd-dz-bullet--info">ℹ</span>
            <span>
              Your local database will be exported and imported automatically via WP-CLI
              on the remote server. The Activity Log will record each step.
            </span>
          </li>
        </ul>

        <label className="sgd-deploy-danger-zone__confirm">
          <input
            type="checkbox"
            checked={dbConfirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className="sgd-deploy-danger-zone__checkbox"
          />
          <span>
            {isDbOnly
              ? <>I have read the above. I understand the production database at{' '}
                  <strong>{productionDomain || 'production'}</strong> will be overwritten. I have
                  confirmed the correct profile is selected.</>
              : <>I have read the above. I understand the entire wp-content will be synced and
                  the production database at{' '}
                  <strong>{productionDomain || 'production'}</strong> will be overwritten. I have
                  confirmed the correct profile is selected.</>}
          </span>
        </label>
      </div>
    </div>
  );
}

// ─── Activity log ─────────────────────────────────────────────────────────────

function LogView({ entries, logRef }) {
  return (
    <div className="sgd-log sgd-log--deploy" ref={logRef}>
      {entries.length === 0 && (
        <div className="sgd-log__line--info">Initializing deploy…</div>
      )}
      {entries.map((e, i) => (
        <div key={i} className={LEVEL_CLASS[e.level] || 'sgd-log__line--info'}>
          <span className="sgd-log__ts">{new Date(e.timestamp).toLocaleTimeString()}</span>
          <span className="sgd-log__msg">{e.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DeployScreen({ profileId, defaultMode, onViewLogs, onBack }) {
  // Preflight state
  const [preflight, setPreflight]               = useState(null);
  const [preflightLoading, setPreflightLoading]  = useState(true);
  const [preflightError, setPreflightError]      = useState(null);

  // Config state
  const [mode, setMode]                   = useState(defaultMode === 'full' ? 'full' : defaultMode === 'db' ? 'db' : 'code');
  const [selectedPaths, setSelectedPaths] = useState([...DEFAULT_SELECTED_PATHS]);
  const [dbConfirmed, setDbConfirmed]     = useState(false);
  const [excludeDirs, setExcludeDirs]     = useState([]);  // dirs to skip in full deploy
  const [archiveFormat, setArchiveFormat] = useState('zip'); // 'zip' | 'tar'

  // Deploy flow state
  const [phase, setPhase]           = useState('config');       // 'config'|'deploying'|'done'
  const [running, setRunning]       = useState(false);
  const [result, setResult]         = useState(null);
  const [logEntries, setLogEntries] = useState([]);

  const logRef = useRef(null);

  // ── Load preflight info ──────────────────────────────────────────────────────
  const loadPreflight = useCallback(() => {
    setPreflightLoading(true);
    setPreflightError(null);
    deployPreflight(profileId, CODE_DIRS.map((t) => t.key)).then((res) => {
      if (res.success) {
        setPreflight(res.data);
        // Apply the resolved confirm-default (global setting OR per-profile override)
        setDbConfirmed(Boolean(res.data.resolvedConfirmDefault));
        // Pre-check any default-excluded folders that actually exist on the remote
        const dirs = res.data.wpContentDirs || [];
        setExcludeDirs((prev) => {
          const toAdd = DEFAULT_EXCLUDED.filter((d) => dirs.includes(d) && !prev.includes(d));
          return toAdd.length ? [...prev, ...toAdd] : prev;
        });
      } else {
        setPreflightError(res.error);
      }
      setPreflightLoading(false);
    });
  }, [profileId]);

  useEffect(() => { loadPreflight(); }, [loadPreflight]);

  // ── Subscribe to streaming log entries ───────────────────────────────────────
  useEffect(() => {
    const unsub = onLogEntry((entry) => setLogEntries((prev) => [...prev, entry]));
    return unsub;
  }, []);

  // ── Auto-scroll log ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logEntries]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handleModeChange(m) {
    setMode(m);
    setDbConfirmed(preflight ? Boolean(preflight.resolvedConfirmDefault) : false);
    setExcludeDirs([]);
    setArchiveFormat('zip');
  }

  async function handleDeploy() {
    setRunning(true);
    setResult(null);
    setLogEntries([]);
    setPhase('deploying');

    const res = mode === 'full'
      ? await runFullDeploy(profileId, { confirmed: true, excludeDirs, format: archiveFormat })
      : mode === 'db'
        ? await runDbDeploy(profileId, { confirmed: true })
        : await runCodeDeploy(profileId, { paths: selectedPaths, format: archiveFormat });

    setResult(res);
    setRunning(false);
    setPhase('done');
  }

  function handleStop() {
    cancelDeploy(profileId);
  }

  function handleDeployAgain() {
    setPhase('config');
    setResult(null);
    setLogEntries([]);
    setDbConfirmed(preflight ? Boolean(preflight.resolvedConfirmDefault) : false);
    setSelectedPaths([...DEFAULT_SELECTED_PATHS]);
    setArchiveFormat('zip');
    loadPreflight();
  }

  // ── Can the deploy button be pressed? ────────────────────────────────────────
  const canDeploy = Boolean(
    !running &&
    !preflightLoading &&
    preflight &&
    (mode === 'db' || preflight.wpContentReachable) &&
    (mode === 'full' ? dbConfirmed : mode === 'db' ? dbConfirmed : selectedPaths.length > 0)
  );

  // ── Header ─────────────────────────────────────────────────────────────────
  function renderHeader(subtitle) {
    const name = preflight ? preflight.profileName : '…';
    return (
      <div className="sgd-deploy-header">
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack}>
          ← Back
        </button>
        <div>
          <h2 className="sgd-deploy-title">Deploy</h2>
          <p className="sgd-deploy-subtitle">
            {name}
            {subtitle ? <span className="sgd-deploy-subtitle__status"> — {subtitle}</span> : null}
          </p>
        </div>
      </div>
    );
  }

  // ── Phase: deploying / done ──────────────────────────────────────────────────
  if (phase === 'deploying' || phase === 'done') {
    const isCancelled = !running && result?.error === 'Deploy cancelled';
    const resultLabel = running
      ? 'deploying…'
      : isCancelled
        ? 'cancelled'
        : result?.success
          ? 'complete'
          : 'failed';

    return (
      <div className="sgd-deploy-screen">
        {renderHeader(resultLabel)}

        {/* Result banner */}
        {result && (
          <div className={`sgd-alert ${result.success ? 'sgd-alert--success' : isCancelled ? 'sgd-alert--warning' : 'sgd-alert--danger'}`}>
            {result.success
              ? mode === 'full'
                ? `Full deploy complete — ${(result.data?.synced || []).length} directories synced.`
                : mode === 'db'
                  ? 'Database deploy complete — remote database overwritten.'
                  : `Code deploy complete — synced: ${(result.data?.targets || []).join(', ')}`
              : isCancelled
                ? 'Deploy cancelled. Your site was not changed.'
                : `Deploy failed: ${result.error}`}
          </div>
        )}

        {/* Stop button (shown while running) */}
        {running && (
          <div className="sgd-deploy-stop-bar">
            <button className="sgd-btn sgd-btn--danger sgd-btn--sm" onClick={handleStop}>
              ■ Stop deploy
            </button>
          </div>
        )}

        {/* Live / completed log */}
        <LogView entries={logEntries} logRef={logRef} />

        {/* Post-deploy actions */}
        {phase === 'done' && (
          <div className="sgd-deploy-actions sgd-deploy-actions--done">
            <button className="sgd-btn sgd-btn--primary" onClick={handleDeployAgain}>
              ← Configure another deploy
            </button>
            <button className="sgd-btn sgd-btn--ghost" onClick={() => onViewLogs(profileId)}>
              View log history
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Phase: config ────────────────────────────────────────────────────────────
  return (
    <div className="sgd-deploy-screen">
      {renderHeader()}

      {/* Loading state */}
      {preflightLoading && (
        <div className="sgd-deploy-loading">
          <span className="sgd-spinner" /> Loading site info…
        </div>
      )}

      {/* Preflight error */}
      {preflightError && !preflightLoading && (
        <div className="sgd-alert sgd-alert--danger">
          Could not load profile info: {preflightError}
        </div>
      )}

      {preflight && !preflightLoading && (
        <>
          {/* ── Mode selector ── */}
          <ModeTabs mode={mode} onChange={handleModeChange} />

          {/* ── Deploy summary ── */}
          <SummaryCard
            preflight={preflight}
            mode={mode}
            selectedPaths={mode === 'code' ? selectedPaths : ['entire wp-content']}
          />

          {/* ── Code-only: directory tree picker ── */}
          {mode === 'code' && (
            <div className="sgd-card sgd-deploy-targets-card">
              <h3 className="sgd-deploy-info-card__title">Directories to deploy</h3>
              <p className="sgd-dir-tree__hint">
                Check top-level folders to deploy the whole directory, or expand › to pick specific sub-folders.
              </p>
              <DirTreePicker
                profileId={profileId}
                preflight={preflight}
                selectedPaths={selectedPaths}
                onChange={setSelectedPaths}
                disabled={!preflight.wpContentReachable}
              />
            </div>
          )}

          {/* ── Full deploy: exclusion list + danger zone ── */}
          {mode === 'full' && (
            <>
              <ExcludeDirectories
                dirs={preflight.wpContentDirs || []}
                excluded={excludeDirs}
                onChange={setExcludeDirs}
              />
              <FullDeployDangerZone
                dbConfirmed={dbConfirmed}
                onConfirmChange={setDbConfirmed}
                productionDomain={preflight.productionDomain}
              />
            </>
          )}

          {/* ── Database-only: danger zone ── */}
          {mode === 'db' && (
            <FullDeployDangerZone
              mode="db"
              dbConfirmed={dbConfirmed}
              onConfirmChange={setDbConfirmed}
              productionDomain={preflight.productionDomain}
            />
          )}

          {/* ── Archive format ── */}
          {mode !== 'db' && <ArchiveFormatPicker value={archiveFormat} onChange={setArchiveFormat} />}

          {/* ── Local source ── */}
          <div className="sgd-card sgd-deploy-info-card">
            <h3 className="sgd-deploy-info-card__title">Local source</h3>
            <PathRow
              label="Site"
              value={preflight.localSiteName || preflight.localSiteId}
              ok={preflight.localSiteId ? undefined : false}
            />
            <PathRow
              label="wp-content"
              value={preflight.wpContentPath}
              ok={preflight.wpContentReachable}
            />
          </div>

          {/* wp-content not found warning */}
          {!preflight.wpContentReachable && (
            <div className="sgd-alert sgd-alert--danger">
              Local wp-content is not accessible. Make sure the Local site is running
              and the site path has not been moved.
            </div>
          )}

          {/* ── Deploy action bar ── */}
          <div className="sgd-deploy-actions">
            <button
              className={`sgd-btn sgd-btn--lg ${mode === 'full' || mode === 'db' ? 'sgd-btn--danger' : 'sgd-btn--primary'}`}
              onClick={handleDeploy}
              disabled={!canDeploy}
            >
              {mode === 'full'
                ? '⚡ Run full deploy'
                : mode === 'db'
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><DbIcon size={15} /> Deploy database</span>
                  : '▶ Deploy code'}
            </button>

            <span className="sgd-deploy-actions__hint">
              {mode === 'db'
                ? dbConfirmed
                  ? 'Confirmation received. Ready to deploy database.'
                  : 'Check the confirmation box above to enable deploy.'
                : !preflight.wpContentReachable
                  ? 'Local wp-content is not accessible.'
                  : mode === 'full'
                    ? dbConfirmed
                      ? 'Confirmation received. Ready to deploy.'
                      : 'Check the confirmation box above to enable deploy.'
                    : selectedPaths.length === 0
                      ? 'Select at least one directory to deploy.'
                      : `Will sync: ${selectedPaths.join(', ')}`
              }
            </span>
          </div>
        </>
      )}
    </div>
  );
}
