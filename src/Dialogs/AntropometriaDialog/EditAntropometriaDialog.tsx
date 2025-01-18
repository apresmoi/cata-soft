import React from "react";
import {
  Dialog,
  DialogButton,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
} from "../../components/Dialog";
import { useAntropometria } from "../../hooks";
import { AntropometriaDialogContent } from "./AntropometriaDialogContent";

interface EditAntropometriaDialogProps {
  id: string;
  onClose?: () => void;
}

export function EditAntropometriaDialog(
  props: React.PropsWithChildren<EditAntropometriaDialogProps>
) {
  const { data, save, update } = useAntropometria(props.id, {
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
      <DialogContainer className="w-[300px] min-w-[300px]">
        <DialogTitle>EDITAR ANTROPOMETRIA</DialogTitle>

        <AntropometriaDialogContent update={update} data={data} />
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
