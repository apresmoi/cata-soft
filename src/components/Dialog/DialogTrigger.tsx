import * as RadixDialog from "@radix-ui/react-dialog";

export function DialogTrigger(props: React.PropsWithChildren) {
  return <RadixDialog.Trigger>{props.children}</RadixDialog.Trigger>;
}
