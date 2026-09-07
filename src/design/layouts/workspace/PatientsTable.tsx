/**
 * Main patients table for the "workspace" layout design board. This is the
 * screen the layout returns to; opening a row hands control to the
 * single-patient workspace via `onOpenPatient`.
 */
import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { type PatientData } from "./data";
export default function PatientsTable(props: {
  pacientes: PatientData[];
  onOpenPatient: (id: string) => void;
  onCreatePatient: () => void;
}): JSX.Element {
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();
  const pacientes = props.pacientes.filter((paciente) => {
    if (!normalized) return true;
    return (
      paciente.nombre.toLowerCase().includes(normalized) ||
      paciente.documento.toLowerCase().includes(normalized)
    );
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-stone-100">
      {/* One row only: wordmark, the search this screen exists for, the
          filtered count, and the primary action. */}
      <header className="flex items-center gap-4 border-b border-stone-200 bg-white px-5 py-2.5">
        <div className="flex shrink-0 items-center gap-2">
          <img src="/icon.png" alt="" className="h-7 w-7" />
          <h1 className="text-sm font-bold uppercase tracking-wide text-stone-900">CataSoft</h1>
        </div>

        <label className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o DNI"
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm text-stone-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </label>

        <button
          type="button"
          onClick={props.onCreatePatient}
          className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          Nuevo paciente
        </button>
      </header>

      {/* The card fills the area under the header and scrolls internally, so
          the table never floats above dead space. */}
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="bg-stone-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Paciente
                </th>
                <th className="bg-stone-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Edad
                </th>
                <th className="bg-stone-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Obra social
                </th>
                <th className="bg-stone-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Contacto
                </th>
                <th className="bg-stone-100 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr
                  key={paciente.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Abrir historia de ${paciente.nombre}`}
                  onClick={() => props.onOpenPatient(paciente.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      props.onOpenPatient(paciente.id);
                    }
                  }}
                  className="cursor-pointer hover:bg-brand-50 focus:bg-brand-50 focus:outline-none"
                >
                  <td className="border-t border-stone-200 px-4 py-3 text-sm text-stone-700">
                    <p className="font-medium text-stone-800">{paciente.nombre}</p>
                    <p className="text-sm text-stone-500">DNI {paciente.documento}</p>
                  </td>
                  <td className="border-t border-stone-200 px-4 py-3 text-sm text-stone-700">{paciente.edad}</td>
                  <td className="border-t border-stone-200 px-4 py-3 text-sm text-stone-700">
                    <p>{paciente.obraSocial || <span className="text-stone-400">Sin obra social</span>}</p>
                    {paciente.numeroObraSocial ? (
                      <p className="text-sm text-stone-500">Nº {paciente.numeroObraSocial}</p>
                    ) : null}
                  </td>
                  <td className="border-t border-stone-200 px-4 py-3 text-sm text-stone-700">
                    <p>{paciente.telefono}</p>
                    <p className="text-sm text-stone-500">{paciente.email}</p>
                  </td>
                  <td className="border-t border-stone-200 px-4 py-3 text-right text-sm text-stone-700">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        props.onOpenPatient(paciente.id);
                      }}
                      className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                    >
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
              {pacientes.length === 0 && (
                <tr>
                  <td colSpan={5} className="border-t border-stone-200 px-4 py-8 text-center text-sm text-stone-500">
                    Ningún paciente coincide con la búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          {/* Row count belongs to the table, not the header. Sits outside the
              scroll area so it stays visible while the list scrolls. */}
          <footer className="shrink-0 border-t border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-500">
            {pacientes.length} {pacientes.length === 1 ? "paciente" : "pacientes"}
            {pacientes.length !== props.pacientes.length ? ` de ${props.pacientes.length}` : ""}
          </footer>
        </div>
      </div>
    </div>
  );
}
