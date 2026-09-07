import { Children, isValidElement } from "react";
import { TabProvider } from "./TabProvider";
import { TabsHeader } from "./TabsHeader";

/** Reads the tab names off the `Tab` children, in the order they are written. */
function tabNames(children: React.ReactNode): string[] {
  const names: string[] = [];
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;
    const { props } = child;
    if (props && typeof props === "object" && "name" in props) {
      const { name } = props;
      if (typeof name === "string" && name.length > 0) names.push(name);
    }
  }
  return names;
}

export function TabsContainer(props: React.PropsWithChildren) {
  return (
    <TabProvider tabs={tabNames(props.children)}>
      <div className="flex min-w-0 flex-col gap-2">
        <TabsHeader />
        {props.children}
      </div>
    </TabProvider>
  );
}
