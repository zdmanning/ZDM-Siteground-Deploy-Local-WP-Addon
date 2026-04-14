/**
 * Renderer entry point.
 *
 * Local calls this function with a `context` object in the renderer process.
 * The context exposes:
 *   context.React   – React instance provided by Local
 *   context.hooks   – Local's content hook system
 *
 * The only confirmed content hook for site panel injection is 'SiteInfoOverview'.
 * Using unconfirmed hooks (e.g. SiteInfoTabs) causes a render crash because
 * Local tries to render the callback's return value as a React element — if it
 * receives a plain object instead of a valid element, React accesses element.type
 * (which is undefined) and calls undefined.toString() → TypeError.
 */

import React from 'react';
import App from './App';
import './styles/global.css';

export default function (context) {
  const { hooks } = context;

  // Inject our full panel into the site Overview area.
  // This is the only hook name confirmed by the Local add-on API docs.
  hooks.addContent('SiteInfoOverview', (site) => (
    <App key="sgd-main" site={site} />
  ));
}
