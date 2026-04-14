/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/renderer/App.jsx"
/*!******************************!*\
  !*** ./src/renderer/App.jsx ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ App)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _screens_Dashboard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./screens/Dashboard */ "./src/renderer/screens/Dashboard.jsx");
/* harmony import */ var _wizard_WizardContainer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./wizard/WizardContainer */ "./src/renderer/wizard/WizardContainer.jsx");
/* harmony import */ var _screens_ProfileDetail__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./screens/ProfileDetail */ "./src/renderer/screens/ProfileDetail.jsx");
/* harmony import */ var _screens_DeployScreen__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./screens/DeployScreen */ "./src/renderer/screens/DeployScreen.jsx");
/* harmony import */ var _screens_ActivityLog__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./screens/ActivityLog */ "./src/renderer/screens/ActivityLog.jsx");
/* harmony import */ var _screens_Settings__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./screens/Settings */ "./src/renderer/screens/Settings.jsx");
/* harmony import */ var _components_Header__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/Header */ "./src/renderer/components/Header.jsx");
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









function App({
  site
}) {
  // Current view name
  const [view, setView] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('dashboard');
  // Context passed between views (e.g. selected profile id)
  const [viewParams, setViewParams] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});
  const navigate = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((targetView, params = {}) => {
    setView(targetView);
    setViewParams(params);
  }, []);
  const renderView = () => {
    switch (view) {
      case 'wizard':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_wizard_WizardContainer__WEBPACK_IMPORTED_MODULE_2__["default"], {
          site: site,
          onComplete: profile => navigate('profile-detail', {
            profileId: profile.id
          }),
          onGoToDeploy: profile => navigate('deploy', {
            profileId: profile.id
          }),
          onCancel: () => navigate('dashboard')
        });
      case 'profile-detail':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_screens_ProfileDetail__WEBPACK_IMPORTED_MODULE_3__["default"], {
          profileId: viewParams.profileId,
          onDeploy: profileId => navigate('deploy', {
            profileId
          }),
          onViewLogs: profileId => navigate('logs', {
            profileId
          }),
          onBack: () => navigate('dashboard')
        });
      case 'deploy':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_screens_DeployScreen__WEBPACK_IMPORTED_MODULE_4__["default"], {
          profileId: viewParams.profileId,
          onViewLogs: profileId => navigate('logs', {
            profileId
          }),
          onBack: () => navigate('profile-detail', {
            profileId: viewParams.profileId
          })
        });
      case 'logs':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_screens_ActivityLog__WEBPACK_IMPORTED_MODULE_5__["default"], {
          profileId: viewParams.profileId,
          onBack: () => navigate('profile-detail', {
            profileId: viewParams.profileId
          })
        });
      case 'settings':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_screens_Settings__WEBPACK_IMPORTED_MODULE_6__["default"], {
          onBack: () => navigate('dashboard')
        });
      case 'dashboard':
      default:
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_screens_Dashboard__WEBPACK_IMPORTED_MODULE_1__["default"], {
          site: site,
          onNewProfile: () => navigate('wizard'),
          onSelectProfile: profileId => navigate('profile-detail', {
            profileId
          }),
          onSettings: () => navigate('settings')
        });
    }
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-app"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_Header__WEBPACK_IMPORTED_MODULE_7__["default"], {
    currentView: view,
    onHome: () => navigate('dashboard'),
    onSettings: () => navigate('settings')
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("main", {
    className: "sgd-main"
  }, renderView()));
}

/***/ },

/***/ "./src/renderer/components/CopyableCode.jsx"
/*!**************************************************!*\
  !*** ./src/renderer/components/CopyableCode.jsx ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CopyableCode)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


/**
 * CopyableCode
 * Displays a block of text (e.g. an SSH public key) with a copy button.
 */
function CopyableCode({
  value,
  label
}) {
  const [copied, setCopied] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  function handleCopy() {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-copyable"
  }, label && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-copyable__label"
  }, label), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-copyable__block"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", {
    className: "sgd-copyable__code"
  }, value || '—'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm sgd-copyable__btn",
    onClick: handleCopy,
    disabled: !value
  }, copied ? 'Copied!' : 'Copy')));
}

/***/ },

/***/ "./src/renderer/components/FormField.jsx"
/*!***********************************************!*\
  !*** ./src/renderer/components/FormField.jsx ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ FormField)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


/**
 * FormField
 *
 * Wraps a label, an input/select/textarea child, an optional hint, and
 * an optional inline validation error. Highlights the border red on error.
 *
 * Usage:
 *   <FormField id="sgd-name" label="Profile name" error={errors.name}>
 *     <input id="sgd-name" ... />
 *   </FormField>
 */
function FormField({
  id,
  label,
  hint,
  error,
  required,
  children
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: `sgd-field${error ? ' sgd-field--error' : ''}`
  }, label && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    htmlFor: id
  }, label, required && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-field__required"
  }, " *")), children, hint && !error && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-field__hint"
  }, hint), error && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-field__error",
    role: "alert"
  }, error));
}

/***/ },

/***/ "./src/renderer/components/Header.jsx"
/*!********************************************!*\
  !*** ./src/renderer/components/Header.jsx ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Header)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

function Header({
  onHome,
  onSettings
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("header", {
    className: "sgd-header"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-header__title",
    onClick: onHome
  }, "\u2B21 SiteGround Deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-header__actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: onSettings
  }, "Settings")));
}

/***/ },

/***/ "./src/renderer/components/StatusBadge.jsx"
/*!*************************************************!*\
  !*** ./src/renderer/components/StatusBadge.jsx ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ StatusBadge)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


/**
 * StatusBadge
 * @param {'success'|'error'|'warning'|'pending'} status
 * @param {string} [label] - override the default label
 */
function StatusBadge({
  status,
  label
}) {
  const labels = {
    success: 'Connected',
    error: 'Failed',
    warning: 'Warning',
    pending: 'Pending'
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: `sgd-badge sgd-badge--${status}`
  }, label || labels[status] || status);
}

/***/ },

/***/ "./src/renderer/components/StepIndicator.jsx"
/*!***************************************************!*\
  !*** ./src/renderer/components/StepIndicator.jsx ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ StepIndicator)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


/**
 * StepIndicator
 * Shows which wizard step is current using dot indicators.
 *
 * @param {number} total    - total number of steps
 * @param {number} current  - 0-based current step index
 */
function StepIndicator({
  total,
  current
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step-indicator",
    "aria-label": `Step ${current + 1} of ${total}`
  }, Array.from({
    length: total
  }, (_, i) => {
    const cls = i < current ? 'sgd-wizard__dot sgd-wizard__dot--complete' : i === current ? 'sgd-wizard__dot sgd-wizard__dot--active' : 'sgd-wizard__dot';
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      key: i,
      className: cls
    });
  }));
}

/***/ },

/***/ "./src/renderer/ipc.js"
/*!*****************************!*\
  !*** ./src/renderer/ipc.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearLogs: () => (/* binding */ clearLogs),
/* harmony export */   deleteKey: () => (/* binding */ deleteKey),
/* harmony export */   deleteProfile: () => (/* binding */ deleteProfile),
/* harmony export */   generateKey: () => (/* binding */ generateKey),
/* harmony export */   getAllLocalSites: () => (/* binding */ getAllLocalSites),
/* harmony export */   getLocalSite: () => (/* binding */ getLocalSite),
/* harmony export */   getLogs: () => (/* binding */ getLogs),
/* harmony export */   getProfile: () => (/* binding */ getProfile),
/* harmony export */   getPublicKey: () => (/* binding */ getPublicKey),
/* harmony export */   listProfiles: () => (/* binding */ listProfiles),
/* harmony export */   onLogEntry: () => (/* binding */ onLogEntry),
/* harmony export */   runCodeDeploy: () => (/* binding */ runCodeDeploy),
/* harmony export */   runFullDeploy: () => (/* binding */ runFullDeploy),
/* harmony export */   saveProfile: () => (/* binding */ saveProfile),
/* harmony export */   testSSHConnection: () => (/* binding */ testSSHConnection),
/* harmony export */   testSSHConnectionDirect: () => (/* binding */ testSSHConnectionDirect)
/* harmony export */ });
/**
 * IPC Bridge
 *
 * Thin wrapper around Electron's ipcRenderer.invoke / ipcRenderer.on.
 * All renderer-to-main communication goes through this module.
 * Never call ipcRenderer directly outside of this file.
 */

// Use require() — not window.require() — so webpack's external config resolves
// this to Electron's real ipcRenderer (same as the reference add-on pattern).
// eslint-disable-next-line import/no-commonjs
const {
  ipcRenderer
} = __webpack_require__(/*! electron */ "electron");

// ─── Profiles ─────────────────────────────────────────────────────────────────

const listProfiles = () => ipcRenderer.invoke('sgd:profiles:list');
const getProfile = id => ipcRenderer.invoke('sgd:profiles:get', id);
const saveProfile = profile => ipcRenderer.invoke('sgd:profiles:save', profile);
const deleteProfile = id => ipcRenderer.invoke('sgd:profiles:delete', id);

// ─── Keys ─────────────────────────────────────────────────────────────────────

const generateKey = keyId => ipcRenderer.invoke('sgd:keys:generate', keyId);
const getPublicKey = keyId => ipcRenderer.invoke('sgd:keys:getPublic', keyId);
const deleteKey = keyId => ipcRenderer.invoke('sgd:keys:delete', keyId);

// ─── SSH ──────────────────────────────────────────────────────────────────────

/**
 * Test SSH using a saved profile ID (used from profile detail view).
 */
const testSSHConnection = profileId => ipcRenderer.invoke('sgd:ssh:test', profileId);

/**
 * Test SSH using raw profile data — no save required.
 * Used during the wizard so we can test before committing to storage.
 * @param {object} profileData  wizard data object with sshHost, sshPort, etc.
 */
const testSSHConnectionDirect = profileData => ipcRenderer.invoke('sgd:ssh:test:direct', profileData);

// ─── Deploy ───────────────────────────────────────────────────────────────────

const runCodeDeploy = (profileId, options) => ipcRenderer.invoke('sgd:deploy:code', profileId, options);
const runFullDeploy = (profileId, options) => ipcRenderer.invoke('sgd:deploy:full', profileId, options);

// ─── Logs ─────────────────────────────────────────────────────────────────────

const getLogs = profileId => ipcRenderer.invoke('sgd:logs:list', profileId);
const clearLogs = profileId => ipcRenderer.invoke('sgd:logs:clear', profileId);

/**
 * Subscribe to real-time log entries streamed during a deploy.
 * Returns an unsubscribe function.
 *
 * @param {function} callback - called with each log entry
 * @returns {function} unsubscribe
 */
function onLogEntry(callback) {
  const handler = (_event, entry) => callback(entry);
  ipcRenderer.on('sgd:log:entry', handler);
  return () => ipcRenderer.removeListener('sgd:log:entry', handler);
}

// ─── Local sites ──────────────────────────────────────────────────────────────

const getAllLocalSites = () => ipcRenderer.invoke('sgd:local:sites');
const getLocalSite = siteId => ipcRenderer.invoke('sgd:local:site', siteId);

/***/ },

/***/ "./src/renderer/screens/ActivityLog.jsx"
/*!**********************************************!*\
  !*** ./src/renderer/screens/ActivityLog.jsx ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ActivityLog)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ipc */ "./src/renderer/ipc.js");


