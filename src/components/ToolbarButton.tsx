import classNames from "classnames";
import { useNavigate } from "react-router-dom";

export function ToolbarButton(
  props: React.PropsWithChildren<{
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
    variant?: "primary" | "secondary" | "warning" | "danger" | "info";
  }>
) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (props.onClick) return props.onClick();
    if (props.href) {
      navigate(props.href);
    }
  };

  return (
    <button
      className={classNames(
        "p-2 flex items-center gap-2 rounded-lg select-none transition-all duration-300",

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
          "bg-blue-800 hover:bg-blue-900 hover:text-gray-200"
      )}
      onClick={handleClick}
    >
      <span className="font-bold rounded-full">{props.icon}</span>
      {props.children}
    </button>
  );
}
