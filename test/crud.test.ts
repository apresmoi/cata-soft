import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { invokeHandler, registeredChannels } from "./electron-stub";

// `electron/database` resolves its SQLite path at module-evaluation time, so
// CATASOFT_DB_PATH has to be set before that module is loaded. A static import
// is hoisted above these statements, which is exactly the module-loading
// boundary the dynamic-import exception covers.
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "catasoft-crud-"));
process.env.CATASOFT_DB_PATH = path.join(workDir, "test.db");
fs.writeFileSync(process.env.CATASOFT_DB_PATH, "");

const { prisma, migrateDatabase } = await import("../electron/database");
const { registerIpcHandlers } = await import("../electron/controller");

beforeAll(async () => {
  await migrateDatabase(
    prisma,
    path.resolve(__dirname, "..", "prisma", "migrations")
  );

  registerIpcHandlers();
});

type PacienteRecord = {
  id: string;
  nombre: string;
  documento: string;
  telefono: string | null;
  direccion: string | null;
  email: string | null;
  fechaNacimiento: Date;
  obraSocial: string | null;
  numeroObraSocial: string | null;
  antecedentes: string | null;
  medicacionHabitual: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type PacienteWithEdad = PacienteRecord & { edad: number };

type EvolucionRecord = {
  id: string;
  pacienteId: string;
  fecha: Date;
  motivo: string | null;
  examenFisico: string | null;
  plan: string | null;
};

type AntropometriaRecord = {
  id: string;
  pacienteId: string;
  fecha: Date;
  peso: number;
  talla: number;
  imc: number;
};

type HospitalizacionRecord = {
  id: string;
  pacienteId: string;
  fechaIngreso: Date;
  fechaEgreso: Date | null;
  motivo: string;
  notas: string | null;
};

type InterconsultaRecord = {
  id: string;
  pacienteId: string;
  fecha: Date;
  motivo: string;
  notas: string | null;
};

type ArchivoRecord = {
  id: string;
  pacienteId: string;
  nombre: string;
};

type HistorialEntry = {
  id: string;
  type: string;
  fecha?: Date;
  createdAt: Date;
};

let documentoCounter = 0;
function uniqueDocumento(): string {
  documentoCounter += 1;
  return `DOC-${documentoCounter}-${crypto.randomUUID().slice(0, 8)}`;
}

function pacienteInput(overrides: Record<string, unknown> = {}) {
  return {
    nombre: "Ana Perez",
    documento: uniqueDocumento(),
    telefono: null,
    direccion: null,
    email: null,
    fechaNacimiento: new Date("1990-01-01T00:00:00.000Z"),
    obraSocial: null,
    numeroObraSocial: null,
    antecedentes: null,
    medicacionHabitual: null,
    ...overrides,
  };
}

/** A `fechaNacimiento` exactly `years` years before now, shifted by `dayOffset`
 * days so the birthday anchor (month/day) can be placed in the future or past
 * relative to today without the test rotting as the calendar advances. */
function dobYearsAgo(years: number, dayOffset = 0): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dayOffset);
  d.setUTCFullYear(d.getUTCFullYear() - years);
  return d;
}

async function createPaciente(overrides: Record<string, unknown> = {}) {
  return (await invokeHandler(
    "create-paciente",
    pacienteInput(overrides)
  )) as PacienteRecord;
}

describe("paciente lifecycle", () => {
  it("round-trips demographics through create and get", async () => {
    const created = await createPaciente({
      nombre: "Maria Gomez",
      documento: uniqueDocumento(),
      obraSocial: "OSDE",
      telefono: "111-2222",
    });

    const fetched = (await invokeHandler(
      "get-paciente",
      created.id
    )) as PacienteWithEdad;

    expect(fetched.nombre).toBe("Maria Gomez");
    expect(fetched.documento).toBe(created.documento);
    expect(fetched.obraSocial).toBe("OSDE");
    expect(fetched.telefono).toBe("111-2222");
  });

  it("applies partial updates and reflects them on the next read", async () => {
    const created = await createPaciente({ nombre: "Original Nombre" });

    await invokeHandler("update-paciente", { nombre: "Nombre Actualizado" }, created.id);

    const fetched = (await invokeHandler(
      "get-paciente",
      created.id
    )) as PacienteWithEdad;
    expect(fetched.nombre).toBe("Nombre Actualizado");
  });

  it("returns null after delete", async () => {
    const created = await createPaciente();

    await invokeHandler("delete-paciente", created.id);

    const fetched = await invokeHandler("get-paciente", created.id);
    expect(fetched).toBeNull();
  });
});

