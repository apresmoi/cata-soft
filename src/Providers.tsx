import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Providers(props: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>{props.children}</TooltipProvider>
    </QueryClientProvider>
  );
}
