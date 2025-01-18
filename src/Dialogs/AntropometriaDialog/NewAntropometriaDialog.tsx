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
import { useNewAntropometria } from "../../hooks";
import { AntropometriaDialogContent } from "./AntropometriaDialogContent";

interface NewAntropometriaDialogProps {
  patientId: string;
}

export function NewAntropometriaDialog(
  props: React.PropsWithChildren<NewAntropometriaDialogProps>
) {
  const { data, save, update, clear } = useNewAntropometria(props.patientId);

  const [open, setOpen] = React.useState(false);

  const handleSave = async () => {
    try {
      await save();
      setOpen(false);
    } catch (e) {}
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) clear();
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>{props.children}</DialogTrigger>

      <DialogContainer className="w-[300px] min-w-[300px]">
        <DialogTitle>NUEVA ANTROPOMETRIA</DialogTitle>

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
