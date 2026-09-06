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
        "w-[100%] flex gap-2",
        props.inline ? "flex-row" : "flex-col",
        props.className
      )}
    >
      <div
        className={cx(
          "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 select-none"
        )}
      >
        {props.icon} {props.label}
      </div>
      <div
        className={cx(
          "w-full",
          // Fixed width so every inline field lines up at the same size.
          props.inline && "ml-auto w-28 shrink-0"
        )}
      >
        <input
          className={cx(
            "w-full border border-stone-300 bg-white text-stone-800 outline-0 p-2 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none",
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
