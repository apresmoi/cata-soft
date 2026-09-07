import React from "react";
import {
  Dialog,
  DialogButton,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../../components/Dialog";
import { useNewHospitalizacion } from "../../hooks";
import { useRequiredFields } from "../../hooks/useRequiredFields";
import { HospitalizacionDialogContent } from "./HospitalizacionDialogContent";

interface NewHospitalizacionDialogProps {
  patientId: string;
}

export function NewHospitalizacionDialogDialog(
  props: React.PropsWithChildren<NewHospitalizacionDialogProps>
) {
  const { data, save, update, clear } = useNewHospitalizacion(props.patientId);
  const { check, invalid, reset } = useRequiredFields<
    NonNullable<typeof data>
  >([{ name: "motivo" }]);

  const [open, setOpen] = React.useState(false);

  const handleSave = async () => {
    if (!check(data)) return;
    try {
      await save();
      setOpen(false);
    } catch (e) {}
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      clear();
      reset();
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContainer maxWidth={640}>
        <DialogTitle>NUEVA HOSPITALIZACION</DialogTitle>

        <HospitalizacionDialogContent update={update} data={data} invalid={invalid(data)} />
        <DialogFooter>
          <DialogButton variant="primary" onClick={handleSave}>
            GUARDAR
          </DialogButton>
          <DialogCancelButton />
        </DialogFooter>
      </DialogContainer>
    </Dialog>
  );
}
