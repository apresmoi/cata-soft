import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  FiActivity,
  FiChevronDown,
  FiChevronUp,
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
import type { HistorialEntry, Paciente } from "../../fixtures";

type EntryType = HistorialEntry["type"];

const TYPE_LABELS: Record<EntryType, string> = {
  evolucion: "Evolución",
  antropometria: "Antropometría",
  interconsulta: "Interconsulta",
  hospitalizacion: "Hospitalización",
  archivoadjunto: "Archivo adjunto",
};

const TYPE_ICONS: Record<EntryType, ComponentType<{ className?: string }>> = {
  evolucion: FiActivity,
  antropometria: FiUsers,
  interconsulta: FiFileText,
  hospitalizacion: FiHome,
  archivoadjunto: FiPaperclip,
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Field definitions used to both render the reading pane and build the sheet form. */
type FieldDef = { key: string; label: string; multiline?: boolean };

const FIELD_DEFS: Record<EntryType, FieldDef[]> = {
  evolucion: [
    { key: "motivo", label: "Motivo de consulta" },
    { key: "examenFisico", label: "Examen físico", multiline: true },
    { key: "plan", label: "Plan", multiline: true },
  ],
  antropometria: [
    { key: "peso", label: "Peso (kg)" },
    { key: "talla", label: "Talla (m)" },
    { key: "imc", label: "IMC" },
  ],
  interconsulta: [
    { key: "motivo", label: "Especialidad / motivo" },
    { key: "notas", label: "Notas", multiline: true },
  ],
  hospitalizacion: [
    { key: "fechaIngreso", label: "Fecha de ingreso" },
    { key: "fechaEgreso", label: "Fecha de egreso" },
    { key: "motivo", label: "Motivo", multiline: true },
    { key: "notas", label: "Notas", multiline: true },
  ],
  archivoadjunto: [
    { key: "nombre", label: "Nombre de archivo" },
    { key: "tipo", label: "Tipo" },
    { key: "notas", label: "Notas", multiline: true },
  ],
};

/** Pull a display string for a field out of a history entry, whatever its type. */
function fieldValue(entry: HistorialEntry, key: string): string {
  const record = entry as unknown as Record<string, unknown>;
  const v = record[key];
  if (v instanceof Date) return formatDate(v);
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v;
  return "";
}

function entryDate(entry: HistorialEntry): Date {
  const record = entry as unknown as Record<string, unknown>;
  const fecha = record.fecha;
  return fecha instanceof Date ? fecha : entry.createdAt;
}

const pacientes: Paciente[] = FIXTURES.pacientes;
const historial: HistorialEntry[] = FIXTURES.historial;
type SheetMode = { kind: "create"; type: EntryType } | { kind: "edit"; entry: HistorialEntry } | null;

export default function SplitLayout() {
  const [query, setQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const entries = useMemo(
    () => [...historial].sort((a, b) => entryDate(b).getTime() - entryDate(a).getTime()),
    [],
  );
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(entries[0]?.id ?? null);
  const [viewMode, setViewMode] = useState<"entry" | "resumen">("entry");
  const [datosOpen, setDatosOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetMode>(null);
  const [sheetValues, setSheetValues] = useState<Record<string, string>>({});
  const [sheetDirty, setSheetDirty] = useState(false);

  const filtered = pacientes.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.nombre.toLowerCase().includes(q) || p.documento.toLowerCase().includes(q);
  });

  const selectedPatient = pacientes.find((p) => p.id === selectedPatientId) ?? null;
  const selectedEntry = entries.find((e) => e.id === selectedEntryId) ?? null;
  const lastVisit = entries[0] ? entryDate(entries[0]) : null;

  function selectPatient(id: string) {
    setSelectedPatientId(id);
    setViewMode("entry");
    setDatosOpen(false);
  }

  function openCreateSheet(type: EntryType) {
    const blank: Record<string, string> = {};
    for (const f of FIELD_DEFS[type]) blank[f.key] = "";
    setSheetValues(blank);
    setSheetDirty(false);
    setSheet({ kind: "create", type });
  }

  function openEditSheet(entry: HistorialEntry) {
    const initial: Record<string, string> = {};
    for (const f of FIELD_DEFS[entry.type]) initial[f.key] = fieldValue(entry, f.key);
    setSheetValues(initial);
    setSheetDirty(false);
    setSheet({ kind: "edit", entry });
  }

  function closeSheet() {
    setSheet(null);
    setSheetDirty(false);
  }

  function updateField(key: string, value: string) {
    setSheetValues((prev) => ({ ...prev, [key]: value }));
    setSheetDirty(true);
  }

  const sheetType: EntryType | null = sheet ? (sheet.kind === "create" ? sheet.type : sheet.entry.type) : null;

  return (
    <div className="flex h-[900px] w-[1440px] overflow-hidden bg-stone-100 text-stone-900">
      {/* LEFT: permanent patient list */}
      <aside className="flex w-[300px] shrink-0 flex-col border-r border-stone-300 bg-white">
        <div className="border-b border-stone-200 px-4 py-4">
          <h1 className="text-sm font-semibold tracking-wide text-stone-800">CataSoft</h1>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-stone-300 bg-stone-50 px-2.5 py-1.5">
            <FiSearch className="h-3.5 w-3.5 shrink-0 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar paciente…"
              className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((p) => {
            const active = p.id === selectedPatientId;
            return (
              <button
                key={p.id}
                onClick={() => selectPatient(p.id)}
                className={`block w-full border-b border-stone-100 px-4 py-3 text-left transition-colors ${
                  active ? "bg-teal-600 text-white" : "hover:bg-stone-50"
                }`}
              >
                <div className={`truncate text-sm font-medium ${active ? "text-white" : "text-stone-800"}`}>
                  {p.nombre}
                </div>
                <div
                  className={`mt-1 flex items-center gap-2 text-xs ${
                    active ? "text-teal-100" : "text-stone-500"
                  }`}
                >
                  <span>{p.edad} años</span>
                  <span>·</span>
                  <span>DNI {p.documento}</span>
                </div>
                <div className={`mt-0.5 text-[11px] ${active ? "text-teal-200" : "text-stone-400"}`}>
                  Última visita: {formatDate(lastVisit ?? p.updatedAt)}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-stone-400">Sin resultados.</p>
          )}
        </div>
      </aside>

      {/* RIGHT: detail pane */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {!selectedPatient ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-stone-50 text-center">
            <FiUsers className="h-10 w-10 text-stone-300" />
            <p className="text-sm font-medium text-stone-500">Ningún paciente seleccionado</p>
            <p className="max-w-xs text-xs text-stone-400">
              Elegí un paciente de la lista de la izquierda para ver su ficha, historial clínico y generar
              nuevas entradas. Hay {pacientes.length} pacientes cargados.
            </p>
          </div>
        ) : (
          <>
            {/* Identity strip */}
            <div className="border-b border-stone-200 bg-white px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">{selectedPatient.nombre}</h2>
                  <div className="mt-1 flex items-center gap-3 text-xs text-stone-500">
                    <span>DNI {selectedPatient.documento}</span>
                    <span>·</span>
                    <span>{selectedPatient.edad} años</span>
                    <span>·</span>
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 font-medium text-teal-700">
                      {selectedPatient.obraSocial}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("resumen")}
                    className="flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                  >
                    <FiPrinter className="h-3.5 w-3.5" />
                    Resumen
                  </button>
                </div>
              </div>

              {/* Collapsible demographics */}
              <button
                onClick={() => setDatosOpen((v) => !v)}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-700"
              >
                {datosOpen ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
                Datos del paciente
              </button>
              {datosOpen && (
                <div className="mt-3 grid grid-cols-3 gap-x-6 gap-y-2 rounded-md border border-stone-200 bg-stone-50 p-3 text-xs">
                  <Field label="Fecha de nacimiento" value={formatDate(selectedPatient.fechaNacimiento)} />
                  <Field label="Teléfono" value={selectedPatient.telefono} />
                  <Field label="Email" value={selectedPatient.email} />
                  <Field label="Dirección" value={selectedPatient.direccion} />
                  <Field label="Obra social" value={selectedPatient.obraSocial} />
                  <Field label="Número de afiliado" value={selectedPatient.numeroObraSocial} />
                  <div className="col-span-3 mt-1 grid grid-cols-2 gap-4 border-t border-stone-200 pt-2">
                    <div>
                      <p className="font-medium text-stone-400">Antecedentes</p>
                      <p className="mt-0.5 text-stone-700">{selectedPatient.antecedentes}</p>
                    </div>
                    <div>
                      <p className="font-medium text-stone-400">Medicación habitual</p>
                      <p className="mt-0.5 text-stone-700">{selectedPatient.medicacionHabitual}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* History: index + reading pane */}
            <div className="flex min-h-0 flex-1">
              <div className="flex w-[220px] shrink-0 flex-col border-r border-stone-200 bg-white">
                <div className="flex items-center justify-between border-b border-stone-100 px-3 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Historial
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {entries.map((e) => {
                    const Icon = TYPE_ICONS[e.type];
                    const active = viewMode === "entry" && e.id === selectedEntryId;
                    return (
                      <button
                        key={e.id}
                        onClick={() => {
                          setSelectedEntryId(e.id);
                          setViewMode("entry");
                        }}
                        className={`flex w-full items-start gap-2 border-b border-stone-100 px-3 py-2.5 text-left ${
                          active ? "bg-teal-50" : "hover:bg-stone-50"
                        }`}
                      >
                        <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${active ? "text-teal-700" : "text-stone-400"}`} />
                        <div className="min-w-0">
                          <p className={`text-xs font-medium ${active ? "text-teal-800" : "text-stone-700"}`}>
                            {TYPE_LABELS[e.type]}
                          </p>
                          <p className="text-[11px] text-stone-400">{formatDate(entryDate(e))}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-5 gap-1 border-t border-stone-200 p-2">
                  {(Object.keys(TYPE_LABELS) as EntryType[]).map((t) => {
                    const Icon = TYPE_ICONS[t];
                    return (
                      <button
                        key={t}
                        title={`Nueva ${TYPE_LABELS[t].toLowerCase()}`}
                        onClick={() => openCreateSheet(t)}
                        className="flex items-center justify-center rounded-md border border-stone-200 bg-white py-1.5 text-stone-500 hover:border-teal-400 hover:text-teal-700"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reading pane */}
              <div className="flex-1 overflow-y-auto bg-stone-50 px-8 py-6">
                {viewMode === "resumen" ? (
                  <div className="mx-auto max-w-2xl rounded-md border border-stone-200 bg-white p-8 shadow-sm">
                    <div className="flex items-start justify-between border-b border-stone-200 pb-4">
                      <div>
                        <h3 className="text-base font-semibold text-stone-900">Resumen de historia clínica</h3>
                        <p className="text-xs text-stone-500">{selectedPatient.nombre} · DNI {selectedPatient.documento}</p>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 rounded-md border border-stone-300 px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-50"
                      >
                        <FiPrinter className="h-3.5 w-3.5" />
                        Imprimir
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-stone-400">Antecedentes</p>
                        <p className="mt-0.5 text-stone-700">{selectedPatient.antecedentes}</p>
                      </div>
                      <div>
                        <p className="font-medium text-stone-400">Medicación habitual</p>
                        <p className="mt-0.5 text-stone-700">{selectedPatient.medicacionHabitual}</p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                        Cronología ({entries.length} entradas)
                      </p>
                      {entries.map((e) => (
                        <div key={e.id} className="border-t border-stone-100 pt-3 first:border-t-0 first:pt-0">
                          <div className="flex items-center gap-2 text-xs font-medium text-stone-700">
                            <span>{TYPE_LABELS[e.type]}</span>
                            <span className="text-stone-400">· {formatDate(entryDate(e))}</span>
                          </div>
                          <div className="mt-1 space-y-1 text-xs text-stone-600">
                            {FIELD_DEFS[e.type].map((f) => (
                              <p key={f.key}>
                                <span className="text-stone-400">{f.label}: </span>
                                {fieldValue(e, f.key)}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedEntry ? (
                  <div className="mx-auto max-w-2xl rounded-md border border-stone-200 bg-white p-8 shadow-sm">
                    <div className="flex items-start justify-between border-b border-stone-200 pb-4">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = TYPE_ICONS[selectedEntry.type];
                          return <Icon className="h-4 w-4 text-teal-700" />;
                        })()}
                        <div>
                          <h3 className="text-sm font-semibold text-stone-900">{TYPE_LABELS[selectedEntry.type]}</h3>
                          <p className="text-xs text-stone-500">{formatDate(entryDate(selectedEntry))}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => openEditSheet(selectedEntry)}
                        className="rounded-md border border-stone-300 px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-50"
                      >
                        Editar
                      </button>
                    </div>
                    <div className="mt-4 space-y-4">
                      {FIELD_DEFS[selectedEntry.type].map((f) => (
                        <div key={f.key}>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                            {f.label}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                            {fieldValue(selectedEntry, f.key) || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-stone-400">Sin entradas de historial.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Bottom sheet for create/edit — no internal tabs, everything visible */}
        {sheet && sheetType && (
          <div className="absolute inset-0 z-10 flex flex-col justify-end">
            <button
              aria-label="Cerrar"
              onClick={closeSheet}
              className="absolute inset-0 bg-stone-900/30"
            />
            <div className="relative z-10 flex h-[50%] flex-col rounded-t-xl border-t border-stone-300 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-stone-900">
                    {sheet.kind === "create" ? `Nueva ${TYPE_LABELS[sheetType].toLowerCase()}` : `Editar ${TYPE_LABELS[sheetType].toLowerCase()}`}
                  </h3>
                  {sheetDirty && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                      sin guardar
                    </span>
                  )}
                </div>
                <button onClick={closeSheet} className="text-stone-400 hover:text-stone-600">
                  <FiX className="h-4 w-4" />
                </button>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto px-6 py-4">
                {FIELD_DEFS[sheetType].map((f) => (
                  <label
                    key={f.key}
                    className={`flex flex-col gap-1 text-xs ${f.multiline ? "col-span-2" : ""}`}
                  >
                    <span className="font-medium text-stone-500">{f.label}</span>
                    {f.multiline ? (
                      <textarea
                        value={sheetValues[f.key] ?? ""}
                        onChange={(e) => updateField(f.key, e.target.value)}
                        rows={4}
                        className="resize-none rounded-md border border-stone-300 px-2.5 py-1.5 text-sm text-stone-800 outline-none focus:border-teal-500"
                      />
                    ) : (
                      <input
                        value={sheetValues[f.key] ?? ""}
                        onChange={(e) => updateField(f.key, e.target.value)}
                        className="rounded-md border border-stone-300 px-2.5 py-1.5 text-sm text-stone-800 outline-none focus:border-teal-500"
                      />
                    )}
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-stone-200 px-6 py-3">
                <button
                  onClick={closeSheet}
                  className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={closeSheet}
                  className="flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                >
                  <FiPlus className="h-3.5 w-3.5" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field(props: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{props.label}</p>
      <p className="mt-0.5 text-stone-700">{props.value}</p>
    </div>
  );
}
