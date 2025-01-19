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
        "p-2 flex items-center gap-2 rounded-lg select-none",

        !props.variant && "hover:bg-stone-900",

        props.variant === "primary" &&
          "bg-green-800 hover:bg-green-900 hover:text-gray-200",

        props.variant === "secondary" &&
          "bg-purple-800 hover:bg-purple-900 hover:text-gray-200",

        props.variant === "danger" &&
          "bg-red-800 hover:bg-red-900 hover:text-gray-200",

        props.variant === "warning" &&
          "bg-yellow-800 hover:bg-yellow-900 hover:text-gray-200",

        props.variant === "info" &&
          "bg-blue-800 hover:bg-blue-900 hover:text-gray-200",

        props.disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
