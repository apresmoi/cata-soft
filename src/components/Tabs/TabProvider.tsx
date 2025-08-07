import { createContext, useContext, useRef, useState } from "react";

type TabsContextType = {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  registerTab: (tab: string) => void;
  unregisterTab: (tab: string) => void;
  tabs: string[];
};

const TabsContext = createContext<TabsContextType>({
  currentTab: "",
  setCurrentTab: () => {},
  registerTab: () => {},
  unregisterTab: () => {},
  tabs: [],
});

export function useTabs() {
  return useContext(TabsContext);
}

export function TabProvider(props: React.PropsWithChildren) {
  const [currentTab, setCurrentTab] = useState("");
  const [tabs, setTabs] = useState<string[]>([]);
  const tempTabs = useRef<string[]>([]);
  const tempTabsTimeout = useRef<NodeJS.Timeout | null>(null);

  const updateTabs = (newTabs: string[]) => {
    tempTabs.current = newTabs;
    if (tempTabsTimeout.current) {
      clearTimeout(tempTabsTimeout.current);
    }
    tempTabsTimeout.current = setTimeout(() => {
      setTabs(tempTabs.current);
      if (!currentTab) setCurrentTab(tempTabs.current[0]);
    }, 100);
  };

  const registerTab = (tab: string) => {
    updateTabs([...tempTabs.current, tab]);
  };

  const unregisterTab = (tab: string) => {
    updateTabs(tempTabs.current.filter((t) => t !== tab));
  };

  return (
    <TabsContext.Provider
      value={{ currentTab, setCurrentTab, registerTab, unregisterTab, tabs }}
    >
      {props.children}
    </TabsContext.Provider>
  );
}