const LEVEL_COLORS = {
  info: '#adb5bd',
  success: '#6edd8e',
  warning: '#ffc107',
  error: '#ff6b6b'
};
function ActivityLog({
  profileId,
  onBack
}) {
  const [entries, setEntries] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const logRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.getLogs)(profileId).then(list => {
      setEntries(list);
      setLoading(false);
    });
  }, [profileId]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries]);
  async function handleClear() {
    if (!window.confirm('Clear all log entries for this profile?')) return;
    await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.clearLogs)(profileId);
    setEntries([]);
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    style: {
      margin: 0
    }
  }, "Activity log"), entries.length > 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    style: {
      marginLeft: 'auto'
    },
    onClick: handleClear
  }, "Clear log")), loading && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Loading\u2026"), !loading && entries.length === 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-empty"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "No log entries yet."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Deploy activity will appear here.")), entries.length > 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-log",
    ref: logRef,
    style: {
      maxHeight: '480px'
    }
  }, entries.map((entry, i) => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    key: i,
    style: {
      color: LEVEL_COLORS[entry.level] || LEVEL_COLORS.info,
      marginBottom: 1
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    style: {
      color: '#555',
      marginRight: 10,
      fontSize: '10px'
    }
  }, new Date(entry.timestamp).toLocaleString()), entry.message))));
}

/***/ },

/***/ "./src/renderer/screens/Dashboard.jsx"
/*!********************************************!*\
  !*** ./src/renderer/screens/Dashboard.jsx ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Dashboard)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ipc */ "./src/renderer/ipc.js");


function Dashboard({
  site,
  onNewProfile,
  onSelectProfile,
  onSettings
}) {
  const [profiles, setProfiles] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.listProfiles)().then(list => {
      setProfiles(list);
      setLoading(false);
    });
  }, []);
  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm('Delete this profile? This cannot be undone.')) return;
    await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.deleteProfile)(id);
    setProfiles(prev => prev.filter(p => p.id !== id));
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    style: {
      margin: 0
    }
  }, "Deployment profiles"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: onNewProfile
  }, "+ New profile")), loading && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Loading profiles\u2026"), !loading && profiles.length === 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-empty"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "No profiles yet."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Create a profile to start deploying this site to SiteGround."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: onNewProfile,
    style: {
      marginTop: 12
    }
  }, "Create first profile")), profiles.map(profile => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    key: profile.id,
    className: "sgd-card",
    style: {
      cursor: 'pointer'
    },
    onClick: () => onSelectProfile(profile.id)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card__title"
  }, profile.name), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card__meta"
  }, profile.sshUser, "@", profile.sshHost, " \xA0\xB7\xA0 ", profile.productionDomain), profile.lastDeployedAt && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card__meta",
    style: {
      marginTop: 2
    }
  }, "Last deployed: ", new Date(profile.lastDeployedAt).toLocaleString())), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: e => handleDelete(e, profile.id)
  }, "Delete")))));
}

/***/ },

/***/ "./src/renderer/screens/DeployScreen.jsx"
/*!***********************************************!*\
  !*** ./src/renderer/screens/DeployScreen.jsx ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DeployScreen)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ipc */ "./src/renderer/ipc.js");


const CONFIRM_PHRASE = 'deploy to production';
function DeployScreen({
  profileId,
  onViewLogs,
  onBack
}) {
  const [profile, setProfile] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [mode, setMode] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('code'); // 'code' | 'full'
  const [running, setRunning] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [result, setResult] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // { success, error?, backupPath? }
  const [logEntries, setLogEntries] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);

  // Full-deploy confirmation state
  const [confirmPhrase, setConfirmPhrase] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [confirmed, setConfirmed] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const confirmed_computed = confirmPhrase.trim().toLowerCase() === CONFIRM_PHRASE;
  const logRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.getProfile)(profileId).then(setProfile);
  }, [profileId]);

  // Subscribe to real-time log streaming
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const unsub = (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.onLogEntry)(entry => {
      setLogEntries(prev => [...prev, entry]);
    });
    return unsub;
  }, []);

  // Auto-scroll log
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logEntries]);
  async function handleDeploy() {
    setRunning(true);
    setResult(null);
    setLogEntries([]);
    const options = mode === 'full' ? {
      confirmed: confirmed_computed
    } : {};
    const fn = mode === 'full' ? _ipc__WEBPACK_IMPORTED_MODULE_1__.runFullDeploy : _ipc__WEBPACK_IMPORTED_MODULE_1__.runCodeDeploy;
    const res = await fn(profileId, options);
    setResult(res);
    setRunning(false);
  }
  const canDeploy = mode === 'code' || mode === 'full' && confirmed_computed && confirmed;
  if (!profile) return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Loading\u2026");
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    style: {
      margin: 0
    }
  }, "Deploy \u2014 ", profile.name)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 10px',
      fontWeight: 600
    }
  }, "Deploy mode"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, ['code', 'full'].map(m => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    key: m,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "radio",
    name: "deploy-mode",
    value: m,
    checked: mode === m,
    onChange: () => {
      setMode(m);
      setConfirmPhrase('');
      setConfirmed(false);
    }
  }), m === 'code' ? 'Code only (themes + plugins)' : 'Full deploy (code + database)')))), mode === 'full' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "\u26A0 Danger \u2014 database will be overwritten."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '8px 0'
    }
  }, "This will replace the database at ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, profile.productionDomain), " with your local database. A remote backup will be created first, but this action cannot be reversed automatically."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-field",
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", null, "Type ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("em", null, CONFIRM_PHRASE), " to confirm:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "text",
    value: confirmPhrase,
    onChange: e => setConfirmPhrase(e.target.value),
    placeholder: CONFIRM_PHRASE,
    autoComplete: "off"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: confirmed,
    onChange: e => setConfirmed(e.target.checked)
  }), "I have verified the correct profile is selected and I understand this will overwrite production data.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      margin: '16px 0'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: `sgd-btn ${mode === 'full' ? 'sgd-btn--danger' : 'sgd-btn--primary'}`,
    onClick: handleDeploy,
    disabled: running || !canDeploy
  }, running ? 'Deploying…' : mode === 'full' ? 'Deploy (code + database)' : 'Deploy code')), result && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: `sgd-alert ${result.success ? '' : 'sgd-alert--danger'}`,
    style: result.success ? {
      background: '#d4edda',
      border: '1px solid #c3e6cb',
      color: '#155724'
    } : {}
  }, result.success ? `Deploy complete.${result.backupPath ? ` Remote backup: ${result.backupPath}` : ''}` : `Deploy failed: ${result.error}`), logEntries.length > 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-log",
    ref: logRef
  }, logEntries.map((e, i) => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    key: i,
    className: `sgd-log__entry--${e.level}`
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    style: {
      color: '#555',
      marginRight: 8
    }
  }, new Date(e.timestamp).toLocaleTimeString()), e.message))), result && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: () => onViewLogs(profileId)
  }, "View full log history")));
}

/***/ },

/***/ "./src/renderer/screens/ProfileDetail.jsx"
/*!************************************************!*\
  !*** ./src/renderer/screens/ProfileDetail.jsx ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ProfileDetail)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ipc */ "./src/renderer/ipc.js");
/* harmony import */ var _components_StatusBadge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/StatusBadge */ "./src/renderer/components/StatusBadge.jsx");



function ProfileDetail({
  profileId,
  onDeploy,
  onViewLogs,
  onBack
}) {
  const [profile, setProfile] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [testStatus, setTestStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('idle'); // idle | testing | success | error
  const [testError, setTestError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.getProfile)(profileId).then(setProfile);
  }, [profileId]);
  async function handleTest() {
    setTestStatus('testing');
    setTestError(null);
    const result = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.testSSHConnection)(profileId);
    if (result.success) {
      setTestStatus('success');
    } else {
      setTestStatus('error');
      setTestError(result.error || 'Connection failed.');
    }
  }
  if (!profile) return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Loading\u2026");
  const rows = [['SSH host', `${profile.sshHost}:${profile.sshPort}`], ['Username', profile.sshUser], ['Remote web root', profile.remoteWebRoot], ['Production domain', profile.productionDomain], ['Created', new Date(profile.createdAt).toLocaleString()], ['Last deployed', profile.lastDeployedAt ? new Date(profile.lastDeployedAt).toLocaleString() : 'Never']];
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    style: {
      margin: 0
    }
  }, profile.name)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '12px'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tbody", null, rows.map(([label, value]) => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", {
    key: label,
    style: {
      borderBottom: '1px solid #e2e6ea'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
    style: {
      padding: '7px 8px 7px 0',
      color: '#6c757d',
      width: '38%'
    }
  }, label), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
    style: {
      padding: '7px 0',
      fontFamily: 'monospace',
      wordBreak: 'break-all'
    }
  }, value)))))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: handleTest,
    disabled: testStatus === 'testing'
  }, testStatus === 'testing' ? 'Testing…' : 'Test SSH connection'), testStatus === 'success' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_StatusBadge__WEBPACK_IMPORTED_MODULE_2__["default"], {
    status: "success"
  }), testStatus === 'error' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_StatusBadge__WEBPACK_IMPORTED_MODULE_2__["default"], {
    status: "error",
    label: testError
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: () => onDeploy(profileId)
  }, "Deploy \u2192"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: () => onViewLogs(profileId)
  }, "View logs")));
}

/***/ },

/***/ "./src/renderer/screens/Settings.jsx"
/*!*******************************************!*\
  !*** ./src/renderer/screens/Settings.jsx ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Settings)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

function Settings({
  onBack
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    style: {
      margin: 0
    }
  }, "Settings")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card__title"
  }, "SiteGround Deploy v0.1.0"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card__meta",
    style: {
      marginTop: 4
    }
  }, "Deploy Local WordPress sites to SiteGround via SSH.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 8px',
      fontWeight: 600
    }
  }, "Default SSH port"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      color: '#6c757d'
    }
  }, "SiteGround uses port ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "18765"), ". This is pre-filled when creating a new profile and does not need to be changed unless your hosting plan uses a different port.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 8px',
      fontWeight: 600
    }
  }, "SSH key storage"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      color: '#6c757d'
    }
  }, "Generated key pairs are stored in Local's data directory on this machine. Private keys never leave this computer.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--info",
    style: {
      marginTop: 16
    }
  }, "Additional settings (WP-CLI path, remote backup directory, etc.) will appear here in a future release."));
}

/***/ },

/***/ "./src/renderer/utils/validate.js"
/*!****************************************!*\
  !*** ./src/renderer/utils/validate.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isFormValid: () => (/* binding */ isFormValid),
/* harmony export */   validateConnectionForm: () => (/* binding */ validateConnectionForm)
/* harmony export */ });
/**
 * Validation utilities for the wizard connection form.
 * Returns a plain errors object: { fieldName: 'error message' }
 * An empty object means valid.
 */

/**
 * Validate the connection details collected in Step 3.
 * @param {object} data  wizard data object
 * @returns {object}     { fieldName: errorString } — empty if valid
 */
