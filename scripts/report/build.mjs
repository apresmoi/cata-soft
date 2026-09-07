/**
 * Builds the CataSoft development report PDF from `content.mjs` plus the
 * screenshots in `scripts/report/captures/`. Run with:
 *
 *   node scripts/report/build.mjs
 *
 * Images are embedded as base64 data URIs so the printed page never depends
 * on file:// resolution or network access.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { REPORT, SCREENS } from "./content.mjs";

const REPORT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(REPORT_DIR, "..", "..");
const CAPTURES_DIR = join(REPORT_DIR, "captures");
const CSS_PATH = join(REPORT_DIR, "report.css");
const DOCS_DIR = join(ROOT_DIR, "docs");

/** Escapes text that is not meant to be interpreted as HTML. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function tryGit(args, fallback) {
  try {
    return execFileSync("git", args, { cwd: ROOT_DIR, encoding: "utf8" }).trim() || fallback;
  } catch {
    return fallback;
  }
}

function mimeFor(path) {
  const ext = extname(path).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

/** Reads a file relative to the repo root and returns it as a data: URI. */
function fileToDataUri(pathFromRoot) {
  const absolute = join(ROOT_DIR, pathFromRoot);
  const buffer = readFileSync(absolute);
  return `data:${mimeFor(absolute)};base64,${buffer.toString("base64")}`;
}

function captureToDataUri(id) {
  const absolute = join(CAPTURES_DIR, `${id}.png`);
  const buffer = readFileSync(absolute);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function resolveMetadata() {
  const pkg = JSON.parse(readFileSync(join(ROOT_DIR, "package.json"), "utf8"));
  const commit = tryGit(["rev-parse", "--short", "HEAD"], "sin git");
  const branch = tryGit(["rev-parse", "--abbrev-ref", "HEAD"], "sin git");
  const date = new Date().toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return { version: pkg.version, commit, branch, date };
}

function assertCapturesExist() {
  const missing = [];
  for (const id of SCREENS.map((screen) => screen.id)) {
    if (!existsSync(join(CAPTURES_DIR, `${id}.png`))) missing.push(id);
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing screenshot(s): ${missing.join(", ")}. Run "node scripts/report/capture.mjs" first.`,
    );
  }
}

function captionFor(id) {
  const screen = SCREENS.find((entry) => entry.id === id);
  if (!screen) throw new Error(`Section references unknown screen id "${id}".`);
  return screen.caption;
}

function renderCover(cover, meta) {
  const logo = fileToDataUri(cover.logo);
  const stack = cover.stack
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("\n");
  return `
    <section class="page cover">
      <img class="cover-logo" src="${logo}" alt="Logo" />
      <div class="cover-product">${escapeHtml(cover.product)}</div>
      <div class="cover-tagline">${escapeHtml(cover.tagline)}</div>
      <div class="cover-doctitle">${escapeHtml(cover.documentTitle)}</div>
      <div class="cover-meta">
        <div><b>Versión</b> ${escapeHtml(meta.version)}</div>
        <div><b>Fecha</b> ${escapeHtml(meta.date)}</div>
        <div><b>Rama</b> ${escapeHtml(meta.branch)}</div>
        <div><b>Commit</b> ${escapeHtml(meta.commit)}</div>
      </div>
      <ul class="cover-stack">${stack}</ul>
    </section>
  `;
}

function renderChangelog(changelog) {
  const items = changelog
    .map(
      (entry) => `
      <li class="changelog-item">
        <span class="chip">${escapeHtml(entry.tag)}</span>
        <span class="changelog-text">${entry.text}</span>
      </li>`,
    )
    .join("\n");
  return `
    <section class="page">
      <h2>Changelog</h2>
      <ul class="changelog-list">${items}</ul>
    </section>
  `;
}

function renderIntro(intro) {
  const paragraphs = intro.map((paragraph) => `<p>${paragraph}</p>`).join("\n");
  return `
    <section class="page">
      <h2>Introducción</h2>
      ${paragraphs}
    </section>
  `;
}

function renderScreen(id) {
  const src = captureToDataUri(id);
  const caption = captionFor(id);
  return `
    <figure class="screen">
      <img src="${src}" alt="${escapeHtml(caption)}" />
      <figcaption>${escapeHtml(caption)}</figcaption>
    </figure>
  `;
}

function renderSections(sections) {
  return sections
    .map(
      (section) => `
      <section class="page">
        <h2 class="section-title">${section.title}</h2>
        <div class="section-body">${section.body}</div>
        <div class="screens">
          ${section.screens.map(renderScreen).join("\n")}
        </div>
      </section>`,
    )
    .join("\n");
}

function renderEntryList(title, entries) {
  const items = entries
    .map(
      (entry) => `
      <div class="entry">
        <div class="entry-title">${entry.title}</div>
        <div class="entry-body">${entry.body}</div>
      </div>`,
    )
    .join("\n");
  return `
    <section class="page">
      <h2>${escapeHtml(title)}</h2>
      <div class="entry-list">${items}</div>
    </section>
  `;
}

function renderPlainList(title, paragraphs) {
  const items = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("\n");
  return `
    <section class="page">
      <h2>${escapeHtml(title)}</h2>
      <div class="plain-list">${items}</div>
    </section>
  `;
}

function renderDocument(meta) {
  const css = readFileSync(CSS_PATH, "utf8");
  const body = [
    renderCover(REPORT.cover, meta),
    renderChangelog(REPORT.changelog),
    renderIntro(REPORT.intro),
    renderSections(REPORT.sections),
    renderEntryList("Decisiones de diseño", REPORT.decisions),
    renderEntryList("Errores corregidos", REPORT.fixes),
    renderPlainList("Seguridad", REPORT.security),
    renderPlainList("Publicación de versiones", REPORT.releases),
    renderPlainList("Pendientes", REPORT.pending),
  ].join("\n");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(REPORT.title)}</title>
<style>${css}</style>
</head>
<body>
${body}
</body>
</html>`;
}

async function main() {
  assertCapturesExist();

  const meta = resolveMetadata();
  const html = renderDocument(meta);

  mkdirSync(DOCS_DIR, { recursive: true });
  const outputPath = join(DOCS_DIR, `CataSoft-Reporte-de-desarrollo-v${meta.version}.pdf`);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    // Data-URI images are already inline, but give layout/fonts a moment to settle.
    await page.evaluate(async () => {
      const images = Array.from(document.images);
      await Promise.all(
        images.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              }),
        ),
      );
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    });

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "18mm", left: "16mm", right: "16mm" },
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `
        <div style="font-family: -apple-system, Arial, sans-serif; font-size: 8pt; color: #78716c; width: 100%; padding: 0 16mm; display: flex; justify-content: space-between;">
          <span>CataSoft — Reporte de desarrollo v${escapeHtml(meta.version)}</span>
          <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
      `,
    });
  } finally {
    await browser.close();
  }

  console.log(`Reporte generado: ${outputPath}`);
}

main().catch((error) => {
  console.error(`Error al generar el reporte: ${error.message}`);
  process.exitCode = 1;
});
