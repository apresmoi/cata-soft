import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { invokeHandler, openedPaths } from "./electron-stub";

// `electron/database` resolves its SQLite path at module-evaluation time, so
// CATASOFT_DB_PATH has to be set before that module is loaded. A static import
// is hoisted above these statements, which is exactly the module-loading
// boundary the dynamic-import exception covers.
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "catasoft-attach-"));
process.env.CATASOFT_DB_PATH = path.join(workDir, "test.db");
fs.writeFileSync(process.env.CATASOFT_DB_PATH, "");

const {
  prisma,
  migrateDatabase,
  getUploadsDir,
} = await import("../electron/database");
const {
  registerIpcHandlers,
  resolveInside,
  assertSafeId,
  safeExtension,
  isOpenableAttachment,
} = await import("../electron/controller");

const PACIENTE_ID = "clzzzpacient0000000000001";

beforeAll(async () => {
  await migrateDatabase(
    prisma,
    path.resolve(__dirname, "..", "prisma", "migrations")
  );

  const now = new Date().toISOString();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Pacientes" ("id","nombre","documento","fechaNacimiento","createdAt","updatedAt")
     VALUES (?,?,?,?,?,?)`,
    PACIENTE_ID,
    "Paciente De Prueba",
    "DOC-1",
    now,
    now,
    now
  );

  registerIpcHandlers();
});

function attachment(overrides: Record<string, unknown> = {}) {
  return {
    nombre: "informe.pdf",
    notas: null,
    file: new Uint8Array([1, 2, 3, 4]),
    fileName: "informe.pdf",
    fileType: "application/pdf",
    ...overrides,
  };
}

describe("resolveInside", () => {
  it("returns paths inside the root", () => {
    const root = path.join(workDir, "root");
    expect(resolveInside(root, "a", "b.pdf")).toBe(path.join(root, "a", "b.pdf"));
  });

  it("rejects traversal out of the root", () => {
    const root = path.join(workDir, "root");
    expect(() => resolveInside(root, "..", "escaped.txt")).toThrow(/inválida/);
    expect(() => resolveInside(root, "a/../../escaped.txt")).toThrow(/inválida/);
  });

  it("rejects an absolute path that escapes the root", () => {
    expect(() => resolveInside(path.join(workDir, "root"), "/etc/passwd")).toThrow(
      /inválida/
    );
  });

  it("does not treat a sibling with the same prefix as inside", () => {
    const root = path.join(workDir, "uploads");
    expect(() => resolveInside(root, "..", "uploads-evil", "x")).toThrow(
      /inválida/
    );
  });
});

describe("assertSafeId", () => {
  it("accepts ids the app generates", () => {
    expect(assertSafeId(PACIENTE_ID)).toBe(PACIENTE_ID);
    expect(assertSafeId(crypto.randomUUID())).toMatch(/^[0-9a-f-]+$/);
  });

  it("rejects path segments, empties and non-strings", () => {
    for (const bad of ["../etc", "a/b", "", " ", "a".repeat(65), 7, null, undefined]) {
      expect(() => assertSafeId(bad)).toThrow(/inválido/);
    }
  });
});

describe("safeExtension", () => {
  it("keeps a plain lowercase extension", () => {
    expect(safeExtension("informe.PDF")).toBe(".pdf");
  });

  it("returns empty for names without a usable extension", () => {
    expect(safeExtension("informe")).toBe("");
    expect(safeExtension("archivo.tar.gz.")).toBe("");
    expect(safeExtension(42)).toBe("");
  });

  it("drops an extension that is not alphanumeric", () => {
    expect(safeExtension("evil.p df")).toBe("");
  });
});

describe("isOpenableAttachment", () => {
  it("allows documents and images", () => {
    expect(isOpenableAttachment("/x/a.pdf")).toBe(true);
    expect(isOpenableAttachment("/x/a.JPG")).toBe(true);
  });

  it("refuses executables and scripts", () => {
    for (const bad of ["a.exe", "a.bat", "a.cmd", "a.ps1", "a.lnk", "a.sh", "a.js"]) {
      expect(isOpenableAttachment("/x/" + bad)).toBe(false);
    }
  });
});

describe("create-archivoadjunto", () => {
  it("stores the file inside the uploads root under an opaque name", async () => {
    const created = await invokeHandler(
      "create-archivoadjunto",
      attachment(),
      PACIENTE_ID
    );

    const row = created as { id: string; path: string; nombre: string };
    const uploads = getUploadsDir();

    expect(row.path.startsWith(uploads + path.sep)).toBe(true);
    expect(fs.existsSync(row.path)).toBe(true);
    // The original filename is kept as metadata, never as the path.
    expect(row.nombre).toBe("informe.pdf");
    expect(path.basename(row.path)).not.toContain("informe");
    expect(path.extname(row.path)).toBe(".pdf");
  });

  it("cannot be talked out of the uploads root by the filename", async () => {
    const created = (await invokeHandler(
      "create-archivoadjunto",
      attachment({ fileName: "../../../../escaped.pdf", nombre: "x.pdf" }),
      PACIENTE_ID
    )) as { path: string };

    const uploads = getUploadsDir();
    expect(created.path.startsWith(uploads + path.sep)).toBe(true);
    expect(fs.existsSync(path.join(workDir, "escaped.pdf"))).toBe(false);
    expect(fs.existsSync(path.join(os.tmpdir(), "escaped.pdf"))).toBe(false);
  });

  it("refuses a patient id that is a path segment", async () => {
    await expect(
      invokeHandler("create-archivoadjunto", attachment(), "../../evil")
    ).rejects.toThrow(/inválido/);
  });

  it("refuses an unknown patient and leaves nothing on disk", async () => {
    const before = fs.readdirSync(getUploadsDir());

    await expect(
      invokeHandler("create-archivoadjunto", attachment(), "clzzznotapatient00000001")
    ).rejects.toThrow(/no existe/);

    expect(fs.readdirSync(getUploadsDir())).toEqual(before);
  });

  it("refuses an empty file", async () => {
    await expect(
      invokeHandler(
        "create-archivoadjunto",
        attachment({ file: new Uint8Array() }),
        PACIENTE_ID
      )
    ).rejects.toThrow(/vacío/);
  });

  it("refuses a file over the size cap", async () => {
    await expect(
      invokeHandler(
        "create-archivoadjunto",
        attachment({ file: new Uint8Array(25 * 1024 * 1024 + 1) }),
        PACIENTE_ID
      )
    ).rejects.toThrow(/tamaño máximo/);
  });
});

describe("open-archivoadjunto", () => {
  it("opens a stored document by id", async () => {
    const row = (await invokeHandler(
      "create-archivoadjunto",
      attachment(),
      PACIENTE_ID
    )) as { id: string; path: string };

    openedPaths.length = 0;
    await invokeHandler("open-archivoadjunto", row.id);

    expect(openedPaths).toEqual([row.path]);
  });

  it("refuses to open a row whose stored path escapes the uploads root", async () => {
    // Simulates a row written by an older version, which stored absolute
    // paths pointing anywhere on disk.
    const id = crypto.randomUUID();
    const outside = path.join(workDir, "outside.pdf");
    fs.writeFileSync(outside, "x");
    const now = new Date().toISOString();

    await prisma.$executeRawUnsafe(
      `INSERT INTO "ArchivosAdjuntos"
         ("id","pacienteId","tipo","nombre","notas","path","createdAt","updatedAt")
       VALUES (?,?,?,?,NULL,?,?,?)`,
      id,
      PACIENTE_ID,
      "application/pdf",
      "outside.pdf",
      outside,
      now,
      now
    );

    openedPaths.length = 0;
    await expect(invokeHandler("open-archivoadjunto", id)).rejects.toThrow(
      /inválida/
    );
    expect(openedPaths).toEqual([]);
  });

  it("refuses to launch an executable attachment", async () => {
    const row = (await invokeHandler(
      "create-archivoadjunto",
      attachment({ fileName: "payload.exe", fileType: "application/x-msdownload" }),
      PACIENTE_ID
    )) as { id: string };

    openedPaths.length = 0;
    await expect(invokeHandler("open-archivoadjunto", row.id)).rejects.toThrow(
      /no se puede abrir/
    );
    expect(openedPaths).toEqual([]);
  });

  it("reports a missing file instead of asking the OS to open it", async () => {
    const row = (await invokeHandler(
      "create-archivoadjunto",
      attachment(),
      PACIENTE_ID
    )) as { id: string; path: string };

    fs.rmSync(row.path);
    openedPaths.length = 0;

    await expect(invokeHandler("open-archivoadjunto", row.id)).rejects.toThrow(
      /ya no está disponible/
    );
    expect(openedPaths).toEqual([]);
  });

  it("rejects an unknown id", async () => {
    await expect(
      invokeHandler("open-archivoadjunto", "clzzznosuchfile000000001")
    ).rejects.toThrow(/no existe/);
  });
});

describe("delete-archivoadjunto", () => {
  it("removes the row and the document from disk", async () => {
    const row = (await invokeHandler(
      "create-archivoadjunto",
      attachment(),
      PACIENTE_ID
    )) as { id: string; path: string };

    expect(fs.existsSync(row.path)).toBe(true);

    await invokeHandler("delete-archivoadjunto", row.id);

    expect(fs.existsSync(row.path)).toBe(false);
    const remaining = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "ArchivosAdjuntos" WHERE id = ?`,
      row.id
    );
    expect(remaining).toEqual([]);
  });

  it("rejects an unsafe id before touching the database", async () => {
    await expect(
      invokeHandler("delete-archivoadjunto", "../../etc/passwd")
    ).rejects.toThrow(/inválido/);
  });
});
