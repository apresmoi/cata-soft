export function Toolbar(props: React.PropsWithChildren) {
  return (
    <div className="toolbar w-full h-[60px] flex p-2 relative gap-4 bg-white border-b border-stone-200">
      {props.children}
    </div>
  );
}
