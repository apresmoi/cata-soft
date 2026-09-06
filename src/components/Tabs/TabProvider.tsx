import { createContext, useContext, useState } from "react";

type TabsContextType = {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  tabs: string[];
};

const TabsContext = createContext<TabsContextType>({
  currentTab: "",
  setCurrentTab: () => {},
  tabs: [],
});

export function useTabs() {
  return useContext(TabsContext);
}

/**
 * Tab names come from the container, which reads them off its children, so the
 * active tab is known on the very first render.
 *
 * They used to be self-registered by each `Tab` from an effect, collected
 * through a 100ms debounce. Until that timeout fired no tab matched
 * `currentTab`, so every panel rendered `null`: a dialog opened short and
 * empty and then jumped to its real size once the timer resolved. Deriving the
 * names during render removes the frame gap entirely rather than shortening it.
 */
export function TabProvider(props: React.PropsWithChildren<{ tabs: string[] }>) {
  const { tabs } = props;
  const [selected, setSelected] = useState("");

  // Fall back to the first tab instead of storing it, so the provider stays
  // correct if the set of tabs changes.
  const currentTab = selected && tabs.includes(selected) ? selected : (tabs[0] ?? "");

  return (
    <TabsContext.Provider value={{ currentTab, setCurrentTab: setSelected, tabs }}>
      {props.children}
    </TabsContext.Provider>
  );
}
