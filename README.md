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
   - [Push vs Pull direction toggle](#push-vs-pull-direction-toggle)
   - [Code-only deploy](#code-only-deploy)
   - [Full deploy](#full-deploy)
   - [Database-only deploy](#database-only-deploy)
   - [Archive format](#archive-format)
   - [Pulling from server (code)](#pulling-from-server-code)
   - [Pulling from server (database)](#pulling-from-server-database)
   - [Local pull backups](#local-pull-backups)
   - [Stopping a deploy or pull](#stopping-a-deploy-or-pull)
6. [Activity log](#activity-log)
7. [Profile management](#profile-management)
   - [Viewing a profile](#viewing-a-profile)
   - [Editing a profile](#editing-a-profile)
   - [Cloning a profile](#cloning-a-profile)
   - [Regenerating the SSH key](#regenerating-the-ssh-key)
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

SiteGround Deploy gives Local a **Deploy** panel that lets you push your Local WordPress site to a SiteGround-hosted production environment — or pull the production site back to your local machine — without leaving the app.

The deploy screen has a **Push ↑ / Pull ↓ direction toggle** that switches between pushing local changes to the server and pulling server changes back to local.

**Push modes:**

| Mode | What it syncs |
|---|---|
| **Code-only** | Selected `wp-content` subdirectories — themes, plugins, mu-plugins, or uploads. You can expand top-level folders in the tree picker to select individual plugins or themes. Database is untouched. |
| **Full deploy** | The entire `wp-content` directory **plus** the local database, with automatic remote DB backup and domain search-replace. |
| **Database-only** | Exports the local database and overwrites only the remote database. No files are touched. |

**Pull modes:**

| Mode | What it does |
|---|---|
| **Code pull** | Downloads selected `wp-content` folders from the production server and overwrites local files. Local copies are backed up first. |
| **Database pull** | Exports the remote database, downloads it, imports into the local site, and runs search-replace to swap the production URL for the local dev URL. Local database is backed up first. |

Authentication uses **SSH key pairs** (Ed25519). Keys are generated locally, stored on your machine, and never transmitted as passwords. The add-on supports multiple saved **profiles**, each pointing to a different SiteGround site, so you can deploy to staging and production without re-entering credentials.

Each profile stores a **default deploy mode** (`code`, `full`, or `db`). When you click Deploy from the dashboard or profile detail screen, the deploy screen pre-selects that mode automatically.

Deploys and pulls can be **stopped mid-flight** at any point — including during the file upload/download phase. Cancellation tears down the active connection and automatically removes any partial temp files left on the remote server.

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

### Push vs Pull direction toggle

At the top of the deploy screen, a **Push ↑ / Pull ↓** toggle switches the direction of the operation:

- **Push** (red) — sends local changes to the production server. The default.
- **Pull** (amber) — downloads production content to your local machine.

Switching direction resets the mode selection and clears any confirmation checkbox state.

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

> **Default exclusions:** `.git/` and `.vscode/` are excluded from full deploys by default. You can opt individual directories back in using the exclusion list editor on the deploy screen.

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

> The archive format picker is hidden when the direction toggle is set to Pull — pull operations always use ZIP internally.

---

### Pulling from server (code)

Switch the direction toggle to **Pull ↓**, select **Code-only**, and choose the `wp-content` subdirectories to pull.

**Pipeline:**

1. Validates the profile and confirms the local site is reachable.
2. **Backs up selected local directories** to `wp-content/sgd-backups/local/{MM-DD-YY}/{HH-MM-SS}/code/` before overwriting anything.
3. Opens an SSH connection to the production server.
4. Creates a remote temp directory at `/tmp/sgd-pull-{runId}/`.
5. Zips the selected `wp-content` subdirectories on the server (`zip -r`).
6. Downloads the zip to a local temp file via SFTP.
7. Extracts the zip directly over the local `wp-content` directory (existing files are overwritten).
8. Removes the remote temp directory.

> Only the directories you selected are overwritten. Unselected local directories are not touched.

---

### Pulling from server (database)

Switch the direction toggle to **Pull ↓**, select **Database only**.

> **Read the [Safety warnings — Database pull](#database-pull) section before proceeding.**

**Pipeline:**

1. Validates the profile and confirms the local site and `wp-content` path are reachable.
2. **Backs up the local database** to `wp-content/sgd-backups/local/{MM-DD-YY}/{HH-MM-SS}/db/database.sql` before overwriting anything.
3. Opens an SSH connection to the production server.
4. Exports the remote database using WP-CLI (`wp db export`) — falls back to `mysqldump` via PHP-parsed `wp-config.php` credentials if WP-CLI is unavailable.
5. Verifies the exported file is non-empty before proceeding.
6. Downloads the `.sql` file via SFTP.
7. Imports the downloaded `.sql` into the local site using WP-CLI (`wp db import`) — falls back to the `mysql` CLI.
8. Runs `wp search-replace` to swap the production URL for the local dev URL across all tables (non-fatal — local site still works if this step fails).
9. Removes the remote temp directory.

> The search-replace uses the **production domain** stored in the profile and the **local domain** reported by Local. If the profile's production domain is incorrect, update it in profile edit before pulling.

---

### Local pull backups

Every pull operation creates a timestamped backup of the local content it is about to overwrite. Backups are stored inside the site's `wp-content` directory:

```
wp-content/
  sgd-backups/
    local/
      04-23-26/
        02-15-00-PM/
          code/
            themes/        ← backed-up local theme files
            plugins/       ← backed-up local plugin files
        03-44-12-PM/
          db/
            database.sql   ← backed-up local database export
```

Backups are never deleted automatically. Clean them up manually when no longer needed.

---

### Stopping a deploy or pull

A **■ Stop deploy** / **■ Stop pull** button appears while any operation is running. Clicking it cancels the pipeline, tears down the active SSH/SFTP connection, and cleans up remote temp files. Safe to cancel at any point before a database import begins.

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

> **Key sharing:** cloned profiles share the original profile's SSH key. If you regenerate the key on one profile, the shared key is only deleted from disk when no other profile still references it.

### Regenerating the SSH key

Use the **Regen key** button on the profile detail screen to rotate the SSH key pair for a profile — for example, after a security incident, when onboarding a new machine, or when a key expires.

**What happens:**

1. A new Ed25519 key pair is generated immediately on your machine.
2. The public key is displayed with a **Copy** button — add it to SiteGround's SSH Keys Manager exactly as you did during initial setup.
3. Click **Test connection** — the add-on verifies the new key connects to the server successfully **before touching the profile record**.
4. On success, the profile is updated to use the new key.
5. The old key is deleted from disk **only if no other profile references it**. Cloned profiles that share the old key are protected.

You can cancel at any step before the test passes. The new (untested) key files are cleaned up automatically on cancel.

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

### Code pull

> **A code pull overwrites local files. Make sure you have committed or stashed any local work you want to keep.**

- Selected local directories are backed up to `wp-content/sgd-backups/local/` before being overwritten.
- Only the directories you selected are affected. Unselected directories are untouched.

### Database pull

> **A database pull overwrites your local database. This replaces your entire local site database with the production copy.**

- Your local database is **always backed up** to `wp-content/sgd-backups/local/` before it is overwritten.
- After import, a search-replace swaps the production URL for your local dev URL. If this step fails (non-fatal), your site will still load but URLs will point to production temporarily. Run it manually if needed:
  ```bash
  wp search-replace 'https://example.com' 'http://mysite.local' --all-tables \
    --path=/path/to/local/wordpress
  ```
- The profile must be **linked to a Local site** (`localSiteId`) — database pull requires knowing the local MySQL connection details. Re-link via profile edit if needed.

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
3. If you regenerated the key, add the new public key to SiteGround and activate it before clicking Test connection in the Regen key panel.

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

### Pull fails with "Profile is not linked to a Local site"

A database pull requires the profile to be linked to a Local site so the add-on knows which local MySQL instance to use. Open the profile, click **Edit**, set **Linked local site**, and save.

### Database pull: search-replace skipped or shows wrong URLs

- Check that the **Production domain** field in the profile is set correctly (e.g. `https://example.com`).
- Run the search-replace manually using WP-CLI in a terminal in the local WordPress root.

### Regen key: "New key pair files not found on disk"

The key generation step failed silently. Click cancel and try again — the Regen key panel automatically generates a new key on mount.

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
      database-service.js     Local DB export/import, remote backup/import, search-replace, cache flush
      deploy-service.js       Orchestrates push (code, full, db) and pull (code, db) pipelines
      export-service.js       Profile export (.sgdexport) and import with conflict resolution
      key-manager.js          Ed25519 key generation, rotation, and disk storage
      local-mysql-repair-service.js  Repairs stale mysqld processes on the local machine
      logger.js               Structured run + entry logging to disk
      profile-store.js        electron-store based profile persistence; rotateProfileKey()
      profile-validator.js    Validation rules for profile fields
      settings-store.js       electron-store based global addon settings
      sftp-service.js         SFTP file upload and download via ssh2-sftp-client (cancelable mid-flight)
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

Pull backups are stored **inside the Local site's `wp-content` directory**, not in the addon data folder:

| Path | Contents |
|---|---|
| `{wpContent}/sgd-backups/local/{date}/{time}/code/` | Pre-pull backups of overwritten local directories |
| `{wpContent}/sgd-backups/local/{date}/{time}/db/database.sql` | Pre-pull backup of the local database |

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

