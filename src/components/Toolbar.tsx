export function Toolbar(props: React.PropsWithChildren) {
  return (
    <div className="toolbar w-screen h-[60px] gap-0 flex p-2 relative gap-4">
      {props.children}
    </div>
  );
}
