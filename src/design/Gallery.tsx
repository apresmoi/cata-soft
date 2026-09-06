import React from "react";
import { SCREENS, VARIANTS, type ScreenId } from "./variants";

const FRAME_WIDTH = 1440;
const FRAME_HEIGHT = 900;

/**
 * Side-by-side board of every variant, each in an iframe at a real desktop
 * viewport and scaled down to fit. Click a title to open that variant full
 * size in a new tab.
 */
export function Gallery() {
  const [screen, setScreen] = React.useState<ScreenId>("patient");
  const [columns, setColumns] = React.useState(2);
  const [only, setOnly] = React.useState<string | null>(null);

  const shown = only ? VARIANTS.filter((v) => v.id === only) : VARIANTS;
  const scale = 1 / columns;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-stone-700 bg-stone-900/95 px-6 py-4 backdrop-blur">
        <h1 className="text-lg font-bold">CataSoft — variantes de diseño</h1>

        <div className="flex items-center gap-1 rounded-lg bg-stone-800 p-1">
          {SCREENS.map((entry) => (
            <button
              key={entry.id}
              onClick={() => setScreen(entry.id)}
              className={
                "rounded-md px-3 py-1 text-sm transition-colors " +
                (screen === entry.id
                  ? "bg-stone-600 font-semibold"
                  : "hover:bg-stone-700")
              }
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-stone-800 p-1">
          {[1, 2, 3].map((count) => (
            <button
              key={count}
              onClick={() => setColumns(count)}
              className={
                "rounded-md px-3 py-1 text-sm transition-colors " +
                (columns === count
                  ? "bg-stone-600 font-semibold"
                  : "hover:bg-stone-700")
              }
            >
              {count}x
            </button>
          ))}
        </div>

        <select
          value={only ?? ""}
          onChange={(event) => setOnly(event.target.value || null)}
          className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm outline-none"
        >
          <option value="">Todas las variantes</option>
          {VARIANTS.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.label}
            </option>
          ))}
        </select>

        <p className="ml-auto text-sm text-stone-400">
          Componentes reales, datos de ejemplo. Cambian solo los estilos.
        </p>
      </header>

      <div
        className="grid gap-6 p-6"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {shown.map((variant) => (
          <figure key={variant.id} className="min-w-0">
            <figcaption className="mb-2 flex items-baseline gap-3">
              <a
                href={`/design.html?variant=${variant.id}&screen=${screen}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline decoration-stone-600 hover:decoration-stone-300"
              >
                {variant.label}
              </a>
              <span className="text-sm text-stone-400">{variant.blurb}</span>
            </figcaption>

            <div
              className="overflow-hidden rounded-lg border border-stone-700 bg-black"
              style={{ height: FRAME_HEIGHT * scale }}
            >
              <iframe
                title={variant.label}
                src={`/design.html?variant=${variant.id}&screen=${screen}`}
                width={FRAME_WIDTH}
                height={FRAME_HEIGHT}
                style={{
                  border: 0,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              />
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
