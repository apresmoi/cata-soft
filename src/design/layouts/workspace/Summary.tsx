import { FiArrowDown, FiArrowUp, FiEdit3, FiPlus } from "react-icons/fi";
import type { ModalTarget } from "./Modals";
import Sparkline from "./Sparkline";
import {
  formatDate,
  KIND_META,
  novedades,
  type AntropometriaRow,
  type EvolucionRow,
  type InterconsultaRow,
  type PatientData,
  type RecordKind,
} from "./data";

const cardBase = "rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow";
const iconButton =
  "inline-flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 hover:border-brand-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400";
const kpiLabel = "text-xs font-semibold uppercase tracking-wide text-stone-400";
const kpiValue = "text-2xl font-bold text-stone-950";
const kpiHint = "mt-1 text-sm text-stone-500";

/** Delta between the last two readings of a numeric field; null when there is not enough history. */
function trendDelta(rows: AntropometriaRow[], key: "peso" | "imc"): number | null {
  if (rows.length < 2) return null;
  return rows[rows.length - 1][key] - rows[rows.length - 2][key];
}

function DeltaChip(props: { delta: number | null; unit: string }) {
  if (props.delta === null) return null;
  const improved = props.delta <= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${
        improved ? "bg-leaf-100 text-leaf-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {improved ? <FiArrowDown /> : <FiArrowUp />}
      {Math.abs(props.delta).toFixed(1)}
      {props.unit}
    </span>
  );
}

function TrendKpiCard(props: {
  label: string;
  value: string;
  hint: string;
  values: number[];
  delta: number | null;
  deltaUnit: string;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className={`relative ${cardBase}`}>
      <button type="button" onClick={props.onAdd} className={`absolute right-3 top-3 ${iconButton}`} title={props.addLabel} aria-label={props.addLabel}>
        <FiPlus />
      </button>
      <div className={kpiLabel}>{props.label}</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div>
          <div className={kpiValue}>{props.value}</div>
          <div className={kpiHint}>{props.hint}</div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkline values={props.values} width={96} height={30} color="#44aba3" />
          <DeltaChip delta={props.delta} unit={props.deltaUnit} />
        </div>
      </div>
    </div>
  );
}

export default function Summary(props: {
  patient: PatientData;
  evoluciones: EvolucionRow[];
  antropometria: AntropometriaRow[];
  interconsultas: InterconsultaRow[];
  onEdit: (target: ModalTarget) => void;
  onToggleInterconsulta: (id: string) => void;
  onOpenRecord: (kind: RecordKind, id: string) => void;
}) {
  const latestVisit =
    props.evoluciones.length > 0
      ? props.evoluciones.reduce((latest, row) => (row.fecha > latest.fecha ? row : latest), props.evoluciones[0])
      : undefined;
  const latestAnthro = props.antropometria.length > 0 ? props.antropometria[props.antropometria.length - 1] : undefined;
  const pending = props.interconsultas.filter((row) => row.estado === "pendiente");
  const pesoDelta = trendDelta(props.antropometria, "peso");
  const imcDelta = trendDelta(props.antropometria, "imc");

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => latestVisit && props.onEdit({ kind: "evolucion", row: latestVisit })}
          className={`${cardBase} text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400`}
        >
          <div className={kpiLabel}>Última visita</div>
          <div className={kpiValue}>{latestVisit ? formatDate(latestVisit.fecha) : "Sin registros"}</div>
          <div className={kpiHint}>{latestVisit ? latestVisit.motivo : "Todavía no hay evoluciones cargadas"}</div>
        </button>

        <TrendKpiCard
          label="Peso"
          value={latestAnthro ? `${latestAnthro.peso.toFixed(1).replace(".", ",")} kg` : "Sin datos"}
          hint={latestAnthro ? `Talla ${latestAnthro.talla.toFixed(2).replace(".", ",")} m` : "Todavía no hay antropometría cargada"}
          values={props.antropometria.map((row) => row.peso)}
          delta={pesoDelta}
          deltaUnit=" kg"
          onAdd={() => props.onEdit({ kind: "antropometria" })}
          addLabel="Registrar nueva antropometría"
        />

        <TrendKpiCard
          label="IMC"
          value={latestAnthro ? latestAnthro.imc.toFixed(1) : "Sin datos"}
          hint={latestAnthro ? "Índice de masa corporal" : "Todavía no hay antropometría cargada"}
          values={props.antropometria.map((row) => row.imc)}
          delta={imcDelta}
          deltaUnit=""
          onAdd={() => props.onEdit({ kind: "antropometria" })}
          addLabel="Registrar nueva antropometría"
        />

        <div className={`relative ${cardBase}`}>
          <button
            type="button"
            onClick={() => props.onEdit({ kind: "interconsulta" })}
            className={`absolute right-3 top-3 ${iconButton}`}
            title="Registrar nueva interconsulta"
            aria-label="Registrar nueva interconsulta"
          >
            <FiPlus />
          </button>
          <div className={kpiLabel}>Pendientes</div>
          <div className={kpiValue}>{pending.length}</div>
          <div className={kpiHint}>Interconsultas sin respuesta</div>
        </div>
      </div>

      {/* Two aligned columns matching the KPI halves above. */}
      <div className="grid shrink-0 grid-cols-1 items-start gap-4 sm:grid-cols-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => props.onEdit({ kind: "antecedentes" })}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") props.onEdit({ kind: "antecedentes" });
              }}
              className={`${cardBase} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">Antecedentes</h3>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onEdit({ kind: "antecedentes" });
                  }}
                  className={iconButton}
                  title="Editar antecedentes"
                  aria-label="Editar antecedentes"
                >
                  <FiEdit3 />
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-700">{props.patient.antecedentes}</p>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => props.onEdit({ kind: "medicacion" })}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") props.onEdit({ kind: "medicacion" });
              }}
              className={`${cardBase} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">Medicación habitual</h3>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    props.onEdit({ kind: "medicacion" });
                  }}
                  className={iconButton}
                  title="Editar medicación habitual"
                  aria-label="Editar medicación habitual"
                >
                  <FiEdit3 />
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-700">{props.patient.medicacionHabitual}</p>
            </div>
      </div>

      {/* The feed row takes whatever height is left and scrolls inside each
          card, so the two panes stay aligned instead of ending raggedly. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <section className="flex min-h-0 flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <h3 className="shrink-0 text-sm font-bold uppercase tracking-wide text-stone-500">Últimas novedades</h3>
            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-auto pr-2">
              {novedades.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => props.onOpenRecord(item.tipo, item.recordId)}
                  title={`Ver ${KIND_META[item.tipo].singular.toLowerCase()}`}
                  className="flex w-full gap-3 rounded-lg border border-stone-100 bg-stone-50 p-3 text-left hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${KIND_META[item.tipo].dot}`} />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{formatDate(item.fecha)}</div>
                    <div className="text-sm text-stone-700">{item.texto}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

        <section className="flex min-h-0 flex-col rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <h3 className="shrink-0 text-sm font-bold uppercase tracking-wide text-amber-800">Items abiertos</h3>
          <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-auto pr-2">
            {pending.length === 0 ? (
              <p className="text-sm text-amber-800">Sin items abiertos.</p>
            ) : (
              pending.map((item) => (
                <div key={item.id} className="rounded-lg border border-amber-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-stone-800">{item.especialidad}</div>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">Pendiente</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{item.notas}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => props.onEdit({ kind: "interconsulta", row: item })}
                      className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => props.onToggleInterconsulta(item.id)}
                      className="rounded-md border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                    >
                      Marcar respuesta recibida
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
