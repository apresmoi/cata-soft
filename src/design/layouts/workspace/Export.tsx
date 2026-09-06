import { FiPrinter, FiX } from "react-icons/fi";
import { FIXTURES } from "../../fixtures";
import Sparkline from "./Sparkline";
import { formatDate, type ArchivoRow, type AntropometriaRow, type EvolucionRow, type ExportSections, type InterconsultaRow, type InternacionRow } from "./data";

const patient = FIXTURES.paciente;

export default function ExportPreview(props: {
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
              <input type="checkbox" checked={props.sections[key]} onChange={() => props.onToggle(key)} className="h-4 w-4 accent-brand-500" />
            </label>
          ))}
        </div>

        <button onClick={() => window.print()} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-bold text-white hover:bg-brand-500">
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
                <div key={row.id} className="mt-3 border-l-2 border-brand-500 pl-4 text-sm leading-6">
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
