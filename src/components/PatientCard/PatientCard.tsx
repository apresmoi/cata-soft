export function PatientCard(props: React.PropsWithChildren) {
  return (
    <div className="w-full flex flex-col bg-stone-900 gap-2 p-4">
      {props.children}
    </div>
  );
}
