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
      className={cx("flex min-w-0 w-full flex-col gap-1 select-none", props.className)}
    >
      <div className={cx("flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500")}>
        {props.icon} {props.label}
      </div>
      <div data-skip-autofocus className="min-w-0 w-full">
        <DatePicker
          selected={props.value}
          required
          onChange={(date) => props.onChange?.(date as Date)}
          className={cx(
            "box-border h-9 min-w-0 w-full rounded-md border border-stone-400 bg-white px-3 py-0 text-sm leading-5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1",
            props.align === "center" && "text-center",
            props.align === "right" && "text-right"
          )}
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
