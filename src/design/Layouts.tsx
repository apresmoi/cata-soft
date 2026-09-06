import React from "react";
import { LAYOUTS } from "./variants";

/**
 * Registry of the layout redesigns.
 *
 * Each one lives in `layouts/<id>/index.tsx` and default-exports a component
 * that renders a full screen. They are loaded lazily so a broken or in-progress
 * layout cannot take down the whole board.
 */
const MODULES: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  timeline: React.lazy(() => import("./layouts/timeline")),
  workspace: React.lazy(() => import("./layouts/workspace")),
  split: React.lazy(() => import("./layouts/split")),
  grid: React.lazy(() => import("./layouts/grid")),
  focus: React.lazy(() => import("./layouts/focus")),
};

function Missing(props: { id: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-stone-900 p-8 text-center text-stone-300">
      <div>
        <p className="font-bold">Layout “{props.id}” no encontrado</p>
        <p className="mt-2 text-sm text-stone-400">
          Definilo en src/design/layouts/{props.id}/index.tsx
        </p>
      </div>
    </div>
  );
}

function Preview(props: { id: string }) {
  const Component = MODULES[props.id];
  if (!Component) return <Missing id={props.id} />;

  return (
    <React.Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-stone-900 text-stone-400">
          Cargando…
        </div>
      }
    >
      <Component />
    </React.Suspense>
  );
}

export const Layouts = { Preview, ids: LAYOUTS.map((layout) => layout.id) };
