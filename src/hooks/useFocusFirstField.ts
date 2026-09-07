import React from "react";

/*
 * `[contenteditable]` is in here because the clinical free-text fields are a
 * Lexical editor, not a `<textarea>`. Without it, swapping those fields over
 * silently disabled both the focus-on-open and the focus-on-tab-switch this
 * hook exists to provide.
 */
const FIELD_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

/**
 * Put the cursor in the first data-entry field inside `container`.
 *
 * Fields wrapped in `[data-skip-autofocus]` are ignored -- that marks the date
 * pickers, which are prefilled and should never take the cursor.
 *
 * Returns whether a field was actually focused, so callers can fall back to
 * default focus behaviour on forms that have no fields at all.
 */
export function focusFirstField(container: HTMLElement | null): boolean {
  const candidates = container?.querySelectorAll<HTMLElement>(FIELD_SELECTOR);

  const field = Array.from(candidates ?? []).find(
    (candidate) =>
      !candidate.closest("[data-skip-autofocus]") &&
      !candidate.hasAttribute("disabled") &&
      !candidate.hasAttribute("readonly") &&
      candidate.offsetParent !== null
  );

  if (!field) return false;
  field.focus();

  // Never select-all: typing would wipe whatever is already recorded. Put the
  // caret after the existing text so the field is ready to be appended to.
  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement
  ) {
    const end = field.value.length;
    // Types like number/date/email do not support selection and throw here.
    try {
      field.setSelectionRange(end, end);
    } catch {
      // Focus alone is enough for those.
    }
  } else if (field.isContentEditable) {
    // A rich-text editor has no `value`/`setSelectionRange`, so collapse a
    // range onto the end of its content to get the same caret-at-the-end
    // behaviour.
    const range = document.createRange();
    range.selectNodeContents(field);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  return true;
}

/**
 * Focus the first field after paint, and again whenever `key` changes -- which
 * is how switching tabs moves the cursor into the newly shown panel.
 */
export function useFocusFirstField(
  ref: React.RefObject<HTMLElement>,
  key?: string
) {
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => focusFirstField(ref.current));
    return () => cancelAnimationFrame(frame);
  }, [ref, key]);
}
