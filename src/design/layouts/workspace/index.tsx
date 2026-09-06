import { useMemo, useState } from "react";
import { FiEdit3, FiPrinter } from "react-icons/fi";
import Summary from "./Summary";
import Records from "./Records";
import Sidebar from "./Sidebar";
import PatientsTable from "./PatientsTable";
import ExportPreview from "./Export";
import { EditModal, type ModalTarget } from "./Modals";
import {
  emptyPatient,
  formatDate,
  initialPacientes,
  initialArchivos,
  initialAntropometria,
  initialEvoluciones,
  initialInterconsultas,
  initialInternaciones,
  initialPatient,
  TAB_META,
  toUnified,
  type ArchivoRow,
  type AntropometriaRow,
  type EvolucionRow,
  type ExportSections,
  type InterconsultaRow,
  type InternacionRow,
  type PatientData,
  type RecordKind,
  type TabId,
} from "./data";

/**
 * Workspace layout.
 *
 * Two panes, not one tab per record type: a summary that is editable in place,
 * and a single chronological table of every record. Editing anywhere goes
 * through one modal, so this shell owns all record state and hands children
 * plain callbacks.
 */

/** Replace a row with the same id, otherwise add it. */
function upsert<T extends { id: string }>(rows: T[], row: T): T[] {
  return rows.some((current) => current.id === row.id)
    ? rows.map((current) => (current.id === row.id ? row : current))
    : [row, ...rows];
}

function Header(props: {
  patient: PatientData;
  onEditPatient: () => void;
  onExport: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="truncate text-xl font-bold tracking-tight text-stone-950">
                {props.patient.nombre}
              </h1>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                {props.patient.edad} años
              </span>
              <span className="text-sm text-stone-500">DNI {props.patient.documento}</span>
              <span className="text-sm text-stone-500">
                {props.patient.obraSocial} · Nº {props.patient.numeroObraSocial}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-stone-500">
              Nacimiento {formatDate(props.patient.fechaNacimiento)} · {props.patient.telefono} ·{" "}
              {props.patient.email}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={props.onEditPatient}
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <FiEdit3 /> Editar datos
          </button>
          <button
            onClick={props.onExport}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <FiPrinter /> Exportar resumen
          </button>
        </div>
      </div>
    </header>
  );
}

