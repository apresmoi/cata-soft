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
        // `th` defaults to centred text while `td` is left, which made every
        // header sit off from its column. Align both the same; a caller's own
        // `text-center`/`text-right` still wins, since className comes last.
        Component === "th"
          ? "border-b border-stone-200 bg-stone-100 p-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500"
          : "border-t border-stone-200 p-3 text-left text-sm text-stone-700",
        props.className
      )}
    >
      <div className="text-ellipsis overflow-hidden">{props.children}</div>
    </Component>
  );
}
