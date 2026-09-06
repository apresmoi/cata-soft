import React from "react";
import {
  Dialog,
  DialogButton,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
} from "../../components/Dialog";
import { useHospitalizacion } from "../../hooks";
import { useRequiredFields } from "../../hooks/useRequiredFields";
import { HospitalizacionDialogContent } from "./HospitalizacionDialogContent";

interface EditHospitalizacionDialogProps {
  id: string;
  onClose?: () => void;
}

export function EditHospitalizacionDialog(
  props: React.PropsWithChildren<EditHospitalizacionDialogProps>
) {
  const { data, save, update } = useHospitalizacion(props.id, {
    enabled: !!props.id,
  });
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
      <DialogContainer maxWidth={640}>
        <DialogTitle>EDITAR HOSPITALIZACION</DialogTitle>

        <HospitalizacionDialogContent update={update} data={data} invalid={invalid(data ?? undefined)} />
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
