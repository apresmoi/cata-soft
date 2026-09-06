import { useEffect, useMemo, useRef, useState } from "react";
import { FIXTURES } from "../../fixtures";

type EntryType = "evolucion" | "antropometria" | "interconsulta" | "hospitalizacion" | "archivoadjunto";

type BaseEntry = {
  id: string;
  pacienteId: string;
  fecha: Date;
  createdAt: Date;
  updatedAt: Date;
};

type EvolutionEntry = BaseEntry & {
  type: "evolucion";
  motivo: string;
  examenFisico: string;
  plan: string;
};

type AnthropometryEntry = BaseEntry & {
  type: "antropometria";
  peso: number;
  talla: number;
  imc: number;
};

type InterconsultationEntry = BaseEntry & {
  type: "interconsulta";
  motivo: string;
  notas: string;
};

type HospitalizationEntry = BaseEntry & {
  type: "hospitalizacion";
  fechaIngreso: Date;
  fechaEgreso: Date;
  motivo: string;
  notas: string;
};

type AttachmentEntry = BaseEntry & {
  type: "archivoadjunto";
  tipo: string;
  nombre: string;
  notas: string;
  path: string;
};

type HistoryGridEntry =
  | EvolutionEntry
  | AnthropometryEntry
  | InterconsultationEntry
  | HospitalizationEntry
  | AttachmentEntry;

