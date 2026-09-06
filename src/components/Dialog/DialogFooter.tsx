export function DialogFooter(props: React.PropsWithChildren) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-stone-200 px-5 py-4">
      {props.children}
    </div>
  );
}
