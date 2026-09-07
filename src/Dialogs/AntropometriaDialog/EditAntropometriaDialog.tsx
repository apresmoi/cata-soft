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
import { useRequiredFields } from "../../hooks/useRequiredFields";
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

  const { check, invalid, reset } = useRequiredFields<
    NonNullable<typeof data>
  >([
    { name: "peso", kind: "positiveNumber" },
    { name: "talla", kind: "positiveNumber" },
    { name: "imc", kind: "positiveNumber" },
  ]);

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
      <DialogContainer maxWidth={288}>
        <DialogTitle>EDITAR ANTROPOMETRIA</DialogTitle>

        <AntropometriaDialogContent
          update={update}
          data={data}
          invalid={invalid(data ?? undefined)}
        />
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
