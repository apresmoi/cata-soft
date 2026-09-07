export type RowProps<P = unknown> = P & { onClick?: (id: string) => void };

export function TableRow(
  props: React.PropsWithChildren<{ onClick?: () => void }>
) {
  return (
    <tr
      onClick={props.onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          props.onClick?.();
        }
      }}
      tabIndex={0}
      role="button"
      className="border-t border-stone-200 hover:bg-brand-50 cursor-pointer"
    >
      {props.children}
    </tr>
  );
}
