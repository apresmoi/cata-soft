import cx from "classnames";

export function PatientCard(
  props: React.PropsWithChildren<{ className?: string }>
) {
  return (
    /*
     * Layout only: no border, background or shadow. Every caller is inside a
     * dialog body, which is already the white panel, and each field draws its
     * own border -- wrapping them in a bordered card double-framed every form.
     */
    <div className={cx("flex w-full flex-col gap-3", props.className)}>
      {props.children}
    </div>
  );
}
