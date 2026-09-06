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
              "popover relative m-auto flex w-full flex-col bg-white border border-stone-200 rounded-xl shadow-xl",
              props.className
            )}
            style={{ maxWidth: props.maxWidth ?? 680 }}
          >
            {title}
            <div className="max-h-[70vh] overflow-y-auto p-5">{body}</div>
            {footer}
          </RadixDialog.Content>
        </div>
      </div>
    </RadixDialog.Portal>
  );
}
