# CataSoft

CataSoft is a patient-records desktop application for a single clinician. The
UI is in Spanish. It manages patient demographics plus per-patient clinical
records: evoluciones, antropometrías, hospitalizaciones, interconsultas, and
archivos adjuntos (attached files). It runs on Windows, macOS, and Linux and
keeps everything in a local SQLite database — there is no server.

**The app is installed on a real clinic's machine and holds irreplaceable
patient records.** Data safety outranks every other concern in this repo.

Contributor rules (architecture, IPC conventions, data-safety invariants,
testing, commit format) live in [`AGENTS.md`](AGENTS.md). This file covers
what the app is, how a clinician installs it, and how a developer runs and
ships it.

## Instalación y actualizaciones (usuarios)

Esta sección es para quien usa la aplicación en la clínica. El resto del
documento está en inglés y es para desarrolladores.

### Instalar

Descargá la última versión desde la página de
[Releases](https://github.com/apresmoi/cata-soft/releases) del repositorio.
Cada versión publica un archivo por sistema operativo:

- **Windows**: `CataSoft-Windows-<versión>-Setup.exe`. El instalador pide
  permisos de administrador porque instala la aplicación para toda la
  máquina. Es intencional; ver "Packaging" más abajo.
- **macOS**: `CataSoft-Mac-<versión>-Installer.dmg`. Abrí el `.dmg` y
  arrastrá CataSoft a Aplicaciones.
- **Linux**: `CataSoft-Linux-<versión>.AppImage`. Dale permiso de ejecución y
  ejecutalo.

La versión publicada actualmente es la `v2.0.0`.

### Actualizaciones automáticas

Al iniciarse, la aplicación instalada consulta GitHub Releases. Si hay una
versión más nueva la descarga en segundo plano y la instala la próxima vez que
cerrás la aplicación. No hace falta desinstalar ni volver a descargar nada.

Una actualización nunca toca tus datos: la base de datos, los archivos
adjuntos y las copias de seguridad viven en la carpeta de datos de usuario del
sistema operativo, fuera de la carpeta de instalación. Antes de cambiar la
estructura de la base de datos la aplicación hace una copia de seguridad, y si
algo falla se detiene y muestra un error en lugar de abrir una base de datos a
medio migrar.

### Copia de seguridad manual

En la pantalla principal, el botón **Exportar copia de seguridad (ZIP)** genera
un archivo `CataSoft-Backup-<fecha>.zip` con la base de datos y todos los
archivos adjuntos. Guardalo en un disco externo o en otra máquina; es la única
copia que existe fuera de la computadora de la clínica.

## Stack

- Electron 30 (main process) owns Prisma + SQLite. All database access
  happens in the main process.
- React 18 + TypeScript (renderer) reaches the database only through
  `ipcMain.handle` / `ipcRenderer.invoke` channels. The renderer never touches
  Prisma directly.
- Vite 5 bundles the renderer and, via `vite-plugin-electron`, the
  main/preload scripts.
- Tailwind CSS for styling.

Data model: `Pacientes` with five 1:N children — `Evoluciones`,
`Antropometrias`, `Hospitalizaciones`, `Interconsultas`, `ArchivosAdjuntos`.

## Where the data lives

Nothing under the install directory is user data. The NSIS updater replaces
the install directory on every update, so the app resolves every writable path
under Electron's `app.getPath("userData")`:

| Path                                | Contents                                      |
| ----------------------------------- | --------------------------------------------- |
| `<userData>/data/catasoft.db`       | live SQLite database                          |
| `<userData>/uploads/<pacienteId>/`  | attached files, one folder per patient        |
| `<userData>/backups/`               | pre-migration database backups (last 10 kept) |

Migrations run at startup from the shipped `prisma/migrations` folder. A full
backup is taken before any schema change; if a migration is missing or fails,
the backup is restored and the app shows an error dialog and quits rather than
serving a half-migrated schema.

Only `prisma/schema.prisma` and `prisma/migrations/**` are packaged
(`build.extraResources` in `package.json`). The development database
`prisma/dev.db` is never shipped.

### Backup export

The toolbar button on the home screen invokes the `export-backup` handler in
`electron/controller.ts`. It opens a save dialog and writes a zip (built with
`archiver`) containing `catasoft.db` plus its `-wal`/`-shm` companions when
present, and the whole `uploads/` directory.

## Security posture

There is no authentication, no authorization, and no audit log, and the SQLite
file is unencrypted. Anyone with access to the machine has full access to the
records. Do not describe the app as access-controlled.

## Development

```bash
npm install          # @prisma/client generates the Prisma client on install
npm run dev          # Vite dev server + Electron, launched together
```

`npm run dev` starts the Electron window **hidden** so Vite reloads do not
steal focus; click the dock/taskbar icon to show it. Packaged builds show a
splash and open maximized. Override either way with
`CATASOFT_START_MINIMIZED=1` (hidden) or `=0` (normal).

The Vite dev server also serves a design gallery at `/design.html`
(`src/design/`). It is a comparison board for re-skins and layout variants and
is never bundled into the app.

### Scripts

| Script                  | What it does                                            |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Vite + Electron                                          |
| `npm run build`         | `tsc && vite build && electron-builder` for the host OS  |
| `npm run typecheck`     | `tsc --noEmit`                                           |
| `npm run lint`          | eslint, `--max-warnings 0`                               |
| `npm test`              | `vitest run` — main-process suite                        |
| `npm run test:watch`    | vitest in watch mode                                     |
| `npm run test:coverage` | vitest with the thresholds in `vitest.config.ts`         |
| `npm run preview`       | `vite preview`                                           |

### Support and debug environment variables

- `CATASOFT_DB_PATH` — open an alternate database file
- `CATASOFT_MIGRATIONS_DIR` — apply an alternate migration set
- `CATASOFT_START_MINIMIZED` — `1` start hidden, `0` start normally

### UI reference

`captures-actuales/` holds screenshots of the current production UI. They are
the de facto visual spec when implementing or reviewing UI changes; there is no
separate design document.

## Release flow

`.github/workflows/release.yml` does the packaging. There is no manual release
step.

- **Every push to `develop`** typechecks, runs the tests, builds macOS,
  Windows, and Linux, and publishes a GitHub Release.
- **Pull requests** (and manual `workflow_dispatch` runs) run the same
  typecheck, tests, and three-platform build, but publish nothing.
- The release version is computed from git tags. `package.json` `version`
  is the `major.minor` floor: if its `major.minor` matches the newest `v*`
  tag's series, CI publishes the next patch in that series. To cut a minor or
  major, raise `version` in `package.json` (for example `2.1.0` or `3.0.0`) and
  push; that exact version is released.

Each release carries:

- `CataSoft-Windows-<version>-Setup.exe`
- `CataSoft-Mac-<version>-Installer.dmg`
- `CataSoft-Linux-<version>.AppImage`
- `latest.yml`, `latest-mac.yml`, `latest-linux.yml` — the manifests
  `electron-updater` reads

### Updates

The packaged app calls `autoUpdater.checkForUpdatesAndNotify()` from
`electron-updater` on startup (only when `app.isPackaged`). A newer release is
downloaded in the background and installed on the next quit.

## Packaging

The Windows build is an NSIS installer configured as a **per-machine,
elevated** install (`win.requestedExecutionLevel: requireAdministrator`,
`nsis.perMachine: true`, `nsis.allowElevation: true` in `package.json`). This
is deliberate: the app is already installed per-machine on the clinic's
computer. Switching to a per-user install would create a second, parallel
installation and orphan the existing patient database. Do not change it
without a migration plan for already-installed machines.
