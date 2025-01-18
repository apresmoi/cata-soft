import * as RadixDialog from "@radix-ui/react-dialog";

export function Dialog(
  props: React.PropsWithChildren<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>
) {
  return (
    <RadixDialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      {props.children}
    </RadixDialog.Root>
  );
}
