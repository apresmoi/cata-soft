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
    <div className={cx("flex min-h-0 w-full flex-1 flex-col gap-1", props.className)}>
      {props.label && (
        <div className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-stone-500 select-none">
          {props.label}
        </div>
      )}
      <textarea
        className={cx(
          // Fills whatever box its parent gives it -- a bounded tab panel or
          // a standalone notes box alike; the parent owns the sizing.
          "block h-full min-h-0 w-full resize-none overflow-y-auto rounded-md border border-stone-400 bg-white px-3 py-2 text-sm leading-6 text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1",
          // Painted outside the box, so flagging a field shifts no layout.
          props.invalid && "ring-2 ring-red-500"
        )}
        value={props.value}
        onChange={handleChange}
      />
    </div>
  );
}
