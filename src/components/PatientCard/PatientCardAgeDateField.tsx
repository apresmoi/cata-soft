import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
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

  inline?: boolean;
}

const yearNow = new Date().getFullYear();
const years = new Array(new Date().getFullYear() - 1900)
  .fill(0)
  .map((_, i) => yearNow - i);

const months = [
  "ENE",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

const getYear = (date: Date) => date.getFullYear();
const getMonth = (date: Date) => months[date.getMonth()];

export function PatientCardAgeDateField(props: PatientCardDateFieldProps) {
  const { value } = props;

  return (
    <div
      className={cx(
        props.inline
          ? "grid min-w-0 grid-cols-[64px_minmax(0,1fr)] items-center gap-x-2"
          : "flex min-w-0 flex-col gap-1",
        props.className
      )}
    >
      <div
        className={cx(
          "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500",
          props.inline && "truncate"
        )}
      >
        {props.icon} {props.label}
      </div>
      <div data-skip-autofocus className="min-w-0 w-full">
        <DatePicker
          selected={value}
          required
          onChange={(date) => props.onChange?.(date as Date)}
          className={cx(
            "box-border h-9 min-w-0 w-full rounded-md border border-stone-400 bg-white px-3 py-0 text-sm leading-5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1",
            props.align === "right" ? "text-right" : ""
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
                date.toDateString() === value?.toDateString(),
            })
          }
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="flex justify-between px-2 py-2">
              <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="outline-none bg-white text-stone-700 hover:bg-brand-50 rounded-lg p-2 transition-all duration-300"
              >
                <ChevronLeftIcon />
              </button>
              <select
                value={getYear(date)}
                onChange={({ target: { value } }) => changeYear(Number(value))}
                className="outline-none bg-white text-stone-800 rounded-sm px-2"
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={getMonth(date)}
                onChange={({ target: { value } }) =>
                  changeMonth(months.indexOf(value))
                }
                className="outline-none bg-white text-stone-800 rounded-sm px-4"
              >
                {months.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <button
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="outline-none bg-white text-stone-700 hover:bg-brand-50 rounded-lg p-2"
              >
                <ChevronRightIcon />
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
