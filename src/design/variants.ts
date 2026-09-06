/**
 * Design variants.
 *
 * Each variant is a stylesheet that re-skins the real components by overriding
 * the handful of Tailwind utilities they use, scoped to
 * `[data-variant="<id>"]`. A scoped selector outranks a bare utility class, so
 * no component markup changes and nothing here can affect the shipped app.
 *
 * Adding one: create `variants/<id>.css`, import it in `variants.css`, and add
 * a row below.
 */
export type Variant = {
  id: string;
  label: string;
  blurb: string;
};

export const VARIANTS: Variant[] = [
  {
    id: "current",
    label: "Actual",
    blurb: "El diseño de hoy, sin cambios. Punto de comparación.",
  },
  {
    id: "slate",
    label: "Slate Pro",
    blurb: "Oscuro refinado: gris azulado, bordes sutiles, acentos apagados.",
  },
  {
    id: "clinical",
    label: "Clinical Light",
    blurb: "Claro y de alto contraste, como una historia clínica impresa.",
  },
  {
    id: "teal",
    label: "Teal Nocturno",
    blurb: "Oscuro con acento verde azulado y jerarquía tipográfica marcada.",
  },
  {
    id: "paper",
    label: "Paper Warm",
    blurb: "Fondo hueso, tinta cálida, aire generoso para lectura larga.",
  },
  {
    id: "dense",
    label: "Dense Data",
    blurb: "Compacto y neutro: más filas visibles, ideal para carga de datos.",
  },
];

export const SCREENS = [
  { id: "home", label: "Listado de pacientes", path: "/" },
  { id: "patient", label: "Ficha del paciente", path: "/patient/p1" },
] as const;

export type ScreenId = (typeof SCREENS)[number]["id"];
