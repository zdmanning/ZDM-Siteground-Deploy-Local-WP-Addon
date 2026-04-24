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
  // Collapsed panel state
  const [minimized, setMinimized] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  // Captured geometry so the minimized bar sits at the same width/position
  const appRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const [snapRect, setSnapRect] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  function handleToggleMinimize() {
    if (!minimized && appRef.current) {
      const rect = appRef.current.getBoundingClientRect();
      setSnapRect({
        width: rect.width,
        left: rect.left
      });
    } else {
      setSnapRect(null);
    }
    setMinimized(m => !m);
  }
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
          key: viewParams.profileId,
          profileId: viewParams.profileId,
          onDeploy: (profileId, defaultMode) => navigate('deploy', {
            profileId,
            defaultMode
          }),
          onViewLogs: profileId => navigate('logs', {
            profileId
          }),
          onBack: () => navigate('dashboard'),
          onCloned: newProfileId => navigate('profile-detail', {
            profileId: newProfileId
          })
        });
      case 'deploy':
        return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_screens_DeployScreen__WEBPACK_IMPORTED_MODULE_4__["default"], {
          profileId: viewParams.profileId,
          defaultMode: viewParams.defaultMode || 'code',
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
          onDeploy: (profileId, defaultMode) => navigate('deploy', {
            profileId,
            defaultMode
          }),
          onSettings: () => navigate('settings')
        });
    }
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    ref: appRef,
    className: `sgd-app${minimized ? ' sgd-app--minimized' : ''}`,
    style: minimized && snapRect ? {
      width: snapRect.width,
      left: snapRect.left
    } : {}
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_Header__WEBPACK_IMPORTED_MODULE_7__["default"], {
    currentView: view,
    minimized: minimized,
    onToggleMinimize: handleToggleMinimize,
    onHome: () => navigate('dashboard'),
    onSettings: () => navigate('settings')
  }), !minimized && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("main", {
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

const SgLogo = () => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "-3 -7 64 80",
  height: "18",
  style: {
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0
  },
  "aria-hidden": "true"
}, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("path", {
  d: "M13.2,45.3C6.4,43.1,1.5,36.5.4,29.6-2.9,10.4,17.4-6.9,37.8,2.7,38,7,36,13.2,30.5,15,57.8,32.2,34.5,67.3,6,55.8c-5.2-2.7-2.4-7.5,3.1-4.7s14.3,2.1,19.4-.7A22.7,22.7,0,0,0,36.8,43a28.5,28.5,0,0,0,1.9-3.6c.5-1,1.8-5.2.8-5.6s-.4.2-.5.5a19.2,19.2,0,0,1-3.9,7.3,19.5,19.5,0,0,1-8.4,5.8c-4.1,1.4-8.8,1.6-15.3.2a23.1,23.1,0,0,0,1.8-2.3ZM32,4.5s.1.7.2,1.8a9.1,9.1,0,0,1-3,7.5l-1.6,1.4c7.7,4.8,11.7,15.3,7.3,22.6-6.1,9.8-18,7.6-24.5.8s-5.9-16.1-1-22.9A28,28,0,0,1,32,4.5Z",
  fill: "#fff",
  fillRule: "evenodd"
}), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("path", {
  d: "M8.8,26c1.5-14.6,18.3-17.4,24.5,2S6.5,43.7,8.8,26Zm13.7,9.6c13.3.5,6.9-13-1.8-16s-13.4,16,1.8,16Z",
  fill: "#fff",
  fillRule: "evenodd"
}));
function Header({
  onHome,
  onSettings,
  minimized,
  onToggleMinimize
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("header", {
    className: "sgd-header"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-header__title",
    onClick: onHome,
    style: {
      display: 'flex'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SgLogo, null), "SiteGround Deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-header__actions"
  }, !minimized && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: onSettings
  }, "Settings"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm sgd-header__minimize",
    onClick: onToggleMinimize,
    title: minimized ? 'Expand panel' : 'Minimize panel'
  }, minimized ? '▲' : '▼')));
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
/* harmony export */   applyImport: () => (/* binding */ applyImport),
/* harmony export */   backupAddon: () => (/* binding */ backupAddon),
/* harmony export */   cancelDeploy: () => (/* binding */ cancelDeploy),
/* harmony export */   clearLogs: () => (/* binding */ clearLogs),
/* harmony export */   createProfile: () => (/* binding */ createProfile),
/* harmony export */   deleteKey: () => (/* binding */ deleteKey),
/* harmony export */   deleteOrphanedKeys: () => (/* binding */ deleteOrphanedKeys),
/* harmony export */   deleteProfile: () => (/* binding */ deleteProfile),
/* harmony export */   deleteRemoteBackups: () => (/* binding */ deleteRemoteBackups),
/* harmony export */   deployPreflight: () => (/* binding */ deployPreflight),
/* harmony export */   exportProfiles: () => (/* binding */ exportProfiles),
/* harmony export */   generateKey: () => (/* binding */ generateKey),
/* harmony export */   getAllLocalSites: () => (/* binding */ getAllLocalSites),
/* harmony export */   getLocalSite: () => (/* binding */ getLocalSite),
/* harmony export */   getLogs: () => (/* binding */ getLogs),
/* harmony export */   getProfile: () => (/* binding */ getProfile),
/* harmony export */   getPublicKey: () => (/* binding */ getPublicKey),
/* harmony export */   getRunEntries: () => (/* binding */ getRunEntries),
/* harmony export */   getRuns: () => (/* binding */ getRuns),
/* harmony export */   getSettings: () => (/* binding */ getSettings),
/* harmony export */   keyExists: () => (/* binding */ keyExists),
/* harmony export */   listLocalDir: () => (/* binding */ listLocalDir),
/* harmony export */   listProfiles: () => (/* binding */ listProfiles),
/* harmony export */   onLogEntry: () => (/* binding */ onLogEntry),
/* harmony export */   pickImportFile: () => (/* binding */ pickImportFile),
/* harmony export */   repairLocalSiteMysql: () => (/* binding */ repairLocalSiteMysql),
/* harmony export */   rotateProfileKey: () => (/* binding */ rotateProfileKey),
/* harmony export */   runCodeDeploy: () => (/* binding */ runCodeDeploy),
/* harmony export */   runCodePull: () => (/* binding */ runCodePull),
/* harmony export */   runDbDeploy: () => (/* binding */ runDbDeploy),
/* harmony export */   runDbPull: () => (/* binding */ runDbPull),
/* harmony export */   runFullDeploy: () => (/* binding */ runFullDeploy),
/* harmony export */   saveProfile: () => (/* binding */ saveProfile),
/* harmony export */   testSSHConnection: () => (/* binding */ testSSHConnection),
/* harmony export */   testSSHConnectionDirect: () => (/* binding */ testSSHConnectionDirect),
/* harmony export */   updateProfile: () => (/* binding */ updateProfile),
/* harmony export */   updateSettings: () => (/* binding */ updateSettings),
/* harmony export */   validateProfile: () => (/* binding */ validateProfile)
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

/** Returns { success, data: Array<profile> } */
const listProfiles = () => ipcRenderer.invoke('sgd:profiles:list');
/** Returns { success, data: profile } */
const getProfile = id => ipcRenderer.invoke('sgd:profiles:get', id);
/** Returns { success, data: profile } | { success: false, error, errors? } */
const createProfile = data => ipcRenderer.invoke('sgd:profiles:create', data);
/** Returns { success, data: profile } | { success: false, error, errors? } */
const updateProfile = (id, patch) => ipcRenderer.invoke('sgd:profiles:update', id, patch);
/** Legacy wizard save — routes to create or update internally */
const saveProfile = profile => ipcRenderer.invoke('sgd:profiles:save', profile);
/** Returns { success, data: { deleted: true } } */
const deleteProfile = id => ipcRenderer.invoke('sgd:profiles:delete', id);
/** Returns { valid, errors } — no write */
const validateProfile = (data, isUpdate) => ipcRenderer.invoke('sgd:profiles:validate', data, isUpdate);

// ─── Keys ─────────────────────────────────────────────────────────────────────

const generateKey = keyId => ipcRenderer.invoke('sgd:keys:generate', keyId);
const getPublicKey = keyId => ipcRenderer.invoke('sgd:keys:getPublic', keyId);
const keyExists = keyId => ipcRenderer.invoke('sgd:keys:exists', keyId);
const deleteKey = keyId => ipcRenderer.invoke('sgd:keys:delete', keyId);
const deleteOrphanedKeys = () => ipcRenderer.invoke('sgd:keys:deleteOrphaned');

/**
 * Atomically rotate the SSH key pair for a saved profile.
 * The new key must already be generated and connection-tested before calling.
 * The main process deletes the old key after committing (if not shared with a clone).
 */
const rotateProfileKey = (profileId, newKeyId) => ipcRenderer.invoke('sgd:keys:rotate', profileId, newKeyId);

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

const deployPreflight = (profileId, targets) => ipcRenderer.invoke('sgd:deploy:preflight', profileId, targets);
const runCodeDeploy = (profileId, options) => ipcRenderer.invoke('sgd:deploy:code', profileId, options);
const runFullDeploy = (profileId, options) => ipcRenderer.invoke('sgd:deploy:full', profileId, options);
const runDbDeploy = (profileId, options) => ipcRenderer.invoke('sgd:deploy:db', profileId, options);
const cancelDeploy = profileId => ipcRenderer.invoke('sgd:deploy:cancel', profileId);
const runCodePull = (profileId, options) => ipcRenderer.invoke('sgd:pull:code', profileId, options);
const runDbPull = (profileId, options) => ipcRenderer.invoke('sgd:pull:db', profileId, options);
const deleteRemoteBackups = profileId => ipcRenderer.invoke('sgd:deploy:delete-backups', profileId);

/**
 * List immediate children of a wp-content sub-directory for the deploy tree picker.
 * @param {string} profileId
 * @param {string} relPath  path relative to wp-content, e.g. 'plugins' or ''
 */
const listLocalDir = (profileId, relPath) => ipcRenderer.invoke('sgd:fs:listDir', profileId, relPath);

// ─── Settings ────────────────────────────────────────────────────────────────

/** Returns { success, data: { confirmDefault: boolean } } */
const getSettings = () => ipcRenderer.invoke('sgd:settings:get');
/** Returns { success, data: { confirmDefault: boolean } } */
const updateSettings = patch => ipcRenderer.invoke('sgd:settings:set', patch);

// ─── Export / Import ─────────────────────────────────────────────────────────

/** Opens a save dialog and writes a .sgdexport file. profileIds=null exports all.
 *  Returns { success, data: { filePath, count } } */
/** Zips the entire addon folder and prompts to save it.
 *  Returns { success, data: { filePath } } */
const backupAddon = () => ipcRenderer.invoke('sgd:addon:backup');
const exportProfiles = profileIds => ipcRenderer.invoke('sgd:export:export', profileIds);
/** Opens an open dialog, parses the file, and returns a preview (no writes).
 *  Returns { success, data: { profiles, conflicts, exportedAt, filePath } } */
const pickImportFile = () => ipcRenderer.invoke('sgd:export:import:pick');
/** Applies the import with per-profile conflict decisions.
 *  Returns { success, data: { imported, skipped, overwritten, renamed } } */
const applyImport = (profiles, decisions) => ipcRenderer.invoke('sgd:export:import:apply', profiles, decisions);

// ─── Logs ─────────────────────────────────────────────────────────────────────

const getLogs = profileId => ipcRenderer.invoke('sgd:logs:list', profileId);
const clearLogs = profileId => ipcRenderer.invoke('sgd:logs:clear', profileId);
const getRuns = profileId => ipcRenderer.invoke('sgd:logs:runs', profileId);
const getRunEntries = (profileId, runId) => ipcRenderer.invoke('sgd:logs:run-entries', profileId, runId);

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
const repairLocalSiteMysql = siteId => ipcRenderer.invoke('sgd:local:mysql:repair', siteId);

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



// ─── Constants ────────────────────────────────────────────────────────────────

const FILTERS = [{
  key: 'all',
  label: 'All'
}, {
  key: 'code_deploy',
  label: 'Code deploy'
}, {
  key: 'full_deploy',
  label: 'Full deploy'
}, {
  key: 'connection_test',
  label: 'Connection test'
}];
const ACTION_LABELS = {
  code_deploy: 'Code deploy',
  full_deploy: 'Full deploy',
  connection_test: 'Connection test',
  system: 'System'
};
const ACTION_CLASS = {
  code_deploy: 'sgd-run-badge--code',
  full_deploy: 'sgd-run-badge--full',
  connection_test: 'sgd-run-badge--conn',
  system: 'sgd-run-badge--system'
};
const OUTCOME_CLASS = {
  success: 'sgd-run-outcome--success',
  failure: 'sgd-run-outcome--failure',
  running: 'sgd-run-outcome--running'
};
const LEVEL_CLASS = {
  info: 'sgd-log__line--info',
  success: 'sgd-log__line--success',
  warning: 'sgd-log__line--warning',
  error: 'sgd-log__line--error'
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _relTime(isoString) {
  const ms = Date.now() - new Date(isoString).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(isoString).toLocaleDateString();
}
function _duration(ms) {
  if (!ms || ms < 0) return null;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor(ms % 60000 / 1000)}s`;
}

// ─── RunEntries ───────────────────────────────────────────────────────────────

function RunEntries({
  entries
}) {
  if (!entries) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-run-card__entries-loading"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "sgd-spinner"
    }), " Loading entries\u2026");
  }
  if (entries.length === 0) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-run-card__entries-empty"
    }, "No log entries recorded for this run.");
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-run-card__entries sgd-log"
  }, entries.map(e => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    key: e.id || e.timestamp,
    className: `sgd-run-entry ${LEVEL_CLASS[e.level] || LEVEL_CLASS.info}`
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-run-entry__ts"
  }, new Date(e.timestamp).toLocaleTimeString()), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-run-entry__msg"
  }, e.message), e.metadata && e.metadata.error && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-run-entry__meta"
  }, e.metadata.error))));
}

// ─── RunCard ──────────────────────────────────────────────────────────────────

function RunCard({
  run,
  entries,
  expanded,
  onToggle
}) {
  const dur = _duration(run.durationMs);
  const [copied, setCopied] = react__WEBPACK_IMPORTED_MODULE_0___default().useState(false);
  function handleCopy(e) {
    e.stopPropagation();
    if (!entries || entries.length === 0) return;
    const text = entries.map(entry => `[${new Date(entry.timestamp).toLocaleTimeString()}] [${entry.level}] ${entry.message}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: `sgd-run-card${expanded ? ' sgd-run-card--expanded' : ''}`
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-run-card__header",
    onClick: onToggle
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: `sgd-run-badge ${ACTION_CLASS[run.actionType] || ACTION_CLASS.system}`
  }, ACTION_LABELS[run.actionType] || run.actionType), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-run-card__time"
  }, _relTime(run.startedAt)), dur && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-run-card__duration"
  }, dur), run.metadata?.targets && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-run-card__targets"
  }, run.metadata.targets.join(', ')), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: `sgd-run-outcome ${OUTCOME_CLASS[run.outcome] || ''}`
  }, run.outcome), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-run-card__chevron"
  }, expanded ? '▲' : '▼')), expanded && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-run-card__body"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-run-card__meta"
  }, run.metadata?.host && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-run-card__meta-item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Host"), " ", run.metadata.host), run.finishedAt && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-run-card__meta-item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Finished"), " ", new Date(run.finishedAt).toLocaleString()), run.metadata?.error && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-run-card__meta-item sgd-run-card__meta-item--error"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Error"), " ", run.metadata.error), run.metadata?.synced && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-run-card__meta-item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Synced"), " ", run.metadata.synced.join(', ')), entries && entries.length > 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--xs sgd-run-card__copy-btn",
    onClick: handleCopy,
    title: "Copy log to clipboard"
  }, copied ? '✓ Copied' : '⎘ Copy log')), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(RunEntries, {
    entries: entries
  })));
}

// ─── Main component ───────────────────────────────────────────────────────────

function ActivityLog({
  profileId,
  onBack
}) {
  const [runs, setRuns] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [entries, setEntries] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({}); // { [runId]: Entry[] }
  const [expandedId, setExpandedId] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [filter, setFilter] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('all');
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const loadRuns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setLoading(true);
    (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.getRuns)(profileId).then(list => {
      setRuns(Array.isArray(list) ? list : []);
      setLoading(false);
    });
  }, [profileId]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    loadRuns();
  }, [loadRuns]);
  async function handleToggle(runId) {
    if (expandedId === runId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(runId);
    if (!entries[runId]) {
      const list = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.getRunEntries)(profileId, runId);
      setEntries(prev => ({
        ...prev,
        [runId]: Array.isArray(list) ? list : []
      }));
    }
  }
  async function handleClear() {
    if (!window.confirm('Clear all activity logs for this profile?\nThis cannot be undone.')) return;
    await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.clearLogs)(profileId);
    setRuns([]);
    setEntries({});
    setExpandedId(null);
  }
  const filtered = filter === 'all' ? runs : runs.filter(r => r.actionType === filter);
  const filterLabel = FILTERS.find(f => f.key === filter)?.label.toLowerCase() || '';
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-activity-log"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-activity-log__header"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "sgd-activity-log__title"
  }, "Activity log"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-activity-log__header-actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: loadRuns
  }, "\u21BA Refresh"), runs.length > 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: handleClear
  }, "Clear"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-activity-filter"
  }, FILTERS.map(({
    key,
    label
  }) => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    key: key,
    type: "button",
    className: `sgd-activity-filter__pill${filter === key ? ' sgd-activity-filter__pill--active' : ''}`,
    onClick: () => setFilter(key)
  }, label))), loading ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-activity-log__loading"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-spinner"
  }), " Loading activity\u2026") : filtered.length === 0 ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-empty"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, filter === 'all' ? 'No activity yet.' : `No ${filterLabel} runs recorded yet.`), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Deploy runs and connection tests will appear here.")) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-activity-log__list"
  }, filtered.map(run => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(RunCard, {
    key: run.runId,
    run: run,
    entries: entries[run.runId],
    expanded: expandedId === run.runId,
    onToggle: () => handleToggle(run.runId)
  }))));
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



// Which profile id has the delete confirmation open
const MODE_IDLE = 'idle';
const MODE_TESTING = 'testing';
const MODE_DONE = 'done';
function DeployModePill({
  mode
}) {
  const label = mode === 'full' ? 'Full deploy' : mode === 'db' ? 'DB only' : 'Code only';
  const background = mode === 'full' ? '#fff3cd' : mode === 'db' ? '#f8d7da' : '#cce5ff';
  const color = mode === 'full' ? '#856404' : mode === 'db' ? '#721c24' : '#004085';
  const style = {
    display: 'inline-block',
    padding: '1px 8px',
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 700,
    background,
    color
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    style: style
  }, label);
}
function ProfileCard({
  profile,
  onSelect,
  onDeploy,
  onDeleted
}) {
  const [deleteOpen, setDeleteOpen] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [deleting, setDeleting] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [testMode, setTestMode] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(MODE_IDLE); // idle|testing|done
  const [testResult, setTestResult] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // { success, error? }

  const defaultMode = profile.deployMode?.defaultMode || 'code';
  async function handleDelete(e) {
    e.stopPropagation();
    setDeleting(true);
    await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.deleteProfile)(profile.id);
    onDeleted(profile.id);
  }
  async function handleTest(e) {
    e.stopPropagation();
    setTestMode(MODE_TESTING);
    setTestResult(null);
    const result = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.testSSHConnection)(profile.id);
    setTestResult(result);
    setTestMode(MODE_DONE);
  }
  function stopProp(e) {
    e.stopPropagation();
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card",
    onClick: () => onSelect(profile.id)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card__header"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card__title-row"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-profile-card__name"
  }, profile.name), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(DeployModePill, {
    mode: defaultMode
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card__meta"
  }, profile.lastDeployedAt ? `Last deployed ${new Date(profile.lastDeployedAt).toLocaleString()}` : 'Never deployed')), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card__info"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card__info-row"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-profile-card__info-label"
  }, "Host"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", {
    className: "sgd-profile-card__info-val"
  }, profile.sshHost, ":", profile.sshPort || 18765)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card__info-row"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-profile-card__info-label"
  }, "User"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", {
    className: "sgd-profile-card__info-val"
  }, profile.sshUser)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card__info-row"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-profile-card__info-label"
  }, "Domain"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-profile-card__info-val"
  }, profile.productionDomain))), testMode === MODE_TESTING && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card__test-result sgd-profile-card__test-result--working",
    onClick: stopProp
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-spinner sgd-spinner--sm"
  }), "Testing SSH connection\u2026"), testMode === MODE_DONE && testResult && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: `sgd-profile-card__test-result ${testResult.success ? 'sgd-profile-card__test-result--ok' : 'sgd-profile-card__test-result--fail'}`,
    onClick: stopProp
  }, testResult.success ? `✓ Connected — ${testResult.data?.output || 'SSH OK'}` : `✗ ${testResult.error}`), deleteOpen && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card__confirm",
    onClick: stopProp
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, "Delete ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, profile.name), "? This cannot be undone."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card__confirm-actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--danger sgd-btn--sm",
    onClick: handleDelete,
    disabled: deleting
  }, deleting ? 'Deleting…' : 'Yes, delete'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: e => {
      e.stopPropagation();
      setDeleteOpen(false);
    },
    disabled: deleting
  }, "Cancel"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-profile-card__actions",
    onClick: stopProp
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary sgd-btn--sm",
    onClick: e => {
      e.stopPropagation();
      onDeploy(profile.id, defaultMode);
    }
  }, "Deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: handleTest,
    disabled: testMode === MODE_TESTING
  }, testMode === MODE_TESTING ? 'Testing…' : 'Test SSH'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: e => {
      e.stopPropagation();
      onSelect(profile.id);
    }
  }, "Edit"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--danger sgd-btn--sm",
    onClick: e => {
      e.stopPropagation();
      setDeleteOpen(true);
      setTestMode(MODE_IDLE);
    }
  }, "Delete")));
}
function Dashboard({
  site,
  onNewProfile,
  onSelectProfile,
  onDeploy,
  onSettings
}) {
  const [profiles, setProfiles] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [loadErr, setLoadErr] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const load = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setLoading(true);
    setLoadErr(null);
    (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.listProfiles)().then(result => {
      if (result.success === false) throw new Error(result.error || 'Failed to load profiles.');
      setProfiles(result.data || result);
    }).catch(err => setLoadErr(err.message)).finally(() => setLoading(false));
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    load();
  }, [load]);
  const handleDeleted = id => setProfiles(prev => prev.filter(p => p.id !== id));
  const handleDeploy = onDeploy ? onDeploy : profileId => onSelectProfile(profileId); // fallback — detail view has a deploy button

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-page-header"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "sgd-page-header__title"
  }, "Deployment profiles"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: onNewProfile
  }, "+ New profile")), loading && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-loading-rows"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-loading-row"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-loading-row"
  })), !loading && loadErr && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Could not load profiles:"), " ", loadErr, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    style: {
      marginLeft: 12
    },
    onClick: load
  }, "Retry")), !loading && !loadErr && profiles.length === 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-empty"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-empty__icon"
  }, "\uD83D\uDE80"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "No profiles yet"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "A profile holds the SSH credentials and settings for one SiteGround server. Create one to start deploying."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: onNewProfile,
    style: {
      marginTop: 14
    }
  }, "Create first profile")), !loading && !loadErr && profiles.map(profile => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(ProfileCard, {
    key: profile.id,
    profile: profile,
    onSelect: onSelectProfile,
    onDeploy: handleDeploy,
    onDeleted: handleDeleted
  })));
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



