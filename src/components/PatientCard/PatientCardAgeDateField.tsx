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
        "flex w-full gap-1.5",
        props.className,
        props.inline ? "flex-row" : "flex-col"
      )}
    >
      <div
        className={cx(
          "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500",
          // `flex-1` so the label keeps its share of the row: `min-w-0` with
          // `truncate` alone let it shrink to nothing next to the fixed-width
          // input, and the label disappeared entirely.
          props.inline && "min-w-0 flex-1 truncate"
        )}
      >
        {props.icon} {props.label}
      </div>
      <div
        data-skip-autofocus
        className={cx(
          "w-full min-w-0",
          // Same fixed width as the other inline fields so they all line up.
          props.inline && "ml-auto w-28 shrink-0"
        )}
      >
        <DatePicker
          selected={value}
          required
          onChange={(date) => props.onChange?.(date as Date)}
          className={cx(
            "border border-stone-300 bg-white text-stone-800 p-2 outline-none w-full rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none",
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
