import * as RadixDialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

export function DialogTitle(props: React.PropsWithChildren) {
  return (
    <RadixDialog.Title className="px-4 pb-4 pt-5 sm:p-6 flex items-center justify-between border-b border-black/10 dark:border-white/10">
      {props.children}

      <RadixDialog.Close asChild>
        <button className="IconButton" aria-label="Close">
          <Cross2Icon />
        </button>
      </RadixDialog.Close>
    </RadixDialog.Title>
  );
}
