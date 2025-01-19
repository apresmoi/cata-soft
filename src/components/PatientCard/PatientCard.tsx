import cx from "classnames";

export function PatientCard(
  props: React.PropsWithChildren<{ className?: string }>
) {
  return (
    <div
      className={cx(
        "w-full flex flex-col bg-stone-900 gap-2 p-4",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
