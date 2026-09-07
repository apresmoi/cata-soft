import React from "react";
import { LAYOUTS } from "./variants";

const FRAME_WIDTH = 1440;
const FRAME_HEIGHT = 900;

/**
 * Layout gallery. Full alternative designs, free to restructure anything.
 *
 * Each entry renders in an iframe at a real desktop viewport, scaled to fit.
 * Click a title to open it full size.
 */
export function Gallery() {
  const [columns, setColumns] = React.useState(2);
  const [only, setOnly] = React.useState<string | null>(null);

  const shown = only ? LAYOUTS.filter((entry) => entry.id === only) : LAYOUTS;
  const scale = 1 / columns;

  const url = (id: string) => `/design.html?layout=${id}`;

  const tab = (active: boolean) =>
    "rounded-md px-3 py-1 text-sm transition-colors " +
    (active ? "bg-stone-600 font-semibold" : "hover:bg-stone-700");

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-stone-700 bg-stone-900/95 px-6 py-4 backdrop-blur">
        <h1 className="text-lg font-bold">CataSoft — rediseños de layout</h1>

        <div className="flex items-center gap-1 rounded-lg bg-stone-800 p-1">
          {[1, 2, 3].map((count) => (
            <button
              key={count}
              onClick={() => setColumns(count)}
              className={tab(columns === count)}
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
          <option value="">Todas</option>
          {LAYOUTS.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>

        <p className="ml-auto text-sm text-stone-400">
          Rediseños completos: tablas, modales, navegación y export.
        </p>
      </header>

      <div
        className="grid gap-6 p-6"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {shown.map((entry) => (
          <figure key={entry.id} className="min-w-0">
            <figcaption className="mb-2">
              <a
                href={url(entry.id)}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline decoration-stone-600 hover:decoration-stone-300"
              >
                {entry.label}
              </a>
              <p className="text-sm text-stone-400">{entry.blurb}</p>
            </figcaption>

            <div
              className="overflow-hidden rounded-lg border border-stone-700 bg-black"
              style={{ height: FRAME_HEIGHT * scale }}
            >
              <iframe
                title={entry.label}
                src={url(entry.id)}
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
