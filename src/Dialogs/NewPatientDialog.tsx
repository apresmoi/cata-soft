import React from "react";
import {
  ChatBubbleIcon,
  ClockIcon,
  EnvelopeOpenIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  IdCardIcon,
  PersonIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import {
  PatientCard,
  PatientCardAgeDateField,
  PatientCardField,
  ToolbarButton,
} from "../components";
import {
  Dialog,
  DialogButton,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../components/Dialog";
import { useNavigate } from "react-router-dom";
import { useNewPaciente } from "../hooks";

export function NewPatientDialog() {
  const { data, save, update, clear } = useNewPaciente();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      const newPaciente = await save();
      if (newPaciente) {
        navigate(`/patient/${newPaciente.id}`);
        setOpen(false);
      }
    } catch (e) {}
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) clear();
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <ToolbarButton variant="primary" icon={<PlusIcon />}>
          NUEVO PACIENTE
        </ToolbarButton>
      </DialogTrigger>
      <DialogContainer>
        <DialogTitle>NUEVO PACIENTE</DialogTitle>

        <PatientCard>
          <PatientCardField
            icon={<PersonIcon />}
            label="NOMBRE Y APELLIDO (*)"
            onChange={update("nombre")}
            value={data.nombre}
            className="flex-1"
          />
          <div className="w-full flex gap-2">
            <PatientCardField
              icon={<IdCardIcon />}
              label="DOCUMENTO (*)"
              onChange={update("documento")}
              value={data.documento}
              className="flex-1"
            />

            <PatientCardAgeDateField
              icon={<ClockIcon />}
              label="FECHA DE NACIMIENTO (*)"
              onChange={update("fechaNacimiento")}
              value={data.fechaNacimiento}
              className="flex-1"
            />
          </div>

          <div className="mt-4 font-bold w-full border-b">CONTACTO</div>

          <PatientCardField
            icon={<HomeIcon />}
            label="DIRECCION"
            onChange={update("direccion")}
            value={data.direccion}
            className="flex-1"
          />
          <div className="w-full flex gap-2">
            <PatientCardField
              icon={<ChatBubbleIcon />}
              label="TELEFONO"
              onChange={update("telefono")}
              value={data.telefono}
            />
            <PatientCardField
              icon={<EnvelopeOpenIcon />}
              label="EMAIL"
              onChange={update("email")}
              value={data.email}
            />
          </div>

          <div className="mt-4 font-bold w-full border-b">OBRA SOCIAL</div>

          <div className="w-full flex gap-2">
            <PatientCardField
              icon={<ExclamationTriangleIcon />}
              label="Prestador"
              onChange={update("obraSocial")}
              value={data.obraSocial}
              className="w-[40%]"
            />

            <PatientCardField
              icon={<ExclamationTriangleIcon />}
              label="NUMERO"
              onChange={update("numeroObraSocial")}
              value={data.numeroObraSocial}
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
