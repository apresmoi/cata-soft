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
      className={cx("flex w-full flex-col gap-1.5 select-none", props.className)}
    >
      <div className={cx("flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500")}>
        {props.icon} {props.label}
      </div>
      <div data-skip-autofocus className="w-full">
        <DatePicker
          selected={props.value}
          required
          onChange={(date) => props.onChange?.(date as Date)}
          className="border border-stone-300 bg-white text-stone-800 p-2 outline-none w-full rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
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
