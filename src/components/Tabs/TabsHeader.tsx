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
            "px-4 py-2 border-b w-full whitespace-nowrap hover:bg-stone-500/10 transition-colors",
            currentTab === tab
              ? "border-brand-600 text-brand-600 font-semibold"
              // `text-current` so the header reads on a dark panel and on a
              // light one: it inherits the surrounding text colour instead of
              // hard-coding white, which was invisible on light surfaces.
              : "border-stone-300 text-current opacity-60 hover:opacity-100"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
