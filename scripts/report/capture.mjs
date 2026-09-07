// Drives the real app (against the design-board fixture bridge, see
// preview.html) through Playwright and saves one screenshot per state in
// content.mjs's SCREENS list. Self-contained: it starts and stops its own
// Vite dev server, so no separate `npm run dev` is required.
//
// Usage: node scripts/report/capture.mjs

import { mkdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { chromium } from "playwright";
import { SCREENS } from "./content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");
const capturesDir = path.join(__dirname, "captures");

const VIEWPORT = { width: 1440, height: 900 };
const DEVICE_SCALE_FACTOR = 2;

/** Clicks a trigger and waits for the single open Radix dialog. */
async function openDialog(page, triggerSelector) {
  await page.locator(triggerSelector).first().click();
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ state: "visible" });
  return dialog;
}

/** Escape closes any open Radix dialog; wait for it to leave the DOM. */
async function closeDialog(page) {
  await page.keyboard.press("Escape");
  await page.locator('[role="dialog"]').waitFor({ state: "detached" });
}

async function waitForHomeLoaded(page) {
  await page.getByText("CATASOFT").waitFor({ state: "visible" });
  await page.getByText("MARIA LOPEZ FERNANDEZ").first().waitFor({ state: "visible" });
  await page.getByText(/^\d+ pacientes?( de \d+)?$/).waitFor({ state: "visible" });
}

async function waitForPatientLoaded(page) {
  await page.locator("h1", { hasText: "MARIA LOPEZ FERNANDEZ" }).waitFor({ state: "visible" });
}

/**
 * Types a sentence into a rich-text field, bolds it, then adds a two-item
 * bulleted list -- so editor-formato actually shows applied formatting
 * instead of an empty editor.
 */
async function formatEvolucionEditor(dialog, page) {
  const editable = dialog.locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("Buena evolucion clinica, sin complicaciones.");

  // Bold the sentence just typed. Ctrl+A does not produce a real DOM
  // selection inside this Lexical editor; triple-click reliably selects
  // the whole (single) line instead.
  await editable.click({ clickCount: 3 });
  await dialog.locator('[aria-label="Negrita"]').click();

  // Collapse the selection and turn bold back off before the list, so the
  // capture shows a clear bold/plain contrast.
  await page.keyboard.press("End");
  await dialog.locator('[aria-label="Negrita"]').click();
  await page.keyboard.press("Enter");

  await dialog.locator('[aria-label="Lista con viñetas"]').click();
  await page.keyboard.type("Control de tension arterial en 2 semanas");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Continuar con la medicacion indicada");

  // Let Lexical's update listener settle so the toolbar/list DOM is final.
  await dialog.locator("ul li", { hasText: "Continuar con la medicacion indicada" }).waitFor({ state: "visible" });
  await dialog.locator("strong", { hasText: "Buena evolucion clinica" }).first().waitFor({ state: "visible" });
}

async function waitForHistoriaClinicaIframe(dialog) {
  const iframe = dialog.locator("iframe");
  await iframe.waitFor({ state: "visible" });
  const handle = await iframe.elementHandle();
  await dialog.page().waitForFunction((el) => {
    const doc = el.contentDocument;
    return !!doc && !!doc.body && doc.body.innerHTML.trim().length > 0;
  }, handle);
}

