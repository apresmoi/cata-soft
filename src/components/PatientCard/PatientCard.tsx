import cx from "classnames";

export function PatientCard(
  props: React.PropsWithChildren<{ className?: string }>
) {
  return (
    <div
      className={cx(
        "w-full flex flex-col bg-white border border-stone-200 rounded-xl shadow-sm gap-2 p-4",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
