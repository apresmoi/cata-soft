/** @type {import('tailwindcss').Config} */

/*
 * Palette sampled from the app icon (public/icon.png, the kidney mark also
 * used by the loading splash). Three families, each hue-locked to a measured
 * region of the artwork so the UI and the icon cannot drift apart:
 *
 *   brand  hue 335 -- the kidney body        (measured anchor #c65986)
 *   vessel hue 175 -- the vessels            (measured anchor #4db4ac)
 *   leaf   hue  92 -- the foliage            (measured anchor #678150)
 *
 * One shared lightness ramp across all three, so the same stop is tonally
 * comparable between families. Saturation peaks at 500 and deepens toward 950.
 * Neutrals stay on Tailwind's `stone`, which is warm enough to sit under the
 * rose without going grey-blue.
 *
 * `brand` is an accent, not a background: patient records need neutral
 * surfaces. Reach for stone first and brand for emphasis.
 */
const brand = {
  50: "#f9f5f7",
  100: "#f4ebef",
  200: "#e8cfd9",
  300: "#dba9be",
  400: "#d080a2",
  500: "#c65886",
  600: "#b63a6d",
  700: "#9a2d5a",
  800: "#80234a",
  900: "#691b3c",
  950: "#471027",
};

const vessel = {
  50: "#f6f9f9",
  100: "#ecf4f3",
  200: "#d1e6e4",
  300: "#add7d3",
  400: "#86cac4",
  500: "#61bdb5",
  600: "#44aba3",
  700: "#36918a",
  800: "#2a7972",
  900: "#22635d",
  950: "#14423e",
};

const leaf = {
  50: "#f7f8f6",
  100: "#f0f2ee",
  200: "#dbe1d5",
  300: "#c1cdb6",
  400: "#a7bb95",
  500: "#8da975",
  600: "#76955b",
  700: "#627d4a",
  800: "#50683c",
  900: "#415530",
  950: "#2a381e",
};

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./design.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./electron/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand,
        vessel,
        leaf,
      },
    },
  },
  plugins: [],
};
