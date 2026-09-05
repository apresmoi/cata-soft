# CataSoft — agent guide

Single-clinician patient-records desktop app. Spanish UI and Spanish domain
identifiers. Electron main process owns the database; the React renderer never
touches Prisma directly.

**This app is installed on a real clinic's machine and holds irreplaceable
patient records.** Data safety outranks every other concern in this repo. Read
the "Data safety invariants" section before touching anything under `electron/`
or `prisma/`.

## Commands

```bash
npm install            # postinstall generates the Prisma client
npm run dev            # Vite + Electron (vite-plugin-electron/simple launches it)
npm run build          # tsc && vite build && electron-builder (Windows NSIS)
npm run typecheck      # tsc --noEmit  -- must stay at 0 errors
npm test               # vitest run    -- main-process suite
npm run test:coverage  # enforces the thresholds in vitest.config.ts
npm run lint           # eslint, --max-warnings 0
```

`npm run dev` starts the window **hidden** so reloads do not steal the screen;
click the dock/taskbar icon to show it. Shipped builds show a splash and
maximize. Override with `CATASOFT_START_MINIMIZED=0` or `=1`.

## Architecture

```
src/            React renderer (HashRouter, 2 screens: HomeScreen, PatientScreen)
  hooks/        react-query wrappers over IPC; useRegistry.ts is the generic layer
  components/   Dialog/Tabs/Table/PatientCard primitives
  Dialogs/      one folder per entity: New*, Edit*, shared *DialogContent
electron/
  main.ts       BrowserWindow + bootstrap (awaits initDatabase before handlers)
  preload.ts    contextBridge -> generic ipcRenderer.invoke
  controller.ts every ipcMain handler, via the shared handle() wrapper
  db.ts         Prisma queries
  database.ts   database location, adoption, backups, migration runner
prisma/         schema.prisma + migrations (shipped as extraResources)
test/           vitest suite for the main process
```

Data model: `Pacientes` with five 1:N children — `Evoluciones`,
`Antropometrias`, `Hospitalizaciones`, `Interconsultas`, `ArchivosAdjuntos`.

### IPC conventions

Channels are `<verb>-<entity>`: `get-pacientes`, `get-paciente`,
`create-evolucion`, `update-antropometria`, `delete-interconsulta`,
`get-historial`, `open-archivoadjunto`.

Argument order is inconsistent by history — check `electron/controller.ts`
before calling:

- `get-*` / `delete-*` take `(id)`
- `create-*` takes `(data, pacienteId)`
- `update-*` takes `(data, id)`

Register handlers with the `handle()` wrapper in `controller.ts`. It logs with
the channel name and rethrows, so the renderer's promise rejects. Never write a
bare `ipcMain.handle` with its own try/catch — that duplication was removed on
purpose.

The IPC boundary is **not** type-safe end to end: `preload.ts` exposes a generic
`invoke(channel, ...args)` and `useRegistry.ts` builds channel names by string
concatenation. Renaming a channel will not fail the typecheck; `test/crud.test.ts`
asserts the registry instead.

## Data safety invariants

These are hard rules. Violating one can destroy a clinic's records.

1. **The live database lives under `app.getPath("userData")`** —
   `<userData>/data/catasoft.db`. Never resolve it relative to `process.cwd()`
   or the install directory: the NSIS updater replaces the install directory on
   every update. That was a real bug.
2. **Never ship a database file.** `build.extraResources` in `package.json`
   ships `prisma/schema.prisma` and `prisma/migrations/**` only. Adding
   `prisma/**` back would bundle `dev.db` into the installer.
3. **Never adopt a database from inside the app bundle.** `legacyDbCandidates()`
   deliberately excludes `process.resourcesPath`; adopting from there would
   overwrite live records with test data.
4. **Migrations run at startup** via `migrateDatabase()` and are recorded in
   Prisma's own `_prisma_migrations` ledger with matching sha256 checksums.
   A backup is taken before any schema change and restored on failure.
5. **Startup fails closed.** If migrations cannot be found or fail, the app
   shows an error dialog and quits rather than serving a half-migrated schema.
6. **Never edit a migration that has already shipped.** The ledger stores the
   file's sha256; changing it makes the Prisma CLI report drift. Add a new one.
7. **A table-rebuild migration must copy every column** in its
   `INSERT INTO new_x ... SELECT ... FROM x`. A missing column silently drops
   that data. See `20250117023259_pacientes` for the pattern, and note that its
   new `fechaNacimiento` defaulted to `CURRENT_TIMESTAMP`, so patients created
   before it have a meaningless birth date.
8. Attachments live in `<userData>/uploads/<pacienteId>/` under opaque UUID
   filenames; backups in `<userData>/backups/`.

### Changing the schema

