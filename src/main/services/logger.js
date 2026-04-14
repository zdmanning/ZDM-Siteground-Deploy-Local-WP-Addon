/**
 * Logger
 *
 * Structured append-only log for deploy activity.
 * Persisted to disk via electron-store.
 *
 * ── Entry shape ──────────────────────────────────────────────────────────────
 * {
 *   id:         string,        // 8-char hex, stable React key
 *   timestamp:  string,        // ISO 8601
 *   profileId:  string|null,
 *   runId:      string|null,   // links entry to a run summary
 *   actionType: string,        // 'code_deploy' | 'full_deploy' | 'connection_test' | 'system'
 *   level:      string,        // 'info' | 'success' | 'warning' | 'error'
 *   message:    string,
 *   metadata:   object|null,
 * }
 *
 * ── Run shape ─────────────────────────────────────────────────────────────────
 * {
 *   runId:      string,
 *   profileId:  string|null,
 *   actionType: string,
 *   startedAt:  string,        // ISO
 *   finishedAt: string|null,
 *   outcome:    'running' | 'success' | 'failure',
 *   durationMs: number|null,
 *   metadata:   object|null,   // { host, targets, mode, error, … }
 * }
 *
 * ── Storage layout (electron-store "siteground-deploy-logs") ─────────────────
 *   logs.<profileId>  Array<Entry>  — flat entry list, newest at end
 *   runs.<profileId>  Array<Run>    — run summaries, newest at end
 */

'use strict';

const { randomBytes } = require('crypto');
const Store = require('electron-store');

const store = new Store({
  name: 'siteground-deploy-logs',
  defaults: { logs: {}, runs: {} },
});

const MAX_ENTRIES_PER_PROFILE = 1000;
const MAX_RUNS_PER_PROFILE    = 100;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _shortId() {
  return randomBytes(4).toString('hex'); // 8-char hex
}

function _label(actionType) {
  const map = {
    code_deploy:     'Code deploy',
    full_deploy:     'Full deploy',
    connection_test: 'Connection test',
    system:          'System',
  };
  return map[actionType] || 'Run';
}

function _key(profileId) { return profileId || '__global__'; }

function _getLogs(profileId) {
  return store.get(`logs.${_key(profileId)}`, []);
}
function _setLogs(profileId, entries) {
  store.set(`logs.${_key(profileId)}`, entries);
}
function _getRuns(profileId) {
  return store.get(`runs.${_key(profileId)}`, []);
}
function _setRuns(profileId, runs) {
  store.set(`runs.${_key(profileId)}`, runs);
}

// ─── Entry API ────────────────────────────────────────────────────────────────

/**
 * Append a structured log entry. Fills in defaults for absent fields.
 *
 * @param {string|null} profileId
 * @param {object}      entry
 */
function appendEntry(profileId, entry) {
  const normalized = {
    id:         _shortId(),
    timestamp:  entry.timestamp  || new Date().toISOString(),
    profileId:  profileId        || null,
    runId:      entry.runId      || null,
    actionType: entry.actionType || 'system',
    level:      entry.level      || 'info',
    message:    entry.message    || '',
    metadata:   entry.metadata   || null,
  };
  const entries = _getLogs(profileId);
  entries.push(normalized);
  _setLogs(profileId, entries.slice(-MAX_ENTRIES_PER_PROFILE));
}

/**
 * Get all stored log entries for a profile, oldest-first.
 * @param {string|null} profileId
 * @returns {Array<object>}
 */
function getLog(profileId) {
  return _getLogs(profileId);
}

/**
 * Get all entries belonging to a specific run.
 * @param {string|null} profileId
 * @param {string}      runId
 * @returns {Array<object>}
 */
function getRunEntries(profileId, runId) {
  return _getLogs(profileId).filter((e) => e.runId === runId);
}

/**
 * Clear all log entries and run records for a profile.
 * @param {string|null} profileId
 */
function clearLog(profileId) {
  _setLogs(profileId, []);
  _setRuns(profileId, []);
}

// ─── Run API ──────────────────────────────────────────────────────────────────

/**
 * Record that a new run has started.
 * Does NOT write a log entry — let the caller emit its own messages.
 *
 * @param {string|null} profileId
 * @param {string}      actionType  'code_deploy' | 'full_deploy' | 'connection_test'
 * @param {string}      runId
 * @param {object|null} metadata    e.g. { host, targets, mode }
 */
function startRun(profileId, actionType, runId, metadata) {
  const run = {
    runId,
    profileId:  profileId  || null,
    actionType: actionType || 'system',
    startedAt:  new Date().toISOString(),
    finishedAt: null,
    outcome:    'running',
    durationMs: null,
    metadata:   metadata || null,
  };
  const runs = _getRuns(profileId);
  runs.push(run);
  _setRuns(profileId, runs.slice(-MAX_RUNS_PER_PROFILE));
}

/**
 * Mark a run as finished, updating outcome, duration, and metadata.
 * Does NOT write a log entry — deploy-service already emits a summary line.
 *
 * @param {string|null}         profileId
 * @param {string}              runId
 * @param {'success'|'failure'} outcome
 * @param {object|null}         metadata  Final details (targets synced, error…)
 */
function finishRun(profileId, runId, outcome, metadata) {
  const runs = _getRuns(profileId);
  for (let i = runs.length - 1; i >= 0; i--) {
    if (runs[i].runId === runId) {
      const finishedAt = new Date().toISOString();
      runs[i] = {
        ...runs[i],
        finishedAt,
        outcome,
        durationMs: runs[i].startedAt
          ? Date.now() - new Date(runs[i].startedAt).getTime()
          : null,
        metadata: metadata
          ? { ...runs[i].metadata, ...metadata }
          : runs[i].metadata,
      };
      break;
    }
  }
  _setRuns(profileId, runs);
}

/**
 * Get all run summaries for a profile, most-recent first.
 * @param {string|null} profileId
 * @returns {Array<object>}
 */
function getRuns(profileId) {
  return [..._getRuns(profileId)].reverse();
}

// ─── Compat shim ─────────────────────────────────────────────────────────────

/** @deprecated Use startRun / finishRun instead. */
function markDeployRun(profileId) {
  appendEntry(profileId, {
    level:      'info',
    actionType: 'system',
    message:    '─── Deploy run started ───',
  });
}

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  appendEntry,
  getLog,
  getRunEntries,
  clearLog,
  startRun,
  finishRun,
  getRuns,
  markDeployRun,
};
