import cx from "classnames";

interface PatientCardFieldProps<T> {
  icon: React.ReactNode;
  label: string;

  value?: T;
  onChange?: (value: T) => void;

  className?: string;

  align?: "left" | "center" | "right";

  disabled?: boolean;
  inline?: boolean;
  /** Draw a red ring: a required field left empty on save. */
  invalid?: boolean;
  /** Cap the control at 144px and right-align digits; unit stays outside. */
  numeric?: boolean;
}

export function PatientCardField<T>(props: PatientCardFieldProps<T>) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      props.onChange(event.target.value as T);
    }
  };

  return (
    <div
      className={cx(
        // Inline rows are a fixed 64px label column plus a filling control
        // column; a flex row here previously let the label collapse to 0px
        // and the control drift to the far edge.
        props.inline
          ? "grid min-w-0 grid-cols-[64px_minmax(0,1fr)] items-center gap-x-2"
          : "flex min-w-0 flex-col gap-1",
        props.className
      )}
    >
      <div
        className={cx(
          "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 select-none",
          props.inline && "truncate"
        )}
      >
        {props.icon} {props.label}
      </div>
      <div className="min-w-0 w-full">
        <input
          className={cx(
            "box-border h-9 min-w-0 w-full rounded-md border px-3 py-0 text-sm leading-5 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1",
            props.align === "center" && "text-center",
            props.align === "right" && "text-right",
            // A three-digit measurement does not need 256px.
            props.numeric && "max-w-[144px] tabular-nums",
            // Chosen, not layered: `bg-stone-50` and `bg-white` have equal
            // specificity, so adding one on top of the other left a derived
            // field looking perfectly typeable.
            props.disabled
              ? "cursor-not-allowed border-stone-300 bg-stone-50 text-stone-700"
              : "border-stone-400 bg-white text-stone-900",
            // A ring is painted outside the box, so flagging a field does not
            // move anything around it.
            props.invalid && "ring-2 ring-red-500"
          )}
          onChange={handleChange}
          value={props.value as string}
          disabled={props.disabled}
        />
      </div>
    </div>
  );
}
