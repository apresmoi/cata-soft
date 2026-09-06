import { TabProvider } from "./TabProvider";
import { TabsHeader } from "./TabsHeader";

export function TabsContainer(props: React.PropsWithChildren) {
  return (
    <TabProvider>
      <div className="flex min-w-0 flex-col gap-2">
        <TabsHeader />
        {props.children}
      </div>
    </TabProvider>
  );
}