// ─── Constants ────────────────────────────────────────────────────────────────

const CODE_DIRS = [{
  key: 'themes',
  warning: null
}, {
  key: 'plugins',
  warning: null
}, {
  key: 'mu-plugins',
  warning: null
}, {
  key: 'uploads',
  warning: 'uploads can be very large \u2014 this may take a long time'
}];
const DEFAULT_SELECTED_PATHS = ['themes', 'plugins'];
const LEVEL_CLASS = {
  info: 'sgd-log__line--info',
  success: 'sgd-log__line--success',
  warning: 'sgd-log__line--warning',
  error: 'sgd-log__line--error'
};
// ─── Direction toggle ────────────────────────────────────────────────────────────

function DirectionToggle({
  direction,
  onChange
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-direction-toggle"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    type: "button",
    className: `sgd-direction-toggle__btn${direction === 'push' ? ' sgd-direction-toggle__btn--active' : ''}`,
    onClick: () => onChange('push')
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-direction-toggle__arrow"
  }, "\u2191"), " Push to server"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    type: "button",
    className: `sgd-direction-toggle__btn${direction === 'pull' ? ' sgd-direction-toggle__btn--active sgd-direction-toggle__btn--pull' : ''}`,
    onClick: () => onChange('pull')
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-direction-toggle__arrow"
  }, "\u2193"), " Pull from server"));
}

// ─── Pull danger zone ──────────────────────────────────────────────────────────────

function PullDangerZone({
  confirmed,
  onConfirmChange,
  mode,
  productionDomain
}) {
  const isDb = mode === 'db';
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-danger-zone"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-danger-zone__header"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-danger-zone__icon"
  }, "\u26A0"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", {
    className: "sgd-deploy-danger-zone__title"
  }, isDb ? 'Database pull — read carefully before proceeding' : 'Code pull — read carefully before proceeding')), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-danger-zone__body"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-deploy-danger-zone__lead"
  }, isDb ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, "This will ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "overwrite your local database"), " with the one from the production server.\xA0 Your local database URL will be swapped back to your local domain automatically.") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, "This will ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "overwrite your local wp-content folders"), " with files from the production server.\xA0 Your current local files will be backed up first.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("ul", {
    className: "sgd-deploy-danger-zone__list"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-dz-bullet sgd-dz-bullet--safe"
  }, "\uD83D\uDEE1"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, isDb ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Your local database will be backed up"), " to ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, "wp-content/sgd-backups/local/"), " before it is overwritten.") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Your local files will be backed up"), " to ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, "wp-content/sgd-backups/local/"), " before they are overwritten."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-dz-bullet sgd-dz-bullet--danger"
  }, "\u2715"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, isDb ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, "Your ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "local database"), " will be replaced with the production database from ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, productionDomain || 'the server'), ". ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Uncommitted local DB changes will be lost.")) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, "Your ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "local theme and plugin files"), " will be replaced. ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Uncommitted local code changes will be overwritten."), "  Make sure you have committed or stashed your work.")))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    className: "sgd-deploy-danger-zone__confirm"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: confirmed,
    onChange: e => onConfirmChange(e.target.checked),
    className: "sgd-deploy-danger-zone__checkbox"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, isDb ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, "I understand my local database will be backed up then overwritten from ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, productionDomain || 'production'), ".") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, "I understand my local files will be backed up then overwritten from ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, productionDomain || 'production'), ".")))));
}
// ─── Mode selector ────────────────────────────────────────────────────────────

// SVG cylinder icon — reliable cross-platform substitute for the emoji
function DbIcon({
  size = 18
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 18 18",
    fill: "currentColor",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
    style: {
      display: 'inline-block',
      verticalAlign: 'middle'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("ellipse", {
    cx: "9",
    cy: "4.5",
    rx: "6.5",
    ry: "2.2"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("path", {
    d: "M2.5 4.5v9c0 1.21 2.91 2.2 6.5 2.2s6.5-.99 6.5-2.2v-9c0 1.21-2.91 2.2-6.5 2.2s-6.5-.99-6.5-2.2z"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("ellipse", {
    cx: "9",
    cy: "9",
    rx: "6.5",
    ry: "2.2",
    opacity: "0.3"
  }));
}
function ModeTabs({
  mode,
  onChange
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-mode-tabs"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    type: "button",
    className: `sgd-deploy-mode-tab${mode === 'code' ? ' sgd-deploy-mode-tab--active' : ''}`,
    onClick: () => onChange('code')
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-mode-tab__icon"
  }, "\uD83D\uDCE6"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-mode-tab__text"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Code-only"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("small", null, "Selected wp-content directories"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    type: "button",
    className: `sgd-deploy-mode-tab${mode === 'full' ? ' sgd-deploy-mode-tab--active sgd-deploy-mode-tab--full-active' : ''}`,
    onClick: () => onChange('full')
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-mode-tab__icon"
  }, "\u26A1"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-mode-tab__text"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Full deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("small", null, "Entire wp-content + database"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    type: "button",
    className: `sgd-deploy-mode-tab${mode === 'db' ? ' sgd-deploy-mode-tab--active sgd-deploy-mode-tab--full-active' : ''}`,
    onClick: () => onChange('db')
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-mode-tab__icon"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(DbIcon, null)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-mode-tab__text"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Database only"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("small", null, "Export local DB \u2192 overwrite remote"))));
}

// ─── Deploy summary card ──────────────────────────────────────────────────────

function SummaryCard({
  preflight,
  mode,
  selectedPaths
}) {
  const modeLabel = mode === 'full' ? 'Full deploy \u2014 entire wp-content + database' : mode === 'db' ? 'Database only \u2014 export local DB \u2192 overwrite remote' : selectedPaths.length > 0 ? `Code-only \u2014 ${selectedPaths.join(', ')}` : 'Code-only \u2014 (none selected)';
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card sgd-deploy-summary-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", {
    className: "sgd-deploy-info-card__title"
  }, "Deploy summary"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-summary-rows"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SummaryRow, {
    label: "Profile",
    value: preflight.profileName
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SummaryRow, {
    label: "Host",
    value: preflight.sshHost
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SummaryRow, {
    label: "Remote path",
    value: preflight.remoteWebRoot,
    mono: true
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SummaryRow, {
    label: "Domain",
    value: preflight.productionDomain || '—'
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SummaryRow, {
    label: "Mode",
    value: modeLabel,
    highlight: mode === 'full' ? 'danger' : null
  })));
}
function SummaryRow({
  label,
  value,
  mono,
  highlight
}) {
  const cls = ['sgd-deploy-summary-value', mono ? 'sgd-deploy-summary-value--mono' : '', highlight === 'danger' ? 'sgd-deploy-summary-value--danger' : ''].filter(Boolean).join(' ');
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-summary-row"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-summary-label"
  }, label), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: cls
  }, value));
}

// ─── Path row (local source card) ────────────────────────────────────────────

function PathRow({
  label,
  value,
  ok
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-path-row"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-path-label"
  }, label), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: `sgd-deploy-path-value${ok === false ? ' sgd-deploy-path-value--error' : ''}`,
    title: value || ''
  }, value || /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("em", {
    className: "sgd-muted"
  }, "not found")), ok === false && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-path-badge sgd-deploy-path-badge--error"
  }, "missing"), ok === true && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-path-badge sgd-deploy-path-badge--ok"
  }, "found"));
}

// ─── Indeterminate checkbox ───────────────────────────────────────────────────

function IndeterminateCheckbox({
  checked,
  indeterminate,
  className,
  onChange,
  disabled
}) {
  const ref = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate && !checked);
  }, [indeterminate, checked]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    ref: ref,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    className: className
  });
}

// ─── Directory tree picker (code-only) ───────────────────────────────────────

function DirTreePicker({
  profileId,
  preflight,
  selectedPaths,
  onChange,
  disabled
}) {
  const [expanded, setExpanded] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});
  const [dirContents, setDirContents] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});
  const knownKeys = CODE_DIRS.map(d => d.key);
  const existingAll = preflight.wpContentDirs || [];
  const knownExist = knownKeys.filter(k => existingAll.includes(k));
  const extras = existingAll.filter(d => !knownKeys.includes(d));
  const topDirs = [...knownExist, ...extras];
  const isDirFullySelected = dir => selectedPaths.includes(dir);
  const isDirPartiallySelected = dir => !selectedPaths.includes(dir) && selectedPaths.some(p => p.startsWith(dir + '/'));
  const isChildSelected = childPath => {
    const parent = childPath.split('/')[0];
    return selectedPaths.includes(parent) || selectedPaths.includes(childPath);
  };
  function toggleDir(dir) {
    if (isDirFullySelected(dir)) {
      onChange(selectedPaths.filter(p => p !== dir));
    } else {
      onChange([...selectedPaths.filter(p => !p.startsWith(dir + '/')), dir]);
    }
  }
  function toggleChild(childPath) {
    const parent = childPath.split('/')[0];
    if (isDirFullySelected(parent)) {
      const siblings = (dirContents[parent] || []).filter(e => e.isDir).map(e => `${parent}/${e.name}`).filter(p => p !== childPath);
      onChange([...selectedPaths.filter(p => p !== parent), ...siblings]);
    } else if (selectedPaths.includes(childPath)) {
      onChange(selectedPaths.filter(p => p !== childPath));
    } else {
      onChange([...selectedPaths, childPath]);
    }
  }
  async function toggleExpand(dir) {
    const nowExpanded = !expanded[dir];
    setExpanded(prev => ({
      ...prev,
      [dir]: nowExpanded
    }));
    if (nowExpanded && !dirContents[dir]) {
      setLoading(prev => ({
        ...prev,
        [dir]: true
      }));
      const res = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.listLocalDir)(profileId, dir);
      setLoading(prev => ({
        ...prev,
        [dir]: false
      }));
      if (res.success) setDirContents(prev => ({
        ...prev,
        [dir]: res.data
      }));
    }
  }
  const knownMeta = Object.fromEntries(CODE_DIRS.map(d => [d.key, d]));
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-dir-tree"
  }, topDirs.map(dir => {
    const meta = knownMeta[dir];
    const isExpanded = Boolean(expanded[dir]);
    const isFullSel = isDirFullySelected(dir);
    const isPartSel = isDirPartiallySelected(dir);
    const isLoading = Boolean(loading[dir]);
    const children = dirContents[dir] || [];
    const localInfo = preflight.targets?.find(t => t.target === dir);
    const localMissing = localInfo ? localInfo.localExists === false : false;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      key: dir,
      className: "sgd-dir-tree__row"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: `sgd-dir-tree__item${disabled ? ' sgd-dir-tree__item--disabled' : ''}`
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(IndeterminateCheckbox, {
      className: "sgd-deploy-target__checkbox",
      checked: isFullSel,
      indeterminate: isPartSel,
      disabled: disabled,
      onChange: () => toggleDir(dir)
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      type: "button",
      className: `sgd-dir-tree__expand${isExpanded ? ' sgd-dir-tree__expand--open' : ''}`,
      onClick: () => toggleExpand(dir),
      title: isExpanded ? 'Collapse' : 'Expand to pick specific items'
    }, isLoading ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "sgd-spinner sgd-spinner--xs"
    }) : '›'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "sgd-deploy-target__name"
    }, dir), localMissing && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "sgd-deploy-target__badge sgd-deploy-target__badge--missing"
    }, "not found locally"), meta?.warning && !localMissing && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "sgd-deploy-target__badge sgd-deploy-target__badge--warn"
    }, "\u26A0 ", meta.warning)), isExpanded && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-dir-tree__children"
    }, children.length === 0 && !isLoading && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "sgd-dir-tree__empty"
    }, "empty"), children.map(child => {
      const childPath = `${dir}/${child.name}`;
      const childSel = isChildSelected(childPath);
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
        key: child.name,
        className: `sgd-dir-tree__child${disabled ? ' sgd-dir-tree__item--disabled' : ''}`
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
        type: "checkbox",
        className: "sgd-deploy-target__checkbox",
        checked: childSel,
        disabled: disabled || !child.isDir,
        onChange: () => child.isDir && toggleChild(childPath)
      }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
        className: `sgd-dir-tree__child-icon${child.isDir ? '' : ' sgd-dir-tree__child-icon--file'}`
      }, child.isDir ? '📁' : '📄'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
        className: "sgd-deploy-target__name"
      }, child.name), !child.isDir && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
        className: "sgd-dir-tree__child-hint"
      }, "deploy the parent folder to include files"));
    }), isFullSel && children.length > 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
      className: "sgd-dir-tree__full-hint"
    }, "Entire ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, dir, "/"), " selected. Uncheck above or click a sub-folder to narrow the selection.")));
  }));
}

// ─── Full deploy exclusion list ─────────────────────────────────────────────

// Directories the addon always excludes regardless of user choice
const ALWAYS_EXCLUDED = ['sgd-db-backups'];

// Directories pre-checked as excluded by default (if they exist on the remote)
const DEFAULT_EXCLUDED = ['backups-dup-lite', 'updraft'];
function ArchiveFormatPicker({
  value,
  onChange
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card sgd-deploy-format-picker"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", {
    className: "sgd-deploy-format-picker__title"
  }, "Archive format"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-deploy-format-picker__hint"
  }, "Archive size is shown in the deploy log after it creates."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-format-picker__options"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    className: `sgd-deploy-format-picker__option${value === 'tar' ? ' sgd-deploy-format-picker__option--active' : ''}`
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "radio",
    name: "archiveFormat",
    value: "tar",
    checked: value === 'tar',
    onChange: () => onChange('tar')
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-format-picker__option-body"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "TAR"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-format-picker__desc"
  }, "No compression \u2014 fastest, ideal for large uploads folders"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    className: `sgd-deploy-format-picker__option${value === 'zip' ? ' sgd-deploy-format-picker__option--active' : ''}`
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "radio",
    name: "archiveFormat",
    value: "zip",
    checked: value === 'zip',
    onChange: () => onChange('zip')
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-format-picker__option-body"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "ZIP"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-format-picker__desc"
  }, "Compressed \u2014 smaller upload, slower to create")))));
}
function ExcludeDirectories({
  dirs,
  excluded,
  onChange
}) {
  // Dirs the user can actually toggle (hide the always-excluded ones)
  const toggleable = dirs.filter(d => !ALWAYS_EXCLUDED.includes(d));
  function toggle(dir) {
    onChange(excluded.includes(dir) ? excluded.filter(d => d !== dir) : [...excluded, dir]);
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-exclude"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h4", {
    className: "sgd-deploy-exclude__title"
  }, "Exclude directories from this deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-deploy-exclude__hint"
  }, "Checked directories will be ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "skipped"), " \u2014 they won't be zipped or uploaded. Useful for large folders like uploads that haven't changed."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-exclude__list"
  }, toggleable.map(dir => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    key: dir,
    className: "sgd-deploy-exclude__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: excluded.includes(dir),
    onChange: () => toggle(dir),
    className: "sgd-deploy-exclude__checkbox"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-exclude__name"
  }, dir), dir === 'uploads' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-target__badge sgd-deploy-target__badge--warn"
  }, "\u26A0 usually large")))), excluded.length > 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-deploy-exclude__summary"
  }, "Skipping: ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, excluded.join(', '))));
}

// ─── Full deploy danger zone ──────────────────────────────────────────────────

function FullDeployDangerZone({
  dbConfirmed,
  onConfirmChange,
  productionDomain,
  mode = 'full'
}) {
  const isDbOnly = mode === 'db';
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-danger-zone"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-danger-zone__header"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-danger-zone__icon"
  }, "\u26A0"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", {
    className: "sgd-deploy-danger-zone__title"
  }, isDbOnly ? 'Database deploy — read carefully before proceeding' : 'Full deploy — read carefully before proceeding')), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-danger-zone__body"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-deploy-danger-zone__lead"
  }, isDbOnly ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, "Database deploy overwrites the ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "production database"), " from your Local site. No files are changed.") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, "Full deploy syncs the ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "entire wp-content directory"), " from your Local site to the production server, then overwrites the remote database.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("ul", {
    className: "sgd-deploy-danger-zone__list"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-dz-bullet sgd-dz-bullet--safe"
  }, "\uD83D\uDEE1"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, "A ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "database backup"), " is created on the remote server", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("em", null, "before"), " any changes are made. Its path is shown in the activity log.")), !isDbOnly && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-dz-bullet sgd-dz-bullet--warn"
  }, "\u2699"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "All subdirectories"), " in wp-content (themes, plugins, uploads, and any others) are synced. Files present remotely but not locally will be", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "deleted"), ".")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-dz-bullet sgd-dz-bullet--danger"
  }, "\u2715"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, "The ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "production database"), productionDomain ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, " at ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, " ", productionDomain)) : null, " will be overwritten.", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "This cannot be automatically undone."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("li", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-dz-bullet sgd-dz-bullet--info"
  }, "\u2139"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, "Your local database will be exported and imported automatically via WP-CLI on the remote server. The Activity Log will record each step."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    className: "sgd-deploy-danger-zone__confirm"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: dbConfirmed,
    onChange: e => onConfirmChange(e.target.checked),
    className: "sgd-deploy-danger-zone__checkbox"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, isDbOnly ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, "I have read the above. I understand the production database at", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, productionDomain || 'production'), " will be overwritten. I have confirmed the correct profile is selected.") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, "I have read the above. I understand the entire wp-content will be synced and the production database at", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, productionDomain || 'production'), " will be overwritten. I have confirmed the correct profile is selected.")))));
}

// ─── Activity log ─────────────────────────────────────────────────────────────

function LogView({
  entries,
  logRef
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-log sgd-log--deploy",
    ref: logRef
  }, entries.length === 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-log__line--info"
  }, "Initializing deploy\u2026"), entries.map((e, i) => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    key: i,
    className: LEVEL_CLASS[e.level] || 'sgd-log__line--info'
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-log__ts"
  }, new Date(e.timestamp).toLocaleTimeString()), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-log__msg"
  }, e.message))));
}

// ─── Main component ───────────────────────────────────────────────────────────

