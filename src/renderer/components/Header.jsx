import React from 'react';

const SgLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-3 -7 64 80"
    height="18"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    aria-hidden="true"
  >
    <path d="M13.2,45.3C6.4,43.1,1.5,36.5.4,29.6-2.9,10.4,17.4-6.9,37.8,2.7,38,7,36,13.2,30.5,15,57.8,32.2,34.5,67.3,6,55.8c-5.2-2.7-2.4-7.5,3.1-4.7s14.3,2.1,19.4-.7A22.7,22.7,0,0,0,36.8,43a28.5,28.5,0,0,0,1.9-3.6c.5-1,1.8-5.2.8-5.6s-.4.2-.5.5a19.2,19.2,0,0,1-3.9,7.3,19.5,19.5,0,0,1-8.4,5.8c-4.1,1.4-8.8,1.6-15.3.2a23.1,23.1,0,0,0,1.8-2.3ZM32,4.5s.1.7.2,1.8a9.1,9.1,0,0,1-3,7.5l-1.6,1.4c7.7,4.8,11.7,15.3,7.3,22.6-6.1,9.8-18,7.6-24.5.8s-5.9-16.1-1-22.9A28,28,0,0,1,32,4.5Z" fill="#fff" fillRule="evenodd" />
    <path d="M8.8,26c1.5-14.6,18.3-17.4,24.5,2S6.5,43.7,8.8,26Zm13.7,9.6c13.3.5,6.9-13-1.8-16s-13.4,16,1.8,16Z" fill="#fff" fillRule="evenodd" />
  </svg>
);

export default function Header({ onHome, onSettings, minimized, onToggleMinimize }) {
  return (
    <header className="sgd-header">
      <span className="sgd-header__title" onClick={onHome} style={{ display: 'flex' }}>
        <SgLogo />
        SiteGround Deploy
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
