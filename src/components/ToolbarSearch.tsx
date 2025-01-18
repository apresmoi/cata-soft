import { Cross1Icon } from "@radix-ui/react-icons";
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
      <input
        ref={ref}
        type="text"
        placeholder={props.legend}
        className="p-2 w-[100%] outline-none text-stone-100 mx-auto bg-stone-600 rounded-lg placeholder-stone-400 "
        value={props.search}
        onChange={handleChange}
      />
      <div className="absolute right-1 top-0 h-full flex items-center">
        {props.search && (
          <button
            className="bg-stone-0 hover:bg-stone-800 text-white p-1 flex items-center gap-2 rounded-lg"
            onClick={handleClearSearch}
          >
            <Cross1Icon />
          </button>
        )}
      </div>
    </div>
  );
}
