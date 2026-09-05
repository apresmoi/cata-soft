# CataSoft

CataSoft is a single-clinician patient-records desktop application with a
Spanish-language UI. It manages patient demographics plus per-patient
clinical records: evoluciones, interconsultas, antropometrías,
hospitalizaciones, and archivos adjuntos (attached files/documents).

## Stack

- Electron 30 (main process) owns Prisma + SQLite: all database access
  happens in the main process.
- React 18 + TypeScript (renderer process) talks to the main process over
  `ipcMain.handle` / `ipcRenderer.invoke` IPC channels — the renderer never
  touches Prisma directly.
- Vite 5 bundles both the renderer and, via `vite-plugin-electron`, the
  main/preload scripts.
- Tailwind CSS for styling.

## Prerequisites

- Node.js (see `package.json` engines/deps for compatible versions of the
  listed tooling; no pinned Node version is currently declared).
- `npm install`

## Development

```
npm run dev
```

This starts Vite and, through `vite-plugin-electron-simple`, automatically
launches the Electron window pointed at the dev server. There is no separate
"start Electron" step.

## Build

```
npm run build
```

Runs `tsc`, then `vite build`, then `electron-builder`. On Windows this
produces an NSIS installer configured as a **per-machine, elevated** install
(`win.requestedExecutionLevel: requireAdministrator`, `nsis.perMachine: true`,
`nsis.allowElevation: true`). This is intentional: the app is already
installed per-machine on production machines. Switching to a per-user
install would create a second, parallel installation next to the existing
one and orphan that machine's existing patient database. Do not change this
without a deliberate migration plan for already-installed machines.

## Database location at runtime

The database is not shipped as a fixed file bundled with the app. The main
process resolves the SQLite database path under the OS per-user application
data directory at runtime, separate from the installed application files, so
that installing an update never overwrites or replaces an existing database.
Automatic migration-on-startup, with a backup taken before any migration
runs, is the intended behavior for handling schema changes across app
versions; consult `electron/database.ts` and `electron/db.ts` for the
current implementation rather than this document.

Only `prisma/schema.prisma` and `prisma/migrations/**` are bundled into the
packaged app (see `build.extraResources` in `package.json`) — the
development database (`prisma/dev.db`) is never shipped.

## UI reference

`captures-actuales/` contains screenshots of the current production UI.
These serve as the de facto visual/behavioral spec when implementing or
reviewing UI changes — there is no separate design document.

## Gaps / known missing tooling

- No `test` script exists yet.
- No `typecheck` script exists; use `npx tsc --noEmit` directly.
- No `db:migrate` script exists; Prisma migrations are applied through
  whatever mechanism `electron/database.ts` implements, not an npm script.

## Data safety

The database file must never live inside the application's installed
directory or any path an installer/updater can overwrite or delete when
installing a new version. Any change to packaging (`build` field in
`package.json`) or to where the app resolves its database path must
preserve this property, or an update will silently destroy or orphan a
clinician's existing patient data.
