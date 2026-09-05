import { app } from "electron";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

/**
 * Database location, backup and migration policy.
 *
 * Why this file exists: the app used to open `file:./dev.db`, a path relative to
 * the process working directory. In a packaged Windows install that resolves
 * inside the installation directory, which the NSIS updater replaces on every
 * update -- so a shipped update could destroy the clinic's records. It also
 * meant the app never ran migrations, so a schema change would simply break
 * against an existing database.
 *
 * Policy now:
 *  1. The live database lives under the OS user-data directory, which no
 *     installer ever touches.
 *  2. On first run we ADOPT (copy, never move) a pre-existing database from the
 *     old locations, so an already-installed consumer keeps their data.
 *  3. Before applying migrations we take a full backup.
 *  4. Migrations are applied from the shipped `prisma/migrations` folder and
 *     recorded in Prisma's own `_prisma_migrations` ledger, so this runner and
 *     the Prisma CLI agree on state.
 *  5. Any failure restores the backup and aborts startup. We never run the app
 *     against a half-migrated database.
 */

const DB_FILE_NAME = "catasoft.db";
const BACKUPS_TO_KEEP = 10;

/** Prisma's ledger table, byte-compatible with `prisma migrate`. */
const LEDGER_DDL = `CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
)`;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getDataDir() {
  return ensureDir(path.join(app.getPath("userData"), "data"));
}

export function getUploadsDir() {
  return ensureDir(path.join(app.getPath("userData"), "uploads"));
}

export function getBackupsDir() {
  return ensureDir(path.join(app.getPath("userData"), "backups"));
}

export function getDbPath() {
  // Support/diagnostics seam: point the app at an alternate database file
  // without rebuilding. Also what the tests use.
  const override = process.env.CATASOFT_DB_PATH;
  if (override) return path.resolve(override);
  return path.join(getDataDir(), DB_FILE_NAME);
}

/**
 * Where the shipped migration SQL lives. Packaged builds get it via
 * electron-builder `extraResources`; dev reads it from the project.
 *
 * CATASOFT_MIGRATIONS_DIR overrides the search, which is how support can point
 * a build at a known-good migration set, and how the tests exercise the
 * missing-directory and failed-migration paths.
 */
function findMigrationsDir(): string | null {
  const override = process.env.CATASOFT_MIGRATIONS_DIR;
  if (override) return fs.existsSync(override) ? path.resolve(override) : null;

  const candidates = [
    path.join(app.getAppPath(), "prisma", "migrations"),
    path.join(process.resourcesPath ?? "", "prisma", "migrations"),
    path.join(app.getAppPath(), "..", "prisma", "migrations"),
  ];
  return candidates.find((dir) => dir && fs.existsSync(dir)) ?? null;
}

/**
 * Databases that may hold the consumer's real records, most likely first.
 *
 * Deliberately excludes anything under `process.resourcesPath`: that is the
 * read-only copy shipped inside the installer, and adopting it would overwrite
 * a clinic's records with our test data. Only writable, user-side locations
 * qualify. In development the project's own `prisma/dev.db` is fair game.
 */
function legacyDbCandidates(): string[] {
  const candidates = [
    path.join(process.cwd(), "dev.db"),
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(path.dirname(app.getPath("exe")), "dev.db"),
  ];

  if (!app.isPackaged) {
    candidates.push(path.join(app.getAppPath(), "prisma", "dev.db"));
  }

  const resources = process.resourcesPath;
  return candidates.filter((candidate) => {
    if (!fs.existsSync(candidate)) return false;
    if (fs.statSync(candidate).size === 0) return false;
    // Never adopt from inside the app bundle / installer payload.
    if (resources && candidate.startsWith(resources)) return false;
    return true;
  });
}

/**
 * Copy a pre-existing database into the managed location on first run.
 * The source is left untouched so the old file remains a fallback.
 */
function adoptLegacyDatabase(dbPath: string): string | null {
  if (fs.existsSync(dbPath) && fs.statSync(dbPath).size > 0) return null;

  const source = legacyDbCandidates()[0];
  if (!source) return null;

  fs.copyFileSync(source, dbPath);
  // Carry over the write-ahead log if the source was mid-transaction.
  for (const suffix of ["-wal", "-shm"]) {
    if (fs.existsSync(source + suffix)) {
      fs.copyFileSync(source + suffix, dbPath + suffix);
    }
  }

  fs.writeFileSync(
    path.join(getDataDir(), "adopted-from.txt"),
    `${new Date().toISOString()}\nadopted from: ${source}\n`,
    "utf8"
  );

  return source;
}

export const prisma = new PrismaClient({
  datasources: { db: { url: `file:${getDbPath()}` } },
});

type Migration = { name: string; sql: string; checksum: string };

export function readMigrations(dir: string): Migration[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .flatMap((name) => {
      const file = path.join(dir, name, "migration.sql");
      if (!fs.existsSync(file)) return [];
      const sql = fs.readFileSync(file, "utf8");
      // Prisma stores the sha256 of the migration file contents.
      const checksum = crypto.createHash("sha256").update(sql).digest("hex");
      return [{ name, sql, checksum }];
    });
}

