import {
  ArrowLeftIcon,
  ChatBubbleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  IdCardIcon,
  PersonIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { Toolbar } from "../components/Toolbar";
import { ToolbarButton } from "../components/ToolbarButton";
import {
  AppContainer,
  PatientCard,
  PatientCardAgeDateField,
  PatientCardField,
  PatientCardTextAreaField,
  PatientHistoryTable,
  SideToolbar,
  SideToolbarButton,
  ToolbarSearch,
  Tooltip,
} from "../components";
import { useParams } from "react-router-dom";
import {
  PacienteHistoryItem,
  usePaciente,
  usePacienteHistorial,
} from "../hooks";
import {
  EditAntropometriaDialog,
  CloseWithoutSavingDialog,
  EditEvolucionDialog,
  EditHospitalizacionDialog,
  EditInterconsultaDialog,
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

const searchKeys = [
  "type",
  "motivo",
  "examenFisico",
  "plan",
  "notas",
] as (keyof PacienteHistoryItem)[];

export function PatientScreen() {
  const params = useParams();
  const [search, setSearch] = React.useState("");

  const [isClosingWithoutSaving, setIsClosingWithoutSaving] =
    React.useState(false);

  const { isModified, data, update, save, remove } = usePaciente(
    params.id as string
  );
  const { data: history } = usePacienteHistorial(params.id as string);

  const [historyId, setHistoryId] = React.useState<string | null>(null);

  const historyItem = history?.find((row) => row.id === historyId);

  const handleSave = (back?: boolean) => {
    save();

    if (back) {
      window.history.back();
    }
  };

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

  const handleGoBack = (force: boolean = false) => {
    if (isModified && !force) {
      setIsClosingWithoutSaving(true);
      return;
    }
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

  return (
    <AppContainer>
      <Toolbar>
        <ToolbarButton icon={<ArrowLeftIcon />} onClick={handleGoBack}>
          ATRAS
        </ToolbarButton>
        <div className="grow" />
        <ToolbarButton
          variant="primary"
          icon={<UploadIcon />}
          onClick={handleSave}
          disabled={!isModified}
        >
          GUARDAR
        </ToolbarButton>
      </Toolbar>

      {isClosingWithoutSaving && (
        <CloseWithoutSavingDialog
          onSave={() => handleSave(true)}
          onCancel={() => setIsClosingWithoutSaving(false)}
          onWithoutSave={() => handleGoBack(true)}
        />
      )}

      <PatientCard>
        <div className="flex gap-2">
          <PatientCardField
            icon={<PersonIcon />}
            label="NOMBRE Y APELLIDO"
            value={data?.nombre || ""}
            onChange={update("nombre", { uppercase: true })}
            className="flex-1"
          />
          <PatientCardField
            icon={<IdCardIcon />}
            label="DNI"
            value={data?.documento || ""}
            onChange={update("documento", { uppercase: true })}
            className="w-[200px]"
          />
          <PatientCardAgeDateField
            icon={<ClockIcon />}
            label="FECHA DE NACIMIENTO"
            value={data?.fechaNacimiento}
            onChange={update("fechaNacimiento")}
            className="w-[200px]"
          />
          <PatientCardField
            icon={<ClockIcon />}
            label="EDAD"
            value={data?.edad || 0}
            disabled
            className="w-[150px]"
          />
        </div>
        <div className="flex gap-2">
          <PatientCardField
            icon={<HomeIcon />}
            label="DIRECCION"
            value={data?.direccion || ""}
            onChange={update("direccion", { uppercase: true })}
            className="flex-1"
          />
          <PatientCardField
            icon={<ChatBubbleIcon />}
            label="TELEFONO"
            value={data?.telefono || ""}
            onChange={update("telefono", { uppercase: true })}
            className="w-[150px]"
          />
          <PatientCardField
            icon={<ChatBubbleIcon />}
            label="EMAIL"
            value={data?.email || ""}
            onChange={update("email")}
            className="flex-1"
          />
          <div className="h-full border-l border-stone-700" />
          <PatientCardField
            icon={<ExclamationTriangleIcon />}
            label="Obra Social"
            value={data?.obraSocial || ""}
            onChange={update("obraSocial", { uppercase: true })}
            className="flex-1"
          />
          <PatientCardField
            icon={<ExclamationTriangleIcon />}
            label="Numero"
            value={data?.numeroObraSocial || ""}
            onChange={update("numeroObraSocial", { uppercase: true })}
            className="flex-1"
          />
        </div>
      </PatientCard>

      <div className="w-screem flex-1 flex relative overflow-hidden border-t border-stone-700">
        <SideToolbar>
          <Tooltip tooltip="NUEVA EVOLUCION">
            <NewEvolucionDialog patientId={params.id as string}>
              <SideToolbarButton variant="primary">E</SideToolbarButton>
            </NewEvolucionDialog>
          </Tooltip>
          <Tooltip tooltip="ARCHIVOS ADJUNTOS">
            <NewArchivoAdjuntoDialog patientId={params.id as string}>
              <SideToolbarButton variant="secondary">
                <ImAttachment />
              </SideToolbarButton>
            </NewArchivoAdjuntoDialog>
          </Tooltip>
          <Tooltip tooltip="INTERCONSULTAS">
            <NewInterconsultaDialog patientId={params.id as string}>
              <SideToolbarButton variant="warning">I</SideToolbarButton>
            </NewInterconsultaDialog>
          </Tooltip>
          <Tooltip tooltip="ANTROPOMETRIA">
            <NewAntropometriaDialog patientId={params.id as string}>
              <SideToolbarButton variant="primary">A</SideToolbarButton>
            </NewAntropometriaDialog>
          </Tooltip>
          <Tooltip tooltip="HOSPITALIZACIONES">
            <NewHospitalizacionDialogDialog patientId={params.id as string}>
              <SideToolbarButton variant="danger">H</SideToolbarButton>
            </NewHospitalizacionDialogDialog>
          </Tooltip>
          <Tooltip tooltip="RESUMEN DE HISTORIA CLINICA">
            <HistoriaMedicaDialog patientId={params.id as string}>
              <SideToolbarButton variant="info">
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
        <div className="flex-1 flex flex-col">
          <div className="pt-2  bg-stone-900">
            <div className="w-[100%] mr-auto">
              <ToolbarSearch legend="Buscar historial" onChange={setSearch} />
            </div>
          </div>
          <PatientHistoryTable
            history={filteredHistory || []}
            onClick={handleHistoryClick}
          />
        </div>
        {historyItem?.type === "evolucion" && (
          <EditEvolucionDialog
            id={historyItem.id}
            onClose={handleHistoryClose}
          />
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
        <div className="w-[300px] h-full flex flex-col bg-stone-900 p-2 gap-2">
          <PatientCardTextAreaField
            label="ANTECEDENTES"
            value={data?.antecedentes || ""}
            onChange={update("antecedentes")}
            className="flex-1"
          />
          <PatientCardTextAreaField
            label="MEDICACION HABITUAL"
            value={data?.medicacionHabitual || ""}
            onChange={update("medicacionHabitual")}
            className="flex-1"
          />
        </div>
      </div>
    </AppContainer>
  );
}
