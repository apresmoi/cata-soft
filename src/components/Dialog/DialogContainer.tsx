import { Children, isValidElement, useRef } from "react";
import cx from "classnames";
import * as RadixDialog from "@radix-ui/react-dialog";
import { focusFirstField } from "../../hooks/useFocusFirstField";
import { DialogTitle } from "./DialogTitle";
import { DialogFooter } from "./DialogFooter";

export function DialogContainer(
  props: React.PropsWithChildren<{
    className?: string;
    /** Width cap, as a CSS length. Applied inline so it always wins. */
    maxWidth?: number | string;
  }>
) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Split the flat children into title / footer / body so the body alone
  // can scroll while the header and footer stay put.
  const children = Children.toArray(props.children);
  const title = children.filter(
    (child) => isValidElement(child) && child.type === DialogTitle
  );
  const footer = children.filter(
    (child) => isValidElement(child) && child.type === DialogFooter
  );
  const body = children.filter(
    (child) =>
      !(isValidElement(child) && child.type === DialogTitle) &&
      !(isValidElement(child) && child.type === DialogFooter)
  );

  return (
    <RadixDialog.Portal>
      <div
        className="absolute inset-0 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <RadixDialog.Overlay className="fixed inset-0 bg-stone-900/30"></RadixDialog.Overlay>
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
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
              "popover relative flex max-h-[calc(100dvh-32px)] w-full min-h-0 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl",
              props.className
            )}
            style={{ maxWidth: props.maxWidth ?? 680 }}
          >
            {title}
            {/* No padding here: every dialog body brings its own, and having
                both double-padded each form. */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{body}</div>
            {footer}
          </RadixDialog.Content>
        </div>
      </div>
    </RadixDialog.Portal>
  );
}
