export function AppContainer(props: React.PropsWithChildren) {
  return <div className="h-full w-full flex flex-col bg-stone-100 text-stone-900">{props.children}</div>;
}
