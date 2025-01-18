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
import { useInterconsulta } from "../../hooks";
import { InterconsultasDialogContent } from "./InterconsultasDialogContent";

interface EditInterconsultaDialogProps {
  id: string;
  onClose?: () => void;
}

export function EditInterconsultaDialog(
  props: React.PropsWithChildren<EditInterconsultaDialogProps>
) {
  const { data, save, update } = useInterconsulta(props.id, {
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
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContainer>
        <DialogTitle>EDITAR INTERCONSULTA</DialogTitle>

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
