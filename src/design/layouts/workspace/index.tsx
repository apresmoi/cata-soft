import React, { useMemo, useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronDown,
  FiChevronRight,
  FiDownload,
  FiEdit3,
  FiPlus,
  FiPrinter,
  FiX,
} from "react-icons/fi";
import { FIXTURES } from "../../fixtures";
import Sparkline from "./Sparkline";
import {
  ArchivoFormBar,
  AntropometriaFormBar,
  EvolucionFormBar,
  InterconsultaFormBar,
  InternacionFormBar,
} from "./Forms";
import {
  daysBetween,
  formatDate,
  initialArchivos,
  initialAntropometria,
  initialEvoluciones,
  initialInterconsultas,
  initialInternaciones,
  novedades,
  TAB_META,
  type ArchivoRow,
  type AntropometriaRow,
  type EvolucionRow,
  type InterconsultaRow,
  type InternacionRow,
  type TabId,
} from "./data";

type FormOpenState = Record<Exclude<TabId, "resumen">, boolean>;
type SortDirection = "asc" | "desc";
type ExportSections = {
  resumen: boolean;
  evoluciones: boolean;
  antropometria: boolean;
  interconsultas: boolean;
  internaciones: boolean;
  archivos: boolean;
};

const patient = FIXTURES.paciente;
const shellButton = "inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50";
const tableHead = "bg-stone-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500";
const tableCell = "border-t border-stone-200 px-4 py-3 text-sm text-stone-700";

function Header(props: { onExport: () => void; onToggleDemographics: () => void; showDemographics: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h1 className="truncate text-xl font-bold tracking-tight text-stone-950">{patient.nombre}</h1>
            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">{patient.edad} años</span>
            <span className="text-sm text-stone-500">DNI {patient.documento}</span>
            <span className="text-sm text-stone-500">
              {patient.obraSocial} · Nº {patient.numeroObraSocial}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-stone-500">
            {patient.direccion} · {patient.telefono} · {patient.email}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={props.onToggleDemographics} className={shellButton}>
            <FiEdit3 /> {props.showDemographics ? "Ocultar datos" : "Editar datos"}
          </button>
          <button onClick={props.onExport} className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">
            <FiPrinter /> Exportar resumen
          </button>
        </div>
      </div>
    </header>
  );
}