describe("edad derivation", () => {
  it("computes a whole-years age for a birthday that already occurred this year", async () => {
    const created = await createPaciente({ fechaNacimiento: dobYearsAgo(30, 0) });

    const fetched = (await invokeHandler(
      "get-paciente",
      created.id
    )) as PacienteWithEdad;
    expect(fetched.edad).toBe(30);

    const list = (await invokeHandler("get-pacientes")) as PacienteWithEdad[];
    const inList = list.find((p) => p.id === created.id);
    expect(inList?.edad).toBe(30);
  });

  it("does not count a birthday that has not yet occurred this year", async () => {
    // Born exactly 30 years before a date 5 days from now: today the person
    // has not yet had their 30th birthday, so they are still 29.
    const created = await createPaciente({ fechaNacimiento: dobYearsAgo(30, 5) });

    const fetched = (await invokeHandler(
      "get-paciente",
      created.id
    )) as PacienteWithEdad;

    // computeAge derives the age from elapsed wall-clock time by re-basing
    // it at the Unix epoch, which correctly keeps a not-yet-reached birthday
    // at the lower age. This is the real, correct behavior - not a bug.
    expect(fetched.edad).toBe(29);
  });
});

describe("get-pacientes ordering and shape", () => {
  it("orders results by nombre ascending regardless of insertion order", async () => {
    const zeta = await createPaciente({ nombre: "Zeta Paciente" });
    const alfa = await createPaciente({ nombre: "Alfa Paciente" });
    const medio = await createPaciente({ nombre: "Medio Paciente" });

    const list = (await invokeHandler("get-pacientes")) as PacienteWithEdad[];
    const ids = new Set([zeta.id, alfa.id, medio.id]);
    const ourNames = list.filter((p) => ids.has(p.id)).map((p) => p.nombre);

    expect(ourNames).toEqual(["Alfa Paciente", "Medio Paciente", "Zeta Paciente"]);
  });

  it("selects the renderer's field set: edad present, clinical notes absent", async () => {
    const created = await createPaciente();
    const list = (await invokeHandler("get-pacientes")) as PacienteWithEdad[];
    const entry = list.find((p) => p.id === created.id) as PacienteWithEdad;

    expect(entry).toHaveProperty("edad");
    expect(entry).not.toHaveProperty("antecedentes");
    expect(entry).not.toHaveProperty("medicacionHabitual");
  });
});

describe("documento uniqueness", () => {
  it("rejects a second paciente with an existing documento", async () => {
    const documento = uniqueDocumento();
    await createPaciente({ documento });

    await expect(createPaciente({ documento })).rejects.toBeTruthy();
  });
});

describe("evolucion", () => {
  it("round-trips create, update, and delete", async () => {
    const paciente = await createPaciente();
    const fecha = new Date("2024-05-01T00:00:00.000Z");

    const created = (await invokeHandler(
      "create-evolucion",
      { fecha, motivo: "Control", examenFisico: "Normal", plan: "Continuar" },
      paciente.id
    )) as EvolucionRecord;

    const fetched = (await invokeHandler(
      "get-evolucion",
      created.id
    )) as EvolucionRecord;
    expect(fetched.motivo).toBe("Control");
    expect(fetched.examenFisico).toBe("Normal");
    expect(fetched.pacienteId).toBe(paciente.id);

    const updated = (await invokeHandler(
      "update-evolucion",
      { plan: "Alta" },
      created.id
    )) as EvolucionRecord;
    expect(updated.plan).toBe("Alta");

    await invokeHandler("delete-evolucion", created.id);
    const afterDelete = await invokeHandler("get-evolucion", created.id);
    expect(afterDelete).toBeNull();
  });
});

describe("interconsulta", () => {
  it("round-trips create, update, and delete", async () => {
    const paciente = await createPaciente();
    const fecha = new Date("2024-06-01T00:00:00.000Z");

    const created = (await invokeHandler(
      "create-interconsulta",
      { fecha, motivo: "Cardiologia", notas: "Pendiente" },
      paciente.id
    )) as InterconsultaRecord;

    const fetched = (await invokeHandler(
      "get-interconsulta",
      created.id
    )) as InterconsultaRecord;
    expect(fetched.motivo).toBe("Cardiologia");
    expect(fetched.notas).toBe("Pendiente");
    // A new interconsulta is unanswered until someone says otherwise; the
    // summary's "Items abiertos" panel reads exactly this field.
    expect(fetched.estado).toBe("pendiente");

    const updated = (await invokeHandler(
      "update-interconsulta",
      { notas: "Resuelta", estado: "respondida" },
      created.id
    )) as InterconsultaRecord;
    expect(updated.notas).toBe("Resuelta");
    expect(updated.estado).toBe("respondida");

    await invokeHandler("delete-interconsulta", created.id);
    const afterDelete = await invokeHandler("get-interconsulta", created.id);
    expect(afterDelete).toBeNull();
  });
});

