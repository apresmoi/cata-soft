import * as RadixDialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

export function DialogTitle(props: React.PropsWithChildren) {
  return (
    <RadixDialog.Title className="px-4 pb-4 pt-5 sm:p-6 flex items-center justify-between border-b border-stone-200 select-none text-base font-semibold text-stone-900">
      {props.children}

      <RadixDialog.Close asChild>
        <button
          className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label="Close"
        >
          <Cross2Icon />
        </button>
      </RadixDialog.Close>
    </RadixDialog.Title>
  );
}
