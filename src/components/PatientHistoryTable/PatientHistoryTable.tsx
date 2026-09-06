import { useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";
import { PacienteHistoryItem } from "../../hooks";
import { Table, TableCol } from "../Table";
import { AntropometriaRow } from "./AntropometriaRow";
import { ArchivoAdjuntoRow } from "./ArchivoAdjuntoRow";
import { EvolucionRow } from "./EvolucionRow";
import { HospitalizacionRow } from "./HospitalizacionRow";
import { InterconsultaRow } from "./InterconsultaRow";

const KIND_LABELS: Record<string, string> = {
  evolucion: "Evoluciones",
  interconsulta: "Interconsultas",
  antropometria: "Antropometría",
  hospitalizacion: "Internaciones",
  archivoadjunto: "Archivos",
};

type SortDirection = "asc" | "desc";

/**
 * Returns the comparable timestamp for a history item; each variant keys its
 * own date field, and a missing/invalid date sorts as the oldest.
 */
function getItemTimestamp(item: PacienteHistoryItem): number {
  const raw =
    item.type === "hospitalizacion"
      ? item.fechaIngreso
      : item.type === "archivoadjunto"
        ? item.createdAt
        : item.fecha;
  const date = raw instanceof Date ? raw : new Date(raw);
  return Number.isNaN(date.getTime()) ? -Infinity : date.getTime();
}

// Written once; the shared Table component renders it as the sticky header.
function renderHistoryTableHeader(
  sortDirection: SortDirection,
  onToggleSort: () => void
) {
  return (
    <tr>
      <TableCol component="th" className="text-left w-[100px]">
        <button
          type="button"
          onClick={onToggleSort}
          className="inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label={
            sortDirection === "desc"
              ? "Ordenar por fecha, de más antiguo a más reciente"
              : "Ordenar por fecha, de más reciente a más antiguo"
          }
        >
          Fecha {sortDirection === "desc" ? <FiChevronDown /> : <FiChevronUp />}
        </button>
      </TableCol>
      <TableCol component="th" className="text-left w-[150px]">
        Tipo
      </TableCol>
      <TableCol component="th" className="text-left">
        Contenido
      </TableCol>
      <TableCol component="th" className="text-left w-[50px]"></TableCol>
    </tr>
  );
}

export function PatientHistoryTable(props: {
  history: PacienteHistoryItem[];
  onClick: (id: string) => void;
  /** Controlled search text; the caller applies the actual filtering. */
  search?: string;
  onSearchChange?: (value: string) => void;
  /** Available record kinds for the pill row, e.g. ["evolucion", "archivoadjunto"]. */
  kinds?: string[];
  /** Currently active kind filters; empty (or omitted) means show everything. */
  selectedKinds?: string[];
  onToggleKind?: (kind: string) => void;
}) {
  const hasSearch = props.onSearchChange !== undefined;
  const hasKindFilters = props.kinds !== undefined;
  const showFilterRow = hasSearch || hasKindFilters;
  const selectedKinds = props.selectedKinds ?? [];
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const item of props.history) {
      result[item.type] = (result[item.type] ?? 0) + 1;
    }
    return result;
  }, [props.history]);

  const filteredHistory = useMemo(() => {
    if (selectedKinds.length === 0) return props.history;
    return props.history.filter((item) => selectedKinds.includes(item.type));
  }, [props.history, selectedKinds]);

  const sortedHistory = useMemo(() => {
    const sign = sortDirection === "desc" ? -1 : 1;
    return [...filteredHistory].sort(
      (a, b) => sign * (getItemTimestamp(a) - getItemTimestamp(b))
    );
  }, [filteredHistory, sortDirection]);

  const tableBody = (
    <tbody>
      {sortedHistory.length === 0 ? (
        <tr>
          <td
            colSpan={4}
            className="border-t border-stone-200 px-4 py-10 text-center text-sm text-stone-500"
          >
            Ningún registro coincide con el filtro
          </td>
        </tr>
      ) : (
        sortedHistory.map((row, index) => {
          switch (row.type) {
            case "evolucion":
              return (
                <EvolucionRow
                  key={index}
                  {...row}
                  onClick={props.onClick}
                />
              );
            case "interconsulta":
              return (
                <InterconsultaRow
                  key={index}
                  {...row}
                  onClick={props.onClick}
                />
              );
            case "antropometria":
              return (
                <AntropometriaRow
                  key={index}
                  {...row}
                  onClick={props.onClick}
                />
              );
            case "hospitalizacion":
              return (
                <HospitalizacionRow
                  key={index}
                  {...row}
                  onClick={props.onClick}
                />
              );
            case "archivoadjunto":
              return <ArchivoAdjuntoRow key={index} {...row} />;
            default:
              return null;
          }
        })
      )}
    </tbody>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {showFilterRow ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {hasSearch ? (
            <label className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={props.search ?? ""}
                onChange={(event) => props.onSearchChange?.(event.target.value)}
                placeholder="Buscar en registros"
                className="w-72 rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-800 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </label>
          ) : (
            <div />
          )}
          {hasKindFilters ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  for (const kind of selectedKinds) props.onToggleKind?.(kind);
                }}
                className={`rounded-full px-3 py-1 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                  selectedKinds.length === 0
                    ? "bg-brand-600 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Todos ({props.history.length})
              </button>
              {(props.kinds ?? []).map((kind) => {
                const isSelected = selectedKinds.includes(kind);
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => props.onToggleKind?.(kind)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                      isSelected
                        ? "bg-brand-600 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {KIND_LABELS[kind] ?? kind} ({counts[kind] ?? 0})
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
      <Table
        tableHeaderContent={renderHistoryTableHeader(sortDirection, () =>
          setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))
        )}
        tableBody={tableBody}
      />
    </div>
  );
}
