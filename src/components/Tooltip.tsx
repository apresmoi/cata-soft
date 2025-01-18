import * as RadixTooltip from "@radix-ui/react-tooltip";

interface TooltipProps {
  tooltip: string;
}

export function Tooltip(props: React.PropsWithChildren<TooltipProps>) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>
        <span>{props.children}</span>
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side="right"
          className="bg-stone-900 p-2 text-gray-100"
          sideOffset={5}
        >
          {props.tooltip}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
