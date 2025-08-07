import { TabProvider } from "./TabProvider";
import { TabsHeader } from "./TabsHeader";

export function TabsContainer(props: React.PropsWithChildren) {
  return (
    <TabProvider>
      <div className="flex flex-col gap-2 w-full h-full">
        <TabsHeader />
        {props.children}
      </div>
    </TabProvider>
  );
}
