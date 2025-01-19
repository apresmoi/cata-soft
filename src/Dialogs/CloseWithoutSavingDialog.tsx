import React from "react";
import {
  Dialog,
  DialogButton,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../components/Dialog";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface CloseWithoutSavingDialogProps {
  onSave?: () => void;
  onCancel?: () => void;
  onWithoutSave?: () => void;
}

export function CloseWithoutSavingDialog(
  props: React.PropsWithChildren<CloseWithoutSavingDialogProps>
) {
  const handleSave = () => {
    props.onSave?.();
  };

  const handleWithoutSave = () => {
    props.onWithoutSave?.();
  };

  const handleCancel = () => {
    props.onCancel?.();
  };

  return (
    <Dialog open onOpenChange={handleCancel}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContainer className="w-[500px] min-w-[500px]">
        <DialogTitle>
          <ExclamationTriangleIcon />
          Tenes cambios sin guardar!
        </DialogTitle>
        <div className="flex gap-2 flex-col p-4">
          CATAAAAAA, hiciste algunos cambios en el paciente
          <br />
          <br />
          No los queres guardar antes de cerrar?
        </div>
        <DialogFooter>
          <DialogButton variant="primary" onClick={handleSave}>
            GUARDAR
          </DialogButton>
          <DialogButton variant="danger" onClick={handleWithoutSave}>
            CERRAR SIN GUARDAR
          </DialogButton>
          <DialogCancelButton />
        </DialogFooter>
      </DialogContainer>
    </Dialog>
  );
}
