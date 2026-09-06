import { FiArrowDown, FiArrowUp, FiEdit3, FiPlus } from "react-icons/fi";
import { NewAntropometriaDialog } from "../Dialogs/AntropometriaDialog";
import { EditPacienteNotasDialog } from "../Dialogs/EditPacienteNotasDialog";
import Sparkline from "../components/Sparkline";
import { usePaciente, type PacienteHistoryItem } from "../hooks";
import { isRichTextEmpty, richTextToHtml, richTextToPlainText } from "../richText";

const cardBase = "rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow";
const iconButton =
  "inline-flex h-7 w-7 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-500 hover:border-brand-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400";
const kpiLabel = "text-xs font-semibold uppercase tracking-wide text-stone-400";
const kpiValue = "text-2xl font-bold text-stone-950";
const kpiHint = "mt-1 text-sm text-stone-500";

const DOT_BY_TYPE: Record<PacienteHistoryItem["type"], string> = {
  evolucion: "bg-vessel-600",
  antropometria: "bg-leaf-600",
  interconsulta: "bg-brand-600",
  hospitalizacion: "bg-amber-500",
  archivoadjunto: "bg-stone-500",
};

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDecimal(value: number, digits = 1): string {
  return value.toFixed(digits).replace(".", ",");
}

/** Latest date across a discriminated union item, using whichever date field it carries. */
function itemDate(item: PacienteHistoryItem): Date {
  const raw = item.type === "hospitalizacion" ? item.fechaIngreso : item.type === "archivoadjunto" ? item.createdAt : item.fecha;
  return raw instanceof Date ? raw : new Date(raw);
}
/**
 * One-line Spanish description, phrased as the design board had it: the record
 * type leads, so a row is self-describing next to its coloured dot.
 */
function describeItem(item: PacienteHistoryItem): string {
  switch (item.type) {
    case "evolucion":
      return `Evolución: ${richTextToPlainText(item.motivo) || "sin motivo"}`;
    case "antropometria":
      return `Antropometría registrada: IMC ${formatDecimal(item.imc)}`;
    case "interconsulta":
      return `Interconsulta: ${richTextToPlainText(item.motivo)}`;
    case "hospitalizacion":
      return `Internación: ${richTextToPlainText(item.motivo)}`;
    case "archivoadjunto":
      return `Archivo adjuntado: ${item.nombre}`;
  }
}

function DeltaChip(props: { delta: number | null; unit: string }): JSX.Element | null {
  if (props.delta === null) return null;
  const improved = props.delta <= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${
        improved ? "bg-leaf-100 text-leaf-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {improved ? <FiArrowDown /> : <FiArrowUp />}
      {formatDecimal(Math.abs(props.delta))}
      {props.unit}
    </span>
  );
}

