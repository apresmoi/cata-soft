import * as RadixDialog from "@radix-ui/react-dialog";
import { DialogButton } from "./DialogButton";

export function DialogCancelButton() {
  return (
    <RadixDialog.Trigger asChild className="select-none">
      <span>
        <DialogButton>CANCELAR</DialogButton>
      </span>
    </RadixDialog.Trigger>
  );
}
