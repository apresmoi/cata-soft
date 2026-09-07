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
        "p-2 flex items-center gap-2 rounded-lg select-none transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",

        // Muted and click-through-proof, but the colour stays recognisable.
        props.disabled && "opacity-40 cursor-not-allowed",

        !props.variant && classNames("text-stone-700", !props.disabled && "hover:bg-stone-100"),

        props.variant === "primary" &&
          classNames("bg-brand-600 text-white", !props.disabled && "hover:bg-brand-700"),

        props.variant === "secondary" &&
          classNames("bg-vessel-600 text-white", !props.disabled && "hover:bg-vessel-700"),

        props.variant === "danger" &&
          classNames("bg-red-600 text-white", !props.disabled && "hover:bg-red-700"),

        props.variant === "warning" &&
          classNames("bg-amber-500 text-white", !props.disabled && "hover:bg-amber-600"),

        props.variant === "info" &&
          classNames("bg-stone-700 text-white", !props.disabled && "hover:bg-stone-800")
      )}
      onClick={handleClick}
    >
      <span className="font-bold rounded-full">{props.icon}</span>
      {props.children}
    </button>
  );
}