/**
 * Split a migration file into executable statements.
 *
 * Comments are stripped first, then statements are split on semicolons. Prisma
 * generates one statement per line for SQLite, so this is sufficient today.
 * A future hand-written migration containing a semicolon inside a string
 * literal would need a real parser -- assert on that in review.
 */
export function splitStatements(sql: string): string[] {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

/**
 * Minimal surface the migration engine needs, so it can be driven against any
 * client instance (the app singleton, or a throwaway one in tests).
 */
export type RawClient = {
  $executeRawUnsafe: (sql: string, ...values: unknown[]) => Promise<unknown>;
  $queryRawUnsafe: <T>(sql: string, ...values: unknown[]) => Promise<T>;
};

export async function appliedMigrationNames(
  client: RawClient
): Promise<Set<string>> {
  const rows = await client.$queryRawUnsafe<{ migration_name: string }[]>(
    `SELECT migration_name FROM "_prisma_migrations"
     WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`
  );
  return new Set(rows.map((row) => row.migration_name));
}

/**
 * Bring `client`'s database up to the latest migration.
 *
 * Applies only what the ledger says is missing, records each one in Prisma's
 * format, and throws on the first failure without recording it. Backups are
 * the caller's responsibility -- see `initDatabase`.
 */
export async function migrateDatabase(
  client: RawClient,
  migrationsDir: string
): Promise<string[]> {
  await client.$executeRawUnsafe(LEDGER_DDL);

  const already = await appliedMigrationNames(client);
  const pending = readMigrations(migrationsDir).filter(
    (migration) => !already.has(migration.name)
  );

  for (const migration of pending) {
    const startedAt = new Date().toISOString();
    for (const statement of splitStatements(migration.sql)) {
      await client.$executeRawUnsafe(statement);
    }
    await client.$executeRawUnsafe(
      `INSERT INTO "_prisma_migrations"
         ("id", "checksum", "finished_at", "migration_name", "logs",
          "rolled_back_at", "started_at", "applied_steps_count")
       VALUES (?, ?, ?, ?, NULL, NULL, ?, 1)`,
      crypto.randomUUID(),
      migration.checksum,
      new Date().toISOString(),
      migration.name,
      startedAt
    );
  }

  return pending.map((migration) => migration.name);
}

/** Consistent single-file snapshot; works even with a live WAL. */
function backupDatabase(dbPath: string): string | null {
  if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) return null;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const target = path.join(getBackupsDir(), `${stamp}-pre-migration.db`);
  fs.copyFileSync(dbPath, target);
  for (const suffix of ["-wal", "-shm"]) {
    if (fs.existsSync(dbPath + suffix)) {
      fs.copyFileSync(dbPath + suffix, target + suffix);
    }
  }
  return target;
}

function pruneBackups() {
  const dir = getBackupsDir();
  const backups = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith("-pre-migration.db"))
    .sort()
    .reverse();

  for (const stale of backups.slice(BACKUPS_TO_KEEP)) {
    for (const suffix of ["", "-wal", "-shm"]) {
      const file = path.join(dir, stale + suffix);
      if (fs.existsSync(file)) fs.rmSync(file);
    }
  }
}

function restoreBackup(dbPath: string, backup: string) {
  for (const suffix of ["", "-wal", "-shm"]) {
    const target = dbPath + suffix;
    if (fs.existsSync(target)) fs.rmSync(target);
    if (fs.existsSync(backup + suffix)) {
      fs.copyFileSync(backup + suffix, target);
    }
  }
}

export type DatabaseInitResult = {
  dbPath: string;
  adoptedFrom: string | null;
  applied: string[];
  backup: string | null;
};

/**
 * Prepare the database for use. Must complete before any IPC handler runs.
 * Throws on any failure, having restored the pre-migration backup.
 */
export async function initDatabase(): Promise<DatabaseInitResult> {
  const dbPath = getDbPath();
  const adoptedFrom = adoptLegacyDatabase(dbPath);

  // A zero-length file is a valid empty SQLite database, so a fresh install
  // starts from an empty file and gets every migration applied.
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, "");

  const migrationsDir = findMigrationsDir();
  if (!migrationsDir) {
    throw new Error(
      "No se encontró la carpeta de migraciones (prisma/migrations). " +
        "La aplicación no puede verificar el estado de la base de datos."
    );
  }

  await prisma.$executeRawUnsafe(LEDGER_DDL);
  const already = await appliedMigrationNames(prisma);
  const hasPending = readMigrations(migrationsDir).some(
    (migration) => !already.has(migration.name)
  );

  // Only snapshot when we are actually about to change the schema.
  const backup = hasPending ? backupDatabase(dbPath) : null;

  let applied: string[];
  try {
    applied = await migrateDatabase(prisma, migrationsDir);
  } catch (error) {
    if (backup) {
      await prisma.$disconnect();
      restoreBackup(dbPath, backup);
    }
    throw new Error(
      `Falló la migración de la base de datos. ` +
        `Se restauró la copia de seguridad${backup ? ` (${backup})` : ""}. ` +
        `Detalle: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (applied.length > 0) pruneBackups();

  return { dbPath, adoptedFrom, applied, backup };
}
