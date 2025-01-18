export function AppContainer(props: React.PropsWithChildren) {
  return <div className="h-full w-full flex flex-col">{props.children}</div>;
}
