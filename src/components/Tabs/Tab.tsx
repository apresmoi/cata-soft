import { useEffect } from "react";
import { useTabs } from "./TabProvider";

type TabProps = {
  name: string;
};

export function Tab(props: React.PropsWithChildren<TabProps>) {
  const { name } = props;
  const { currentTab, registerTab, unregisterTab } = useTabs();

  useEffect(() => {
    registerTab(name);
    return () => unregisterTab(name);
  }, [name]);

  if (currentTab !== name) return null;

  return (
    <div className="flex flex-col gap-2 h-full">
      {currentTab === props.name && props.children}
    </div>
  );
}
