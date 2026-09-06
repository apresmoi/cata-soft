import { useRef } from "react";
import cx from "classnames";
import * as RadixDialog from "@radix-ui/react-dialog";
import { focusFirstField } from "../../hooks/useFocusFirstField";

export function DialogContainer(
  props: React.PropsWithChildren<{
    className?: string;
    /** Width cap, as a CSS length. Applied inline so it always wins. */
    maxWidth?: number | string;
  }>
) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <RadixDialog.Portal>
      <div
        className="absolute inset-0 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <RadixDialog.Overlay className="absolute top-0 left-0 right-0 bottom-0 bg-stone-900/40"></RadixDialog.Overlay>
        <div className="z-50 h-full w-full overflow-y-auto flex">
          <RadixDialog.Content
            ref={contentRef}
            // Radix focuses the first focusable element (a button) on open, and
            // it runs after our own effects would. Take the event instead:
            // claim focus for the first real field, and only fall back to
            // Radix's default when the dialog has no fields (confirmations).
            onOpenAutoFocus={(event) => {
              if (focusFirstField(contentRef.current)) event.preventDefault();
            }}
            // No min-width here: `min-width` overrides `max-width` in CSS, so a
            // base min-w silently defeated every caller's width.
            className={cx(
              "popover relative m-auto w-full bg-white border border-stone-200 rounded-xl shadow-xl",
              props.className
            )}
            style={{ maxWidth: props.maxWidth ?? 680 }}
          >
            {props.children}
          </RadixDialog.Content>
        </div>
      </div>
    </RadixDialog.Portal>
  );
}
