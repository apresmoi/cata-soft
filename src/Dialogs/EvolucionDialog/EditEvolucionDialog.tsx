import React from "react";
import {
  Dialog,
  DialogButton,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
} from "../../components/Dialog";
import { useEvolution } from "../../hooks";
import { useRequiredFields } from "../../hooks/useRequiredFields";
import { EvolucionDialogContent } from "./EvolucionDialogContent";

interface EditEvolucionDialogProps {
  id: string;
  onClose?: () => void;
}

export function EditEvolucionDialog(
  props: React.PropsWithChildren<EditEvolucionDialogProps>
) {
  const { data, save, update } = useEvolution(props.id, {
    enabled: !!props.id,
  });
  // Schema-nullable, but an evolución with nothing in it is not a record --
  // this is a UI rule, not a schema constraint.
  const { check, invalid, reset } = useRequiredFields<
    NonNullable<typeof data>
  >([{ name: "motivo" }]);

  const handleClose = () => {
    reset();
    props.onClose?.();
  };

  const handleSave = async () => {
    if (!check(data ?? undefined)) return;
    try {
      await save();
      handleClose();
    } catch (e) {}
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <DialogContainer>
        <DialogTitle>EDITAR EVOLUCION</DialogTitle>

        <EvolucionDialogContent update={update} data={data} invalid={invalid(data ?? undefined)} />
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
