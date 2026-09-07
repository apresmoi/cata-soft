import { getDbPath, getUploadsDir } from "./database";
import { dialog, ipcMain, shell } from "electron";
import archiver from "archiver";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

import {
  getPacientes,
  getPaciente,
  createPaciente,
  updatePaciente,
  deletePaciente,
  getAntropometria,
  createAntropometria,
  updateAntropometria,
  deleteAntropometria,
  getEvolucion,
  createEvolucion,
  updateEvolucion,
  deleteEvolucion,
  getHospitalizacion,
  createHospitalizacion,
  updateHospitalizacion,
  deleteHospitalizacion,
  getInterconsulta,
  createInterconsulta,
  updateInterconsulta,
  deleteInterconsulta,
  getHistorial,
  createArchivoAdjunto,
  getArchivoAdjunto,
  getArchivosAdjuntos,
  deleteArchivoAdjunto,
} from "./db";

/** Largest attachment we accept, in bytes. */
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

/**
 * Extensions we are willing to hand to the OS. Everything else stays on disk
 * but is never opened, so a renderer compromise cannot turn `shell.openPath`
 * into a program launcher.
 */
const OPENABLE_EXTENSIONS: Record<string, true> = {
  ".pdf": true,
  ".png": true,
  ".jpg": true,
  ".jpeg": true,
  ".gif": true,
  ".webp": true,
  ".txt": true,
  ".md": true,
  ".csv": true,
  ".json": true,
  ".xml": true,
  ".rtf": true,
};

/**
 * Resolve `segments` under `root` and refuse anything that escapes it.
 * `path.join` normalizes but does not confine, so `..` in a renderer-supplied
 * name would otherwise walk out of the uploads directory.
 */
export function resolveInside(root: string, ...segments: string[]) {
  const resolved = path.resolve(root, path.join(...segments));
  const relative = path.relative(root, resolved);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    return resolved;
  }
  throw new Error("La ruta es inválida.");
}

/** Reject ids that could be used as path segments or SQL-ish payloads. */
export function assertSafeId(id: unknown): string {
  if (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    // Used for patient ids as well as attachment ids: keep it generic.
    throw new Error("Identificador inválido.");
  }
  return id;
}

/**
 * Keep only a conservative extension from the user's filename. The stored
 * name is opaque; the original is preserved in the `nombre` column.
 */
export function safeExtension(fileName: unknown): string {
  if (typeof fileName !== "string") return "";
  const ext = path.extname(fileName).toLowerCase();
  // Capped length: an extension is a few characters, not a smuggled payload.
  return /^\.[a-z0-9]{1,10}$/.test(ext) ? ext : "";
}

/** Policy: which stored attachments we let the OS open. */
export function isOpenableAttachment(filePath: string): boolean {
  return OPENABLE_EXTENSIONS[path.extname(filePath).toLowerCase()] === true;
}

/**
 * Register an IPC handler with the shared failure contract: log with the
 * channel name, then rethrow so the renderer's promise rejects.
 */
function handle<A extends unknown[]>(
  channel: string,
  handler: (...args: A) => unknown
) {
  ipcMain.handle(channel, async (_event, ...args) => {
    try {
      return await handler(...(args as A));
    } catch (error) {
      console.error(`[ipc] ${channel} failed:`, error);
      throw error;
    }
  });
}