async function main() {
  mkdirSync(capturesDir, { recursive: true });

  const server = await createServer({
    root: projectRoot,
    configFile: false,
    logLevel: "warn",
    plugins: [react()],
    server: { port: 0, strictPort: false, host: "127.0.0.1" },
  });

  let browser;
  const produced = new Set();

  try {
    await server.listen();
    const address = server.httpServer.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: DEVICE_SCALE_FACTOR,
    });
    const page = await context.newPage();

    const shoot = async (id) => {
      const filePath = path.join(capturesDir, `${id}.png`);
      await page.screenshot({ path: filePath });
      produced.add(id);
      console.log(`captured ${id} -> ${path.relative(projectRoot, filePath)}`);
    };

    // -- home --------------------------------------------------------------
    await page.goto(`${baseUrl}/scripts/report/preview.html`, { waitUntil: "load" });
    await waitForHomeLoaded(page);
    await shoot("home");

    // -- home-busqueda -------------------------------------------------------
    const searchInput = page.getByPlaceholder(/^Buscar/);
    await searchInput.fill("SOSA");
    await page.getByText(/^1 paciente de 4$/).waitFor({ state: "visible" });
    await shoot("home-busqueda");
    await searchInput.fill("");
    await page.getByText(/^4 pacientes$/).waitFor({ state: "visible" });

    // -- home-configuracion --------------------------------------------------
    let dialog = await openDialog(page, 'button:has-text("Configuración")');
    await dialog.getByText("Copia de seguridad").first().waitFor({ state: "visible" });
    await shoot("home-configuracion");
    await closeDialog(page);

    // -- home-nuevo-paciente --------------------------------------------------
    dialog = await openDialog(page, 'button:has-text("NUEVO PACIENTE")');
    await dialog.getByText("NUEVO PACIENTE").first().waitFor({ state: "visible" });
    await shoot("home-nuevo-paciente");
    await closeDialog(page);

    // -- paciente-resumen ------------------------------------------------------
    await page.evaluate(() => {
      window.location.hash = "#/patient/p1";
    });
    await waitForPatientLoaded(page);
    await page.getByText("Últimas novedades").waitFor({ state: "visible" });
    await shoot("paciente-resumen");

    // -- paciente-resumen-rail ---------------------------------------------
    const nuevaEvolucionRail = page.locator('[aria-label="Nueva evolución"]');
    await nuevaEvolucionRail.hover();
    await page.waitForFunction((label) => {
      const btn = document.querySelector(`[aria-label="${label}"]`);
      const span = btn?.parentElement?.querySelector("span");
      return !!span && parseFloat(getComputedStyle(span).opacity) > 0.9;
    }, "Nueva evolución");
    await shoot("paciente-resumen-rail");
    // Move away so the hover tooltip does not linger into later captures.
    await page.mouse.move(0, 0);

    // -- paciente-registros ----------------------------------------------------
    await page.locator("nav button", { hasText: "REGISTROS" }).click();
    await page.getByPlaceholder("Buscar en registros").waitFor({ state: "visible" });
    await shoot("paciente-registros");

    // -- paciente-registros-filtro -----------------------------------------
    await page.locator("button", { hasText: /^Evoluciones \(\d+\)$/ }).click();
    await shoot("paciente-registros-filtro");
    // Reset the filter before continuing.
    await page.locator("button", { hasText: /^Todos \(\d+\)$/ }).click();

    // -- dialogo-editar-paciente --------------------------------------------
    dialog = await openDialog(page, 'button:has-text("EDITAR DATOS")');
    await dialog.getByText("NOMBRE Y APELLIDO").waitFor({ state: "visible" });
    await shoot("dialogo-editar-paciente");
    await closeDialog(page);

    // -- dialogo-evolucion -----------------------------------------------------
    dialog = await openDialog(page, '[aria-label="Nueva evolución"]');
    await dialog.getByText("NUEVA EVOLUCION").waitFor({ state: "visible" });
    await dialog.getByText("MOTIVO").waitFor({ state: "visible" });
    await shoot("dialogo-evolucion");
    await closeDialog(page);

    // -- dialogo-antropometria -------------------------------------------------
    dialog = await openDialog(page, '[aria-label="Nueva antropometría"]');
    await shoot("dialogo-antropometria");
    await closeDialog(page);

    // -- dialogo-interconsulta -------------------------------------------------
    dialog = await openDialog(page, '[aria-label="Nueva interconsulta"]');
    await shoot("dialogo-interconsulta");
    await closeDialog(page);

    // -- dialogo-internacion ---------------------------------------------------
    dialog = await openDialog(page, '[aria-label="Nueva internación"]');
    await shoot("dialogo-internacion");
    await closeDialog(page);

    // -- dialogo-archivo -------------------------------------------------------
    dialog = await openDialog(page, '[aria-label="Adjuntar archivo"]');
    await shoot("dialogo-archivo");
    await closeDialog(page);

    // -- editor-formato ----------------------------------------------------
    dialog = await openDialog(page, '[aria-label="Nueva evolución"]');
    await formatEvolucionEditor(dialog, page);
    await shoot("editor-formato");
    await closeDialog(page);

    // -- dialogo-antecedentes ------------------------------------------------
    await page.locator("nav button", { hasText: "RESUMEN" }).click();
    await page.getByText("Últimas novedades").waitFor({ state: "visible" });
    dialog = await openDialog(page, 'div[role="button"]:has-text("Antecedentes")');
    await dialog.getByText("Editar antecedentes").waitFor({ state: "visible" });
    await shoot("dialogo-antecedentes");
    await closeDialog(page);

    // -- dialogo-historia-clinica --------------------------------------------
    dialog = await openDialog(page, '[aria-label="Resumen de historia clínica"]');
    await waitForHistoriaClinicaIframe(dialog);
    await shoot("dialogo-historia-clinica");
    await closeDialog(page);

    await context.close();
  } finally {
    if (browser) await browser.close();
    await server.close();
  }

  const missing = SCREENS.filter((screen) => !produced.has(screen.id) || !existsSync(path.join(capturesDir, `${screen.id}.png`)));
  if (missing.length > 0) {
    console.error(`Missing captures: ${missing.map((s) => s.id).join(", ")}`);
    process.exitCode = 1;
    return;
  }

  for (const screen of SCREENS) {
    const filePath = path.join(capturesDir, `${screen.id}.png`);
    if (statSync(filePath).size === 0) {
      console.error(`Empty capture: ${screen.id}`);
      process.exitCode = 1;
      return;
    }
  }

  console.log(`All ${SCREENS.length} captures written to ${path.relative(projectRoot, capturesDir)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