function DeployScreen({
  profileId,
  defaultMode,
  onViewLogs,
  onBack
}) {
  // Preflight state
  const [preflight, setPreflight] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [preflightLoading, setPreflightLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [preflightError, setPreflightError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);

  // Config state
  const [direction, setDirection] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('push'); // 'push' | 'pull'
  const [mode, setMode] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(defaultMode === 'full' ? 'full' : defaultMode === 'db' ? 'db' : 'code');
  const [selectedPaths, setSelectedPaths] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([...DEFAULT_SELECTED_PATHS]);
  const [dbConfirmed, setDbConfirmed] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [excludeDirs, setExcludeDirs] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]); // dirs to skip in full deploy
  const [archiveFormat, setArchiveFormat] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('zip'); // 'zip' | 'tar'

  // Deploy flow state
  const [phase, setPhase] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('config'); // 'config'|'deploying'|'done'
  const [running, setRunning] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [result, setResult] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [logEntries, setLogEntries] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const logRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);

  // ── Load preflight info ──────────────────────────────────────────────────────
  const loadPreflight = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setPreflightLoading(true);
    setPreflightError(null);
    (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.deployPreflight)(profileId, CODE_DIRS.map(t => t.key)).then(res => {
      if (res.success) {
        setPreflight(res.data);
        // Apply the resolved confirm-default (global setting OR per-profile override)
        setDbConfirmed(Boolean(res.data.resolvedConfirmDefault));
        // Pre-check any default-excluded folders that actually exist on the remote
        const dirs = res.data.wpContentDirs || [];
        setExcludeDirs(prev => {
          const toAdd = DEFAULT_EXCLUDED.filter(d => dirs.includes(d) && !prev.includes(d));
          return toAdd.length ? [...prev, ...toAdd] : prev;
        });
      } else {
        setPreflightError(res.error);
      }
      setPreflightLoading(false);
    });
  }, [profileId]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    loadPreflight();
  }, [loadPreflight]);

  // ── Subscribe to streaming log entries ───────────────────────────────────────
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const unsub = (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.onLogEntry)(entry => setLogEntries(prev => [...prev, entry]));
    return unsub;
  }, []);

  // ── Auto-scroll log ──────────────────────────────────────────────────────────
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logEntries]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handleModeChange(m) {
    setMode(m);
    setDbConfirmed(preflight ? Boolean(preflight.resolvedConfirmDefault) : false);
    setExcludeDirs([]);
    setArchiveFormat('zip');
  }
  function handleDirectionChange(d) {
    setDirection(d);
    setDbConfirmed(false);
    setMode(d === 'pull' ? 'code' : defaultMode === 'full' ? 'full' : defaultMode === 'db' ? 'db' : 'code');
    setSelectedPaths([...DEFAULT_SELECTED_PATHS]);
  }
  async function handleDeploy() {
    setRunning(true);
    setResult(null);
    setLogEntries([]);
    setPhase('deploying');
    let res;
    if (direction === 'pull') {
      res = mode === 'db' ? await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.runDbPull)(profileId, {
        confirmed: true
      }) : await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.runCodePull)(profileId, {
        targets: selectedPaths
      });
    } else {
      res = mode === 'full' ? await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.runFullDeploy)(profileId, {
        confirmed: true,
        excludeDirs,
        format: archiveFormat
      }) : mode === 'db' ? await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.runDbDeploy)(profileId, {
        confirmed: true
      }) : await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.runCodeDeploy)(profileId, {
        paths: selectedPaths,
        format: archiveFormat
      });
    }
    setResult(res);
    setRunning(false);
    setPhase('done');
  }
  function handleStop() {
    (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.cancelDeploy)(profileId);
  }
  function handleDeployAgain() {
    setPhase('config');
    setResult(null);
    setLogEntries([]);
    setDirection('push');
    setDbConfirmed(preflight ? Boolean(preflight.resolvedConfirmDefault) : false);
    setSelectedPaths([...DEFAULT_SELECTED_PATHS]);
    setArchiveFormat('zip');
    loadPreflight();
  }

  // ── Can the deploy button be pressed? ────────────────────────────────────────
  const canDeploy = Boolean(!running && !preflightLoading && preflight && (direction === 'pull' || mode === 'db' || preflight.wpContentReachable) && (direction === 'pull' ? dbConfirmed && (mode === 'db' || selectedPaths.length > 0) : mode === 'full' ? dbConfirmed : mode === 'db' ? dbConfirmed : selectedPaths.length > 0));

  // ── Header ─────────────────────────────────────────────────────────────────
  function renderHeader(subtitle) {
    const name = preflight ? preflight.profileName : '…';
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-deploy-header"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
      onClick: onBack
    }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
      className: "sgd-deploy-title"
    }, "Deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
      className: "sgd-deploy-subtitle"
    }, name, subtitle ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "sgd-deploy-subtitle__status"
    }, " \u2014 ", subtitle) : null)));
  }

  // ── Phase: deploying / done ──────────────────────────────────────────────────
  if (phase === 'deploying' || phase === 'done') {
    const isCancelled = !running && result?.error === 'Deploy cancelled';
    const resultLabel = running ? 'deploying…' : isCancelled ? 'cancelled' : result?.success ? 'complete' : 'failed';
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-deploy-screen"
    }, renderHeader(resultLabel), result && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: `sgd-alert ${result.success ? 'sgd-alert--success' : isCancelled ? 'sgd-alert--warning' : 'sgd-alert--danger'}`
    }, result.success ? direction === 'pull' ? mode === 'db' ? 'Database pull complete — local database updated from server.' : `Code pull complete — pulled: ${(result.data?.targets || []).join(', ')}` : mode === 'full' ? `Full deploy complete — ${(result.data?.synced || []).length} directories synced.` : mode === 'db' ? 'Database deploy complete — remote database overwritten.' : `Code deploy complete — synced: ${(result.data?.targets || []).join(', ')}` : isCancelled ? `${direction === 'pull' ? 'Pull' : 'Deploy'} cancelled. Your site was not changed.` : `${direction === 'pull' ? 'Pull' : 'Deploy'} failed: ${result.error}`), running && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-deploy-stop-bar"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      className: "sgd-btn sgd-btn--danger sgd-btn--sm",
      onClick: handleStop
    }, "\u25A0 Stop ", direction === 'pull' ? 'pull' : 'deploy')), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(LogView, {
      entries: logEntries,
      logRef: logRef
    }), phase === 'done' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-deploy-actions sgd-deploy-actions--done"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      className: "sgd-btn sgd-btn--primary",
      onClick: handleDeployAgain
    }, "\u2190 Configure another deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      className: "sgd-btn sgd-btn--ghost",
      onClick: () => onViewLogs(profileId)
    }, "View log history")));
  }

  // ── Phase: config ────────────────────────────────────────────────────────────
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-screen"
  }, renderHeader(), preflightLoading && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-loading"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-spinner"
  }), " Loading site info\u2026"), preflightError && !preflightLoading && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger"
  }, "Could not load profile info: ", preflightError), preflight && !preflightLoading && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(DirectionToggle, {
    direction: direction,
    onChange: handleDirectionChange
  }), direction === 'push' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(ModeTabs, {
    mode: mode,
    onChange: handleModeChange
  }) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-mode-tabs"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    type: "button",
    className: `sgd-deploy-mode-tab${mode === 'code' ? ' sgd-deploy-mode-tab--active' : ''}`,
    onClick: () => handleModeChange('code')
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-mode-tab__icon"
  }, "\uD83D\uDCE6"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-mode-tab__text"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Code-only"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("small", null, "Pull selected wp-content folders"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    type: "button",
    className: `sgd-deploy-mode-tab${mode === 'db' ? ' sgd-deploy-mode-tab--active sgd-deploy-mode-tab--full-active' : ''}`,
    onClick: () => handleModeChange('db')
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-mode-tab__icon"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(DbIcon, null)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-mode-tab__text"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Database only"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("small", null, "Pull remote DB \u2192 overwrite local")))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SummaryCard, {
    preflight: preflight,
    mode: mode,
    selectedPaths: mode === 'code' ? selectedPaths : ['entire wp-content']
  }), mode === 'code' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card sgd-deploy-targets-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", {
    className: "sgd-deploy-info-card__title"
  }, direction === 'pull' ? 'Directories to pull' : 'Directories to deploy'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "sgd-dir-tree__hint"
  }, direction === 'pull' ? 'Select folders to pull from the server. Your local copies will be backed up first.' : 'Check top-level folders to deploy the whole directory, or expand › to pick specific sub-folders.'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(DirTreePicker, {
    profileId: profileId,
    preflight: preflight,
    selectedPaths: selectedPaths,
    onChange: setSelectedPaths,
    disabled: direction === 'push' && !preflight.wpContentReachable
  })), direction === 'push' && mode === 'full' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(ExcludeDirectories, {
    dirs: preflight.wpContentDirs || [],
    excluded: excludeDirs,
    onChange: setExcludeDirs
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(FullDeployDangerZone, {
    dbConfirmed: dbConfirmed,
    onConfirmChange: setDbConfirmed,
    productionDomain: preflight.productionDomain
  })), direction === 'push' && mode === 'db' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(FullDeployDangerZone, {
    mode: "db",
    dbConfirmed: dbConfirmed,
    onConfirmChange: setDbConfirmed,
    productionDomain: preflight.productionDomain
  }), direction === 'pull' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(PullDangerZone, {
    mode: mode,
    confirmed: dbConfirmed,
    onConfirmChange: setDbConfirmed,
    productionDomain: preflight.productionDomain
  }), direction === 'push' && mode !== 'db' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(ArchiveFormatPicker, {
    value: archiveFormat,
    onChange: setArchiveFormat
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card sgd-deploy-info-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", {
    className: "sgd-deploy-info-card__title"
  }, "Local source"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(PathRow, {
    label: "Site",
    value: preflight.localSiteName || preflight.localSiteId,
    ok: preflight.localSiteId ? undefined : false
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(PathRow, {
    label: "wp-content",
    value: preflight.wpContentPath,
    ok: preflight.wpContentReachable
  })), direction === 'push' && !preflight.wpContentReachable && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger"
  }, "Local wp-content is not accessible. Make sure the Local site is running and the site path has not been moved."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-deploy-actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: `sgd-btn sgd-btn--lg ${direction === 'pull' ? 'sgd-btn--warning' : mode === 'full' || mode === 'db' ? 'sgd-btn--danger' : 'sgd-btn--primary'}`,
    onClick: handleDeploy,
    disabled: !canDeploy
  }, direction === 'pull' ? mode === 'db' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(DbIcon, {
    size: 15
  }), " Pull database") : '↓ Pull code' : mode === 'full' ? '⚡ Run full deploy' : mode === 'db' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(DbIcon, {
    size: 15
  }), " Deploy database") : '▶ Deploy code'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-deploy-actions__hint"
  }, direction === 'pull' ? !dbConfirmed ? 'Check the confirmation box above to enable pull.' : mode === 'db' ? 'Ready to pull database from server.' : selectedPaths.length === 0 ? 'Select at least one directory to pull.' : `Will pull: ${selectedPaths.join(', ')}` : mode === 'db' ? dbConfirmed ? 'Confirmation received. Ready to deploy database.' : 'Check the confirmation box above to enable deploy.' : !preflight.wpContentReachable ? 'Local wp-content is not accessible.' : mode === 'full' ? dbConfirmed ? 'Confirmation received. Ready to deploy.' : 'Check the confirmation box above to enable deploy.' : selectedPaths.length === 0 ? 'Select at least one directory to deploy.' : `Will sync: ${selectedPaths.join(', ')}`))));
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
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ipc */ "./src/renderer/ipc.js");
/* harmony import */ var _components_FormField__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/FormField */ "./src/renderer/components/FormField.jsx");
/* harmony import */ var _components_CopyableCode__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/CopyableCode */ "./src/renderer/components/CopyableCode.jsx");






// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionTitle({
  children
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", {
    className: "sgd-detail__section-title"
  }, children);
}
function InfoRow({
  label,
  value,
  mono
}) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__info-row"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-detail__info-label"
  }, label), mono ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", {
    className: "sgd-detail__info-val sgd-detail__info-val--mono"
  }, value) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-detail__info-val"
  }, value));
}

// ─── SSH test section ─────────────────────────────────────────────────────────

function SSHTestPanel({
  profileId
}) {
  const [status, setStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('idle'); // idle|testing|success|error
  const [result, setResult] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  async function run() {
    setStatus('testing');
    setResult(null);
    const res = await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.testSSHConnection)(profileId);
    setResult(res);
    setStatus(res.success ? 'success' : 'error');
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__ssh-test"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__ssh-test-header"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SectionTitle, null, "SSH connection"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: run,
    disabled: status === 'testing'
  }, status === 'testing' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-spinner sgd-spinner--sm",
    style: {
      marginRight: 6
    }
  }), "Testing\u2026") : status === 'idle' ? 'Test connection' : 'Test again')), status === 'testing' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__ssh-working"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-spinner sgd-spinner--sm"
  }), "Attempting SSH connection\u2026"), status === 'success' && result && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__ssh-ok"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__ssh-ok-banner"
  }, "\u2713 Connection successful"), result.data?.output && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-ssh-probe",
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-ssh-probe__label"
  }, "Server response (", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, "pwd && whoami"), ")"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("pre", {
    className: "sgd-ssh-probe__output"
  }, result.data.output))), status === 'error' && result && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger",
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Connection failed:"), " ", result.error));
}
function LocalMysqlRepairPanel({
  profile
}) {
  const [status, setStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('idle');
  const [result, setResult] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  async function runRepair() {
    if (!profile.localSiteId) return;
    setStatus('running');
    setResult(null);
    const res = await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.repairLocalSiteMysql)(profile.localSiteId);
    setResult(res);
    setStatus('idle');
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card sgd-card--compact"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SectionTitle, null, "Local MySQL repair"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 12,
      color: '#6c757d'
    }
  }, "Checks the linked Local site for a stale mysqld process on the wrong port and clears only that site's stale MySQL state.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: runRepair,
    disabled: !profile.localSiteId || status === 'running'
  }, status === 'running' ? 'Repairing…' : 'Repair Local MySQL')), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      marginTop: 10,
      fontSize: 12,
      color: '#6c757d'
    }
  }, "Linked Local site ID: ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, profile.localSiteId || 'Not linked')), !profile.localSiteId && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--warning",
    style: {
      marginTop: 10
    }
  }, "This profile is not linked to a Local site, so the repair action is unavailable."), result?.success && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--info",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, result.data.message), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      marginTop: 6
    }
  }, "Expected port: ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, result.data.expectedPort), result.data.stalePorts?.length > 0 ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, " \xB7 Cleared stale ports: ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, result.data.stalePorts.join(', '))) : null, result.data.killedPids?.length > 0 ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, " \xB7 Killed PIDs: ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, result.data.killedPids.join(', '))) : null)), result && result.success === false && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Repair failed:"), " ", result.error));
}

// ─── Remote backups cleanup ──────────────────────────────────────────────────

function RemoteBackupsPanel({
  profile
}) {
  const [status, setStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('idle');
  const [result, setResult] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  async function runDelete() {
    if (!profile.remoteWebRoot) return;
    if (!window.confirm('WARNING: This will permanently delete the entire sgd-db-backups directory on your remote server. Continue?')) return;
    setStatus('running');
    setResult(null);
    try {
      const res = await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.deleteRemoteBackups)(profile.id);
      setResult(res);
      setStatus(res.success ? 'done' : 'error');
    } catch (err) {
      setResult({
        success: false,
        error: err.message
      });
      setStatus('error');
    }
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "...",
    style: {
      borderTop: '1px solid #dee2e6',
      paddingTop: 16,
      marginTop: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SectionTitle, null, "Delete Remote DB Backups"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 12,
      color: '#6c757d'
    }
  }, "Permanently delete old backups kept in the sgd-db-backups folder on the remote server.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--danger sgd-btn--sm",
    onClick: runDelete,
    disabled: !profile.remoteWebRoot || status === 'running'
  }, status === 'running' ? 'Deleting…' : 'Delete all backups')), result?.success && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--success",
    style: {
      marginTop: 10,
      fontSize: 13,
      background: '#d4edda',
      color: '#155724',
      padding: '8px 12px',
      borderRadius: 4
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Backup folder deleted successfully.")), result && result.success === false && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Deletion failed:"), " ", result.error));
}

// ─── Clone panel ─────────────────────────────────────────────────────────────

function ClonePanel({
  profile,
  onCloned,
  onCancel
}) {
  const [fields, setFields] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
    name: `Copy of ${profile.name}`,
    remoteWebRoot: profile.remoteWebRoot || '',
    localSiteId: profile.localSiteId || ''
  });
  const [localSites, setLocalSites] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // null = loading
  const [errors, setErrors] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});
  const [saving, setSaving] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [saveErr, setSaveErr] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.getAllLocalSites)().then(sites => {
      // getAllSites returns a plain array (no wrapper object)
      setLocalSites(Array.isArray(sites) ? sites : sites?.data ?? []);
    }).catch(() => setLocalSites([]));
  }, []);
  function set(key, val) {
    setFields(f => ({
      ...f,
      [key]: val
    }));
    setErrors(e => ({
      ...e,
      [key]: undefined
    }));
  }
  async function handleSave() {
    setSaving(true);
    setSaveErr(null);
    setErrors({});
    const data = {
      name: fields.name.trim(),
      sshHost: profile.sshHost,
      sshPort: profile.sshPort,
      sshUser: profile.sshUser,
      remoteWebRoot: fields.remoteWebRoot.trim(),
      keyId: profile.keyId,
      localSiteId: fields.localSiteId || null,
      deployMode: profile.deployMode,
      confirmDefault: profile.confirmDefault !== undefined ? profile.confirmDefault : null
    };
    const res = await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.createProfile)(data);
    if (res.success === false) {
      if (res.errors) setErrors(res.errors);
      setSaveErr(res.error || 'Clone failed. Check the fields above.');
      setSaving(false);
      return;
    }
    onCloned((res.data || res).id);
  }
  const displayWebRoot = (() => {
    let v = fields.remoteWebRoot || '';
    if (v.startsWith('/home/customer/www/')) v = v.slice('/home/customer/www/'.length);
    if (v.endsWith('/public_html')) v = v.slice(0, v.length - '/public_html'.length);
    return v.replace(/\/$/, '');
  })();
  const siteOptions = localSites ? localSites.slice().sort((a, b) => a.name.localeCompare(b.name)) : [];
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__edit-form"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SectionTitle, null, "Clone profile"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      marginBottom: 16,
      fontSize: 13,
      color: '#6c757d'
    }
  }, "Creates a new profile that shares the same SSH credentials and key. Change the name, remote domain, and which Local site to link."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_3__["default"], {
    id: "cl-name",
    label: "New profile name",
    error: errors.name,
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    id: "cl-name",
    type: "text",
    value: fields.name,
    onChange: e => set('name', e.target.value),
    autoComplete: "off"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_3__["default"], {
    id: "cl-root",
    label: "Remote web root",
    error: errors.remoteWebRoot,
    hint: "The domain name of the new remote site",
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-input-with-prefix"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-input-prefix"
  }, "/home/customer/www/"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    id: "cl-root",
    type: "text",
    value: displayWebRoot,
    onChange: e => {
      const mid = e.target.value.replace(/\/$/, '');
      set('remoteWebRoot', mid ? '/home/customer/www/' + mid + '/public_html' : '/home/customer/www/');
    },
    placeholder: "newsite.com"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-input-suffix"
  }, "/public_html"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_3__["default"], {
    id: "cl-site",
    label: "Linked Local site",
    hint: "Which Local WP site deploys to this profile"
  }, localSites === null ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      fontSize: 13,
      color: '#6c757d'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-spinner sgd-spinner--sm",
    style: {
      marginRight: 6
    }
  }), "Loading sites\u2026") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("select", {
    id: "cl-site",
    value: fields.localSiteId,
    onChange: e => set('localSiteId', e.target.value)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
    value: ""
  }, "\u2014 None \u2014"), siteOptions.map(s => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
    key: s.id,
    value: s.id
  }, s.name, s.domain ? ` (${s.domain})` : '')))), saveErr && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger",
    style: {
      marginBottom: 12
    }
  }, saveErr), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__edit-actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: handleSave,
    disabled: saving || localSites === null
  }, saving ? 'Cloning…' : 'Create clone'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: onCancel,
    disabled: saving
  }, "Cancel")));
}

// ─── Delete confirmation panel ────────────────────────────────────────────────

function DeletePanel({
  profile,
  onDeleted,
  onCancel
}) {
  const [busy, setBusy] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [err, setErr] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  async function confirm() {
    setBusy(true);
    setErr(null);
    const res = await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.deleteProfile)(profile.id);
    if (res.success === false) {
      setErr(res.error || 'Delete failed.');
      setBusy(false);
    } else {
      onDeleted();
    }
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__delete-confirm"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Permanently delete ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, profile.name), "?", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("br", null), "The SSH key files stored on this machine will also be removed. This cannot be undone."), err && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger",
    style: {
      marginBottom: 10
    }
  }, err), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--danger sgd-btn--sm",
    onClick: confirm,
    disabled: busy
  }, busy ? 'Deleting…' : 'Yes, delete profile'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: onCancel,
    disabled: busy
  }, "Cancel")));
}

// ─── Edit form ────────────────────────────────────────────────────────────────

function EditForm({
  profile,
  onSaved,
  onCancel
}) {
  const [fields, setFields] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
    name: profile.name || '',
    sshHost: profile.sshHost || '',
    sshPort: String(profile.sshPort || 18765),
    sshUser: profile.sshUser || '',
    remoteWebRoot: profile.remoteWebRoot || '',
    productionDomain: profile.productionDomain || '',
    deployMode: profile.deployMode?.defaultMode || 'code',
    confirmDefault: profile.confirmDefault !== undefined ? profile.confirmDefault : null,
    deployIncludeGit: Boolean(profile.deployIncludeGit),
    deployIncludeVscode: Boolean(profile.deployIncludeVscode)
  });
  const [errors, setErrors] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});
  const [saving, setSaving] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [saveErr, setSaveErr] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  function set(key, val) {
    setFields(f => ({
      ...f,
      [key]: val
    }));
    setErrors(e => ({
      ...e,
      [key]: undefined
    }));
  }
  async function handleSave() {
    setSaving(true);
    setSaveErr(null);
    setErrors({});
    const patch = {
      name: fields.name.trim(),
      sshHost: fields.sshHost.trim(),
      sshPort: Number(fields.sshPort) || 18765,
      sshUser: fields.sshUser.trim(),
      remoteWebRoot: fields.remoteWebRoot.trim(),
      productionDomain: fields.productionDomain.trim(),
      deployMode: {
        defaultMode: fields.deployMode
      },
      confirmDefault: fields.confirmDefault,
      deployIncludeGit: fields.deployIncludeGit,
      deployIncludeVscode: fields.deployIncludeVscode
    };
    const res = await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.updateProfile)(profile.id, patch);
    if (res.success === false) {
      if (res.errors) setErrors(res.errors);
      setSaveErr(res.error || 'Save failed. Check the fields above.');
      setSaving(false);
      return;
    }
    onSaved(res.data || res);
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__edit-form"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SectionTitle, null, "Edit profile"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_3__["default"], {
    id: "pd-name",
    label: "Profile name",
    error: errors.name,
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    id: "pd-name",
    type: "text",
    value: fields.name,
    onChange: e => set('name', e.target.value),
    placeholder: "My SiteGround site",
    autoComplete: "off"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-form-row"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_3__["default"], {
    id: "pd-host",
    label: "SSH host",
    error: errors.sshHost,
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    id: "pd-host",
    type: "text",
    value: fields.sshHost,
    onChange: e => set('sshHost', e.target.value),
    placeholder: "ssh.yourdomain.com",
    autoComplete: "off"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_3__["default"], {
    id: "pd-port",
    label: "Port",
    error: errors.sshPort,
    style: {
      flex: '0 0 80px'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    id: "pd-port",
    type: "number",
    value: fields.sshPort,
    onChange: e => set('sshPort', e.target.value),
    style: {
      width: 80
    },
    min: 1,
    max: 65535
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_3__["default"], {
    id: "pd-user",
    label: "SSH username",
    error: errors.sshUser,
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    id: "pd-user",
    type: "text",
    value: fields.sshUser,
    onChange: e => set('sshUser', e.target.value),
    placeholder: "username",
    autoComplete: "off"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_3__["default"], {
    id: "pd-root",
    label: "Remote web root",
    error: errors.remoteWebRoot,
    hint: "Just enter your domain name, e.g. example.com",
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-input-with-prefix"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-input-prefix"
  }, "/home/customer/www/"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    id: "pd-root",
    type: "text",
    value: (() => {
      let v = fields.remoteWebRoot || '';
      if (v.startsWith('/home/customer/www/')) v = v.slice('/home/customer/www/'.length);
      if (v.endsWith('/public_html')) v = v.slice(0, v.length - '/public_html'.length);
      return v.replace(/\/$/, '');
    })(),
    onChange: e => {
      const mid = e.target.value.replace(/\/$/, '');
      set('remoteWebRoot', mid ? '/home/customer/www/' + mid + '/public_html' : '/home/customer/www/');
    },
    placeholder: "example.com"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-input-suffix"
  }, "/public_html"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_3__["default"], {
    id: "pd-mode",
    label: "Default deploy mode"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("select", {
    id: "pd-mode",
    value: fields.deployMode,
    onChange: e => set('deployMode', e.target.value)
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
    value: "code"
  }, "Code only \u2014 themes + plugins (safe)"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
    value: "full"
  }, "Full deploy \u2014 code + database (danger)"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
    value: "db"
  }, "Database only \u2014 overwrite remote DB (danger)"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_3__["default"], {
    id: "pd-confirm",
    label: "Confirmation checkbox default",
    hint: "Overrides the global addon setting for this profile only"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("select", {
    id: "pd-confirm",
    value: fields.confirmDefault === null ? 'inherit' : fields.confirmDefault ? 'checked' : 'unchecked',
    onChange: e => {
      const v = e.target.value;
      set('confirmDefault', v === 'inherit' ? null : v === 'checked');
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
    value: "inherit"
  }, "Inherit from global addon setting"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
    value: "checked"
  }, "Always pre-checked for this profile"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
    value: "unchecked"
  }, "Always unchecked for this profile"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_FormField__WEBPACK_IMPORTED_MODULE_3__["default"], {
    id: "pd-deploy-opts",
    label: "Deploy options",
    hint: "These folders are excluded from all deploys by default for safety"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    className: "sgd-checkbox-label",
    style: {
      marginBottom: 6
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: fields.deployIncludeGit,
    onChange: e => set('deployIncludeGit', e.target.checked)
  }), "Include ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, ".git"), " folder in deploys ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("em", null, "(not recommended)")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    className: "sgd-checkbox-label"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: fields.deployIncludeVscode,
    onChange: e => set('deployIncludeVscode', e.target.checked)
  }), "Include ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, ".vscode"), " folder in deploys ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("em", null, "(not recommended)"))), saveErr && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger",
    style: {
      marginBottom: 12
    }
  }, saveErr), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__edit-actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: handleSave,
    disabled: saving
  }, saving ? 'Saving…' : 'Save changes'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: onCancel,
    disabled: saving
  }, "Cancel")));
}

