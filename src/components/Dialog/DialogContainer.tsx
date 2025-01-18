import cx from "classnames";
import * as RadixDialog from "@radix-ui/react-dialog";

export function DialogContainer(
  props: React.PropsWithChildren<{
    className?: string;
  }>
) {
  return (
    <RadixDialog.Portal>
      <div className="absolute inset-0 z-50">
        <RadixDialog.Overlay className="absolute top-0 left-0 right-0 bottom-0 bg-black/60"></RadixDialog.Overlay>
        <div className="z-50 h-full w-full overflow-y-auto flex">
          <RadixDialog.Content
            className={cx(
              "popover relative m-auto min-w-[50%] max-w-[680px] bg-stone-800 rounded-lg",
              props.className
            )}
          >
            {props.children}
          </RadixDialog.Content>
        </div>
      </div>
    </RadixDialog.Portal>
  );
}
