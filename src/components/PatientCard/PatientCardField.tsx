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
  inlineFieldMaxWidth?: number;
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
      <div className={cx("flex items-center gap-2 select-none")}>
        {props.icon} {props.label}
      </div>
      <div
        className={cx(
          "w-full",
          props.inlineFieldMaxWidth
            ? `max-w-[${props.inlineFieldMaxWidth}%] ml-auto`
            : ""
        )}
      >
        <input
          className={cx(
            "w-full bg-stone-600 outline-0 p-2 rounded-lg",
            props.align === "center" && "text-center",
            props.align === "right" && "text-right"
          )}
          onChange={handleChange}
          value={props.value as string}
          disabled={props.disabled}
        />
      </div>
    </div>
  );
}