// ─── Regenerate SSH key panel ─────────────────────────────────────────────────
//
// Flow:
//   'keygen'    → auto-generates a NEW key pair on mount (spinner)
//   'addkey'    → shows public key + SiteGround instructions + confirmation checkbox
//   'testing'   → runs testSSHConnectionDirect with new keyId (spinner)
//   'done'      → rotation committed; shows success; user clicks Done to dismiss
//   'error'     → terminal failure (key gen or rotation failed); close only
//
// Old key safety:
//   The old key is NOT deleted until after the profile record is committed AND
//   the main process confirms no other profile (clone) shares that keyId.
//   If the user cancels at any point before 'done', the orphaned new key is deleted.

function RegenerateKeyPanel({
  profile,
  onComplete,
  onCancel
}) {
  // Generate a stable UUID for the new key once on mount
  const [newKeyId] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(() => (0,uuid__WEBPACK_IMPORTED_MODULE_1__["default"])());
  const [step, setStep] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('keygen'); // keygen|addkey|testing|done|error
  const [publicKey, setPublicKey] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [addConfirmed, setAddConfirmed] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [testStatus, setTestStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('idle'); // idle|testing|failed
  const [testError, setTestError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [testOutput, setTestOutput] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [rotatedProfile, setRotatedProfile] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [oldKeyDeleted, setOldKeyDeleted] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [errorMsg, setErrorMsg] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [committing, setCommitting] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);

  // Auto-start key generation on mount
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    (async () => {
      const result = await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.generateKey)(newKeyId);
      if (!result || result.success === false) {
        setErrorMsg(result?.error || 'Key generation failed.');
        setStep('error');
        return;
      }
      setPublicKey(result.data.publicKey);
      setStep('addkey');
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCancel() {
    // Clean up the orphaned new key if it was generated but never committed.
    if (step !== 'done') {
      try {
        await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.deleteKey)(newKeyId);
      } catch (_) {}
    }
    onCancel();
  }
  async function runTest() {
    setTestStatus('testing');
    setTestError(null);
    setTestOutput(null);
    let testResult;
    try {
      testResult = await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.testSSHConnectionDirect)({
        sshHost: profile.sshHost,
        sshPort: profile.sshPort,
        sshUser: profile.sshUser,
        keyId: newKeyId
      });
    } catch (err) {
      setTestStatus('failed');
      setTestError(err?.message || 'Unexpected error during connection test.');
      return;
    }
    if (!testResult.success) {
      setTestStatus('failed');
      setTestError(testResult.error || 'Connection refused or timed out.');
      return;
    }

    // Connection test passed — capture output and commit the rotation.
    setTestOutput(testResult.data?.output || null);
    setTestStatus('idle');
    setCommitting(true);
    const rotateResult = await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.rotateProfileKey)(profile.id, newKeyId);
    setCommitting(false);
    if (!rotateResult.success) {
      setErrorMsg(`Key rotation failed: ${rotateResult.error}`);
      setStep('error');
      return;
    }
    setRotatedProfile(rotateResult.data.profile);
    setOldKeyDeleted(rotateResult.data.oldKeyDeleted === true);
    setStep('done');
  }

  // ── Keygen spinner ────────────────────────────────────────────────────────
  if (step === 'keygen') {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-detail__edit-form"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SectionTitle, null, "Regenerate SSH key"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '20px 0',
        color: '#495057'
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      className: "sgd-spinner sgd-spinner--sm"
    }), "Generating new Ed25519 key pair\u2026"));
  }

  // ── Terminal error ────────────────────────────────────────────────────────
  if (step === 'error') {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-detail__edit-form"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SectionTitle, null, "Regenerate SSH key"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-alert sgd-alert--danger",
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Error:"), " ", errorMsg), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
      style: {
        fontSize: 13,
        color: '#6c757d',
        marginBottom: 16
      }
    }, "Your profile has not been changed. The old SSH key is still active."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      className: "sgd-btn sgd-btn--secondary",
      onClick: handleCancel
    }, "Close"));
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (step === 'done') {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-detail__edit-form"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SectionTitle, null, "Regenerate SSH key"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-alert sgd-alert--success",
      style: {
        marginBottom: 16
      }
    }, "\u2713 New SSH key is active and has been saved to your profile.", oldKeyDeleted ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, " The old key has been removed from this machine.") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, " The old key was kept because another profile (a clone) shares it.")), testOutput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-ssh-probe",
      style: {
        marginBottom: 16
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-ssh-probe__label"
    }, "Verified server response (", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, "pwd && whoami"), ")"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("pre", {
      className: "sgd-ssh-probe__output"
    }, testOutput)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      className: "sgd-btn sgd-btn--primary",
      onClick: () => onComplete(rotatedProfile)
    }, "Done"));
  }

  // ── Main flow: addkey (+ testing/committing overlay) ──────────────────────
  const busy = testStatus === 'testing' || committing;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__edit-form"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SectionTitle, null, "Regenerate SSH key"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--warning",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Your current SSH key is still active."), " It will only be deleted after the new key is verified and the profile is saved. You can cancel at any time with no impact to your existing setup."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      fontSize: 13,
      color: '#495057',
      marginBottom: 12
    }
  }, "A new key pair has been generated. Add the public key to SiteGround, then test the connection to confirm it works before we swap it in."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_CopyableCode__WEBPACK_IMPORTED_MODULE_4__["default"], {
    value: publicKey || '',
    label: "New public key \u2014 copy this entire value"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list",
    style: {
      marginTop: 16,
      marginBottom: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "1"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Open SiteGround Site Tools \u2192 Devs \u2192 SSH Keys Manager"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Select the ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Import"), " tab, enter a name (e.g. \"Local Deploy\"), and paste the key above into the ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Public Key"), " field."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "2"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Activate the key"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "After saving, confirm it shows as ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Active"), " in the list. An inactive key will be rejected."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "3"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Check the box below and test"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "The test uses the ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("em", null, "new"), " key \u2014 if it passes, the profile is updated and the old key is removed.")))), testStatus === 'failed' && testError && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--danger",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Connection failed:"), " ", testError, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      marginTop: 6,
      fontSize: 12
    }
  }, "Make sure the key is ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Active"), " in SiteGround's SSH Keys Manager, then try again.")), testOutput && testStatus !== 'failed' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-ssh-probe",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-ssh-probe__label"
  }, "Server response (", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, "pwd && whoami"), ")"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("pre", {
    className: "sgd-ssh-probe__output"
  }, testOutput)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    className: "sgd-checkbox-label",
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: addConfirmed,
    onChange: e => setAddConfirmed(e.target.checked),
    disabled: busy
  }), "I have added the new key to SiteGround and it is ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Active"), "."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: runTest,
    disabled: !addConfirmed || busy
  }, testStatus === 'testing' ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-spinner sgd-spinner--sm",
    style: {
      marginRight: 6
    }
  }), "Testing\u2026") : committing ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-spinner sgd-spinner--sm",
    style: {
      marginRight: 6
    }
  }), "Saving\u2026") : testStatus === 'failed' ? 'Test again' : '▶ Test & activate new key'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: handleCancel,
    disabled: busy
  }, "Cancel"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    style: {
      fontSize: 12,
      color: '#6c757d'
    }
  }, !addConfirmed ? 'Check the confirmation box above to enable the test.' : testStatus === 'failed' ? 'Check that the key is Active in SiteGround, then test again.' : 'Connection test verifies the new key works before committing the swap.')));
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function ProfileDetail({
  profileId,
  onDeploy,
  onViewLogs,
  onBack,
  onCloned
}) {
  const [profile, setProfile] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [loadErr, setLoadErr] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [mode, setMode] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('view'); // view | edit | delete | clone | regenkey
  const [siteName, setSiteName] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const load = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const result = await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.getProfile)(profileId);
      if (result.success === false) throw new Error(result.error || 'Profile not found.');
      const p = result.data || result;
      setProfile(p);
      if (p.localSiteId) {
        try {
          const siteRes = await (0,_ipc__WEBPACK_IMPORTED_MODULE_2__.getLocalSite)(p.localSiteId);
          const name = siteRes?.data?.name || siteRes?.name;
          if (name) setSiteName(name);
        } catch (_) {/* ignore — site name is cosmetic */}
      }
    } catch (err) {
      setLoadErr(err.message);
    } finally {
      setLoading(false);
    }
  }, [profileId]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    load();
  }, [load]);
  if (loading) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
      onClick: onBack,
      style: {
        marginBottom: 16
      }
    }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-loading-rows"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-loading-row"
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-loading-row"
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-loading-row"
    })));
  }
  if (loadErr) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
      onClick: onBack,
      style: {
        marginBottom: 16
      }
    }, "\u2190 Back"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
      className: "sgd-alert sgd-alert--danger"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Could not load profile:"), " ", loadErr, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
      className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
      style: {
        marginLeft: 12
      },
      onClick: load
    }, "Retry")));
  }
  const defaultMode = profile.deployMode?.defaultMode || 'code';
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__header"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__header-top"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: onBack
  }, "\u2190 Profiles"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__title-block"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h2", {
    className: "sgd-detail__title"
  }, profile.name), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-detail__subtitle"
  }, profile.remoteWebRoot))), mode === 'view' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__header-actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: () => setMode('edit')
  }, "Edit"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: () => setMode('clone')
  }, "Clone"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--ghost sgd-btn--sm",
    onClick: () => setMode('regenkey')
  }, "Regen key"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--danger sgd-btn--sm",
    onClick: () => setMode('delete')
  }, "Delete"))), mode === 'view' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card sgd-card--compact"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SectionTitle, null, "Connection"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InfoRow, {
    label: "SSH host",
    value: `${profile.sshHost}:${profile.sshPort || 18765}`,
    mono: true
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InfoRow, {
    label: "Username",
    value: profile.sshUser,
    mono: true
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InfoRow, {
    label: "Web root",
    value: profile.remoteWebRoot,
    mono: true
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InfoRow, {
    label: "Deploy mode",
    value: defaultMode === 'full' ? 'Full deploy (code + database)' : defaultMode === 'db' ? 'Database only (overwrite remote DB)' : 'Code only (themes + plugins)'
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InfoRow, {
    label: "Linked local site",
    value: profile.localSiteId ? siteName ? `${siteName} (${profile.localSiteId})` : profile.localSiteId : 'Not linked',
    mono: !siteName && !!profile.localSiteId
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InfoRow, {
    label: "Created",
    value: new Date(profile.createdAt).toLocaleString()
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InfoRow, {
    label: "Last deployed",
    value: profile.lastDeployedAt ? new Date(profile.lastDeployedAt).toLocaleString() : 'Never'
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(SSHTestPanel, {
    profileId: profileId
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(LocalMysqlRepairPanel, {
    profile: profile
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(RemoteBackupsPanel, {
    profile: profile
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-detail__actions"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary",
    onClick: () => onDeploy(profileId, defaultMode)
  }, "Deploy \u2192"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary",
    onClick: () => onViewLogs(profileId)
  }, "View logs"))), mode === 'edit' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(EditForm, {
    profile: profile,
    onSaved: updated => {
      setProfile(updated);
      setMode('view');
    },
    onCancel: () => setMode('view')
  }), mode === 'clone' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(ClonePanel, {
    profile: profile,
    onCloned: newId => onCloned(newId),
    onCancel: () => setMode('view')
  }), mode === 'delete' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(DeletePanel, {
    profile: profile,
    onDeleted: onBack,
    onCancel: () => setMode('view')
  }), mode === 'regenkey' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(RegenerateKeyPanel, {
    profile: profile,
    onComplete: updatedProfile => {
      if (updatedProfile) setProfile(updatedProfile);
      setMode('view');
    },
    onCancel: () => setMode('view')
  }));
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
/* harmony import */ var _ipc__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ipc */ "./src/renderer/ipc.js");


function Settings({
  onBack
}) {
  const [activeTab, setActiveTab] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('settings'); // 'settings' | 'about'
  const [backupStatus, setBackupStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // null | 'running' | { ok, filePath?, error? }
  const [keyStatus, setKeyStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // null | 'running' | { deleted: number } | { error: string }
  const [confirmDefault, setConfirmDefault] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [settingsLoaded, setSettingsLoaded] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);

  // ── Export state ────────────────────────────────────────────────────────────
  const [profiles, setProfiles] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [selectedIds, setSelectedIds] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // null = not yet loaded
  const [exportStatus, setExportStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // null | 'running' | { ok, filePath?, count?, error? }

  // ── Import state ────────────────────────────────────────────────────────────
  const [importPreview, setImportPreview] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // null | { profiles, conflicts, exportedAt, filePath }
  const [importDecisions, setImportDecisions] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({}); // Record<id, 'skip'|'overwrite'|'rename'>
  const [importStatus, setImportStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // null | 'picking' | 'applying' | { ok, imported, skipped, overwritten, renamed, error? }

  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.getSettings)().then(res => {
      if (res.success) setConfirmDefault(Boolean(res.data.confirmDefault));
      setSettingsLoaded(true);
    });
    (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.listProfiles)().then(res => {
      if (res.success) {
        setProfiles(res.data);
        setSelectedIds(res.data.map(p => p.id)); // all selected by default
      }
    });
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleConfirmDefaultChange(val) {
    setConfirmDefault(val);
    await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.updateSettings)({
      confirmDefault: val
    });
  }
  async function handleClearOrphanedKeys() {
    setKeyStatus('running');
    const result = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.deleteOrphanedKeys)();
    if (result.success) {
      setKeyStatus({
        deleted: result.data.deleted
      });
    } else {
      setKeyStatus({
        error: result.error
      });
    }
  }
  function toggleExportSelect(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleSelectAll() {
    setSelectedIds(prev => prev.length === profiles.length ? [] : profiles.map(p => p.id));
  }
  async function handleExport() {
    setExportStatus('running');
    try {
      const ids = selectedIds && selectedIds.length < profiles.length ? selectedIds : null;
      const res = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.exportProfiles)(ids);
      if (res.success) {
        setExportStatus({
          ok: true,
          filePath: res.data.filePath,
          count: res.data.count
        });
      } else if (res.error === 'Export cancelled.') {
        setExportStatus(null);
      } else {
        setExportStatus({
          ok: false,
          error: res.error
        });
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
      const res = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.pickImportFile)();
      if (!res.success) {
        setImportStatus(res.error === 'Import cancelled.' ? null : {
          ok: false,
          error: res.error
        });
        return;
      }
      // Pre-fill decisions: conflicts default to 'skip', no-conflict have no entry
      const defaultDecisions = {};
      res.data.conflicts.forEach(id => {
        defaultDecisions[id] = 'skip';
      });
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
      const res = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.applyImport)(importPreview.profiles, importDecisions);
      if (res.success) {
        setImportStatus({
          ok: true,
          ...res.data
        });
        setImportPreview(null);
        setImportDecisions({});
        // Refresh profiles list so export picker stays in sync
        (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.listProfiles)().then(r => {
          if (r.success) {
            setProfiles(r.data);
            setSelectedIds(r.data.map(p => p.id));
          }
        });
      } else {
        setImportStatus({
          ok: false,
          error: res.error
        });
      }
    } catch (e) {
      setImportStatus({
        ok: false,
        error: 'An unexpected error occurred.'
      });
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
    style: {
      display: 'flex',
      gap: 0,
      borderBottom: '2px solid #e2e6ea',
      marginBottom: 16
    }
  }, [['settings', 'Settings'], ['about', 'About']].map(([key, label]) => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    key: key,
    onClick: () => setActiveTab(key),
    style: {
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
      transition: 'color 0.15s'
    }
  }, label))), activeTab === 'about' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 6px',
      fontWeight: 700,
      fontSize: 14
    }
  }, "SiteGround Deploy for Local WP"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 4px',
      fontSize: 12,
      color: '#6c757d'
    }
  }, "Version 1.0.0")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 8px',
      fontWeight: 600
    }
  }, "Disclaimer"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      color: '#292929',
      lineHeight: 1.6
    }
  }, "This add-on is an independent, community-built tool and is", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "not affiliated with, endorsed by, or in any way officially connected to SiteGround.com"), " or its parent company. The SiteGround name and logo are trademarks of SiteGround Hosting Ltd. Use of those marks here is solely for descriptive purposes to identify the compatible hosting platform.")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 12px',
      fontWeight: 600
    }
  }, "Author"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("table", {
    style: {
      fontSize: 12,
      borderCollapse: 'collapse',
      width: '100%'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tbody", null, [['Name', 'Zechariah Manning'], ['Company', 'ZDM Designs'], ['Website', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("a", {
    href: "https://zdmdesigns.com",
    target: "_blank",
    rel: "noreferrer",
    style: {
      color: '#910C1D'
    }
  }, "zdmdesigns.com")], ['Source', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("a", {
    href: "https://github.com/zdmanning/ZDM-Siteground-Deploy-Local-WP-Addon",
    target: "_blank",
    rel: "noreferrer",
    style: {
      color: '#910C1D'
    }
  }, "GitHub Repository")]].map(([label, value]) => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", {
    key: label
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
    style: {
      color: '#6c757d',
      width: 80,
      paddingBottom: 6,
      verticalAlign: 'top'
    }
  }, label), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
    style: {
      paddingBottom: 6
    }
  }, value)))))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 8px',
      fontWeight: 600
    }
  }, "Backup addon"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 12px',
      fontSize: 12,
      color: '#6c757d',
      lineHeight: 1.6
    }
  }, "Saves a ZIP of the entire addon (source, config, everything) to a location you choose. To reinstall, just unzip into your Local addons folder."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: async () => {
      setBackupStatus('running');
      const res = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.backupAddon)();
      if (res.success) {
        setBackupStatus({
          ok: true,
          filePath: res.data.filePath
        });
      } else if (res.error === 'Cancelled.') {
        setBackupStatus(null);
      } else {
        setBackupStatus({
          ok: false,
          error: res.error
        });
      }
    },
    disabled: backupStatus === 'running'
  }, backupStatus === 'running' ? 'Saving…' : 'Save addon backup (.zip)…'), backupStatus && backupStatus !== 'running' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '8px 0 0',
      fontSize: 12,
      color: backupStatus.ok ? '#28a745' : '#dc3545'
    }
  }, backupStatus.ok ? `✓ Saved to ${backupStatus.filePath}` : `Error: ${backupStatus.error}`)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--info",
    style: {
      marginTop: 4
    }
  }, "This add-on is provided as-is, without warranty of any kind. Always back up your site before deploying.")), activeTab === 'settings' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card__title"
  }, "SiteGround Deploy v1.0.0"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
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
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 4px',
      fontWeight: 600
    }
  }, "Danger-zone confirmation checkbox default"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 12px',
      fontSize: 12,
      color: '#6c757d'
    }
  }, "Controls whether the ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("em", null, "\"I have read the above\""), " checkbox on full deploy and database deploy screens starts pre-checked or unchecked. Individual profiles can override this setting."), settingsLoaded ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    className: "sgd-checkbox-label",
    style: {
      fontSize: 13
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: confirmDefault,
    onChange: e => handleConfirmDefaultChange(e.target.checked)
  }), "Pre-check the confirmation checkbox by default") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    style: {
      fontSize: 12,
      color: '#6c757d'
    }
  }, "Loading\u2026")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 4px',
      fontWeight: 600
    }
  }, "Export profiles"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 12px',
      fontSize: 12,
      color: '#6c757d'
    }
  }, "Exports selected profiles to a ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, ".sgdexport"), " file, including their SSH private keys. Import this file on another machine to be instantly ready to deploy."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--warning",
    style: {
      marginBottom: 12
    }
  }, "\u26A0\uFE0F The export file contains ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "SSH private keys in plain text"), ". Treat it like a password \u2014 store it securely and do not share it."), selectedIds === null ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    style: {
      fontSize: 12,
      color: '#6c757d'
    }
  }, "Loading profiles\u2026") : profiles.length === 0 ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    style: {
      fontSize: 12,
      color: '#6c757d'
    }
  }, "No profiles to export.") : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    className: "sgd-checkbox-label",
    style: {
      fontWeight: 600
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: allSelected,
    onChange: toggleSelectAll
  }), "Select all (", profiles.length, ")")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      marginBottom: 12,
      paddingLeft: 4
    }
  }, profiles.map(p => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("label", {
    key: p.id,
    className: "sgd-checkbox-label"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: selectedIds.includes(p.id),
    onChange: () => toggleExportSelect(p.id)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, p.name), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    style: {
      color: '#6c757d'
    }
  }, p.sshHost)))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary sgd-btn--sm",
    onClick: handleExport,
    disabled: noneSelected || exportStatus === 'running'
  }, exportStatus === 'running' ? 'Exporting…' : `Export Selected (${selectedIds.length})`)), exportStatus && exportStatus !== 'running' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '10px 0 0',
      fontSize: 12,
      color: exportStatus.ok ? '#28a745' : '#dc3545'
    }
  }, exportStatus.ok ? `✓ Exported ${exportStatus.count} profile${exportStatus.count !== 1 ? 's' : ''} to ${exportStatus.filePath}` : `Error: ${exportStatus.error}`)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 4px',
      fontWeight: 600
    }
  }, "Import profiles"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 12px',
      fontSize: 12,
      color: '#6c757d'
    }
  }, "Import a ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, ".sgdexport"), " file to restore profiles and their SSH keys. You will be asked how to handle any conflicts with existing profiles."), !importPreview && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: handlePickImport,
    disabled: importStatus === 'picking' || importStatus === 'applying'
  }, importStatus === 'picking' ? 'Opening…' : 'Import from file…'), importStatus && importStatus !== 'picking' && importStatus !== 'applying' && !importPreview && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '10px 0 0',
      fontSize: 12,
      color: importStatus.ok ? '#28a745' : '#dc3545'
    }
  }, importStatus.ok ? [importStatus.imported && `${importStatus.imported} imported`, importStatus.overwritten && `${importStatus.overwritten} overwritten`, importStatus.renamed && `${importStatus.renamed} renamed`, importStatus.skipped && `${importStatus.skipped} skipped`].filter(Boolean).join(', ') + ' — done.' : `Error: ${importStatus.error}`), importPreview && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 4px',
      fontSize: 12,
      color: '#6c757d'
    }
  }, importPreview.exportedAt ? `File exported ${new Date(importPreview.exportedAt).toLocaleString()} — ${importPreview.profiles.length} profile${importPreview.profiles.length !== 1 ? 's' : ''} found.` : `${importPreview.profiles.length} profile${importPreview.profiles.length !== 1 ? 's' : ''} found.`), importPreview.profiles.length > 0 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("table", {
    style: {
      width: '100%',
      fontSize: 12,
      borderCollapse: 'collapse',
      marginTop: 8,
      marginBottom: 12
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("thead", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", {
    style: {
      borderBottom: '1px solid #dee2e6'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px 4px 0',
      fontWeight: 600
    }
  }, "Profile"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 8px 4px 0',
      fontWeight: 600
    }
  }, "Host"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("th", {
    style: {
      textAlign: 'left',
      padding: '4px 0',
      fontWeight: 600
    }
  }, "Action"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tbody", null, importPreview.profiles.map(p => {
    const isConflict = importPreview.conflicts.includes(p.id);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("tr", {
      key: p.id,
      style: {
        borderBottom: '1px solid #f1f3f5'
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
      style: {
        padding: '6px 8px 6px 0'
      }
    }, p.name, isConflict && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      style: {
        marginLeft: 6,
        fontSize: 10,
        background: '#fff3cd',
        color: '#856404',
        padding: '1px 5px',
        borderRadius: 3
      }
    }, "conflict")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
      style: {
        padding: '6px 8px 6px 0',
        color: '#6c757d'
      }
    }, p.sshHost), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("td", {
      style: {
        padding: '6px 0'
      }
    }, isConflict ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("select", {
      value: importDecisions[p.id] || 'skip',
      onChange: e => {
        const val = e.target.value;
        setImportDecisions(prev => ({
          ...prev,
          [p.id]: val
        }));
      },
      style: {
        padding: '4px 8px',
        border: '1px solid #ced4da',
        borderRadius: 4,
        fontSize: 12,
        color: '#292929',
        background: '#fff',
        width: 'auto'
      }
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
      value: "skip"
    }, "Skip"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
      value: "overwrite"
    }, "Overwrite"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("option", {
      value: "rename"
    }, "Import as copy")) : /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
      style: {
        color: '#28a745'
      }
    }, "Import")));
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--primary sgd-btn--sm",
    onClick: handleApplyImport,
    disabled: importStatus === 'applying'
  }, importStatus === 'applying' ? 'Importing…' : 'Apply Import'), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--secondary sgd-btn--sm",
    onClick: handleCancelImport,
    disabled: importStatus === 'applying'
  }, "Cancel")))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-card"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 4px',
      fontWeight: 600
    }
  }, "Clear orphaned keys"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '0 0 12px',
      fontSize: 12,
      color: '#6c757d'
    }
  }, "Deletes any key files on disk that no longer have a matching profile. Keys belonging to existing profiles are never touched."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    className: "sgd-btn sgd-btn--danger sgd-btn--sm",
    onClick: handleClearOrphanedKeys,
    disabled: keyStatus === 'running'
  }, keyStatus === 'running' ? 'Clearing…' : 'Clear Orphaned Keys'), keyStatus && keyStatus !== 'running' && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    style: {
      margin: '8px 0 0',
      fontSize: 12,
      color: keyStatus.error ? '#dc3545' : '#28a745'
    }
  }, keyStatus.error ? `Error: ${keyStatus.error}` : keyStatus.deleted === 0 ? 'No orphaned keys found.' : `Cleared ${keyStatus.deleted} orphaned key${keyStatus.deleted !== 1 ? 's' : ''}.`)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert sgd-alert--info",
    style: {
      marginTop: 16
    }
  }, "Additional settings (WP-CLI path, remote backup directory, etc.) will appear here in a future release.")));
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

  // Remote web root — must be an absolute path with something between prefix and suffix
  if (!data.remoteWebRoot?.trim() || data.remoteWebRoot.trim() === '/home/customer/www/') {
    errors.remoteWebRoot = 'Enter your domain name, e.g. example.com';
  } else if (!data.remoteWebRoot.trim().startsWith('/')) {
    errors.remoteWebRoot = 'Must be an absolute Unix path starting with / ' + '(e.g. /home/customer/www/example.com/public_html).';
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
    remoteWebRoot: '/home/customer/www/',
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
  }, "\uFFFD"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Code deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Push your themes and plugins to production in seconds."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-info-list__icon"
  }, "\u26A1"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Full deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Sync all of wp-content and overwrite the remote database \u2014 with automatic backup and URL search-replace built in."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-info-list__icon"
  }, "\uD83D\uDCBE"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Database-only deploy"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Push just your local database to production, keeping remote files untouched."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
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
  }, "2"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Open the SSH Manager for your site"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Navigate to ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Site Tools"), " for your target site, then go to", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Devs \u2192 SSH Keys Manager"), "."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "3"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Note your SSH credentials"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Your login credentials (host, username, and port) are located right there on the right side of the same page under ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "SSH Credentials"), "."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
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