```bash
npx prisma migrate dev --name <descriptive_name>   # dev only, writes the SQL
```

Then run the app once and confirm the startup log reports the migration as
applied. Add a test to `test/migrations.test.ts` that seeds the previous schema
with rows and asserts they survive — that is the regression net for data loss.

### Support/debug env vars

- `CATASOFT_DB_PATH` — use an alternate database file
- `CATASOFT_MIGRATIONS_DIR` — use an alternate migration set
- `CATASOFT_START_MINIMIZED` — `1` hidden, `0` normal

## Security rules

- Never expose an IPC handler that takes a filesystem path from the renderer.
  Pass a record id and resolve the path in main. `open-archivoadjunto` is the
  reference: it looks the row up, re-confines the path with `resolveInside()`,
  and refuses extensions outside `OPENABLE_EXTENSIONS`.
- Validate every renderer-supplied id with `assertSafeId()` before it reaches
  Prisma or a path.
- `path.join` normalizes but does not confine. Use `resolveInside()`.
- Any patient text rendered as HTML must be escaped. The printable summary
  (`src/Dialogs/HistoriaMedicaDialog/template.ts`) escapes every interpolation
  and its preview iframe is sandboxed without `allow-scripts`.
- There is no authentication, authorization, or audit log, and SQLite is
  unencrypted. Anyone with the machine has full access. Do not describe the app
  as access-controlled.

## Testing

Main-process code only. **The React UI is deliberately not unit-tested** —
verify UI work by running the app.

`vitest.config.ts` aliases the `electron` module to `test/electron-stub.ts`,
which records `ipcMain.handle` registrations so tests drive the real handlers
through `invokeHandler(channel, ...args)`. Coverage thresholds: 90% lines /
statements / functions, 80% branches over `electron/**` and `src/utils.ts`
(`main.ts` and `preload.ts` are excluded as bootstrap wiring).

`electron/database.ts` binds its SQLite path at module-evaluation time, so a
test must set `process.env.CATASOFT_DB_PATH` and then `await import(...)`
dynamically — a static import would be hoisted above the assignment. Copy the
setup block from `test/attachments.test.ts`.

Tests must assert observable behaviour. Do not add rows that re-run the same
path with different literals to raise the coverage number.

## Conventions

- 2-space indent, double quotes, no semicolon removal.
- No `any`. Use `unknown` plus narrowing, or `as unknown as T` with a reason.
- Keep Spanish for UI strings, domain identifiers, and error messages shown to
  the user.
- Prefer editing the shared `*DialogContent` component so New and Edit dialogs
  stay in sync.

### Tailwind traps

- **Never interpolate class names** (`` `max-w-[${n}%]` ``). The JIT compiler
  only sees literal strings, so an interpolated class is never generated and
  silently does nothing. Use a static class or an inline style.
- **`min-width` overrides `max-width` in CSS.** `DialogContainer` therefore has
  no base `min-w-*`; set a dialog's width with its `maxWidth` prop, which is
  applied as an inline style so it always wins.

### Form UX

- Dialogs autofocus the first data-entry field (`useFocusFirstField`), skipping
  anything inside `[data-skip-autofocus]` — that marks the prefilled date
  pickers. The caret goes to the **end** of existing text; never select-all.
  `DialogContainer` claims Radix's `onOpenAutoFocus`; `Tab` re-focuses on mount,
  which is how switching tabs moves the cursor.
- Required fields come from the schema's NOT NULL columns. Gate saving with
  `useRequiredFields`; a failed check must not save and must not close.
- Invalid fields get `ring-2 ring-red-500`. Rings are box-shadows, so they cause
  no layout shift. **Do not add validation message text** — it moves the UI.
- `Evoluciones.motivo` is required at the UI level only; every clinical column
  in that table is nullable in the schema.

## Known rough edges

Do not be surprised by these; fix them deliberately, not incidentally.

- Numeric fields (`peso`, `talla`, `imc`) reach the database as **strings**,
  because `PatientCardField` always emits `event.target.value`. The columns are
  `Float`.
- `parseFile` in `src/utils.ts` spreads a `null` result, so an invalid filename
  yields `{ file }` with no `name`/`extension` keys rather than an explicit
  failure.
- `get-archivos` is registered but never called by the renderer.
- `useRegistry.ts` invalidates `['historial']` on create but never the
  per-entity list keys; several catch blocks swallow errors.
- Electron 30 is end-of-life.
- Old copies of `prisma/dev.db` remain in git history even though the file is
  no longer tracked.
- The Windows installer stays per-machine and elevated on purpose: switching to
  a per-user install would create a second installation and orphan the existing
  clinic's data.

## Commits

Conventional commits, single-line messages, no attribution or co-author
trailers.
