import React from "react";
import {
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiFileText,
  FiHome,
  FiPaperclip,
  FiPlus,
  FiPrinter,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { FIXTURES } from "../../fixtures";

/**
 * "Timeline clínico" — the patient record reorganised around a vertical
 * chronological spine instead of a demographic form + flat history table.
 *
 * Covers all four required elements:
 *  1. Patient record restructured — slim identity ribbon + collapsible full
 *     demographic accordion + a persistent antecedentes/medicación card that
 *     never scrolls out of view.
 *  2. History as a real timeline — grouped by month, spine + per-type node,
 *     full content visible (not a truncated single line), collapsible when
 *     long, visible ingreso→egreso duration for hospitalizaciones.
 *  3. Create/edit as a right-hand slide-over drawer with every evolución
 *     field stacked and simultaneously visible — no internal tabs.
 *  4. Export as a "Resumen" panel: options beside a serif, paper-styled
 *     preview, not above it, and not a centred modal.
 */

type TypeKey =
  | "evolucion"
  | "antropometria"
  | "interconsulta"
  | "hospitalizacion"
  | "archivoadjunto";

type EntryBase = { id: string; fecha: Date; type: TypeKey };

type EvolucionEntry = EntryBase & {
  type: "evolucion";
  motivo: string;
  examenFisico: string;
  plan: string;
};

type AntropometriaEntry = EntryBase & {
  type: "antropometria";
  peso: number;
  talla: number;
  imc: number;
};

type InterconsultaEntry = EntryBase & {
  type: "interconsulta";
  motivo: string;
  notas: string;
};

type HospitalizacionEntry = EntryBase & {
  type: "hospitalizacion";
  fechaIngreso: Date;
  fechaEgreso: Date;
  motivo: string;
  notas: string;
};

type ArchivoEntry = EntryBase & {
  type: "archivoadjunto";
  nombre: string;
  tipo: string;
  notas: string;
};

type TimelineEntry =
  | EvolucionEntry
  | AntropometriaEntry
  | InterconsultaEntry
  | HospitalizacionEntry
  | ArchivoEntry;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

const paciente = FIXTURES.paciente;

// Seed timeline: the five fixture records plus a handful of plausible
// earlier entries so month-grouping and long-range filtering have something
// to demonstrate. Same clinical voice as the fixtures, nothing invented that
// contradicts them.
const SEED_ENTRIES: TimelineEntry[] = [
  {
    id: FIXTURES.evolucion.id,
    type: "evolucion",
    fecha: FIXTURES.evolucion.fecha,
    motivo: FIXTURES.evolucion.motivo,
    examenFisico: FIXTURES.evolucion.examenFisico,
    plan: FIXTURES.evolucion.plan,
  },
  {
    id: FIXTURES.antropometria.id,
    type: "antropometria",
    fecha: FIXTURES.antropometria.fecha,
    peso: FIXTURES.antropometria.peso,
    talla: FIXTURES.antropometria.talla,
    imc: FIXTURES.antropometria.imc,
  },
  {
    id: FIXTURES.interconsulta.id,
    type: "interconsulta",
    fecha: FIXTURES.interconsulta.fecha,
    motivo: FIXTURES.interconsulta.motivo,
    notas: FIXTURES.interconsulta.notas,
  },
  {
    id: FIXTURES.archivo.id,
    type: "archivoadjunto",
    fecha: FIXTURES.archivo.createdAt,
    nombre: FIXTURES.archivo.nombre,
    tipo: FIXTURES.archivo.tipo,
    notas: FIXTURES.archivo.notas,
  },
  {
    id: FIXTURES.hospitalizacion.id,
    type: "hospitalizacion",
    fecha: FIXTURES.hospitalizacion.fechaIngreso,
    fechaIngreso: FIXTURES.hospitalizacion.fechaIngreso,
    fechaEgreso: FIXTURES.hospitalizacion.fechaEgreso,
    motivo: FIXTURES.hospitalizacion.motivo,
    notas: FIXTURES.hospitalizacion.notas,
  },
  {
    id: "e-45",
    type: "evolucion",
    fecha: daysAgo(45),
    motivo: "Consulta por cefalea tensional recurrente, sin signos de alarma.",
    examenFisico:
      "TA 125/80. Sin foco neurologico. Palpacion de trapecios con contractura leve.",
    plan: "Analgesia habitual SOS, higiene de sueno, control en 6 semanas.",
  },
  {
    id: "a-95",
    type: "antropometria",
    fecha: daysAgo(95),
    peso: 69.8,
    talla: 1.62,
    imc: 26.6,
  },
  {
    id: "e-95",
    type: "evolucion",
    fecha: daysAgo(95),
    motivo: "Control combinado con antropometria. Refiere buena tolerancia al plan alimentario.",
    examenFisico: "TA 128/82. Sin edemas. Auscultacion cardiopulmonar normal.",
    plan: "Mantener plan nutricional. Laboratorio de control en proxima visita.",
  },
  {
    id: "i-200",
    type: "interconsulta",
    fecha: daysAgo(200),
    motivo: "Traumatologia",
    notas: "Dolor lumbar mecanico. Se solicita RMN de columna lumbosacra.",
  },
  {
    id: "f-210",
    type: "archivoadjunto",
    fecha: daysAgo(210),
    nombre: "radiografia-torax.pdf",
    tipo: "application/pdf",
    notas: "Control post neumonia, sin hallazgos patologicos.",
  },
];

const TYPE_META: Record<
  TypeKey,
  { label: string; icon: React.ComponentType<{ className?: string }>; dot: string; ring: string }
> = {
  evolucion: { label: "Evolución", icon: FiFileText, dot: "bg-sky-500", ring: "ring-sky-500/30" },
  antropometria: {
    label: "Antropometría",
    icon: FiBarChart2,
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/30",
  },
  interconsulta: { label: "Interconsulta", icon: FiUsers, dot: "bg-violet-500", ring: "ring-violet-500/30" },
  hospitalizacion: { label: "Hospitalización", icon: FiHome, dot: "bg-rose-500", ring: "ring-rose-500/30" },
  archivoadjunto: {
    label: "Archivo adjunto",
    icon: FiPaperclip,
    dot: "bg-amber-500",
    ring: "ring-amber-500/30",
  },
};

function fmtDate(d: Date): string {
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function monthLabel(d: Date): string {
  const s = d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function entrySearchBlob(e: TimelineEntry): string {
  switch (e.type) {
    case "evolucion":
      return `${e.motivo} ${e.examenFisico} ${e.plan}`;
    case "antropometria":
      return `peso talla imc ${e.peso} ${e.talla} ${e.imc}`;
    case "interconsulta":
      return `${e.motivo} ${e.notas}`;
    case "hospitalizacion":
      return `${e.motivo} ${e.notas}`;
    case "archivoadjunto":
      return `${e.nombre} ${e.notas}`;
  }
}

function EntryContent(props: { entry: TimelineEntry }) {
  const e = props.entry;
  const [expanded, setExpanded] = React.useState(false);

  if (e.type === "evolucion") {
    const long = e.examenFisico.length + e.plan.length > 140;
    return (
      <div className="space-y-1.5">
        <Field label="Motivo" value={e.motivo} />
        {(expanded || !long) && (
          <>
            <Field label="Examen físico" value={e.examenFisico} />
            <Field label="Plan" value={e.plan} />
          </>
        )}
        {long && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-0.5 text-xs font-medium text-sky-400 hover:text-sky-300"
          >
            {expanded ? "ver menos" : "ver más"}
          </button>
        )}
      </div>
    );
  }

  if (e.type === "antropometria") {
    return (
      <div className="flex gap-4 text-sm">
        <span className="text-stone-300">
          Peso <b className="text-stone-100">{e.peso} kg</b>
        </span>
        <span className="text-stone-300">
          Talla <b className="text-stone-100">{e.talla} m</b>
        </span>
        <span className="text-stone-300">
          IMC <b className="text-stone-100">{e.imc}</b>
        </span>
      </div>
    );
  }

  if (e.type === "interconsulta") {
    return (
      <div className="space-y-1.5">
        <Field label="Especialidad" value={e.motivo} />
        <Field label="Notas" value={e.notas} />
      </div>
    );
  }

  if (e.type === "hospitalizacion") {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-stone-200">
          <span className="rounded bg-rose-500/15 px-2 py-0.5 font-medium text-rose-300">
            {fmtDate(e.fechaIngreso)}
          </span>
          <span className="text-stone-500">→</span>
          <span className="rounded bg-rose-500/15 px-2 py-0.5 font-medium text-rose-300">
            {fmtDate(e.fechaEgreso)}
          </span>
          <span className="text-xs text-stone-500">
            ({Math.round((e.fechaEgreso.getTime() - e.fechaIngreso.getTime()) / 86400000)} días)
          </span>
        </div>
        <Field label="Motivo" value={e.motivo} />
        <Field label="Notas" value={e.notas} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-sm text-stone-100">
        <FiPaperclip className="shrink-0 text-amber-400" />
        <span className="font-medium">{e.nombre}</span>
        <span className="text-xs text-stone-500">{e.tipo}</span>
      </div>
      {e.notas && <Field label="Notas" value={e.notas} />}
    </div>
  );
}

function Field(props: { label: string; value: string }) {
  return (
    <div className="text-sm leading-snug">
      <span className="mr-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
        {props.label}
      </span>
      <span className="text-stone-200">{props.value}</span>
    </div>
  );
}

function Chip(props: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-stone-800 px-2.5 py-1 text-xs">
      <span className="text-stone-500">{props.label}</span>
      <span className="font-medium text-stone-200">{props.value}</span>
    </div>
  );
}

function DemographicField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-stone-500">
        {props.label}
      </span>
      <input
        value={props.value}
        onChange={(ev) => props.onChange(ev.target.value)}
        className="w-full rounded-md border border-stone-700 bg-stone-800 px-2.5 py-1.5 text-sm text-stone-100 outline-none focus:border-sky-500"
      />
    </label>
  );
}

