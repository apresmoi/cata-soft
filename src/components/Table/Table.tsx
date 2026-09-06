export function Table(props: {
  tableHeaderContent: React.ReactNode;
  tableBody: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="pr-4 z-10 bg-stone-100">
        <table className="w-full">
          <thead className="border-b border-stone-200">
            {props.tableHeaderContent}
          </thead>
        </table>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
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
