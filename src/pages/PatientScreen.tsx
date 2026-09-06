import { ArrowLeftIcon, Pencil1Icon } from "@radix-ui/react-icons";
import {
  FiActivity,
  FiFileText,
  FiThermometer,
  FiUsers,
} from "react-icons/fi";
import { Toolbar } from "../components/Toolbar";
import { ToolbarButton } from "../components/ToolbarButton";
import {
  AppContainer,
  PatientHistoryTable,
  SideToolbar,
  SideToolbarButton,
} from "../components";
import { useParams } from "react-router-dom";
import {
  PacienteHistoryItem,
  usePaciente,
  usePacienteHistorial,
} from "../hooks";
import {
  EditAntropometriaDialog,
  EditEvolucionDialog,
  EditHospitalizacionDialog,
  EditInterconsultaDialog,
  EditPacienteDialog,
  NewAntropometriaDialog,
  NewEvolucionDialog,
  NewHospitalizacionDialogDialog,
  NewInterconsultaDialog,
  NewArchivoAdjuntoDialog,
  HistoriaMedicaDialog,
} from "../Dialogs";
import React from "react";
import { DeleteDialog } from "../Dialogs/DeleteDialog";
import { ThrashCanIcon } from "../components/Icons/ThrashCanIcon";
import { SlPrinter } from "react-icons/sl";
import { ImAttachment } from "react-icons/im";
import { PatientSummary } from "./PatientSummary";

const searchKeys = [
  "type",
  "motivo",
  "examenFisico",
  "plan",
  "notas",
] as (keyof PacienteHistoryItem)[];

/** Kinds the history filter offers, in the order the clinic logs them. */
const HISTORY_KINDS = [
  "evolucion",
  "antropometria",
  "interconsulta",
  "hospitalizacion",
  "archivoadjunto",
];

type PaneId = "resumen" | "registros";

const PANES: Array<{ id: PaneId; label: string }> = [
  { id: "resumen", label: "RESUMEN" },
  { id: "registros", label: "REGISTROS" },
];

/** Whole years between a birth date and today. `Pacientes` has no `edad` column. */
function calculateAge(birth?: Date | null): number | null {
  if (!birth) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age < 0 ? 0 : age;
}