const WEB_ROOT_PREFIX = '/home/customer/www/';
const WEB_ROOT_SUFFIX = '/public_html';
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
  const webRootMiddle = (() => {
    let v = data.remoteWebRoot || '';
    if (v.startsWith(WEB_ROOT_PREFIX)) v = v.slice(WEB_ROOT_PREFIX.length);
    if (v.endsWith(WEB_ROOT_SUFFIX)) v = v.slice(0, v.length - WEB_ROOT_SUFFIX.length);
    return v.replace(/\/$/, '');
  })();
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
    placeholder: "e.g. ssh.yourdomain.com",
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
    hint: "Just enter your domain name, e.g. example.com",
    error: errors.remoteWebRoot,
    required: true
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-input-with-prefix"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-input-prefix"
  }, "/home/customer/www/"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    id: "sgd-webroot",
    type: "text",
    placeholder: "example.com",
    autoComplete: "off",
    spellCheck: false,
    value: webRootMiddle,
    onChange: e => {
      const mid = e.target.value.replace(/\/$/, '');
      onChange({
        remoteWebRoot: mid ? WEB_ROOT_PREFIX + mid + WEB_ROOT_SUFFIX : WEB_ROOT_PREFIX
      });
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-input-suffix"
  }, "/public_html"))), submitted && !valid && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
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
      if (result && result.success === false) {
        throw new Error(result.error || 'Key generation failed.');
      }
      const {
        publicKey
      } = result && result.data ? result.data : result;
      onChange({
        publicKey
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
  }, "2"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Navigate to SSH Keys Manager"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "In your site's ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Site Tools"), ", go to ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Devs \u2192 SSH Keys Manager"), ", then select the ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Import"), " tab."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "3"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Import your new SSH key"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Choose a name for your key (e.g. \"Local Deploy\") and paste the public key from above into the", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Public Key"), " field. It must begin with", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-code-inline"
  }, "ssh-ed25519"), "."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-steps-list__num"
  }, "4"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Your SSH Credentials"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "The login credentials such as ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "host"), ", ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "username"), ", and ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "port"), " are right there on the right side of the same page."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
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
  const [cmdOutput, setCmdOutput] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  async function runTest() {
    setStatus(STATUS.TESTING);
    setErrorMsg(null);
    setCmdOutput(null);
    try {
      const result = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.testSSHConnectionDirect)(data);
      if (result.success) {
        onChange({
          connectionTestPassed: true
        });
        setCmdOutput(result.data && result.data.output || null);
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
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Testing connection\u2026"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Attempting to open an SSH session to ", data.sshHost, "."))), status === STATUS.SUCCESS && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-alert",
    style: {
      background: '#d4edda',
      border: '1px solid #c3e6cb',
      color: '#155724'
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "\u2713 Connection successful."), " Your SSH key is working and the server is reachable. You can now save this profile."), cmdOutput && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-ssh-probe"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-ssh-probe__label"
  }, "Server response (", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("code", null, "pwd && whoami"), ")"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("pre", {
    className: "sgd-ssh-probe__output"
  }, cmdOutput))), status === STATUS.FAILED && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
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
      const result = await (0,_ipc__WEBPACK_IMPORTED_MODULE_1__.saveProfile)(data);
      // saveProfile now returns { success, data: profile } or { success: false, error }
      const saved = result.data || result;
      if (result.success === false) throw new Error(result.error || 'Save failed.');
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
  }, "Targets: ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, data.remoteWebRoot))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-info-list__icon"
  }, "\u267B\uFE0F"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Reusable"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Your connection settings are saved. Select this profile any time from the dashboard to deploy again \u2014 no re-setup needed."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "sgd-info-list__item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", {
    className: "sgd-info-list__icon"
  }, "\uFFFD"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Three deploy modes available"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Code only"), " pushes themes and plugins.", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Full deploy"), " also replaces the production database.", ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Database only"), " overwrites just the remote database."))), !data.connectionTestPassed && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
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
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap);"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/**
 * Global stylesheet for the SiteGround Deploy add-on.
 * Scoped to .sgd-app to avoid bleeding into Local's own styles.
 */

