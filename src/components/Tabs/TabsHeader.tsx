import { useTabs } from "./TabProvider";
import cx from "classnames";
export function TabsHeader() {
  const { tabs, currentTab, setCurrentTab } = useTabs();

  return (
    <div className="flex h-8 shrink-0 items-stretch gap-1 overflow-x-auto border-b border-stone-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setCurrentTab(tab)}
          className={cx(
            "inline-flex h-8 shrink-0 items-center border-b-2 px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
            currentTab === tab
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-stone-600 hover:bg-stone-50 hover:text-stone-900"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
