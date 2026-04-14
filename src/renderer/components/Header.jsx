import React from 'react';

export default function Header({ onHome, onSettings, minimized, onToggleMinimize }) {
  return (
    <header className="sgd-header">
      <span className="sgd-header__title" onClick={onHome}>
        ⬡ SiteGround Deploy
      </span>
      <div className="sgd-header__actions">
        {!minimized && (
          <button className="sgd-btn sgd-btn--ghost sgd-btn--sm" onClick={onSettings}>
            Settings
          </button>
        )}
        <button
          className="sgd-btn sgd-btn--ghost sgd-btn--sm sgd-header__minimize"
          onClick={onToggleMinimize}
          title={minimized ? 'Expand panel' : 'Minimize panel'}
        >
          {minimized ? '▲' : '▼'}
        </button>
      </div>
    </header>
  );
}
