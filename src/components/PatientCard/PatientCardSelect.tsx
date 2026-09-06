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
    <div className={cx("flex w-full flex-col gap-1.5", props.className)}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 select-none">
        {props.icon} {props.label}
      </div>
      <div className="w-full">
        <select
          className="w-full cursor-pointer rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
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