function DemographicsStrip() {
  return (
    <section className="border-b border-stone-200 bg-stone-50 px-5 py-3">
      <div className="grid grid-cols-5 gap-3 text-sm">
        {[
          ["Fecha de nacimiento", formatDate(patient.fechaNacimiento)],
          ["Dirección", patient.direccion],
          ["Teléfono", patient.telefono],
          ["Email", patient.email],
          ["Alta en sistema", formatDate(patient.createdAt)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">{label}</div>
            <div className="mt-1 truncate font-medium text-stone-800">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Tabs(props: { active: TabId; counts: Record<TabId, number>; onChange: (tab: TabId) => void }) {
  return (
    <nav className="border-b border-stone-200 bg-white px-5">
      <div className="flex gap-1">
        {TAB_META.map((tab) => {
          const selected = props.active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => props.onChange(tab.id)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
                selected ? "border-teal-700 text-teal-800" : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${selected ? "bg-teal-100 text-teal-800" : "bg-stone-100 text-stone-500"}`}>
                {props.counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function StatCard(props: { label: string; value: string; hint: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{props.label}</div>
      <div className="mt-2 text-2xl font-bold text-stone-950">{props.value}</div>
      <div className="mt-1 text-sm text-stone-500">{props.hint}</div>
      {props.children ? <div className="mt-3">{props.children}</div> : null}
    </div>
  );
}

function SummaryTab(props: { antropometria: AntropometriaRow[]; interconsultas: InterconsultaRow[]; evoluciones: EvolucionRow[] }) {
  const latestAnthro = props.antropometria[props.antropometria.length - 1];
  const previousAnthro = props.antropometria[props.antropometria.length - 2];
  const delta = latestAnthro.imc - previousAnthro.imc;
  const pending = props.interconsultas.filter((row) => row.estado === "pendiente");
  const latestVisit = props.evoluciones.reduce((latest, row) => (row.fecha > latest.fecha ? row : latest), props.evoluciones[0]);

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Última visita" value={formatDate(latestVisit.fecha)} hint={latestVisit.motivo} />
        <StatCard label="Peso" value={`${latestAnthro.peso.toFixed(1)} kg`} hint={`Talla ${latestAnthro.talla.toFixed(2)} m`} />
        <StatCard label="IMC" value={latestAnthro.imc.toFixed(1)} hint={`${delta <= 0 ? "Bajó" : "Subió"} ${Math.abs(delta).toFixed(1)} desde el control previo`}>
          <div className="flex items-center gap-3">
            <Sparkline values={props.antropometria.map((row) => row.imc)} width={120} height={34} />
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${delta <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {delta <= 0 ? <FiArrowDown /> : <FiArrowUp />} {delta.toFixed(1)}
            </span>
          </div>
        </StatCard>
        <StatCard label="Pendientes" value={String(pending.length)} hint="Interconsultas sin respuesta" />
      </div>

      <div className="grid min-h-0 grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="grid min-h-0 grid-rows-[auto_1fr] gap-4">
          <div className="grid grid-cols-2 gap-4">
            <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">Antecedentes</h3>
              <p className="mt-3 text-sm leading-6 text-stone-700">{patient.antecedentes}</p>
            </article>
            <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">Medicación habitual</h3>
              <p className="mt-3 text-sm leading-6 text-stone-700">{patient.medicacionHabitual}</p>
            </article>
          </div>
          <section className="min-h-0 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">Últimas novedades</h3>
            <div className="mt-4 space-y-3 overflow-auto pr-2">
              {novedades.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-lg border border-stone-100 bg-stone-50 p-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-600" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{formatDate(item.fecha)}</div>
                    <div className="text-sm text-stone-700">{item.texto}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <section className="min-h-0 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-amber-800">Items abiertos</h3>
          <div className="mt-4 space-y-3 overflow-auto pr-2">
            {pending.map((item) => (
              <div key={item.id} className="rounded-lg border border-amber-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-stone-800">{item.especialidad}</div>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">Pendiente</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.notas}</p>
                <button className="mt-3 rounded-md border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-200">
                  Marcar respuesta recibida
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function AddButton(props: { label: string; onClick: () => void }) {
  return (
    <button onClick={props.onClick} className="mb-4 inline-flex items-center gap-2 rounded-md bg-stone-900 px-3 py-2 text-sm font-semibold text-white hover:bg-stone-700">
      <FiPlus /> {props.label}
    </button>
  );
}

function EvolucionesTab(props: {
  rows: EvolucionRow[];
  formOpen: boolean;
  sortDirection: SortDirection;
  expanded: string | null;
  onToggleSort: () => void;
  onToggleExpanded: (id: string) => void;
  onOpenForm: () => void;
  onCancelForm: () => void;
  onSave: (row: EvolucionRow) => void;
}) {
  const sorted = [...props.rows].sort((a, b) => (props.sortDirection === "desc" ? b.fecha.getTime() - a.fecha.getTime() : a.fecha.getTime() - b.fecha.getTime()));

  return (
    <div>
      <AddButton label="Nueva evolución" onClick={props.onOpenForm} />
      {props.formOpen ? <EvolucionFormBar onSave={props.onSave} onCancel={props.onCancelForm} /> : null}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={tableHead}>
                <button onClick={props.onToggleSort} className="inline-flex items-center gap-1">
                  Fecha {props.sortDirection === "desc" ? <FiArrowDown /> : <FiArrowUp />}
                </button>
              </th>
              <th className={tableHead}>Motivo</th>
              <th className={tableHead}>Plan</th>
              <th className={`${tableHead} w-24 text-right`}>Examen</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <React.Fragment key={row.id}>
                <tr className="hover:bg-stone-50">
                  <td className={`${tableCell} w-32 font-medium text-stone-900`}>{formatDate(row.fecha)}</td>
                  <td className={tableCell}>{row.motivo}</td>
                  <td className={tableCell}>{row.plan}</td>
                  <td className={`${tableCell} text-right`}>
                    <button onClick={() => props.onToggleExpanded(row.id)} className="inline-flex items-center gap-1 rounded-md border border-stone-300 px-2 py-1 text-xs font-semibold text-stone-600">
                      {props.expanded === row.id ? <FiChevronDown /> : <FiChevronRight />} Ver
                    </button>
                  </td>
                </tr>
                {props.expanded === row.id ? (
                  <tr>
                    <td className="border-t border-stone-200 bg-teal-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-teal-800">Examen físico</td>
                    <td colSpan={3} className="border-t border-stone-200 bg-teal-50 px-4 py-3 text-sm leading-6 text-stone-700">
                      {row.examenFisico}
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AntropometriaTab(props: { rows: AntropometriaRow[]; formOpen: boolean; onOpenForm: () => void; onCancelForm: () => void; onSave: (row: AntropometriaRow) => void }) {
  const descending = [...props.rows].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  const ascending = [...props.rows].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  return (
    <div>
      <AddButton label="Nueva antropometría" onClick={props.onOpenForm} />
      {props.formOpen ? <AntropometriaFormBar onSave={props.onSave} onCancel={props.onCancelForm} /> : null}
      <section className="mb-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">Evolución de IMC</h3>
            <p className="mt-1 text-sm text-stone-500">Sparkline SVG dibujado con los controles antropométricos.</p>
          </div>
          <Sparkline values={ascending.map((row) => row.imc)} width={260} height={64} color="#0f766e" />
        </div>
      </section>
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={tableHead}>Fecha</th>
              <th className={tableHead}>Peso</th>
              <th className={tableHead}>Talla</th>
              <th className={tableHead}>IMC</th>
              <th className={tableHead}>Delta vs previo</th>
            </tr>
          </thead>
          <tbody>
            {descending.map((row) => {
              const previous = ascending.find((candidate) => candidate.fecha < row.fecha);
              const delta = previous ? row.imc - previous.imc : 0;
              return (
                <tr key={row.id} className="hover:bg-stone-50">
                  <td className={`${tableCell} font-medium text-stone-900`}>{formatDate(row.fecha)}</td>
                  <td className={tableCell}>{row.peso.toFixed(1)} kg</td>
                  <td className={tableCell}>{row.talla.toFixed(2)} m</td>
                  <td className={`${tableCell} font-semibold text-stone-900`}>{row.imc.toFixed(1)}</td>
                  <td className={tableCell}>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${delta <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {delta <= 0 ? <FiArrowDown /> : <FiArrowUp />} {previous ? delta.toFixed(1) : "base"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InterconsultasTab(props: { rows: InterconsultaRow[]; formOpen: boolean; onOpenForm: () => void; onCancelForm: () => void; onSave: (row: InterconsultaRow) => void }) {
  return (
    <div>
      <AddButton label="Nueva interconsulta" onClick={props.onOpenForm} />
      {props.formOpen ? <InterconsultaFormBar onSave={props.onSave} onCancel={props.onCancelForm} /> : null}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={tableHead}>Fecha</th>
              <th className={tableHead}>Especialidad</th>
              <th className={tableHead}>Estado</th>
              <th className={tableHead}>Notas</th>
            </tr>
          </thead>
          <tbody>
            {props.rows.map((row) => (
              <tr key={row.id} className="hover:bg-stone-50">
                <td className={`${tableCell} w-32 font-medium text-stone-900`}>{formatDate(row.fecha)}</td>
                <td className={tableCell}>{row.especialidad}</td>
                <td className={tableCell}>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${row.estado === "pendiente" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>
                    {row.estado === "pendiente" ? "Pendiente" : "Respondida"}
                  </span>
                </td>
                <td className={tableCell}>{row.notas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InternacionesTab(props: { rows: InternacionRow[]; formOpen: boolean; onOpenForm: () => void; onCancelForm: () => void; onSave: (row: InternacionRow) => void }) {
  return (
    <div>
      <AddButton label="Nueva internación" onClick={props.onOpenForm} />
      {props.formOpen ? <InternacionFormBar onSave={props.onSave} onCancel={props.onCancelForm} /> : null}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={tableHead}>Ingreso</th>
              <th className={tableHead}>Egreso</th>
              <th className={tableHead}>Días</th>
              <th className={tableHead}>Motivo</th>
              <th className={tableHead}>Notas</th>
            </tr>
          </thead>
          <tbody>
            {props.rows.map((row) => (
              <tr key={row.id} className="hover:bg-stone-50">
                <td className={`${tableCell} font-medium text-stone-900`}>{formatDate(row.ingreso)}</td>
                <td className={tableCell}>{formatDate(row.egreso)}</td>
                <td className={tableCell}>{daysBetween(row.ingreso, row.egreso)}</td>
                <td className={tableCell}>{row.motivo}</td>
                <td className={tableCell}>{row.notas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArchivosTab(props: { rows: ArchivoRow[]; formOpen: boolean; onOpenForm: () => void; onCancelForm: () => void; onSave: (row: ArchivoRow) => void }) {
  return (
    <div>
      <AddButton label="Adjuntar archivo" onClick={props.onOpenForm} />
      {props.formOpen ? <ArchivoFormBar onSave={props.onSave} onCancel={props.onCancelForm} /> : null}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={tableHead}>Nombre</th>
              <th className={tableHead}>Tipo</th>
              <th className={tableHead}>Fecha</th>
              <th className={tableHead}>Tamaño</th>
              <th className={tableHead}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {props.rows.map((row) => (
              <tr key={row.id} className="hover:bg-stone-50">
                <td className={`${tableCell} font-medium text-stone-900`}>{row.nombre}</td>
                <td className={tableCell}>{row.tipo}</td>
                <td className={tableCell}>{formatDate(row.fecha)}</td>
                <td className={tableCell}>{row.tamanioKb.toLocaleString("es-AR")} KB</td>
                <td className={tableCell}>
                  <button className="inline-flex items-center gap-1 rounded-md border border-stone-300 px-2 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-50">
                    <FiDownload /> Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExportPreview(props: {
  sections: ExportSections;
  period: string;
  onToggle: (section: keyof ExportSections) => void;
  onPeriodChange: (period: string) => void;
  onClose: () => void;
  evoluciones: EvolucionRow[];
  antropometria: AntropometriaRow[];
  interconsultas: InterconsultaRow[];
  internaciones: InternacionRow[];
  archivos: ArchivoRow[];
}) {
  const latestAnthro = props.antropometria[props.antropometria.length - 1];
  const sectionLabels: Record<keyof ExportSections, string> = {
    resumen: "Resumen",
    evoluciones: "Evoluciones",
    antropometria: "Antropometría",
    interconsultas: "Interconsultas",
    internaciones: "Internaciones",
    archivos: "Archivos",
  };

  return (
    <div className="grid h-screen w-screen grid-cols-[310px_1fr] overflow-hidden bg-stone-200 text-stone-900">
      <aside className="border-r border-stone-300 bg-stone-950 p-5 text-white">
        <button onClick={props.onClose} className="mb-6 inline-flex items-center gap-2 rounded-md border border-stone-700 px-3 py-2 text-sm font-semibold text-stone-200 hover:bg-stone-900">
          <FiX /> Volver al paciente
        </button>
        <h2 className="text-xl font-bold">Resumen de historia</h2>
        <p className="mt-2 text-sm leading-6 text-stone-400">Vista de impresión dedicada: opciones persistentes a la izquierda y documento completo a la derecha.</p>

        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-wide text-stone-400">Período</label>
          <select value={props.period} onChange={(e) => props.onPeriodChange(e.target.value)} className="mt-2 w-full rounded-md border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-white">
            <option>Último año</option>
            <option>Últimos 6 meses</option>
            <option>Todo el historial</option>
          </select>
        </div>

        <div className="mt-6 space-y-3">
          {(Object.keys(props.sections) as Array<keyof ExportSections>).map((key) => (
            <label key={key} className="flex items-center justify-between rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-sm">
              <span>{sectionLabels[key]}</span>
              <input type="checkbox" checked={props.sections[key]} onChange={() => props.onToggle(key)} className="h-4 w-4 accent-teal-500" />
            </label>
          ))}
        </div>

        <button onClick={() => window.print()} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-600 px-3 py-2 text-sm font-bold text-white hover:bg-teal-500">
          <FiPrinter /> Imprimir documento
        </button>
      </aside>

      <main className="overflow-auto p-8">
        <article className="mx-auto min-h-full max-w-[880px] rounded-sm bg-white p-10 shadow-xl">
          <header className="border-b border-stone-300 pb-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-stone-950">Resumen clínico</h1>
                <p className="mt-2 text-stone-600">{patient.nombre} · DNI {patient.documento} · {patient.edad} años</p>
              </div>
              <div className="text-right text-sm text-stone-500">
                <p>Emitido: {formatDate(new Date())}</p>
                <p>Período: {props.period}</p>
              </div>
            </div>
          </header>

          {props.sections.resumen ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-stone-950">Resumen</h2>
              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-stone-200 p-3">Obra social: {patient.obraSocial}</div>
                <div className="rounded-lg border border-stone-200 p-3">Último peso: {latestAnthro.peso.toFixed(1)} kg</div>
                <div className="rounded-lg border border-stone-200 p-3">IMC actual: {latestAnthro.imc.toFixed(1)}</div>
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-700"><strong>Antecedentes:</strong> {patient.antecedentes}</p>
              <p className="mt-2 text-sm leading-6 text-stone-700"><strong>Medicación habitual:</strong> {patient.medicacionHabitual}</p>
            </section>
          ) : null}

          {props.sections.evoluciones ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-stone-950">Evoluciones</h2>
              {props.evoluciones.slice(0, 3).map((row) => (
                <div key={row.id} className="mt-3 border-l-2 border-teal-500 pl-4 text-sm leading-6">
                  <div className="font-semibold">{formatDate(row.fecha)} · {row.motivo}</div>
                  <div>{row.plan}</div>
                </div>
              ))}
            </section>
          ) : null}

          {props.sections.antropometria ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-stone-950">Antropometría</h2>
              <div className="mt-3 flex items-center gap-6 text-sm">
                <Sparkline values={props.antropometria.map((row) => row.imc)} width={220} height={58} />
                <div>Serie de IMC: {props.antropometria.map((row) => row.imc.toFixed(1)).join(" → ")}</div>
              </div>
            </section>
          ) : null}

          {props.sections.interconsultas ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-stone-950">Interconsultas</h2>
              {props.interconsultas.map((row) => <p key={row.id} className="mt-2 text-sm">{formatDate(row.fecha)} · {row.especialidad} · {row.estado}</p>)}
            </section>
          ) : null}

          {props.sections.internaciones ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-stone-950">Internaciones</h2>
              {props.internaciones.map((row) => <p key={row.id} className="mt-2 text-sm">{formatDate(row.ingreso)} a {formatDate(row.egreso)} · {row.motivo}</p>)}
            </section>
          ) : null}

          {props.sections.archivos ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-stone-950">Archivos</h2>
              {props.archivos.map((row) => <p key={row.id} className="mt-2 text-sm">{row.nombre} · {row.tipo} · {row.tamanioKb} KB</p>)}
            </section>
          ) : null}
        </article>
      </main>
    </div>
  );
}

export default function WorkspaceLayout() {
  const [activeTab, setActiveTab] = useState<TabId>("resumen");
  const [showDemographics, setShowDemographics] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  const [evoluciones, setEvoluciones] = useState<EvolucionRow[]>(initialEvoluciones);
  const [antropometria, setAntropometria] = useState<AntropometriaRow[]>(initialAntropometria);
  const [interconsultas, setInterconsultas] = useState<InterconsultaRow[]>(initialInterconsultas);
  const [internaciones, setInternaciones] = useState<InternacionRow[]>(initialInternaciones);
  const [archivos, setArchivos] = useState<ArchivoRow[]>(initialArchivos);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedEvolution, setExpandedEvolution] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<FormOpenState>({
    evoluciones: false,
    antropometria: false,
    interconsultas: false,
    internaciones: false,
    archivos: false,
  });
  const [exportSections, setExportSections] = useState<ExportSections>({
    resumen: true,
    evoluciones: true,
    antropometria: true,
    interconsultas: true,
    internaciones: false,
    archivos: true,
  });
  const [exportPeriod, setExportPeriod] = useState("Último año");

  const counts = useMemo<Record<TabId, number>>(() => ({
    resumen: novedades.length,
    evoluciones: evoluciones.length,
    antropometria: antropometria.length,
    interconsultas: interconsultas.length,
    internaciones: internaciones.length,
    archivos: archivos.length,
  }), [archivos.length, antropometria.length, evoluciones.length, interconsultas.length, internaciones.length]);

  if (exportMode) {
    return (
      <ExportPreview
        sections={exportSections}
        period={exportPeriod}
        onToggle={(section) => setExportSections((current) => ({ ...current, [section]: !current[section] }))}
        onPeriodChange={setExportPeriod}
        onClose={() => setExportMode(false)}
        evoluciones={evoluciones}
        antropometria={antropometria}
        interconsultas={interconsultas}
        internaciones={internaciones}
        archivos={archivos}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-stone-100 text-stone-900">
      <Header onExport={() => setExportMode(true)} showDemographics={showDemographics} onToggleDemographics={() => setShowDemographics((value) => !value)} />
      {showDemographics ? <DemographicsStrip /> : null}
      <Tabs active={activeTab} counts={counts} onChange={setActiveTab} />
      <main className="min-h-0 flex-1 overflow-auto p-5">
        {activeTab === "resumen" ? <SummaryTab antropometria={antropometria} interconsultas={interconsultas} evoluciones={evoluciones} /> : null}
        {activeTab === "evoluciones" ? (
          <EvolucionesTab
            rows={evoluciones}
            formOpen={formOpen.evoluciones}
            sortDirection={sortDirection}
            expanded={expandedEvolution}
            onToggleSort={() => setSortDirection((value) => (value === "desc" ? "asc" : "desc"))}
            onToggleExpanded={(id) => setExpandedEvolution((value) => (value === id ? null : id))}
            onOpenForm={() => setFormOpen((current) => ({ ...current, evoluciones: true }))}
            onCancelForm={() => setFormOpen((current) => ({ ...current, evoluciones: false }))}
            onSave={(row) => {
              setEvoluciones((current) => [row, ...current]);
              setFormOpen((current) => ({ ...current, evoluciones: false }));
            }}
          />
        ) : null}
        {activeTab === "antropometria" ? (
          <AntropometriaTab
            rows={antropometria}
            formOpen={formOpen.antropometria}
            onOpenForm={() => setFormOpen((current) => ({ ...current, antropometria: true }))}
            onCancelForm={() => setFormOpen((current) => ({ ...current, antropometria: false }))}
            onSave={(row) => {
              setAntropometria((current) => [...current, row].sort((a, b) => a.fecha.getTime() - b.fecha.getTime()));
              setFormOpen((current) => ({ ...current, antropometria: false }));
            }}
          />
        ) : null}
        {activeTab === "interconsultas" ? (
          <InterconsultasTab
            rows={interconsultas}
            formOpen={formOpen.interconsultas}
            onOpenForm={() => setFormOpen((current) => ({ ...current, interconsultas: true }))}
            onCancelForm={() => setFormOpen((current) => ({ ...current, interconsultas: false }))}
            onSave={(row) => {
              setInterconsultas((current) => [row, ...current]);
              setFormOpen((current) => ({ ...current, interconsultas: false }));
            }}
          />
        ) : null}
        {activeTab === "internaciones" ? (
          <InternacionesTab
            rows={internaciones}
            formOpen={formOpen.internaciones}
            onOpenForm={() => setFormOpen((current) => ({ ...current, internaciones: true }))}
            onCancelForm={() => setFormOpen((current) => ({ ...current, internaciones: false }))}
            onSave={(row) => {
              setInternaciones((current) => [row, ...current]);
              setFormOpen((current) => ({ ...current, internaciones: false }));
            }}
          />
        ) : null}
        {activeTab === "archivos" ? (
          <ArchivosTab
            rows={archivos}
            formOpen={formOpen.archivos}
            onOpenForm={() => setFormOpen((current) => ({ ...current, archivos: true }))}
            onCancelForm={() => setFormOpen((current) => ({ ...current, archivos: false }))}
            onSave={(row) => {
              setArchivos((current) => [row, ...current]);
              setFormOpen((current) => ({ ...current, archivos: false }));
            }}
          />
        ) : null}
      </main>
    </div>
  );
}