function validateConnectionForm(data) {
  const errors = {};

  // Profile name
  if (!data.name?.trim()) {
    errors.name = 'Required.';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Must be at least 2 characters.';
  }

  // SSH host — basic hostname pattern, no protocol prefix
  if (!data.sshHost?.trim()) {
    errors.sshHost = 'Required.';
  } else if (/^https?:\/\//i.test(data.sshHost.trim())) {
    errors.sshHost = 'Enter the hostname only — no http:// prefix (e.g. sg-server-123.siteground.com).';
  } else if (!/^[a-zA-Z0-9]([a-zA-Z0-9\-\.]*[a-zA-Z0-9])?$/.test(data.sshHost.trim())) {
    errors.sshHost = 'Enter a valid hostname (e.g. sg-server-123.siteground.com).';
  }

  // SSH port
  const port = Number(data.sshPort);
  if (!data.sshPort && data.sshPort !== 0) {
    errors.sshPort = 'Required. SiteGround uses port 18765.';
  } else if (isNaN(port) || port < 1 || port > 65535) {
    errors.sshPort = 'Must be a number between 1–65535. SiteGround default is 18765.';
  }

  // SSH username
  if (!data.sshUser?.trim()) {
    errors.sshUser = 'Required.';
  }

  // Remote web root — must be an absolute path
  if (!data.remoteWebRoot?.trim()) {
    errors.remoteWebRoot = 'Required.';
  } else if (!data.remoteWebRoot.trim().startsWith('/')) {
    errors.remoteWebRoot = 'Must be an absolute Unix path starting with / ' + '(e.g. /home/customer/www/example.com/public_html).';
  }

  // Production domain — must be a valid http/https URL
  if (!data.productionDomain?.trim()) {
    errors.productionDomain = 'Required.';
  } else {
    try {
      const url = new URL(data.productionDomain.trim());
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.productionDomain = 'Must start with https:// (e.g. https://example.com).';
      }
    } catch {
      errors.productionDomain = 'Enter a valid URL including the protocol (e.g. https://example.com).';
    }
  }
  return errors;
}

/**
 * Returns true if the errors object has no entries.
 * @param {object} errors
 * @returns {boolean}
 */
function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}

/***/ },

/***/ "./src/renderer/wizard/WizardContainer.jsx"
/*!*************************************************!*\
  !*** ./src/renderer/wizard/WizardContainer.jsx ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WizardContainer)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");
/* harmony import */ var _components_StepIndicator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/StepIndicator */ "./src/renderer/components/StepIndicator.jsx");
/* harmony import */ var _steps_Step1_Intro__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./steps/Step1_Intro */ "./src/renderer/wizard/steps/Step1_Intro.jsx");
/* harmony import */ var _steps_Step2_SGPrep__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./steps/Step2_SGPrep */ "./src/renderer/wizard/steps/Step2_SGPrep.jsx");
/* harmony import */ var _steps_Step3_ConnectionInfo__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./steps/Step3_ConnectionInfo */ "./src/renderer/wizard/steps/Step3_ConnectionInfo.jsx");
/* harmony import */ var _steps_Step4_KeyGen__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./steps/Step4_KeyGen */ "./src/renderer/wizard/steps/Step4_KeyGen.jsx");
/* harmony import */ var _steps_Step5_PublicKey__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./steps/Step5_PublicKey */ "./src/renderer/wizard/steps/Step5_PublicKey.jsx");
/* harmony import */ var _steps_Step6_TestConnection__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./steps/Step6_TestConnection */ "./src/renderer/wizard/steps/Step6_TestConnection.jsx");
/* harmony import */ var _steps_Step7_SaveProfile__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./steps/Step7_SaveProfile */ "./src/renderer/wizard/steps/Step7_SaveProfile.jsx");
/* harmony import */ var _steps_Step8_Complete__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./steps/Step8_Complete */ "./src/renderer/wizard/steps/Step8_Complete.jsx");
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * WizardContainer
 *
 * State machine for the 8-step profile creation wizard.
 * All wizard state lives here. Each step receives:
 *   { data, onChange, onNext, onBack, onCancel }
 *
 * Step map (0-indexed internally, shown as 1-8 in the UI):
 *   0  Step1_Intro            – What this add-on does
 *   1  Step2_SGPrep           – Go to SiteGround first
 *   2  Step3_ConnectionInfo   – Collect SSH credentials (validated form)
 *   3  Step4_KeyGen           – Generate Ed25519 key pair locally
 *   4  Step5_PublicKey        – Display + copy public key, paste into SiteGround
 *   5  Step6_TestConnection   – Verify SSH connection works
 *   6  Step7_SaveProfile      – Review summary and save
 *   7  Step8_Complete         – Done — offer to go to deploy or profile view
 */












const TOTAL_STEPS = 8;
function makeInitialData(site) {
  return {
    // Profile identity — assigned on save
    id: null,
    // Key identity — pre-assigned so keygen can reference it before save
    keyId: (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])(),
    // Form fields
    name: '',
    sshHost: '',
    sshPort: 18765,
    sshUser: '',
    remoteWebRoot: '',
    productionDomain: '',
    // Runtime state set during the wizard — never entered by the user
    localSiteId: site ? site.id : null,
    publicKey: null,
    // set by Step4 after generation
    connectionTestPassed: false // set by Step6
  };
}
function WizardContainer({
  site,
  onComplete,
  onGoToDeploy,
  onCancel
}) {
  const [step, setStep] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
  const [data, setData] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(() => makeInitialData(site));
  function onChange(partial) {
    setData(prev => ({
      ...prev,
      ...partial
    }));
  }
  function onNext() {
    setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  }
  function onBack() {
    if (step === 0) {
      onCancel();
    } else {
      setStep(s => s - 1);
    }
  }
  const stepProps = {
    data,
    onChange,
    onNext,
    onBack,
    onCancel
  };
  const steps = [/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_steps_Step1_Intro__WEBPACK_IMPORTED_MODULE_3__["default"], _extends({
    key: 0
  }, stepProps)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_steps_Step2_SGPrep__WEBPACK_IMPORTED_MODULE_4__["default"], _extends({
    key: 1
  }, stepProps)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_steps_Step3_ConnectionInfo__WEBPACK_IMPORTED_MODULE_5__["default"], _extends({
    key: 2
  }, stepProps)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_steps_Step4_KeyGen__WEBPACK_IMPORTED_MODULE_6__["default"], _extends({
    key: 3
  }, stepProps)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_steps_Step5_PublicKey__WEBPACK_IMPORTED_MODULE_7__["default"], _extends({
    key: 4
  }, stepProps)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_steps_Step6_TestConnection__WEBPACK_IMPORTED_MODULE_8__["default"], _extends({
    key: 5
  }, stepProps)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_steps_Step7_SaveProfile__WEBPACK_IMPORTED_MODULE_9__["default"], _extends({
    key: 6
  }, stepProps)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_steps_Step8_Complete__WEBPACK_IMPORTED_MODULE_10__["default"], _extends({
    key: 7
  }, stepProps, {
    onComplete: onComplete,
    onGoToDeploy: onGoToDeploy
  }))];
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__header"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_StepIndicator__WEBPACK_IMPORTED_MODULE_2__["default"], {
    total: TOTAL_STEPS,
    current: step
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-wizard__step-label"
  }, "Step ", step + 1, " of ", TOTAL_STEPS)), steps[step]);
}

/***/ },

/***/ "./src/renderer/wizard/steps/Step1_Intro.jsx"
/*!***************************************************!*\
  !*** ./src/renderer/wizard/steps/Step1_Intro.jsx ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Step1_Intro)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Step 1 — Introduction
 * Explains what the add-on does, what SSH is at a high level,
 * and that setup is mostly one-time.
 */

function Step1_Intro({
  onNext,
  onCancel
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step-icon"
  }, "\uD83D\uDE80"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "sgd-wizard__heading"
  }, "SiteGround Deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-wizard__subheading"
  }, "Deploy your Local WordPress site to SiteGround \u2014 directly from this panel."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__body"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "This add-on connects your ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Local site"), " to a", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "SiteGround-hosted WordPress site"), " using SSH \u2014 a secure, encrypted tunnel for transferring files and running remote commands."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-info-list__icon"
  }, "\uD83D\uDCC1"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Code deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Push your themes and plugins to production in seconds."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-info-list__icon"
  }, "\uD83D\uDDC4\uFE0F"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Full deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Optionally push your local database too \u2014 with automatic remote backup and URL search-replace built in."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-info-list__icon"
  }, "\uD83D\uDD11"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "SSH key authentication"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Your SSH key pair is generated locally and stored on this machine. No passwords involved."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-info-list__icon"
  }, "\u267B\uFE0F"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Saved profiles"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Set up once, deploy many times. Your connection settings are stored so you never re-enter them.")))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--info",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "This setup takes about 5 minutes"), " and is a one-time process per deployment target. You'll need access to your SiteGround User Area.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: onCancel
  }, "Cancel"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: onNext
  }, "Get started \u2192")));
}

/***/ },

/***/ "./src/renderer/wizard/steps/Step2_SGPrep.jsx"
/*!****************************************************!*\
  !*** ./src/renderer/wizard/steps/Step2_SGPrep.jsx ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Step2_SGPrep)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Step 2 — SiteGround Preparation
 * Instructs the user to locate or create an SSH user in SiteGround
 * before proceeding. The add-on will generate the actual key in a later step.
 */

function Step2_SGPrep({
  onNext,
  onBack
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step-icon"
  }, "\uD83C\uDF10"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "sgd-wizard__heading"
  }, "Prepare SiteGround first"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-wizard__subheading"
  }, "Before we generate your SSH key, you need to locate your SSH credentials in the SiteGround User Area."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__body"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--warning"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Do this now before clicking Next."), " You will need the SSH host and username from SiteGround to fill in the next screen."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "1"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Log in to the SiteGround User Area"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Go to", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-code-inline"
  }, "my.siteground.com"), " and sign in to your account."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "2"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Open the SSH Manager for your site"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Navigate to ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Websites \u2192 Manage"), " for your target site, then go to", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Security \u2192 SSH Keys Manager"), "."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "3"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Note your SSH host and username"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Your SSH host is shown on the SSH Keys Manager page \u2014 it looks like", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-code-inline"
  }, "sg-server-123.siteground.com"), ". Your username typically starts with ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-code-inline"
  }, "u"), ' ', "followed by numbers (e.g.", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-code-inline"
  }, "u12345678"), ")."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "4"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Do not create an SSH key there yet"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "This wizard will generate a new SSH key pair for you locally. You'll paste the public key into SiteGround in a later step \u2014 not now.")))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--info",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "SiteGround uses port 18765"), " for SSH, not the standard port 22. This will be pre-filled for you on the next screen.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: onNext
  }, "I have my SSH details \u2192 Next")));
}

/***/ },

/***/ "./src/renderer/wizard/steps/Step3_ConnectionInfo.jsx"
/*!************************************************************!*\
  !*** ./src/renderer/wizard/steps/Step3_ConnectionInfo.jsx ***!
  \************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Step3_ConnectionInfo)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_FormField__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../components/FormField */ "./src/renderer/components/FormField.jsx");
/* harmony import */ var _utils_validate__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/validate */ "./src/renderer/utils/validate.js");
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Step 3 — Connection Details Form
 * Collects all SSH credentials and profile metadata.
 * Validates on submit — all fields must pass before proceeding.
 */



