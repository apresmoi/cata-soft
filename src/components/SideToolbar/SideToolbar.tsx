export function SideToolbar(props: React.PropsWithChildren) {
  return (
    <div className="w-[80px] h-full flex flex-col p-2 gap-2 bg-stone-900 select-none">
      {props.children}
    </div>
  );
}