describe("hospitalizacion", () => {
  it("round-trips create, update, and delete", async () => {
    const paciente = await createPaciente();
    const fechaIngreso = new Date("2024-07-01T00:00:00.000Z");
    const fechaEgreso = new Date("2024-07-10T00:00:00.000Z");

    const created = (await invokeHandler(
      "create-hospitalizacion",
      { fechaIngreso, fechaEgreso, motivo: "Neumonia", notas: null },
      paciente.id
    )) as HospitalizacionRecord;

    const fetched = (await invokeHandler(
      "get-hospitalizacion",
      created.id
    )) as HospitalizacionRecord;
    expect(fetched.motivo).toBe("Neumonia");
    expect(fetched.fechaEgreso?.toISOString()).toBe(fechaEgreso.toISOString());

    const updated = (await invokeHandler(
      "update-hospitalizacion",
      { motivo: "Neumonia resuelta" },
      created.id
    )) as HospitalizacionRecord;
    expect(updated.motivo).toBe("Neumonia resuelta");

    await invokeHandler("delete-hospitalizacion", created.id);
    const afterDelete = await invokeHandler("get-hospitalizacion", created.id);
    expect(afterDelete).toBeNull();
  });

  it("allows an open hospitalization with a null fechaEgreso", async () => {
    const paciente = await createPaciente();

    const created = (await invokeHandler(
      "create-hospitalizacion",
      {
        fechaIngreso: new Date("2024-08-01T00:00:00.000Z"),
        fechaEgreso: null,
        motivo: "Observacion",
        notas: null,
      },
      paciente.id
    )) as HospitalizacionRecord;

    const fetched = (await invokeHandler(
      "get-hospitalizacion",
      created.id
    )) as HospitalizacionRecord;
    expect(fetched.fechaEgreso).toBeNull();
  });
});

describe("antropometria", () => {
  it("round-trips create, update, and delete with numeric measurements", async () => {
    const paciente = await createPaciente();
    const fecha = new Date("2024-09-01T00:00:00.000Z");

    const created = (await invokeHandler(
      "create-antropometria",
      { fecha, peso: 70.5, talla: 1.75, imc: 23.02 },
      paciente.id
    )) as AntropometriaRecord;

    expect(typeof created.peso).toBe("number");
    expect(typeof created.talla).toBe("number");
    expect(typeof created.imc).toBe("number");

    const fetched = (await invokeHandler(
      "get-antropometria",
      created.id
    )) as AntropometriaRecord;
    expect(fetched.peso).toBeCloseTo(70.5);
    expect(fetched.talla).toBeCloseTo(1.75);
    expect(fetched.imc).toBeCloseTo(23.02);
    expect(typeof fetched.peso).toBe("number");

    const updated = (await invokeHandler(
      "update-antropometria",
      { peso: 72.1 },
      created.id
    )) as AntropometriaRecord;
    expect(updated.peso).toBeCloseTo(72.1);
    expect(typeof updated.peso).toBe("number");

    await invokeHandler("delete-antropometria", created.id);
    const afterDelete = await invokeHandler("get-antropometria", created.id);
    expect(afterDelete).toBeNull();
  });
});

