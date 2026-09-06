import cx from "classnames";

interface PatientCardSelectProps<T> {
  icon: React.ReactNode;
  label: string;

  value?: T;
  onChange?: (value: T) => void;

  className?: string;

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
    <div className={cx("w-[100%] flex flex-col gap-2", props.className)}>
      <div className={cx("flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 select-none")}>
        {props.icon} {props.label}
      </div>
      <div className="w-full">
        <select
          className={cx(
            "w-full border border-stone-300 bg-white text-stone-800 outline-0 p-2 rounded-lg cursor-pointer focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
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
