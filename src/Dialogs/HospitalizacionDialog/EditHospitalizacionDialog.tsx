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

  const handleSave = async () => {
    try {
      await save();
      props.onClose?.();
    } catch (e) {}
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && props.onClose?.()}>
      <DialogContainer>
        <DialogTitle>EDITAR HOSPITALIZACION</DialogTitle>

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