describe("get-historial", () => {
  it("returns an empty list for a paciente with no history", async () => {
    const paciente = await createPaciente();
    const historial = await invokeHandler("get-historial", paciente.id);
    expect(historial).toEqual([]);
  });

  it("merges every child collection and sorts descending by the effective date", async () => {
    const paciente = await createPaciente();
    const now = new Date();
    const inDays = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

    // `fecha` drives ordering for entities that carry it: place these far
    // apart on the timeline so they bracket the createdAt-driven entities.
    const evolucion = (await invokeHandler(
      "create-evolucion",
      { fecha: inDays(10), motivo: "e", examenFisico: null, plan: null },
      paciente.id
    )) as EvolucionRecord;
    const antropometria = (await invokeHandler(
      "create-antropometria",
      { fecha: inDays(5), peso: 60, talla: 1.6, imc: 23 },
      paciente.id
    )) as AntropometriaRecord;
    const interconsulta = (await invokeHandler(
      "create-interconsulta",
      { fecha: inDays(-30), motivo: "i", notas: null },
      paciente.id
    )) as InterconsultaRecord;

    // A hospitalization admitted long ago must sort by its admission date,
    // not by when the row happened to be inserted.
    const hospitalizacion = (await invokeHandler(
      "create-hospitalizacion",
      {
        fechaIngreso: inDays(-1000),
        fechaEgreso: null,
        motivo: "h",
        notas: null,
      },
      paciente.id
    )) as HospitalizacionRecord;

    const archivoId = crypto.randomUUID();
    const archivoCreatedAt = new Date().toISOString();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ArchivosAdjuntos" ("id","pacienteId","tipo","nombre","path","createdAt","updatedAt")
       VALUES (?,?,?,?,?,?,?)`,
      archivoId,
      paciente.id,
      "application/pdf",
      "informe.pdf",
      "/tmp/informe.pdf",
      archivoCreatedAt,
      archivoCreatedAt
    );

    const historial = (await invokeHandler(
      "get-historial",
      paciente.id
    )) as HistorialEntry[];

    expect(historial).toHaveLength(5);

    const types = historial.map((entry) => entry.type).sort();
    expect(types).toEqual(
      ["antropometria", "archivoadjunto", "evolucion", "hospitalizacion", "interconsulta"].sort()
    );

    // Sort key per entry: its clinical date (`fecha`, which for a
    // hospitalization is the admission date) falling back to `createdAt` for
    // attachments, which only carry an upload time.
    const effectiveKey = (entry: HistorialEntry) =>
      (entry.fecha ?? entry.createdAt).getTime();
    for (let i = 1; i < historial.length; i += 1) {
      expect(effectiveKey(historial[i - 1])).toBeGreaterThanOrEqual(
        effectiveKey(historial[i])
      );
    }

    // evolucion (+10d) > antropometria (+5d) > archivo (uploaded now)
    // > interconsulta (-30d) > hospitalizacion (admitted -1000d).
    const ids = historial.map((entry) => entry.id);
    expect(ids.indexOf(evolucion.id)).toBeLessThan(ids.indexOf(antropometria.id));
    expect(ids.indexOf(antropometria.id)).toBeLessThan(ids.indexOf(archivoId));
    expect(ids.indexOf(archivoId)).toBeLessThan(ids.indexOf(interconsulta.id));
    expect(ids.indexOf(interconsulta.id)).toBeLessThan(
      ids.indexOf(hospitalizacion.id)
    );
  });
});

describe("get-archivos", () => {
  it("returns only the requested paciente's attachments", async () => {
    const pacienteA = await createPaciente();
    const pacienteB = await createPaciente();

    const insertArchivo = async (pacienteId: string, nombre: string) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "ArchivosAdjuntos" ("id","pacienteId","tipo","nombre","path","createdAt","updatedAt")
         VALUES (?,?,?,?,?,?,?)`,
        id,
        pacienteId,
        "application/pdf",
        nombre,
        "/tmp/x.pdf",
        now,
        now
      );
      return id;
    };

    const archivoA = await insertArchivo(pacienteA.id, "de-a.pdf");
    await insertArchivo(pacienteB.id, "de-b.pdf");

    const archivosA = (await invokeHandler(
      "get-archivos",
      pacienteA.id
    )) as ArchivoRecord[];

    expect(archivosA).toHaveLength(1);
    expect(archivosA[0].id).toBe(archivoA);
    expect(archivosA[0].nombre).toBe("de-a.pdf");
  });
});

describe("registeredChannels", () => {
  it("keeps every channel the renderer invokes registered under its exact name", () => {
    const expected = [
      "create-antropometria",
      "create-archivoadjunto",
      "create-evolucion",
      "create-hospitalizacion",
      "create-interconsulta",
      "create-paciente",
      "delete-antropometria",
      "delete-archivoadjunto",
      "delete-evolucion",
      "delete-hospitalizacion",
      "delete-interconsulta",
      "delete-paciente",
      "export-backup",
      "get-antropometria",
      "get-archivos",
      "get-evolucion",
      "get-historial",
      "get-hospitalizacion",
      "get-interconsulta",
      "get-paciente",
      "get-pacientes",
      "open-archivoadjunto",
      "update-antropometria",
      "update-evolucion",
      "update-hospitalizacion",
      "update-interconsulta",
      "update-paciente",
    ].sort();

    expect(registeredChannels()).toEqual(expected);
  });
});
