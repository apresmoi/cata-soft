import {
  FiActivity,
  FiFileText,
  FiPaperclip,
  FiPrinter,
  FiThermometer,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { type RecordKind } from "./data";

/**
 * Vertical action rail.
 *
 * Replaces the app's letter badges (E / I / A / H) with real icons, and keeps
 * the property that mattered: every record type is one click from anywhere in
 * the workspace. A "new record" dropdown would cost two.
 */

const KIND_ICONS: Record<RecordKind, JSX.Element> = {
  evolucion: <FiFileText />,
  antropometria: <FiActivity />,
  interconsulta: <FiUsers />,
  internacion: <FiThermometer />,
  archivo: <FiPaperclip />,
};

/*
 * Order matches how often the clinic logs each type. Labels carry their own
 * article -- every type is feminine except `archivo`. Each action's colour is
 * the same family as that type's chip in the records table, so the rail and
 * the table teach one visual language instead of two.
 */
const KIND_ACTIONS: Array<{ kind: RecordKind; label: string; tone: Tone }> = [
  { kind: "evolucion", label: "Nueva evolución", tone: "vessel" },
  { kind: "antropometria", label: "Nueva antropometría", tone: "leaf" },
  { kind: "interconsulta", label: "Nueva interconsulta", tone: "brand" },
  { kind: "internacion", label: "Nueva internación", tone: "amber" },
  { kind: "archivo", label: "Adjuntar archivo", tone: "stone" },
];

type Tone = "brand" | "vessel" | "leaf" | "amber" | "stone" | "danger";

/** Resting state is a tinted well; hover floods the family colour. */
const TONES: Record<Tone, string> = {
  brand: "border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-600 hover:bg-brand-600 hover:text-white",
  vessel: "border-vessel-200 bg-vessel-50 text-vessel-700 hover:border-vessel-600 hover:bg-vessel-600 hover:text-white",
  leaf: "border-leaf-200 bg-leaf-50 text-leaf-700 hover:border-leaf-600 hover:bg-leaf-600 hover:text-white",
  amber: "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-500 hover:text-white",
  stone: "border-stone-200 bg-white text-stone-600 hover:border-stone-500 hover:bg-stone-700 hover:text-white",
  danger: "border-stone-200 bg-white text-stone-400 hover:border-red-600 hover:bg-red-600 hover:text-white",
};

function RailButton(props: {
  label: string;
  tone: Tone;
  onClick: () => void;
  children: JSX.Element;
}) {
  const tone = TONES[props.tone];

  return (
    <div className="group relative flex justify-center">
      <button
        type="button"
        onClick={props.onClick}
        aria-label={props.label}
        className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200 ${tone}`}
      >
        {props.children}
      </button>
      {/* Hover label, Tailwind-only so the rail stays narrow without a title flash. */}
      <span className="pointer-events-none absolute left-full top-1/2 z-40 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {props.label}
      </span>
    </div>
  );
}

export default function Sidebar(props: {
  onCreate: (kind: RecordKind) => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  return (
    <aside className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-stone-200 bg-white py-4">
      <img src="/icon.png" alt="CataSoft" className="mb-2 h-8 w-8" />
      <div className="mb-1 h-px w-8 bg-stone-200" />

      {KIND_ACTIONS.map((action) => (
        <RailButton
          key={action.kind}
          label={action.label}
          tone={action.tone}
          onClick={() => props.onCreate(action.kind)}
        >
          {KIND_ICONS[action.kind]}
        </RailButton>
      ))}

      <div className="my-1 h-px w-8 bg-stone-200" />

      <RailButton label="Resumen de historia clínica" tone="stone" onClick={props.onExport}>
        <FiPrinter />
      </RailButton>

      <div className="grow" />

      <RailButton label="Eliminar paciente" tone="danger" onClick={props.onDelete}>
        <FiTrash2 />
      </RailButton>
    </aside>
  );
}
