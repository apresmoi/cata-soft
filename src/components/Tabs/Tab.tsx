import { useEffect, useRef } from "react";
import { useTabs } from "./TabProvider";
import { useFocusFirstField } from "../../hooks/useFocusFirstField";

type TabProps = {
  name: string;
};

export function Tab(props: React.PropsWithChildren<TabProps>) {
  const { name } = props;
  const { currentTab, registerTab, unregisterTab } = useTabs();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerTab(name);
    return () => unregisterTab(name);
  }, [name]);

  // Inactive tabs unmount, so this also covers switching tabs: the newly
  // shown panel mounts and takes the cursor.
  useFocusFirstField(contentRef, currentTab);

  if (currentTab !== name) return null;

  return (
    <div ref={contentRef} className="h-[clamp(224px,32vh,320px)] min-w-0 flex flex-col">
      {props.children}
    </div>
  );
}