export function PatientScreen() {
  const params = useParams();
  const patientId = params.id as string;
  const [activePane, setActivePane] = React.useState<PaneId>("resumen");
  const [search, setSearch] = React.useState("");
  const [selectedKinds, setSelectedKinds] = React.useState<string[]>([]);

  const { data, remove } = usePaciente(patientId);
  const { data: history } = usePacienteHistorial(patientId);

  const [historyId, setHistoryId] = React.useState<string | null>(null);

  const historyItem = history?.find((row) => row.id === historyId);

  const handleDelete = () => {
    remove();
    window.history.back();
  };

  const handleHistoryClick = (id: string) => {
    setHistoryId(id);
  };

  const handleHistoryClose = () => {
    setHistoryId(null);
  };

  /*
   * Demographics now live in a modal, so leaving this screen can no longer
   * strand unsaved edits: the dialog owns its own save. That is what retired
   * the GUARDAR button and the close-without-saving prompt.
   */
  const handleGoBack = () => {
    window.history.back();
  };

  const filteredHistory = history?.filter((row) =>
    searchKeys.some(
      (key) =>
        row &&
        key in row &&
        row[key]?.toString().toUpperCase().includes(search.toUpperCase())
    )
  );

  const toggleKind = (kind: string) => {
    setSelectedKinds((current) =>
      current.includes(kind)
        ? current.filter((value) => value !== kind)
        : [...current, kind]
    );
  };

  const edad = calculateAge(data?.fechaNacimiento);

  return (
    <AppContainer>
      <div className="flex min-h-0 flex-1">
        {/*
         * Full-height rail: every record type is one click from anywhere in
         * the screen. Each button keeps its dialog trigger as its child, which
         * is what actually opens the form.
         *
         * The labels are `SideToolbarButton`'s own hover-only tooltip, not the
         * Radix `Tooltip`: Radix opens on focus for accessibility, so closing a
         * dialog returned focus to the rail trigger and popped its tooltip.
         */}
        <SideToolbar>
          <SideToolbarButton
            variant="secondary"
            label="Volver al listado"
            onClick={handleGoBack}
          >
            <ArrowLeftIcon />
          </SideToolbarButton>

          <div className="my-1 h-px w-8 bg-stone-200" />

          <NewEvolucionDialog patientId={patientId}>
            <SideToolbarButton variant="primary" label="Nueva evolución">
              <FiFileText />
            </SideToolbarButton>
          </NewEvolucionDialog>
          <NewAntropometriaDialog patientId={patientId}>
            <SideToolbarButton variant="primary" label="Nueva antropometría">
              <FiActivity />
            </SideToolbarButton>
          </NewAntropometriaDialog>
          <NewInterconsultaDialog patientId={patientId}>
            <SideToolbarButton variant="info" label="Nueva interconsulta">
              <FiUsers />
            </SideToolbarButton>
          </NewInterconsultaDialog>
          <NewHospitalizacionDialogDialog patientId={patientId}>
            <SideToolbarButton variant="warning" label="Nueva internación">
              <FiThermometer />
            </SideToolbarButton>
          </NewHospitalizacionDialogDialog>
          <NewArchivoAdjuntoDialog patientId={patientId}>
            <SideToolbarButton variant="secondary" label="Adjuntar archivo">
              <ImAttachment />
            </SideToolbarButton>
          </NewArchivoAdjuntoDialog>

          <div className="my-1 h-px w-8 bg-stone-200" />

          <HistoriaMedicaDialog patientId={patientId}>
            <SideToolbarButton variant="secondary" label="Resumen de historia clínica">
              <SlPrinter />
            </SideToolbarButton>
          </HistoriaMedicaDialog>

          <div className="grow" />

          <DeleteDialog onDelete={handleDelete}>
            <SideToolbarButton variant="danger" label="Eliminar paciente">
              <ThrashCanIcon />
            </SideToolbarButton>
          </DeleteDialog>
        </SideToolbar>

        <div className="flex min-w-0 flex-1 flex-col">
          <Toolbar>
            {/*
             * One line, centred: a padded pill next to text does not sit right
             * on a shared baseline, and the bar centres its children.
             */}
            <div className="flex min-w-0 items-center gap-x-3">
              <h1 className="shrink-0 truncate text-lg font-bold leading-none tracking-tight text-stone-900">
                {data?.nombre}
              </h1>
              {edad !== null && (
                <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold leading-none text-brand-800">
                  {edad} años
                </span>
              )}
              <span className="truncate text-sm leading-none text-stone-500">
                DNI {data?.documento}
                {data?.obraSocial ? ` · ${data.obraSocial} Nº ${data.numeroObraSocial}` : ""}
                {data?.telefono ? ` · ${data.telefono}` : ""}
                {data?.email ? ` · ${data.email}` : ""}
              </span>
            </div>
            <div className="grow" />
            <EditPacienteDialog patientId={patientId}>
              <ToolbarButton icon={<Pencil1Icon />}>
                EDITAR DATOS
              </ToolbarButton>
            </EditPacienteDialog>
          </Toolbar>

          {/*
           * Compact underlined tabs rather than the shared TabsHeader: that one
           * stretches each tab to an equal share of the width, which is right
           * inside a dialog and far too heavy for a screen-level switch.
           */}
          <nav className="border-b border-stone-200 bg-white px-4">
            <div className="flex gap-1">
              {PANES.map((pane) => {
                const selected = activePane === pane.id;
                return (
                  <button
                    key={pane.id}
                    type="button"
                    onClick={() => setActivePane(pane.id)}
                    className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                      selected
                        ? "border-brand-600 text-brand-700"
                        : "border-transparent text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {pane.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        selected ? "bg-brand-100 text-brand-800" : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {pane.id === "resumen" ? (history?.length ?? 0) : filteredHistory?.length ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {activePane === "resumen" ? (
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <PatientSummary
                patientId={patientId}
                history={history || []}
                onOpenRecord={(item) => setHistoryId(item.id)}
              />
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <PatientHistoryTable
                history={filteredHistory || []}
                onClick={handleHistoryClick}
                search={search}
                onSearchChange={setSearch}
                kinds={HISTORY_KINDS}
                selectedKinds={selectedKinds}
                onToggleKind={toggleKind}
              />
            </div>
          )}
        </div>
      </div>

      {historyItem?.type === "evolucion" && (
        <EditEvolucionDialog id={historyItem.id} onClose={handleHistoryClose} />
      )}
      {historyItem?.type === "interconsulta" && (
        <EditInterconsultaDialog
          id={historyItem.id}
          onClose={handleHistoryClose}
        />
      )}
      {historyItem?.type === "antropometria" && (
        <EditAntropometriaDialog
          id={historyItem.id}
          onClose={handleHistoryClose}
        />
      )}
      {historyItem?.type === "hospitalizacion" && (
        <EditHospitalizacionDialog
          id={historyItem.id}
          onClose={handleHistoryClose}
        />
      )}
    </AppContainer>
  );
}
