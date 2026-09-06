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
import { useRequiredFields } from "../../hooks/useRequiredFields";
import { AntropometriaDialogContent } from "./AntropometriaDialogContent";

interface NewAntropometriaDialogProps {
  patientId: string;
}

export function NewAntropometriaDialog(
  props: React.PropsWithChildren<NewAntropometriaDialogProps>
) {
  const { data, save, update, clear } = useNewAntropometria(props.patientId);

  const [open, setOpen] = React.useState(false);

  const { check, invalid, reset } = useRequiredFields<
    NonNullable<typeof data>
  >([
    { name: "peso", kind: "positiveNumber" },
    { name: "talla", kind: "positiveNumber" },
    { name: "imc", kind: "positiveNumber" },
  ]);

  const handleSave = async () => {
    if (!check(data)) return;
    try {
      await save();
      setOpen(false);
    } catch (e) {}
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      clear();
      reset();
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>{props.children}</DialogTrigger>

      <DialogContainer maxWidth={288}>
        <DialogTitle>NUEVA ANTROPOMETRIA</DialogTitle>

        <AntropometriaDialogContent
          update={update}
          data={data}
          invalid={invalid(data)}
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
