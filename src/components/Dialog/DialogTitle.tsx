import * as RadixDialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

export function DialogTitle(props: React.PropsWithChildren) {
  return (
    <RadixDialog.Title className="flex items-center justify-between gap-2 border-b border-stone-200 px-5 py-4 select-none text-base font-semibold text-stone-900">
      <div className="flex items-center gap-2">{props.children}</div>

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
