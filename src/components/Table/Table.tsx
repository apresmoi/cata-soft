export function Table(props: {
  tableHeaderContent: React.ReactNode;
  tableBody: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full">
          {/*
           * One table, one header. `sticky` keeps it in view while the body
           * scrolls, which is what the old duplicated-header trick emulated --
           * and a single table makes the columns align by construction instead
           * of relying on a second, invisible copy that still took up a row of
           * height once the scroll region stopped being absolutely positioned.
           */}
          <thead className="sticky top-0 z-10">{props.tableHeaderContent}</thead>
          {props.tableBody}
        </table>
      </div>
    </div>
  );
}
