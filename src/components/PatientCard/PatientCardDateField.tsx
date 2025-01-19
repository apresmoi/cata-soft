import cx from "classnames";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface PatientCardDateFieldProps {
  icon: React.ReactNode;
  label: string;

  value?: Date | null;
  onChange?: (value: Date) => void;

  className?: string;

  align?: "left" | "center" | "right";
}

export function PatientCardDateField(props: PatientCardDateFieldProps) {
  return (
    <div
      className={cx(
        "w-[100%] flex flex-col gap-2  select-none",
        props.className
      )}
    >
      <div className={cx("flex items-center gap-2")}>
        {props.icon} {props.label}
      </div>
      <div className="w-full">
        <DatePicker
          selected={props.value}
          required
          onChange={(date) => props.onChange?.(date as Date)}
          className="dark:text-stone-100 p-2 outline-none bg-stone-600 w-full rounded-lg"
          dateFormat={"dd/MM/yyyy"}
          wrapperClassName="custom-styles"
          popperClassName="custom-styles"
        />
      </div>
    </div>
  );
}
