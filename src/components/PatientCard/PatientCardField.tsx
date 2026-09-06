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
        "flex w-full gap-1.5",
        props.inline ? "flex-row" : "flex-col",
        props.className
      )}
    >
      <div
        className={cx(
          "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 select-none",
          // `flex-1` keeps the label's share of the row; `min-w-0` + `truncate`
          // alone collapsed it to nothing beside the fixed-width input.
          props.inline && "min-w-0 flex-1 truncate"
        )}
      >
        {props.icon} {props.label}
      </div>
      <div
        className={cx(
          "w-full min-w-0",
          // Fixed width so every inline field lines up at the same size.
          props.inline && "ml-auto w-28 shrink-0"
        )}
      >
        <input
          className={cx(
            "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none",
            props.align === "center" && "text-center",
            props.align === "right" && "text-right",
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
