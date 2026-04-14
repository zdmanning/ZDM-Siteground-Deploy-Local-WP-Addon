import React, { useEffect, useState, useRef } from 'react';
import { getLogs, clearLogs } from '../ipc';

const LEVEL_COLORS = {
  info: '#adb5bd',
  success: '#6edd8e',
  warning: '#ffc107',
  error: '#ff6b6b',
};

export default function ActivityLog({ profileId, onBack }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const logRef = useRef(null);

  useEffect(() => {
    getLogs(profileId).then((list) => {
      setEntries(list);
      setLoading(false);
    });
  }, [profileId]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries]);

  async function handleClear() {
    if (!window.confirm('Clear all log entries for this profile?')) return;
    await clearLogs(profileId);
    setEntries([]);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>Activity log</h2>
        {entries.length > 0 && (
          <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" style={{ marginLeft: 'auto' }} onClick={handleClear}>
            Clear log
          </button>
        )}
      </div>

      {loading && <p>Loading…</p>}

      {!loading && entries.length === 0 && (
        <div className="sgd-empty">
          <strong>No log entries yet.</strong>
          <p>Deploy activity will appear here.</p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="sgd-log" ref={logRef} style={{ maxHeight: '480px' }}>
          {entries.map((entry, i) => (
            <div
              key={i}
              style={{ color: LEVEL_COLORS[entry.level] || LEVEL_COLORS.info, marginBottom: 1 }}
            >
              <span style={{ color: '#555', marginRight: 10, fontSize: '10px' }}>
                {new Date(entry.timestamp).toLocaleString()}
              </span>
              {entry.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
