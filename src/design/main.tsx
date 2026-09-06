import React from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import "./variants.css";
import { installFixtureBridge } from "./fixtures";
import { Gallery } from "./Gallery";
import { Layouts } from "./Layouts";
import { Preview } from "./Preview";
import type { ScreenId } from "./variants";

/**
 * Design gallery entry point. Served by Vite at /design.html, never bundled
 * into the app: index.html is the app's only entry.
 *
 *   /design.html                              -> the re-skin comparison board
 *   /design.html?mode=layouts                 -> the layout redesign board
 *   /design.html?layout=timeline              -> one layout redesign, full size
 *   /design.html?variant=slate&screen=patient -> one variant, full size
 */
installFixtureBridge();

const params = new URLSearchParams(window.location.search);
const screen = (params.get("screen") ?? "patient") as ScreenId;
const variant = params.get("variant");
const layout = params.get("layout");
const mode = params.get("mode");

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

if (layout) {
  root.className = "h-screen w-screen";
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Layouts.Preview id={layout} />
    </React.StrictMode>
  );
} else if (variant) {
  // The variant stylesheets are scoped to this attribute.
  document.documentElement.dataset.variant = variant;
  root.className = "h-screen w-screen";
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Preview screen={screen} />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Gallery mode={mode === "layouts" ? "layouts" : "variants"} />
    </React.StrictMode>
  );
}
