export function TableActionButton(props: React.PropsWithChildren) {
  return (
    <button className="hover:bg-stone-900 p-2 flex items-center gap-2 rounded-lg transition-all duration-300">
      {props.children}
    </button>
  );
}
