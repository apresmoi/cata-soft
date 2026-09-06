import classNames from "classnames";
import { useNavigate } from "react-router-dom";

export function ToolbarButton(
  props: React.PropsWithChildren<{
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
    variant?: "primary" | "secondary" | "warning" | "danger" | "info";
    disabled?: boolean;
  }>
) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (props.disabled) return;
    if (props.onClick) return props.onClick();
    if (props.href) {
      navigate(props.href);
    }
  };

  return (
    <button
      disabled={props.disabled}
      className={classNames(
        "p-2 flex items-center gap-2 rounded-lg select-none transition-all duration-300",

        // Muted and click-through-proof, but the colour stays recognisable.
        props.disabled && "opacity-40 cursor-not-allowed",

        !props.variant && !props.disabled && "hover:bg-stone-900",

        props.variant === "primary" &&
          classNames("bg-green-800", !props.disabled && "hover:bg-green-900 hover:text-gray-200"),

        props.variant === "secondary" &&
          classNames("bg-purple-800", !props.disabled && "hover:bg-purple-900 hover:text-gray-200"),

        props.variant === "danger" &&
          classNames("bg-red-800", !props.disabled && "hover:bg-red-900 hover:text-gray-200"),

        props.variant === "warning" &&
          classNames("bg-yellow-800", !props.disabled && "hover:bg-yellow-900 hover:text-gray-200"),

        props.variant === "info" &&
          classNames("bg-blue-800", !props.disabled && "hover:bg-blue-900 hover:text-gray-200")
      )}
      onClick={handleClick}
    >
      <span className="font-bold rounded-full">{props.icon}</span>
      {props.children}
    </button>
  );
}
