export function Toolbar(props: React.PropsWithChildren) {
  return (
    <div className="toolbar relative flex h-[60px] w-full items-center gap-4 border-b border-stone-200 bg-white px-3">
      {props.children}
    </div>
  );
}
