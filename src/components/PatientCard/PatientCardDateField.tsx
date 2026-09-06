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
      <div data-skip-autofocus className="w-full">
        <DatePicker
          selected={props.value}
          required
          onChange={(date) => props.onChange?.(date as Date)}
          className="dark:text-stone-100 p-2 outline-none bg-stone-600 w-full rounded-lg"
          dateFormat={"dd/MM/yyyy"}
          wrapperClassName="w-full"
          popperClassName="z-20"
          calendarClassName="bg-white border border-stone-200 rounded-lg shadow-lg text-stone-800"
          weekDayClassName={() => "text-stone-500"}
          monthClassName={() => "text-stone-800"}
          dayClassName={(date) =>
            cx("rounded-md hover:bg-brand-50", {
              "bg-brand-600 text-white hover:bg-brand-600":
                date.toDateString() === props.value?.toDateString(),
            })
          }
        />
      </div>
    </div>
  );
}
