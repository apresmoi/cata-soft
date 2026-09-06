import * as RadixDialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

export function DialogTitle(props: React.PropsWithChildren) {
  return (
    <RadixDialog.Title className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-200 px-4 py-3 select-none text-base font-semibold text-stone-900">
      <div className="flex min-w-0 items-center gap-2 leading-5">{props.children}</div>

      <RadixDialog.Close asChild>
        <button
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label="Close"
        >
          <Cross2Icon />
        </button>
      </RadixDialog.Close>
    </RadixDialog.Title>
  );
}
