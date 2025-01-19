import * as RadixDialog from "@radix-ui/react-dialog";
import { DialogButton } from "./DialogButton";

export function DialogTriggerButton(
  props: React.PropsWithChildren<{
    onClick?: () => void;
    variant?: "primary" | "secondary" | "warning" | "danger" | "info";
    disabled?: boolean;
  }>
) {
  return (
    <RadixDialog.Trigger
      asChild
      className="select-none"
      onClick={props.onClick}
    >
      <span>
        <DialogButton {...props} />
      </span>
    </RadixDialog.Trigger>
  );
}
