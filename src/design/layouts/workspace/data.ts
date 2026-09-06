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

export type TabId =
  | "resumen"
  | "evoluciones"
  | "antropometria"
  | "interconsultas"
  | "internaciones"
  | "archivos";

export const TAB_META: Array<{ id: TabId; label: string }> = [
  { id: "resumen", label: "Resumen" },
  { id: "evoluciones", label: "Evoluciones" },
  { id: "antropometria", label: "Antropometría" },
  { id: "interconsultas", label: "Interconsultas" },
  { id: "internaciones", label: "Internaciones" },
  { id: "archivos", label: "Archivos" },
];

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
].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

export type Novedad = {
  id: string;
  fecha: Date;
  tipo: TabId;
  texto: string;
};

const novedadRows: Novedad[] = [
  { id: "n1", fecha: initialEvoluciones[0].fecha, tipo: "evoluciones", texto: `Evolución: ${initialEvoluciones[0].motivo}` },
  { id: "n2", fecha: initialAntropometria[initialAntropometria.length - 1].fecha, tipo: "antropometria", texto: `Antropometría registrada: IMC ${initialAntropometria[initialAntropometria.length - 1].imc}` },
  { id: "n3", fecha: initialInterconsultas[0].fecha, tipo: "interconsultas", texto: `Interconsulta a ${initialInterconsultas[0].especialidad} (${initialInterconsultas[0].estado})` },
  { id: "n4", fecha: initialArchivos[0].fecha, tipo: "archivos", texto: `Archivo adjuntado: ${initialArchivos[0].nombre}` },
];

export const novedades = novedadRows.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
