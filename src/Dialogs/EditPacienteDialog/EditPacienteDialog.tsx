import React from "react";
import {
  ChatBubbleIcon,
  ClockIcon,
  EnvelopeOpenIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  IdCardIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import {
  PatientCard,
  PatientCardAgeDateField,
  PatientCardField,
} from "../../components";
import {
  Dialog,
  DialogButton,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../../components/Dialog";
import { usePaciente, usePacientes } from "../../hooks";
import { useRequiredFields } from "../../hooks/useRequiredFields";

interface EditPacienteDialogProps {
  patientId: string;
}

/** Whole years between a birth date and today -- never trusts a stored age. */
function calculateAge(birthDate: Date | string | null | undefined): number {
  if (!birthDate) return 0;
  const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 0;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function EditPacienteDialog(
  props: React.PropsWithChildren<EditPacienteDialogProps>
) {
  const { data, update, save } = usePaciente(props.patientId);
  // Reused, not a new IPC channel: the patient list is already fetched with
  // this hook elsewhere, so checking it here for a duplicate DNI adds no
  // extra round trip beyond the shared query cache.
  const { data: pacientes } = usePacientes();

  const [open, setOpen] = React.useState(false);
  const [documentoDuplicado, setDocumentoDuplicado] = React.useState(false);

  const { check, invalid, reset } = useRequiredFields<
    NonNullable<typeof data>
  >([{ name: "nombre" }, { name: "documento" }]);

  const handleDocumentoChange = (value: string) => {
    setDocumentoDuplicado(false);
    update("documento", { uppercase: true })(value);
  };

  const handleSave = async () => {
    if (!check(data ?? undefined)) return;

    const duplicado = (pacientes ?? []).some(
      (paciente) =>
        paciente.id !== props.patientId &&
        paciente.documento === data?.documento
    );
    if (duplicado) {
      setDocumentoDuplicado(true);
      return;
    }

    try {
      await save();
      setOpen(false);
    } catch (e) {}
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setDocumentoDuplicado(false);
    }
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContainer>
        <DialogTitle>EDITAR DATOS DEL PACIENTE</DialogTitle>

        <PatientCard>
          <div className="w-full grid grid-cols-2 gap-4">
            <PatientCardField
              icon={<PersonIcon />}
              label="NOMBRE Y APELLIDO (*)"
              value={data?.nombre || ""}
              onChange={update("nombre", { uppercase: true })}
              className="col-span-2"
              invalid={invalid(data ?? undefined).includes("nombre")}
            />

            <PatientCardField
              icon={<IdCardIcon />}
              label="DOCUMENTO (*)"
              value={data?.documento || ""}
              onChange={handleDocumentoChange}
              invalid={
                invalid(data ?? undefined).includes("documento") ||
                documentoDuplicado
              }
            />
            <PatientCardAgeDateField
              icon={<ClockIcon />}
              label="FECHA DE NACIMIENTO"
              value={data?.fechaNacimiento}
              onChange={update("fechaNacimiento")}
            />

            <PatientCardField
              icon={<ClockIcon />}
              label="EDAD"
              value={calculateAge(data?.fechaNacimiento)}
              disabled
            />
            <PatientCardField
              icon={<ChatBubbleIcon />}
              label="TELEFONO"
              value={data?.telefono || ""}
              onChange={update("telefono", { uppercase: true })}
            />

            <PatientCardField
              icon={<HomeIcon />}
              label="DIRECCION"
              value={data?.direccion || ""}
              onChange={update("direccion", { uppercase: true })}
            />
            <PatientCardField
              icon={<EnvelopeOpenIcon />}
              label="EMAIL"
              value={data?.email || ""}
              onChange={update("email")}
            />

            <PatientCardField
              icon={<ExclamationTriangleIcon />}
              label="OBRA SOCIAL"
              value={data?.obraSocial || ""}
              onChange={update("obraSocial", { uppercase: true })}
            />
            <PatientCardField
              icon={<ExclamationTriangleIcon />}
              label="NUMERO"
              value={data?.numeroObraSocial || ""}
              onChange={update("numeroObraSocial", { uppercase: true })}
            />
          </div>
        </PatientCard>

        <DialogFooter>
          <DialogCancelButton />
          <DialogButton variant="primary" onClick={handleSave}>
            GUARDAR
          </DialogButton>
        </DialogFooter>
      </DialogContainer>
    </Dialog>
  );
}
