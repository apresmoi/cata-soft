import { useTabs } from "./TabProvider";
import cx from "classnames";
export function TabsHeader() {
  const { tabs, currentTab, setCurrentTab } = useTabs();

  return (
    <div className="flex flex-row border-b border-stone-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setCurrentTab(tab)}
          className={cx(
            "border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
            currentTab === tab
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-stone-500 hover:text-stone-800"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
