import classNames from "classnames";

export function TableCol(
  props: React.PropsWithChildren<{
    component?: "td" | "th";
    className?: string;
  }>
) {
  const Component = props.component || "td";

  return (
    <Component
      className={classNames(
        "whitespace-nowrap",
        Component === "th"
          ? "bg-stone-100 p-3 text-xs font-semibold uppercase tracking-wide text-stone-500"
          : "border-t border-stone-200 p-3 text-sm text-stone-700",
        props.className
      )}
    >
      <div className="text-ellipsis overflow-hidden">{props.children}</div>
    </Component>
  );
}
