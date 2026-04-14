import React, { useEffect, useState, useCallback } from 'react';
import { getRuns, getRunEntries, clearLogs } from '../ipc';

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'all',             label: 'All' },
  { key: 'code_deploy',     label: 'Code deploy' },
  { key: 'full_deploy',     label: 'Full deploy' },
  { key: 'connection_test', label: 'Connection test' },
];

const ACTION_LABELS = {
  code_deploy:     'Code deploy',
  full_deploy:     'Full deploy',
  connection_test: 'Connection test',
  system:          'System',
};

const ACTION_CLASS = {
  code_deploy:     'sgd-run-badge--code',
  full_deploy:     'sgd-run-badge--full',
  connection_test: 'sgd-run-badge--conn',
  system:          'sgd-run-badge--system',
};

const OUTCOME_CLASS = {
  success: 'sgd-run-outcome--success',
  failure: 'sgd-run-outcome--failure',
  running: 'sgd-run-outcome--running',
};

const LEVEL_CLASS = {
  info:    'sgd-log__line--info',
  success: 'sgd-log__line--success',
  warning: 'sgd-log__line--warning',
  error:   'sgd-log__line--error',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _relTime(isoString) {
  const ms   = Date.now() - new Date(isoString).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60)   return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60)   return `${mins}m ago`;
  const hrs  = Math.floor(mins / 60);
  if (hrs  < 24)   return `${hrs}h ago`;
  return new Date(isoString).toLocaleDateString();
}

function _duration(ms) {
  if (!ms || ms < 0) return null;
  if (ms < 1000)     return `${ms}ms`;
  if (ms < 60000)    return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

// ─── RunEntries ───────────────────────────────────────────────────────────────

function RunEntries({ entries }) {
  if (!entries) {
    return (
      <div className="sgd-run-card__entries-loading">
        <span className="sgd-spinner" /> Loading entries…
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="sgd-run-card__entries-empty">
        No log entries recorded for this run.
      </div>
    );
  }
  return (
    <div className="sgd-run-card__entries sgd-log">
      {entries.map((e) => (
        <div
          key={e.id || e.timestamp}
          className={`sgd-run-entry ${LEVEL_CLASS[e.level] || LEVEL_CLASS.info}`}
        >
          <span className="sgd-run-entry__ts">
            {new Date(e.timestamp).toLocaleTimeString()}
          </span>
          <span className="sgd-run-entry__msg">{e.message}</span>
          {e.metadata && e.metadata.error && (
            <span className="sgd-run-entry__meta">{e.metadata.error}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── RunCard ──────────────────────────────────────────────────────────────────

function RunCard({ run, entries, expanded, onToggle }) {
  const dur = _duration(run.durationMs);

  return (
    <div className={`sgd-run-card${expanded ? ' sgd-run-card--expanded' : ''}`}>
      <button className="sgd-run-card__header" onClick={onToggle}>
        <span className={`sgd-run-badge ${ACTION_CLASS[run.actionType] || ACTION_CLASS.system}`}>
          {ACTION_LABELS[run.actionType] || run.actionType}
        </span>

        <span className="sgd-run-card__time">{_relTime(run.startedAt)}</span>

        {dur && <span className="sgd-run-card__duration">{dur}</span>}

        {run.metadata?.targets && (
          <span className="sgd-run-card__targets">
            {run.metadata.targets.join(', ')}
          </span>
        )}

        <span className={`sgd-run-outcome ${OUTCOME_CLASS[run.outcome] || ''}`}>
          {run.outcome}
        </span>

        <span className="sgd-run-card__chevron">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="sgd-run-card__body">
          {/* Metadata row */}
          <div className="sgd-run-card__meta">
            {run.metadata?.host && (
              <span className="sgd-run-card__meta-item">
                <strong>Host</strong> {run.metadata.host}
              </span>
            )}
            {run.finishedAt && (
              <span className="sgd-run-card__meta-item">
                <strong>Finished</strong> {new Date(run.finishedAt).toLocaleString()}
              </span>
            )}
            {run.metadata?.error && (
              <span className="sgd-run-card__meta-item sgd-run-card__meta-item--error">
                <strong>Error</strong> {run.metadata.error}
              </span>
            )}
            {run.metadata?.synced && (
              <span className="sgd-run-card__meta-item">
                <strong>Synced</strong> {run.metadata.synced.join(', ')}
              </span>
            )}
          </div>

          <RunEntries entries={entries} />
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ActivityLog({ profileId, onBack }) {
  const [runs, setRuns]             = useState([]);
  const [entries, setEntries]       = useState({});    // { [runId]: Entry[] }
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter]         = useState('all');
  const [loading, setLoading]       = useState(true);

  const loadRuns = useCallback(() => {
    setLoading(true);
    getRuns(profileId).then((list) => {
      setRuns(Array.isArray(list) ? list : []);
      setLoading(false);
    });
  }, [profileId]);

  useEffect(() => { loadRuns(); }, [loadRuns]);

  async function handleToggle(runId) {
    if (expandedId === runId) { setExpandedId(null); return; }
    setExpandedId(runId);
    if (!entries[runId]) {
      const list = await getRunEntries(profileId, runId);
      setEntries((prev) => ({ ...prev, [runId]: Array.isArray(list) ? list : [] }));
    }
  }

  async function handleClear() {
    if (!window.confirm('Clear all activity logs for this profile?\nThis cannot be undone.')) return;
    await clearLogs(profileId);
    setRuns([]);
    setEntries({});
    setExpandedId(null);
  }

  const filtered = filter === 'all' ? runs : runs.filter((r) => r.actionType === filter);
  const filterLabel = FILTERS.find((f) => f.key === filter)?.label.toLowerCase() || '';

  return (
    <div className="sgd-activity-log">

      {/* ── Header ── */}
      <div className="sgd-activity-log__header">
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack}>
          ← Back
        </button>
        <h2 className="sgd-activity-log__title">Activity log</h2>
        <div className="sgd-activity-log__header-actions">
          <button className="sgd-btn sgd-btn--ghost sgd-btn--sm" onClick={loadRuns}>
            ↺ Refresh
          </button>
          {runs.length > 0 && (
            <button className="sgd-btn sgd-btn--ghost sgd-btn--sm" onClick={handleClear}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Filter pills ── */}
      <div className="sgd-activity-filter">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`sgd-activity-filter__pill${filter === key ? ' sgd-activity-filter__pill--active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div className="sgd-activity-log__loading">
          <span className="sgd-spinner" /> Loading activity…
        </div>
      ) : filtered.length === 0 ? (
        <div className="sgd-empty">
          <strong>
            {filter === 'all'
              ? 'No activity yet.'
              : `No ${filterLabel} runs recorded yet.`}
          </strong>
          <p>Deploy runs and connection tests will appear here.</p>
        </div>
      ) : (
        <div className="sgd-activity-log__list">
          {filtered.map((run) => (
            <RunCard
              key={run.runId}
              run={run}
              entries={entries[run.runId]}
              expanded={expandedId === run.runId}
              onToggle={() => handleToggle(run.runId)}
            />
          ))}
        </div>
      )}

    </div>
  );
}

