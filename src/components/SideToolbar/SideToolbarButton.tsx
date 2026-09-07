import cx from "classnames";

export function SideToolbarButton(
  props: React.PropsWithChildren<{
    variant?: "primary" | "secondary" | "danger" | "warning" | "info";
    onClick?: () => void;
    label?: string;
  }>
) {
  const button = (
    <button
      type="button"
      onClick={props.onClick}
      aria-label={props.label}
      className={cx(
        "h-11 w-11 border rounded-xl flex items-center justify-center text-xl shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
        props.variant === "primary" &&
          "border-vessel-200 bg-vessel-50 text-vessel-700 hover:border-vessel-600 hover:bg-vessel-600 hover:text-white",

        props.variant === "secondary" &&
          "border-stone-200 bg-white text-stone-600 hover:border-stone-500 hover:bg-stone-700 hover:text-white",

        props.variant === "danger" &&
          "border-stone-200 bg-white text-stone-400 hover:border-red-600 hover:bg-red-600 hover:text-white",

        props.variant === "warning" &&
          "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-500 hover:text-white",

        props.variant === "info" &&
          "border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-600 hover:bg-brand-600 hover:text-white"
      )}
    >
      {props.children}
    </button>
  );

  if (!props.label) {
    return button;
  }

  return (
    <div className="group relative">
      {button}
      <span className="pointer-events-none absolute left-full top-1/2 z-40 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {props.label}
      </span>
    </div>
  );
}
