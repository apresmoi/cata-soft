import React from "react";
import { PatientCard, PatientCardTextAreaField } from "../../components";
import {
  Dialog,
  DialogButton,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../../components/Dialog";
import { usePaciente } from "../../hooks";

type EditablePacienteField = "antecedentes" | "medicacionHabitual";

interface EditPacienteNotasDialogProps {
  patientId: string;
  field: EditablePacienteField;
}

const TITLE_BY_FIELD: Record<EditablePacienteField, string> = {
  antecedentes: "Editar antecedentes",
  medicacionHabitual: "Editar medicación habitual",
};

export function EditPacienteNotasDialog(
  props: React.PropsWithChildren<EditPacienteNotasDialogProps>
) {
  const { data, update, save } = usePaciente(props.patientId);

  const [open, setOpen] = React.useState(false);

  const handleSave = async () => {
    try {
      await save();
      setOpen(false);
    } catch (error) {
      // Keep the dialog open so the edit is not lost, but never swallow the
      // reason: this is patient data.
      console.error(`[ui] saving ${props.field} failed:`, error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContainer>
        <DialogTitle>{TITLE_BY_FIELD[props.field]}</DialogTitle>
        <PatientCard>
          <PatientCardTextAreaField
            value={data?.[props.field] || ""}
            onChange={update(props.field)}
          />
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
