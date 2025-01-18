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

  const handleSave = async () => {
    try {
      await save();
      props.onClose?.();
    } catch (e) {}
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && props.onClose?.()}>
      <DialogContainer>
        <DialogTitle>EDITAR EVOLUCION</DialogTitle>

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
