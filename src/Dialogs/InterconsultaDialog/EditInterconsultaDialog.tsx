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
import { useRequiredFields } from "../../hooks/useRequiredFields";
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
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContainer>
        <DialogTitle>EDITAR INTERCONSULTA</DialogTitle>

        <InterconsultasDialogContent update={update} data={data} invalid={invalid(data ?? undefined)} />

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