function Step3_ConnectionInfo({
  data,
  onChange,
  onNext,
  onBack
}) {
  // Only show errors after the first submit attempt
  const [submitted, setSubmitted] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const errors = submitted ? (0,_utils_validate__WEBPACK_IMPORTED_MODULE_2__.validateConnectionForm)(data) : {};
  const valid = (0,_utils_validate__WEBPACK_IMPORTED_MODULE_2__.isFormValid)((0,_utils_validate__WEBPACK_IMPORTED_MODULE_2__.validateConnectionForm)(data));
  function handleNext(e) {
    e.preventDefault();
    setSubmitted(true);
    if ((0,_utils_validate__WEBPACK_IMPORTED_MODULE_2__.isFormValid)((0,_utils_validate__WEBPACK_IMPORTED_MODULE_2__.validateConnectionForm)(data))) {
      onNext();
    }
  }
  function field(name) {
    return {
      value: data[name] ?? '',
      onChange: e => onChange({
        [name]: e.target.value
      })
    };
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step-icon"
  }, "\uD83D\uDD0C"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "sgd-wizard__heading"
  }, "Connection details"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-wizard__subheading"
  }, "Enter the SSH credentials for your SiteGround site. You noted these in the previous step."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("form", {
    className: "sgd-wizard__body",
    onSubmit: handleNext,
    noValidate: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_1__["default"], {
    id: "sgd-name",
    label: "Profile name",
    hint: "A friendly label for this deployment target.",
    error: errors.name,
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", _extends({
    id: "sgd-name",
    type: "text",
    placeholder: "e.g. BIOHM Production",
    autoComplete: "off"
  }, field('name')))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-form-row"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_1__["default"], {
    id: "sgd-host",
    label: "SSH host",
    hint: "The hostname from SiteGround's SSH Manager page.",
    error: errors.sshHost,
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", _extends({
    id: "sgd-host",
    type: "text",
    placeholder: "e.g. sg-server-123.siteground.com",
    autoComplete: "off",
    spellCheck: false
  }, field('sshHost')))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_1__["default"], {
    id: "sgd-port",
    label: "SSH port",
    hint: "SiteGround default.",
    error: errors.sshPort,
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    id: "sgd-port",
    type: "number",
    min: 1,
    max: 65535,
    value: data.sshPort ?? 18765,
    onChange: e => onChange({
      sshPort: Number(e.target.value)
    }),
    style: {
      width: '90px'
    }
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_1__["default"], {
    id: "sgd-user",
    label: "SSH username",
    hint: "Your SiteGround SSH username \u2014 usually starts with \"u\" (e.g. u12345678).",
    error: errors.sshUser,
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", _extends({
    id: "sgd-user",
    type: "text",
    placeholder: "e.g. u12345678",
    autoComplete: "off",
    spellCheck: false
  }, field('sshUser')))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_1__["default"], {
    id: "sgd-webroot",
    label: "Remote web root path",
    hint: "The absolute path to your site's public_html folder on the server.",
    error: errors.remoteWebRoot,
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", _extends({
    id: "sgd-webroot",
    type: "text",
    placeholder: "/home/customer/www/example.com/public_html",
    autoComplete: "off",
    spellCheck: false
  }, field('remoteWebRoot')))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_1__["default"], {
    id: "sgd-domain",
    label: "Production domain",
    hint: "The live site URL \u2014 used for database search-replace during full deploys.",
    error: errors.productionDomain,
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", _extends({
    id: "sgd-domain",
    type: "text",
    placeholder: "https://example.com",
    autoComplete: "off",
    spellCheck: false
  }, field('productionDomain')))), submitted && !valid && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger",
    style: {
      marginTop: 8
    }
  }, "Please fix the errors above before continuing."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    type: "button",
    className: "sgd-btn sgd-btn--secondary",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    type: "submit",
    className: "sgd-btn sgd-btn--primary"
  }, "Generate SSH key \u2192"))));
}

/***/ },

/***/ "./src/renderer/wizard/steps/Step4_KeyGen.jsx"
/*!****************************************************!*\
  !*** ./src/renderer/wizard/steps/Step4_KeyGen.jsx ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Step4_KeyGen)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ipc */ "./src/renderer/ipc.js");
/**
 * Step 4 — SSH Key Generation
 * Auto-starts key generation on mount.
 * Shows a loading state while generating, then a success confirmation.
 * On success, stores the publicKey in wizard data (for display in Step 5).
 * On error, allows retry.
 */


const STATUS = {
  IDLE: 'idle',
  GENERATING: 'generating',
  DONE: 'done',
  ERROR: 'error'
};
function Step4_KeyGen({
  data,
  onChange,
  onNext,
  onBack
}) {
  const [status, setStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(STATUS.IDLE);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);

  // Auto-start on mount
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    generate();
  }, []);
  async function generate() {
    setStatus(STATUS.GENERATING);
    setError(null);
    try {
      const result = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.generateKey)(data.keyId);
      onChange({
        publicKey: result.publicKey
      });
      setStatus(STATUS.DONE);
    } catch (err) {
      setStatus(STATUS.ERROR);
      setError(err?.message || 'Key generation failed. Please try again.');
    }
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step-icon"
  }, status === STATUS.DONE ? '✅' : status === STATUS.ERROR ? '❌' : '⚙️'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "sgd-wizard__heading"
  }, "Generating your SSH key"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-wizard__subheading"
  }, "Creating a unique Ed25519 key pair on this machine \u2014 no internet connection required."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__body"
  }, status === STATUS.GENERATING && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-keygen-status sgd-keygen-status--working"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-spinner",
    "aria-label": "Generating key\u2026"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Generating key pair\u2026"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Creating your private and public keys locally. This takes only a moment."))), status === STATUS.ERROR && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Key generation failed:"), " ", error), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: generate,
    style: {
      marginTop: 8
    }
  }, "Retry key generation")), status === STATUS.DONE && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-keygen-status sgd-keygen-status--done"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-keygen-status__check"
  }, "\u2713"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Key pair generated successfully"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Your ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "private key"), " is saved securely on this machine \u2014 it will never leave your computer."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Your ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "public key"), " is ready to be copied into SiteGround on the next screen."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--info",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Key type:"), " Ed25519 \xA0\xB7\xA0", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Key ID:"), ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-code-inline"
  }, data.keyId))), status === STATUS.IDLE && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      color: '#6c757d'
    }
  }, "Preparing key generation\u2026")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: onBack,
    disabled: status === STATUS.GENERATING
  }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: onNext,
    disabled: status !== STATUS.DONE
  }, "View public key \u2192")));
}

/***/ },

/***/ "./src/renderer/wizard/steps/Step5_PublicKey.jsx"
/*!*******************************************************!*\
  !*** ./src/renderer/wizard/steps/Step5_PublicKey.jsx ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Step5_PublicKey)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_CopyableCode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../components/CopyableCode */ "./src/renderer/components/CopyableCode.jsx");
/**
 * Step 5 — Public Key Display
 * Shows the generated public key with a copy button.
 * Gives explicit step-by-step instructions for pasting it into SiteGround.
 * User must confirm they have activated the key before proceeding.
 */


function Step5_PublicKey({
  data,
  onNext,
  onBack
}) {
  const [confirmed, setConfirmed] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step-icon"
  }, "\uD83D\uDCCB"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "sgd-wizard__heading"
  }, "Add your public key to SiteGround"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-wizard__subheading"
  }, "Copy the key below and paste it exactly as shown into your SiteGround SSH Keys Manager. Do not modify it."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__body"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_CopyableCode__WEBPACK_IMPORTED_MODULE_1__["default"], {
    value: data.publicKey,
    label: "Your public key \u2014 copy this entire value"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list",
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "1"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Go to your SiteGround User Area"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Open", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-code-inline"
  }, "my.siteground.com"), " in your browser."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "2"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Navigate to SSH Keys Manager"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Go to ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Websites \u2192 Manage"), " for your site, then open ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Security \u2192 SSH Keys Manager"), "."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "3"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Add a new SSH key"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Click ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Add New SSH Key"), " (or the equivalent button). Give it any name you like (e.g. \"Local Deploy\")."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "4"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Paste the public key"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Paste the entire key from above into the", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Public Key"), " field. It must begin with", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-code-inline"
  }, "ssh-ed25519"), "."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "5"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Activate the key"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "After saving, make sure the key shows as", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Active"), " in the SSH Keys Manager list. An inactive key will be rejected.")))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--warning",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Leave this screen open"), " while you complete the steps above in SiteGround. Come back here when the key shows as Active."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    className: "sgd-checkbox-label",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: confirmed,
    onChange: e => setConfirmed(e.target.checked)
  }), "I have pasted the public key into SiteGround and it is now", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Active"), ".")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: onNext,
    disabled: !confirmed
  }, "Test connection \u2192")));
}

/***/ },

/***/ "./src/renderer/wizard/steps/Step6_TestConnection.jsx"
/*!************************************************************!*\
  !*** ./src/renderer/wizard/steps/Step6_TestConnection.jsx ***!
  \************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Step6_TestConnection)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ipc */ "./src/renderer/ipc.js");
/* harmony import */ var _components_StatusBadge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../components/StatusBadge */ "./src/renderer/components/StatusBadge.jsx");
/**
 * Step 6 — Test SSH Connection
 * Calls the backend with the raw profile data (no save required yet).
 * Shows clear pass / fail states.
 * Allows the user to skip if the backend is not yet implemented,
 * with a visible warning in the summary.
 */



const STATUS = {
  IDLE: 'idle',
  TESTING: 'testing',
  SUCCESS: 'success',
  FAILED: 'failed'
};
function Step6_TestConnection({
  data,
  onChange,
  onNext,
  onBack
}) {
  const [status, setStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  async function runTest() {
    setStatus(STATUS.TESTING);
    setErrorMsg(null);
    try {
      const result = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.testSSHConnectionDirect)(data);
      if (result.success) {
        onChange({
          connectionTestPassed: true
        });
        setStatus(STATUS.SUCCESS);
      } else {
        onChange({
          connectionTestPassed: false
        });
        setStatus(STATUS.FAILED);
        setErrorMsg(result.error || 'Connection refused or timed out.');
      }
    } catch (err) {
      onChange({
        connectionTestPassed: false
      });
      setStatus(STATUS.FAILED);
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    }
  }
  function handleSkip() {
    onChange({
      connectionTestPassed: false
    });
    onNext();
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step-icon"
  }, status === STATUS.SUCCESS ? '✅' : status === STATUS.FAILED ? '❌' : '🔒'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "sgd-wizard__heading"
  }, "Test SSH connection"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-wizard__subheading"
  }, "Verify that this machine can reach your SiteGround server using the key you just activated."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__body"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card sgd-card--compact",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("table", {
    className: "sgd-summary-table"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tbody", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, "Host"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-code-inline"
  }, data.sshHost, ":", data.sshPort))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, "Username"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-code-inline"
  }, data.sshUser))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, "Auth"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, "Ed25519 key (key ID: ", data.keyId?.slice(0, 8), "\u2026)"))))), status === STATUS.IDLE && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      color: '#6c757d',
      margin: 0
    }
  }, "Click ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Test Connection"), " to verify SSH access."), status === STATUS.TESTING && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-keygen-status sgd-keygen-status--working"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-spinner"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Testing connection\u2026"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Attempting to open an SSH session to ", data.sshHost, "."))), status === STATUS.SUCCESS && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert",
    style: {
      background: '#d4edda',
      border: '1px solid #c3e6cb',
      color: '#155724'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "\u2713 Connection successful."), " Your SSH key is working and the server is reachable. You can now save this profile."), status === STATUS.FAILED && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Connection failed:"), " ", errorMsg), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--info",
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Common causes:"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("ul", {
    style: {
      margin: '6px 0 0',
      paddingLeft: 18
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, "The SSH key is not yet Active in SiteGround"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, "Wrong SSH host or username"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, "Wrong SSH port (SiteGround uses ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "18765"), ")"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, "SiteGround SSH access not enabled for this hosting plan"))))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: onBack,
    disabled: status === STATUS.TESTING
  }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, status !== STATUS.SUCCESS && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost",
    onClick: handleSkip,
    disabled: status === STATUS.TESTING,
    title: "Save profile without verifying \u2014 you can test it later from the profile detail view"
  }, "Skip for now"), status === STATUS.SUCCESS ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: onNext
  }, "Save profile \u2192") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: runTest,
    disabled: status === STATUS.TESTING
  }, status === STATUS.FAILED ? 'Retry test' : 'Test connection'))));
}

