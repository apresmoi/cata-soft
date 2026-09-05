import cx from "classnames";
import { usePreservedCaret } from "../../hooks/usePreservedCaret";

interface PatientCardTextAreaFieldProps {
  label?: string;

  value?: string;
  onChange?: (value: string) => void;

  className?: string;

  /** Draw a red ring: a required field left empty on save. */
  invalid?: boolean;
}

export function PatientCardTextAreaField(props: PatientCardTextAreaFieldProps) {
  const { caretProps, remember } = usePreservedCaret<HTMLTextAreaElement>();

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    remember(event.target.selectionStart);
    if (props.onChange) {
      props.onChange(event.target.value);
    }
  };

  return (
    <div className={cx("w-[100%] flex flex-col gap-2", props.className)}>
      {props.label && (
        <div className="text-center pb-2 font-bold  select-none">
          {props.label}
        </div>
      )}
      <textarea
        {...caretProps}
        className={cx(
          "bg-stone-600 h-full outline-0 p-3 resize-none rounded-lg",
          // Painted outside the box, so flagging a field shifts no layout.
          props.invalid && "ring-2 ring-red-500"
        )}
        value={props.value}
        onChange={handleChange}
      />
    </div>
  );
}
