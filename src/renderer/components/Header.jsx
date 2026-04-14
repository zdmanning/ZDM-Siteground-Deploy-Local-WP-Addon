import React from 'react';

export default function Header({ onHome, onSettings }) {
  return (
    <header className="sgd-header">
      <span className="sgd-header__title" onClick={onHome}>
        ⬡ SiteGround Deploy
      </span>
      <div className="sgd-header__actions">
        <button className="sgd-btn sgd-btn--ghost sgd-btn--sm" onClick={onSettings}>
          Settings
        </button>
      </div>
    </header>
  );
}
