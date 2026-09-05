import React from "react";

/**
 * Keep the caret where the user put it in a controlled field.
 *
 * The edit dialogs and the patient card push changes into the react-query
 * cache, and that notification arrives after the change event has finished.
 * React therefore restores the DOM value to the last value it rendered, which
 * drops the caret at the end of the text -- so editing the middle of a word
 * jumped to the end on every keystroke.
 *
 * Remembering the caret on input and re-applying it after the commit fixes it
 * without making the field uncontrolled. Deliberate caret moves (clicks, arrow
 * keys, selection) come through `remember` as well, so re-applying is a no-op
 * for them.
 */
export function usePreservedCaret<
  T extends HTMLInputElement | HTMLTextAreaElement
>() {
  const ref = React.useRef<T>(null);
  const caret = React.useRef<number | null>(null);

  const remember = (position: number | null) => {
    caret.current = position;
  };

  React.useLayoutEffect(() => {
    const field = ref.current;
    const position = caret.current;

    if (!field || position === null) return;
    if (document.activeElement !== field) return;
    if (field.selectionStart === position) return;

    try {
      field.setSelectionRange(position, position);
    } catch {
      // Input types like number/date do not expose a selection.
    }
  });
  /**
   * Spread onto the field. Only the ref is needed: the caret is recorded from
   * the change event itself. A selection listener would be clobbered by the
   * selection change React fires while restoring the value.
   */
  const caretProps = { ref };

  return { caretProps, remember };
}
