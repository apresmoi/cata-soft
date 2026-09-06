import React from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import "./variants.css";
import { installFixtureBridge } from "./fixtures";
import { Gallery } from "./Gallery";
import { Preview } from "./Preview";
import type { ScreenId } from "./variants";

/**
 * Design gallery entry point. Served by Vite at /design.html, never bundled
 * into the app: index.html is the app's only entry.
 *
 *   /design.html                              -> the comparison board
 *   /design.html?variant=slate&screen=patient -> one variant, full size
 */
installFixtureBridge();

const params = new URLSearchParams(window.location.search);
const variant = params.get("variant");
const screen = (params.get("screen") ?? "patient") as ScreenId;

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

if (variant) {
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
      <Gallery />
    </React.StrictMode>
  );
}
