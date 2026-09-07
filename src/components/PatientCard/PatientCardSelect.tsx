import cx from "classnames";

interface PatientCardSelectProps<T> {
  icon: React.ReactNode;
  label: string;

  value?: T;
  onChange?: (value: T) => void;

  className?: string;

  /** Label beside the control instead of above it, as in the other fields. */
  inline?: boolean;

  disabled?: boolean;

  options?: { value: string; label: string }[];
}

export function PatientCardSelect<T>(props: PatientCardSelectProps<T>) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (props.onChange) {
      props.onChange(event.target.value as T);
    }
  };

  return (
    <div
      className={cx(
        // Same row geometry as the other inline fields: a fixed 64px label
        // column plus a filling control column.
        props.inline
          ? "grid min-w-0 grid-cols-[64px_minmax(0,1fr)] items-center gap-x-2"
          : "flex min-w-0 w-full flex-col gap-1",
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
        <select
          className={cx(
            "box-border h-9 min-w-0 w-full rounded-md border px-3 py-0 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1",
            // Chosen, not layered: `bg-stone-50` and `bg-white` have equal
            // specificity, so adding one on top of the other left a derived
            // field looking perfectly typeable.
            props.disabled
              ? "cursor-not-allowed border-stone-300 bg-stone-50 text-stone-700"
              : "cursor-pointer border-stone-400 bg-white text-stone-900"
          )}
          onChange={handleChange}
          value={props.value as string}
          disabled={props.disabled}
        >
          {props.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
