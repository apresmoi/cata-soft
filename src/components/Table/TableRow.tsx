export type RowProps<P = unknown> = P & { onClick?: (id: string) => void };

export function TableRow(
  props: React.PropsWithChildren<{ onClick?: () => void }>
) {
  return (
    <tr onClick={props.onClick} className="hover:bg-stone-600 cursor-pointer">
      {props.children}
    </tr>
  );
}
