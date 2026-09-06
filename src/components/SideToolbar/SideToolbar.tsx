export function SideToolbar(props: React.PropsWithChildren) {
  return (
    <div className="w-16 h-full flex flex-col items-center gap-2 py-4 bg-white border-r border-stone-200 select-none">
      {props.children}
    </div>
  );
}
