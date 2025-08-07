import { useTabs } from "./TabProvider";
import cx from "classnames";
export function TabsHeader() {
  const { tabs, currentTab, setCurrentTab } = useTabs();

  return (
    <div className="flex flex-row">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setCurrentTab(tab)}
          className={cx(
            "px-4 py-2 border-b w-full whitespace-nowrap hover:bg-gray-500/10 transition-all duration-300",
            currentTab === tab
              ? "border-blue-500 text-blue-500"
              : "border-gray-200 text-white"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
