import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";

const MIGRATIONS = path.resolve(__dirname, "..", "prisma", "migrations");
const ALL = [
  "20250113040249_init",
  "20250114033738_agregar_edad",
  "20250117023259_pacientes",
];

// Simulate an already-installed copy that is one migration behind, then let
// startup upgrade it. The database path must exist before
// `electron/database` is imported, since that module binds it at
// evaluation time -- hence the dynamic import further down.
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "catasoft-init-"));
const dbPath = path.join(workDir, "installed.db");
process.env.CATASOFT_DB_PATH = dbPath;
fs.writeFileSync(dbPath, "");

const PACIENTE_ID = "clzzzinstalled0000000001";

const seedMigrations = path.join(workDir, "migrations-old");
for (const name of ALL.slice(0, 2)) {
  fs.cpSync(path.join(MIGRATIONS, name), path.join(seedMigrations, name), {
    recursive: true,
  });
}

const { migrateDatabase, initDatabase, getBackupsDir, prisma } = await import(
  "../electron/database"
);

// Seed through a separate client so the app's singleton starts cold.
const seed = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });
await migrateDatabase(seed, seedMigrations);
const seededAt = new Date().toISOString();
await seed.$executeRawUnsafe(
  `INSERT INTO "Pacientes"
     ("id","nombre","documento","antecedentes","createdAt","updatedAt")
   VALUES (?,?,?,?,?,?)`,
  PACIENTE_ID,
  "Paciente Instalado",
  "DOC-INSTALADO",
  "Asma",
  seededAt,
  seededAt
);
await seed.$executeRawUnsafe(
  `INSERT INTO "Interconsultas"
     ("id","pacienteId","fecha","motivo","notas","createdAt","updatedAt")
   VALUES (?,?,?,?,?,?,?)`,
  crypto.randomUUID(),
  PACIENTE_ID,
  seededAt,
  "Cardiología",
  "Control",
  seededAt,
  seededAt
);
await seed.$disconnect();

describe("initDatabase on an existing installation", () => {
  it("upgrades the database, backs it up first, and keeps every record", async () => {
    const result = await initDatabase();

    expect(result.dbPath).toBe(dbPath);
    expect(result.applied).toEqual([ALL[2]]);

    // A snapshot must exist before a schema change touches patient data.
    expect(result.backup).not.toBeNull();
    expect(fs.existsSync(result.backup!)).toBe(true);
    expect(path.dirname(result.backup!)).toBe(getBackupsDir());

    const pacientes = await prisma.$queryRawUnsafe<
      { id: string; nombre: string; antecedentes: string | null }[]
    >(`SELECT id, nombre, antecedentes FROM "Pacientes"`);
    expect(pacientes).toEqual([
      {
        id: PACIENTE_ID,
        nombre: "Paciente Instalado",
        antecedentes: "Asma",
      },
    ]);

    const interconsultas = await prisma.$queryRawUnsafe<{ motivo: string }[]>(
      `SELECT motivo FROM "Interconsultas"`
    );
    expect(interconsultas).toEqual([{ motivo: "Cardiología" }]);
  });

  it("leaves the backup holding the pre-upgrade schema", async () => {
    const backups = fs
      .readdirSync(getBackupsDir())
      .filter((name) => name.endsWith("-pre-migration.db"));
    expect(backups.length).toBeGreaterThan(0);

    const backupPath = path.join(getBackupsDir(), backups[0]);
    const backupClient = new PrismaClient({
      datasources: { db: { url: `file:${backupPath}` } },
    });

    try {
      const columns = await backupClient.$queryRawUnsafe<{ name: string }[]>(
        `SELECT name FROM pragma_table_info('Pacientes')`
      );
      const names = columns.map((column) => column.name);

      // The snapshot predates the rebuild, so it still has `edad` and lacks
      // `fechaNacimiento`. That is what makes it a usable rollback.
      expect(names).toContain("edad");
      expect(names).not.toContain("fechaNacimiento");

      const rows = await backupClient.$queryRawUnsafe<{ nombre: string }[]>(
        `SELECT nombre FROM "Pacientes"`
      );
      expect(rows).toEqual([{ nombre: "Paciente Instalado" }]);
    } finally {
      await backupClient.$disconnect();
    }
  });

  it("does nothing and takes no backup on a second start", async () => {
    const backupsBefore = fs.readdirSync(getBackupsDir()).length;

    const result = await initDatabase();

    expect(result.applied).toEqual([]);
    expect(result.backup).toBeNull();
    expect(fs.readdirSync(getBackupsDir())).toHaveLength(backupsBefore);
  });
});
