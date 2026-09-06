import cx from "classnames";

export function DialogButton(
  props: React.PropsWithChildren<{
    onClick?: () => void;
    variant?: "primary" | "secondary" | "warning" | "danger" | "info";
    disabled?: boolean;
  }>
) {
  return (
    <button
      disabled={props.disabled}
      className={cx(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium select-none transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",

        !props.variant &&
          "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50",

        props.variant === "primary" && "bg-brand-600 text-white hover:bg-brand-700",

        props.variant === "secondary" &&
          "bg-stone-600 text-white hover:bg-stone-700",

        props.variant === "danger" && "bg-red-600 text-white hover:bg-red-700",

        props.variant === "warning" &&
          "bg-amber-600 text-white hover:bg-amber-700",

        props.variant === "info" &&
          "bg-vessel-600 text-white hover:bg-vessel-700",

        props.disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
