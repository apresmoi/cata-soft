export function TableActionButton(
  props: React.PropsWithChildren<{ onClick?: () => void; label?: string }>
) {
  return (
    <button
      onClick={props.onClick}
      aria-label={props.label}
      className="rounded-md border border-stone-300 bg-white p-2 text-stone-600 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 flex items-center gap-2 transition-all duration-300"
    >
      {props.children}
    </button>
  );
}