/* ── Reset / base ──────────────────────────────────────────────────────────── */
.sgd-app {
  font-family: 'Inter', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  color: #292929;
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

/* ── Minimized state ────────────────────────────────────────────────────────── */
/* When minimized, snap the bar to the bottom of the viewport.
   Width and left offset are captured at minimize time and applied via inline style
   so the bar stays exactly as wide as the panel and horizontally aligned. */
.sgd-app--minimized {
  position: fixed;
  bottom: 0;
  z-index: 9999;
  height: auto !important;
  background: transparent;
}

.sgd-header__minimize {
  min-width: 28px;
  padding: 4px 8px !important;
  font-size: 11px;
  line-height: 1;
}

/* ── Ghost buttons on the dark header need a brighter red ───────────────────── */

.sgd-header .sgd-btn--ghost {
  color: #e0384b;
  border-color: #e0384b;
}

.sgd-header .sgd-btn--ghost:hover {
  background: rgba(224, 56, 75, 0.15);
  opacity: 1;
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.sgd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #292929;
  color: #fff;
  border-bottom: 2px solid #910C1D;
  flex-shrink: 0;
}

.sgd-header__title {
  font-family: 'Inter', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  letter-spacing: -0.1px;
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

.sgd-btn--primary   { background: #910C1D; color: #fff; }
.sgd-btn--secondary { background: #e2e6ea; color: #292929; }
.sgd-btn--danger    { background: #dc3545; color: #fff; }
.sgd-btn--warning   { background: #c47a00; color: #fff; }
.sgd-btn--ghost     { background: transparent; color: #910C1D; border: 1px solid #910C1D; }
.sgd-btn--sm        { padding: 4px 10px; font-size: 11px; }
.sgd-btn--xs        { padding: 2px 7px; font-size: 10px; }
.sgd-run-card__copy-btn { margin-left: auto; flex-shrink: 0; }

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
  color: #292929 !important;
  background: #fff !important;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.sgd-field input::placeholder,
.sgd-field textarea::placeholder {
  color: #adb5bd !important;
  opacity: 1;
}

.sgd-field input:focus,
.sgd-field select:focus,
.sgd-field textarea:focus {
  outline: none;
  border-color: #910C1D;
  box-shadow: 0 0 0 2px rgba(239, 91, 37, 0.15);
}

/* ── Status badges ─────────────────────────────────────────────────────────── */
.sgd-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
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

.sgd-wizard__dot--active   { background: #910C1D; }
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
  background: #292929;
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
.sgd-alert--success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }

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
  color: #292929;
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

/* ── Input with fixed prefix adornment ───────────────────────────────────── */

.sgd-input-with-prefix {
  display: flex;
  align-items: stretch;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.sgd-input-with-prefix:focus-within {
  border-color: #910C1D;
  box-shadow: 0 0 0 2px rgba(239, 91, 37, 0.15);
}

.sgd-field--error .sgd-input-with-prefix {
  border-color: #dc3545;
  background-color: #fff8f8;
}

.sgd-field--error .sgd-input-with-prefix:focus-within {
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.15);
}

.sgd-input-prefix,
.sgd-input-suffix {
  padding: 7px 8px 7px 10px;
  background: #f0f1f4;
  color: #555;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Consolas', 'Courier New', monospace;
  white-space: nowrap;
  flex-shrink: 0;
  user-select: none;
  line-height: 1.5;
}

.sgd-input-prefix {
  border-right: 1px solid #ced4da;
  padding-right: 8px;
}

.sgd-input-suffix {
  border-left: 1px solid #ced4da;
  padding-left: 8px;
  padding-right: 10px;
}

.sgd-input-with-prefix input {
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  outline: none !important;
  background: transparent !important;
  flex: 1;
  min-width: 0;
  padding: 7px 10px !important;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  color: #292929 !important;
}

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
  background: #292929;
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
  color: #292929;
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
  background: #910C1D;
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
  border-top-color: #910C1D;
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

/* ── SSH probe output (Step 6 connection test result) ─────────────────────── */

.sgd-ssh-probe {
  margin-top: 10px;
}

.sgd-ssh-probe__label {
  font-size: 11px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.sgd-ssh-probe__label code {
  font-family: 'Consolas', 'Courier New', monospace;
  text-transform: none;
  letter-spacing: 0;
  background: #e9ecef;
  color: #292929;
  padding: 0 4px;
  border-radius: 3px;
}

.sgd-ssh-probe__output {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  background: #292929;
  color: #6edd8e;
  border-radius: 4px;
  padding: 10px 14px;
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
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
  width: auto;
  margin-top: 2px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: #910C1D;
}

/* ══════════════════════════════════════════════════════════════════════════════
   Page header (shared by dashboard + other screens)
   ══════════════════════════════════════════════════════════════════════════════ */

.sgd-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.sgd-page-header__title {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: #292929;
}

/* ══════════════════════════════════════════════════════════════════════════════
   Loading skeleton rows
   ══════════════════════════════════════════════════════════════════════════════ */

.sgd-loading-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sgd-loading-row {
  height: 90px;
  background: linear-gradient(90deg, #e9ecef 25%, #f4f5f6 50%, #e9ecef 75%);
  background-size: 400% 100%;
  border-radius: 6px;
  animation: sgd-shimmer 1.4s infinite;
}

@keyframes sgd-shimmer {
  0%   { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* ══════════════════════════════════════════════════════════════════════════════
   Profile cards (Dashboard)
   ══════════════════════════════════════════════════════════════════════════════ */

.sgd-profile-card {
  background: #fff;
  border: 1px solid #e2e6ea;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  overflow: hidden;
}

.sgd-profile-card:hover {
  border-color: #910C1D;
  box-shadow: 0 2px 8px rgba(239, 91, 37, 0.12);
}

/* ── Card header ───────────────────────────────────────────────────────────── */

.sgd-profile-card__header {
  padding: 12px 16px 0;
}

.sgd-profile-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.sgd-profile-card__name {
  font-weight: 700;
  font-size: 14px;
  color: #292929;
}

.sgd-profile-card__meta {
  font-size: 11px;
  color: #6c757d;
  margin-bottom: 10px;
}

/* ── Connection info rows ──────────────────────────────────────────────────── */

.sgd-profile-card__info {
  padding: 0 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sgd-profile-card__info-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
}

.sgd-profile-card__info-label {
  color: #6c757d;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  width: 52px;
  flex-shrink: 0;
}

.sgd-profile-card__info-val {
  color: #292929;
  word-break: break-all;
}

.sgd-profile-card__info-val.sgd-profile-card__info-val--mono,
code.sgd-profile-card__info-val {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 11px;
}

/* ── SSH test result banner ────────────────────────────────────────────────── */

.sgd-profile-card__test-result {
  padding: 8px 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sgd-profile-card__test-result--working {
  background: #f7f8fa;
  color: #6c757d;
  border-top: 1px solid #e2e6ea;
}

.sgd-profile-card__test-result--ok {
  background: #d4edda;
  color: #155724;
  border-top: 1px solid #c3e6cb;
  font-weight: 600;
}

.sgd-profile-card__test-result--fail {
  background: #f8d7da;
  color: #721c24;
  border-top: 1px solid #f5c6cb;
}

/* ── Inline delete confirmation ────────────────────────────────────────────── */

.sgd-profile-card__confirm {
  padding: 10px 16px;
  background: #fff3cd;
  border-top: 1px solid #ffeeba;
  font-size: 12px;
  color: #856404;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sgd-profile-card__confirm-actions {
  display: flex;
  gap: 8px;
}

/* ── Action button strip ───────────────────────────────────────────────────── */

.sgd-profile-card__actions {
  display: flex;
  gap: 6px;
  padding: 10px 16px;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
}

/* Small spinner variant ──────────────────────────────────────────────────── */

.sgd-spinner--sm {
  width: 12px;
  height: 12px;
  border-width: 2px;
  display: inline-block;
}

/* Empty state icon ──────────────────────────────────────────────────────────── */

.sgd-empty__icon {
  font-size: 36px;
  margin-bottom: 8px;
}

/* ══════════════════════════════════════════════════════════════════════════════
   Profile detail screen
   ══════════════════════════════════════════════════════════════════════════════ */

.sgd-detail {
  max-width: 600px;
}

/* ── Header ────────────────────────────────────────────────────────────────── */

.sgd-detail__header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.sgd-detail__header-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.sgd-detail__header-top > .sgd-btn {
  flex-shrink: 0;
  margin-top: 2px;
}

.sgd-detail__title-block {
  flex: 1;
  min-width: 0;
}

.sgd-detail__title {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 2px;
  color: #292929;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sgd-detail__subtitle {
  font-size: 12px;
  color: #6c757d;
  word-break: break-all;
}

.sgd-detail__header-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

/* ── Section title ─────────────────────────────────────────────────────────── */

.sgd-detail__section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
  margin: 0 0 10px;
}

/* ── Info rows (view mode) ─────────────────────────────────────────────────── */

.sgd-detail__info-row {
  display: flex;
  gap: 12px;
  align-items: baseline;
  padding: 7px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
}

.sgd-detail__info-row:last-child {
  border-bottom: none;
}

.sgd-detail__info-label {
  color: #6c757d;
  font-size: 11px;
  width: 110px;
  flex-shrink: 0;
}

.sgd-detail__info-val {
  color: #292929;
  word-break: break-all;
}

.sgd-detail__info-val--mono {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 11px;
}

/* ── SSH test panel ────────────────────────────────────────────────────────── */

.sgd-detail__ssh-test {
  margin: 14px 0;
  background: #fff;
  border: 1px solid #e2e6ea;
  border-radius: 6px;
  padding: 14px 16px;
}

.sgd-detail__ssh-test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.sgd-detail__ssh-test-header .sgd-detail__section-title {
  margin: 0;
}

.sgd-detail__ssh-working {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6c757d;
  padding: 6px 0;
}

.sgd-detail__ssh-ok {
  padding: 4px 0;
}

.sgd-detail__ssh-ok-banner {
  font-size: 13px;
  font-weight: 600;
  color: #155724;
}

/* ── Primary action buttons ────────────────────────────────────────────────── */

.sgd-detail__actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

/* ── Delete confirmation panel ─────────────────────────────────────────────── */

.sgd-detail__delete-confirm {
  background: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 6px;
  padding: 16px 18px;
  font-size: 13px;
  color: #856404;
  margin-top: 16px;
}

.sgd-detail__delete-confirm p {
  margin: 0 0 12px;
  line-height: 1.6;
}

/* ── Edit form ─────────────────────────────────────────────────────────────── */

.sgd-detail__edit-form {
  background: #fff;
  border: 1px solid #e2e6ea;
  border-radius: 6px;
  padding: 18px 20px;
  margin-top: 4px;
}

.sgd-detail__edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #e2e6ea;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Deploy Screen
   ══════════════════════════════════════════════════════════════════════════ */

.sgd-deploy-screen {
  padding: 0 4px;
}

/* ── Header ────────────────────────────────────────────────────────────────── */
.sgd-deploy-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.sgd-deploy-back { flex-shrink: 0; }

.sgd-deploy-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #292929;
  line-height: 1.2;
}

.sgd-deploy-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: #6c757d;
}

/* ── Info cards ────────────────────────────────────────────────────────────── */
.sgd-deploy-info-card {
  margin-bottom: 12px;
  padding: 14px 16px;
}

.sgd-deploy-info-card__title {
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6c757d;
}

.sgd-deploy-path-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 5px;
  font-size: 12px;
}

.sgd-deploy-path-row:last-child { margin-bottom: 0; }

.sgd-deploy-path-label {
  flex-shrink: 0;
  width: 72px;
  color: #6c757d;
  font-size: 11px;
}

.sgd-deploy-path-value {
  flex: 1;
  color: #292929;
  word-break: break-all;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 11px;
}

.sgd-deploy-path-value--error { color: #dc3545; }

.sgd-deploy-path-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 10px;
}

.sgd-deploy-path-badge--ok    { background: #d4edda; color: #155724; }
.sgd-deploy-path-badge--error { background: #f8d7da; color: #721c24; }

.sgd-muted { color: #adb5bd; font-style: normal !important; }

/* ── Target selection ──────────────────────────────────────────────────────── */
.sgd-deploy-targets-card {
  margin-bottom: 16px;
  padding: 14px 16px;
}

.sgd-deploy-targets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sgd-deploy-target {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #292929;
  user-select: none;
}

.sgd-deploy-target--disabled {
  opacity: 0.45;
  pointer-events: none;
}

.sgd-deploy-target__checkbox {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  accent-color: #5b7cf6;
  cursor: pointer;
}

.sgd-deploy-target__name {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  color: #292929;
}

.sgd-deploy-target__badge {
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 10px;
}

.sgd-deploy-target__badge--missing { background: #e9ecef; color: #6c757d; }
.sgd-deploy-target__badge--warn    { background: #fff3cd; color: #856404; }

/* ── Directory tree picker ─────────────────────────────────────────────────── */
.sgd-dir-tree__hint {
  font-size: 11px;
  color: #6c757d;
  margin: 0 0 10px;
}

.sgd-dir-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sgd-dir-tree__row {
  display: flex;
  flex-direction: column;
}

.sgd-dir-tree__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 4px;
  user-select: none;
}

.sgd-dir-tree__item:hover { background: #f0f2f5; }

.sgd-dir-tree__item--disabled {
  opacity: 0.45;
  pointer-events: none;
}

.sgd-dir-tree__expand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  font-size: 13px;
  line-height: 1;
  color: #6c757d;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.15s ease, background 0.1s ease;
  padding: 0;
}

.sgd-dir-tree__expand:hover { background: #e9ecef; color: #292929; }

.sgd-dir-tree__expand--open {
  transform: rotate(90deg);
  background: #e9ecef;
  color: #292929;
}

.sgd-dir-tree__children {
  margin-left: 42px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-left: 2px solid #e9ecef;
  padding-left: 10px;
  margin-bottom: 4px;
}

.sgd-dir-tree__child {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
}

.sgd-dir-tree__child:hover { background: #f0f2f5; }

.sgd-dir-tree__child-icon { font-size: 12px; flex-shrink: 0; }
.sgd-dir-tree__child-icon--file { opacity: 0.5; }

.sgd-dir-tree__child-hint {
  font-size: 10px;
  color: #adb5bd;
  font-style: italic;
}

.sgd-dir-tree__empty {
  font-size: 11px;
  color: #adb5bd;
  padding: 4px 6px;
  font-style: italic;
}

.sgd-dir-tree__full-hint {
  font-size: 11px;
  color: #6c757d;
  margin: 4px 0 0;
  font-style: italic;
}

.sgd-spinner--xs {
  width: 10px;
  height: 10px;
  border-width: 1px;
}

/* ── Deploy action bar ─────────────────────────────────────────────────────── */
.sgd-deploy-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 16px 0;
}

.sgd-deploy-actions--done {
  margin-top: 12px;
}

.sgd-deploy-actions__hint {
  font-size: 11px;
  color: #6c757d;
}

/* ── Deploy log ────────────────────────────────────────────────────────────── */
.sgd-log--deploy {
  max-height: 400px;
  margin-bottom: 12px;
}

.sgd-log__line--info    { color: #adb5bd; }
.sgd-log__line--success { color: #6edd8e; }
.sgd-log__line--warning { color: #ffc107; }
.sgd-log__line--error   { color: #ff6b6b; }

.sgd-log__ts {
  color: #555;
  margin-right: 8px;
  flex-shrink: 0;
  font-size: 11px;
  opacity: 0.7;
}

.sgd-log__msg { word-break: break-word; }

/* ── Loading state ─────────────────────────────────────────────────────────── */
.sgd-deploy-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6c757d;
  padding: 20px 0;
}

/* ── Large button variant ──────────────────────────────────────────────────── */
.sgd-btn--lg {
  padding: 9px 22px;
  font-size: 14px;
}

/* ── Danger button ─────────────────────────────────────────────────────────── */
.sgd-btn--danger {
  background: #dc3545;
  color: #fff;
  border: none;
}
.sgd-btn--danger:hover:not(:disabled) { background: #c82333; }
.sgd-btn--danger:disabled { background: #e9acb0; color: #fff; cursor: not-allowed; }

/* ── Warning button ────────────────────────────────────────────────────────── */
.sgd-btn--warning {
  background: #c47a00;
  color: #fff;
  border: none;
}
.sgd-btn--warning:hover:not(:disabled) { background: #a86800; }
.sgd-btn--warning:disabled { background: #e2c07a; color: #fff; cursor: not-allowed; }

/* ═══════════════════════════════════════════════════════════════════════════
   Direction Toggle  (Push ↑ / Pull ↓)
   ══════════════════════════════════════════════════════════════════════════ */

.sgd-direction-toggle {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #dee2e6;
}

.sgd-direction-toggle__btn {
  flex: 1;
  padding: 9px 16px;
  background: #f8f9fa;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #495057;
  transition: background 0.15s, color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.sgd-direction-toggle__btn + .sgd-direction-toggle__btn {
  border-left: 2px solid #dee2e6;
}

.sgd-direction-toggle__btn:hover {
  background: #e9ecef;
}

.sgd-direction-toggle__btn--active {
  background: #910C1D;
  color: #fff;
  font-weight: 600;
}

.sgd-direction-toggle__btn--pull.sgd-direction-toggle__btn--active {
  background: #c47a00;
}

.sgd-direction-toggle__arrow {
  font-size: 15px;
  line-height: 1;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Deploy Mode Tabs
   ══════════════════════════════════════════════════════════════════════════ */

.sgd-deploy-mode-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.sgd-deploy-mode-tab {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
}
.sgd-deploy-mode-tab:hover {
  border-color: #5b7cf6;
  background: #f0f4ff;
}
.sgd-deploy-mode-tab--active {
  border-color: #5b7cf6;
  background: #f0f4ff;
}
.sgd-deploy-mode-tab--full-active {
  border-color: #dc3545 !important;
  background: #fff5f5 !important;
}

.sgd-deploy-mode-tab__icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}
.sgd-deploy-mode-tab__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sgd-deploy-mode-tab__text strong {
  font-size: 13px;
  color: #292929;
  font-weight: 600;
}
.sgd-deploy-mode-tab__text small {
  font-size: 11px;
  color: #6c757d;
  font-weight: 400;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Deploy Summary Card
   ══════════════════════════════════════════════════════════════════════════ */

.sgd-deploy-summary-card {
  margin-bottom: 12px;
  padding: 14px 16px;
}

.sgd-deploy-summary-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sgd-deploy-summary-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 12px;
}

.sgd-deploy-summary-label {
  flex-shrink: 0;
  width: 84px;
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
}

.sgd-deploy-summary-value {
  flex: 1;
  color: #292929;
  word-break: break-all;
}
.sgd-deploy-summary-value--mono {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 11px;
}
.sgd-deploy-summary-value--danger {
  color: #dc3545;
  font-weight: 600;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Full Deploy Danger Zone
   ══════════════════════════════════════════════════════════════════════════ */

.sgd-deploy-danger-zone {
  background: #fff8f8;
  border: 2px solid #dc3545;
  border-radius: 8px;
  margin-bottom: 14px;
  overflow: hidden;
}

.sgd-deploy-danger-zone__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #dc3545;
  color: #fff;
}

.sgd-deploy-danger-zone__icon {
  font-size: 18px;
  flex-shrink: 0;
}

.sgd-deploy-danger-zone__title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.sgd-deploy-danger-zone__body {
  padding: 14px 16px;
}

.sgd-deploy-danger-zone__lead {
  margin: 0 0 12px;
  font-size: 12px;
  color: #4a1010;
  line-height: 1.5;
}

.sgd-deploy-danger-zone__list {
  margin: 0 0 14px;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sgd-deploy-danger-zone__list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #292929;
  line-height: 1.5;
}

.sgd-dz-bullet {
  flex-shrink: 0;
  width: 18px;
  text-align: center;
  font-size: 13px;
  margin-top: 1px;
}
.sgd-dz-bullet--safe   { color: #28a745; }
.sgd-dz-bullet--warn   { color: #e0a800; }
.sgd-dz-bullet--danger { color: #dc3545; font-weight: 700; }
.sgd-dz-bullet--info   { color: #5b7cf6; }

.sgd-deploy-danger-zone__confirm {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 12px;
  color: #292929;
  line-height: 1.5;
}
.sgd-deploy-danger-zone__confirm:hover {
  border-color: #dc3545;
  background: #fff5f5;
}

.sgd-deploy-danger-zone__checkbox {
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  margin-top: 2px;
  accent-color: #dc3545;
  cursor: pointer;
}

.sgd-deploy-subtitle__status {
  color: #6c757d;
  font-weight: 400;
}

/* ═══ Activity Log screen ═══════════════════════════════════════════════════ */

.sgd-activity-log {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sgd-activity-log__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sgd-activity-log__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.sgd-activity-log__header-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.sgd-activity-log__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  padding: 24px 0;
}

.sgd-activity-log__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ── Filter pills ─────────────────────────────────────────────────────────── */

.sgd-activity-filter {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.sgd-activity-filter__pill {
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #3a3a3c;
  background: transparent;
  color: #adb5bd;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.sgd-activity-filter__pill:hover {
  background: #2a2a2e;
  color: #e9ecef;
}

.sgd-activity-filter__pill--active {
  background: #1a73e8;
  border-color: #1a73e8;
  color: #fff;
}

/* ── Run card ─────────────────────────────────────────────────────────────── */

.sgd-run-card {
  border: 1px solid #2a2a2e;
  border-radius: 6px;
  overflow: hidden;
  background: #1c1c1e;
  transition: border-color 0.15s;
}

.sgd-run-card--expanded {
  border-color: #3a3a3c;
}

.sgd-run-card__header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  color: inherit;
  transition: background 0.12s;
}

.sgd-run-card__header:hover {
  background: #252528;
}

.sgd-run-card__time {
  font-size: 11px;
  color: #6c757d;
  flex-shrink: 0;
}

.sgd-run-card__duration {
  font-size: 11px;
  color: #495057;
  flex-shrink: 0;
}

.sgd-run-card__targets {
  font-size: 11px;
  color: #6c757d;
  font-family: monospace;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sgd-run-card__chevron {
  font-size: 10px;
  color: #495057;
  margin-left: auto;
  flex-shrink: 0;
}

.sgd-run-card__body {
  border-top: 1px solid #2a2a2e;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Metadata row inside expanded card */
.sgd-run-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.sgd-run-card__meta-item {
  font-size: 11px;
  color: #6c757d;
}

.sgd-run-card__meta-item strong {
  color: #adb5bd;
  margin-right: 4px;
}

.sgd-run-card__meta-item--error {
  color: #ff6b6b;
}

.sgd-run-card__meta-item--error strong {
  color: #ff6b6b;
}

/* Entries inside expanded card */
.sgd-run-card__entries {
  max-height: 320px;
  overflow-y: auto;
  padding: 10px;
  background: #111113;
  border-radius: 4px;
  font-family: 'Consolas', 'Menlo', monospace;
  font-size: 11px;
}

.sgd-run-card__entries-loading,
.sgd-run-card__entries-empty {
  font-size: 12px;
  color: #6c757d;
  padding: 8px 0;
}

/* ── Action type badge ────────────────────────────────────────────────────── */

.sgd-run-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.sgd-run-badge--code   { background: #1a3a5c; color: #63aff0; }
.sgd-run-badge--full   { background: #3a1a1a; color: #f07063; }
.sgd-run-badge--conn   { background: #1a3a2a; color: #63f0a8; }
.sgd-run-badge--system { background: #2a2a2a; color: #6c757d; }

/* ── Outcome badge ───────────────────────────────────────────────────────── */

.sgd-run-outcome {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.sgd-run-outcome--success { background: #1a3a2a; color: #6edd8e; }
.sgd-run-outcome--failure { background: #3a1a1a; color: #ff6b6b; }
.sgd-run-outcome--running { background: #2a2a1a; color: #ffc107; }

/* ── Log entry row inside run card ──────────────────────────────────────── */

.sgd-run-entry {
  display: flex;
  gap: 8px;
  line-height: 1.5;
  padding: 1px 0;
}

.sgd-run-entry__ts {
  flex-shrink: 0;
  color: #495057;
  font-size: 11px;
  padding-top: 1px;
  min-width: 72px;
}

.sgd-run-entry__msg {
  flex: 1;
  word-break: break-word;
}

.sgd-run-entry__meta {
  font-size: 11px;
  color: #495057;
  margin-left: 4px;
  flex-shrink: 0;
}

/* ─── Full deploy — exclude directories ─────────────────────────────────────── */

.sgd-deploy-exclude {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.sgd-deploy-exclude__title {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 6px;
  color: #212529;
}

.sgd-deploy-exclude__hint {
  font-size: 12px;
  color: #6c757d;
  margin: 0 0 10px;
}

.sgd-deploy-exclude__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sgd-deploy-exclude__item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  user-select: none;
}

.sgd-deploy-exclude__checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #dc3545;
  flex-shrink: 0;
}

.sgd-deploy-exclude__name {
  font-family: monospace;
  font-size: 12px;
  color: #212529;
}

.sgd-deploy-exclude__summary {
  margin: 10px 0 0;
  font-size: 12px;
  color: #dc3545;
}

/* ── Archive format picker ─────────────────────────────────────────────────── */
.sgd-deploy-format-picker__title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
}

.sgd-deploy-format-picker__hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--text-muted, #888);
}

.sgd-deploy-format-picker__options {
  display: flex;
  gap: 10px;
}

.sgd-deploy-format-picker__option {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--border, #3a3a3a);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
}

.sgd-deploy-format-picker__option:hover {
  border-color: var(--accent, #4a90d9);
}

.sgd-deploy-format-picker__option--active {
  border-color: var(--accent, #4a90d9);
  background-color: rgba(74, 144, 217, 0.08);
}

.sgd-deploy-format-picker__option input[type="radio"] {
  margin-top: 2px;
  flex-shrink: 0;
}

.sgd-deploy-format-picker__option-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sgd-deploy-format-picker__option-body strong {
  font-size: 13px;
}

.sgd-deploy-format-picker__desc {
  font-size: 11px;
  color: var(--text-muted, #888);
  line-height: 1.4;
}

/* ── Deploy stop bar ──────────────────────────────────────────────────────── */
.sgd-deploy-stop-bar {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0 0;
}
`, "",{"version":3,"sources":["webpack://./src/renderer/styles/global.css"],"names":[],"mappings":"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","sourcesContent":["/**\r\n * Global stylesheet for the SiteGround Deploy add-on.\r\n * Scoped to .sgd-app to avoid bleeding into Local's own styles.\r\n */\r\n\r\n@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');\r\n\r\n/* ── Reset / base ──────────────────────────────────────────────────────────── */\r\n.sgd-app {\r\n  font-family: 'Inter', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif;\r\n  font-size: 13px;\r\n  font-weight: 400;\r\n  -webkit-font-smoothing: antialiased;\r\n  text-rendering: optimizeLegibility;\r\n  color: #292929;\r\n  background: #f7f8fa;\r\n  height: 100%;\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.sgd-main {\r\n  flex: 1;\r\n  overflow-y: auto;\r\n  padding: 20px;\r\n}\r\n\r\n/* ── Minimized state ────────────────────────────────────────────────────────── */\r\n/* When minimized, snap the bar to the bottom of the viewport.\r\n   Width and left offset are captured at minimize time and applied via inline style\r\n   so the bar stays exactly as wide as the panel and horizontally aligned. */\r\n.sgd-app--minimized {\r\n  position: fixed;\r\n  bottom: 0;\r\n  z-index: 9999;\r\n  height: auto !important;\r\n  background: transparent;\r\n}\r\n\r\n.sgd-header__minimize {\r\n  min-width: 28px;\r\n  padding: 4px 8px !important;\r\n  font-size: 11px;\r\n  line-height: 1;\r\n}\r\n\r\n/* ── Ghost buttons on the dark header need a brighter red ───────────────────── */\r\n\r\n.sgd-header .sgd-btn--ghost {\r\n  color: #e0384b;\r\n  border-color: #e0384b;\r\n}\r\n\r\n.sgd-header .sgd-btn--ghost:hover {\r\n  background: rgba(224, 56, 75, 0.15);\r\n  opacity: 1;\r\n}\r\n\r\n/* ── Header ────────────────────────────────────────────────────────────────── */\r\n.sgd-header {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  padding: 12px 20px;\r\n  background: #292929;\r\n  color: #fff;\r\n  border-bottom: 2px solid #910C1D;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-header__title {\r\n  font-family: 'Inter', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif;\r\n  font-weight: 700;\r\n  font-size: 14px;\r\n  cursor: pointer;\r\n  letter-spacing: -0.1px;\r\n}\r\n\r\n.sgd-header__actions {\r\n  display: flex;\r\n  gap: 8px;\r\n}\r\n\r\n/* ── Buttons ───────────────────────────────────────────────────────────────── */\r\n.sgd-btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 7px 16px;\r\n  border: none;\r\n  border-radius: 4px;\r\n  font-size: 12px;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  transition: opacity 0.15s ease;\r\n}\r\n\r\n.sgd-btn:hover { opacity: 0.85; }\r\n.sgd-btn:disabled { opacity: 0.45; cursor: not-allowed; }\r\n\r\n.sgd-btn--primary   { background: #910C1D; color: #fff; }\r\n.sgd-btn--secondary { background: #e2e6ea; color: #292929; }\r\n.sgd-btn--danger    { background: #dc3545; color: #fff; }\r\n.sgd-btn--warning   { background: #c47a00; color: #fff; }\r\n.sgd-btn--ghost     { background: transparent; color: #910C1D; border: 1px solid #910C1D; }\r\n.sgd-btn--sm        { padding: 4px 10px; font-size: 11px; }\r\n.sgd-btn--xs        { padding: 2px 7px; font-size: 10px; }\r\n.sgd-run-card__copy-btn { margin-left: auto; flex-shrink: 0; }\r\n\r\n/* ── Cards ─────────────────────────────────────────────────────────────────── */\r\n.sgd-card {\r\n  background: #fff;\r\n  border: 1px solid #e2e6ea;\r\n  border-radius: 6px;\r\n  padding: 16px 20px;\r\n  margin-bottom: 12px;\r\n}\r\n\r\n.sgd-card__title {\r\n  font-weight: 700;\r\n  font-size: 13px;\r\n  margin: 0 0 4px;\r\n}\r\n\r\n.sgd-card__meta {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n}\r\n\r\n/* ── Form elements ─────────────────────────────────────────────────────────── */\r\n.sgd-field {\r\n  margin-bottom: 14px;\r\n}\r\n\r\n.sgd-field label {\r\n  display: block;\r\n  font-weight: 600;\r\n  font-size: 11px;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n  color: #6c757d;\r\n  margin-bottom: 4px;\r\n}\r\n\r\n.sgd-field input,\r\n.sgd-field select,\r\n.sgd-field textarea {\r\n  width: 100%;\r\n  padding: 7px 10px;\r\n  border: 1px solid #ced4da;\r\n  border-radius: 4px;\r\n  font-size: 13px;\r\n  color: #292929 !important;\r\n  background: #fff !important;\r\n  box-sizing: border-box;\r\n  transition: border-color 0.15s ease;\r\n}\r\n\r\n.sgd-field input::placeholder,\r\n.sgd-field textarea::placeholder {\r\n  color: #adb5bd !important;\r\n  opacity: 1;\r\n}\r\n\r\n.sgd-field input:focus,\r\n.sgd-field select:focus,\r\n.sgd-field textarea:focus {\r\n  outline: none;\r\n  border-color: #910C1D;\r\n  box-shadow: 0 0 0 2px rgba(239, 91, 37, 0.15);\r\n}\r\n\r\n/* ── Status badges ─────────────────────────────────────────────────────────── */\r\n.sgd-badge {\r\n  display: inline-block;\r\n  padding: 2px 8px;\r\n  border-radius: 10px;\r\n  font-size: 11px;\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n}\r\n\r\n.sgd-badge--success { background: #d4edda; color: #155724; }\r\n.sgd-badge--error   { background: #f8d7da; color: #721c24; }\r\n.sgd-badge--warning { background: #fff3cd; color: #856404; }\r\n.sgd-badge--pending { background: #e2e6ea; color: #495057; }\r\n\r\n/* ── Wizard ────────────────────────────────────────────────────────────────── */\r\n.sgd-wizard {\r\n  max-width: 540px;\r\n  margin: 0 auto;\r\n}\r\n\r\n.sgd-wizard__step-indicator {\r\n  display: flex;\r\n  gap: 6px;\r\n  margin-bottom: 24px;\r\n  justify-content: center;\r\n}\r\n\r\n.sgd-wizard__dot {\r\n  width: 8px;\r\n  height: 8px;\r\n  border-radius: 50%;\r\n  background: #ced4da;\r\n  transition: background 0.2s ease;\r\n}\r\n\r\n.sgd-wizard__dot--active   { background: #910C1D; }\r\n.sgd-wizard__dot--complete { background: #28a745; }\r\n\r\n.sgd-wizard__actions {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  margin-top: 24px;\r\n  padding-top: 16px;\r\n  border-top: 1px solid #e2e6ea;\r\n}\r\n\r\n/* ── Activity log ──────────────────────────────────────────────────────────── */\r\n.sgd-log {\r\n  background: #292929;\r\n  border-radius: 6px;\r\n  padding: 12px 14px;\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 11px;\r\n  line-height: 1.7;\r\n  color: #cdd5e0;\r\n  max-height: 320px;\r\n  overflow-y: auto;\r\n}\r\n\r\n.sgd-log__entry--info    { color: #adb5bd; }\r\n.sgd-log__entry--success { color: #6edd8e; }\r\n.sgd-log__entry--warning { color: #ffc107; }\r\n.sgd-log__entry--error   { color: #ff6b6b; }\r\n\r\n/* ── Alert / callout ───────────────────────────────────────────────────────── */\r\n.sgd-alert {\r\n  border-radius: 4px;\r\n  padding: 10px 14px;\r\n  font-size: 12px;\r\n  margin-bottom: 12px;\r\n  line-height: 1.5;\r\n}\r\n\r\n.sgd-alert--danger  { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }\r\n.sgd-alert--warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; }\r\n.sgd-alert--info    { background: #cce5ff; border: 1px solid #b8daff; color: #004085; }\r\n.sgd-alert--success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }\r\n\r\n/* ── Utility ───────────────────────────────────────────────────────────────── */\r\n.sgd-empty {\r\n  text-align: center;\r\n  padding: 40px 20px;\r\n  color: #6c757d;\r\n}\r\n\r\n.sgd-empty p { margin: 8px 0 0; font-size: 12px; }\r\n\r\n/* ═══════════════════════════════════════════════════════════════════════════\r\n   Wizard — extended styles\r\n   ═══════════════════════════════════════════════════════════════════════════ */\r\n\r\n/* Header inside wizard panel */\r\n.sgd-wizard__header {\r\n  text-align: center;\r\n  margin-bottom: 20px;\r\n}\r\n\r\n.sgd-wizard__step-label {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n  margin: 6px 0 0;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n}\r\n\r\n/* Individual step container */\r\n.sgd-wizard__step {\r\n  animation: sgd-fade-in 0.2s ease;\r\n}\r\n\r\n.sgd-wizard__step--centered {\r\n  text-align: center;\r\n}\r\n\r\n@keyframes sgd-fade-in {\r\n  from { opacity: 0; transform: translateY(6px); }\r\n  to   { opacity: 1; transform: translateY(0); }\r\n}\r\n\r\n/* Large emoji icon at top of each step */\r\n.sgd-wizard__step-icon {\r\n  font-size: 32px;\r\n  margin-bottom: 10px;\r\n  display: block;\r\n}\r\n\r\n.sgd-wizard__step-icon--large {\r\n  font-size: 48px;\r\n}\r\n\r\n.sgd-wizard__heading {\r\n  font-size: 18px;\r\n  font-weight: 700;\r\n  color: #292929;\r\n  margin: 0 0 6px;\r\n}\r\n\r\n.sgd-wizard__subheading {\r\n  font-size: 13px;\r\n  color: #6c757d;\r\n  margin: 0 0 20px;\r\n  line-height: 1.5;\r\n}\r\n\r\n.sgd-wizard__body {\r\n  margin-bottom: 8px;\r\n}\r\n\r\n.sgd-wizard__body p {\r\n  font-size: 13px;\r\n  line-height: 1.6;\r\n  color: #333;\r\n  margin: 0 0 10px;\r\n}\r\n\r\n.sgd-wizard__actions--centered {\r\n  justify-content: center;\r\n  gap: 12px;\r\n}\r\n\r\n/* Two-column layout for host + port */\r\n.sgd-form-row {\r\n  display: flex;\r\n  gap: 12px;\r\n  align-items: flex-start;\r\n}\r\n\r\n.sgd-form-row .sgd-field:first-child { flex: 1; }\r\n.sgd-form-row .sgd-field:last-child  { flex-shrink: 0; }\r\n\r\n/* ── Input with fixed prefix adornment ───────────────────────────────────── */\r\n\r\n.sgd-input-with-prefix {\r\n  display: flex;\r\n  align-items: stretch;\r\n  border: 1px solid #ced4da;\r\n  border-radius: 4px;\r\n  background: #fff;\r\n  overflow: hidden;\r\n  transition: border-color 0.15s ease;\r\n}\r\n\r\n.sgd-input-with-prefix:focus-within {\r\n  border-color: #910C1D;\r\n  box-shadow: 0 0 0 2px rgba(239, 91, 37, 0.15);\r\n}\r\n\r\n.sgd-field--error .sgd-input-with-prefix {\r\n  border-color: #dc3545;\r\n  background-color: #fff8f8;\r\n}\r\n\r\n.sgd-field--error .sgd-input-with-prefix:focus-within {\r\n  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.15);\r\n}\r\n\r\n.sgd-input-prefix,\r\n.sgd-input-suffix {\r\n  padding: 7px 8px 7px 10px;\r\n  background: #f0f1f4;\r\n  color: #555;\r\n  font-size: 12px;\r\n  font-weight: 500;\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  white-space: nowrap;\r\n  flex-shrink: 0;\r\n  user-select: none;\r\n  line-height: 1.5;\r\n}\r\n\r\n.sgd-input-prefix {\r\n  border-right: 1px solid #ced4da;\r\n  padding-right: 8px;\r\n}\r\n\r\n.sgd-input-suffix {\r\n  border-left: 1px solid #ced4da;\r\n  padding-left: 8px;\r\n  padding-right: 10px;\r\n}\r\n\r\n.sgd-input-with-prefix input {\r\n  border: none !important;\r\n  border-radius: 0 !important;\r\n  box-shadow: none !important;\r\n  outline: none !important;\r\n  background: transparent !important;\r\n  flex: 1;\r\n  min-width: 0;\r\n  padding: 7px 10px !important;\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 12px;\r\n  color: #292929 !important;\r\n}\r\n\r\n/* ── FormField error/hint states ─────────────────────────────────────────── */\r\n\r\n.sgd-field--error input,\r\n.sgd-field--error select,\r\n.sgd-field--error textarea {\r\n  border-color: #dc3545;\r\n  background-color: #fff8f8;\r\n}\r\n\r\n.sgd-field--error input:focus,\r\n.sgd-field--error select:focus {\r\n  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.15);\r\n}\r\n\r\n.sgd-field__required {\r\n  color: #dc3545;\r\n}\r\n\r\n.sgd-field__hint {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n  margin: 3px 0 0;\r\n  line-height: 1.4;\r\n}\r\n\r\n.sgd-field__error {\r\n  font-size: 11px;\r\n  color: #dc3545;\r\n  margin: 3px 0 0;\r\n  line-height: 1.4;\r\n}\r\n\r\n/* ── Copyable code block ──────────────────────────────────────────────────── */\r\n\r\n.sgd-copyable__label {\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  color: #6c757d;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n  margin: 0 0 6px;\r\n}\r\n\r\n.sgd-copyable__block {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 10px;\r\n  background: #292929;\r\n  border-radius: 4px;\r\n  padding: 12px 14px;\r\n}\r\n\r\n.sgd-copyable__code {\r\n  flex: 1;\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 11px;\r\n  color: #cdd5e0;\r\n  word-break: break-all;\r\n  white-space: pre-wrap;\r\n  line-height: 1.6;\r\n}\r\n\r\n.sgd-copyable__btn {\r\n  flex-shrink: 0;\r\n  margin-top: 2px;\r\n}\r\n\r\n/* ── Inline code snippets ─────────────────────────────────────────────────── */\r\n\r\n.sgd-code-inline {\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 11px;\r\n  background: #e9ecef;\r\n  color: #292929;\r\n  padding: 1px 5px;\r\n  border-radius: 3px;\r\n}\r\n\r\n/* ── Info list (icon + text rows) ─────────────────────────────────────────── */\r\n\r\n.sgd-info-list {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 12px;\r\n  margin: 12px 0;\r\n}\r\n\r\n.sgd-info-list__item {\r\n  display: flex;\r\n  gap: 12px;\r\n  align-items: flex-start;\r\n}\r\n\r\n.sgd-info-list__icon {\r\n  font-size: 18px;\r\n  flex-shrink: 0;\r\n  margin-top: 1px;\r\n}\r\n\r\n.sgd-info-list__item strong {\r\n  display: block;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  margin-bottom: 2px;\r\n}\r\n\r\n.sgd-info-list__item p {\r\n  font-size: 12px;\r\n  color: #555;\r\n  margin: 0;\r\n  line-height: 1.5;\r\n}\r\n\r\n/* ── Numbered steps list ──────────────────────────────────────────────────── */\r\n\r\n.sgd-steps-list {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 14px;\r\n}\r\n\r\n.sgd-steps-list__item {\r\n  display: flex;\r\n  gap: 12px;\r\n  align-items: flex-start;\r\n}\r\n\r\n.sgd-steps-list__num {\r\n  width: 24px;\r\n  height: 24px;\r\n  border-radius: 50%;\r\n  background: #910C1D;\r\n  color: #fff;\r\n  font-size: 11px;\r\n  font-weight: 700;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  flex-shrink: 0;\r\n  margin-top: 1px;\r\n}\r\n\r\n.sgd-steps-list__item strong {\r\n  display: block;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  margin-bottom: 3px;\r\n}\r\n\r\n.sgd-steps-list__item p {\r\n  font-size: 12px;\r\n  color: #555;\r\n  margin: 0;\r\n  line-height: 1.5;\r\n}\r\n\r\n/* ── Key generation status block ──────────────────────────────────────────── */\r\n\r\n.sgd-keygen-status {\r\n  display: flex;\r\n  gap: 14px;\r\n  align-items: flex-start;\r\n  border-radius: 6px;\r\n  padding: 14px 16px;\r\n}\r\n\r\n.sgd-keygen-status--working {\r\n  background: #f7f8fa;\r\n  border: 1px solid #e2e6ea;\r\n}\r\n\r\n.sgd-keygen-status--done {\r\n  background: #f0fff4;\r\n  border: 1px solid #c3e6cb;\r\n}\r\n\r\n.sgd-keygen-status strong {\r\n  display: block;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  margin-bottom: 4px;\r\n}\r\n\r\n.sgd-keygen-status p {\r\n  font-size: 12px;\r\n  color: #555;\r\n  margin: 0;\r\n  line-height: 1.5;\r\n}\r\n\r\n.sgd-keygen-status__check {\r\n  font-size: 20px;\r\n  color: #28a745;\r\n  flex-shrink: 0;\r\n}\r\n\r\n/* ── Spinner ──────────────────────────────────────────────────────────────── */\r\n\r\n.sgd-spinner {\r\n  width: 20px;\r\n  height: 20px;\r\n  border: 3px solid #e2e6ea;\r\n  border-top-color: #910C1D;\r\n  border-radius: 50%;\r\n  animation: sgd-spin 0.8s linear infinite;\r\n  flex-shrink: 0;\r\n  margin-top: 2px;\r\n}\r\n\r\n@keyframes sgd-spin {\r\n  to { transform: rotate(360deg); }\r\n}\r\n\r\n/* ── Compact card variant ──────────────────────────────────────────────────── */\r\n\r\n.sgd-card--compact {\r\n  padding: 12px 16px;\r\n}\r\n\r\n/* ── Summary table (inside cards) ────────────────────────────────────────── */\r\n\r\n.sgd-summary-table {\r\n  width: 100%;\r\n  border-collapse: collapse;\r\n  font-size: 12px;\r\n}\r\n\r\n.sgd-summary-table td {\r\n  padding: 6px 8px 6px 0;\r\n  vertical-align: top;\r\n  border-bottom: 1px solid #f0f0f0;\r\n}\r\n\r\n.sgd-summary-table td:first-child {\r\n  color: #6c757d;\r\n  width: 38%;\r\n  white-space: nowrap;\r\n}\r\n\r\n.sgd-summary-table tr:last-child td {\r\n  border-bottom: none;\r\n}\r\n\r\n/* ── SSH probe output (Step 6 connection test result) ─────────────────────── */\r\n\r\n.sgd-ssh-probe {\r\n  margin-top: 10px;\r\n}\r\n\r\n.sgd-ssh-probe__label {\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  color: #6c757d;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n  margin-bottom: 4px;\r\n}\r\n\r\n.sgd-ssh-probe__label code {\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  text-transform: none;\r\n  letter-spacing: 0;\r\n  background: #e9ecef;\r\n  color: #292929;\r\n  padding: 0 4px;\r\n  border-radius: 3px;\r\n}\r\n\r\n.sgd-ssh-probe__output {\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 12px;\r\n  background: #292929;\r\n  color: #6edd8e;\r\n  border-radius: 4px;\r\n  padding: 10px 14px;\r\n  margin: 0;\r\n  line-height: 1.6;\r\n  white-space: pre-wrap;\r\n  word-break: break-all;\r\n}\r\n\r\n/* ── Checkbox label ────────────────────────────────────────────────────────── */\r\n\r\n.sgd-checkbox-label {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 8px;\r\n  font-size: 12px;\r\n  color: #333;\r\n  line-height: 1.5;\r\n  cursor: pointer;\r\n}\r\n\r\n.sgd-checkbox-label input[type=\"checkbox\"] {\r\n  width: auto;\r\n  margin-top: 2px;\r\n  flex-shrink: 0;\r\n  cursor: pointer;\r\n  accent-color: #910C1D;\r\n}\r\n\r\n/* ══════════════════════════════════════════════════════════════════════════════\r\n   Page header (shared by dashboard + other screens)\r\n   ══════════════════════════════════════════════════════════════════════════════ */\r\n\r\n.sgd-page-header {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  margin-bottom: 18px;\r\n}\r\n\r\n.sgd-page-header__title {\r\n  font-size: 16px;\r\n  font-weight: 700;\r\n  margin: 0;\r\n  color: #292929;\r\n}\r\n\r\n/* ══════════════════════════════════════════════════════════════════════════════\r\n   Loading skeleton rows\r\n   ══════════════════════════════════════════════════════════════════════════════ */\r\n\r\n.sgd-loading-rows {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 10px;\r\n}\r\n\r\n.sgd-loading-row {\r\n  height: 90px;\r\n  background: linear-gradient(90deg, #e9ecef 25%, #f4f5f6 50%, #e9ecef 75%);\r\n  background-size: 400% 100%;\r\n  border-radius: 6px;\r\n  animation: sgd-shimmer 1.4s infinite;\r\n}\r\n\r\n@keyframes sgd-shimmer {\r\n  0%   { background-position: 100% 0; }\r\n  100% { background-position: -100% 0; }\r\n}\r\n\r\n/* ══════════════════════════════════════════════════════════════════════════════\r\n   Profile cards (Dashboard)\r\n   ══════════════════════════════════════════════════════════════════════════════ */\r\n\r\n.sgd-profile-card {\r\n  background: #fff;\r\n  border: 1px solid #e2e6ea;\r\n  border-radius: 6px;\r\n  margin-bottom: 10px;\r\n  cursor: pointer;\r\n  transition: border-color 0.15s ease, box-shadow 0.15s ease;\r\n  overflow: hidden;\r\n}\r\n\r\n.sgd-profile-card:hover {\r\n  border-color: #910C1D;\r\n  box-shadow: 0 2px 8px rgba(239, 91, 37, 0.12);\r\n}\r\n\r\n/* ── Card header ───────────────────────────────────────────────────────────── */\r\n\r\n.sgd-profile-card__header {\r\n  padding: 12px 16px 0;\r\n}\r\n\r\n.sgd-profile-card__title-row {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  margin-bottom: 3px;\r\n}\r\n\r\n.sgd-profile-card__name {\r\n  font-weight: 700;\r\n  font-size: 14px;\r\n  color: #292929;\r\n}\r\n\r\n.sgd-profile-card__meta {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n  margin-bottom: 10px;\r\n}\r\n\r\n/* ── Connection info rows ──────────────────────────────────────────────────── */\r\n\r\n.sgd-profile-card__info {\r\n  padding: 0 16px 10px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 3px;\r\n}\r\n\r\n.sgd-profile-card__info-row {\r\n  display: flex;\r\n  align-items: baseline;\r\n  gap: 8px;\r\n  font-size: 12px;\r\n}\r\n\r\n.sgd-profile-card__info-label {\r\n  color: #6c757d;\r\n  font-size: 11px;\r\n  font-weight: 500;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.4px;\r\n  width: 52px;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-profile-card__info-val {\r\n  color: #292929;\r\n  word-break: break-all;\r\n}\r\n\r\n.sgd-profile-card__info-val.sgd-profile-card__info-val--mono,\r\ncode.sgd-profile-card__info-val {\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 11px;\r\n}\r\n\r\n/* ── SSH test result banner ────────────────────────────────────────────────── */\r\n\r\n.sgd-profile-card__test-result {\r\n  padding: 8px 16px;\r\n  font-size: 12px;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n}\r\n\r\n.sgd-profile-card__test-result--working {\r\n  background: #f7f8fa;\r\n  color: #6c757d;\r\n  border-top: 1px solid #e2e6ea;\r\n}\r\n\r\n.sgd-profile-card__test-result--ok {\r\n  background: #d4edda;\r\n  color: #155724;\r\n  border-top: 1px solid #c3e6cb;\r\n  font-weight: 600;\r\n}\r\n\r\n.sgd-profile-card__test-result--fail {\r\n  background: #f8d7da;\r\n  color: #721c24;\r\n  border-top: 1px solid #f5c6cb;\r\n}\r\n\r\n/* ── Inline delete confirmation ────────────────────────────────────────────── */\r\n\r\n.sgd-profile-card__confirm {\r\n  padding: 10px 16px;\r\n  background: #fff3cd;\r\n  border-top: 1px solid #ffeeba;\r\n  font-size: 12px;\r\n  color: #856404;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 8px;\r\n}\r\n\r\n.sgd-profile-card__confirm-actions {\r\n  display: flex;\r\n  gap: 8px;\r\n}\r\n\r\n/* ── Action button strip ───────────────────────────────────────────────────── */\r\n\r\n.sgd-profile-card__actions {\r\n  display: flex;\r\n  gap: 6px;\r\n  padding: 10px 16px;\r\n  border-top: 1px solid #f0f0f0;\r\n  background: #f8f9fa;\r\n}\r\n\r\n/* Small spinner variant ──────────────────────────────────────────────────── */\r\n\r\n.sgd-spinner--sm {\r\n  width: 12px;\r\n  height: 12px;\r\n  border-width: 2px;\r\n  display: inline-block;\r\n}\r\n\r\n/* Empty state icon ──────────────────────────────────────────────────────────── */\r\n\r\n.sgd-empty__icon {\r\n  font-size: 36px;\r\n  margin-bottom: 8px;\r\n}\r\n\r\n/* ══════════════════════════════════════════════════════════════════════════════\r\n   Profile detail screen\r\n   ══════════════════════════════════════════════════════════════════════════════ */\r\n\r\n.sgd-detail {\r\n  max-width: 600px;\r\n}\r\n\r\n/* ── Header ────────────────────────────────────────────────────────────────── */\r\n\r\n.sgd-detail__header {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 15px;\r\n  margin-bottom: 20px;\r\n}\r\n\r\n.sgd-detail__header-top {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 12px;\r\n}\r\n\r\n.sgd-detail__header-top > .sgd-btn {\r\n  flex-shrink: 0;\r\n  margin-top: 2px;\r\n}\r\n\r\n.sgd-detail__title-block {\r\n  flex: 1;\r\n  min-width: 0;\r\n}\r\n\r\n.sgd-detail__title {\r\n  font-size: 17px;\r\n  font-weight: 700;\r\n  margin: 0 0 2px;\r\n  color: #292929;\r\n  white-space: nowrap;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n}\r\n\r\n.sgd-detail__subtitle {\r\n  font-size: 12px;\r\n  color: #6c757d;\r\n  word-break: break-all;\r\n}\r\n\r\n.sgd-detail__header-actions {\r\n  display: flex;\r\n  gap: 6px;\r\n  justify-content: flex-end;\r\n}\r\n\r\n/* ── Section title ─────────────────────────────────────────────────────────── */\r\n\r\n.sgd-detail__section-title {\r\n  font-size: 11px;\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n  color: #6c757d;\r\n  margin: 0 0 10px;\r\n}\r\n\r\n/* ── Info rows (view mode) ─────────────────────────────────────────────────── */\r\n\r\n.sgd-detail__info-row {\r\n  display: flex;\r\n  gap: 12px;\r\n  align-items: baseline;\r\n  padding: 7px 0;\r\n  border-bottom: 1px solid #f0f0f0;\r\n  font-size: 12px;\r\n}\r\n\r\n.sgd-detail__info-row:last-child {\r\n  border-bottom: none;\r\n}\r\n\r\n.sgd-detail__info-label {\r\n  color: #6c757d;\r\n  font-size: 11px;\r\n  width: 110px;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-detail__info-val {\r\n  color: #292929;\r\n  word-break: break-all;\r\n}\r\n\r\n.sgd-detail__info-val--mono {\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 11px;\r\n}\r\n\r\n/* ── SSH test panel ────────────────────────────────────────────────────────── */\r\n\r\n.sgd-detail__ssh-test {\r\n  margin: 14px 0;\r\n  background: #fff;\r\n  border: 1px solid #e2e6ea;\r\n  border-radius: 6px;\r\n  padding: 14px 16px;\r\n}\r\n\r\n.sgd-detail__ssh-test-header {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  margin-bottom: 6px;\r\n}\r\n\r\n.sgd-detail__ssh-test-header .sgd-detail__section-title {\r\n  margin: 0;\r\n}\r\n\r\n.sgd-detail__ssh-working {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  font-size: 12px;\r\n  color: #6c757d;\r\n  padding: 6px 0;\r\n}\r\n\r\n.sgd-detail__ssh-ok {\r\n  padding: 4px 0;\r\n}\r\n\r\n.sgd-detail__ssh-ok-banner {\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  color: #155724;\r\n}\r\n\r\n/* ── Primary action buttons ────────────────────────────────────────────────── */\r\n\r\n.sgd-detail__actions {\r\n  display: flex;\r\n  gap: 10px;\r\n  margin-top: 16px;\r\n}\r\n\r\n/* ── Delete confirmation panel ─────────────────────────────────────────────── */\r\n\r\n.sgd-detail__delete-confirm {\r\n  background: #fff3cd;\r\n  border: 1px solid #ffeeba;\r\n  border-radius: 6px;\r\n  padding: 16px 18px;\r\n  font-size: 13px;\r\n  color: #856404;\r\n  margin-top: 16px;\r\n}\r\n\r\n.sgd-detail__delete-confirm p {\r\n  margin: 0 0 12px;\r\n  line-height: 1.6;\r\n}\r\n\r\n/* ── Edit form ─────────────────────────────────────────────────────────────── */\r\n\r\n.sgd-detail__edit-form {\r\n  background: #fff;\r\n  border: 1px solid #e2e6ea;\r\n  border-radius: 6px;\r\n  padding: 18px 20px;\r\n  margin-top: 4px;\r\n}\r\n\r\n.sgd-detail__edit-actions {\r\n  display: flex;\r\n  gap: 10px;\r\n  margin-top: 18px;\r\n  padding-top: 14px;\r\n  border-top: 1px solid #e2e6ea;\r\n}\r\n\r\n/* ═══════════════════════════════════════════════════════════════════════════\r\n   Deploy Screen\r\n   ══════════════════════════════════════════════════════════════════════════ */\r\n\r\n.sgd-deploy-screen {\r\n  padding: 0 4px;\r\n}\r\n\r\n/* ── Header ────────────────────────────────────────────────────────────────── */\r\n.sgd-deploy-header {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 12px;\r\n  margin-bottom: 18px;\r\n}\r\n\r\n.sgd-deploy-back { flex-shrink: 0; }\r\n\r\n.sgd-deploy-title {\r\n  margin: 0;\r\n  font-size: 18px;\r\n  font-weight: 700;\r\n  color: #292929;\r\n  line-height: 1.2;\r\n}\r\n\r\n.sgd-deploy-subtitle {\r\n  margin: 2px 0 0;\r\n  font-size: 12px;\r\n  color: #6c757d;\r\n}\r\n\r\n/* ── Info cards ────────────────────────────────────────────────────────────── */\r\n.sgd-deploy-info-card {\r\n  margin-bottom: 12px;\r\n  padding: 14px 16px;\r\n}\r\n\r\n.sgd-deploy-info-card__title {\r\n  margin: 0 0 10px;\r\n  font-size: 11px;\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.06em;\r\n  color: #6c757d;\r\n}\r\n\r\n.sgd-deploy-path-row {\r\n  display: flex;\r\n  align-items: baseline;\r\n  gap: 8px;\r\n  margin-bottom: 5px;\r\n  font-size: 12px;\r\n}\r\n\r\n.sgd-deploy-path-row:last-child { margin-bottom: 0; }\r\n\r\n.sgd-deploy-path-label {\r\n  flex-shrink: 0;\r\n  width: 72px;\r\n  color: #6c757d;\r\n  font-size: 11px;\r\n}\r\n\r\n.sgd-deploy-path-value {\r\n  flex: 1;\r\n  color: #292929;\r\n  word-break: break-all;\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 11px;\r\n}\r\n\r\n.sgd-deploy-path-value--error { color: #dc3545; }\r\n\r\n.sgd-deploy-path-badge {\r\n  flex-shrink: 0;\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  padding: 1px 6px;\r\n  border-radius: 10px;\r\n}\r\n\r\n.sgd-deploy-path-badge--ok    { background: #d4edda; color: #155724; }\r\n.sgd-deploy-path-badge--error { background: #f8d7da; color: #721c24; }\r\n\r\n.sgd-muted { color: #adb5bd; font-style: normal !important; }\r\n\r\n/* ── Target selection ──────────────────────────────────────────────────────── */\r\n.sgd-deploy-targets-card {\r\n  margin-bottom: 16px;\r\n  padding: 14px 16px;\r\n}\r\n\r\n.sgd-deploy-targets {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 8px;\r\n}\r\n\r\n.sgd-deploy-target {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  cursor: pointer;\r\n  font-size: 13px;\r\n  color: #292929;\r\n  user-select: none;\r\n}\r\n\r\n.sgd-deploy-target--disabled {\r\n  opacity: 0.45;\r\n  pointer-events: none;\r\n}\r\n\r\n.sgd-deploy-target__checkbox {\r\n  width: 15px;\r\n  height: 15px;\r\n  flex-shrink: 0;\r\n  accent-color: #5b7cf6;\r\n  cursor: pointer;\r\n}\r\n\r\n.sgd-deploy-target__name {\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 12px;\r\n  color: #292929;\r\n}\r\n\r\n.sgd-deploy-target__badge {\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  padding: 1px 7px;\r\n  border-radius: 10px;\r\n}\r\n\r\n.sgd-deploy-target__badge--missing { background: #e9ecef; color: #6c757d; }\r\n.sgd-deploy-target__badge--warn    { background: #fff3cd; color: #856404; }\r\n\r\n/* ── Directory tree picker ─────────────────────────────────────────────────── */\r\n.sgd-dir-tree__hint {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n  margin: 0 0 10px;\r\n}\r\n\r\n.sgd-dir-tree {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 2px;\r\n}\r\n\r\n.sgd-dir-tree__row {\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.sgd-dir-tree__item {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n  padding: 4px 6px;\r\n  border-radius: 4px;\r\n  user-select: none;\r\n}\r\n\r\n.sgd-dir-tree__item:hover { background: #f0f2f5; }\r\n\r\n.sgd-dir-tree__item--disabled {\r\n  opacity: 0.45;\r\n  pointer-events: none;\r\n}\r\n\r\n.sgd-dir-tree__expand {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  width: 18px;\r\n  height: 18px;\r\n  background: none;\r\n  border: 1px solid #dee2e6;\r\n  border-radius: 3px;\r\n  font-size: 13px;\r\n  line-height: 1;\r\n  color: #6c757d;\r\n  cursor: pointer;\r\n  flex-shrink: 0;\r\n  transition: transform 0.15s ease, background 0.1s ease;\r\n  padding: 0;\r\n}\r\n\r\n.sgd-dir-tree__expand:hover { background: #e9ecef; color: #292929; }\r\n\r\n.sgd-dir-tree__expand--open {\r\n  transform: rotate(90deg);\r\n  background: #e9ecef;\r\n  color: #292929;\r\n}\r\n\r\n.sgd-dir-tree__children {\r\n  margin-left: 42px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1px;\r\n  border-left: 2px solid #e9ecef;\r\n  padding-left: 10px;\r\n  margin-bottom: 4px;\r\n}\r\n\r\n.sgd-dir-tree__child {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n  padding: 3px 6px;\r\n  border-radius: 4px;\r\n  cursor: pointer;\r\n  user-select: none;\r\n  font-size: 12px;\r\n}\r\n\r\n.sgd-dir-tree__child:hover { background: #f0f2f5; }\r\n\r\n.sgd-dir-tree__child-icon { font-size: 12px; flex-shrink: 0; }\r\n.sgd-dir-tree__child-icon--file { opacity: 0.5; }\r\n\r\n.sgd-dir-tree__child-hint {\r\n  font-size: 10px;\r\n  color: #adb5bd;\r\n  font-style: italic;\r\n}\r\n\r\n.sgd-dir-tree__empty {\r\n  font-size: 11px;\r\n  color: #adb5bd;\r\n  padding: 4px 6px;\r\n  font-style: italic;\r\n}\r\n\r\n.sgd-dir-tree__full-hint {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n  margin: 4px 0 0;\r\n  font-style: italic;\r\n}\r\n\r\n.sgd-spinner--xs {\r\n  width: 10px;\r\n  height: 10px;\r\n  border-width: 1px;\r\n}\r\n\r\n/* ── Deploy action bar ─────────────────────────────────────────────────────── */\r\n.sgd-deploy-actions {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 14px;\r\n  margin: 16px 0;\r\n}\r\n\r\n.sgd-deploy-actions--done {\r\n  margin-top: 12px;\r\n}\r\n\r\n.sgd-deploy-actions__hint {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n}\r\n\r\n/* ── Deploy log ────────────────────────────────────────────────────────────── */\r\n.sgd-log--deploy {\r\n  max-height: 400px;\r\n  margin-bottom: 12px;\r\n}\r\n\r\n.sgd-log__line--info    { color: #adb5bd; }\r\n.sgd-log__line--success { color: #6edd8e; }\r\n.sgd-log__line--warning { color: #ffc107; }\r\n.sgd-log__line--error   { color: #ff6b6b; }\r\n\r\n.sgd-log__ts {\r\n  color: #555;\r\n  margin-right: 8px;\r\n  flex-shrink: 0;\r\n  font-size: 11px;\r\n  opacity: 0.7;\r\n}\r\n\r\n.sgd-log__msg { word-break: break-word; }\r\n\r\n/* ── Loading state ─────────────────────────────────────────────────────────── */\r\n.sgd-deploy-loading {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  font-size: 13px;\r\n  color: #6c757d;\r\n  padding: 20px 0;\r\n}\r\n\r\n/* ── Large button variant ──────────────────────────────────────────────────── */\r\n.sgd-btn--lg {\r\n  padding: 9px 22px;\r\n  font-size: 14px;\r\n}\r\n\r\n/* ── Danger button ─────────────────────────────────────────────────────────── */\r\n.sgd-btn--danger {\r\n  background: #dc3545;\r\n  color: #fff;\r\n  border: none;\r\n}\r\n.sgd-btn--danger:hover:not(:disabled) { background: #c82333; }\r\n.sgd-btn--danger:disabled { background: #e9acb0; color: #fff; cursor: not-allowed; }\r\n\r\n/* ── Warning button ────────────────────────────────────────────────────────── */\r\n.sgd-btn--warning {\r\n  background: #c47a00;\r\n  color: #fff;\r\n  border: none;\r\n}\r\n.sgd-btn--warning:hover:not(:disabled) { background: #a86800; }\r\n.sgd-btn--warning:disabled { background: #e2c07a; color: #fff; cursor: not-allowed; }\r\n\r\n/* ═══════════════════════════════════════════════════════════════════════════\r\n   Direction Toggle  (Push ↑ / Pull ↓)\r\n   ══════════════════════════════════════════════════════════════════════════ */\r\n\r\n.sgd-direction-toggle {\r\n  display: flex;\r\n  gap: 0;\r\n  margin-bottom: 16px;\r\n  border-radius: 8px;\r\n  overflow: hidden;\r\n  border: 2px solid #dee2e6;\r\n}\r\n\r\n.sgd-direction-toggle__btn {\r\n  flex: 1;\r\n  padding: 9px 16px;\r\n  background: #f8f9fa;\r\n  border: none;\r\n  cursor: pointer;\r\n  font-size: 13px;\r\n  font-weight: 500;\r\n  color: #495057;\r\n  transition: background 0.15s, color 0.15s;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: 6px;\r\n}\r\n\r\n.sgd-direction-toggle__btn + .sgd-direction-toggle__btn {\r\n  border-left: 2px solid #dee2e6;\r\n}\r\n\r\n.sgd-direction-toggle__btn:hover {\r\n  background: #e9ecef;\r\n}\r\n\r\n.sgd-direction-toggle__btn--active {\r\n  background: #910C1D;\r\n  color: #fff;\r\n  font-weight: 600;\r\n}\r\n\r\n.sgd-direction-toggle__btn--pull.sgd-direction-toggle__btn--active {\r\n  background: #c47a00;\r\n}\r\n\r\n.sgd-direction-toggle__arrow {\r\n  font-size: 15px;\r\n  line-height: 1;\r\n}\r\n\r\n/* ═══════════════════════════════════════════════════════════════════════════\r\n   Deploy Mode Tabs\r\n   ══════════════════════════════════════════════════════════════════════════ */\r\n\r\n.sgd-deploy-mode-tabs {\r\n  display: flex;\r\n  gap: 8px;\r\n  margin-bottom: 14px;\r\n}\r\n\r\n.sgd-deploy-mode-tab {\r\n  flex: 1;\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 10px;\r\n  padding: 12px 14px;\r\n  background: #f8f9fa;\r\n  border: 2px solid #dee2e6;\r\n  border-radius: 8px;\r\n  cursor: pointer;\r\n  text-align: left;\r\n  transition: border-color 0.15s, background 0.15s;\r\n}\r\n.sgd-deploy-mode-tab:hover {\r\n  border-color: #5b7cf6;\r\n  background: #f0f4ff;\r\n}\r\n.sgd-deploy-mode-tab--active {\r\n  border-color: #5b7cf6;\r\n  background: #f0f4ff;\r\n}\r\n.sgd-deploy-mode-tab--full-active {\r\n  border-color: #dc3545 !important;\r\n  background: #fff5f5 !important;\r\n}\r\n\r\n.sgd-deploy-mode-tab__icon {\r\n  font-size: 18px;\r\n  flex-shrink: 0;\r\n  margin-top: 1px;\r\n}\r\n.sgd-deploy-mode-tab__text {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 2px;\r\n}\r\n.sgd-deploy-mode-tab__text strong {\r\n  font-size: 13px;\r\n  color: #292929;\r\n  font-weight: 600;\r\n}\r\n.sgd-deploy-mode-tab__text small {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n  font-weight: 400;\r\n}\r\n\r\n/* ═══════════════════════════════════════════════════════════════════════════\r\n   Deploy Summary Card\r\n   ══════════════════════════════════════════════════════════════════════════ */\r\n\r\n.sgd-deploy-summary-card {\r\n  margin-bottom: 12px;\r\n  padding: 14px 16px;\r\n}\r\n\r\n.sgd-deploy-summary-rows {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 6px;\r\n}\r\n\r\n.sgd-deploy-summary-row {\r\n  display: flex;\r\n  align-items: baseline;\r\n  gap: 10px;\r\n  font-size: 12px;\r\n}\r\n\r\n.sgd-deploy-summary-label {\r\n  flex-shrink: 0;\r\n  width: 84px;\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n  font-weight: 500;\r\n}\r\n\r\n.sgd-deploy-summary-value {\r\n  flex: 1;\r\n  color: #292929;\r\n  word-break: break-all;\r\n}\r\n.sgd-deploy-summary-value--mono {\r\n  font-family: 'Consolas', 'Courier New', monospace;\r\n  font-size: 11px;\r\n}\r\n.sgd-deploy-summary-value--danger {\r\n  color: #dc3545;\r\n  font-weight: 600;\r\n}\r\n\r\n/* ═══════════════════════════════════════════════════════════════════════════\r\n   Full Deploy Danger Zone\r\n   ══════════════════════════════════════════════════════════════════════════ */\r\n\r\n.sgd-deploy-danger-zone {\r\n  background: #fff8f8;\r\n  border: 2px solid #dc3545;\r\n  border-radius: 8px;\r\n  margin-bottom: 14px;\r\n  overflow: hidden;\r\n}\r\n\r\n.sgd-deploy-danger-zone__header {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n  padding: 10px 16px;\r\n  background: #dc3545;\r\n  color: #fff;\r\n}\r\n\r\n.sgd-deploy-danger-zone__icon {\r\n  font-size: 18px;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-deploy-danger-zone__title {\r\n  margin: 0;\r\n  font-size: 13px;\r\n  font-weight: 700;\r\n  color: #fff;\r\n}\r\n\r\n.sgd-deploy-danger-zone__body {\r\n  padding: 14px 16px;\r\n}\r\n\r\n.sgd-deploy-danger-zone__lead {\r\n  margin: 0 0 12px;\r\n  font-size: 12px;\r\n  color: #4a1010;\r\n  line-height: 1.5;\r\n}\r\n\r\n.sgd-deploy-danger-zone__list {\r\n  margin: 0 0 14px;\r\n  padding: 0;\r\n  list-style: none;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 8px;\r\n}\r\n\r\n.sgd-deploy-danger-zone__list li {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 8px;\r\n  font-size: 12px;\r\n  color: #292929;\r\n  line-height: 1.5;\r\n}\r\n\r\n.sgd-dz-bullet {\r\n  flex-shrink: 0;\r\n  width: 18px;\r\n  text-align: center;\r\n  font-size: 13px;\r\n  margin-top: 1px;\r\n}\r\n.sgd-dz-bullet--safe   { color: #28a745; }\r\n.sgd-dz-bullet--warn   { color: #e0a800; }\r\n.sgd-dz-bullet--danger { color: #dc3545; font-weight: 700; }\r\n.sgd-dz-bullet--info   { color: #5b7cf6; }\r\n\r\n.sgd-deploy-danger-zone__confirm {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 10px;\r\n  background: #fff;\r\n  border: 1px solid #f5c6cb;\r\n  border-radius: 6px;\r\n  padding: 10px 12px;\r\n  cursor: pointer;\r\n  font-size: 12px;\r\n  color: #292929;\r\n  line-height: 1.5;\r\n}\r\n.sgd-deploy-danger-zone__confirm:hover {\r\n  border-color: #dc3545;\r\n  background: #fff5f5;\r\n}\r\n\r\n.sgd-deploy-danger-zone__checkbox {\r\n  flex-shrink: 0;\r\n  width: 15px;\r\n  height: 15px;\r\n  margin-top: 2px;\r\n  accent-color: #dc3545;\r\n  cursor: pointer;\r\n}\r\n\r\n.sgd-deploy-subtitle__status {\r\n  color: #6c757d;\r\n  font-weight: 400;\r\n}\r\n\r\n/* ═══ Activity Log screen ═══════════════════════════════════════════════════ */\r\n\r\n.sgd-activity-log {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 12px;\r\n}\r\n\r\n.sgd-activity-log__header {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 12px;\r\n}\r\n\r\n.sgd-activity-log__title {\r\n  margin: 0;\r\n  font-size: 16px;\r\n  font-weight: 600;\r\n}\r\n\r\n.sgd-activity-log__header-actions {\r\n  display: flex;\r\n  gap: 8px;\r\n  margin-left: auto;\r\n}\r\n\r\n.sgd-activity-log__loading {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  color: #6c757d;\r\n  padding: 24px 0;\r\n}\r\n\r\n.sgd-activity-log__list {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 6px;\r\n}\r\n\r\n/* ── Filter pills ─────────────────────────────────────────────────────────── */\r\n\r\n.sgd-activity-filter {\r\n  display: flex;\r\n  gap: 6px;\r\n  flex-wrap: wrap;\r\n}\r\n\r\n.sgd-activity-filter__pill {\r\n  padding: 4px 12px;\r\n  border-radius: 20px;\r\n  border: 1px solid #3a3a3c;\r\n  background: transparent;\r\n  color: #adb5bd;\r\n  font-size: 11px;\r\n  cursor: pointer;\r\n  transition: background 0.15s, color 0.15s, border-color 0.15s;\r\n}\r\n\r\n.sgd-activity-filter__pill:hover {\r\n  background: #2a2a2e;\r\n  color: #e9ecef;\r\n}\r\n\r\n.sgd-activity-filter__pill--active {\r\n  background: #1a73e8;\r\n  border-color: #1a73e8;\r\n  color: #fff;\r\n}\r\n\r\n/* ── Run card ─────────────────────────────────────────────────────────────── */\r\n\r\n.sgd-run-card {\r\n  border: 1px solid #2a2a2e;\r\n  border-radius: 6px;\r\n  overflow: hidden;\r\n  background: #1c1c1e;\r\n  transition: border-color 0.15s;\r\n}\r\n\r\n.sgd-run-card--expanded {\r\n  border-color: #3a3a3c;\r\n}\r\n\r\n.sgd-run-card__header {\r\n  width: 100%;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n  padding: 10px 14px;\r\n  background: transparent;\r\n  border: none;\r\n  cursor: pointer;\r\n  text-align: left;\r\n  color: inherit;\r\n  transition: background 0.12s;\r\n}\r\n\r\n.sgd-run-card__header:hover {\r\n  background: #252528;\r\n}\r\n\r\n.sgd-run-card__time {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-run-card__duration {\r\n  font-size: 11px;\r\n  color: #495057;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-run-card__targets {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n  font-family: monospace;\r\n  flex: 1;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}\r\n\r\n.sgd-run-card__chevron {\r\n  font-size: 10px;\r\n  color: #495057;\r\n  margin-left: auto;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-run-card__body {\r\n  border-top: 1px solid #2a2a2e;\r\n  padding: 12px 14px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 10px;\r\n}\r\n\r\n/* Metadata row inside expanded card */\r\n.sgd-run-card__meta {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  gap: 16px;\r\n}\r\n\r\n.sgd-run-card__meta-item {\r\n  font-size: 11px;\r\n  color: #6c757d;\r\n}\r\n\r\n.sgd-run-card__meta-item strong {\r\n  color: #adb5bd;\r\n  margin-right: 4px;\r\n}\r\n\r\n.sgd-run-card__meta-item--error {\r\n  color: #ff6b6b;\r\n}\r\n\r\n.sgd-run-card__meta-item--error strong {\r\n  color: #ff6b6b;\r\n}\r\n\r\n/* Entries inside expanded card */\r\n.sgd-run-card__entries {\r\n  max-height: 320px;\r\n  overflow-y: auto;\r\n  padding: 10px;\r\n  background: #111113;\r\n  border-radius: 4px;\r\n  font-family: 'Consolas', 'Menlo', monospace;\r\n  font-size: 11px;\r\n}\r\n\r\n.sgd-run-card__entries-loading,\r\n.sgd-run-card__entries-empty {\r\n  font-size: 12px;\r\n  color: #6c757d;\r\n  padding: 8px 0;\r\n}\r\n\r\n/* ── Action type badge ────────────────────────────────────────────────────── */\r\n\r\n.sgd-run-badge {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  padding: 2px 8px;\r\n  border-radius: 10px;\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  letter-spacing: 0.03em;\r\n  text-transform: uppercase;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-run-badge--code   { background: #1a3a5c; color: #63aff0; }\r\n.sgd-run-badge--full   { background: #3a1a1a; color: #f07063; }\r\n.sgd-run-badge--conn   { background: #1a3a2a; color: #63f0a8; }\r\n.sgd-run-badge--system { background: #2a2a2a; color: #6c757d; }\r\n\r\n/* ── Outcome badge ───────────────────────────────────────────────────────── */\r\n\r\n.sgd-run-outcome {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  padding: 2px 8px;\r\n  border-radius: 10px;\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-run-outcome--success { background: #1a3a2a; color: #6edd8e; }\r\n.sgd-run-outcome--failure { background: #3a1a1a; color: #ff6b6b; }\r\n.sgd-run-outcome--running { background: #2a2a1a; color: #ffc107; }\r\n\r\n/* ── Log entry row inside run card ──────────────────────────────────────── */\r\n\r\n.sgd-run-entry {\r\n  display: flex;\r\n  gap: 8px;\r\n  line-height: 1.5;\r\n  padding: 1px 0;\r\n}\r\n\r\n.sgd-run-entry__ts {\r\n  flex-shrink: 0;\r\n  color: #495057;\r\n  font-size: 11px;\r\n  padding-top: 1px;\r\n  min-width: 72px;\r\n}\r\n\r\n.sgd-run-entry__msg {\r\n  flex: 1;\r\n  word-break: break-word;\r\n}\r\n\r\n.sgd-run-entry__meta {\r\n  font-size: 11px;\r\n  color: #495057;\r\n  margin-left: 4px;\r\n  flex-shrink: 0;\r\n}\r\n\r\n/* ─── Full deploy — exclude directories ─────────────────────────────────────── */\r\n\r\n.sgd-deploy-exclude {\r\n  background: #fff;\r\n  border: 1px solid #dee2e6;\r\n  border-radius: 6px;\r\n  padding: 14px 16px;\r\n  margin-bottom: 12px;\r\n}\r\n\r\n.sgd-deploy-exclude__title {\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  margin: 0 0 6px;\r\n  color: #212529;\r\n}\r\n\r\n.sgd-deploy-exclude__hint {\r\n  font-size: 12px;\r\n  color: #6c757d;\r\n  margin: 0 0 10px;\r\n}\r\n\r\n.sgd-deploy-exclude__list {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 6px;\r\n}\r\n\r\n.sgd-deploy-exclude__item {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  cursor: pointer;\r\n  font-size: 13px;\r\n  user-select: none;\r\n}\r\n\r\n.sgd-deploy-exclude__checkbox {\r\n  width: 14px;\r\n  height: 14px;\r\n  cursor: pointer;\r\n  accent-color: #dc3545;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-deploy-exclude__name {\r\n  font-family: monospace;\r\n  font-size: 12px;\r\n  color: #212529;\r\n}\r\n\r\n.sgd-deploy-exclude__summary {\r\n  margin: 10px 0 0;\r\n  font-size: 12px;\r\n  color: #dc3545;\r\n}\r\n\r\n/* ── Archive format picker ─────────────────────────────────────────────────── */\r\n.sgd-deploy-format-picker__title {\r\n  margin: 0 0 4px;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n}\r\n\r\n.sgd-deploy-format-picker__hint {\r\n  margin: 0 0 12px;\r\n  font-size: 12px;\r\n  color: var(--text-muted, #888);\r\n}\r\n\r\n.sgd-deploy-format-picker__options {\r\n  display: flex;\r\n  gap: 10px;\r\n}\r\n\r\n.sgd-deploy-format-picker__option {\r\n  flex: 1;\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 8px;\r\n  padding: 10px 12px;\r\n  border: 1px solid var(--border, #3a3a3a);\r\n  border-radius: 6px;\r\n  cursor: pointer;\r\n  transition: border-color 0.15s, background-color 0.15s;\r\n}\r\n\r\n.sgd-deploy-format-picker__option:hover {\r\n  border-color: var(--accent, #4a90d9);\r\n}\r\n\r\n.sgd-deploy-format-picker__option--active {\r\n  border-color: var(--accent, #4a90d9);\r\n  background-color: rgba(74, 144, 217, 0.08);\r\n}\r\n\r\n.sgd-deploy-format-picker__option input[type=\"radio\"] {\r\n  margin-top: 2px;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.sgd-deploy-format-picker__option-body {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 2px;\r\n}\r\n\r\n.sgd-deploy-format-picker__option-body strong {\r\n  font-size: 13px;\r\n}\r\n\r\n.sgd-deploy-format-picker__desc {\r\n  font-size: 11px;\r\n  color: var(--text-muted, #888);\r\n  line-height: 1.4;\r\n}\r\n\r\n/* ── Deploy stop bar ──────────────────────────────────────────────────────── */\r\n.sgd-deploy-stop-bar {\r\n  display: flex;\r\n  justify-content: flex-end;\r\n  padding: 8px 0 0;\r\n}\r\n"],"sourceRoot":""}]);
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