export function registerIpcHandlers() {
  handle("get-pacientes", () => getPacientes());
  handle("get-paciente", (id: Parameters<typeof getPaciente>[0]) => getPaciente(id));
  handle("create-paciente", (paciente: Parameters<typeof createPaciente>[0]) =>
    createPaciente(paciente)
  );
  handle(
    "update-paciente",
    (data: Parameters<typeof updatePaciente>[1], id: string) => updatePaciente(id, data)
  );
  handle("delete-paciente", (id: Parameters<typeof deletePaciente>[0]) => deletePaciente(id));

  handle("get-antropometria", (id: Parameters<typeof getAntropometria>[0]) =>
    getAntropometria(id)
  );
  handle(
    "create-antropometria",
    (data: Parameters<typeof createAntropometria>[1], pacienteId: string) =>
      createAntropometria(pacienteId, data)
  );
  handle(
    "update-antropometria",
    (data: Parameters<typeof updateAntropometria>[1], id: string) =>
      updateAntropometria(id, data)
  );
  handle("delete-antropometria", (id: Parameters<typeof deleteAntropometria>[0]) =>
    deleteAntropometria(id)
  );

  handle("get-evolucion", (id: Parameters<typeof getEvolucion>[0]) => getEvolucion(id));
  handle(
    "create-evolucion",
    (data: Parameters<typeof createEvolucion>[1], pacienteId: string) =>
      createEvolucion(pacienteId, data)
  );
  handle(
    "update-evolucion",
    (data: Parameters<typeof updateEvolucion>[1], id: string) => updateEvolucion(id, data)
  );
  handle("delete-evolucion", (id: Parameters<typeof deleteEvolucion>[0]) => deleteEvolucion(id));

  handle("get-hospitalizacion", (id: Parameters<typeof getHospitalizacion>[0]) =>
    getHospitalizacion(id)
  );
  handle(
    "create-hospitalizacion",
    (data: Parameters<typeof createHospitalizacion>[1], pacienteId: string) =>
      createHospitalizacion(pacienteId, data)
  );
  handle(
    "update-hospitalizacion",
    (data: Parameters<typeof updateHospitalizacion>[1], id: string) =>
      updateHospitalizacion(id, data)
  );
  handle("delete-hospitalizacion", (id: Parameters<typeof deleteHospitalizacion>[0]) =>
    deleteHospitalizacion(id)
  );

  handle("get-interconsulta", (id: Parameters<typeof getInterconsulta>[0]) =>
    getInterconsulta(id)
  );
  handle(
    "create-interconsulta",
    (data: Parameters<typeof createInterconsulta>[1], pacienteId: string) =>
      createInterconsulta(pacienteId, data)
  );
  handle(
    "update-interconsulta",
    (data: Parameters<typeof updateInterconsulta>[1], id: string) =>
      updateInterconsulta(id, data)
  );
  handle("delete-interconsulta", (id: Parameters<typeof deleteInterconsulta>[0]) =>
    deleteInterconsulta(id)
  );

  handle("get-historial", (pacienteId: Parameters<typeof getHistorial>[0]) =>
    getHistorial(pacienteId)
  );
  handle("get-archivos", (pacienteId: Parameters<typeof getArchivosAdjuntos>[0]) =>
    getArchivosAdjuntos(pacienteId)
  );

  handle(
    "create-archivoadjunto",
    async (
      data: Parameters<typeof createArchivoAdjunto>[1],
      pacienteId: string
    ) => {
      const id = assertSafeId(pacienteId);
      const { file, fileName, fileType, ...rest } = data as Parameters<
        typeof createArchivoAdjunto
      >[1] & {
        file?: Uint8Array | number[] | ArrayBuffer;
        fileName?: unknown;
        fileType?: unknown;
      }; // IPC boundary: renderer args arrive untyped.

      // Authorize before touching the filesystem: an unknown patient must not be
      // able to create a directory or leave a file behind.
      const paciente = await getPaciente(id);
      if (!paciente) throw new Error("El paciente no existe.");

      const bytes = Buffer.from(new Uint8Array(file ?? new ArrayBuffer(0)));
      if (bytes.byteLength === 0) throw new Error("El archivo está vacío.");
      if (bytes.byteLength > MAX_ATTACHMENT_BYTES) {
        throw new Error("El archivo supera el tamaño máximo permitido (25 MB).");
      }

      const patientDir = resolveInside(getUploadsDir(), id);
      fs.mkdirSync(patientDir, { recursive: true });

      const storedName = crypto.randomUUID() + safeExtension(fileName);
      const filePath = resolveInside(patientDir, storedName);

      fs.writeFileSync(filePath, bytes);

      try {
        return await createArchivoAdjunto(id, {
          ...rest,
          tipo: typeof fileType === "string" ? fileType : "",
          path: filePath,
        });
      } catch (error) {
        // Compensate: never leave an orphan file behind a failed insert.
        if (fs.existsSync(filePath)) fs.rmSync(filePath);
        console.error("Error saving file:", error);
        throw error;
      }
    }
  );

  handle("delete-archivoadjunto", async (id: Parameters<typeof deleteArchivoAdjunto>[0]) => {
    const archivo = await deleteArchivoAdjunto(assertSafeId(id));

    // Remove the document too; a record the clinician deleted must not remain
    // readable on disk. The row is already gone, so a failure here is logged
    // rather than surfaced.
    try {
      const filePath = resolveInside(getUploadsDir(), path.relative(getUploadsDir(), archivo.path));
      if (fs.existsSync(filePath)) fs.rmSync(filePath);
    } catch (error) {
      console.error("Error deleting attachment file:", error);
    }

    return archivo;
  });

  handle("open-archivoadjunto", async (id: Parameters<typeof getArchivoAdjunto>[0]) => {
    const archivo = await getArchivoAdjunto(assertSafeId(id));
    if (!archivo) throw new Error("El archivo adjunto no existe.");

    // The path comes from our own row, but re-confine it anyway: rows written
    // by older versions contain absolute paths from outside the uploads root.
    const uploads = getUploadsDir();
    const filePath = resolveInside(uploads, path.relative(uploads, archivo.path));

    if (!isOpenableAttachment(filePath)) {
      throw new Error(
        "Este tipo de archivo no se puede abrir desde la aplicación."
      );
    }
    if (!fs.existsSync(filePath)) throw new Error("El archivo ya no está disponible.");

    return shell.openPath(filePath);
  });

  handle("export-backup", async () => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Exportar Copia de Seguridad",
      defaultPath: `CataSoft-Backup-${new Date().toISOString().replace(/[:.]/g, "-")}.zip`,
      filters: [{ name: "Archivos ZIP", extensions: ["zip"] }],
    });

    if (canceled || !filePath) return null;

    return new Promise<string>((resolve, reject) => {
      const output = fs.createWriteStream(filePath);
      const archive = archiver("zip", { zlib: { level: 9 } });
      output.on("close", () => resolve(filePath));
      archive.on("error", reject);

      archive.pipe(output);

      // Safely copy DB files including WAL/SHM to avoid corruption
      const dbPath = getDbPath();
      for (const suffix of ["", "-wal", "-shm"]) {
        const source = dbPath + suffix;
        if (fs.existsSync(source)) {
          archive.file(source, { name: `catasoft.db${suffix}` });
        }
      }

      // Add uploads directory
      const uploadsDir = getUploadsDir();
      if (fs.existsSync(uploadsDir)) {
        archive.directory(uploadsDir, "uploads");
      }

      archive.finalize();
    });
  });
}
