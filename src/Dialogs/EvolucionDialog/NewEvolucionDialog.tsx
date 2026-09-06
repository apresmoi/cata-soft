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
import { useRequiredFields } from "../../hooks/useRequiredFields";
import { EvolucionDialogContent } from "./EvolucionDialogContent";

interface NewEvolutionProps {
  patientId: string;
}

export function NewEvolucionDialog(
  props: React.PropsWithChildren<NewEvolutionProps>
) {
  const { data, save, update, clear } = useNewEvolution(props.patientId);
  // Schema-nullable, but an evolución with nothing in it is not a record --
  // this is a UI rule, not a schema constraint.
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
      <DialogContainer>
        <DialogTitle>NUEVA EVOLUCION</DialogTitle>

        <EvolucionDialogContent update={update} data={data} invalid={invalid(data)} />
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
