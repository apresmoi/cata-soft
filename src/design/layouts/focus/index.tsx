import React from "react";
import {
  FiChevronsLeft,
  FiChevronsRight,
  FiPrinter,
  FiFileText,
  FiEdit3,
  FiPaperclip,
  FiActivity,
  FiUsers,
  FiCommand,
  FiX,
  FiPlus,
} from "react-icons/fi";
import { FIXTURES, type HistorialEntry, type Paciente } from "../../fixtures";

/* ---------------------------------------------------------------------- */
/* Helpers                                                                */
/* ---------------------------------------------------------------------- */

const fmtDate = (d: Date) =>
  d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

const fmtDateTime = (d: Date) =>
  d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
  " " +
  d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

const TYPE_LABEL: Record<string, string> = {
  evolucion: "Evolucion",
  antropometria: "Antropometria",
  interconsulta: "Interconsulta",
  hospitalizacion: "Hospitalizacion",
  archivoadjunto: "Archivo adjunto",
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  evolucion: <FiEdit3 className="h-3.5 w-3.5" />,
  antropometria: <FiActivity className="h-3.5 w-3.5" />,
  interconsulta: <FiUsers className="h-3.5 w-3.5" />,
  hospitalizacion: <FiFileText className="h-3.5 w-3.5" />,
  archivoadjunto: <FiPaperclip className="h-3.5 w-3.5" />,
};

function entryDate(entry: HistorialEntry): Date {
  if ("fecha" in entry) {
    return entry.fecha;
  }
  return entry.createdAt;
}

function entrySnippet(entry: HistorialEntry): string {
  if ("motivo" in entry && "examenFisico" in entry) {
    return entry.motivo;
  }
  if ("peso" in entry) {
    return `Peso ${entry.peso}kg · Talla ${entry.talla}m · IMC ${entry.imc}`;
  }
  if ("motivo" in entry && "notas" in entry && "fechaIngreso" in entry) {
    return entry.motivo;
  }
  if ("motivo" in entry && "notas" in entry) {
    return `${entry.motivo} — ${entry.notas}`;
  }
  if ("nombre" in entry) {
    return `${entry.nombre} — ${entry.notas}`;
  }
  return "";
}

function entryReference(entry: HistorialEntry): string {
  const label = TYPE_LABEL[entry.type] ?? entry.type;
  return `[Ref. ${label} ${fmtDate(entryDate(entry))}] ${entrySnippet(entry)}`;
}

/* ---------------------------------------------------------------------- */
/* Command palette                                                        */
/* ---------------------------------------------------------------------- */

type PaletteAction = {
  id: string;
  label: string;
  hint: string;
  run: () => void;
};

