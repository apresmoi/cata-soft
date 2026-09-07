import React from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import { installFixtureBridge } from "./fixtures";
import { Gallery } from "./Gallery";
import { Layouts } from "./Layouts";

/**
 * Design gallery entry point. Served by Vite at /design.html, never bundled
 * into the app: index.html is the app's only entry.
 *
 *   /design.html                -> the layout redesign board
 *   /design.html?layout=timeline -> one layout redesign, full size
 */
installFixtureBridge();

const params = new URLSearchParams(window.location.search);
const layout = params.get("layout");

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

if (layout) {
  root.className = "h-screen w-screen";
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Layouts.Preview id={layout} />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Gallery />
    </React.StrictMode>
  );
}
