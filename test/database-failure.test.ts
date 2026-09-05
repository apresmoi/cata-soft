import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";

/**
 * Fail-closed behaviour. The clinic's records are irreplaceable, so a migration
 * that blows up half way must leave the database exactly as it was and stop the
 * app from starting, rather than serving a half-migrated schema.
 *
 * CATASOFT_DB_PATH must be set before `electron/database` is loaded (it builds
 * its Prisma client at evaluation time), hence the dynamic import.
 */

const MIGRATIONS = path.resolve(__dirname, "..", "prisma", "migrations");
const ALL = [
  "20250113040249_init",
  "20250114033738_agregar_edad",
  "20250117023259_pacientes",
];

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "catasoft-fail-"));
const dbPath = path.join(workDir, "installed.db");
process.env.CATASOFT_DB_PATH = dbPath;
fs.writeFileSync(dbPath, "");

const PACIENTE_ID = "clzzzfailsafe00000000001";
// A clean set for seeding (migrations #1 and #2 only)...
const seedDir = path.join(workDir, "migrations-seed");
for (const name of ALL.slice(0, 2)) {
  fs.cpSync(path.join(MIGRATIONS, name), path.join(seedDir, name), {
    recursive: true,
  });
}

// ...and the same set plus a migration that breaks half way: the first
// statement succeeds, the second is not SQL. That proves the restore undoes a
// PARTIALLY applied migration, not just a no-op.
const brokenDir = path.join(workDir, "migrations-broken");
fs.cpSync(seedDir, brokenDir, { recursive: true });
const brokenName = "20260101000000_broken";
fs.mkdirSync(path.join(brokenDir, brokenName), { recursive: true });
fs.writeFileSync(
  path.join(brokenDir, brokenName, "migration.sql"),
  'ALTER TABLE "Pacientes" ADD COLUMN "columna_a_medias" TEXT;\nESTO NO ES SQL;\n'
);

const { initDatabase, migrateDatabase, getBackupsDir, prisma } = await import(
  "../electron/database"
);

const seed = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });
await migrateDatabase(seed, seedDir);
const seededAt = new Date().toISOString();
await seed.$executeRawUnsafe(
  `INSERT INTO "Pacientes"
     ("id","nombre","documento","antecedentes","createdAt","updatedAt")
   VALUES (?,?,?,?,?,?)`,
  PACIENTE_ID,
  "Paciente Irremplazable",
  "DOC-CRITICO",
  "Diabetes tipo 2",
  seededAt,
  seededAt
);
await seed.$executeRawUnsafe(
  `INSERT INTO "Evoluciones"
     ("id","pacienteId","fecha","motivo","createdAt","updatedAt")
   VALUES (?,?,?,?,?,?)`,
  crypto.randomUUID(),
  PACIENTE_ID,
  seededAt,
  "Consulta inicial",
  seededAt,
  seededAt
);
await seed.$disconnect();

async function columnNames(client: PrismaClient) {
  const columns = await client.$queryRawUnsafe<{ name: string }[]>(
    `SELECT name FROM pragma_table_info('Pacientes')`
  );
  return columns.map((column) => column.name);
}

describe("startup when migrations cannot be found", () => {
  it("refuses to start rather than guessing at the schema", async () => {
    process.env.CATASOFT_MIGRATIONS_DIR = path.join(workDir, "does-not-exist");

    await expect(initDatabase()).rejects.toThrow(/migraciones/);

    // Nothing was touched.
    expect(await columnNames(prisma)).toContain("edad");
    delete process.env.CATASOFT_MIGRATIONS_DIR;
  });
});

describe("startup when a migration fails", () => {
  it("rejects, restores the backup, and keeps every record", async () => {
    process.env.CATASOFT_MIGRATIONS_DIR = brokenDir;

    await expect(initDatabase()).rejects.toThrow(
      /copia de seguridad|Falló la migración/
    );

    // The half-applied column is gone: the file was rolled back, not patched.
    const columns = await columnNames(prisma);
    expect(columns).not.toContain("columna_a_medias");
    expect(columns).toContain("edad");

    const pacientes = await prisma.$queryRawUnsafe<
      { nombre: string; antecedentes: string | null }[]
    >(`SELECT nombre, antecedentes FROM "Pacientes"`);
    expect(pacientes).toEqual([
      { nombre: "Paciente Irremplazable", antecedentes: "Diabetes tipo 2" },
    ]);

    const evoluciones = await prisma.$queryRawUnsafe<{ motivo: string }[]>(
      `SELECT motivo FROM "Evoluciones"`
    );
    expect(evoluciones).toEqual([{ motivo: "Consulta inicial" }]);
  });

  it("does not record the migration that failed", async () => {
    const rows = await prisma.$queryRawUnsafe<{ migration_name: string }[]>(
      `SELECT migration_name FROM "_prisma_migrations"`
    );
    const names = rows.map((row) => row.migration_name);

    expect(names).toEqual(ALL.slice(0, 2));
    expect(names).not.toContain(brokenName);
  });

  it("kept the snapshot it restored from", () => {
    const backups = fs
      .readdirSync(getBackupsDir())
      .filter((name) => name.endsWith("-pre-migration.db"));

    expect(backups.length).toBeGreaterThan(0);
    delete process.env.CATASOFT_MIGRATIONS_DIR;
  });
});
