import React from "react";
import {
  Dialog,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogTriggerButton,
} from "../components/Dialog";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface DeleteDialogProps {
  onDelete?: () => void;

  asChild?: boolean;
}

export function DeleteDialog(
  props: React.PropsWithChildren<DeleteDialogProps>
) {
  const handleSave = () => {
    props.onDelete?.();
  };

  return (
    <Dialog>
      <DialogTrigger asChild={props.asChild}>{props.children}</DialogTrigger>
      <DialogContainer maxWidth={500}>
        <DialogTitle>
          <ExclamationTriangleIcon /> ¿Estás segura?
        </DialogTitle>
        <div className="flex gap-2 flex-col p-4">
          Vas a eliminar un registro, despues ya no va a existir, y no lo vas a
          poder ver mas. ¿Estás segura de que querés hacerlo?
          <br />
          <br />
          Pensaste en las consecuencias?
          <br />
          <br />
          En serio, no hay vuelta atras.
        </div>
        <DialogFooter>
          <DialogTriggerButton variant="danger" onClick={handleSave}>
            <ExclamationTriangleIcon />
            ELIMINAR
          </DialogTriggerButton>
          <DialogCancelButton />
        </DialogFooter>
      </DialogContainer>
    </Dialog>
  );
}
