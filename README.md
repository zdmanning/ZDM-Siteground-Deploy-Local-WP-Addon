# SiteGround Deploy

A [Local by WP Engine](https://localwp.com/) add-on that deploys your Local WordPress site to SiteGround over SSH — directly from the Local panel.

> **Disclaimer:** This add-on is an independent, community-built tool and is **not affiliated with, endorsed by, or in any way officially connected to SiteGround.com** or its parent company. The SiteGround name and logo are trademarks of SiteGround Hosting Ltd. Use of those marks here is solely for descriptive purposes.

**Author:** Zechariah Manning — [ZDM Designs](https://zdmdesigns.com)  
**Source:** [github.com/zdmanning/ZDM-Siteground-Deploy-Local-WP-Addon](https://github.com/zdmanning/ZDM-Siteground-Deploy-Local-WP-Addon)

---

## Contents

1. [What it does](#what-it-does)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Onboarding wizard](#onboarding-wizard)
5. [Deploying](#deploying)
   - [Code-only deploy](#code-only-deploy)
   - [Full deploy](#full-deploy)
   - [Database-only deploy](#database-only-deploy)
   - [Archive format](#archive-format)
   - [Stopping a deploy](#stopping-a-deploy)
6. [Activity log](#activity-log)
7. [Profile management](#profile-management)
   - [Viewing a profile](#viewing-a-profile)
   - [Editing a profile](#editing-a-profile)
   - [Cloning a profile](#cloning-a-profile)
   - [Deleting a profile](#deleting-a-profile)
8. [Addon settings](#addon-settings)
   - [Settings tab](#settings-tab)
   - [Export profiles](#export-profiles)
   - [Import profiles](#import-profiles)
   - [Addon backup](#addon-backup)
   - [About tab](#about-tab)
9. [Minimizing the panel](#minimizing-the-panel)
10. [Migrating to a new machine](#migrating-to-a-new-machine)
11. [Safety warnings](#safety-warnings)
12. [Troubleshooting](#troubleshooting)
13. [Development guide](#development-guide)
14. [Roadmap](#roadmap)

---

## What it does

SiteGround Deploy gives Local a **Deploy** panel that lets you push your Local WordPress site to a SiteGround-hosted production environment without leaving the app.

Three deploy modes are available:

| Mode | What it syncs |
|---|---|
| **Code-only** | Selected `wp-content` subdirectories — themes, plugins, mu-plugins, or uploads. You can expand top-level folders in the tree picker to select individual plugins or themes. Database is untouched. |
| **Full deploy** | The entire `wp-content` directory **plus** the local database, with automatic remote DB backup and domain search-replace. |
| **Database-only** | Exports the local database and overwrites only the remote database. No files are touched. |

Authentication uses **SSH key pairs** (Ed25519). Keys are generated locally, stored on your machine, and never transmitted as passwords. The add-on supports multiple saved **profiles**, each pointing to a different SiteGround site, so you can deploy to staging and production without re-entering credentials.

Each profile stores a **default deploy mode** (`code`, `full`, or `db`). When you click Deploy from the dashboard or profile detail screen, the deploy screen pre-selects that mode automatically.

Deploys can be **stopped mid-flight** at any point — including during the file upload phase. Cancellation tears down the active SFTP connection and automatically removes any partial temp files left on the remote server.

---

## Prerequisites

### For use (no development)
- **Local by WP Engine** 6.5.2 or later
- A **SiteGround hosting account** with at least one active WordPress site
- Access to the **SiteGround User Area** (my.siteground.com)

### For development / rebuilding from source
- **Node.js** 18 LTS or later
- **npm** 9+ (bundled with Node.js 18)
- Windows 11 with PowerShell

---

## Installation

The add-on must be placed in Local's add-on directory so Local discovers it on startup.

### Option A — Copy folder (recommended)

1. Copy `siteground-deploy/` to:
   ```
   %APPDATA%\Local\addons\siteground-deploy\
   ```
   The pre-built `lib/` and `node_modules/` directories must be present. No `npm install` step is required.

2. Start (or restart) Local.

3. The **SiteGround Deploy** panel appears in the Local sidebar.

### Option B — Restore from addon backup zip

If you previously saved a backup zip from **Settings → About → Save addon backup**, you can restore it directly:

1. Unzip the file to:
   ```
   %APPDATA%\Local\addons\siteground-deploy\
   ```
2. Open a terminal in that directory and run:
   ```powershell
   npm install
   npm run build
   ```
3. Restart Local.

> **Profiles and SSH keys are not included in the addon backup zip.** To fully restore your deploy profiles and SSH keys, also import a `.sgdexport` file via **Settings → Import profiles** after Local loads. See [Migrating to a new machine](#migrating-to-a-new-machine).

### Option C — Install from `.tgz` archive

1. Extract the archive and move the contents:
   ```powershell
   $dest = "$env:APPDATA\Local\addons\siteground-deploy"
   New-Item -ItemType Directory -Force $dest
   tar -xzf local-addon-siteground-deploy-*.tgz -C $dest --strip-components=1
   ```
2. Restart Local.

> **How Local discovers the add-on:**  
> Local scans `%APPDATA%\Local\addons\` on startup. It reads each subfolder's `package.json` and loads it as an add-on if `keywords` contains `"local-addon"`. The `main` and `renderer` fields in `package.json` point to the compiled entry points in `lib/`.

---

## Onboarding wizard

The wizard runs once per deployment profile. It walks you through generating an SSH key pair, adding it to SiteGround, and verifying the connection. **Setup takes about 5 minutes.**

Start the wizard by clicking **+ New Profile** in the SiteGround Deploy panel.

---

### Step 1 — Introduction

Explains what the add-on does and what to expect. No input required. Click **Get started** to proceed.

---

### Step 2 — Prepare SiteGround

Before the wizard generates a key, you need to **collect your SSH credentials from SiteGround**. The wizard prompts you to do this now so you have the information ready for the next screen.

**What to collect:**

1. Log in to [my.siteground.com](https://my.siteground.com).
2. Open **Site Tools** for your target site.
3. Go to **Devs → SSH Keys Manager**.
4. Your **SSH host**, **username**, and **port** are shown on the right side of that page under **SSH Credentials**.

> **Do not create an SSH key in SiteGround yet.** The wizard generates a key pair for you locally in the next step. You paste the public key into SiteGround in Step 5.

> **SiteGround uses port 18765**, not the standard SSH port 22. This is pre-filled for you.

---

### Step 3 — Connection details

Fill in the form with the credentials you just collected.

| Field | Description | Example |
|---|---|---|
| **Profile name** | A label for this deployment target | `BIOHM Production` |
| **SSH host** | From the SSH Credentials panel in SiteGround's Devs → SSH Keys Manager | `ssh.yourdomain.com` |
| **SSH port** | Pre-filled as `18765` — change only if SiteGround tells you otherwise | `18765` |
| **SSH username** | Your SiteGround SSH user | `u12345678` |
| **Remote web root** | Just type your domain name (e.g. `example.com`) — the prefix `/home/customer/www/` and suffix `/public_html` are pre-filled | `example.com` |

All fields are required. Validation runs on submit and highlights any errors inline.

> **Production domain** is auto-derived from the remote web root when the profile is saved. For example, `example.com` becomes `https://example.com`. You can override it later in profile edit if needed.

Click **Generate SSH key →** when the form is complete.

---

### Step 4 — Key generation

The wizard generates an **Ed25519 SSH key pair** on your machine the moment this step loads. No internet connection is required.

- A cryptographically unique key pair is created using Node.js's built-in `crypto` module.
- The **private key** is saved to disk in OpenSSH PEM format:
  ```
  %APPDATA%\Roaming\Local\siteground-deploy\keys\{keyId}
  ```
- The **public key** is saved alongside it:
  ```
  %APPDATA%\Roaming\Local\siteground-deploy\keys\{keyId}.pub
  ```
- The private key **never leaves your machine**. The renderer only ever receives the public key string.

---

### Step 5 — Add public key to SiteGround

The wizard displays your full public key with a **Copy** button.

1. Open [my.siteground.com](https://my.siteground.com) — keep the wizard screen open.
2. Open **Site Tools → Devs → SSH Keys Manager**.
3. Click the **Import** tab.
4. Give the key a name, e.g. `Local Deploy`, and paste the entire public key (begins with `ssh-ed25519`).
5. Save, then verify the key shows as **Active**.

> SiteGround can take **30–60 seconds** to propagate a newly activated key. If the connection test fails immediately, wait a minute and retry.

---

### Step 6 — Test connection

Click **Test Connection**. The wizard opens an SSH session, runs `pwd && whoami`, and displays the server's response on success.

If the test fails, click **← Back** to correct credentials, then retry.

---

### Step 7 — Review and save

A summary table shows every piece of configuration. Review it and click **Save profile**.

---

### Step 8 — Complete

Two options are offered:
- **View profile** — opens the profile detail view.
- **Deploy now** — goes straight to the deploy screen.

---

## Deploying

Open the **SiteGround Deploy** panel and select a profile from the dashboard.

### Dashboard profile cards

Each card shows profile name, deploy mode pill, last-deployed timestamp, SSH host, username, and production domain. Four action buttons appear on each card:

| Button | Action |
|---|---|
| **Deploy** | Opens the deploy screen pre-selecting the profile's default mode |
| **Test SSH** | Runs an inline SSH connection test |
| **Edit** | Opens the profile detail / edit view |
| **Delete** | Confirms, then permanently removes the profile and key files |

---

### Code-only deploy

Syncs selected `wp-content` subdirectories. Database is not touched.

**Directory tree picker** — expandable tree: check a top-level folder to deploy the entire directory, or click **›** to expand and select individual sub-folders. `themes` and `plugins` are pre-selected by default.

**Pipeline:** validate → archive → upload → extract → rsync → cache flush → cleanup.

---

### Full deploy

Syncs the **entire `wp-content` directory** and **overwrites the production database**.

> **Read the [Safety warnings](#safety-warnings) section before running a full deploy.**

**What a full deploy does — in order:**

1. Validates paths.
2. Exports local database to `.sql` via WP-CLI (falls back to `mysqldump`).
3. Archives all `wp-content` subdirectories not in the exclusion list.
4. Uploads archive and `.sql` via SFTP.
5. **Creates a mandatory remote database backup** to `{remoteWebRoot}/sgd-db-backups/`.
6. Extracts archive, rsyncs files, imports database.
7. Runs domain search-replace across all tables.
8. Flushes caches (WP object cache → Elementor CSS → SiteGround dynamic cache).
9. Cleans up temp files.

---

### Database-only deploy

Exports and imports only the database. No files are touched.

> **Read the [Safety warnings](#safety-warnings) section before running a database-only deploy.**

Same mandatory remote DB backup, search-replace, and cache flush as full deploy.

---

### Archive format

| Format | Compression | Best for |
|---|---|---|
| **ZIP** *(default)* | Level 1 (fast) | Most deploys |
| **TAR** | None | Very slow connections |

---

### Stopping a deploy

A **■ Stop deploy** button appears while any deploy is running. Clicking it cancels the pipeline, tears down SFTP, and cleans up remote temp files. Safe to cancel at any point before the database import begins.

---

## Activity log

The **Activity Log** tab shows a history of every deploy and SSH test run for the current profile. Each run card shows action badge, outcome, timestamp, duration, and targets. Click a card to expand it and see individual log entries. Use the filter pills to filter by run type. **Clear logs** deletes all history for the current profile.

---

## Profile management

### Viewing a profile

Shows all settings read-only: SSH host/port/username, remote web root, production domain, SSH key ID, last deploy timestamp, default deploy mode, and confirmation checkbox default.

### Editing a profile

All fields are editable: name, SSH credentials, remote web root, production domain, linked Local site, default deploy mode, and per-profile confirmation checkbox default.

### Cloning a profile

Duplicates the profile with a new name and optionally a new remote web root. Shares the same SSH key. Useful for staging/production pairs.

### Deleting a profile

Permanently removes the profile record and its SSH key files. Logs are also removed.

---

## Addon settings

Open **Settings** from the toolbar in the SiteGround Deploy panel. The Settings panel has two tabs: **Settings** and **About**.

---

### Settings tab

#### Danger-zone confirmation checkbox default

Controls whether the *"I have read the above"* checkbox on Full deploy and Database-only deploy screens starts pre-checked or unchecked.

- **Default: unchecked** — user must actively confirm each destructive deploy.
- **Pre-checked** — useful for frequent deploys to staging.

Individual profiles can override this setting via the **Confirmation checkbox default** field in profile edit (`Inherit from global` / `Always pre-checked` / `Always unchecked`).

---

### Export profiles

Exports selected profiles to a **`.sgdexport`** file including their SSH private keys. The export file contains everything needed to fully restore your deploy setup on another machine.

- Select individual profiles or use **Select all**.
- Click **Export Selected** — a save dialog opens, defaulting to `.sgdexport`.
- ⚠️ The export file contains **SSH private keys in plain text**. Treat it like a password — store it securely and do not share it.

---

### Import profiles

Imports a `.sgdexport` file. A two-stage flow:

1. Click **Import from file…** — picks a file and shows a preview table with all profiles in the file.
2. For any profile that conflicts with an existing profile, choose an action per-row:
   - **Skip** — do not import this profile.
   - **Overwrite** — replace the existing profile and its key files.
   - **Import as copy** — import with a new ID (rename).
3. Click **Apply Import** to commit.

A result summary shows how many profiles were imported, overwritten, renamed, and skipped.

---

### Addon backup

Saves a **ZIP archive of the entire addon folder** (all source files, `package.json`, config, etc.) to a location you choose. `node_modules/` and `lib/` (the build output) are excluded to keep the file small.

- Click **Save addon backup (.zip)…** — a save dialog opens with a suggested filename like `siteground-deploy-backup-2026-04-20.zip`.
- Cancelling the dialog resets the button with no error.
- **This backup does not include your profiles or SSH keys.** To fully restore your deploy state, also export your profiles via the Export section above.

---

### About tab

Shows version, author information, links, and the disclaimer. Also contains the [addon backup](#addon-backup) button.

**Disclaimer:** This add-on is not affiliated with, endorsed by, or in any way officially connected to SiteGround.com or its parent company.

---

## Minimizing the panel

Click the **–** button in the panel header to minimize the SiteGround Deploy panel. When minimized:

- The panel header bar snaps to the **bottom of the Local window**, pinned at the exact same width and horizontal position as the open panel.
- All panel content is hidden.
- Click **+** in the minimized bar to restore the panel to full size.

The panel never changes width or leaves the Local layout — `position: fixed` is applied only during minimized state, with the width and left offset captured at the moment of minimization.

---

## Migrating to a new machine

For a complete restore of the addon and all your deploy profiles:

1. **Install the addon** on the new machine — copy the folder to `%APPDATA%\Local\addons\siteground-deploy\` (see [Installation](#installation)).
2. **Import your profiles** — open Settings → Import profiles, pick your `.sgdexport` file, and apply.

That's it. All profiles and SSH keys are restored and you can deploy immediately — no re-running the wizard, no re-keying SiteGround.

The only things not transferred:
- The `confirmDefault` global setting (one toggle to re-set)
- Activity log history

---

## Safety warnings

### Code-only deploy
- Remote files **not present locally are deleted** from synced directories.
- `uploads/` is opt-in — media libraries can be hundreds of gigabytes.

### Full deploy

> **A full deploy overwrites the production database. This is destructive and partially irreversible.**

- The remote database backup is **automatic and mandatory** — its path is printed in the activity log.
- All `wp-content` subdirectories not excluded will be synced; directories present remotely but absent locally are **deleted**.
- A full deploy **cannot be automatically undone** once the database import completes. Restore from `sgd-db-backups/` if needed.
- Do not close Local during a full deploy.

### Database-only deploy

> **A database-only deploy overwrites the production database. The same warnings apply.**

- A remote DB backup is **always created** before import.
- If local and remote WordPress table prefixes differ, the remote `wp-config.php` is updated and stale tables are dropped automatically.

---

## Troubleshooting

### Add-on not visible in Local

- Confirm the folder is at exactly `%APPDATA%\Local\addons\siteground-deploy\`.
- Confirm `lib/main.js` and `lib/renderer.js` exist. If not, rebuild — see [Development guide](#development-guide).
- Fully quit and relaunch Local.

### SSH test fails immediately after key activation

SiteGround key propagation can take **30–60 seconds**. Wait a minute, then retry.

### "Authentication failed" / "Public key rejected"

1. Confirm the key shows as **Active** in SiteGround's SSH Keys Manager.
2. Confirm the SSH username is the SSH user, not your SiteGround account email.
3. If you regenerated the key, add the new public key to SiteGround and activate it.

### "Connection refused"

- Port 18765 is correct. Port 22 will be refused.
- Confirm the hostname is copied exactly from the SSH Keys Manager.

### Deploy fails with "Local wp-content directory not found"

The Local site's file path has changed. Open the profile, click Edit, re-link the Local site, and save.

### Code deploy succeeds but changes do not appear

The add-on flushes three caches automatically. If still not visible: flush manually from SiteGround's Speed → Caching panel, clear any CDN cache, and hard-refresh the browser (Ctrl+Shift+R).

### Full deploy: database import succeeded but site shows broken URLs

The profile's production domain was derived or set incorrectly. Update the profile, then run manually via SSH:
```bash
wp search-replace 'http://my-site.local' 'https://example.com' --all-tables \
  --path=/home/customer/www/example.com/public_html
```

### Full deploy or database deploy: import failed mid-way

The activity log shows the error and the remote backup path. To restore:
```bash
wp db import /home/customer/www/example.com/public_html/sgd-db-backups/db-{runId}-{timestamp}.sql \
  --path=/home/customer/www/example.com/public_html
```

### "Cannot find module 'ssh2'" or similar

Run from the project root:
```powershell
npm install --omit=dev
```

---

## Development guide

### Node.js version
Use **Node.js 18 LTS** or later.

### Install dependencies
```powershell
cd "$env:APPDATA\Local\addons\siteground-deploy"
npm install
```

### npm scripts

| Command | Description |
|---|---|
| `npm run build` | Development build with source maps |
| `npm run build:prod` | Production build — minified, no source maps |
| `npm run watch` | Rebuild on every file save |
| `npm run build:main` | Build main process only |
| `npm run build:renderer` | Build renderer only |
| `npm run clean` | Delete and recreate the `lib/` directory |
| `npm pack` | Create distributable `.tgz` (runs `build:prod` first) |

### Daily development loop

1. Start the watcher:
   ```powershell
   npm run watch
   ```
2. Start Local. The add-on loads from the current `lib/` files.
3. Edit files in `src/`. Webpack rebuilds `lib/` automatically on save.
4. **Main-process changes** (`src/main/`) require a full Local restart.  
   **Renderer-only changes** (`src/renderer/`) may be hot-reloaded with Ctrl+Shift+R.

### Project structure

```
src/
  main/
    index.js                  IPC handler registration — main entry point
    adapters/
      local-app.js            Isolation layer over Local's internal APIs
    services/
      archiver-service.js     Creates zip/tar archives of wp-content directories
      database-service.js     Local DB export, remote backup/import, search-replace, cache flush
      deploy-service.js       Orchestrates code-only, full, and database-only deploy pipelines
      export-service.js       Profile export (.sgdexport) and import with conflict resolution
      key-manager.js          Ed25519 key generation and disk storage
      local-mysql-repair-service.js  Repairs stale mysqld processes on the local machine
      logger.js               Structured run + entry logging to disk
      profile-store.js        electron-store based profile persistence
      profile-validator.js    Validation rules for profile fields
      settings-store.js       electron-store based global addon settings
      sftp-service.js         SFTP file upload via ssh2-sftp-client (cancelable mid-flight)
      ssh-service.js          SSH connection testing and persistent exec handle
  renderer/
    index.jsx             Renderer entry point
    App.jsx               Shell router — also manages minimize state
    ipc.js                Thin wrappers over ipcRenderer.invoke calls
    components/           Shared UI components (Header, FormField, CopyableCode, etc.)
    screens/              Full-page views (Dashboard, DeployScreen, ActivityLog, Settings)
    styles/
      global.css          Global scoped CSS (.sgd-app namespace)
    utils/
      validate.js         Client-side form validation helpers
    wizard/
      WizardContainer.jsx Wizard state machine and step router
      steps/              Individual wizard step components (Step1–Step8)
lib/
  main.js                 Compiled main bundle (do not edit)
  renderer.js             Compiled renderer bundle (do not edit)
```

### Data storage

All persistent data is stored under `%APPDATA%\Roaming\Local\siteground-deploy\`:

| Path | Contents |
|---|---|
| `profiles.json` | All saved profiles (managed by electron-store) |
| `settings.json` | Global addon settings — `confirmDefault` |
| `keys/{keyId}` | Private key — OpenSSH PEM format |
| `keys/{keyId}.pub` | Public key — OpenSSH wire format |
| `logs/` | Structured deploy run history and log entries |

> Note: this data is **not** included in the addon backup zip. Use the profile export feature to back up profiles and keys separately.

### Building for distribution

```powershell
npm run build:prod
npm pack
# → local-addon-siteground-deploy-{version}.tgz
```

---

## Roadmap

- **TOFU host key pinning** — trust-on-first-use fingerprint verification per profile.
- **Rollback** — one-click restore from any remote backup listed in `sgd-db-backups/`.
- **Scheduled deploys** — cron-style automatic code deploys from Local.
- **Deploy diff preview** — file-level diff between local source and remote destination before committing.
- **Multi-site support** — deploy a single profile to multiple SiteGround sites in one action.
- **Progress bar for archive creation** — byte-level progress for large `wp-content` directories.
- **Partial rollback for interrupted full deploys** — auto-restore DB backup on mid-import failure.

---

## License

MIT — see `package.json`.

> This add-on is not affiliated with or endorsed by SiteGround or WP Engine / Local by WP Engine.


---

## Contents

1. [What it does](#what-it-does)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Onboarding wizard](#onboarding-wizard)
   - [Step 1 — Introduction](#step-1--introduction)
   - [Step 2 — Prepare SiteGround](#step-2--prepare-siteground)
   - [Step 3 — Connection details](#step-3--connection-details)
   - [Step 4 — Key generation](#step-4--key-generation)
   - [Step 5 — Add public key to SiteGround](#step-5--add-public-key-to-siteground)
   - [Step 6 — Test connection](#step-6--test-connection)
   - [Step 7 — Review and save](#step-7--review-and-save)
   - [Step 8 — Complete](#step-8--complete)
5. [Deploying](#deploying)
   - [Code-only deploy](#code-only-deploy)
   - [Full deploy](#full-deploy)
   - [Database-only deploy](#database-only-deploy)
   - [Archive format](#archive-format)
   - [Stopping a deploy](#stopping-a-deploy)
6. [Activity log](#activity-log)
7. [Profile management](#profile-management)
8. [Addon settings](#addon-settings)
9. [Safety warnings](#safety-warnings)
10. [Troubleshooting](#troubleshooting)
11. [Development guide](#development-guide)
12. [Roadmap](#roadmap)

---

## What it does

SiteGround Deploy gives Local a **Deploy** panel that lets you push your Local WordPress site to a SiteGround-hosted production environment without leaving the app.

Three deploy modes are available:

| Mode | What it syncs |
|---|---|
| **Code-only** | Selected `wp-content` subdirectories — themes, plugins, mu-plugins, or uploads. You can expand top-level folders in the tree picker to select individual plugins or themes. Database is untouched. |
| **Full deploy** | The entire `wp-content` directory **plus** the local database, with automatic remote DB backup and domain search-replace |
| **Database-only** | Exports the local database and overwrites only the remote database. No files are touched. |

Authentication uses **SSH key pairs** (Ed25519). Keys are generated locally, stored on your machine, and never transmitted as passwords. The add-on supports multiple saved **profiles**, each pointing to a different SiteGround site, so you can deploy to staging and production without re-entering credentials.

Each profile stores a **default deploy mode** (`code`, `full`, or `db`). When you click Deploy from the dashboard or profile detail screen, the deploy screen pre-selects that mode automatically.

Deploys can be **stopped mid-flight** at any point — including during the file upload phase. Cancellation tears down the active SFTP connection and automatically removes any partial temp files left on the remote server.

---

## Prerequisites

### For use (no development)
- **Local by WP Engine** 6.5.2 or later
- A **SiteGround hosting account** with at least one active WordPress site
- Access to the **SiteGround User Area** (my.siteground.com)

### For development / rebuilding from source
- **Node.js** 18 LTS or later
- **npm** 9+ (bundled with Node.js 18)
- Windows 11 with PowerShell

---

## Installation

The add-on must be placed in Local's add-on directory so Local discovers it on startup.

### Option A — Copy folder (recommended)

1. Copy `siteground-deploy/` to:
   ```
   %APPDATA%\Local\addons\siteground-deploy\
   ```
   The pre-built `lib/` and `node_modules/` directories must be present. No `npm install` step is required.

2. Start (or restart) Local.

3. The **SiteGround Deploy** panel appears in the Local sidebar.

### Option B — Install from `.tgz` archive

1. Extract the archive and move the contents:
   ```powershell
   $dest = "$env:APPDATA\Local\addons\siteground-deploy"
   New-Item -ItemType Directory -Force $dest
   tar -xzf local-addon-siteground-deploy-*.tgz -C $dest --strip-components=1
   ```

2. Restart Local.

> **How Local discovers the add-on**  
> Local scans `%APPDATA%\Local\addons\` on startup. It reads each subfolder's `package.json` and loads it as an add-on if `keywords` contains `"local-addon"`. The `main` and `renderer` fields in `package.json` point to the compiled entry points in `lib/`.

---

## Onboarding wizard

The wizard runs once per deployment profile. It walks you through generating an SSH key pair, adding it to SiteGround, and verifying the connection. **Setup takes about 5 minutes.**

Start the wizard by clicking **+ New Profile** in the SiteGround Deploy panel.

---

### Step 1 — Introduction

Explains what the add-on does and what to expect. No input required. Click **Get started** to proceed.

---

### Step 2 — Prepare SiteGround

Before the wizard generates a key, you need to **collect your SSH credentials from SiteGround**. The wizard prompts you to do this now so you have the information ready for the next screen.

**What to collect:**

1. Log in to [my.siteground.com](https://my.siteground.com).
2. Open **Site Tools** for your target site.
3. Go to **Devs → SSH Keys Manager**.
4. Your **SSH host**, **username**, and **port** are shown on the right side of that page under **SSH Credentials**.

> **Do not create an SSH key in SiteGround yet.** The wizard generates a key pair for you locally in the next step. You paste the public key into SiteGround in Step 5.

> **SiteGround uses port 18765**, not the standard SSH port 22. This is pre-filled for you.

---

### Step 3 — Connection details

Fill in the form with the credentials you just collected.

| Field | Description | Example |
|---|---|---|
| **Profile name** | A label for this deployment target | `BIOHM Production` |
| **SSH host** | From the SSH Credentials panel in SiteGround's Devs → SSH Keys Manager | `ssh.yourdomain.com` |
| **SSH port** | Pre-filled as `18765` — change only if SiteGround tells you otherwise | `18765` |
| **SSH username** | Your SiteGround SSH user | `u12345678` |
| **Remote web root** | Just type your domain name (e.g. `example.com`) — the prefix `/home/customer/www/` and suffix `/public_html` are pre-filled around it | `example.com` |

All fields are required. Validation runs on submit and highlights any errors inline.

> **Production domain** is **auto-derived** from the remote web root when the profile is saved. For example, `example.com` becomes `https://example.com`. You can override it later in profile edit if needed.

Click **Generate SSH key →** when the form is complete.

---

### Step 4 — Key generation

The wizard generates an **Ed25519 SSH key pair** on your machine the moment this step loads. No internet connection is required.

What happens:
- A cryptographically unique key pair is created using Node.js's built-in `crypto` module (no external programs, no shell commands).
- The **private key** is saved to disk in OpenSSH PEM format, readable only by your Windows user account:
  ```
  %APPDATA%\Roaming\Local\siteground-deploy\keys\{keyId}
  ```
- The **public key** is saved alongside it:
  ```
  %APPDATA%\Roaming\Local\siteground-deploy\keys\{keyId}.pub
  ```
- The private key **never leaves your machine**. The renderer only ever receives the public key string.

The key ID (a UUID) is displayed on screen. If generation fails, click **Retry key generation** — this is safe to do.

Click **Next** once the key is shown as generated successfully.

---

### Step 5 — Add public key to SiteGround

The wizard displays your full public key with a **Copy** button. Follow these steps in SiteGround:

1. Open [my.siteground.com](https://my.siteground.com) in your browser — **keep the wizard screen open**.
2. Open **Site Tools** for your target site, then go to **Devs → SSH Keys Manager**.
3. Click the **Import** tab.
4. Give the key a name, e.g. `Local Deploy`, and paste the entire public key into the **Public Key** field.  
   It must begin with `ssh-ed25519`.
5. Save, then verify the key shows as **Active** in the list.
   > An inactive key is silently rejected — the connection test will fail.

6. Return to the wizard and check **"I have pasted the public key into SiteGround and it is now Active"**.

> SiteGround can take **30–60 seconds** to propagate a newly activated key. If the connection test in the next step fails immediately after activation, wait a minute and retry.

---

### Step 6 — Test connection

The wizard tests the SSH connection using your credentials and the newly activated key, **before saving the profile**.

Click **Test Connection**. The wizard:
1. Opens an SSH session to `{sshHost}:{sshPort}`.
2. Runs `pwd && whoami` to confirm shell access.
3. Displays the server's response on success.

**Success** — the server is reachable, the key is accepted, and shell access works. The profile is ready to save.

**Failure** — a user-friendly error message explains the likely cause:
- `Connection refused` — wrong host or port
- `Authentication failed` — key not activated in SiteGround, or wrong username
- `Host not found` — hostname is incorrect
- `Connection timed out` — port 18765 is blocked by a firewall or the host is unreachable

If the test fails, click **← Back** to correct credentials or re-activate the key in SiteGround, then return and retry.

You may click **Skip** to save the profile without testing, but deploys will fail until the connection is verified. A warning is shown in the profile summary if the test was skipped.

---

### Step 7 — Review and save

A summary table shows every piece of configuration collected during the wizard. Review it carefully.

| Field | Notes |
|---|---|
| Profile name | Your saved label for this deployment target |
| SSH host:port | Verify the server and port before saving |
| SSH username | The SSH user that will be used for deploys |
| Remote web root | Shown in monospace — verify this path is correct |
| SSH key | Ed25519, identified by the first 8 characters of the key ID |
| Connection test | Shown as `Passed ✓` or `Not tested / skipped` (highlighted amber) |

Click **Save profile**. The profile is written to:
```
%APPDATA%\Roaming\Local\siteground-deploy\profiles.json
```

If saving fails, the error is shown inline. Click **← Back** to correct any field and retry.

---

### Step 8 — Complete

The profile is saved and ready to use. Two options are offered:

- **View profile** — opens the profile detail view where you can edit settings, re-run the SSH test, or view deploy history.
- **Deploy now** — goes straight to the deploy screen for this profile.

You never need to re-run the wizard for this profile. Your connection settings are saved permanently.

---

## Deploying

Open the **SiteGround Deploy** panel and select a profile from the dashboard.

### Dashboard profile cards

Each profile card on the dashboard shows:
- Profile name, deploy mode pill (**Code only** / **Full deploy** / **DB only**), and last-deployed timestamp
- SSH host and username
- Production domain

Four action buttons appear on each card without needing to open the profile:

| Button | Action |
|---|---|
| **Deploy** | Opens the deploy screen, pre-selecting the profile's default deploy mode |
| **Test SSH** | Runs an inline SSH connection test and shows the result on the card |
| **Edit** | Opens the profile detail / edit view |
| **Delete** | Prompts for confirmation, then permanently removes the profile and its key files |

---

### Deploy screen overview

Clicking **Deploy** opens the deploy screen, which loads a **preflight summary** automatically:

- **Deploy summary card** — shows profile name, SSH host, remote path, production domain, and selected mode
- **Local source card** — shows the linked Local site name and `wp-content` path with a green/red reachability indicator. If the Local site is stopped or the path has moved, the deploy button is disabled and an error banner is shown.

Three mode tabs appear at the top of the deploy screen. Click any tab to switch mode. The button at the bottom changes colour and label to match the selected mode.

---

### Code-only deploy

Syncs selected `wp-content` subdirectories from your Local site to the production server. The database is **not touched**.

**Directory tree picker** — instead of flat checkboxes, the code-only mode shows an expandable directory tree:
- Check a top-level folder (e.g. `plugins`) to deploy the entire directory.
- Click **›** to expand a folder and select individual sub-folders (e.g. deploy only `plugins/woocommerce` rather than all plugins).
- A dash (—) in the checkbox means the folder is partially selected.
- `themes` and `plugins` are pre-selected by default.

**Top-level targets:**

| Target | Notes |
|---|---|
| `themes` | Recommended — selected by default |
| `plugins` | Recommended — selected by default |
| `mu-plugins` | Opt-in |
| `uploads` | ⚠ Opt-in — media libraries can be very large and slow to transfer |

Targets that do not exist locally are shown with a **not found locally — will skip** badge and are automatically omitted from the deploy.

**Archive format** — before deploying, choose between **ZIP** (default) or **TAR** (uncompressed). See [Archive format](#archive-format).

**Pipeline:**

1. Validates the local `wp-content` path and remote web root.
2. Creates an archive (`.zip` or `.tar`) of the selected directories in a local temp folder.
3. Uploads the archive to a temp directory on the server via SFTP.
4. Extracts the archive on the server.
5. Syncs each directory using `rsync` (falls back to `rm + cp` if rsync is unavailable).
6. Flushes three caches in order:
   - WordPress object cache (`wp cache flush`)
   - Elementor CSS cache (`wp elementor flush_css`)
   - SiteGround cache (`wp sg purge` when sg-cachepress is active; otherwise falls back to deleting `wp-content/cache/sgo-cache/`)
7. Deletes the remote temp directory.
8. Deletes the local temp archive.
9. Records `lastDeployedAt` on the profile.

All steps emit real-time log lines in the deploy panel. A code-only deploy for themes and plugins typically completes in under 30 seconds on a fast connection.

---

### Full deploy

Syncs the **entire `wp-content` directory** and **overwrites the production database**.

> **Read the [Safety warnings](#safety-warnings) section before running a full deploy.**

**Archive format** — same ZIP / TAR picker as code-only deploy.

**Directory exclusions** — the deploy screen lists every subdirectory found in the remote `wp-content`. Tick any directory to skip it in this deploy without deleting it. The following are **always excluded** (no checkbox shown):

- `sgd-db-backups` — the addon's own backup folder

The following are **pre-checked by default** if they exist on the remote server:

- `backups-dup-lite` — Duplicator Pro backup files
- `updraft` — UpdraftPlus backup files

You can uncheck any pre-selected directory, or check additional ones. A summary line at the bottom shows which directories will be skipped.

**What a full deploy does — in order:**

1. Validates the local `wp-content` path and remote web root.
2. Exports the local database to a temporary `.sql` file using WP-CLI (falls back to `mysqldump`).
3. Archives all `wp-content` subdirectories not in the exclusion list.
4. Uploads the archive via SFTP.
5. Uploads the `.sql` file via SFTP.
6. Opens an SSH connection.
7. **Creates a backup of the remote database** at:
   ```
   {remoteWebRoot}/sgd-db-backups/db-{runId}-{timestamp}.sql
   ```
   **This step is mandatory. The deploy aborts if the backup fails.**
8. Extracts the archive on the server.
9. Syncs every `wp-content` subdirectory (rsync → cp fallback). Files present remotely but absent locally are deleted.
10. Imports the local `.sql` into the remote database (WP-CLI → mysql CLI fallback).
11. Runs **domain search-replace**: replaces your Local dev domain (e.g. `my-site.local`) with the production domain across all database tables (WP-CLI `search-replace --all-tables`).
12. Flushes caches in order:
    - WordPress object cache (`wp cache flush`)
    - Elementor CSS cache (`wp elementor flush_css`)
    - SiteGround dynamic cache (`wp sg purge` via the sg-cachepress plugin)
    - **Fallback if sg-cachepress is not active**: directly deletes `wp-content/cache/sgo-cache/` via SSH
13. Cleans up the remote temp directory.
14. Records `lastDeployedAt` on the profile.

The danger-zone confirmation checkbox must be checked before the **Full deploy** button becomes active.

---

### Database-only deploy

Exports the local database and imports it into the remote server, **without touching any files**. This is the fastest way to push content changes (posts, settings, ACF fields) when code has not changed.

> **Read the [Safety warnings](#safety-warnings) section before running a database-only deploy.**

**What a database-only deploy does — in order:**

1. Validates the profile has a linked Local site and a valid remote web root.
2. Exports the local database to a temporary `.sql` file using WP-CLI (falls back to `mysqldump`).
3. Uploads the `.sql` file via SFTP to a temp directory on the server.
4. Opens an SSH connection.
5. **Creates a backup of the remote database** at:
   ```
   {remoteWebRoot}/sgd-db-backups/db-{runId}-{timestamp}.sql
   ```
   **This step is mandatory. The deploy aborts if the backup fails.**
6. Imports the local `.sql` into the remote database (WP-CLI → mysql CLI fallback).
7. If the local and remote WordPress table prefixes differ, the remote `wp-config.php` is updated and stale tables using the old prefix are dropped.
8. Runs **domain search-replace**: replaces your Local dev domain with the production domain across all database tables.
9. Flushes caches (same three-step sequence as other modes).
10. Cleans up the remote temp directory. The remote DB backup is retained.
11. Records `lastDeployedAt` on the profile.

The danger-zone confirmation checkbox must be checked before the **Deploy database** button becomes active.

---

### Archive format

Code-only and full deploy modes offer an **Archive format** picker before the deploy starts:

| Format | Compression | Best for |
|---|---|---|
| **ZIP** *(default)* | Level 1 (fast) | Most deploys — smaller upload, fast enough on modern hardware |
| **TAR** | None | Very slow connections where CPU is cheaper than bandwidth, or for debugging |

The format choice is per-deploy and does not affect the profile's saved settings. Database-only deploy does not use an archive.

---

### Stopping a deploy

A **■ Stop deploy** button appears in the deploy panel while any deploy is running. Clicking it:

1. Signals the deploy pipeline to cancel.
2. If a file upload is in progress, the SFTP connection is torn down immediately — the upload stops mid-flight.
3. An SSH cleanup command (`rm -rf`) runs against the remote temp directory to remove any partial upload.
4. The deploy panel shows a **cancelled** result: "Deploy cancelled. Your site was not changed."

Cancellation is safe at any point **before** the database import begins. If cancelled after the database import has started, treat it as a failed deploy and restore from the automatic backup.

If the database import fails, the activity log shows:
- The exact error from the server.
- The path to the remote database backup.
- A manual `wp db import` command you can run via terminal to recover.

---

## Activity log

The **Activity Log** tab in the deploy panel shows a history of every deploy and SSH test run for the current profile.

- Runs are shown as cards with an action badge (Code deploy / Full deploy / Database deploy / Connection test), outcome (success / failure), timestamp, and duration.
- Targets synced and the SSH host are shown in the card header row.
- Click any run card to expand it and see every individual log entry with timestamps and colour-coded severity (info / success / warning / error).
- An expanded card has a **⍘ Copy log** button that copies all log entries for that run to the clipboard as plain text.
- Use the filter pills at the top to show only a specific type of run.
- A **Clear logs** button at the top right deletes all activity log history for the current profile after confirmation. This cannot be undone.

Logs are persisted to disk and survive Local restarts.

---

## Profile management

Each saved profile can be viewed, edited, cloned, or deleted from the **Profile Detail** screen. Open it by clicking a profile on the dashboard.

### Viewing a profile

The profile detail screen shows a read-only summary of all settings, including:

- SSH host, port, and username
- Remote web root
- Production domain
- SSH key ID
- Last deploy timestamp
- Default deploy mode
- Confirmation checkbox default (inherited from global or overridden per-profile)

### Editing a profile

Click **Edit** to open the inline edit form. All fields are editable:

| Field | Notes |
|---|---|
| Profile name | |
| SSH host, port, username | |
| Remote web root | Smart split input — enter just the domain name |
| **Production domain** | Your live site URL (e.g. `https://example.com`). Used for domain search-replace during full and database-only deploys. |
| Linked Local site | Re-link to a different Local site if the site was moved or renamed |
| Default deploy mode | `Code only`, `Full deploy`, or `Database only` — pre-selects the mode on the deploy screen |
| **Confirmation checkbox default** | Controls whether the danger-zone checkbox starts pre-checked for this profile. Options: `Inherit from global addon setting`, `Always pre-checked`, or `Always unchecked`. |

Saving writes the changes to `profiles.json` immediately. No wizard steps need to be repeated.

### Cloning a profile

Click **Clone** to duplicate the profile. The clone panel asks for a new profile name, remote web root, and lets you optionally re-link to a different Local site. All other settings — including deploy mode and confirmation checkbox default — are copied from the source profile. A new SSH key pair is **not** generated; the clone shares the same key as the original.

Clone is useful for creating staging/production pairs where all SSH credentials are identical except the remote web root.

### Deleting a profile

Click **Delete** and confirm. The profile record and its SSH key files are permanently removed. Logs for the deleted profile are also removed.

---

## Addon settings

Open **Settings** from the toolbar in the SiteGround Deploy panel.

### Danger-zone confirmation checkbox default

Controls whether the *"I have read the above"* checkbox on the Full deploy and Database-only deploy screens starts **pre-checked or unchecked** when a new deploy session opens.

- **Default: unchecked** — the user must actively confirm before each destructive deploy. This is the recommended setting.
- **Pre-checked** — the checkbox is checked automatically when the deploy screen loads. Useful if you are deploying frequently to a development or staging environment and the extra click creates friction.

This is a **global setting** that applies to all profiles. Individual profiles can override it:

- In profile edit, the **Confirmation checkbox default** field has three options:
  - `Inherit from global addon setting` — follows whatever this Settings toggle is set to (default for all new profiles).
  - `Always pre-checked for this profile` — overrides the global setting for this profile only.
  - `Always unchecked for this profile` — overrides the global setting for this profile only.

The resolved value (after applying the override chain) is evaluated at deploy-screen load time and shown as the initial checkbox state.

---

## Safety warnings

### Code-only deploy
- **Remote files not present locally are deleted** from synced directories. For example, if you delete a plugin locally and deploy, it is removed from production. If this is not your intent, deselect that target or expand the tree picker to select only specific sub-folders.
- `uploads/` is opt-in specifically because media libraries can be hundreds of gigabytes. Selecting it on accident will start a very long upload.

### Full deploy

> **A full deploy overwrites the production database. This is a destructive, partially irreversible operation. Read every point below.**

- The remote database **backup is automatic** and runs as the first server-side step. Its path is printed in the activity log. Keep this until you confirm the deploy was successful.
- The backup is a raw SQL dump stored in `{remoteWebRoot}/sgd-db-backups/`. SiteGround does not automatically clean this folder — periodically delete old backups via SFTP or SSH, or use the **Delete Remote DB Backups** button in the profile detail screen.
- **All** `wp-content` subdirectories are synced in a full deploy (unless excluded). Any directory present remotely but not locally will be **deleted**. This includes custom upload directories and any directories added by the host.
- The production domain used for search-replace is normally auto-derived from the remote web root when the profile is created. If that derived value is wrong and you do not override it in profile edit, the deploy can replace URLs with the wrong domain.
- A full deploy **cannot be automatically undone** once the database import completes. To roll back: restore the remote database from the backup in `sgd-db-backups/`, then selectively re-upload any files you want to revert.
- Do not close Local during a full deploy. If the process is interrupted mid-import, your remote database may be in a partially imported state. Use the backup to restore.

### Database-only deploy

> **A database-only deploy overwrites the production database. The same warnings that apply to a full deploy's database step apply here.**

- A remote database backup is **always created** before the import. Its path is shown in the activity log and the backup is retained on the server even after a successful deploy.
- If the local and remote WordPress table prefixes differ, the remote `wp-config.php` is updated and stale tables under the old prefix are dropped automatically. Review the activity log to confirm this was correct.
- The production database **cannot be automatically undone** once the import completes. Restore from `sgd-db-backups/` if needed.

---

## Troubleshooting

### Add-on not visible in Local

- Confirm the folder is at exactly `%APPDATA%\Local\addons\siteground-deploy\`.
- Confirm `package.json` contains `"keywords": ["local-addon"]`.
- Confirm `lib/main.js` and `lib/renderer.js` exist. If not, rebuild: see [Development guide](#development-guide).
- Fully quit and relaunch Local (File → Quit, or close from the system tray).

---

### SSH test fails immediately after key activation

SiteGround key propagation can take **30–60 seconds** after you click Activate. Wait a minute, then click **Test Connection** again.

---

### "Authentication failed" / "Public key rejected"

1. Confirm the key shows as **Active** (not just saved) in SiteGround's **Devs → SSH Keys Manager**.
2. Confirm the SSH **username** matches what SiteGround shows — it must be the SSH user, not your SiteGround account email.
3. If you regenerated the key after saving the profile, the old public key is still in SiteGround. Add the new public key and activate it, or delete the old entry first.

---

### "Connection refused"

- Port 18765 is the correct SiteGround SSH port. Port 22 will be refused.
- Confirm the SSH hostname is copied exactly as shown in the SSH Keys Manager — not the website URL.

---

### Deploy fails with "Local wp-content directory not found"

The Local site's file path has changed or the site was moved. Open the profile, click Edit, re-link the Local site, and save.

---

### Deploy fails with "Remote web root is not a valid absolute path"

The remote web root field contains a Windows-style path (backslashes) or is empty. It must be a POSIX absolute path: `/home/customer/www/example.com/public_html`. Edit the profile and correct it.

---

### Code deploy succeeds but changes do not appear on the site

The add-on automatically flushes three caches at the end of every code and full deploy: WordPress object cache, Elementor CSS cache, and SiteGround cache. If changes still aren't visible:

1. If the deploy log shows a cache flush warning, manually flush from SiteGround's **Speed → Caching** panel.
2. Clear any CDN or Cloudflare cache if applicable.
3. Hard-refresh the browser (Ctrl+Shift+R).

> The SiteGround dynamic cache flush (`wp sg purge`) requires the **sg-cachepress** plugin to be active. If it is not installed, the add-on falls back to deleting `wp-content/cache/sgo-cache/` directly — the file cache is cleared but the NGINX-level dynamic cache is not. In that case, use SiteGround's control panel to flush the dynamic cache manually.

---

### Full deploy: database import succeeded but site shows broken URLs

The profile's production domain was derived incorrectly from the remote web root, or it was manually overridden to the wrong value. Update the profile, then run the replacement manually via SSH:
```bash
wp search-replace 'http://my-site.local' 'https://example.com' --all-tables --path=/home/customer/www/example.com/public_html
```

---

### Full deploy or database deploy: import failed mid-way

The activity log shows the exact error and the path to the remote database backup. To restore:
```bash
# On the remote server via SSH:
wp db import /home/customer/www/example.com/public_html/sgd-db-backups/db-{runId}-{timestamp}.sql \
  --path=/home/customer/www/example.com/public_html
```

---

### Database deploy: table prefix mismatch

If your local WordPress uses a different table prefix than the remote (e.g. `wp_` vs `wp2_`), the add-on automatically updates the remote `wp-config.php` and drops the now-stale tables. If this fails, the activity log will say so. You can fix it manually:
```bash
# On the remote server, edit wp-config.php and change $table_prefix to match your local value
# Then drop the old prefix tables:
wp db query "DROP TABLE IF EXISTS wp2_options, wp2_posts, ..." --path=/path/to/public_html
```

---

### "Cannot find module 'ssh2'" or similar at runtime

The `node_modules/` directory is missing or incomplete. Run from the project root:
```powershell
npm install --omit=dev
```

---

### npm run build errors with "SyntaxError" or "Cannot use import statement"

All code in `src/main/` must use CommonJS (`require` / `module.exports`). ES module `import`/`export` syntax is not supported in the main process bundle. The renderer (`src/renderer/`) may use ES module syntax — Babel handles the transform.

---

## Development guide

### Node.js version
Use **Node.js 18 LTS** or later. Check with:
```powershell
node --version   # must be 18.x or higher
```

### Install dependencies
```powershell
cd "$env:APPDATA\Local\addons\siteground-deploy"
npm install
```

### npm scripts

| Command | Description |
|---|---|
| `npm run build` | Development build with source maps |
| `npm run build:prod` | Production build — minified, no source maps |
| `npm run watch` | Rebuild on every file save (development) |
| `npm run build:main` | Build main process only |
| `npm run build:renderer` | Build renderer only |
| `npm run clean` | Delete and recreate the `lib/` directory |
| `npm pack` | Create distributable `.tgz` (runs `build:prod` first) |

### Daily development loop

1. Reload PATH in a new terminal (required on Windows after first install):
   ```powershell
   $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
   ```

2. Start the watcher:
   ```powershell
   npm run watch
   ```

3. Start Local. The add-on loads from the current `lib/` files.

4. Edit files in `src/`. Webpack rebuilds `lib/` automatically on save.

5. **Main-process changes** (`src/main/`) require a full Local restart to take effect.  
   **Renderer-only changes** (`src/renderer/`) may be picked up with Ctrl+Shift+R in Local's window — if not, restart Local.

### Project structure

```
src/
  main/
    index.js              IPC handler registration — main entry point
    adapters/
      local-app.js        Isolation layer over Local's internal APIs
    services/
      archiver-service.js Creates zip/tar archives of wp-content directories
      database-service.js Local DB export, remote backup/import, search-replace, cache flush
      deploy-service.js   Orchestrates code-only, full, and database-only deploy pipelines
      key-manager.js            Ed25519 key generation and disk storage
      local-mysql-repair-service.js  Repairs stale mysqld processes on the local machine
      logger.js                 Structured run + entry logging to disk
      profile-store.js          electron-store based profile persistence
      profile-validator.js      Validation rules for profile fields
      settings-store.js         electron-store based global addon settings
      sftp-service.js           SFTP file upload via ssh2-sftp-client (cancelable mid-flight)
      ssh-service.js            SSH connection testing and persistent exec handle
  renderer/
    index.jsx             Renderer entry point — exports App as default
    App.jsx               Shell router (Dashboard / ProfileDetail / Deploy / Logs)
    ipc.js                Thin wrappers over ipcRenderer.invoke calls
    components/           Shared UI components (FormField, CopyableCode, etc.)
    screens/              Full-page views (Dashboard, DeployScreen, ActivityLog, Settings, etc.)
    styles/               Global CSS (global.css)
    utils/
      validate.js         Client-side form validation helpers
    wizard/
      WizardContainer.jsx Wizard state machine and step router
      steps/              Individual wizard step components (Step1–Step8)
lib/
  main.js                 Compiled main bundle (do not edit)
  renderer.js             Compiled renderer bundle (do not edit)
```

### Data storage

All persistent data is stored under `%APPDATA%\Roaming\Local\siteground-deploy\`:

| Path | Contents |
|---|---|
| `profiles.json` | All saved profiles (managed by electron-store) |
| `settings.json` | Global addon settings, e.g. `confirmDefault` (managed by electron-store) |
| `keys/{keyId}` | Private key — OpenSSH PEM format, owner-read-only |
| `keys/{keyId}.pub` | Public key — OpenSSH wire format |
| `logs/` | Structured deploy run history and log entries |

### Building for distribution

```powershell
npm run build:prod
npm pack
# → local-addon-siteground-deploy-{version}.tgz
```

`bundledDependencies` in `package.json` ensures that `ssh2`, `ssh2-sftp-client`, `archiver`, `electron-store`, `node-forge`, and `uuid` are included in the archive so the target machine does not need to run `npm install`.

---

## Roadmap

The following features are planned for future releases:

- **TOFU host key pinning** — trust-on-first-use fingerprint verification per profile, eliminating the current `hostVerifier: () => true` bypass.
- **Rollback** — one-click restore from any remote backup listed in `sgd-db-backups/`.
- **Scheduled deploys** — cron-style automatic code deploys from Local.
- **Deploy diff preview** — show a file-level diff between the local source and remote destination before committing.
- **Multi-site support** — map a single profile to multiple SiteGround sites (staging + production) and deploy to both in one action.
- **SFTP upload timeout** — configurable per-file timeout for large uploads (currently inherits session-level timeout).
- **Windows WP-CLI path detection** — automatic discovery of WP-CLI in non-standard locations on Windows.
- **Progress bar for archive creation** — surface byte-level progress in the UI for large wp-content directories.
- **Partial rollback for interrupted full deploys** — detect a mid-import failure and offer to restore the db backup automatically.

---

## License

MIT — see `package.json`.

> This add-on is not affiliated with or endorsed by SiteGround or WP Engine / Local by WP Engine.


---

## Contents

1. [What it does](#what-it-does)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Onboarding wizard](#onboarding-wizard)
   - [Step 1 — Introduction](#step-1--introduction)
   - [Step 2 — Prepare SiteGround](#step-2--prepare-siteground)
   - [Step 3 — Connection details](#step-3--connection-details)
   - [Step 4 — Key generation](#step-4--key-generation)
   - [Step 5 — Add public key to SiteGround](#step-5--add-public-key-to-siteground)
   - [Step 6 — Test connection](#step-6--test-connection)
   - [Step 7 — Review and save](#step-7--review-and-save)
   - [Step 8 — Complete](#step-8--complete)
5. [Deploying](#deploying)
   - [Code-only deploy](#code-only-deploy)
   - [Full deploy](#full-deploy)
   - [Archive format](#archive-format)
   - [Stopping a deploy](#stopping-a-deploy)
6. [Activity log](#activity-log)
7. [Profile management](#profile-management)
8. [Safety warnings](#safety-warnings)
9. [Troubleshooting](#troubleshooting)
10. [Development guide](#development-guide)
11. [Roadmap](#roadmap)

---

## What it does

SiteGround Deploy gives Local a **Deploy** panel that lets you push your Local WordPress site to a SiteGround-hosted production environment without leaving the app.

Two deploy modes are available:

| Mode | What it syncs |
|---|---|
| **Code-only** | Selected `wp-content` subdirectories — themes, plugins, mu-plugins, or uploads |
| **Full deploy** | The entire `wp-content` directory **plus** the local database, with automatic remote DB backup and domain search-replace |

Authentication uses **SSH key pairs** (Ed25519). Keys are generated locally, stored on your machine, and never transmitted as passwords. The add-on supports multiple saved **profiles**, each pointing to a different SiteGround site, so you can deploy to staging and production without re-entering credentials.

Each profile stores a **default deploy mode** (`code` or `full`). When you click Deploy from the dashboard or profile detail screen, the deploy screen pre-selects that mode automatically.

Deploys can be **stopped mid-flight** at any point — including during the file upload phase. Cancellation tears down the active SFTP connection and automatically removes any partial temp files left on the remote server.

---

## Prerequisites

### For use (no development)
- **Local by WP Engine** 6.5.2 or later
- A **SiteGround hosting account** with at least one active WordPress site
- Access to the **SiteGround User Area** (my.siteground.com)

### For development / rebuilding from source
- **Node.js** 18 LTS or later
- **npm** 9+ (bundled with Node.js 18)
- Windows 11 with PowerShell

---

## Installation

The add-on must be placed in Local's add-on directory so Local discovers it on startup.

### Option A — Copy folder (recommended)

1. Copy `siteground-deploy/` to:
   ```
   %APPDATA%\Local\addons\siteground-deploy\
   ```
   The pre-built `lib/` and `node_modules/` directories must be present. No `npm install` step is required.

2. Start (or restart) Local.

3. The **SiteGround Deploy** panel appears in the Local sidebar.

### Option B — Install from `.tgz` archive

1. Extract the archive and move the contents:
   ```powershell
   $dest = "$env:APPDATA\Local\addons\siteground-deploy"
   New-Item -ItemType Directory -Force $dest
   tar -xzf local-addon-siteground-deploy-*.tgz -C $dest --strip-components=1
   ```

2. Restart Local.

> **How Local discovers the add-on**  
> Local scans `%APPDATA%\Local\addons\` on startup. It reads each subfolder's `package.json` and loads it as an add-on if `keywords` contains `"local-addon"`. The `main` and `renderer` fields in `package.json` point to the compiled entry points in `lib/`.

---

## Onboarding wizard

The wizard runs once per deployment profile. It walks you through generating an SSH key pair, adding it to SiteGround, and verifying the connection. **Setup takes about 5 minutes.**

Start the wizard by clicking **+ New Profile** in the SiteGround Deploy panel.

---

### Step 1 — Introduction

Explains what the add-on does and what to expect. No input required. Click **Get started** to proceed.

---

### Step 2 — Prepare SiteGround

Before the wizard generates a key, you need to **collect your SSH credentials from SiteGround**. The wizard prompts you to do this now so you have the information ready for the next screen.

**What to collect:**

1. Log in to [my.siteground.com](https://my.siteground.com).
2. Open **Site Tools** for your target site.
3. Go to **Devs → SSH Keys Manager**.
4. Your **SSH host**, **username**, and **port** are shown on the right side of that page under **SSH Credentials**.

> **Do not create an SSH key in SiteGround yet.** The wizard generates a key pair for you locally in the next step. You paste the public key into SiteGround in Step 5.

> **SiteGround uses port 18765**, not the standard SSH port 22. This is pre-filled for you.

---

### Step 3 — Connection details

Fill in the form with the credentials you just collected.

| Field | Description | Example |
|---|---|---|
| **Profile name** | A label for this deployment target | `BIOHM Production` |
| **SSH host** | From the SSH Credentials panel in SiteGround's Devs → SSH Keys Manager | `ssh.yourdomain.com` |
| **SSH port** | Pre-filled as `18765` — change only if SiteGround tells you otherwise | `18765` |
| **SSH username** | Your SiteGround SSH user | `u12345678` |
| **Remote web root** | Just type your domain name (e.g. `example.com`) — the prefix `/home/customer/www/` and suffix `/public_html` are pre-filled around it | `example.com` |

All fields are required. Validation runs on submit and highlights any errors inline.

> **Production domain** is **auto-derived** from the remote web root when the profile is saved. For example, `example.com` becomes `https://example.com`. You can override it later in profile edit if needed.

Click **Generate SSH key →** when the form is complete.

---

### Step 4 — Key generation

The wizard generates an **Ed25519 SSH key pair** on your machine the moment this step loads. No internet connection is required.

What happens:
- A cryptographically unique key pair is created using Node.js's built-in `crypto` module (no external programs, no shell commands).
- The **private key** is saved to disk in OpenSSH PEM format, readable only by your Windows user account:
  ```
  %APPDATA%\Roaming\Local\siteground-deploy\keys\{keyId}
  ```
- The **public key** is saved alongside it:
  ```
  %APPDATA%\Roaming\Local\siteground-deploy\keys\{keyId}.pub
  ```
- The private key **never leaves your machine**. The renderer only ever receives the public key string.

The key ID (a UUID) is displayed on screen. If generation fails, click **Retry key generation** — this is safe to do.

Click **Next** once the key is shown as generated successfully.

---

### Step 5 — Add public key to SiteGround

The wizard displays your full public key with a **Copy** button. Follow these steps in SiteGround:

1. Open [my.siteground.com](https://my.siteground.com) in your browser — **keep the wizard screen open**.
2. Open **Site Tools** for your target site, then go to **Devs → SSH Keys Manager**.
3. Click the **Import** tab.
4. Give the key a name, e.g. `Local Deploy`, and paste the entire public key into the **Public Key** field.  
   It must begin with `ssh-ed25519`.
5. Save, then verify the key shows as **Active** in the list.
   > An inactive key is silently rejected — the connection test will fail.

6. Return to the wizard and check **"I have pasted the public key into SiteGround and it is now Active"**.

> SiteGround can take **30–60 seconds** to propagate a newly activated key. If the connection test in the next step fails immediately after activation, wait a minute and retry.

---

### Step 6 — Test connection

The wizard tests the SSH connection using your credentials and the newly activated key, **before saving the profile**.

Click **Test Connection**. The wizard:
1. Opens an SSH session to `{sshHost}:{sshPort}`.
2. Runs `pwd && whoami` to confirm shell access.
3. Displays the server's response on success.

**Success** — the server is reachable, the key is accepted, and shell access works. The profile is ready to save.

**Failure** — a user-friendly error message explains the likely cause:
- `Connection refused` — wrong host or port
- `Authentication failed` — key not activated in SiteGround, or wrong username
- `Host not found` — hostname is incorrect
- `Connection timed out` — port 18765 is blocked by a firewall or the host is unreachable

If the test fails, click **← Back** to correct credentials or re-activate the key in SiteGround, then return and retry.

You may click **Skip** to save the profile without testing, but deploys will fail until the connection is verified. A warning is shown in the profile summary if the test was skipped.

---

### Step 7 — Review and save

A summary table shows every piece of configuration collected during the wizard. Review it carefully.

| Field | Notes |
|---|---|
| Profile name | Your saved label for this deployment target |
| SSH host:port | Verify the server and port before saving |
| SSH username | The SSH user that will be used for deploys |
| Remote web root | Shown in monospace — verify this path is correct |
| SSH key | Ed25519, identified by the first 8 characters of the key ID |
| Connection test | Shown as `Passed ✓` or `Not tested / skipped` (highlighted amber) |

Click **Save profile**. The profile is written to:
```
%APPDATA%\Roaming\Local\siteground-deploy\profiles.json
```

If saving fails, the error is shown inline. Click **← Back** to correct any field and retry.

---

### Step 8 — Complete

The profile is saved and ready to use. Two options are offered:

- **View profile** — opens the profile detail view where you can edit settings, re-run the SSH test, or view deploy history.
- **Deploy now** — goes straight to the deploy screen for this profile.

You never need to re-run the wizard for this profile. Your connection settings are saved permanently.

---

## Deploying

Open the **SiteGround Deploy** panel and select a profile from the dashboard.

### Dashboard profile cards

Each profile card on the dashboard shows:
- Profile name, deploy mode pill (**Code only** or **Full deploy**), and last-deployed timestamp
- SSH host and username
- Production domain

Four action buttons appear on each card without needing to open the profile:

| Button | Action |
|---|---|
| **Deploy** | Opens the deploy screen, pre-selecting the profile's default deploy mode |
| **Test SSH** | Runs an inline SSH connection test and shows the result on the card |
| **Edit** | Opens the profile detail / edit view |
| **Delete** | Prompts for confirmation, then permanently removes the profile and its key files |

---

### Deploy screen overview

Clicking **Deploy** opens the deploy screen, which loads a **preflight summary** automatically:

- **Deploy summary card** — shows profile name, SSH host, remote path, production domain, and selected mode
- **Local source card** — shows the linked Local site name and `wp-content` path with a green/red reachability indicator. If the Local site is stopped or the path has moved, the deploy button is disabled and an error banner is shown.

---

### Code-only deploy

Syncs selected `wp-content` subdirectories from your Local site to the production server. The database is **not touched**.

**Selectable targets:**

| Target | Notes |
|---|---|
| `themes` | Recommended — selected by default |
| `plugins` | Recommended — selected by default |
| `mu-plugins` | Opt-in |
| `uploads` | ⚠ Opt-in — media libraries can be very large and slow to transfer |

Targets that do not exist locally are shown with a **not found locally — will skip** badge and are automatically omitted from the deploy.

**Archive format** — before deploying, choose between **ZIP** (default, recommended) or **TAR** (uncompressed). ZIP applies level-1 compression, which typically reduces archive size 3–5× for PHP/CSS/JS files and results in a faster total transfer despite the extra compression time. TAR produces a larger archive but has no CPU overhead.

**Pipeline:**

1. Validates the local `wp-content` path and remote web root.
2. Creates an archive (`.zip` or `.tar`) of the selected directories in a local temp folder.
3. Uploads the archive to a temp directory on the server via SFTP.
4. Extracts the archive on the server.
5. Syncs each directory using `rsync` (falls back to `rm + cp` if rsync is unavailable).
6. Flushes three caches in order:
   - WordPress object cache (`wp cache flush`)
   - Elementor CSS cache (`wp elementor flush_css`)
   - SiteGround cache (`wp sg purge` when sg-cachepress is active; otherwise falls back to deleting `wp-content/cache/sgo-cache/`)
7. Deletes the remote temp directory.
8. Deletes the local temp archive.
9. Records `lastDeployedAt` on the profile.

All steps emit real-time log lines in the deploy panel. A code-only deploy for themes and plugins typically completes in under 30 seconds on a fast connection.

---

### Full deploy

Syncs the **entire `wp-content` directory** and **overwrites the production database**.

> **Read the [Safety warnings](#safety-warnings) section before running a full deploy.**

**Archive format** — same ZIP / TAR picker as code-only deploy. See [Archive format](#archive-format) below.

**Directory exclusions** — below the archive format picker the deploy screen lists every subdirectory found in the remote `wp-content`. Tick any directory to skip it in this deploy without deleting it. The following are **always excluded** (no checkbox shown):

- `sgd-db-backups` — the addon's own backup folder

The following are **pre-checked by default** if they exist on the remote server:

- `backups-dup-lite` — Duplicator Pro backup files
- `updraft` — UpdraftPlus backup files

You can uncheck any pre-selected directory, or check additional ones. A summary line at the bottom of the list shows which directories will be skipped.

**What a full deploy does — in order:**

1. Validates the local `wp-content` path and remote web root.
2. Exports the local database to a temporary `.sql` file using WP-CLI (falls back to `mysqldump`).
3. Archives all `wp-content` subdirectories not in the exclusion list.
4. Uploads the archive via SFTP.
5. Uploads the `.sql` file via SFTP.
6. Opens an SSH connection.
7. **Creates a backup of the remote database** at:
   ```
   {remoteWebRoot}/sgd-db-backups/db-{runId}-{timestamp}.sql
   ```
   **This step is mandatory. The deploy aborts if the backup fails.**
8. Extracts the archive on the server.
9. Syncs every `wp-content` subdirectory (rsync → cp fallback). Files present remotely but absent locally are deleted.
10. Imports the local `.sql` into the remote database (WP-CLI → mysql CLI fallback).
11. Runs **domain search-replace**: replaces your Local dev domain (e.g. `my-site.local`) with the production domain across all database tables (WP-CLI `search-replace --all-tables`).
12. Flushes caches in order:
    - WordPress object cache (`wp cache flush`)
    - Elementor CSS cache (`wp elementor flush_css`)
    - SiteGround dynamic cache (`wp sg purge` via the sg-cachepress plugin)
    - **Fallback if sg-cachepress is not active**: directly deletes `wp-content/cache/sgo-cache/` via SSH
13. Cleans up the remote temp directory.
14. Records `lastDeployedAt` on the profile.

The confirmation checkbox in the deploy panel must be checked before the **Full deploy** button becomes active.

---

### Archive format

Both deploy modes offer an **Archive format** picker before the deploy starts:

| Format | Compression | Best for |
|---|---|---|
| **ZIP** *(default)* | Level 1 (fast) | Most deploys — smaller upload, fast enough on modern hardware |
| **TAR** | None | Very slow connections where CPU is cheaper than bandwidth, or for debugging |

The format choice is per-deploy and does not affect the profile's saved settings.

---

### Stopping a deploy

A **■ Stop deploy** button appears in the deploy panel while any deploy is running. Clicking it:

1. Signals the deploy pipeline to cancel.
2. If a file upload is in progress, the SFTP connection is torn down immediately — the upload stops mid-flight.
3. An SSH cleanup command (`rm -rf`) runs against the remote temp directory to remove any partial upload.
4. The deploy panel shows a **cancelled** result: "Deploy cancelled. Your site was not changed."

Cancellation is safe at any point **before** the database import begins. If cancelled after the database import has started, treat it as a failed full deploy and restore from the automatic backup.

If the database import fails (steps 10–11), the activity log shows:
- The exact error from the server.
- The path to the remote database backup.
- A manual `wp db import` command you can run via terminal to recover.

---

## Activity log

The **Activity Log** tab in the deploy panel shows a history of every deploy and SSH test run for the current profile.

- Runs are shown as cards with an action badge (Code deploy / Full deploy / Connection test), outcome (success / failure), timestamp, and duration.
- Targets synced and the SSH host are shown in the card header row.
- Click any run card to expand it and see every individual log entry with timestamps and colour-coded severity (info / success / warning / error).
- An expanded card has a **⍘ Copy log** button that copies all log entries for that run to the clipboard as plain text.
- Use the filter pills at the top to show only a specific type of run (Code deploy / Full deploy / Connection test / All).
- A **Clear logs** button at the top right deletes all activity log history for the current profile after confirmation. This cannot be undone.

Logs are persisted to disk and survive Local restarts.

---

## Profile management

Each saved profile can be viewed, edited, cloned, or deleted from the **Profile Detail** screen. Open it by clicking a profile on the dashboard.

### Viewing a profile

The profile detail screen shows a read-only summary of all settings, including:

- SSH host, port, and username
- Remote web root
- Production domain
- SSH key ID
- Last deploy timestamp
- Default deploy mode
- Connection test status

### Editing a profile

Click **Edit** to open the inline edit form. All fields are editable:

| Field | Notes |
|---|---|
| Profile name | |
| SSH host, port, username | |
| Remote web root | Smart split input — enter just the domain name |
| **Production domain** | Your live site URL (e.g. `https://example.com`). Used for domain search-replace during full deploys. It is auto-derived from the remote web root when the profile is first saved, but you can override it here if needed. |
| Linked Local site | Re-link to a different Local site if the site was moved or renamed |
| Default deploy mode | `Code only` or `Full deploy` — pre-selects the mode on the deploy screen |

Saving writes the changes to `profiles.json` immediately. No wizard steps need to be repeated.

### Cloning a profile

Click **Clone** to duplicate the profile. The clone panel asks for a new profile name and lets you optionally re-link to a different Local site or update the remote web root. A new SSH key pair is generated for the clone — the original profile's key is not shared.

Clone is useful for creating staging/production pairs where all SSH credentials are identical except the remote web root.

### Deleting a profile

Click **Delete** and confirm. The profile record and its SSH key files are permanently removed. Logs for the deleted profile are also removed.

---

## Safety warnings

### Code-only deploy
- **Remote files not present locally are deleted** from synced directories. For example, if you delete a plugin locally and deploy, it is removed from production. If this is not your intent, deselect that target.
- `uploads/` is opt-in specifically because media libraries can be hundreds of gigabytes. Selecting it on accident will start a very long upload.

### Full deploy

> **A full deploy overwrites the production database. This is a destructive, partially irreversible operation. Read every point below.**

- The remote database **backup is automatic** and runs as the first server-side step. Its path is printed in the activity log. Keep this until you confirm the deploy was successful.
- The backup is a raw SQL dump stored in `{remoteWebRoot}/sgd-db-backups/`. SiteGround does not automatically clean this folder — periodically delete old backups via SFTP or SSH.
- **All** `wp-content` subdirectories are synced in a full deploy, not just themes and plugins. Any directory present remotely but not locally will be **deleted**. This includes custom upload directories and any directories added by the host.
- The production domain used for search-replace is normally auto-derived from the remote web root when the profile is created. If that derived value is wrong and you do not override it in profile edit, the deploy can replace URLs with the wrong domain.
- A full deploy **cannot be automatically undone** once the database import completes. To roll back: restore the remote database from the backup in `sgd-db-backups/`, then selectively re-upload any files you want to revert.
- Do not close Local during a full deploy. If the process is interrupted mid-import, your remote database may be in a partially imported state. Use the backup to restore.

---

## Troubleshooting

### Add-on not visible in Local

- Confirm the folder is at exactly `%APPDATA%\Local\addons\siteground-deploy\`.
- Confirm `package.json` contains `"keywords": ["local-addon"]`.
- Confirm `lib/main.js` and `lib/renderer.js` exist. If not, rebuild: see [Development guide](#development-guide).
- Fully quit and relaunch Local (File → Quit, or close from the system tray).

---

### SSH test fails immediately after key activation

SiteGround key propagation can take **30–60 seconds** after you click Activate. Wait a minute, then click **Test Connection** again.

---

### "Authentication failed" / "Public key rejected"

1. Confirm the key shows as **Active** (not just saved) in SiteGround's **Devs → SSH Keys Manager**.
2. Confirm the SSH **username** matches what SiteGround shows — it must be the SSH user, not your SiteGround account email.
3. If you regenerated the key after saving the profile, the old public key is still in SiteGround. Add the new public key and activate it, or delete the old entry first.

---

### "Connection refused"

- Port 18765 is the correct SiteGround SSH port. Port 22 will be refused.
- Confirm the SSH hostname is copied exactly as shown in the SSH Keys Manager — not the website URL.

---

### Deploy fails with "Local wp-content directory not found"

The Local site's file path has changed or the site was moved. Open the profile, click Edit, re-link the Local site, and save.

---

### Deploy fails with "Remote web root is not a valid absolute path"

The remote web root field contains a Windows-style path (backslashes) or is empty. It must be a POSIX absolute path: `/home/customer/www/example.com/public_html`. Edit the profile and correct it.

---

### Code deploy succeeds but changes do not appear on the site

The add-on automatically flushes three caches at the end of every deploy: WordPress object cache, Elementor CSS cache, and SiteGround cache. If changes still aren't visible:

1. If the deploy log shows a cache flush warning, manually flush from SiteGround's **Speed → Caching** panel.
2. Clear any CDN or Cloudflare cache if applicable.
3. Hard-refresh the browser (Ctrl+Shift+R).

> The SiteGround dynamic cache flush (`wp sg purge`) requires the **sg-cachepress** plugin to be active. If it is not installed, the add-on falls back to deleting `wp-content/cache/sgo-cache/` directly — the file cache is cleared but the NGINX-level dynamic cache is not. In that case, use SiteGround's control panel to flush the dynamic cache manually.

---

### Full deploy: database import succeeded but site shows broken URLs

The profile's production domain was derived incorrectly from the remote web root, or it was manually overridden to the wrong value. Update the profile, then run the replacement manually via SSH:
```bash
wp search-replace 'http://my-site.local' 'https://example.com' --all-tables --path=/home/customer/www/example.com/public_html
```

---

### Full deploy: import failed mid-way

The activity log shows the exact error and the path to the remote database backup. To restore:
```bash
# On the remote server via SSH:
wp db import /home/customer/www/example.com/public_html/sgd-db-backups/db-{runId}-{timestamp}.sql \
  --path=/home/customer/www/example.com/public_html
```

---

### "Cannot find module 'ssh2'" or similar at runtime

The `node_modules/` directory is missing or incomplete. Run from the project root:
```powershell
npm install --omit=dev
```

---

### npm run build errors with "SyntaxError" or "Cannot use import statement"

All code in `src/main/` must use CommonJS (`require` / `module.exports`). ES module `import`/`export` syntax is not supported in the main process bundle. The renderer (`src/renderer/`) may use ES module syntax — Babel handles the transform.

---

## Development guide

### Node.js version
Use **Node.js 18 LTS** or later. Check with:
```powershell
node --version   # must be 18.x or higher
```

### Install dependencies
```powershell
cd "$env:APPDATA\Local\addons\siteground-deploy"
npm install
```

### npm scripts

| Command | Description |
|---|---|
| `npm run build` | Development build with source maps |
| `npm run build:prod` | Production build — minified, no source maps |
| `npm run watch` | Rebuild on every file save (development) |
| `npm run build:main` | Build main process only |
| `npm run build:renderer` | Build renderer only |
| `npm run clean` | Delete and recreate the `lib/` directory |
| `npm pack` | Create distributable `.tgz` (runs `build:prod` first) |

### Daily development loop

1. Reload PATH in a new terminal (required on Windows after first install):
   ```powershell
   $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
   ```

2. Start the watcher:
   ```powershell
   npm run watch
   ```

3. Start Local. The add-on loads from the current `lib/` files.

4. Edit files in `src/`. Webpack rebuilds `lib/` automatically on save.

5. **Main-process changes** (`src/main/`) require a full Local restart to take effect.  
   **Renderer-only changes** (`src/renderer/`) may be picked up with Ctrl+Shift+R in Local's window — if not, restart Local.

### Project structure

```
src/
  main/
    index.js              IPC handler registration — main entry point
    adapters/
      local-app.js        Isolation layer over Local's internal APIs
    services/
      archiver-service.js Creates zip archives of wp-content directories
      database-service.js Local DB export, remote backup/import, search-replace
      deploy-service.js   Orchestrates code-only and full deploy pipelines
      key-manager.js            Ed25519 key generation and disk storage
      local-mysql-repair-service.js  WP-CLI / mysqldump fallback helpers
      logger.js                 Structured run + entry logging to disk
      profile-store.js          electron-store based profile persistence
      profile-validator.js      Validation rules for profile fields
      sftp-service.js           SFTP file upload via ssh2-sftp-client (cancelable mid-flight)
      ssh-service.js            SSH connection testing and persistent exec handle
  renderer/
    index.jsx             Renderer entry point — exports App as default
    App.jsx               Shell router (Dashboard / ProfileDetail / Deploy / Logs)
    ipc.js                Thin wrappers over ipcRenderer.invoke calls
    components/           Shared UI components (FormField, CopyableCode, etc.)
    screens/              Full-page views (Dashboard, DeployScreen, ActivityLog, etc.)
    styles/               Global CSS (global.css)
    utils/
      validate.js         Client-side form validation helpers
    wizard/
      WizardContainer.jsx Wizard state machine and step router
      steps/              Individual wizard step components (Step1–Step8)
lib/
  main.js                 Compiled main bundle (do not edit)
  renderer.js             Compiled renderer bundle (do not edit)
```

### Data storage

All persistent data is stored under `%APPDATA%\Roaming\Local\siteground-deploy\`:

| Path | Contents |
|---|---|
| `profiles.json` | All saved profiles (managed by electron-store) |
| `keys/{keyId}` | Private key — OpenSSH PEM format, owner-read-only |
| `keys/{keyId}.pub` | Public key — OpenSSH wire format |
| `logs/` | Structured deploy run history and log entries |

### Building for distribution

```powershell
npm run build:prod
npm pack
# → local-addon-siteground-deploy-{version}.tgz
```

`bundledDependencies` in `package.json` ensures that `ssh2`, `ssh2-sftp-client`, `archiver`, `electron-store`, `node-forge`, and `uuid` are included in the archive so the target machine does not need to run `npm install`.

---

## Roadmap

The following features are planned for future releases:

- **TOFU host key pinning** — trust-on-first-use fingerprint verification per profile, eliminating the current `hostVerifier: () => true` bypass.
- **Rollback** — one-click restore from any remote backup listed in `sgd-db-backups/`.
- **Scheduled deploys** — cron-style automatic code deploys from Local.
- **Deploy diff preview** — show a file-level diff between the local source and remote destination before committing.
- **Multi-site support** — map a single profile to multiple SiteGround sites (staging + production) and deploy to both in one action.
- **SFTP upload timeout** — configurable per-file timeout for large uploads (currently inherits session-level timeout).
- **Windows WP-CLI path detection** — automatic discovery of WP-CLI in non-standard locations on Windows.
- **Progress bar for archive creation** — surface byte-level progress in the UI for large wp-content directories.
- **Partial rollback for interrupted full deploys** — detect a mid-import failure and offer to restore the db backup automatically.

---

## License

MIT — see `package.json`.

> This add-on is not affiliated with or endorsed by SiteGround or WP Engine / Local by WP Engine.
