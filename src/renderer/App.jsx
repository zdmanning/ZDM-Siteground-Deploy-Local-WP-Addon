/**
 * App root component.
 *
 * Manages top-level navigation between the main screens.
 * Uses a simple string-based view state rather than react-router to avoid
 * conflicts with Local's own router.
 *
 * Views:
 *   dashboard       – landing screen, profile list overview
 *   wizard          – new profile onboarding wizard
 *   profile-detail  – view/edit a saved profile
 *   deploy          – deploy panel for a selected profile
 *   logs            – activity log for a selected profile
 *   settings        – global add-on settings
 */

import React, { useState, useCallback } from 'react';
import Dashboard from './screens/Dashboard';
import WizardContainer from './wizard/WizardContainer';
import ProfileDetail from './screens/ProfileDetail';
import DeployScreen from './screens/DeployScreen';
import ActivityLog from './screens/ActivityLog';
import Settings from './screens/Settings';
import Header from './components/Header';

export default function App({ site }) {
  // Current view name
  const [view, setView] = useState('dashboard');
  // Context passed between views (e.g. selected profile id)
  const [viewParams, setViewParams] = useState({});

  const navigate = useCallback((targetView, params = {}) => {
    setView(targetView);
    setViewParams(params);
  }, []);

  const renderView = () => {
    switch (view) {
      case 'wizard':
        return (
          <WizardContainer
            site={site}
            onComplete={(profile) => navigate('profile-detail', { profileId: profile.id })}
            onGoToDeploy={(profile) => navigate('deploy', { profileId: profile.id })}
            onCancel={() => navigate('dashboard')}
          />
        );
      case 'profile-detail':
        return (
          <ProfileDetail
            profileId={viewParams.profileId}
            onDeploy={(profileId) => navigate('deploy', { profileId })}
            onViewLogs={(profileId) => navigate('logs', { profileId })}
            onBack={() => navigate('dashboard')}
          />
        );
      case 'deploy':
        return (
          <DeployScreen
            profileId={viewParams.profileId}
            onViewLogs={(profileId) => navigate('logs', { profileId })}
            onBack={() => navigate('profile-detail', { profileId: viewParams.profileId })}
          />
        );
      case 'logs':
        return (
          <ActivityLog
            profileId={viewParams.profileId}
            onBack={() => navigate('profile-detail', { profileId: viewParams.profileId })}
          />
        );
      case 'settings':
        return <Settings onBack={() => navigate('dashboard')} />;
      case 'dashboard':
      default:
        return (
          <Dashboard
            site={site}
            onNewProfile={() => navigate('wizard')}
            onSelectProfile={(profileId) => navigate('profile-detail', { profileId })}
            onSettings={() => navigate('settings')}
          />
        );
    }
  };

  return (
    <div className="sgd-app">
      <Header
        currentView={view}
        onHome={() => navigate('dashboard')}
        onSettings={() => navigate('settings')}
      />
      <main className="sgd-main">{renderView()}</main>
    </div>
  );
}
