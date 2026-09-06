import cx from "classnames";

interface PatientCardTextAreaFieldProps {
  label?: string;

  value?: string;
  onChange?: (value: string) => void;

  className?: string;

  /** Draw a red ring: a required field left empty on save. */
  invalid?: boolean;
}

export function PatientCardTextAreaField(props: PatientCardTextAreaFieldProps) {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (props.onChange) {
      props.onChange(event.target.value);
    }
  };

  return (
    <div className={cx("flex w-full flex-col gap-1.5", props.className)}>
      {props.label && (
        <div className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-stone-500 select-none">
          {props.label}
        </div>
      )}
      <textarea
        className={cx(
          "min-h-[8rem] w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none",
          // Painted outside the box, so flagging a field shifts no layout.
          props.invalid && "ring-2 ring-red-500"
        )}
        value={props.value}
        onChange={handleChange}
      />
    </div>
  );
}
