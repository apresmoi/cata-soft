import cx from "classnames";

interface PatientCardTextAreaFieldProps {
  label: string;

  value?: string;
  onChange?: (value: string) => void;

  className?: string;
}

export function PatientCardTextAreaField(props: PatientCardTextAreaFieldProps) {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (props.onChange) {
      props.onChange(event.target.value);
    }
  };

  return (
    <div className={cx("w-[100%] flex flex-col gap-2", props.className)}>
      <div className="text-center pb-2 font-bold  select-none">
        {props.label}
      </div>
      <textarea
        className="bg-stone-600 h-full outline-0 p-3 resize-none rounded-lg"
        value={props.value}
        onChange={handleChange}
      />
    </div>
  );
}
