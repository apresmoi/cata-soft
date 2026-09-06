/**
 * Main patients table for the "workspace" layout design board. This is the
 * screen the layout returns to; opening a row hands control to the
 * single-patient workspace via `onOpenPatient`.
 */
import { useState } from "react";
import { FIXTURES } from "../../fixtures";

export default function PatientsTable(props: { onOpenPatient: (id: string) => void }): JSX.Element {
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();
  const pacientes = FIXTURES.pacientes.filter((paciente) => {
    if (!normalized) return true;
    return (
      paciente.nombre.toLowerCase().includes(normalized) ||
      paciente.documento.toLowerCase().includes(normalized)
    );
  });

  return (
    <div className="flex h-full min-h-screen flex-col bg-stone-100">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="CataSoft" className="h-8 w-8" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">CataSoft</p>
            <h1 className="text-lg font-semibold text-stone-900">
              Pacientes <span className="font-normal text-stone-500">({FIXTURES.pacientes.length})</span>
            </h1>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          Nuevo paciente
        </button>
      </header>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="mb-4 max-w-md">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o DNI"
            className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
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
                    <p>{paciente.obraSocial}</p>
                    <p className="text-sm text-stone-500">Nº {paciente.numeroObraSocial}</p>
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
      </div>
    </div>
  );
}
