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
import { useNewInterconsulta } from "../../hooks";
import { InterconsultasDialogContent } from "./InterconsultasDialogContent";

interface NewEvolutionProps {
  patientId: string;
}

export function NewInterconsultaDialog(
  props: React.PropsWithChildren<NewEvolutionProps>
) {
  const { data, save, update, clear } = useNewInterconsulta(props.patientId);

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
        <DialogTitle>NUEVA INTERCONSULTA</DialogTitle>

        <InterconsultasDialogContent update={update} data={data} />
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
