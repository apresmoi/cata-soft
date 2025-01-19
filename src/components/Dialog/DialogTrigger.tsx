import * as RadixDialog from "@radix-ui/react-dialog";

export function DialogTrigger(
  props: React.PropsWithChildren<{ asChild?: boolean }>
) {
  return (
    <RadixDialog.Trigger asChild={props.asChild}>
      {props.children}
    </RadixDialog.Trigger>
  );
}
