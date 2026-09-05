import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The upgrade path that protects an already-installed clinic: the old version
 * kept its database next to the executable, resolved from the process working
 * directory. The first run of the new version has to find that file and adopt
 * it instead of starting empty.
 *
 * `legacyDbCandidates()` checks `process.cwd()/dev.db` first, so this test runs
 * from a temp directory holding a seeded legacy database. Both cwd and
 * CATASOFT_DB_PATH must be set before `electron/database` is loaded, because
 * that module builds its Prisma client at evaluation time -- a static import
 * would be hoisted above this setup, so the import is dynamic.
 *
 * The legacy file is a byte copy of the repo's development database, which is
 * already fully migrated and holds a small amount of dummy data. That keeps the
 * fixture honest without needing the migration runner before it is imported.
 */

const SOURCE_DB = path.resolve(__dirname, "..", "prisma", "dev.db");

// macOS resolves /var -> /private/var, and the code under test reads
// process.cwd(), which is already canonical. Compare like with like.
const workDir = fs.realpathSync(
  fs.mkdtempSync(path.join(os.tmpdir(), "catasoft-adopt-"))
);
const legacyPath = path.join(workDir, "dev.db");
const managedPath = path.join(workDir, "managed", "catasoft.db");

fs.mkdirSync(path.dirname(managedPath), { recursive: true });
fs.copyFileSync(SOURCE_DB, legacyPath);
const legacyBytes = fs.statSync(legacyPath).size;

const originalCwd = process.cwd();
process.chdir(workDir);
process.env.CATASOFT_DB_PATH = managedPath;

const { initDatabase, getDataDir, prisma } = await import(
  "../electron/database"
);

/** Row counts, so no patient field value is ever read into the test output. */
async function patientCount() {
  const rows = await prisma.$queryRawUnsafe<{ n: bigint | number }[]>(
    `SELECT COUNT(*) AS n FROM "Pacientes"`
  );
  return Number(rows[0].n);
}

describe("first run after the update", () => {
  it("adopts the database left behind by the old version", async () => {
    const result = await initDatabase();

    expect(result.adoptedFrom).toBe(legacyPath);
    expect(result.dbPath).toBe(managedPath);
    expect(fs.existsSync(managedPath)).toBe(true);

    // The source was already current, so there is nothing to apply and no
    // snapshot is taken.
    expect(result.applied).toEqual([]);
    expect(result.backup).toBeNull();
  });

  it("carries the existing records over", async () => {
    expect(await patientCount()).toBeGreaterThan(0);
    expect(fs.statSync(managedPath).size).toBe(legacyBytes);
  });

  it("copies rather than moves, so the old file stays as a fallback", () => {
    expect(fs.existsSync(legacyPath)).toBe(true);
    expect(fs.statSync(legacyPath).size).toBe(legacyBytes);
  });

  it("records where the data came from", () => {
    const provenance = fs.readFileSync(
      path.join(getDataDir(), "adopted-from.txt"),
      "utf8"
    );
    expect(provenance).toContain(legacyPath);
  });

  it("does not adopt again once a managed database exists", async () => {
    const result = await initDatabase();

    expect(result.adoptedFrom).toBeNull();
    expect(result.applied).toEqual([]);

    process.chdir(originalCwd);
  });
});
