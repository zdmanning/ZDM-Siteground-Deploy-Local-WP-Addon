import React, { useEffect, useState } from 'react';
import { listProfiles, deleteProfile } from '../ipc';

export default function Dashboard({ site, onNewProfile, onSelectProfile, onSettings }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProfiles().then((result) => {
      setProfiles(result.data || result);
      setLoading(false);
    });
  }, []);

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm('Delete this profile? This cannot be undone.')) return;
    await deleteProfile(id);
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Deployment profiles</h2>
        <button className="sgd-btn sgd-btn--primary" onClick={onNewProfile}>
          + New profile
        </button>
      </div>

      {loading && <p>Loading profiles…</p>}

      {!loading && profiles.length === 0 && (
        <div className="sgd-empty">
          <strong>No profiles yet.</strong>
          <p>Create a profile to start deploying this site to SiteGround.</p>
          <button className="sgd-btn sgd-btn--primary" onClick={onNewProfile} style={{ marginTop: 12 }}>
            Create first profile
          </button>
        </div>
      )}

      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="sgd-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectProfile(profile.id)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="sgd-card__title">{profile.name}</div>
              <div className="sgd-card__meta">
                {profile.sshUser}@{profile.sshHost} &nbsp;·&nbsp; {profile.productionDomain}
              </div>
              {profile.lastDeployedAt && (
                <div className="sgd-card__meta" style={{ marginTop: 2 }}>
                  Last deployed: {new Date(profile.lastDeployedAt).toLocaleString()}
                </div>
              )}
            </div>
            <button
              className="sgd-btn sgd-btn--secondary sgd-btn--sm"
              onClick={(e) => handleDelete(e, profile.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
