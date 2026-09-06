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
    <div className={cx("w-[100%] flex flex-col gap-2", props.className)}>
      {props.label && (
        <div className="text-center pb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 select-none">
          {props.label}
        </div>
      )}
      <textarea
        className={cx(
          "border border-stone-300 bg-white text-stone-800 h-full outline-0 p-3 resize-none rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none",
          // Painted outside the box, so flagging a field shifts no layout.
          props.invalid && "ring-2 ring-red-500"
        )}
        value={props.value}
        onChange={handleChange}
      />
    </div>
  );
}
