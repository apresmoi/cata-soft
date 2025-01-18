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
import { HospitalizacionDialogContent } from "./HospitalizacionDialogContent";

interface NewHospitalizacionDialogProps {
  patientId: string;
}

export function NewHospitalizacionDialogDialog(
  props: React.PropsWithChildren<NewHospitalizacionDialogProps>
) {
  const { data, save, update, clear } = useNewHospitalizacion(props.patientId);

  const [open, setOpen] = React.useState(false);

  const handleSave = async () => {
    try {
      await save();
      setOpen(false);
    } catch (e) {}
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) clear();
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContainer>
        <DialogTitle>NUEVA HOSPITALIZACION</DialogTitle>

        <HospitalizacionDialogContent update={update} data={data} />
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