function CommandPalette(props: {
  open: boolean;
  onClose: () => void;
  actions: PaletteAction[];
}) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (props.open) {
      setQuery("");
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [props.open]);

  if (!props.open) return null;

  const filtered = props.actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-stone-950/50 pt-32"
      onClick={props.onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg border border-stone-700 bg-stone-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-stone-700 px-4 py-3">
          <FiCommand className="h-4 w-4 text-stone-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") props.onClose();
              if (e.key === "Enter" && filtered[0]) {
                filtered[0].run();
                props.onClose();
              }
            }}
            placeholder="Escribi un comando…"
            className="w-full bg-transparent text-sm text-stone-100 placeholder-stone-500 outline-none"
          />
          <kbd className="rounded border border-stone-700 px-1.5 py-0.5 text-[10px] text-stone-500">
            ESC
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-stone-500">Sin resultados</p>
          )}
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                a.run();
                props.onClose();
              }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-stone-200 hover:bg-stone-800"
            >
              <span>{a.label}</span>
              <span className="text-xs text-stone-500">{a.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Quick-add popover                                                      */
/* ---------------------------------------------------------------------- */

type FieldSpec = { key: string; label: string; multiline?: boolean };

function QuickAddPopover(props: {
  title: string;
  fields: FieldSpec[];
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="absolute left-0 top-full z-40 mt-2 w-72 rounded-lg border border-stone-700 bg-stone-900 p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          {props.title}
        </p>
        <button onClick={props.onClose} className="text-stone-500 hover:text-stone-200">
          <FiX className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-2">
        {props.fields.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-[11px] text-stone-500">{f.label}</span>
            {f.multiline ? (
              <textarea
                rows={2}
                className="w-full resize-none rounded border border-stone-700 bg-stone-950 px-2 py-1 text-xs text-stone-100 outline-none focus:border-teal-600"
              />
            ) : (
              <input
                className="w-full rounded border border-stone-700 bg-stone-950 px-2 py-1 text-xs text-stone-100 outline-none focus:border-teal-600"
              />
            )}
          </label>
        ))}
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={props.onClose}
          className="rounded px-2.5 py-1 text-xs text-stone-400 hover:text-stone-200"
        >
          Cancelar
        </button>
        <button
          onClick={props.onSubmit}
          className="rounded bg-teal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-500"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Left rail — patient context, collapsible                               */
/* ---------------------------------------------------------------------- */

function LeftRail(props: {
  collapsed: boolean;
  onToggle: () => void;
  patient: Paciente;
  patients: Paciente[];
  onSelectPatient: (id: string) => void;
  switcherOpen: boolean;
  onCloseSwitcher: () => void;
  lastMeasure: { peso: number; talla: number; imc: number } | null;
}) {
  const p = props.patient;

  if (props.collapsed) {
    return (
      <div className="flex h-full w-14 flex-col items-center border-r border-stone-800 bg-stone-950/60 py-3">
        <button
          onClick={props.onToggle}
          title="Expandir panel de paciente"
          className="mb-4 flex h-8 w-8 items-center justify-center rounded text-stone-500 hover:bg-stone-800 hover:text-stone-200"
        >
          <FiChevronsRight className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-900/60 text-xs font-semibold text-teal-300">
          {p.nombre
            .split(" ")
            .slice(0, 2)
            .map((s) => s[0])
            .join("")}
        </div>
        <div className="mt-3 flex flex-col items-center gap-3 text-stone-600">
          <FiUsers className="h-4 w-4" title={`${p.edad} años`} />
          <FiActivity className="h-4 w-4" title="Antecedentes" />
          <FiFileText className="h-4 w-4" title="Medicacion" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-72 shrink-0 flex-col border-r border-stone-800 bg-stone-950/60">
      <div className="flex items-center justify-between border-b border-stone-800 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Paciente</p>
        <button
          onClick={props.onToggle}
          title="Colapsar panel"
          className="flex h-7 w-7 items-center justify-center rounded text-stone-500 hover:bg-stone-800 hover:text-stone-200"
        >
          <FiChevronsLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-900/60 text-sm font-semibold text-teal-300">
            {p.nombre
              .split(" ")
              .slice(0, 2)
              .map((s) => s[0])
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-100">{p.nombre}</p>
            <p className="text-xs text-stone-500">
              {p.edad} años · DNI {p.documento}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded border border-stone-800 bg-stone-900/60 px-2.5 py-2">
            <p className="text-stone-500">Obra social</p>
            <p className="mt-0.5 font-medium text-stone-200">{p.obraSocial}</p>
          </div>
          <div className="rounded border border-stone-800 bg-stone-900/60 px-2.5 py-2">
            <p className="text-stone-500">Nº afiliado</p>
            <p className="mt-0.5 font-medium text-stone-200">{p.numeroObraSocial}</p>
          </div>
        </div>

        {props.lastMeasure && (
          <div className="mt-4 rounded border border-stone-800 bg-stone-900/60 px-2.5 py-2 text-xs">
            <p className="mb-1 flex items-center gap-1 text-stone-500">
              <FiActivity className="h-3 w-3" /> Ultima antropometria
            </p>
            <p className="text-stone-200">
              {props.lastMeasure.peso}kg · {props.lastMeasure.talla}m · IMC {props.lastMeasure.imc}
            </p>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            Antecedentes
          </p>
          <p className="text-xs leading-relaxed text-stone-300">{p.antecedentes}</p>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            Medicacion habitual
          </p>
          <p className="text-xs leading-relaxed text-stone-300">{p.medicacionHabitual}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded border border-stone-800 bg-stone-900/60 px-2.5 py-2">
            <p className="text-stone-500">Telefono</p>
            <p className="mt-0.5 truncate text-stone-200">{p.telefono}</p>
          </div>
          <div className="rounded border border-stone-800 bg-stone-900/60 px-2.5 py-2">
            <p className="text-stone-500">Direccion</p>
            <p className="mt-0.5 truncate text-stone-200">{p.direccion}</p>
          </div>
        </div>
      </div>

      {props.switcherOpen && (
        <div className="absolute inset-x-3 top-14 z-30 rounded-lg border border-stone-700 bg-stone-900 p-2 shadow-2xl">
          <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            Cambiar de paciente
          </p>
          {props.patients.map((cand) => (
            <button
              key={cand.id}
              onClick={() => props.onSelectPatient(cand.id)}
              className={
                "block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-stone-800 " +
                (cand.id === p.id ? "text-teal-300" : "text-stone-300")
              }
            >
              {cand.nombre}
            </button>
          ))}
          <button
            onClick={props.onCloseSwitcher}
            className="mt-1 block w-full rounded px-2 py-1.5 text-left text-xs text-stone-500 hover:bg-stone-800"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Right rail — history reference list                                    */
/* ---------------------------------------------------------------------- */

function RightRail(props: {
  entries: HistorialEntry[];
  onInsert: (text: string) => void;
  onPreview: (entry: HistorialEntry) => void;
}) {
  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l border-stone-800 bg-stone-950/60">
      <div className="border-b border-stone-800 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Historial reciente
        </p>
        <p className="mt-0.5 text-[11px] text-stone-600">
          Consulta rapida mientras escribis la nota
        </p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {props.entries.map((entry) => (
          <div
            key={entry.id}
            className="group relative rounded-lg border border-stone-800 bg-stone-900/60 px-3 py-2.5 hover:border-stone-700"
          >
            <button
              onClick={() => props.onPreview(entry)}
              className="block w-full text-left"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-teal-400">
                  {TYPE_ICON[entry.type]}
                  {TYPE_LABEL[entry.type] ?? entry.type}
                </span>
                <span className="text-[10px] text-stone-500">{fmtDate(entryDate(entry))}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-stone-300">
                {entrySnippet(entry)}
              </p>
            </button>
            <button
              onClick={() => props.onInsert(entryReference(entry))}
              className="absolute right-2 top-2 hidden rounded bg-teal-700 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-teal-600 group-hover:block"
              title="Insertar referencia en la nota"
            >
              + insertar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Note preview drawer (right-rail entry click)                           */
/* ---------------------------------------------------------------------- */

function PreviewDrawer(props: { entry: HistorialEntry; onClose: () => void }) {
  const entry = props.entry;
  return (
    <div className="absolute inset-y-0 right-0 z-30 w-80 border-l border-stone-700 bg-stone-900 p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-400">
          {TYPE_ICON[entry.type]}
          {TYPE_LABEL[entry.type] ?? entry.type}
        </span>
        <button onClick={props.onClose} className="text-stone-500 hover:text-stone-200">
          <FiX className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-3 text-[11px] text-stone-500">{fmtDate(entryDate(entry))}</p>
      <div className="space-y-3 text-xs leading-relaxed text-stone-300">
        {"motivo" in entry && <p><span className="text-stone-500">Motivo: </span>{entry.motivo}</p>}
        {"examenFisico" in entry && (
          <p><span className="text-stone-500">Examen fisico: </span>{entry.examenFisico}</p>
        )}
        {"plan" in entry && <p><span className="text-stone-500">Plan: </span>{entry.plan}</p>}
        {"peso" in entry && (
          <p>
            <span className="text-stone-500">Medidas: </span>
            {entry.peso}kg · {entry.talla}m · IMC {entry.imc}
          </p>
        )}
        {"notas" in entry && <p><span className="text-stone-500">Notas: </span>{entry.notas}</p>}
        {"nombre" in entry && <p><span className="text-stone-500">Archivo: </span>{entry.nombre}</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Document / print preview                                               */
/* ---------------------------------------------------------------------- */

function DocumentView(props: { patient: Paciente; entries: HistorialEntry[] }) {
  const p = props.patient;
  return (
    <div className="flex h-full flex-col items-center overflow-y-auto bg-stone-800/40 py-8">
      <div
        className="w-[210mm] max-w-full bg-white px-14 py-12 text-stone-900 shadow-2xl"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        <div className="mb-6 flex items-start justify-between border-b border-stone-300 pb-4">
          <div>
            <h1 className="text-lg font-bold tracking-wide">Resumen de historia clinica</h1>
            <p className="mt-1 text-sm text-stone-600">{p.nombre}</p>
            <p className="text-xs text-stone-500">
              DNI {p.documento} · {p.edad} años · {p.obraSocial} ({p.numeroObraSocial})
            </p>
          </div>
          <p className="text-right text-[11px] text-stone-500">
            Impreso el
            <br />
            {fmtDateTime(new Date())}
          </p>
        </div>

        <section className="mb-5">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Antecedentes
          </h2>
          <p className="text-sm leading-relaxed">{p.antecedentes}</p>
        </section>
        <section className="mb-6">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Medicacion habitual
          </h2>
          <p className="text-sm leading-relaxed">{p.medicacionHabitual}</p>
        </section>

        <h2 className="mb-2 border-b border-stone-300 pb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Registros
        </h2>
        <div className="space-y-4">
          {props.entries.map((entry) => (
            <div key={entry.id} className="break-inside-avoid">
              <p className="text-sm font-semibold">
                {TYPE_LABEL[entry.type] ?? entry.type}
                <span className="ml-2 font-normal text-stone-500">{fmtDate(entryDate(entry))}</span>
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-stone-800">{entrySnippet(entry)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Main composer                                                          */
/* ---------------------------------------------------------------------- */

type NoteState = { motivo: string; examenFisico: string; plan: string };
type FieldKey = keyof NoteState;

const SECTIONS: { key: FieldKey; label: string; placeholder: string }[] = [
  { key: "motivo", label: "Motivo de consulta", placeholder: "¿Por que consulta hoy?" },
  { key: "examenFisico", label: "Examen fisico", placeholder: "Hallazgos al examen…" },
  { key: "plan", label: "Plan", placeholder: "Conducta, indicaciones, proximo control…" },
];

export default function FocusLayout() {
  const patients = FIXTURES.pacientes;
  const [patientId, setPatientId] = React.useState(FIXTURES.paciente.id);
  const patient = patients.find((p) => p.id === patientId) ?? patients[0];

  const [collapsed, setCollapsed] = React.useState(false);
  const [switcherOpen, setSwitcherOpen] = React.useState(false);
  const [view, setView] = React.useState<"compositor" | "documento">("compositor");
  const [previewEntry, setPreviewEntry] = React.useState<HistorialEntry | null>(null);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [openPopover, setOpenPopover] = React.useState<
    "antropometria" | "interconsulta" | "archivo" | null
  >(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const [note, setNote] = React.useState<NoteState>({
    motivo: FIXTURES.evolucion.motivo,
    examenFisico: FIXTURES.evolucion.examenFisico,
    plan: FIXTURES.evolucion.plan,
  });
  const [lastFocused, setLastFocused] = React.useState<FieldKey>("plan");
  const [saveState, setSaveState] = React.useState<"saved" | "saving">("saved");
  const [lastSaved, setLastSaved] = React.useState(new Date());
  const refs = {
    motivo: React.useRef<HTMLTextAreaElement>(null),
    examenFisico: React.useRef<HTMLTextAreaElement>(null),
    plan: React.useRef<HTMLTextAreaElement>(null),
  };

  const skipAutosave = React.useRef(true);
  React.useEffect(() => {
    if (skipAutosave.current) {
      skipAutosave.current = false;
      return;
    }
    setSaveState("saving");
    const t = window.setTimeout(() => {
      setSaveState("saved");
      setLastSaved(new Date());
    }, 800);
    return () => window.clearTimeout(t);
  }, [note]);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const updateField = (key: FieldKey, value: string) => {
    setNote((n) => ({ ...n, [key]: value }));
  };

  const insertReference = (text: string) => {
    const key = lastFocused;
    setNote((n) => ({ ...n, [key]: n[key] ? `${n[key]}\n${text}` : text }));
    refs[key].current?.focus();
  };

  const newEvolucion = () => {
    setNote({ motivo: "", examenFisico: "", plan: "" });
    setView("compositor");
    window.setTimeout(() => refs.motivo.current?.focus(), 10);
  };

  const printResumen = () => {
    setView("documento");
    window.setTimeout(() => window.print(), 150);
  };

  const actions: PaletteAction[] = [
    { id: "new-evo", label: "Nueva evolucion", hint: "compositor", run: newEvolucion },
    {
      id: "new-antro",
      label: "Nueva antropometria",
      hint: "popover",
      run: () => setOpenPopover("antropometria"),
    },
    {
      id: "new-inter",
      label: "Nueva interconsulta",
      hint: "popover",
      run: () => setOpenPopover("interconsulta"),
    },
    { id: "print", label: "Imprimir resumen", hint: "documento", run: printResumen },
    {
      id: "search",
      label: "Buscar paciente",
      hint: "cambiar",
      run: () => {
        setCollapsed(false);
        setSwitcherOpen(true);
      },
    },
  ];

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const historial = FIXTURES.historial;
  const lastAntro = historial.find((e) => "peso" in e);
  const lastMeasure = lastAntro && "peso" in lastAntro
    ? { peso: lastAntro.peso, talla: lastAntro.talla, imc: lastAntro.imc }
    : null;

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-stone-900 text-stone-200">
      <LeftRail
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        patient={patient}
        patients={patients}
        onSelectPatient={(id) => {
          setPatientId(id);
          setSwitcherOpen(false);
        }}
        switcherOpen={switcherOpen}
        onCloseSwitcher={() => setSwitcherOpen(false)}
        lastMeasure={lastMeasure}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-stone-100">Evolucion</span>
            <span className="text-xs text-stone-500">{patient.nombre}</span>
            <span className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span
                className={
                  "h-1.5 w-1.5 rounded-full " +
                  (saveState === "saving" ? "animate-pulse bg-amber-400" : "bg-emerald-500")
                }
              />
              {saveState === "saving" ? "Guardando…" : `Guardado ${fmtDateTime(lastSaved)}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() =>
                  setOpenPopover((v) => (v === "antropometria" ? null : "antropometria"))
                }
                className="flex items-center gap-1.5 rounded border border-stone-700 px-2.5 py-1.5 text-xs text-stone-300 hover:bg-stone-800"
              >
                <FiActivity className="h-3.5 w-3.5" /> Antropometria
              </button>
              {openPopover === "antropometria" && (
                <QuickAddPopover
                  title="Nueva antropometria"
                  fields={[
                    { key: "peso", label: "Peso (kg)" },
                    { key: "talla", label: "Talla (m)" },
                    { key: "imc", label: "IMC" },
                  ]}
                  onClose={() => setOpenPopover(null)}
                  onSubmit={() => {
                    setOpenPopover(null);
                    setToast("Antropometria guardada");
                  }}
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() =>
                  setOpenPopover((v) => (v === "interconsulta" ? null : "interconsulta"))
                }
                className="flex items-center gap-1.5 rounded border border-stone-700 px-2.5 py-1.5 text-xs text-stone-300 hover:bg-stone-800"
              >
                <FiUsers className="h-3.5 w-3.5" /> Interconsulta
              </button>
              {openPopover === "interconsulta" && (
                <QuickAddPopover
                  title="Nueva interconsulta"
                  fields={[
                    { key: "especialidad", label: "Especialidad" },
                    { key: "notas", label: "Notas", multiline: true },
                  ]}
                  onClose={() => setOpenPopover(null)}
                  onSubmit={() => {
                    setOpenPopover(null);
                    setToast("Interconsulta guardada");
                  }}
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setOpenPopover((v) => (v === "archivo" ? null : "archivo"))}
                className="flex items-center gap-1.5 rounded border border-stone-700 px-2.5 py-1.5 text-xs text-stone-300 hover:bg-stone-800"
              >
                <FiPaperclip className="h-3.5 w-3.5" /> Archivo
              </button>
              {openPopover === "archivo" && (
                <QuickAddPopover
                  title="Adjuntar archivo"
                  fields={[
                    { key: "nombre", label: "Nombre" },
                    { key: "tipo", label: "Tipo" },
                    { key: "notas", label: "Notas" },
                  ]}
                  onClose={() => setOpenPopover(null)}
                  onSubmit={() => {
                    setOpenPopover(null);
                    setToast("Archivo adjuntado");
                  }}
                />
              )}
            </div>

            <div className="mx-1 h-5 w-px bg-stone-800" />

            <button
              onClick={() => setView((v) => (v === "compositor" ? "documento" : "compositor"))}
              className="flex items-center gap-1.5 rounded border border-stone-700 px-2.5 py-1.5 text-xs text-stone-300 hover:bg-stone-800"
            >
              <FiFileText className="h-3.5 w-3.5" />
              {view === "compositor" ? "Ver documento" : "Ver compositor"}
            </button>
            <button
              onClick={printResumen}
              className="flex items-center gap-1.5 rounded bg-teal-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-teal-500"
            >
              <FiPrinter className="h-3.5 w-3.5" /> Imprimir
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-1.5 rounded border border-stone-700 px-2.5 py-1.5 text-xs text-stone-400 hover:bg-stone-800"
              title="Paleta de comandos"
            >
              <FiCommand className="h-3.5 w-3.5" />
              <kbd className="text-[10px]">⌘K</kbd>
            </button>
          </div>
        </div>

        {/* body */}
        <div className="relative min-h-0 flex-1">
          {view === "documento" ? (
            <DocumentView patient={patient} entries={historial} />
          ) : (
            <div className="h-full overflow-y-auto px-10 py-8">
              <div className="mx-auto max-w-[74ch]">
                <button
                  onClick={newEvolucion}
                  className="mb-6 flex items-center gap-1.5 text-xs text-stone-500 hover:text-teal-400"
                >
                  <FiPlus className="h-3.5 w-3.5" /> Nueva evolucion en blanco
                </button>

                {SECTIONS.map((s) => (
                  <div key={s.key} className="mb-8">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                      {s.label}
                    </label>
                    <textarea
                      ref={refs[s.key]}
                      value={note[s.key]}
                      onFocus={() => setLastFocused(s.key)}
                      onChange={(e) => updateField(s.key, e.target.value)}
                      placeholder={s.placeholder}
                      rows={s.key === "examenFisico" ? 5 : 4}
                      className="w-full resize-none rounded-md border border-stone-800 bg-stone-950/60 px-4 py-3 text-[15px] leading-8 text-stone-100 outline-none placeholder-stone-600 focus:border-teal-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {previewEntry && (
            <PreviewDrawer entry={previewEntry} onClose={() => setPreviewEntry(null)} />
          )}
        </div>
      </div>

      <RightRail
        entries={historial}
        onInsert={insertReference}
        onPreview={(entry) => setPreviewEntry(entry)}
      />

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={actions} />

      {toast && (
        <div className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-stone-800 px-4 py-2 text-xs text-stone-100 shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
