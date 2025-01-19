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
    <div className={cx("w-[100%] flex flex-col gap-2", props.className)}>
      <div className={cx("flex items-center gap-2  select-none")}>
        {props.icon} {props.label}
      </div>
      <div className="w-full">
        <DatePicker
          selected={value}
          required
          onChange={(date) => props.onChange?.(date as Date)}
          className="dark:text-stone-100 p-2 outline-none bg-stone-600 w-full rounded-lg"
          dateFormat={"dd/MM/yyyy"}
          wrapperClassName="custom-styles w-full"
          popperClassName="custom-styles z-20"
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="flex justify-between px-2">
              <button
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="outline-none bg-stone-600 text-stone-100 hover:bg-stone-800 rounded-lg p-2"
              >
                <ChevronLeftIcon />
              </button>
              <select
                value={getYear(date)}
                onChange={({ target: { value } }) => changeYear(Number(value))}
                className="outline-none bg-stone-600 text-stone-100  rounded-sm px-2"
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
                className="outline-none bg-stone-600 text-stone-100  rounded-sm px-4"
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
                className="outline-none bg-stone-600 text-stone-100 hover:bg-stone-800 rounded-lg p-2"
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
