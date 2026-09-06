import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { dialog, invokeHandler } from "./electron-stub";

/**
 * `export-backup` is the only handler that pulls in `archiver`. A packaging
 * regression there does not fail a typecheck or a registry assertion: shipping
 * archiver 8 (ESM-only) against the CommonJS main bundle threw
 * ERR_REQUIRE_ESM at load time and the whole app failed to start, while every
 * other test stayed green. This test opens the produced zip so that class of
 * breakage fails here instead of in a release.
 *
 * `electron/database` binds its SQLite path at module evaluation, so
 * CATASOFT_DB_PATH must be set before that module loads — hence the dynamic
 * import.
 */
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "catasoft-backup-"));
process.env.CATASOFT_DB_PATH = path.join(workDir, "test.db");
fs.writeFileSync(process.env.CATASOFT_DB_PATH, "");

const { prisma, migrateDatabase, getUploadsDir } = await import(
  "../electron/database"
);
const { registerIpcHandlers } = await import("../electron/controller");

beforeAll(async () => {
  await migrateDatabase(
    prisma,
    path.resolve(__dirname, "..", "prisma", "migrations")
  );
  registerIpcHandlers();
});

describe("export-backup", () => {
  it("returns null and writes nothing when the save dialog is cancelled", async () => {
    dialog.saveResult = { canceled: true, filePath: undefined };

    await expect(invokeHandler("export-backup")).resolves.toBeNull();
  });

  it("writes a readable zip holding the database and the uploads tree", async () => {
    const uploads = getUploadsDir();
    fs.mkdirSync(path.join(uploads, "clzzzpacient0000000000001"), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(uploads, "clzzzpacient0000000000001", "adjunto.pdf"),
      "not really a pdf"
    );

    const target = path.join(workDir, "backup.zip");
    dialog.saveResult = { canceled: false, filePath: target };

    await expect(invokeHandler("export-backup")).resolves.toBe(target);

    const zip = fs.readFileSync(target);
    // Local file headers, so a truncated or unfinalized archive fails here.
    expect(zip.subarray(0, 2).toString("latin1")).toBe("PK");
    expect(zip.length).toBeGreaterThan(100);

    const entries = zip.toString("latin1");
    expect(entries).toContain("catasoft.db");
    expect(entries).toContain("uploads/clzzzpacient0000000000001/adjunto.pdf");
  });
});