type RawHistoryGridEntry = Omit<HistoryGridEntry, "fecha"> & { fecha?: Date };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmtDate(d: Date): string {
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtRelative(d: Date): string {
  const days = Math.round((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days}d`;
  const months = Math.round(days / 30);
  return `hace ${months}m`;
}

const TYPE_META: Record<EntryType, { badge: string; label: string }> = {
  evolucion: { badge: "EVO", label: "Evolución" },
  antropometria: { badge: "ANT", label: "Antropometría" },
  interconsulta: { badge: "ICO", label: "Interconsulta" },
  hospitalizacion: { badge: "HOS", label: "Hospitalización" },
  archivoadjunto: { badge: "ADJ", label: "Archivo adjunto" },
};

function summaryOf(entry: HistoryGridEntry): string {
  switch (entry.type) {
    case "evolucion":
      return entry.motivo;
    case "antropometria":
      return `Peso ${entry.peso}kg · Talla ${entry.talla}m · IMC ${entry.imc}`;
    case "interconsulta":
      return `${entry.motivo} — ${entry.notas}`;
    case "hospitalizacion":
      return entry.motivo;
    case "archivoadjunto":
      return entry.nombre;
  }
  return "";
}

/* ------------------------------------------------------------------ */
/* Editable field (property grid)                                     */
/* ------------------------------------------------------------------ */

function EditableField(props: {
  label: string;
  value: string;
  dirty: boolean;
  multiline?: boolean;
  onCommit: (value: string) => void;
  fieldRef?: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;
}) {
  const { label, value, dirty, multiline, onCommit, fieldRef } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);

  function start() {
    setDraft(value);
    setEditing(true);
  }

  function commit() {
    onCommit(draft);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-0.5 border-b border-stone-800/70 py-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500">{label}</span>
        {dirty && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" title="Modificado" />}
      </div>
      {editing ? (
        multiline ? (
          <textarea
            ref={(el) => {
              ref.current = el;
              fieldRef?.(el);
            }}
            value={draft}
            rows={3}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              }
            }}
            className="w-full resize-none rounded bg-stone-800 px-2 py-1 text-sm text-stone-100 outline-none ring-1 ring-amber-500/70"
          />
        ) : (
          <input
            ref={(el) => {
              ref.current = el;
              fieldRef?.(el);
            }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              }
            }}
            className="w-full rounded bg-stone-800 px-2 py-1 text-sm text-stone-100 outline-none ring-1 ring-amber-500/70"
          />
        )
      ) : (
        <button
          type="button"
          data-field-value={label}
          onClick={start}
          className={
            multiline
              ? "min-h-[2.5rem] w-full whitespace-pre-wrap rounded px-2 py-1 text-left text-sm leading-snug text-stone-200 hover:bg-stone-800/60"
              : "truncate rounded px-2 py-1 text-left text-sm text-stone-200 hover:bg-stone-800/60"
          }
        >
          {value || "—"}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Patient record types                                                */
/* ------------------------------------------------------------------ */

type FieldKey =
  | "nombre"
  | "documento"
  | "fechaNacimiento"
  | "edad"
  | "telefono"
  | "direccion"
  | "email"
  | "obraSocial"
  | "numeroObraSocial";

const FIELD_DEFS: Array<{ key: FieldKey; label: string }> = [
  { key: "nombre", label: "Nombre y apellido" },
  { key: "documento", label: "DNI" },
  { key: "fechaNacimiento", label: "Fecha de nacimiento" },
  { key: "edad", label: "Edad" },
  { key: "telefono", label: "Teléfono" },
  { key: "direccion", label: "Dirección" },
  { key: "email", label: "Email" },
  { key: "obraSocial", label: "Obra social" },
  { key: "numeroObraSocial", label: "Número" },
];

function initialRecord(): Record<FieldKey, string> {
  const p = FIXTURES.paciente;
  return {
    nombre: p.nombre,
    documento: p.documento,
    fechaNacimiento: fmtDate(p.fechaNacimiento),
    edad: String(p.edad),
    telefono: p.telefono,
    direccion: p.direccion,
    email: p.email,
    obraSocial: p.obraSocial,
    numeroObraSocial: p.numeroObraSocial,
  };
}

/* ------------------------------------------------------------------ */
/* Ghost row (new entry, inline)                                       */
/* ------------------------------------------------------------------ */

type GhostType = "" | EntryType;

function buildEntry(tipo: EntryType, fields: Record<string, string>): HistoryGridEntry {
  const now = new Date();
  const base = { id: `local-${now.getTime()}`, pacienteId: FIXTURES.paciente.id, fecha: now, createdAt: now, updatedAt: now };
  switch (tipo) {
    case "evolucion":
      return { ...base, type: "evolucion", motivo: fields.motivo ?? "", examenFisico: fields.examenFisico ?? "", plan: fields.plan ?? "" };
    case "antropometria":
      return {
        ...base,
        type: "antropometria",
        peso: Number(fields.peso) || 0,
        talla: Number(fields.talla) || 0,
        imc: Number(fields.imc) || 0,
      };
    case "interconsulta":
      return { ...base, type: "interconsulta", motivo: fields.motivo ?? "", notas: fields.notas ?? "" };
    case "hospitalizacion":
      return {
        ...base,
        type: "hospitalizacion",
        fechaIngreso: now,
        fechaEgreso: now,
        motivo: fields.motivo ?? "",
        notas: fields.notas ?? "",
      };
    case "archivoadjunto":
      return { ...base, type: "archivoadjunto", tipo: fields.tipo ?? "application/pdf", nombre: fields.nombre ?? "", notas: fields.notas ?? "", path: "" };
  }
}

const GHOST_FIELDS: Record<EntryType, Array<{ key: string; placeholder: string }>> = {
  evolucion: [
    { key: "motivo", placeholder: "Motivo" },
    { key: "examenFisico", placeholder: "Examen físico" },
    { key: "plan", placeholder: "Plan" },
  ],
  antropometria: [
    { key: "peso", placeholder: "Peso (kg)" },
    { key: "talla", placeholder: "Talla (m)" },
    { key: "imc", placeholder: "IMC" },
  ],
  interconsulta: [
    { key: "motivo", placeholder: "Especialidad" },
    { key: "notas", placeholder: "Notas" },
  ],
  hospitalizacion: [
    { key: "motivo", placeholder: "Motivo" },
    { key: "notas", placeholder: "Notas" },
  ],
  archivoadjunto: [
    { key: "nombre", placeholder: "Nombre de archivo" },
    { key: "notas", placeholder: "Notas" },
  ],
};

function fixtureHistory(): HistoryGridEntry[] {
  return (FIXTURES.historial as unknown as RawHistoryGridEntry[])
    .map((entry) => ({ ...entry, fecha: entry.fecha ?? entry.createdAt }) as HistoryGridEntry)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function GridLayout() {
  const paciente = FIXTURES.paciente;

  // --- property grid state ---
  const [baseline, setBaseline] = useState<Record<FieldKey, string>>(initialRecord);
  const [current, setCurrent] = useState<Record<FieldKey, string>>(initialRecord);
  const [antecedentes, setAntecedentes] = useState(paciente.antecedentes);
  const [antecedentesBaseline, setAntecedentesBaseline] = useState(paciente.antecedentes);
  const [medicacion, setMedicacion] = useState(paciente.medicacionHabitual);
  const [medicacionBaseline, setMedicacionBaseline] = useState(paciente.medicacionHabitual);

  const dirtyCount =
    FIELD_DEFS.filter((f) => current[f.key] !== baseline[f.key]).length +
    (antecedentes !== antecedentesBaseline ? 1 : 0) +
    (medicacion !== medicacionBaseline ? 1 : 0);

  function saveChanges() {
    setBaseline(current);
    setAntecedentesBaseline(antecedentes);
    setMedicacionBaseline(medicacion);
  }

  // --- history grid state ---
  const [historial, setHistorial] = useState<HistoryGridEntry[]>(fixtureHistory);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return historial;
    return historial.filter(
      (e) => TYPE_META[e.type].label.toLowerCase().includes(q) || summaryOf(e).toLowerCase().includes(q),
    );
  }, [historial, query]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // --- ghost row state ---
  const [ghostType, setGhostType] = useState<GhostType>("");
  const [ghostFields, setGhostFields] = useState<Record<string, string>>({});
  const ghostSelectRef = useRef<HTMLSelectElement>(null);

  function resetGhost() {
    setGhostType("");
    setGhostFields({});
  }

  function commitGhost() {
    if (!ghostType) return;
    const entry = buildEntry(ghostType, ghostFields);
    setHistorial((prev) => [entry, ...prev]);
    resetGhost();
  }

  // --- export toolbar state ---
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<null | "pdf" | "print" | "csv">(null);

  function chooseExport(fmt: "pdf" | "print" | "csv") {
    setExportFormat(fmt);
    setExportOpen(false);
  }

  // --- global keyboard shortcuts ---
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");

      if (e.key === "/" && !inField) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        if (exportOpen) {
          setExportOpen(false);
          return;
        }
        if (expanded.size > 0) {
          setExpanded(new Set());
          return;
        }
        if (ghostType) {
          resetGhost();
          return;
        }
        if (inField) target?.blur();
        return;
      }
      if (inField) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        ghostSelectRef.current?.focus();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        const row = filtered[focusedIndex];
        if (row) {
          e.preventDefault();
          toggleExpand(row.id);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [exportOpen, expanded, ghostType, filtered, focusedIndex]);

  return (
    <div
      ref={rootRef}
      className="flex h-[900px] w-[1440px] flex-col overflow-hidden bg-stone-950 text-stone-100"
    >
      {/* Toolbar */}
      <div className="flex h-12 shrink-0 items-center gap-4 border-b border-stone-800 bg-stone-900 px-4">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-stone-100">{paciente.nombre}</span>
          <span className="text-xs text-stone-500">DNI {paciente.documento}</span>
        </div>

        <div className="relative flex-1 max-w-md">
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en el historial…  ( / )"
            className="w-full rounded border border-stone-700 bg-stone-800 px-2.5 py-1 text-xs text-stone-200 outline-none placeholder:text-stone-500 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/70"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            data-save-patient
            disabled={dirtyCount === 0}
            onClick={saveChanges}
            className={
              dirtyCount === 0
                ? "cursor-default rounded border border-stone-800 px-3 py-1 text-xs text-stone-600"
                : "rounded border border-amber-500/70 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
            }
          >
            Guardar cambios{dirtyCount > 0 ? ` (${dirtyCount})` : ""}
          </button>

          <div className="relative">
            <button
              type="button"
              data-export-menu
              onClick={() => setExportOpen((v) => !v)}
              className="rounded border border-stone-700 px-3 py-1 text-xs text-stone-300 hover:bg-stone-800"
            >
              Exportar ▾
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded border border-stone-700 bg-stone-800 shadow-lg">
                <button
                  type="button"
                  data-export-choice="pdf"
                  onClick={() => chooseExport("pdf")}
                  className="block w-full px-3 py-1.5 text-left text-xs text-stone-200 hover:bg-stone-700"
                >
                  Exportar PDF
                </button>
                <button
                  type="button"
                  data-export-choice="print"
                  onClick={() => chooseExport("print")}
                  className="block w-full px-3 py-1.5 text-left text-xs text-stone-200 hover:bg-stone-700"
                >
                  Imprimir resumen
                </button>
                <button
                  type="button"
                  data-export-choice="csv"
                  onClick={() => chooseExport("csv")}
                  className="block w-full px-3 py-1.5 text-left text-xs text-stone-200 hover:bg-stone-700"
                >
                  CSV de la grilla
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export preview strip (slim, non-modal) */}
      {exportFormat && (
        <div className="flex h-8 shrink-0 items-center gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 text-xs text-amber-200">
          <span>
            {exportFormat === "pdf" && "Vista previa: resumen-historia.pdf (9 registros)"}
            {exportFormat === "print" && "Vista previa de impresión lista — diseño A4 con encabezado del paciente"}
            {exportFormat === "csv" && "CSV generado: fecha,tipo,resumen — 9 filas"}
          </span>
          <div className="ml-auto flex gap-3">
            <button type="button" className="font-medium underline underline-offset-2 hover:text-amber-100">
              Descargar
            </button>
            <button type="button" onClick={() => setExportFormat(null)} className="text-amber-300/70 hover:text-amber-100">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Body: property grid | history grid */}
      <div className="flex min-h-0 flex-1">
        {/* Left: patient property grid */}
        <div className="flex w-[340px] shrink-0 flex-col overflow-y-auto border-r border-stone-800 bg-stone-900/40 px-4 py-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500">Ficha del paciente</div>
          <div className="grid grid-cols-2 gap-x-3">
            {FIELD_DEFS.map((f) => (
              <EditableField
                key={f.key}
                label={f.label}
                value={current[f.key]}
                dirty={current[f.key] !== baseline[f.key]}
                onCommit={(v) => setCurrent((prev) => ({ ...prev, [f.key]: v }))}
              />
            ))}
          </div>

          <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500">Clínico</div>
          <EditableField
            label="Antecedentes"
            value={antecedentes}
            dirty={antecedentes !== antecedentesBaseline}
            multiline
            onCommit={setAntecedentes}
          />
          <EditableField
            label="Medicación habitual"
            value={medicacion}
            dirty={medicacion !== medicacionBaseline}
            multiline
            onCommit={setMedicacion}
          />
        </div>

        {/* Right: history data grid */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="grid shrink-0 grid-cols-[100px_70px_1fr_120px_28px] gap-2 border-b border-stone-800 bg-stone-900/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            <span>Fecha</span>
            <span>Tipo</span>
            <span>Resumen</span>
            <span>Registro</span>
            <span />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* Ghost row: new entry, no modal */}
            <div className="grid grid-cols-[100px_70px_1fr_120px_28px] items-center gap-2 border-b border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-1">
              <span className="text-xs tabular-nums text-stone-500">{fmtDate(new Date())}</span>
              <select
                ref={ghostSelectRef}
                value={ghostType}
                onChange={(e) => {
                  setGhostFields({});
                  setGhostType(e.target.value as GhostType);
                }}
                className="rounded border border-stone-700 bg-stone-800 px-1 py-0.5 text-[11px] text-stone-200 outline-none focus:border-amber-500/70"
              >
                <option value="">+ nueva…</option>
                {(Object.keys(TYPE_META) as EntryType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_META[t].label}
                  </option>
                ))}
              </select>
              {ghostType ? (
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {GHOST_FIELDS[ghostType].map((f, i) => (
                    <input
                      key={f.key}
                      value={ghostFields[f.key] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setGhostFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitGhost();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          resetGhost();
                        }
                      }}
                      autoFocus={i === 0}
                      className="w-32 shrink-0 rounded border border-stone-700 bg-stone-800 px-1.5 py-0.5 text-[11px] text-stone-200 outline-none focus:border-amber-500/70"
                    />
                  ))}
                </div>
              ) : (
                <span className="text-xs italic text-stone-600">elegí un tipo para cargar inline</span>
              )}
              <span className="text-[10px] text-stone-600">{ghostType ? "Enter guarda" : ""}</span>
              <button
                type="button"
                disabled={!ghostType}
                onClick={commitGhost}
                title="Agregar"
                className={
                  ghostType
                    ? "h-5 w-5 rounded bg-amber-500 text-center text-xs font-bold leading-5 text-stone-950 hover:bg-amber-400"
                    : "h-5 w-5 rounded bg-stone-800 text-center text-xs leading-5 text-stone-600"
                }
              >
                +
              </button>
            </div>

            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-stone-600">Sin resultados para “{query}”.</div>
            )}

            {filtered.map((entry, index) => {
              const isExpanded = expanded.has(entry.id);
              const isFocused = index === focusedIndex;
              return (
                <div key={entry.id} className={isFocused ? "bg-stone-900/40" : undefined}>
                  <button
                    type="button"
                    data-history-row={entry.id}
                    onClick={() => {
                      setFocusedIndex(index);
                      toggleExpand(entry.id);
                    }}
                    className={
                      "grid w-full grid-cols-[100px_70px_1fr_120px_28px] items-center gap-2 border-b border-stone-800/70 px-3 py-1 text-left hover:bg-stone-800/40" +
                      (isFocused ? " border-l-2 border-l-amber-400" : " border-l-2 border-l-transparent")
                    }
                  >
                    <span className="text-xs tabular-nums text-stone-400">{fmtDate(entry.fecha)}</span>
                    <span className="w-fit rounded bg-stone-800 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-stone-300">
                      {TYPE_META[entry.type].badge}
                    </span>
                    <span className="truncate text-xs text-stone-200">{summaryOf(entry)}</span>
                    <span className="text-[10px] text-stone-600">
                      {fmtRelative(entry.createdAt)}
                      {entry.updatedAt.getTime() !== entry.createdAt.getTime() ? " · editado" : ""}
                    </span>
                    <span className="text-center text-[10px] text-stone-600">{isExpanded ? "▾" : "▸"}</span>
                  </button>

                  {isExpanded && (
                    <div className="border-b border-stone-800/70 bg-stone-900/60 px-6 py-3 text-xs">
                      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                        {TYPE_META[entry.type].label} · {fmtDate(entry.fecha)}
                      </div>
                      <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        {entry.type === "evolucion" && (
                          <>
                            <Field label="Motivo" value={entry.motivo} />
                            <Field label="Examen físico" value={entry.examenFisico} />
                            <Field label="Plan" value={entry.plan} />
                          </>
                        )}
                        {entry.type === "antropometria" && (
                          <>
                            <Field label="Peso" value={`${entry.peso} kg`} />
                            <Field label="Talla" value={`${entry.talla} m`} />
                            <Field label="IMC" value={String(entry.imc)} />
                          </>
                        )}
                        {entry.type === "interconsulta" && (
                          <>
                            <Field label="Especialidad" value={entry.motivo} />
                            <Field label="Notas" value={entry.notas} />
                          </>
                        )}
                        {entry.type === "hospitalizacion" && (
                          <>
                            <Field label="Ingreso" value={fmtDate(entry.fechaIngreso)} />
                            <Field label="Egreso" value={fmtDate(entry.fechaEgreso)} />
                            <Field label="Motivo" value={entry.motivo} />
                            <Field label="Notas" value={entry.notas} />
                          </>
                        )}
                        {entry.type === "archivoadjunto" && (
                          <>
                            <Field label="Nombre" value={entry.nombre} />
                            <Field label="Tipo" value={entry.tipo} />
                            <Field label="Notas" value={entry.notas} />
                          </>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyboard legend footer */}
      <div className="flex h-7 shrink-0 items-center gap-4 border-t border-stone-800 bg-stone-900 px-4 text-[10px] text-stone-500">
        <Key k="/" label="buscar" />
        <Key k="N" label="nueva" />
        <Key k="↑↓" label="navegar" />
        <Key k="Enter" label="expandir" />
        <Key k="Esc" label="cerrar" />
      </div>
    </div>
  );
}

function Field(props: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-stone-500">{props.label}</dt>
      <dd className="text-stone-200">{props.value}</dd>
    </div>
  );
}

function Key(props: { k: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <kbd className="rounded border border-stone-700 bg-stone-800 px-1 py-0.5 font-mono text-[10px] text-stone-300">{props.k}</kbd>
      <span>{props.label}</span>
    </span>
  );
}
