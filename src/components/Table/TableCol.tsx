import classNames from "classnames";

export function TableCol(
  props: React.PropsWithChildren<{
    component?: "td" | "th";
    className?: string;
  }>
) {
  const Component = props.component || "td";

  return (
    <Component className={classNames("p-3 whitespace-nowrap", props.className)}>
      <div className="text-ellipsis overflow-hidden">{props.children}</div>
    </Component>
  );
}
