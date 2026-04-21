import React, { useState, useEffect } from 'react';
import { deleteOrphanedKeys, getSettings, updateSettings, listProfiles, exportProfiles, pickImportFile, applyImport } from '../ipc';

export default function Settings({ onBack }) {
  const [activeTab, setActiveTab] = useState('settings');  // 'settings' | 'about'
  const [keyStatus, setKeyStatus] = useState(null);  // null | 'running' | { deleted: number } | { error: string }
  const [confirmDefault, setConfirmDefault] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // ── Export state ────────────────────────────────────────────────────────────
  const [profiles, setProfiles]             = useState([]);
  const [selectedIds, setSelectedIds]       = useState(null);   // null = not yet loaded
  const [exportStatus, setExportStatus]     = useState(null);   // null | 'running' | { ok, filePath?, count?, error? }

  // ── Import state ────────────────────────────────────────────────────────────
  const [importPreview, setImportPreview]   = useState(null);   // null | { profiles, conflicts, exportedAt, filePath }
  const [importDecisions, setImportDecisions] = useState({});   // Record<id, 'skip'|'overwrite'|'rename'>
  const [importStatus, setImportStatus]     = useState(null);   // null | 'picking' | 'applying' | { ok, imported, skipped, overwritten, renamed, error? }

  useEffect(() => {
    getSettings().then((res) => {
      if (res.success) setConfirmDefault(Boolean(res.data.confirmDefault));
      setSettingsLoaded(true);
    });
    listProfiles().then((res) => {
      if (res.success) {
        setProfiles(res.data);
        setSelectedIds(res.data.map((p) => p.id));  // all selected by default
      }
    });
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleConfirmDefaultChange(val) {
    setConfirmDefault(val);
    await updateSettings({ confirmDefault: val });
  }

  async function handleClearOrphanedKeys() {
    setKeyStatus('running');
    const result = await deleteOrphanedKeys();
    if (result.success) {
      setKeyStatus({ deleted: result.data.deleted });
    } else {
      setKeyStatus({ error: result.error });
    }
  }

  function toggleExportSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      prev.length === profiles.length ? [] : profiles.map((p) => p.id)
    );
  }

  async function handleExport() {
    setExportStatus('running');
    try {
      const ids = selectedIds && selectedIds.length < profiles.length ? selectedIds : null;
      const res = await exportProfiles(ids);
      if (res.success) {
        setExportStatus({ ok: true, filePath: res.data.filePath, count: res.data.count });
      } else if (res.error === 'Export cancelled.') {
        setExportStatus(null);
      } else {
        setExportStatus({ ok: false, error: res.error });
      }
    } catch (e) {
      setExportStatus(null);
    }
  }

  async function handlePickImport() {
    setImportStatus('picking');
    setImportPreview(null);
    setImportDecisions({});
    try {
      const res = await pickImportFile();
      if (!res.success) {
        setImportStatus(res.error === 'Import cancelled.' ? null : { ok: false, error: res.error });
        return;
      }
      // Pre-fill decisions: conflicts default to 'skip', no-conflict have no entry
      const defaultDecisions = {};
      res.data.conflicts.forEach((id) => { defaultDecisions[id] = 'skip'; });
      setImportDecisions(defaultDecisions);
      setImportPreview(res.data);
      setImportStatus(null);
    } catch (e) {
      setImportStatus(null);
    }
  }

  async function handleApplyImport() {
    setImportStatus('applying');
    try {
      const res = await applyImport(importPreview.profiles, importDecisions);
      if (res.success) {
        setImportStatus({ ok: true, ...res.data });
        setImportPreview(null);
        setImportDecisions({});
        // Refresh profiles list so export picker stays in sync
        listProfiles().then((r) => {
          if (r.success) {
            setProfiles(r.data);
            setSelectedIds(r.data.map((p) => p.id));
          }
        });
      } else {
        setImportStatus({ ok: false, error: res.error });
      }
    } catch (e) {
      setImportStatus({ ok: false, error: 'An unexpected error occurred.' });
    }
  }

  function handleCancelImport() {
    setImportPreview(null);
    setImportDecisions({});
    setImportStatus(null);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const allSelected = selectedIds && profiles.length > 0 && selectedIds.length === profiles.length;
  const noneSelected = !selectedIds || selectedIds.length === 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="sgd-btn sgd-btn--secondary sgd-btn--sm" onClick={onBack}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>Settings</h2>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e2e6ea', marginBottom: 16 }}>
        {[['settings', 'Settings'], ['about', 'About']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === key ? '2px solid #910C1D' : '2px solid transparent',
              marginBottom: -2,
              padding: '6px 18px',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: activeTab === key ? 700 : 400,
              color: activeTab === key ? '#910C1D' : '#6c757d',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'about' && (
        <div>
          <div className="sgd-card">
            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 14 }}>SiteGround Deploy for Local WP</p>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6c757d' }}>Version 1.0.0</p>
          </div>

          <div className="sgd-card">
            <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Disclaimer</p>
            <p style={{ margin: 0, fontSize: 12, color: '#292929', lineHeight: 1.6 }}>
              This add-on is an independent, community-built tool and is{' '}
              <strong>not affiliated with, endorsed by, or in any way officially
              connected to SiteGround.com</strong> or its parent company. The SiteGround
              name and logo are trademarks of SiteGround Hosting Ltd. Use of those marks
              here is solely for descriptive purposes to identify the compatible hosting
              platform.
            </p>
          </div>

          <div className="sgd-card">
            <p style={{ margin: '0 0 12px', fontWeight: 600 }}>Author</p>
            <table style={{ fontSize: 12, borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                {[
                  ['Name',    'Zechariah Manning'],
                  ['Company', 'ZDM Designs'],
                  ['Website', <a href="https://zdmdesigns.com" target="_blank" rel="noreferrer" style={{ color: '#910C1D' }}>zdmdesigns.com</a>],
                  ['Source',  <a href="https://github.com/zdmanning/ZDM-Siteground-Deploy-Local-WP-Addon" target="_blank" rel="noreferrer" style={{ color: '#910C1D' }}>GitHub Repository</a>],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ color: '#6c757d', width: 80, paddingBottom: 6, verticalAlign: 'top' }}>{label}</td>
                    <td style={{ paddingBottom: 6 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sgd-alert sgd-alert--info" style={{ marginTop: 4 }}>
            This add-on is provided as-is, without warranty of any kind. Always
            back up your site before deploying.
          </div>
        </div>
      )}

      {activeTab === 'settings' && (<>

      <div className="sgd-card">
        <div className="sgd-card__title">SiteGround Deploy v1.0.0</div>
        <div className="sgd-card__meta" style={{ marginTop: 4 }}>
          Deploy Local WordPress sites to SiteGround via SSH.
        </div>
      </div>

      <div className="sgd-card">
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Default SSH port</p>
        <p style={{ margin: 0, fontSize: 12, color: '#6c757d' }}>
          SiteGround uses port <strong>18765</strong>. This is pre-filled when
          creating a new profile and does not need to be changed unless your
          hosting plan uses a different port.
        </p>
      </div>

      <div className="sgd-card">
        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>SSH key storage</p>
        <p style={{ margin: 0, fontSize: 12, color: '#6c757d' }}>
          Generated key pairs are stored in Local's data directory on this machine.
          Private keys never leave this computer.
        </p>
      </div>

      <div className="sgd-card">
        <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Danger-zone confirmation checkbox default</p>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6c757d' }}>
          Controls whether the <em>"I have read the above"</em> checkbox on full deploy
          and database deploy screens starts pre-checked or unchecked. Individual profiles
          can override this setting.
        </p>
        {settingsLoaded ? (
          <label className="sgd-checkbox-label" style={{ fontSize: 13 }}>
            <input
              type="checkbox"
              checked={confirmDefault}
              onChange={(e) => handleConfirmDefaultChange(e.target.checked)}
            />
            Pre-check the confirmation checkbox by default
          </label>
        ) : (
          <span style={{ fontSize: 12, color: '#6c757d' }}>Loading…</span>
        )}
      </div>

      {/* ── Export Profiles ─────────────────────────────────────────────────── */}
      <div className="sgd-card">
        <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Export profiles</p>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6c757d' }}>
          Exports selected profiles to a <code>.sgdexport</code> file, including their
          SSH private keys. Import this file on another machine to be instantly ready
          to deploy.
        </p>

        {/* Security warning */}
        <div className="sgd-alert sgd-alert--warning" style={{ marginBottom: 12 }}>
          ⚠️ The export file contains <strong>SSH private keys in plain text</strong>.
          Treat it like a password — store it securely and do not share it.
        </div>

        {/* Profile checklist */}
        {selectedIds === null ? (
          <span style={{ fontSize: 12, color: '#6c757d' }}>Loading profiles…</span>
        ) : profiles.length === 0 ? (
          <span style={{ fontSize: 12, color: '#6c757d' }}>No profiles to export.</span>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              <label className="sgd-checkbox-label" style={{ fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                />
                Select all ({profiles.length})
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, paddingLeft: 4 }}>
              {profiles.map((p) => (
                <label key={p.id} className="sgd-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleExportSelect(p.id)}
                  />
                  <span>{p.name}</span>
                  <span style={{ color: '#6c757d' }}>{p.sshHost}</span>
                </label>
              ))}
            </div>

            <button
              className="sgd-btn sgd-btn--primary sgd-btn--sm"
              onClick={handleExport}
              disabled={noneSelected || exportStatus === 'running'}
            >
              {exportStatus === 'running'
                ? 'Exporting…'
                : `Export Selected (${selectedIds.length})`}
            </button>
          </>
        )}

        {exportStatus && exportStatus !== 'running' && (
          <p style={{ margin: '10px 0 0', fontSize: 12, color: exportStatus.ok ? '#28a745' : '#dc3545' }}>
            {exportStatus.ok
              ? `✓ Exported ${exportStatus.count} profile${exportStatus.count !== 1 ? 's' : ''} to ${exportStatus.filePath}`
              : `Error: ${exportStatus.error}`}
          </p>
        )}
      </div>

      {/* ── Import Profiles ─────────────────────────────────────────────────── */}
      <div className="sgd-card">
        <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Import profiles</p>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6c757d' }}>
          Import a <code>.sgdexport</code> file to restore profiles and their SSH keys.
          You will be asked how to handle any conflicts with existing profiles.
        </p>

        {!importPreview && (
          <button
            className="sgd-btn sgd-btn--secondary sgd-btn--sm"
            onClick={handlePickImport}
            disabled={importStatus === 'picking' || importStatus === 'applying'}
          >
            {importStatus === 'picking' ? 'Opening…' : 'Import from file…'}
          </button>
        )}

        {/* Result message after completed import */}
        {importStatus && importStatus !== 'picking' && importStatus !== 'applying' && !importPreview && (
          <p style={{ margin: '10px 0 0', fontSize: 12, color: importStatus.ok ? '#28a745' : '#dc3545' }}>
            {importStatus.ok
              ? [
                  importStatus.imported    && `${importStatus.imported} imported`,
                  importStatus.overwritten && `${importStatus.overwritten} overwritten`,
                  importStatus.renamed     && `${importStatus.renamed} renamed`,
                  importStatus.skipped     && `${importStatus.skipped} skipped`,
                ].filter(Boolean).join(', ') + ' — done.'
              : `Error: ${importStatus.error}`}
          </p>
        )}

        {/* Conflict resolution preview */}
        {importPreview && (
          <div style={{ marginTop: 8 }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#6c757d' }}>
              {importPreview.exportedAt
                ? `File exported ${new Date(importPreview.exportedAt).toLocaleString()} — ${importPreview.profiles.length} profile${importPreview.profiles.length !== 1 ? 's' : ''} found.`
                : `${importPreview.profiles.length} profile${importPreview.profiles.length !== 1 ? 's' : ''} found.`}
            </p>

            {importPreview.profiles.length > 0 && (
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginTop: 8, marginBottom: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                    <th style={{ textAlign: 'left', padding: '4px 8px 4px 0', fontWeight: 600 }}>Profile</th>
                    <th style={{ textAlign: 'left', padding: '4px 8px 4px 0', fontWeight: 600 }}>Host</th>
                    <th style={{ textAlign: 'left', padding: '4px 0', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.profiles.map((p) => {
                    const isConflict = importPreview.conflicts.includes(p.id);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                        <td style={{ padding: '6px 8px 6px 0' }}>
                          {p.name}
                          {isConflict && (
                            <span style={{ marginLeft: 6, fontSize: 10, background: '#fff3cd', color: '#856404', padding: '1px 5px', borderRadius: 3 }}>
                              conflict
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '6px 8px 6px 0', color: '#6c757d' }}>{p.sshHost}</td>
                        <td style={{ padding: '6px 0' }}>
                          {isConflict ? (
                            <select
                              value={importDecisions[p.id] || 'skip'}
                              onChange={(e) => { const val = e.target.value; setImportDecisions((prev) => ({ ...prev, [p.id]: val })); }}
                              style={{
                                padding: '4px 8px',
                                border: '1px solid #ced4da',
                                borderRadius: 4,
                                fontSize: 12,
                                color: '#292929',
                                background: '#fff',
                                width: 'auto',
                              }}
                            >
                              <option value="skip">Skip</option>
                              <option value="overwrite">Overwrite</option>
                              <option value="rename">Import as copy</option>
                            </select>
                          ) : (
                            <span style={{ color: '#28a745' }}>Import</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="sgd-btn sgd-btn--primary sgd-btn--sm"
                onClick={handleApplyImport}
                disabled={importStatus === 'applying'}
              >
                {importStatus === 'applying' ? 'Importing…' : 'Apply Import'}
              </button>
              <button
                className="sgd-btn sgd-btn--secondary sgd-btn--sm"
                onClick={handleCancelImport}
                disabled={importStatus === 'applying'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Orphaned keys ───────────────────────────────────────────────────── */}
      <div className="sgd-card">
        <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Clear orphaned keys</p>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6c757d' }}>
          Deletes any key files on disk that no longer have a matching profile.
          Keys belonging to existing profiles are never touched.
        </p>
        <button
          className="sgd-btn sgd-btn--danger sgd-btn--sm"
          onClick={handleClearOrphanedKeys}
          disabled={keyStatus === 'running'}
        >
          {keyStatus === 'running' ? 'Clearing…' : 'Clear Orphaned Keys'}
        </button>
        {keyStatus && keyStatus !== 'running' && (
          <p style={{ margin: '8px 0 0', fontSize: 12, color: keyStatus.error ? '#dc3545' : '#28a745' }}>
            {keyStatus.error
              ? `Error: ${keyStatus.error}`
              : keyStatus.deleted === 0
                ? 'No orphaned keys found.'
                : `Cleared ${keyStatus.deleted} orphaned key${keyStatus.deleted !== 1 ? 's' : ''}.`}
          </p>
        )}
      </div>

      {/* Placeholder for future settings */}
      <div className="sgd-alert sgd-alert--info" style={{ marginTop: 16 }}>
        Additional settings (WP-CLI path, remote backup directory, etc.) will
        appear here in a future release.
      </div>
      </>)}
    </div>
  );
}
