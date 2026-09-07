import cx from "classnames";

interface PatientCardFieldContainerProps {
  icon: React.ReactNode;
  label: string;

  className?: string;

  disabled?: boolean;
}

export function PatientCardFieldContainer(
  props: React.PropsWithChildren<PatientCardFieldContainerProps>
) {
  return (
    <div className={cx("flex min-w-0 w-full flex-col gap-1", props.className)}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 select-none">
        {props.icon} {props.label}
      </div>
      <div className="min-w-0 w-full">{props.children}</div>
    </div>
  );
}
