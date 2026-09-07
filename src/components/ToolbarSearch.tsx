import { Cross1Icon } from "@radix-ui/react-icons";
import { FiSearch } from "react-icons/fi";
import React from "react";

export function ToolbarSearch(
  props: React.PropsWithChildren<{
    search?: string;
    onChange?: (search: string) => void;
    legend: string;
  }>
) {
  const ref = React.useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange) {
      props.onChange(event.target.value);
    }
  };

  const handleClearSearch = () => {
    if (props.onChange) {
      props.onChange("");
      ref.current?.focus();
    }
  };

  return (
    <div className="relative">
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        ref={ref}
        type="text"
        placeholder={props.legend}
        className="p-2 pl-9 w-[100%] mx-auto rounded-lg border border-stone-300 bg-white text-stone-800 placeholder-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
        value={props.search}
        onChange={handleChange}
      />
      <div className="absolute right-1 top-0 h-full flex items-center">
        {props.search && (
          <button
            className="text-stone-400 hover:bg-stone-100 hover:text-stone-700 p-1 flex items-center gap-2 rounded-lg transition-all duration-300"
            onClick={handleClearSearch}
          >
            <Cross1Icon />
          </button>
        )}
      </div>
    </div>
  );
}
