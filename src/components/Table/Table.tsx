export function Table(props: {
  tableHeaderContent: React.ReactNode;
  tableBody: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="pr-4 z-10 bg-stone-900">
        <table className="w-full">
          <thead className="border-b border-stone-600">
            {props.tableHeaderContent}
          </thead>
        </table>
      </div>
      <div className="absolute w-full h-full overflow-y-auto">
        <table className="w-full">
          <thead className="invisible max-h-0 h-0">
            {props.tableHeaderContent}
          </thead>
          {props.tableBody}
        </table>
      </div>
    </div>
  );
}
