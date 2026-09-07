/**
 * Local demo data for the "workspace" layout.
 *
 * The shared fixtures only carry one record of each clinical type, which is
 * too thin to demonstrate sortable tables or a trend sparkline. This module
 * takes each real fixture record and surrounds it with a handful of clearly
 * synthetic siblings (older dates, plausible values) so the tables in this
 * layout have enough rows to be worth looking at. Nothing here mutates or
 * replaces `src/design/fixtures.ts` -- it is read-only presentation filler
 * layered on top of it.
 */
import { FIXTURES } from "../../fixtures";

/** The workspace has two panes; record types are filters, not tabs. */
export type TabId = "resumen" | "registros";

export const TAB_META: Array<{ id: TabId; label: string }> = [
  { id: "resumen", label: "Resumen" },
  { id: "registros", label: "Registros" },
];

/** Every clinical record type, used for the unified table and its filters. */
export type RecordKind =
  | "evolucion"
  | "antropometria"
  | "interconsulta"
  | "internacion"
  | "archivo";

function shiftDays(base: Date, days: number): Date {
  return new Date(base.getTime() - days * 24 * 60 * 60 * 1000);
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round(Math.abs(b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

export type EvolucionRow = {
  id: string;
  fecha: Date;
  motivo: string;
  examenFisico: string;
  plan: string;
};

export const initialEvoluciones: EvolucionRow[] = [
  {
    id: FIXTURES.evolucion.id,
    fecha: FIXTURES.evolucion.fecha,
    motivo: FIXTURES.evolucion.motivo,
    examenFisico: FIXTURES.evolucion.examenFisico,
    plan: FIXTURES.evolucion.plan,
  },
  {
    id: "e-synth-1",
    fecha: shiftDays(FIXTURES.evolucion.fecha, 92),
    motivo: "Chequeo general anual. Sin síntomas nuevos.",
    examenFisico: "TA 128/82. Peso estable. Auscultación cardiopulmonar sin particularidades.",
    plan: "Solicitar laboratorio de rutina. Continuar tratamiento actual.",
  },
  {
    id: "e-synth-2",
    fecha: shiftDays(FIXTURES.evolucion.fecha, 210),
    motivo: "Consulta por cefalea tensional ocasional, sin signos de alarma.",
    examenFisico: "TA 132/88. Examen neurológico sin foco motor ni sensitivo. Fondo de ojo no realizado.",
    plan: "Paracetamol 500mg SOS. Pautas de alarma explicadas. Control en 1 mes.",
  },
];

export type AntropometriaRow = {
  id: string;
  fecha: Date;
  peso: number;
  talla: number;
  imc: number;
};

export const initialAntropometria: AntropometriaRow[] = [
  { id: "a-synth-4", fecha: shiftDays(FIXTURES.antropometria.fecha, 380), peso: 71.2, talla: 1.62, imc: 27.1 },
  { id: "a-synth-3", fecha: shiftDays(FIXTURES.antropometria.fecha, 270), peso: 70.5, talla: 1.62, imc: 26.9 },
  { id: "a-synth-2", fecha: shiftDays(FIXTURES.antropometria.fecha, 180), peso: 69.8, talla: 1.62, imc: 26.6 },
  { id: "a-synth-1", fecha: shiftDays(FIXTURES.antropometria.fecha, 90), peso: 69.0, talla: 1.62, imc: 26.3 },
  {
    id: FIXTURES.antropometria.id,
    fecha: FIXTURES.antropometria.fecha,
    peso: FIXTURES.antropometria.peso,
    talla: FIXTURES.antropometria.talla,
    imc: FIXTURES.antropometria.imc,
  },
].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

export type InterconsultaRow = {
  id: string;
  fecha: Date;
  especialidad: string;
  notas: string;
  estado: "pendiente" | "respondida";
};

const interconsultaRows: InterconsultaRow[] = [
  {
    id: "i-synth-1",
    fecha: shiftDays(FIXTURES.interconsulta.fecha, 260),
    especialidad: "Oftalmología",
    notas: "Control de fondo de ojo por antecedente de hipertensión arterial.",
    estado: "respondida",
  },
  {
    id: FIXTURES.interconsulta.id,
    fecha: FIXTURES.interconsulta.fecha,
    especialidad: FIXTURES.interconsulta.motivo,
    notas: FIXTURES.interconsulta.notas,
    estado: "pendiente",
  },
];

export const initialInterconsultas = interconsultaRows.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

export type InternacionRow = {
  id: string;
  ingreso: Date;
  egreso: Date;
  motivo: string;
  notas: string;
};

export const initialInternaciones: InternacionRow[] = [
  {
    id: FIXTURES.hospitalizacion.id,
    ingreso: FIXTURES.hospitalizacion.fechaIngreso,
    egreso: FIXTURES.hospitalizacion.fechaEgreso,
    motivo: FIXTURES.hospitalizacion.motivo,
    notas: FIXTURES.hospitalizacion.notas,
  },
];

export type ArchivoRow = {
  id: string;
  nombre: string;
  tipo: string;
  fecha: Date;
  tamanioKb: number;
};

export const initialArchivos: ArchivoRow[] = [
  {
    id: FIXTURES.archivo.id,
    nombre: FIXTURES.archivo.nombre,
    tipo: "PDF",
    fecha: FIXTURES.archivo.createdAt,
    tamanioKb: 842,
  },
  {
    id: "f-synth-1",
    nombre: "radiografia-torax.jpg",
    tipo: "Imagen",
    fecha: shiftDays(FIXTURES.archivo.createdAt, 45),
    tamanioKb: 2140,
  },
  {
    id: "f-synth-2",
    nombre: "consentimiento-informado.pdf",
    tipo: "PDF",
    fecha: shiftDays(FIXTURES.archivo.createdAt, 90),
    tamanioKb: 310,
  },
  {
    // Clinics really do attach Word files; kept here so the design shows what
    // happens when the app refuses to hand a type to the OS.
    id: "f-synth-3",
    nombre: "derivacion-traumatologia.docx",
    tipo: "Documento",
    fecha: shiftDays(FIXTURES.archivo.createdAt, 120),
    tamanioKb: 96,
  },
].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

/**
 * Mirrors `OPENABLE_EXTENSIONS` in `electron/controller.ts`: the main process
 * only hands these types to `shell.openPath`, so a renderer compromise cannot
 * turn it into a program launcher. Anything else stays on disk. Keep the two
 * lists in step.
 */
const OPENABLE_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".txt",
  ".md",
  ".csv",
  ".json",
  ".xml",
  ".rtf",
];

export function isOpenableArchivo(nombre: string): boolean {
  const dot = nombre.lastIndexOf(".");
  if (dot < 0) return false;
  return OPENABLE_EXTENSIONS.includes(nombre.slice(dot).toLowerCase());
}

/**
 * A summary feed entry. `recordId` addresses the underlying clinical record so
 * anything shown on the summary can be opened from there -- a feed row that
 * cannot be consulted is just decoration.
 */
export type Novedad = {
  id: string;
  recordId: string;
  fecha: Date;
  tipo: RecordKind;
  texto: string;
};

const latestAnthro = initialAntropometria[initialAntropometria.length - 1];

const novedadRows: Novedad[] = [
  {
    id: "n1",
    recordId: initialEvoluciones[0].id,
    fecha: initialEvoluciones[0].fecha,
    tipo: "evolucion",
    texto: `Evolución: ${initialEvoluciones[0].motivo}`,
  },
  {
    id: "n2",
    recordId: latestAnthro.id,
    fecha: latestAnthro.fecha,
    tipo: "antropometria",
    texto: `Antropometría registrada: IMC ${latestAnthro.imc}`,
  },
  {
    id: "n3",
    recordId: initialInterconsultas[0].id,
    fecha: initialInterconsultas[0].fecha,
    tipo: "interconsulta",
    texto: `Interconsulta a ${initialInterconsultas[0].especialidad} (${initialInterconsultas[0].estado})`,
  },
  {
    id: "n4",
    recordId: initialArchivos[0].id,
    fecha: initialArchivos[0].fecha,
    tipo: "archivo",
    texto: `Archivo adjuntado: ${initialArchivos[0].nombre}`,
  },
];

export const novedades = novedadRows.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

/**
 * Patient demographics plus the two free-text clinical fields. Editable from
 * the summary, so the layout keeps it in state rather than reading the
 * fixture directly.
 */
export type PatientData = {
  id: string;
  nombre: string;
  documento: string;
  edad: number;
  fechaNacimiento: Date;
  telefono: string;
  direccion: string;
  email: string;
  obraSocial: string;
  numeroObraSocial: string;
  antecedentes: string;
  medicacionHabitual: string;
};

export const initialPatient: PatientData = {
  id: FIXTURES.paciente.id,
  nombre: FIXTURES.paciente.nombre,
  documento: FIXTURES.paciente.documento,
  edad: FIXTURES.paciente.edad,
  fechaNacimiento: FIXTURES.paciente.fechaNacimiento,
  telefono: FIXTURES.paciente.telefono,
  direccion: FIXTURES.paciente.direccion,
  email: FIXTURES.paciente.email,
  obraSocial: FIXTURES.paciente.obraSocial,
  numeroObraSocial: FIXTURES.paciente.numeroObraSocial,
  antecedentes: FIXTURES.paciente.antecedentes,
  medicacionHabitual: FIXTURES.paciente.medicacionHabitual,
};

/** The full roster the landing table lists. */
export const initialPacientes: PatientData[] = FIXTURES.pacientes.map((paciente) => ({
  id: paciente.id,
  nombre: paciente.nombre,
  documento: paciente.documento,
  edad: paciente.edad,
  fechaNacimiento: paciente.fechaNacimiento,
  telefono: paciente.telefono,
  direccion: paciente.direccion,
  email: paciente.email,
  obraSocial: paciente.obraSocial,
  numeroObraSocial: paciente.numeroObraSocial,
  antecedentes: paciente.antecedentes,
  medicacionHabitual: paciente.medicacionHabitual,
}));

/** Seed for the "new patient" form. */
export const emptyPatient: PatientData = {
  id: "",
  nombre: "",
  documento: "",
  edad: 0,
  fechaNacimiento: new Date(),
  telefono: "",
  direccion: "",
  email: "",
  obraSocial: "",
  numeroObraSocial: "",
  antecedentes: "",
  medicacionHabitual: "",
};

/**
 * One row of the unified records table. Every clinical type collapses into
 * this shape so the table can show a single chronological history instead of
 * one tab per type; `kind` + `id` addresses the original row for editing.
 */
export type UnifiedRecord = {
  id: string;
  kind: RecordKind;
  fecha: Date;
  titulo: string;
  detalle: string;
  pendiente: boolean;
};

export const KIND_META: Record<RecordKind, { label: string; singular: string; chip: string; dot: string }> = {
  evolucion: { label: "Evoluciones", singular: "Evolución", chip: "bg-vessel-100 text-vessel-800", dot: "bg-vessel-600" },
  antropometria: { label: "Antropometría", singular: "Antropometría", chip: "bg-leaf-100 text-leaf-800", dot: "bg-leaf-600" },
  interconsulta: { label: "Interconsultas", singular: "Interconsulta", chip: "bg-brand-100 text-brand-800", dot: "bg-brand-600" },
  internacion: { label: "Internaciones", singular: "Internación", chip: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  archivo: { label: "Archivos", singular: "Archivo", chip: "bg-stone-200 text-stone-700", dot: "bg-stone-500" },
};

export function toUnified(input: {
  evoluciones: EvolucionRow[];
  antropometria: AntropometriaRow[];
  interconsultas: InterconsultaRow[];
  internaciones: InternacionRow[];
  archivos: ArchivoRow[];
}): UnifiedRecord[] {
  return [
    ...input.evoluciones.map((row) => ({
      id: row.id,
      kind: "evolucion" as const,
      fecha: row.fecha,
      titulo: row.motivo,
      detalle: row.plan,
      pendiente: false,
    })),
    ...input.antropometria.map((row) => ({
      id: row.id,
      kind: "antropometria" as const,
      fecha: row.fecha,
      titulo: `IMC ${row.imc.toFixed(1)}`,
      detalle: `Peso ${row.peso.toFixed(1)} kg · Talla ${row.talla.toFixed(2)} m`,
      pendiente: false,
    })),
    ...input.interconsultas.map((row) => ({
      id: row.id,
      kind: "interconsulta" as const,
      fecha: row.fecha,
      titulo: row.especialidad,
      detalle: row.notas,
      pendiente: row.estado === "pendiente",
    })),
    ...input.internaciones.map((row) => ({
      id: row.id,
      kind: "internacion" as const,
      fecha: row.ingreso,
      titulo: row.motivo,
      detalle: `${formatDate(row.ingreso)} → ${formatDate(row.egreso)} · ${row.notas}`,
      pendiente: false,
    })),
    ...input.archivos.map((row) => ({
      id: row.id,
      kind: "archivo" as const,
      fecha: row.fecha,
      titulo: row.nombre,
      detalle: `${row.tipo} · ${row.tamanioKb} KB`,
      pendiente: false,
    })),
  ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

/** Sections the export preview can include. */
export type ExportSections = {
  resumen: boolean;
  evoluciones: boolean;
  antropometria: boolean;
  interconsultas: boolean;
  internaciones: boolean;
  archivos: boolean;
};