/***/ },

/***/ "./src/renderer/wizard/steps/Step7_SaveProfile.jsx"
/*!*********************************************************!*\
  !*** ./src/renderer/wizard/steps/Step7_SaveProfile.jsx ***!
  \*********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Step7_SaveProfile)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ipc */ "./src/renderer/ipc.js");
/* harmony import */ var _components_StatusBadge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../components/StatusBadge */ "./src/renderer/components/StatusBadge.jsx");
/**
 * Step 7 — Review and Save Profile
 * Shows a full summary of all collected data.
 * The actual profile save happens here — not before.
 * Handles both new saves and updates if the user navigated back and returned.
 */



const STATUS = {
  IDLE: 'idle',
  SAVING: 'saving',
  DONE: 'done',
  ERROR: 'error'
};
function Step7_SaveProfile({
  data,
  onChange,
  onNext,
  onBack
}) {
  const [status, setStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(STATUS.IDLE);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  async function handleSave() {
    setStatus(STATUS.SAVING);
    setError(null);
    try {
      const saved = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.saveProfile)(data);
      onChange({
        id: saved.id
      });
      setStatus(STATUS.DONE);
    } catch (err) {
      setStatus(STATUS.ERROR);
      setError(err?.message || 'Save failed. Please try again.');
    }
  }
  const rows = [{
    label: 'Profile name',
    value: data.name
  }, {
    label: 'SSH host',
    value: `${data.sshHost}:${data.sshPort}`
  }, {
    label: 'SSH username',
    value: data.sshUser
  }, {
    label: 'Remote web root',
    value: data.remoteWebRoot
  }, {
    label: 'Production domain',
    value: data.productionDomain
  }, {
    label: 'SSH key',
    value: `Ed25519 · ID: ${data.keyId?.slice(0, 8)}…`
  }, {
    label: 'Connection test',
    value: data.connectionTestPassed ? 'Passed ✓' : 'Not tested / skipped',
    highlight: !data.connectionTestPassed
  }];
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step-icon"
  }, "\uD83D\uDCBE"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "sgd-wizard__heading"
  }, "Review and save"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-wizard__subheading"
  }, "Confirm your settings below, then save the profile. You can edit any field by going back."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__body"
  }, !data.connectionTestPassed && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--warning",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Connection not verified."), " The SSH test was skipped or failed. You can save the profile and test it later from the profile detail view, but deploys will fail until connectivity is confirmed."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card sgd-card--compact"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("table", {
    className: "sgd-summary-table"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tbody", null, rows.map(({
    label,
    value,
    highlight
  }) => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", {
    key: label
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", null, label), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
    style: highlight ? {
      color: '#856404'
    } : {}
  }, label === 'Remote web root' || label === 'SSH host' || label === 'SSH username' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-code-inline"
  }, value) : value)))))), status === STATUS.ERROR && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Could not save profile:"), " ", error), status === STATUS.DONE && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert",
    style: {
      background: '#d4edda',
      border: '1px solid #c3e6cb',
      color: '#155724',
      marginTop: 12
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Profile saved successfully."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: onBack,
    disabled: status === STATUS.SAVING || status === STATUS.DONE
  }, "\u2190 Back"), status === STATUS.DONE ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: onNext
  }, "Finish \u2192") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: handleSave,
    disabled: status === STATUS.SAVING
  }, status === STATUS.SAVING ? 'Saving…' : status === STATUS.ERROR ? 'Retry save' : 'Save profile')));
}

/***/ },

/***/ "./src/renderer/wizard/steps/Step8_Complete.jsx"
/*!******************************************************!*\
  !*** ./src/renderer/wizard/steps/Step8_Complete.jsx ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Step8_Complete)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Step 8 — Complete
 * Confirms the profile is saved and ready to use.
 * Offers two exits: go to the profile detail view, or go straight to deploy.
 */

function Step8_Complete({
  data,
  onComplete,
  onGoToDeploy
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step sgd-wizard__step--centered"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__step-icon sgd-wizard__step-icon--large"
  }, "\uD83C\uDF89"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "sgd-wizard__heading"
  }, "You're all set!"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-wizard__subheading"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, data.name), " is saved and ready to use."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__body"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert",
    style: {
      background: '#d4edda',
      border: '1px solid #c3e6cb',
      color: '#155724',
      marginBottom: 20
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Profile created:"), " ", data.name, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    style: {
      fontSize: '12px'
    }
  }, "Targets: ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, data.productionDomain))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-info-list__icon"
  }, "\u267B\uFE0F"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Reusable"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Your connection settings are saved. Select this profile any time from the dashboard to deploy again \u2014 no re-setup needed."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-info-list__icon"
  }, "\uD83D\uDDC4\uFE0F"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Two deploy modes available"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Code only"), " pushes your themes and plugins.", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Full deploy"), " also replaces the production database (with automatic backup and search-replace)."))), !data.connectionTestPassed && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-info-list__icon"
  }, "\u26A0\uFE0F"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Connection not yet tested"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Open the profile and click ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("em", null, "Test SSH connection"), " before running your first deploy to confirm everything is working."))))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-wizard__actions sgd-wizard__actions--centered"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: () => onComplete(data)
  }, "View profile"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: () => onGoToDeploy ? onGoToDeploy(data) : onComplete(data)
  }, "Deploy now \u2192")));
}

/***/ },

/***/ "./node_modules/css-loader/dist/cjs.js!./src/renderer/styles/global.css"
/*!******************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/renderer/styles/global.css ***!
  \******************************************************************************/
(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/**
 * Global stylesheet for the SiteGround Deploy add-on.
 * Scoped to .sgd-app to avoid bleeding into Local's own styles.
 */

/* ── Reset / base ──────────────────────────────────────────────────────────── */
.sgd-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #1a1a2e;
  background: #f7f8fa;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sgd-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.sgd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #1a1a2e;
  color: #fff;
  border-bottom: 2px solid #ef5b25;
  flex-shrink: 0;
}

.sgd-header__title {
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  letter-spacing: 0.3px;
}

.sgd-header__actions {
  display: flex;
  gap: 8px;
}

