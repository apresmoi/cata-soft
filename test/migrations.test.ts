import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { afterEach, describe, expect, it } from "vitest";
import {
  appliedMigrationNames,
  migrateDatabase,
  readMigrations,
  splitStatements,
} from "../electron/database";

const REAL_MIGRATIONS = path.resolve(__dirname, "..", "prisma", "migrations");
const ALL = ["20250113040249_init", "20250114033738_agregar_edad", "20250117023259_pacientes"];

const clients: PrismaClient[] = [];

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.$disconnect()));
});

/** A fresh empty SQLite file plus a client bound to it. */
function newDatabase() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "catasoft-mig-"));
  const dbPath = path.join(dir, "test.db");
  fs.writeFileSync(dbPath, "");

  const client = new PrismaClient({
    datasources: { db: { url: `file:${dbPath}` } },
  });
  clients.push(client);
  return { dbPath, client };
}

/** A migrations directory holding only the named subset, in order. */
function migrationsSubset(names: string[]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "catasoft-migdir-"));
  for (const name of names) {
    fs.cpSync(path.join(REAL_MIGRATIONS, name), path.join(dir, name), {
      recursive: true,
    });
  }
  return dir;
}

async function insertPatientWithHistory(client: PrismaClient) {
  const pacienteId = crypto.randomUUID();
  const now = new Date().toISOString();

  await client.$executeRawUnsafe(
    `INSERT INTO "Pacientes"
       ("id","nombre","documento","telefono","direccion","numeroObraSocial",
        "antecedentes","medicacionHabitual","createdAt","updatedAt")
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    pacienteId,
    "Paciente De Prueba",
    "DOC-12345",
    "+54 11 5555 5555",
    "Calle Falsa 123",
    "OS-999",
    "Hipertensión",
    "Enalapril 10mg",
    now,
    now
  );

  await client.$executeRawUnsafe(
    `INSERT INTO "Evoluciones"
       ("id","pacienteId","fecha","motivo","examenFisico","plan","createdAt","updatedAt")
     VALUES (?,?,?,?,?,?,?,?)`,
    crypto.randomUUID(),
    pacienteId,
    now,
    "Control anual",
    "Sin hallazgos",
    "Continuar tratamiento",
    now,
    now
  );

  return pacienteId;
}

describe("migrateDatabase", () => {
  it("preserves existing patient data when upgrading an older database", async () => {
    // An installed copy that only ever saw the first two migrations.
    const { client } = newDatabase();
    const applied = await migrateDatabase(client, migrationsSubset(ALL.slice(0, 2)));
    expect(applied).toEqual(ALL.slice(0, 2));

    const pacienteId = await insertPatientWithHistory(client);

    // Ship the update: the third migration rebuilds the Pacientes table.
    const upgraded = await migrateDatabase(client, REAL_MIGRATIONS);
    expect(upgraded).toEqual([ALL[2]]);

    const pacientes = await client.$queryRawUnsafe<
      { id: string; nombre: string; documento: string; antecedentes: string | null }[]
    >(`SELECT id, nombre, documento, antecedentes FROM "Pacientes"`);

    expect(pacientes).toHaveLength(1);
    expect(pacientes[0]).toMatchObject({
      id: pacienteId,
      nombre: "Paciente De Prueba",
      documento: "DOC-12345",
      antecedentes: "Hipertensión",
    });

    // The child record and its foreign key survived the table rebuild.
    const evoluciones = await client.$queryRawUnsafe<
      { pacienteId: string; motivo: string | null }[]
    >(`SELECT pacienteId, motivo FROM "Evoluciones"`);
    expect(evoluciones).toEqual([
      { pacienteId, motivo: "Control anual" },
    ]);
  });

  it("adds the new columns the upgrade introduces", async () => {
    const { client } = newDatabase();
    await migrateDatabase(client, migrationsSubset(ALL.slice(0, 2)));
    await insertPatientWithHistory(client);
    await migrateDatabase(client, REAL_MIGRATIONS);

    const columns = await client.$queryRawUnsafe<{ name: string }[]>(
      `SELECT name FROM pragma_table_info('Pacientes')`
    );
    const names = columns.map((column) => column.name);

    expect(names).toContain("fechaNacimiento");
    expect(names).toContain("email");
    expect(names).toContain("obraSocial");
    // `edad` was replaced by a value derived from fechaNacimiento.
    expect(names).not.toContain("edad");
  });

  it("is idempotent: a second run applies nothing", async () => {
    const { client } = newDatabase();
    expect(await migrateDatabase(client, REAL_MIGRATIONS)).toEqual(ALL);
    expect(await migrateDatabase(client, REAL_MIGRATIONS)).toEqual([]);
  });

  it("brings a fresh install fully up to date", async () => {
    const { client } = newDatabase();
    await migrateDatabase(client, REAL_MIGRATIONS);

    expect([...(await appliedMigrationNames(client))].sort()).toEqual(ALL);

    const tables = await client.$queryRawUnsafe<{ name: string }[]>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    );
    const names = tables.map((table) => table.name);
    for (const expected of [
      "Pacientes",
      "Evoluciones",
      "Antropometrias",
      "Hospitalizaciones",
      "Interconsultas",
      "ArchivosAdjuntos",
    ]) {
      expect(names).toContain(expected);
    }
  });

  it("records each migration the way the Prisma CLI does", async () => {
    const { client } = newDatabase();
    await migrateDatabase(client, REAL_MIGRATIONS);

    const rows = await client.$queryRawUnsafe<
      {
        migration_name: string;
        checksum: string;
        applied_steps_count: number;
        finished_at: Date | null;
        rolled_back_at: Date | null;
      }[]
    >(`SELECT migration_name, checksum, applied_steps_count, finished_at, rolled_back_at
       FROM "_prisma_migrations" ORDER BY started_at`);

    expect(rows).toHaveLength(3);
    for (const row of rows) {
      const sql = fs.readFileSync(
        path.join(REAL_MIGRATIONS, row.migration_name, "migration.sql"),
        "utf8"
      );
      // Prisma stores the sha256 of the migration file; a mismatch here means
      // the CLI would report the migration as modified.
      expect(row.checksum).toBe(
        crypto.createHash("sha256").update(sql).digest("hex")
      );
      expect(Number(row.applied_steps_count)).toBe(1);
      expect(row.finished_at).not.toBeNull();
      expect(row.rolled_back_at).toBeNull();
    }
  });

  it("does not record a migration that failed", async () => {
    const { client } = newDatabase();
    const dir = migrationsSubset([ALL[0]]);

    const broken = path.join(dir, "20260101000000_broken");
    fs.mkdirSync(broken);
    fs.writeFileSync(
      path.join(broken, "migration.sql"),
      "ALTER TABLE \"Pacientes\" ADD COLUMN \"ok\" TEXT;\nTHIS IS NOT SQL;\n"
    );

    await expect(migrateDatabase(client, dir)).rejects.toThrow();

    const applied = await appliedMigrationNames(client);
    expect(applied.has(ALL[0])).toBe(true);
    expect(applied.has("20260101000000_broken")).toBe(false);
  });
});

describe("readMigrations", () => {
  it("returns the shipped migrations in lexical order", () => {
    expect(readMigrations(REAL_MIGRATIONS).map((m) => m.name)).toEqual(ALL);
  });

  it("ignores directories without a migration.sql", () => {
    const dir = migrationsSubset([ALL[0]]);
    fs.mkdirSync(path.join(dir, "20260101000000_empty"));
    expect(readMigrations(dir).map((m) => m.name)).toEqual([ALL[0]]);
  });
});

describe("splitStatements", () => {
  it("drops comments and blank statements", () => {
    const statements = splitStatements(`
      /* Warnings:
         - dropping a column
      */
      -- CreateTable
      CREATE TABLE "A" ("id" TEXT);

      ALTER TABLE "A" ADD COLUMN "b" TEXT;
    `);

    expect(statements).toEqual([
      'CREATE TABLE "A" ("id" TEXT)',
      'ALTER TABLE "A" ADD COLUMN "b" TEXT',
    ]);
  });

  it("keeps the PRAGMA statements a table rebuild depends on", () => {
    const statements = splitStatements(
      readMigrations(REAL_MIGRATIONS).find((m) => m.name === ALL[2])!.sql
    );
    expect(statements[0]).toBe("PRAGMA defer_foreign_keys=ON");
    expect(statements).toContain("PRAGMA foreign_keys=OFF");
    expect(statements.some((s) => s.startsWith('INSERT INTO "new_Pacientes"'))).toBe(true);
  });
});
