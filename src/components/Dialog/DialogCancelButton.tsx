import * as RadixDialog from "@radix-ui/react-dialog";
import { DialogButton } from "./DialogButton";

export function DialogCancelButton() {
  return (
    <RadixDialog.Trigger asChild>
      <span>
        <DialogButton>CANCELAR</DialogButton>
      </span>
    </RadixDialog.Trigger>
  );
}