/* ── Buttons ───────────────────────────────────────────────────────────────── */
.sgd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 16px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.sgd-btn:hover { opacity: 0.85; }
.sgd-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.sgd-btn--primary   { background: #ef5b25; color: #fff; }
.sgd-btn--secondary { background: #e2e6ea; color: #1a1a2e; }
.sgd-btn--danger    { background: #dc3545; color: #fff; }
.sgd-btn--ghost     { background: transparent; color: #ef5b25; border: 1px solid #ef5b25; }
.sgd-btn--sm        { padding: 4px 10px; font-size: 11px; }

/* ── Cards ─────────────────────────────────────────────────────────────────── */
.sgd-card {
  background: #fff;
  border: 1px solid #e2e6ea;
  border-radius: 6px;
  padding: 16px 20px;
  margin-bottom: 12px;
}

.sgd-card__title {
  font-weight: 700;
  font-size: 13px;
  margin: 0 0 4px;
}

.sgd-card__meta {
  font-size: 11px;
  color: #6c757d;
}

/* ── Form elements ─────────────────────────────────────────────────────────── */
.sgd-field {
  margin-bottom: 14px;
}

.sgd-field label {
  display: block;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
  margin-bottom: 4px;
}

.sgd-field input,
.sgd-field select,
.sgd-field textarea {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.sgd-field input:focus,
.sgd-field select:focus,
.sgd-field textarea:focus {
  outline: none;
  border-color: #ef5b25;
  box-shadow: 0 0 0 2px rgba(239, 91, 37, 0.15);
}

/* ── Status badges ─────────────────────────────────────────────────────────── */
.sgd-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.sgd-badge--success { background: #d4edda; color: #155724; }
.sgd-badge--error   { background: #f8d7da; color: #721c24; }
.sgd-badge--warning { background: #fff3cd; color: #856404; }
.sgd-badge--pending { background: #e2e6ea; color: #495057; }

/* ── Wizard ────────────────────────────────────────────────────────────────── */
.sgd-wizard {
  max-width: 540px;
  margin: 0 auto;
}

.sgd-wizard__step-indicator {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
  justify-content: center;
}

.sgd-wizard__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ced4da;
  transition: background 0.2s ease;
}

.sgd-wizard__dot--active   { background: #ef5b25; }
.sgd-wizard__dot--complete { background: #28a745; }

.sgd-wizard__actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e2e6ea;
}

/* ── Activity log ──────────────────────────────────────────────────────────── */
.sgd-log {
  background: #1a1a2e;
  border-radius: 6px;
  padding: 12px 14px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.7;
  color: #cdd5e0;
  max-height: 320px;
  overflow-y: auto;
}

.sgd-log__entry--info    { color: #adb5bd; }
.sgd-log__entry--success { color: #6edd8e; }
.sgd-log__entry--warning { color: #ffc107; }
.sgd-log__entry--error   { color: #ff6b6b; }

/* ── Alert / callout ───────────────────────────────────────────────────────── */
.sgd-alert {
  border-radius: 4px;
  padding: 10px 14px;
  font-size: 12px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.sgd-alert--danger  { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
.sgd-alert--warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; }
.sgd-alert--info    { background: #cce5ff; border: 1px solid #b8daff; color: #004085; }

/* ── Utility ───────────────────────────────────────────────────────────────── */
.sgd-empty {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.sgd-empty p { margin: 8px 0 0; font-size: 12px; }

/* ═══════════════════════════════════════════════════════════════════════════
   Wizard — extended styles
   ═══════════════════════════════════════════════════════════════════════════ */

/* Header inside wizard panel */
.sgd-wizard__header {
  text-align: center;
  margin-bottom: 20px;
}

.sgd-wizard__step-label {
  font-size: 11px;
  color: #6c757d;
  margin: 6px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Individual step container */
.sgd-wizard__step {
  animation: sgd-fade-in 0.2s ease;
}

.sgd-wizard__step--centered {
  text-align: center;
}

@keyframes sgd-fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Large emoji icon at top of each step */
.sgd-wizard__step-icon {
  font-size: 32px;
  margin-bottom: 10px;
  display: block;
}

.sgd-wizard__step-icon--large {
  font-size: 48px;
}

.sgd-wizard__heading {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px;
}

.sgd-wizard__subheading {
  font-size: 13px;
  color: #6c757d;
  margin: 0 0 20px;
  line-height: 1.5;
}

.sgd-wizard__body {
  margin-bottom: 8px;
}

.sgd-wizard__body p {
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  margin: 0 0 10px;
}

.sgd-wizard__actions--centered {
  justify-content: center;
  gap: 12px;
}

/* Two-column layout for host + port */
.sgd-form-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.sgd-form-row .sgd-field:first-child { flex: 1; }
.sgd-form-row .sgd-field:last-child  { flex-shrink: 0; }

/* ── FormField error/hint states ─────────────────────────────────────────── */

.sgd-field--error input,
.sgd-field--error select,
.sgd-field--error textarea {
  border-color: #dc3545;
  background-color: #fff8f8;
}

.sgd-field--error input:focus,
.sgd-field--error select:focus {
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.15);
}

.sgd-field__required {
  color: #dc3545;
}

.sgd-field__hint {
  font-size: 11px;
  color: #6c757d;
  margin: 3px 0 0;
  line-height: 1.4;
}

.sgd-field__error {
  font-size: 11px;
  color: #dc3545;
  margin: 3px 0 0;
  line-height: 1.4;
}

/* ── Copyable code block ──────────────────────────────────────────────────── */

.sgd-copyable__label {
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 6px;
}

.sgd-copyable__block {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #1a1a2e;
  border-radius: 4px;
  padding: 12px 14px;
}

.sgd-copyable__code {
  flex: 1;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 11px;
  color: #cdd5e0;
  word-break: break-all;
  white-space: pre-wrap;
  line-height: 1.6;
}

.sgd-copyable__btn {
  flex-shrink: 0;
  margin-top: 2px;
}

/* ── Inline code snippets ─────────────────────────────────────────────────── */

.sgd-code-inline {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 11px;
  background: #e9ecef;
  color: #1a1a2e;
  padding: 1px 5px;
  border-radius: 3px;
}

/* ── Info list (icon + text rows) ─────────────────────────────────────────── */

.sgd-info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 12px 0;
}

.sgd-info-list__item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.sgd-info-list__icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.sgd-info-list__item strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
}

.sgd-info-list__item p {
  font-size: 12px;
  color: #555;
  margin: 0;
  line-height: 1.5;
}

/* ── Numbered steps list ──────────────────────────────────────────────────── */

.sgd-steps-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sgd-steps-list__item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.sgd-steps-list__num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ef5b25;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.sgd-steps-list__item strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 3px;
}

.sgd-steps-list__item p {
  font-size: 12px;
  color: #555;
  margin: 0;
  line-height: 1.5;
}

/* ── Key generation status block ──────────────────────────────────────────── */

.sgd-keygen-status {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  border-radius: 6px;
  padding: 14px 16px;
}

.sgd-keygen-status--working {
  background: #f7f8fa;
  border: 1px solid #e2e6ea;
}

.sgd-keygen-status--done {
  background: #f0fff4;
  border: 1px solid #c3e6cb;
}

.sgd-keygen-status strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.sgd-keygen-status p {
  font-size: 12px;
  color: #555;
  margin: 0;
  line-height: 1.5;
}

.sgd-keygen-status__check {
  font-size: 20px;
  color: #28a745;
  flex-shrink: 0;
}

/* ── Spinner ──────────────────────────────────────────────────────────────── */

.sgd-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #e2e6ea;
  border-top-color: #ef5b25;
  border-radius: 50%;
  animation: sgd-spin 0.8s linear infinite;
  flex-shrink: 0;
  margin-top: 2px;
}

@keyframes sgd-spin {
  to { transform: rotate(360deg); }
}

/* ── Compact card variant ──────────────────────────────────────────────────── */

.sgd-card--compact {
  padding: 12px 16px;
}

/* ── Summary table (inside cards) ────────────────────────────────────────── */

.sgd-summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.sgd-summary-table td {
  padding: 6px 8px 6px 0;
  vertical-align: top;
  border-bottom: 1px solid #f0f0f0;
}

.sgd-summary-table td:first-child {
  color: #6c757d;
  width: 38%;
  white-space: nowrap;
}

.sgd-summary-table tr:last-child td {
  border-bottom: none;
}

/* ── Checkbox label ────────────────────────────────────────────────────────── */

.sgd-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #333;
  line-height: 1.5;
  cursor: pointer;
}

.sgd-checkbox-label input[type="checkbox"] {
  margin-top: 1px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: #ef5b25;
}
`, "",{"version":3,"sources":["webpack://./src/renderer/styles/global.css"],"names":[],"mappings":"AAAA;;;EAGE;;AAEF,iFAAiF;AACjF;EACE,8EAA8E;EAC9E,eAAe;EACf,cAAc;EACd,mBAAmB;EACnB,YAAY;EACZ,aAAa;EACb,sBAAsB;AACxB;;AAEA;EACE,OAAO;EACP,gBAAgB;EAChB,aAAa;AACf;;AAEA,iFAAiF;AACjF;EACE,aAAa;EACb,mBAAmB;EACnB,8BAA8B;EAC9B,kBAAkB;EAClB,mBAAmB;EACnB,WAAW;EACX,gCAAgC;EAChC,cAAc;AAChB;;AAEA;EACE,gBAAgB;EAChB,eAAe;EACf,eAAe;EACf,qBAAqB;AACvB;;AAEA;EACE,aAAa;EACb,QAAQ;AACV;;AAEA,iFAAiF;AACjF;EACE,oBAAoB;EACpB,mBAAmB;EACnB,uBAAuB;EACvB,iBAAiB;EACjB,YAAY;EACZ,kBAAkB;EAClB,eAAe;EACf,gBAAgB;EAChB,eAAe;EACf,8BAA8B;AAChC;;AAEA,iBAAiB,aAAa,EAAE;AAChC,oBAAoB,aAAa,EAAE,mBAAmB,EAAE;;AAExD,sBAAsB,mBAAmB,EAAE,WAAW,EAAE;AACxD,sBAAsB,mBAAmB,EAAE,cAAc,EAAE;AAC3D,sBAAsB,mBAAmB,EAAE,WAAW,EAAE;AACxD,sBAAsB,uBAAuB,EAAE,cAAc,EAAE,yBAAyB,EAAE;AAC1F,sBAAsB,iBAAiB,EAAE,eAAe,EAAE;;AAE1D,iFAAiF;AACjF;EACE,gBAAgB;EAChB,yBAAyB;EACzB,kBAAkB;EAClB,kBAAkB;EAClB,mBAAmB;AACrB;;AAEA;EACE,gBAAgB;EAChB,eAAe;EACf,eAAe;AACjB;;AAEA;EACE,eAAe;EACf,cAAc;AAChB;;AAEA,iFAAiF;AACjF;EACE,mBAAmB;AACrB;;AAEA;EACE,cAAc;EACd,gBAAgB;EAChB,eAAe;EACf,yBAAyB;EACzB,qBAAqB;EACrB,cAAc;EACd,kBAAkB;AACpB;;AAEA;;;EAGE,WAAW;EACX,iBAAiB;EACjB,yBAAyB;EACzB,kBAAkB;EAClB,eAAe;EACf,gBAAgB;EAChB,sBAAsB;EACtB,mCAAmC;AACrC;;AAEA;;;EAGE,aAAa;EACb,qBAAqB;EACrB,6CAA6C;AAC/C;;AAEA,iFAAiF;AACjF;EACE,qBAAqB;EACrB,gBAAgB;EAChB,mBAAmB;EACnB,eAAe;EACf,gBAAgB;EAChB,yBAAyB;AAC3B;;AAEA,sBAAsB,mBAAmB,EAAE,cAAc,EAAE;AAC3D,sBAAsB,mBAAmB,EAAE,cAAc,EAAE;AAC3D,sBAAsB,mBAAmB,EAAE,cAAc,EAAE;AAC3D,sBAAsB,mBAAmB,EAAE,cAAc,EAAE;;AAE3D,iFAAiF;AACjF;EACE,gBAAgB;EAChB,cAAc;AAChB;;AAEA;EACE,aAAa;EACb,QAAQ;EACR,mBAAmB;EACnB,uBAAuB;AACzB;;AAEA;EACE,UAAU;EACV,WAAW;EACX,kBAAkB;EAClB,mBAAmB;EACnB,gCAAgC;AAClC;;AAEA,6BAA6B,mBAAmB,EAAE;AAClD,6BAA6B,mBAAmB,EAAE;;AAElD;EACE,aAAa;EACb,8BAA8B;EAC9B,gBAAgB;EAChB,iBAAiB;EACjB,6BAA6B;AAC/B;;AAEA,iFAAiF;AACjF;EACE,mBAAmB;EACnB,kBAAkB;EAClB,kBAAkB;EAClB,iDAAiD;EACjD,eAAe;EACf,gBAAgB;EAChB,cAAc;EACd,iBAAiB;EACjB,gBAAgB;AAClB;;AAEA,2BAA2B,cAAc,EAAE;AAC3C,2BAA2B,cAAc,EAAE;AAC3C,2BAA2B,cAAc,EAAE;AAC3C,2BAA2B,cAAc,EAAE;;AAE3C,iFAAiF;AACjF;EACE,kBAAkB;EAClB,kBAAkB;EAClB,eAAe;EACf,mBAAmB;EACnB,gBAAgB;AAClB;;AAEA,sBAAsB,mBAAmB,EAAE,yBAAyB,EAAE,cAAc,EAAE;AACtF,sBAAsB,mBAAmB,EAAE,yBAAyB,EAAE,cAAc,EAAE;AACtF,sBAAsB,mBAAmB,EAAE,yBAAyB,EAAE,cAAc,EAAE;;AAEtF,iFAAiF;AACjF;EACE,kBAAkB;EAClB,kBAAkB;EAClB,cAAc;AAChB;;AAEA,eAAe,eAAe,EAAE,eAAe,EAAE;;AAEjD;;gFAEgF;;AAEhF,+BAA+B;AAC/B;EACE,kBAAkB;EAClB,mBAAmB;AACrB;;AAEA;EACE,eAAe;EACf,cAAc;EACd,eAAe;EACf,yBAAyB;EACzB,qBAAqB;AACvB;;AAEA,8BAA8B;AAC9B;EACE,gCAAgC;AAClC;;AAEA;EACE,kBAAkB;AACpB;;AAEA;EACE,OAAO,UAAU,EAAE,0BAA0B,EAAE;EAC/C,OAAO,UAAU,EAAE,wBAAwB,EAAE;AAC/C;;AAEA,yCAAyC;AACzC;EACE,eAAe;EACf,mBAAmB;EACnB,cAAc;AAChB;;AAEA;EACE,eAAe;AACjB;;AAEA;EACE,eAAe;EACf,gBAAgB;EAChB,cAAc;EACd,eAAe;AACjB;;AAEA;EACE,eAAe;EACf,cAAc;EACd,gBAAgB;EAChB,gBAAgB;AAClB;;AAEA;EACE,kBAAkB;AACpB;;AAEA;EACE,eAAe;EACf,gBAAgB;EAChB,WAAW;EACX,gBAAgB;AAClB;;AAEA;EACE,uBAAuB;EACvB,SAAS;AACX;;AAEA,sCAAsC;AACtC;EACE,aAAa;EACb,SAAS;EACT,uBAAuB;AACzB;;AAEA,uCAAuC,OAAO,EAAE;AAChD,uCAAuC,cAAc,EAAE;;AAEvD,+EAA+E;;AAE/E;;;EAGE,qBAAqB;EACrB,yBAAyB;AAC3B;;AAEA;;EAEE,6CAA6C;AAC/C;;AAEA;EACE,cAAc;AAChB;;AAEA;EACE,eAAe;EACf,cAAc;EACd,eAAe;EACf,gBAAgB;AAClB;;AAEA;EACE,eAAe;EACf,cAAc;EACd,eAAe;EACf,gBAAgB;AAClB;;AAEA,gFAAgF;;AAEhF;EACE,eAAe;EACf,gBAAgB;EAChB,cAAc;EACd,yBAAyB;EACzB,qBAAqB;EACrB,eAAe;AACjB;;AAEA;EACE,aAAa;EACb,uBAAuB;EACvB,SAAS;EACT,mBAAmB;EACnB,kBAAkB;EAClB,kBAAkB;AACpB;;AAEA;EACE,OAAO;EACP,iDAAiD;EACjD,eAAe;EACf,cAAc;EACd,qBAAqB;EACrB,qBAAqB;EACrB,gBAAgB;AAClB;;AAEA;EACE,cAAc;EACd,eAAe;AACjB;;AAEA,gFAAgF;;AAEhF;EACE,iDAAiD;EACjD,eAAe;EACf,mBAAmB;EACnB,cAAc;EACd,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA,gFAAgF;;AAEhF;EACE,aAAa;EACb,sBAAsB;EACtB,SAAS;EACT,cAAc;AAChB;;AAEA;EACE,aAAa;EACb,SAAS;EACT,uBAAuB;AACzB;;AAEA;EACE,eAAe;EACf,cAAc;EACd,eAAe;AACjB;;AAEA;EACE,cAAc;EACd,eAAe;EACf,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,eAAe;EACf,WAAW;EACX,SAAS;EACT,gBAAgB;AAClB;;AAEA,gFAAgF;;AAEhF;EACE,aAAa;EACb,sBAAsB;EACtB,SAAS;AACX;;AAEA;EACE,aAAa;EACb,SAAS;EACT,uBAAuB;AACzB;;AAEA;EACE,WAAW;EACX,YAAY;EACZ,kBAAkB;EAClB,mBAAmB;EACnB,WAAW;EACX,eAAe;EACf,gBAAgB;EAChB,aAAa;EACb,mBAAmB;EACnB,uBAAuB;EACvB,cAAc;EACd,eAAe;AACjB;;AAEA;EACE,cAAc;EACd,eAAe;EACf,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,eAAe;EACf,WAAW;EACX,SAAS;EACT,gBAAgB;AAClB;;AAEA,gFAAgF;;AAEhF;EACE,aAAa;EACb,SAAS;EACT,uBAAuB;EACvB,kBAAkB;EAClB,kBAAkB;AACpB;;AAEA;EACE,mBAAmB;EACnB,yBAAyB;AAC3B;;AAEA;EACE,mBAAmB;EACnB,yBAAyB;AAC3B;;AAEA;EACE,cAAc;EACd,eAAe;EACf,gBAAgB;EAChB,kBAAkB;AACpB;;AAEA;EACE,eAAe;EACf,WAAW;EACX,SAAS;EACT,gBAAgB;AAClB;;AAEA;EACE,eAAe;EACf,cAAc;EACd,cAAc;AAChB;;AAEA,gFAAgF;;AAEhF;EACE,WAAW;EACX,YAAY;EACZ,yBAAyB;EACzB,yBAAyB;EACzB,kBAAkB;EAClB,wCAAwC;EACxC,cAAc;EACd,eAAe;AACjB;;AAEA;EACE,KAAK,yBAAyB,EAAE;AAClC;;AAEA,iFAAiF;;AAEjF;EACE,kBAAkB;AACpB;;AAEA,+EAA+E;;AAE/E;EACE,WAAW;EACX,yBAAyB;EACzB,eAAe;AACjB;;AAEA;EACE,sBAAsB;EACtB,mBAAmB;EACnB,gCAAgC;AAClC;;AAEA;EACE,cAAc;EACd,UAAU;EACV,mBAAmB;AACrB;;AAEA;EACE,mBAAmB;AACrB;;AAEA,iFAAiF;;AAEjF;EACE,aAAa;EACb,uBAAuB;EACvB,QAAQ;EACR,eAAe;EACf,WAAW;EACX,gBAAgB;EAChB,eAAe;AACjB;;AAEA;EACE,eAAe;EACf,cAAc;EACd,eAAe;EACf,qBAAqB;AACvB","sourcesContent":["/**\r\n * Global stylesheet for the SiteGround Deploy add-on.\r\n * Scoped to .sgd-app to avoid bleeding into Local's own styles.\r\n */\r\n\r\n/* ── Reset / base ──────────────────────────────────────────────────────────── */\r\n.sgd-app {\r\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\r\n  font-size: 13px;\r\n  color: #1a1a2e;\r\n  background: #f7f8fa;\r\n  height: 100%;\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.sgd-main {\r\n  flex: 1;\r\n  overflow-y: auto;\r\n  padding: 20px;\r\n}\r\n\r\n/* ── Header ────────────────────────────────────────────────────────────────── */\r\n.sgd-header {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  padding: 12px 20px;\r\n  background: #1a1a2e;\r\n  color: #fff;\r\n  border-bottom: 2px solid #ef5b25;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-header__title {\r\n  font-weight: 700;\r\n  font-size: 14px;\r\n  cursor: pointer;\r\n  letter-spacing: 0.3px;\r\n}\r\n\r\n.sgd-header__actions {\r\n  display: flex;\r\n  gap: 8px;\r\n}\r\n\r\n/* ── Buttons ───────────────────────────────────────────────────────────────── */\r\n.sgd-btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 7px 16px;\r\n  border: none;\r\n  border-radius: 4px;\r\n  font-size: 12px;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  transition: opacity 0.15s ease;\r\n}\r\n\r\n.sgd-btn:hover { opacity: 0.85; }\r\n.sgd-btn:disabled { opacity: 0.45; cursor: not-allowed; }\r\n\r\n.sgd-btn--primary   { background: #ef5b25; color: #fff; }\r\n.sgd-btn--secondary { background: #e2e6ea; color: #1a1a2e; }\r\n.sgd-btn--danger    { background: #dc3545; color: #fff; }\r\n.sgd-btn--ghost     { background: transparent; color: #ef5b25; border: 1px solid #ef5b25; }\r\n.sgd-btn--sm        { padding: 4px 10px; font-size: 11px; }\r\n\r\n/* ── Cards ─────────────────────────────────────────────────────────────────── */\r\n.sgd-card {\r\n  background: #fff;\r\n  border: 1px solid #e2e6ea;\r\n  border-radius: 6px;\r\n  padding: 16px 20px;\r\n  margin-bottom: 12px;\r\n}\r\n\r\n.sgd-card__title {\r\n  font-weight: 700;\r\n  font-size: 13px;\r\n  margin: 0 0 4px;\r\n}\r\n\r\n.sgd-card__meta {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n}\r\n\r\n/* ── Form elements ─────────────────────────────────────────────────────────── */\r\n.sgd-field {\r\n  margin-bottom: 14px;\r\n}\r\n\r\n.sgd-field label {\r\n  display: block;\r\n  font-weight: 600;\r\n  font-size: 11px;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n  color: #6c757d;\r\n  margin-bottom: 4px;\r\n}\r\n\r\n.sgd-field input,\r\n.sgd-field select,\r\n.sgd-field textarea {\r\n  width: 100%;\r\n  padding: 7px 10px;\r\n  border: 1px solid #ced4da;\r\n  border-radius: 4px;\r\n  font-size: 13px;\r\n  background: #fff;\r\n  box-sizing: border-box;\r\n  transition: border-color 0.15s ease;\r\n}\r\n\r\n.sgd-field input:focus,\r\n.sgd-field select:focus,\r\n.sgd-field textarea:focus {\r\n  outline: none;\r\n  border-color: #ef5b25;\r\n  box-shadow: 0 0 0 2px rgba(239, 91, 37, 0.15);\r\n}\r\n\r\n/* ── Status badges ─────────────────────────────────────────────────────────── */\r\n.sgd-badge {\r\n  display: inline-block;\r\n  padding: 2px 8px;\r\n  border-radius: 10px;\r\n  font-size: 10px;\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n}\r\n\r\n.sgd-badge--success { background: #d4edda; color: #155724; }\r\n.sgd-badge--error   { background: #f8d7da; color: #721c24; }\r\n.sgd-badge--warning { background: #fff3cd; color: #856404; }\r\n.sgd-badge--pending { background: #e2e6ea; color: #495057; }\r\n\r\n/* ── Wizard ────────────────────────────────────────────────────────────────── */\r\n.sgd-wizard {\r\n  max-width: 540px;\r\n  margin: 0 auto;\r\n}\r\n\r\n.sgd-wizard__step-indicator {\r\n  display: flex;\r\n  gap: 6px;\r\n  margin-bottom: 24px;\r\n  justify-content: center;\r\n}\r\n\r\n.sgd-wizard__dot {\r\n  width: 8px;\r\n  height: 8px;\r\n  border-radius: 50%;\r\n  background: #ced4da;\r\n  transition: background 0.2s ease;\r\n}\r\n\r\n.sgd-wizard__dot--active   { background: #ef5b25; }\r\n.sgd-wizard__dot--complete { background: #28a745; }\r\n\r\n.sgd-wizard__actions {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  margin-top: 24px;\r\n  padding-top: 16px;\r\n  border-top: 1px solid #e2e6ea;\r\n}\r\n\r\n/* ── Activity log ──────────────────────────────────────────────────────────── */\r\n.sgd-log {\r\n  background: #1a1a2e;\r\n  border-radius: 6px;\r\n  padding: 12px 14px;\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 11px;\r\n  line-height: 1.7;\r\n  color: #cdd5e0;\r\n  max-height: 320px;\r\n  overflow-y: auto;\r\n}\r\n\r\n.sgd-log__entry--info    { color: #adb5bd; }\r\n.sgd-log__entry--success { color: #6edd8e; }\r\n.sgd-log__entry--warning { color: #ffc107; }\r\n.sgd-log__entry--error   { color: #ff6b6b; }\r\n\r\n/* ── Alert / callout ───────────────────────────────────────────────────────── */\r\n.sgd-alert {\r\n  border-radius: 4px;\r\n  padding: 10px 14px;\r\n  font-size: 12px;\r\n  margin-bottom: 12px;\r\n  line-height: 1.5;\r\n}\r\n\r\n.sgd-alert--danger  { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }\r\n.sgd-alert--warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; }\r\n.sgd-alert--info    { background: #cce5ff; border: 1px solid #b8daff; color: #004085; }\r\n\r\n/* ── Utility ───────────────────────────────────────────────────────────────── */\r\n.sgd-empty {\r\n  text-align: center;\r\n  padding: 40px 20px;\r\n  color: #6c757d;\r\n}\r\n\r\n.sgd-empty p { margin: 8px 0 0; font-size: 12px; }\r\n\r\n/* ═══════════════════════════════════════════════════════════════════════════\r\n   Wizard — extended styles\r\n   ═══════════════════════════════════════════════════════════════════════════ */\r\n\r\n/* Header inside wizard panel */\r\n.sgd-wizard__header {\r\n  text-align: center;\r\n  margin-bottom: 20px;\r\n}\r\n\r\n.sgd-wizard__step-label {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n  margin: 6px 0 0;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n}\r\n\r\n/* Individual step container */\r\n.sgd-wizard__step {\r\n  animation: sgd-fade-in 0.2s ease;\r\n}\r\n\r\n.sgd-wizard__step--centered {\r\n  text-align: center;\r\n}\r\n\r\n@keyframes sgd-fade-in {\r\n  from { opacity: 0; transform: translateY(6px); }\r\n  to   { opacity: 1; transform: translateY(0); }\r\n}\r\n\r\n/* Large emoji icon at top of each step */\r\n.sgd-wizard__step-icon {\r\n  font-size: 32px;\r\n  margin-bottom: 10px;\r\n  display: block;\r\n}\r\n\r\n.sgd-wizard__step-icon--large {\r\n  font-size: 48px;\r\n}\r\n\r\n.sgd-wizard__heading {\r\n  font-size: 18px;\r\n  font-weight: 700;\r\n  color: #1a1a2e;\r\n  margin: 0 0 6px;\r\n}\r\n\r\n.sgd-wizard__subheading {\r\n  font-size: 13px;\r\n  color: #6c757d;\r\n  margin: 0 0 20px;\r\n  line-height: 1.5;\r\n}\r\n\r\n.sgd-wizard__body {\r\n  margin-bottom: 8px;\r\n}\r\n\r\n.sgd-wizard__body p {\r\n  font-size: 13px;\r\n  line-height: 1.6;\r\n  color: #333;\r\n  margin: 0 0 10px;\r\n}\r\n\r\n.sgd-wizard__actions--centered {\r\n  justify-content: center;\r\n  gap: 12px;\r\n}\r\n\r\n/* Two-column layout for host + port */\r\n.sgd-form-row {\r\n  display: flex;\r\n  gap: 12px;\r\n  align-items: flex-start;\r\n}\r\n\r\n.sgd-form-row .sgd-field:first-child { flex: 1; }\r\n.sgd-form-row .sgd-field:last-child  { flex-shrink: 0; }\r\n\r\n/* ── FormField error/hint states ─────────────────────────────────────────── */\r\n\r\n.sgd-field--error input,\r\n.sgd-field--error select,\r\n.sgd-field--error textarea {\r\n  border-color: #dc3545;\r\n  background-color: #fff8f8;\r\n}\r\n\r\n.sgd-field--error input:focus,\r\n.sgd-field--error select:focus {\r\n  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.15);\r\n}\r\n\r\n.sgd-field__required {\r\n  color: #dc3545;\r\n}\r\n\r\n.sgd-field__hint {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n  margin: 3px 0 0;\r\n  line-height: 1.4;\r\n}\r\n\r\n.sgd-field__error {\r\n  font-size: 11px;\r\n  color: #dc3545;\r\n  margin: 3px 0 0;\r\n  line-height: 1.4;\r\n}\r\n\r\n/* ── Copyable code block ──────────────────────────────────────────────────── */\r\n\r\n.sgd-copyable__label {\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  color: #6c757d;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n  margin: 0 0 6px;\r\n}\r\n\r\n.sgd-copyable__block {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 10px;\r\n  background: #1a1a2e;\r\n  border-radius: 4px;\r\n  padding: 12px 14px;\r\n}\r\n\r\n.sgd-copyable__code {\r\n  flex: 1;\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 11px;\r\n  color: #cdd5e0;\r\n  word-break: break-all;\r\n  white-space: pre-wrap;\r\n  line-height: 1.6;\r\n}\r\n\r\n.sgd-copyable__btn {\r\n  flex-shrink: 0;\r\n  margin-top: 2px;\r\n}\r\n\r\n/* ── Inline code snippets ─────────────────────────────────────────────────── */\r\n\r\n.sgd-code-inline {\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 11px;\r\n  background: #e9ecef;\r\n  color: #1a1a2e;\r\n  padding: 1px 5px;\r\n  border-radius: 3px;\r\n}\r\n\r\n/* ── Info list (icon + text rows) ─────────────────────────────────────────── */\r\n\r\n.sgd-info-list {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 12px;\r\n  margin: 12px 0;\r\n}\r\n\r\n.sgd-info-list__item {\r\n  display: flex;\r\n  gap: 12px;\r\n  align-items: flex-start;\r\n}\r\n\r\n.sgd-info-list__icon {\r\n  font-size: 18px;\r\n  flex-shrink: 0;\r\n  margin-top: 1px;\r\n}\r\n\r\n.sgd-info-list__item strong {\r\n  display: block;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  margin-bottom: 2px;\r\n}\r\n\r\n.sgd-info-list__item p {\r\n  font-size: 12px;\r\n  color: #555;\r\n  margin: 0;\r\n  line-height: 1.5;\r\n}\r\n\r\n/* ── Numbered steps list ──────────────────────────────────────────────────── */\r\n\r\n.sgd-steps-list {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 14px;\r\n}\r\n\r\n.sgd-steps-list__item {\r\n  display: flex;\r\n  gap: 12px;\r\n  align-items: flex-start;\r\n}\r\n\r\n.sgd-steps-list__num {\r\n  width: 24px;\r\n  height: 24px;\r\n  border-radius: 50%;\r\n  background: #ef5b25;\r\n  color: #fff;\r\n  font-size: 11px;\r\n  font-weight: 700;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  flex-shrink: 0;\r\n  margin-top: 1px;\r\n}\r\n\r\n.sgd-steps-list__item strong {\r\n  display: block;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  margin-bottom: 3px;\r\n}\r\n\r\n.sgd-steps-list__item p {\r\n  font-size: 12px;\r\n  color: #555;\r\n  margin: 0;\r\n  line-height: 1.5;\r\n}\r\n\r\n/* ── Key generation status block ──────────────────────────────────────────── */\r\n\r\n.sgd-keygen-status {\r\n  display: flex;\r\n  gap: 14px;\r\n  align-items: flex-start;\r\n  border-radius: 6px;\r\n  padding: 14px 16px;\r\n}\r\n\r\n.sgd-keygen-status--working {\r\n  background: #f7f8fa;\r\n  border: 1px solid #e2e6ea;\r\n}\r\n\r\n.sgd-keygen-status--done {\r\n  background: #f0fff4;\r\n  border: 1px solid #c3e6cb;\r\n}\r\n\r\n.sgd-keygen-status strong {\r\n  display: block;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  margin-bottom: 4px;\r\n}\r\n\r\n.sgd-keygen-status p {\r\n  font-size: 12px;\r\n  color: #555;\r\n  margin: 0;\r\n  line-height: 1.5;\r\n}\r\n\r\n.sgd-keygen-status__check {\r\n  font-size: 20px;\r\n  color: #28a745;\r\n  flex-shrink: 0;\r\n}\r\n\r\n/* ── Spinner ──────────────────────────────────────────────────────────────── */\r\n\r\n.sgd-spinner {\r\n  width: 20px;\r\n  height: 20px;\r\n  border: 3px solid #e2e6ea;\r\n  border-top-color: #ef5b25;\r\n  border-radius: 50%;\r\n  animation: sgd-spin 0.8s linear infinite;\r\n  flex-shrink: 0;\r\n  margin-top: 2px;\r\n}\r\n\r\n@keyframes sgd-spin {\r\n  to { transform: rotate(360deg); }\r\n}\r\n\r\n/* ── Compact card variant ──────────────────────────────────────────────────── */\r\n\r\n.sgd-card--compact {\r\n  padding: 12px 16px;\r\n}\r\n\r\n/* ── Summary table (inside cards) ────────────────────────────────────────── */\r\n\r\n.sgd-summary-table {\r\n  width: 100%;\r\n  border-collapse: collapse;\r\n  font-size: 12px;\r\n}\r\n\r\n.sgd-summary-table td {\r\n  padding: 6px 8px 6px 0;\r\n  vertical-align: top;\r\n  border-bottom: 1px solid #f0f0f0;\r\n}\r\n\r\n.sgd-summary-table td:first-child {\r\n  color: #6c757d;\r\n  width: 38%;\r\n  white-space: nowrap;\r\n}\r\n\r\n.sgd-summary-table tr:last-child td {\r\n  border-bottom: none;\r\n}\r\n\r\n/* ── Checkbox label ────────────────────────────────────────────────────────── */\r\n\r\n.sgd-checkbox-label {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 8px;\r\n  font-size: 12px;\r\n  color: #333;\r\n  line-height: 1.5;\r\n  cursor: pointer;\r\n}\r\n\r\n.sgd-checkbox-label input[type=\"checkbox\"] {\r\n  margin-top: 1px;\r\n  flex-shrink: 0;\r\n  cursor: pointer;\r\n  accent-color: #ef5b25;\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ },

/***/ "./node_modules/css-loader/dist/runtime/api.js"
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
(module) {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ },

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js"
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
(module) {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ },

/***/ "./src/renderer/styles/global.css"
/*!****************************************!*\
  !*** ./src/renderer/styles/global.css ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_global_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../../node_modules/css-loader/dist/cjs.js!./global.css */ "./node_modules/css-loader/dist/cjs.js!./src/renderer/styles/global.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_global_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_global_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_global_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_global_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ },

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
(module) {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ },

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js"
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
(module) {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ },

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js"
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
(module) {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ },

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js"
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
(module, __unused_webpack_exports, __webpack_require__) {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ },

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js"
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
(module) {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ },

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js"
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
(module) {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ },

/***/ "./node_modules/uuid/dist/esm-browser/native.js"
/*!******************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/native.js ***!
  \******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  randomUUID
});

/***/ },

/***/ "./node_modules/uuid/dist/esm-browser/regex.js"
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/regex.js ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ },

/***/ "./node_modules/uuid/dist/esm-browser/rng.js"
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

/***/ },

/***/ "./node_modules/uuid/dist/esm-browser/stringify.js"
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   unsafeStringify: () => (/* binding */ unsafeStringify)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ },

/***/ "./node_modules/uuid/dist/esm-browser/v4.js"
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _native_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./native.js */ "./node_modules/uuid/dist/esm-browser/native.js");
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");




function v4(options, buf, offset) {
  if (_native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID && !buf && !options) {
    return _native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID();
  }

  options = options || {};
  const rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_1__["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.unsafeStringify)(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ },

/***/ "./node_modules/uuid/dist/esm-browser/validate.js"
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/validate.js ***!
  \********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/esm-browser/regex.js");


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ },

/***/ "electron"
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
(module) {

module.exports = require("electron");

/***/ },

/***/ "react"
/*!************************!*\
  !*** external "react" ***!
  \************************/
(module) {

module.exports = require("react");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!********************************!*\
  !*** ./src/renderer/index.jsx ***!
  \********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
Object.defineProperty(__WEBPACK_DEFAULT_EXPORT__, "name", { value: "default", configurable: true });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./App */ "./src/renderer/App.jsx");
/* harmony import */ var _styles_global_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./styles/global.css */ "./src/renderer/styles/global.css");
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




/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(context) {
  const {
    hooks
  } = context;

  // Inject our full panel into the site Overview area.
  // This is the only hook name confirmed by the Local add-on API docs.
  hooks.addContent('SiteInfoOverview', site => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_App__WEBPACK_IMPORTED_MODULE_1__["default"], {
    key: "sgd-main",
    site: site
  }));
}
})();

module.exports = __webpack_exports__["default"];
/******/ })()
;
//# sourceMappingURL=renderer.js.map