function TrendKpiCard(props: { label: string; value: string; hint: string; values: number[]; delta: number | null; deltaUnit: string; patientId: string }) {
  return (
    <div className={`relative ${cardBase}`}>
      {/*
       * `DialogTrigger` renders its own <button>, so the child must not be one
       * too -- nested buttons are invalid and Radix's wrapper sat in normal
       * flow, pushing the card's label onto its own row. Position the wrapper
       * and keep the child a span.
       */}
      <div className="absolute right-3 top-3">
        <NewAntropometriaDialog patientId={props.patientId}>
          <span
            className={iconButton}
            title="Nueva antropometría"
            aria-label="Nueva antropometría"
          >
            <FiPlus />
          </span>
        </NewAntropometriaDialog>
      </div>
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

export function PatientSummary(props: {
  patientId: string;
  history: PacienteHistoryItem[];
  onOpenRecord: (item: PacienteHistoryItem) => void;
}): JSX.Element {
  const { data } = usePaciente(props.patientId);

  const evoluciones = props.history.filter((item): item is Extract<PacienteHistoryItem, { type: "evolucion" }> => item.type === "evolucion");
  const antropometrias = props.history
    .filter((item): item is Extract<PacienteHistoryItem, { type: "antropometria" }> => item.type === "antropometria")
    .slice()
    .sort((a, b) => itemDate(a).getTime() - itemDate(b).getTime());

  const latestVisit = evoluciones.reduce<Extract<PacienteHistoryItem, { type: "evolucion" }> | undefined>(
    (latest, row) => (!latest || itemDate(row) > itemDate(latest) ? row : latest),
    undefined
  );
  const latestAnthro = antropometrias.length > 0 ? antropometrias[antropometrias.length - 1] : undefined;
  const pesoValues = antropometrias.map((row) => row.peso);
  const imcValues = antropometrias.map((row) => row.imc);
  const pesoDelta = pesoValues.length < 2 ? null : pesoValues[pesoValues.length - 1] - pesoValues[pesoValues.length - 2];
  const imcDelta = imcValues.length < 2 ? null : imcValues[imcValues.length - 1] - imcValues[imcValues.length - 2];

  const interconsultas = props.history
    .filter((item): item is Extract<PacienteHistoryItem, { type: "interconsulta" }> => item.type === "interconsulta")
    .slice()
    .sort((a, b) => itemDate(b).getTime() - itemDate(a).getTime());

  const novedades = props.history
    .slice()
    .sort((a, b) => itemDate(b).getTime() - itemDate(a).getTime())
    .slice(0, 8);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => latestVisit && props.onOpenRecord(latestVisit)}
          disabled={!latestVisit}
          className={`${cardBase} text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-default disabled:hover:border-stone-200 disabled:hover:shadow-sm`}
        >
          <div className={kpiLabel}>Última visita</div>
          <div className={kpiValue}>{latestVisit ? formatDate(itemDate(latestVisit)) : "Sin registros"}</div>
          <div className={kpiHint}>{latestVisit ? richTextToPlainText(latestVisit.motivo) || "Evolución registrada" : "Todavía no hay evoluciones cargadas"}</div>
        </button>

        <TrendKpiCard
          label="Peso"
          value={latestAnthro ? `${formatDecimal(latestAnthro.peso)} kg` : "Sin datos"}
          hint={latestAnthro ? `Talla ${formatDecimal(latestAnthro.talla, 2)} m` : "Todavía no hay antropometría cargada"}
          values={pesoValues}
          delta={pesoDelta}
          deltaUnit=" kg"
          patientId={props.patientId}
        />

        <TrendKpiCard
          label="IMC"
          value={latestAnthro ? formatDecimal(latestAnthro.imc) : "Sin datos"}
          hint={latestAnthro ? "Índice de masa corporal" : "Todavía no hay antropometría cargada"}
          values={imcValues}
          delta={imcDelta}
          deltaUnit=""
          patientId={props.patientId}
        />

        <div className={cardBase}>
          <div className={kpiLabel}>Registros</div>
          <div className={kpiValue}>{props.history.length}</div>
          <div className={kpiHint}>Registros en la historia</div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-1 items-start gap-4 sm:grid-cols-2">
        <EditableInfoCard title="Antecedentes" field="antecedentes" patientId={props.patientId} text={data?.antecedentes} />
        <EditableInfoCard title="Medicación habitual" field="medicacionHabitual" patientId={props.patientId} text={data?.medicacionHabitual} />
      </div>

      {/*
       * Two panes side by side. The design board had "Items abiertos" here,
       * listing pending interconsultas -- but `Interconsultas` has no `estado`
       * column, so there is nothing to mark one pending with. This shows the
       * interconsultas themselves rather than inventing a status.
       */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="flex min-h-0 flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="shrink-0 text-sm font-bold uppercase tracking-wide text-stone-500">Últimas novedades</h3>
          <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-auto pr-2">
            {novedades.length === 0 ? (
              <p className="text-sm text-stone-500">Todavía no hay registros en la historia.</p>
            ) : (
              novedades.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => props.onOpenRecord(item)}
                  className="flex w-full gap-3 rounded-lg border border-stone-100 bg-stone-50 p-3 text-left hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${DOT_BY_TYPE[item.type]}`} />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{formatDate(itemDate(item))}</div>
                    <div className="text-sm text-stone-700">{describeItem(item)}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/*
         * Same treatment as the design board's pane in this slot: a tinted
         * panel holding white record cards, each with a chip, its notes and an
         * explicit edit action. The design's chip read "Pendiente" and carried
         * a "Marcar respuesta recibida" button; both need an `estado` column
         * that `Interconsultas` does not have, so the chip states the
         * speciality's date instead of inventing a status.
         */}
        <section className="flex min-h-0 flex-col rounded-xl border border-brand-200 bg-brand-50/50 p-4 shadow-sm">
          <h3 className="shrink-0 text-sm font-bold uppercase tracking-wide text-brand-800">
            Interconsultas
          </h3>
          <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-auto pr-2">
            {interconsultas.length === 0 ? (
              <p className="text-sm text-brand-800">Sin interconsultas cargadas.</p>
            ) : (
              interconsultas.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-brand-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-stone-800">{richTextToPlainText(item.motivo)}</div>
                    <span className="shrink-0 rounded-full bg-brand-100 px-2 py-1 text-xs font-bold text-brand-800">
                      {formatDate(itemDate(item))}
                    </span>
                  </div>
                  {item.notas ? (
                    <p className="mt-2 text-sm leading-6 text-stone-600">{richTextToPlainText(item.notas)}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => props.onOpenRecord(item)}
                    className="mt-3 rounded-md border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    Editar
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/** Fully clickable card reading a text field from the patient, wired to `EditPacienteNotasDialog`. */
function EditableInfoCard(props: {
  title: string;
  field: "antecedentes" | "medicacionHabitual";
  patientId: string;
  text: string | null | undefined;
}): JSX.Element {
  return (
    <EditPacienteNotasDialog patientId={props.patientId} field={props.field}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
        className={`${cardBase} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400`}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">{props.title}</h3>
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            className={iconButton}
            title={`Editar ${props.title.toLowerCase()}`}
            aria-label={`Editar ${props.title.toLowerCase()}`}
          >
            <FiEdit3 />
          </button>
        </div>
        {isRichTextEmpty(props.text) ? (
          <p className="mt-3 text-sm leading-6 text-stone-700">Sin datos cargados</p>
        ) : (
          <div
            className="mt-3 text-sm leading-6 text-stone-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: richTextToHtml(props.text) }}
          />
        )}
      </div>
    </EditPacienteNotasDialog>
  );
}
