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
  Tooltip,
} from "../components";
import { Tab, TabsContainer } from "../components/Tabs";
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
         */}
        <SideToolbar>
          <Tooltip tooltip="VOLVER AL LISTADO">
            <SideToolbarButton variant="secondary" onClick={handleGoBack}>
              <ArrowLeftIcon />
            </SideToolbarButton>
          </Tooltip>

          <div className="my-1 h-px w-8 bg-stone-200" />

          <Tooltip tooltip="NUEVA EVOLUCION">
            <NewEvolucionDialog patientId={patientId}>
              <SideToolbarButton variant="primary">
                <FiFileText />
              </SideToolbarButton>
            </NewEvolucionDialog>
          </Tooltip>
          <Tooltip tooltip="NUEVA ANTROPOMETRIA">
            <NewAntropometriaDialog patientId={patientId}>
              <SideToolbarButton variant="primary">
                <FiActivity />
              </SideToolbarButton>
            </NewAntropometriaDialog>
          </Tooltip>
          <Tooltip tooltip="NUEVA INTERCONSULTA">
            <NewInterconsultaDialog patientId={patientId}>
              <SideToolbarButton variant="info">
                <FiUsers />
              </SideToolbarButton>
            </NewInterconsultaDialog>
          </Tooltip>
          <Tooltip tooltip="NUEVA INTERNACION">
            <NewHospitalizacionDialogDialog patientId={patientId}>
              <SideToolbarButton variant="warning">
                <FiThermometer />
              </SideToolbarButton>
            </NewHospitalizacionDialogDialog>
          </Tooltip>
          <Tooltip tooltip="ADJUNTAR ARCHIVO">
            <NewArchivoAdjuntoDialog patientId={patientId}>
              <SideToolbarButton variant="secondary">
                <ImAttachment />
              </SideToolbarButton>
            </NewArchivoAdjuntoDialog>
          </Tooltip>

          <div className="my-1 h-px w-8 bg-stone-200" />

          <Tooltip tooltip="RESUMEN DE HISTORIA CLINICA">
            <HistoriaMedicaDialog patientId={patientId}>
              <SideToolbarButton variant="secondary">
                <SlPrinter />
              </SideToolbarButton>
            </HistoriaMedicaDialog>
          </Tooltip>

          <div className="grow" />

          <Tooltip tooltip="ELIMINAR PACIENTE">
            <DeleteDialog onDelete={handleDelete}>
              <SideToolbarButton variant="danger">
                <ThrashCanIcon />
              </SideToolbarButton>
            </DeleteDialog>
          </Tooltip>
        </SideToolbar>

        <div className="flex min-w-0 flex-1 flex-col">
          <Toolbar>
            <div className="flex min-w-0 flex-col justify-center">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h1 className="truncate text-lg font-bold tracking-tight text-stone-900">
                  {data?.nombre}
                </h1>
                {edad !== null && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                    {edad} años
                  </span>
                )}
                <span className="text-sm text-stone-500">
                  DNI {data?.documento}
                </span>
                {data?.obraSocial && (
                  <span className="text-sm text-stone-500">
                    {data.obraSocial} · Nº {data.numeroObraSocial}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-stone-500">
                {data?.telefono} {data?.email ? `· ${data.email}` : ""}
              </p>
            </div>
            <div className="grow" />
            <EditPacienteDialog patientId={patientId}>
              <ToolbarButton icon={<Pencil1Icon />}>
                EDITAR DATOS
              </ToolbarButton>
            </EditPacienteDialog>
          </Toolbar>

          <TabsContainer>
            <Tab name="RESUMEN">
              <div className="min-h-0 flex-1 overflow-auto p-4">
                <PatientSummary
                  patientId={patientId}
                  history={history || []}
                  onOpenRecord={(item) => setHistoryId(item.id)}
                />
              </div>
            </Tab>
            <Tab name="REGISTROS">
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
            </Tab>
          </TabsContainer>
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
