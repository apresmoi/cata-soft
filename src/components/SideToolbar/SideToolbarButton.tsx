import cx from "classnames";

export function SideToolbarButton(
  props: React.PropsWithChildren<{
    variant?: "primary" | "secondary" | "danger" | "warning" | "info";
    onClick?: () => void;
  }>
) {
  return (
    <button
      className={cx(
        "w-[60px] h-[60px] border-2 p-2 rounded-full flex items-center justify-center font-bold text-2xl",
        props.variant === "primary" &&
          "border-green-600 text-green-600 hover:bg-green-800 hover:text-gray-200",

        props.variant === "secondary" &&
          "border-purple-600 text-purple-600 hover:bg-purple-800 hover:text-gray-200",

        props.variant === "danger" &&
          "border-orange-600 text-orange-600 hover:bg-orange-800 hover:text-gray-200",

        props.variant === "warning" &&
          "border-yellow-600 text-yellow-600 hover:bg-yellow-800 hover:text-gray-200",

        props.variant === "info" &&
          "border-blue-600 text-blue-600 hover:bg-blue-800 hover:text-gray-200"
      )}
    >
      {props.children}
    </button>
  );
}