function Tabs(props: {
  active: TabId;
  counts: Record<TabId, number>;
  onChange: (tab: TabId) => void;
}) {
  return (
    <nav className="border-b border-stone-200 bg-white px-5">
      <div className="flex gap-1">
        {TAB_META.map((tab) => {
          const selected = props.active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => props.onChange(tab.id)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                selected
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  selected ? "bg-brand-100 text-brand-800" : "bg-stone-100 text-stone-500"
                }`}
              >
                {props.counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function WorkspaceLayout() {
  const [openPatient, setOpenPatient] = useState<string | null>(initialPatient.id);
  const [activeTab, setActiveTab] = useState<TabId>("resumen");
  const [exportMode, setExportMode] = useState(false);
  const [modal, setModal] = useState<ModalTarget | null>(null);

  const [patient, setPatient] = useState<PatientData>(initialPatient);
  const [evoluciones, setEvoluciones] = useState<EvolucionRow[]>(initialEvoluciones);
  const [antropometria, setAntropometria] = useState<AntropometriaRow[]>(initialAntropometria);
  const [interconsultas, setInterconsultas] = useState<InterconsultaRow[]>(initialInterconsultas);
  const [internaciones, setInternaciones] = useState<InternacionRow[]>(initialInternaciones);
  const [archivos, setArchivos] = useState<ArchivoRow[]>(initialArchivos);
  const [pacientes, setPacientes] = useState<PatientData[]>(initialPacientes);

  const [exportSections, setExportSections] = useState<ExportSections>({
    resumen: true,
    evoluciones: true,
    antropometria: true,
    interconsultas: true,
    internaciones: false,
    archivos: true,
  });
  const [exportPeriod, setExportPeriod] = useState("Último año");

  const records = useMemo(
    () => toUnified({ evoluciones, antropometria, interconsultas, internaciones, archivos }),
    [evoluciones, antropometria, interconsultas, internaciones, archivos]
  );

  const counts = useMemo<Record<TabId, number>>(
    () => ({ resumen: interconsultas.filter((row) => row.estado === "pendiente").length, registros: records.length }),
    [interconsultas, records.length]
  );

  /** Resolve a table row back to its typed record so the modal can prefill. */
  function openRecord(kind: RecordKind, id: string) {
    if (kind === "evolucion") {
      const row = evoluciones.find((current) => current.id === id);
      if (row) setModal({ kind, row });
      return;
    }
    if (kind === "antropometria") {
      const row = antropometria.find((current) => current.id === id);
      if (row) setModal({ kind, row });
      return;
    }
    if (kind === "interconsulta") {
      const row = interconsultas.find((current) => current.id === id);
      if (row) setModal({ kind, row });
      return;
    }
    if (kind === "internacion") {
      const row = internaciones.find((current) => current.id === id);
      if (row) setModal({ kind, row });
      return;
    }
    const row = archivos.find((current) => current.id === id);
    if (row) setModal({ kind: "archivo", row });
  }

  /*
   * One modal node, rendered by whichever view is on screen. `onSavePatient`
   * routes on the open target: creating appends to the roster, editing patches
   * the patient in view.
   */
  const modalNode = modal ? (
    <EditModal
      target={modal}
      patient={patient}
      onClose={() => setModal(null)}
      onSavePatient={(patch) => {
        if (modal.kind === "nuevoPaciente") {
          setPacientes((current) => [
            { ...emptyPatient, ...patch, id: crypto.randomUUID() },
            ...current,
          ]);
          return;
        }
        setPatient((current) => ({ ...current, ...patch }));
      }}
      onSaveEvolucion={(row) => setEvoluciones((current) => upsert(current, row))}
      onSaveAntropometria={(row) =>
        setAntropometria((current) =>
          upsert(current, row).sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
        )
      }
      onSaveInterconsulta={(row) => setInterconsultas((current) => upsert(current, row))}
      onSaveInternacion={(row) => setInternaciones((current) => upsert(current, row))}
      onSaveArchivo={(row) => setArchivos((current) => upsert(current, row))}
    />
  ) : null;

  if (openPatient === null) {
    return (
      <>
        <PatientsTable
          pacientes={pacientes}
          onOpenPatient={(id) => setOpenPatient(id)}
          onCreatePatient={() => setModal({ kind: "nuevoPaciente" })}
        />
        {modalNode}
      </>
    );
  }

  if (exportMode) {
    return (
      <ExportPreview
        sections={exportSections}
        period={exportPeriod}
        onToggle={(section) =>
          setExportSections((current) => ({ ...current, [section]: !current[section] }))
        }
        onPeriodChange={setExportPeriod}
        onClose={() => setExportMode(false)}
        evoluciones={evoluciones}
        antropometria={antropometria}
        interconsultas={interconsultas}
        internaciones={internaciones}
        archivos={archivos}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-100 text-stone-900">
      <Sidebar
        onBack={() => setOpenPatient(null)}
        onCreate={(kind) => setModal({ kind } as ModalTarget)}
        onExport={() => setExportMode(true)}
        onDelete={() => undefined}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          patient={patient}
          onEditPatient={() => setModal({ kind: "paciente" })}
          onExport={() => setExportMode(true)}
        />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Tabs active={activeTab} counts={counts} onChange={setActiveTab} />
          {/* Both panes own their own scrolling: Resumen fills the frame and
              scrolls inside its feed cards, Registros inside its table. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
            {activeTab === "resumen" ? (
              <Summary
                patient={patient}
                evoluciones={evoluciones}
                antropometria={antropometria}
                interconsultas={interconsultas}
                onEdit={setModal}
                onOpenRecord={openRecord}
                onToggleInterconsulta={(id) =>
                  setInterconsultas((current) =>
                    current.map((row) =>
                      row.id === id
                        ? { ...row, estado: row.estado === "pendiente" ? "respondida" : "pendiente" }
                        : row
                    )
                  )
                }
              />
            ) : (
              <Records records={records} onOpen={openRecord} />
            )}
          </div>
        </main>
      </div>

      {modalNode}
    </div>
  );
}
