export function DialogFooter(props: React.PropsWithChildren) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-stone-200 px-4 py-3">
      {props.children}
    </div>
  );
}