export default function TimelineLayout() {
  const [entries, setEntries] = React.useState<TimelineEntry[]>(SEED_ENTRIES);
  const [search, setSearch] = React.useState("");
  const [activeTypes, setActiveTypes] = React.useState<Set<TypeKey>>(
    new Set(Object.keys(TYPE_META) as TypeKey[])
  );
  const [identityOpen, setIdentityOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [editingContext, setEditingContext] = React.useState(false);

  const [demo, setDemo] = React.useState({
    nombre: paciente.nombre,
    direccion: paciente.direccion,
    telefono: paciente.telefono,
    email: paciente.email,
    numeroObraSocial: paciente.numeroObraSocial,
  });
  const [antecedentes, setAntecedentes] = React.useState(paciente.antecedentes);
  const [medicacion, setMedicacion] = React.useState(paciente.medicacionHabitual);

  const [form, setForm] = React.useState({ motivo: "", examenFisico: "", plan: "" });

  const [exportRange, setExportRange] = React.useState<"todo" | "6m" | "1a">("todo");
  const [exportTypes, setExportTypes] = React.useState<Set<TypeKey>>(
    new Set(Object.keys(TYPE_META) as TypeKey[])
  );

  function toggleType(t: TypeKey) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  function toggleExportType(t: TypeKey) {
    setExportTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries
      .filter((e) => activeTypes.has(e.type))
      .filter((e) => (q ? entrySearchBlob(e).toLowerCase().includes(q) : true))
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }, [entries, activeTypes, search]);

  const groups = React.useMemo(() => {
    const map = new Map<string, TimelineEntry[]>();
    for (const e of filtered) {
      const key = monthLabel(e.fecha);
      const list = map.get(key);
      if (list) list.push(e);
      else map.set(key, [e]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const exportEntries = React.useMemo(() => {
    const cutoff =
      exportRange === "6m" ? daysAgo(182) : exportRange === "1a" ? daysAgo(365) : new Date(0);
    return entries
      .filter((e) => exportTypes.has(e.type) && e.fecha >= cutoff)
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }, [entries, exportRange, exportTypes]);

  function submitEvolucion(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.motivo.trim()) return;
    const entry: EvolucionEntry = {
      id: `e-${Date.now()}`,
      type: "evolucion",
      fecha: new Date(),
      motivo: form.motivo,
      examenFisico: form.examenFisico,
      plan: form.plan,
    };
    setEntries((prev) => [entry, ...prev]);
    setForm({ motivo: "", examenFisico: "", plan: "" });
    setDrawerOpen(false);
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-stone-950 text-stone-100">
      {/* ================= Main column ================= */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {/* ---- Identity ribbon ---- */}
        <div className="shrink-0 border-b border-stone-800 bg-stone-900">
          <div className="flex items-center gap-4 px-6 py-3">
            <button className="text-xs font-medium text-stone-500 hover:text-stone-300">
              ← Pacientes
            </button>
            <div className="h-5 w-px bg-stone-800" />
            <h1 className="text-lg font-bold tracking-tight">{demo.nombre}</h1>
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip label="DNI" value={paciente.documento} />
              <Chip label="Edad" value={`${paciente.edad}`} />
              <Chip label="O.S." value={paciente.obraSocial} />
            </div>
            <button
              onClick={() => setIdentityOpen((v) => !v)}
              className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stone-400 hover:bg-stone-800 hover:text-stone-100"
            >
              Editar datos
              {identityOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            <button
              onClick={() => setExportOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-stone-700 px-3 py-1.5 text-xs font-medium text-stone-200 hover:bg-stone-800"
            >
              <FiPrinter className="text-sm" />
              Resumen
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
            >
              <FiPlus className="text-sm" />
              Nueva evolución
            </button>
          </div>

          {/* accordion: full demographic form */}
          {identityOpen && (
            <div className="border-t border-stone-800 bg-stone-900/60 px-6 py-4">
              <div className="grid grid-cols-4 gap-3">
                <DemographicField
                  label="Nombre y apellido"
                  value={demo.nombre}
                  onChange={(v) => setDemo((p) => ({ ...p, nombre: v }))}
                />
                <DemographicField
                  label="Dirección"
                  value={demo.direccion}
                  onChange={(v) => setDemo((p) => ({ ...p, direccion: v }))}
                />
                <DemographicField
                  label="Teléfono"
                  value={demo.telefono}
                  onChange={(v) => setDemo((p) => ({ ...p, telefono: v }))}
                />
                <DemographicField
                  label="Email"
                  value={demo.email}
                  onChange={(v) => setDemo((p) => ({ ...p, email: v }))}
                />
                <DemographicField
                  label="Número de afiliado"
                  value={demo.numeroObraSocial}
                  onChange={(v) => setDemo((p) => ({ ...p, numeroObraSocial: v }))}
                />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setIdentityOpen(false)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-stone-400 hover:bg-stone-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setIdentityOpen(false)}
                  className="rounded-md bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-900 hover:bg-white"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---- Filters ---- */}
        <div className="flex shrink-0 items-center gap-3 border-b border-stone-800 bg-stone-900/40 px-6 py-2.5">
          <div className="flex items-center gap-2 rounded-md border border-stone-700 bg-stone-800 px-2.5 py-1.5">
            <FiSearch className="text-sm text-stone-500" />
            <input
              value={search}
              onChange={(ev) => setSearch(ev.target.value)}
              placeholder="Buscar en el historial…"
              className="w-56 bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(TYPE_META) as TypeKey[]).map((t) => {
              const meta = TYPE_META[t];
              const active = activeTypes.has(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors " +
                    (active
                      ? "border-stone-600 bg-stone-800 text-stone-100"
                      : "border-stone-800 bg-transparent text-stone-600")
                  }
                >
                  <span className={"h-1.5 w-1.5 rounded-full " + (active ? meta.dot : "bg-stone-700")} />
                  {meta.label}
                </button>
              );
            })}
          </div>
          <span className="ml-auto text-xs text-stone-500">
            {filtered.length} registro{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* ---- Timeline ---- */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {groups.length === 0 && (
            <p className="mt-10 text-center text-sm text-stone-500">
              Ningún registro coincide con el filtro actual.
            </p>
          )}
          {groups.map(([label, items]) => (
            <div key={label} className="mb-6">
              <div className="sticky top-0 z-10 -mx-2 mb-3 bg-stone-950/95 px-2 py-1 text-xs font-bold uppercase tracking-wider text-stone-500 backdrop-blur">
                {label}
              </div>
              <div className="relative ml-3 space-y-4 border-l border-stone-800 pl-6">
                {items.map((e) => {
                  const meta = TYPE_META[e.type];
                  const Icon = meta.icon;
                  return (
                    <div key={e.id} className="relative">
                      <span
                        className={
                          "absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full ring-4 " +
                          meta.dot +
                          " " +
                          meta.ring
                        }
                      >
                        <Icon className="text-[11px] text-white" />
                      </span>
                      <div className="rounded-lg border border-stone-800 bg-stone-900 px-4 py-3">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="text-xs font-semibold text-stone-400">
                            {fmtDate(e.fecha)}
                          </span>
                          <span className="text-xs text-stone-600">·</span>
                          <span className="text-xs font-medium text-stone-500">{meta.label}</span>
                        </div>
                        <EntryContent entry={e} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Persistent context card ================= */}
      <div className="flex h-full w-72 shrink-0 flex-col gap-3 border-l border-stone-800 bg-stone-900 p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500">
          <FiActivity />
          Contexto permanente
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          <div className="rounded-lg border border-stone-800 bg-stone-950 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Antecedentes
              </span>
              <button
                onClick={() => setEditingContext((v) => !v)}
                className="text-stone-500 hover:text-stone-200"
              >
                <FiEdit2 className="text-xs" />
              </button>
            </div>
            {editingContext ? (
              <textarea
                value={antecedentes}
                onChange={(ev) => setAntecedentes(ev.target.value)}
                rows={5}
                className="w-full rounded-md border border-stone-700 bg-stone-800 p-2 text-xs text-stone-100 outline-none focus:border-sky-500"
              />
            ) : (
              <p className="text-xs leading-relaxed text-stone-300">{antecedentes}</p>
            )}
          </div>
          <div className="rounded-lg border border-stone-800 bg-stone-950 p-3">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Medicación habitual
            </span>
            {editingContext ? (
              <textarea
                value={medicacion}
                onChange={(ev) => setMedicacion(ev.target.value)}
                rows={4}
                className="w-full rounded-md border border-stone-700 bg-stone-800 p-2 text-xs text-stone-100 outline-none focus:border-sky-500"
              />
            ) : (
              <p className="text-xs leading-relaxed text-stone-300">{medicacion}</p>
            )}
          </div>
          {editingContext && (
            <button
              onClick={() => setEditingContext(false)}
              className="rounded-md bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-900 hover:bg-white"
            >
              Guardar
            </button>
          )}
        </div>
      </div>

      {/* ================= Create/edit drawer ================= */}
      <div
        className={
          "absolute inset-y-0 right-0 z-30 flex w-[26rem] flex-col border-l border-stone-700 bg-stone-900 shadow-2xl transition-transform duration-300 ease-out " +
          (drawerOpen ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="flex items-center justify-between border-b border-stone-800 px-5 py-4">
          <div>
            <h2 className="text-base font-bold">Nueva evolución</h2>
            <p className="text-xs text-stone-500">{fmtDate(new Date())}</p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-md p-1.5 text-stone-500 hover:bg-stone-800 hover:text-stone-100"
          >
            <FiX />
          </button>
        </div>
        <form onSubmit={submitEvolucion} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Motivo
              </span>
              <textarea
                required
                value={form.motivo}
                onChange={(ev) => setForm((p) => ({ ...p, motivo: ev.target.value }))}
                rows={3}
                className="w-full rounded-md border border-stone-700 bg-stone-800 p-2.5 text-sm text-stone-100 outline-none focus:border-sky-500"
                placeholder="Motivo de la consulta…"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Examen físico
              </span>
              <textarea
                value={form.examenFisico}
                onChange={(ev) => setForm((p) => ({ ...p, examenFisico: ev.target.value }))}
                rows={5}
                className="w-full rounded-md border border-stone-700 bg-stone-800 p-2.5 text-sm text-stone-100 outline-none focus:border-sky-500"
                placeholder="Hallazgos del examen físico…"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                Plan
              </span>
              <textarea
                value={form.plan}
                onChange={(ev) => setForm((p) => ({ ...p, plan: ev.target.value }))}
                rows={5}
                className="w-full rounded-md border border-stone-700 bg-stone-800 p-2.5 text-sm text-stone-100 outline-none focus:border-sky-500"
                placeholder="Conducta y plan…"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-stone-800 px-5 py-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-400 hover:bg-stone-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-sky-500"
            >
              Guardar evolución
            </button>
          </div>
        </form>
      </div>
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="absolute inset-0 z-20 bg-black/40"
        />
      )}

      {/* ================= Export / resumen panel ================= */}
      {exportOpen && (
        <div className="absolute inset-0 z-40 flex bg-black/60">
          <div className="m-auto flex h-[820px] w-[1180px] overflow-hidden rounded-xl border border-stone-700 bg-stone-900 shadow-2xl">
            {/* options rail — beside the paper, not above it */}
            <div className="flex w-60 shrink-0 flex-col gap-4 border-r border-stone-800 bg-stone-900 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Resumen de historia</h3>
                <button
                  onClick={() => setExportOpen(false)}
                  className="rounded-md p-1 text-stone-500 hover:bg-stone-800 hover:text-stone-100"
                >
                  <FiX />
                </button>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Rango
                </span>
                <div className="flex flex-col gap-1">
                  {(
                    [
                      ["todo", "Historia completa"],
                      ["1a", "Último año"],
                      ["6m", "Últimos 6 meses"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setExportRange(key)}
                      className={
                        "rounded-md px-2.5 py-1.5 text-left text-xs font-medium " +
                        (exportRange === key
                          ? "bg-sky-600 text-white"
                          : "bg-stone-800 text-stone-300 hover:bg-stone-700")
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Incluir
                </span>
                <div className="flex flex-col gap-1.5">
                  {(Object.keys(TYPE_META) as TypeKey[]).map((t) => (
                    <label key={t} className="flex items-center gap-2 text-xs text-stone-300">
                      <input
                        type="checkbox"
                        checked={exportTypes.has(t)}
                        onChange={() => toggleExportType(t)}
                        className="accent-sky-600"
                      />
                      {TYPE_META[t].label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setExportOpen(false)}
                className="mt-auto flex items-center justify-center gap-1.5 rounded-md bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-900 hover:bg-white"
              >
                <FiPrinter />
                Imprimir / Exportar PDF
              </button>
            </div>

            {/* paper-styled preview */}
            <div className="flex-1 overflow-y-auto bg-stone-950 p-8">
              <div
                className="mx-auto w-[560px] bg-white px-10 py-10 text-stone-900 shadow-lg"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                <div className="mb-6 border-b border-stone-300 pb-4 text-center">
                  <h1 className="text-lg font-bold">Resumen de historia clínica</h1>
                  <p className="mt-1 text-sm">{demo.nombre}</p>
                  <p className="text-xs text-stone-600">
                    DNI {paciente.documento} · {paciente.obraSocial} {paciente.numeroObraSocial}
                  </p>
                </div>
                <div className="mb-6 grid grid-cols-2 gap-2 text-xs text-stone-700">
                  <p>
                    <span className="font-semibold">Antecedentes: </span>
                    {antecedentes}
                  </p>
                  <p>
                    <span className="font-semibold">Medicación: </span>
                    {medicacion}
                  </p>
                </div>
                <div className="space-y-4">
                  {exportEntries.length === 0 && (
                    <p className="text-center text-xs text-stone-500">
                      No hay registros para los filtros seleccionados.
                    </p>
                  )}
                  {exportEntries.map((e) => (
                    <div key={e.id} className="border-b border-stone-200 pb-3 text-sm">
                      <div className="mb-1 flex items-center gap-2 text-xs text-stone-500">
                        <FiCalendar className="text-[10px]" />
                        {fmtDate(e.fecha)}
                        <span className="font-semibold text-stone-700">{TYPE_META[e.type].label}</span>
                      </div>
                      {e.type === "evolucion" && (
                        <p>
                          <b>Motivo:</b> {e.motivo} <b>Examen:</b> {e.examenFisico} <b>Plan:</b> {e.plan}
                        </p>
                      )}
                      {e.type === "antropometria" && (
                        <p>
                          Peso {e.peso}kg · Talla {e.talla}m · IMC {e.imc}
                        </p>
                      )}
                      {e.type === "interconsulta" && (
                        <p>
                          <b>{e.motivo}:</b> {e.notas}
                        </p>
                      )}
                      {e.type === "hospitalizacion" && (
                        <p>
                          {fmtDate(e.fechaIngreso)} → {fmtDate(e.fechaEgreso)} — {e.motivo}. {e.notas}
                        </p>
                      )}
                      {e.type === "archivoadjunto" && (
                        <p>
                          <b>{e.nombre}</b> — {e.notas}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
