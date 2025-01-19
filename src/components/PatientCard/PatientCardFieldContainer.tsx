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
    <div className={cx("w-[100%] flex flex-col gap-2", props.className)}>
      <div className={cx("flex items-center gap-2")}>
        {props.icon} {props.label}
      </div>
      <div className="w-full">{props.children}</div>
    </div>
  );
}
