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
import { useNewEvolution } from "../../hooks";
import { EvolucionDialogContent } from "./EvolucionDialogContent";

interface NewEvolutionProps {
  patientId: string;
}

export function NewEvolucionDialog(
  props: React.PropsWithChildren<NewEvolutionProps>
) {
  const { data, save, update, clear } = useNewEvolution(props.patientId);

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
        <DialogTitle>NUEVA EVOLUCION</DialogTitle>

        <EvolucionDialogContent update={update} data={data} />
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
