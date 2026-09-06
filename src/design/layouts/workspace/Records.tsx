import { useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp, FiEdit3 } from "react-icons/fi";
import { formatDate, KIND_META, type RecordKind, type UnifiedRecord } from "./data";

type SortDirection = "asc" | "desc";

const tableHead = "bg-stone-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500";
const tableCell = "border-t border-stone-200 px-4 py-3 text-sm text-stone-700";

const ALL_KINDS = Object.keys(KIND_META) as RecordKind[];

export default function Records(props: {
  records: UnifiedRecord[];
  onOpen: (kind: RecordKind, id: string) => void;
}) {
  const [selectedKinds, setSelectedKinds] = useState<Set<RecordKind>>(new Set());
  const [query, setQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const counts = useMemo(() => {
    const result: Record<RecordKind, number> = { evolucion: 0, antropometria: 0, interconsulta: 0, internacion: 0, archivo: 0 };
    for (const record of props.records) result[record.kind] += 1;
    return result;
  }, [props.records]);

  function toggleKind(kind: RecordKind) {
    setSelectedKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return props.records.filter((record) => {
      if (selectedKinds.size > 0 && !selectedKinds.has(record.kind)) return false;
      if (!needle) return true;
      return record.titulo.toLowerCase().includes(needle) || record.detalle.toLowerCase().includes(needle);
    });
  }, [props.records, selectedKinds, query]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        sortDirection === "desc" ? b.fecha.getTime() - a.fecha.getTime() : a.fecha.getTime() - b.fecha.getTime(),
      ),
    [filtered, sortDirection],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedKinds(new Set())}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              selectedKinds.size === 0 ? "bg-brand-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Todos ({props.records.length})
          </button>
          {ALL_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => toggleKind(kind)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selectedKinds.has(kind) ? "bg-brand-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {KIND_META[kind].label} ({counts[kind]})
            </button>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar en registros"
        className="w-full max-w-sm rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className={tableHead}>Tipo</th>
              <th className={tableHead}>
                <button
                  type="button"
                  onClick={() => setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))}
                  className="inline-flex items-center gap-1"
                >
                  Fecha {sortDirection === "desc" ? <FiChevronDown /> : <FiChevronUp />}
                </button>
              </th>
              <th className={tableHead}>Registro</th>
              <th className={`${tableHead} text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="border-t border-stone-200 px-4 py-10 text-center text-sm text-stone-500">
                  Ningún registro coincide con el filtro
                </td>
              </tr>
            ) : (
              sorted.map((record) => {
                const meta = KIND_META[record.kind];
                return (
                  <tr
                    key={record.id}
                    onClick={() => props.onOpen(record.kind, record.id)}
                    className="cursor-pointer hover:bg-brand-50"
                  >
                    <td className={`${tableCell} w-40`}>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${meta.chip}`}>
                        {meta.singular}
                      </span>
                    </td>
                    <td className={`${tableCell} w-32 font-medium text-stone-900`}>{formatDate(record.fecha)}</td>
                    <td className={tableCell}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-800">{record.titulo}</span>
                        {record.pendiente ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                            Pendiente
                          </span>
                        ) : null}
                      </div>
                      <div className="truncate text-sm text-stone-500">{record.detalle}</div>
                    </td>
                    <td className={`${tableCell} text-right`}>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          props.onOpen(record.kind, record.id);
                        }}
                        aria-label={`Editar ${meta.singular.toLowerCase()}`}
                        className="inline-flex items-center justify-center rounded-md border border-stone-300 p-2 text-stone-600 hover:bg-stone-100"
                      >
                        <FiEdit3 />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
