/**
 * Rich-text storage for the clinical free-text fields.
 *
 * The editor produces HTML, which is stored in the same nullable `String`
 * columns the plain textareas used (`Evoluciones.motivo`, `.examenFisico`,
 * `.plan`, `Interconsultas.notas`, `Hospitalizaciones.notas`,
 * `Pacientes.antecedentes`, `.medicacionHabitual`, ...). No migration is
 * needed: text written before this existed contains no tags, so it is treated
 * as plain text and wrapped on read.
 *
 * `AGENTS.md` requires that any patient text rendered as HTML be escaped.
 * Storing markup is the deliberate exception, so it is confined here:
 * everything is normalised through `sanitizeRichText` on the way in and on the
 * way out, against a closed allowlist with no attributes at all. That rules
 * out `<script>`, `<style>`, event handlers, `javascript:` URLs and `<img
 * onerror>` by construction rather than by filtering.
 *
 * DOM-free on purpose: this runs in the renderer, in the print template, and
 * under vitest's `node` environment, so it cannot depend on `DOMParser`.
 */

/** The only tags that survive sanitising. Inline marks plus lists and breaks. */
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
]);

/** Tags whose entire contents are dropped, not just their markup. */
const DROP_CONTENT_TAGS = new Set(["script", "style", "iframe", "object", "embed"]);

const VOID_TAGS = new Set(["br"]);

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** True when the value carries markup this module produced. */
export function isRichText(value: string | null | undefined): boolean {
  if (!value) return false;
  return /<\/?(p|br|strong|b|em|i|u|s|ul|ol|li)\b[^>]*>/i.test(value);
}

/**
 * Reduce a value to the allowlisted subset of HTML.
 *
 * Unknown tags lose their markup but keep their text, so pasting from a word
 * processor degrades to readable prose instead of vanishing. Attributes are
 * dropped wholesale — none of the allowed tags need one.
 */
export function sanitizeRichText(value: string | null | undefined): string {
  if (!value) return "";
  if (!isRichText(value)) return escapeText(value);

  let out = "";
  const open: string[] = [];
  let index = 0;

  while (index < value.length) {
    const lt = value.indexOf("<", index);
    if (lt < 0) {
      out += escapeText(value.slice(index));
      break;
    }

    out += escapeText(value.slice(index, lt));

    const gt = value.indexOf(">", lt);
    if (gt < 0) {
      // Unterminated tag: treat the remainder as text rather than guessing.
      out += escapeText(value.slice(lt));
      break;
    }

    const raw = value.slice(lt + 1, gt).trim();
    index = gt + 1;

    const closing = raw.startsWith("/");
    const name = (closing ? raw.slice(1) : raw).split(/[\s/>]/, 1)[0].toLowerCase();

    if (DROP_CONTENT_TAGS.has(name)) {
      // Skip the element's content as well as its markup.
      const end = value.toLowerCase().indexOf(`</${name}`, index);
      index = end < 0 ? value.length : (value.indexOf(">", end) + 1 || value.length);
      continue;
    }

    if (!ALLOWED_TAGS.has(name)) continue;

    if (VOID_TAGS.has(name)) {
      if (!closing) out += "<br>";
      continue;
    }

    if (closing) {
      // Only close a tag we actually opened, so stray closers cannot unbalance
      // the output.
      const at = open.lastIndexOf(name);
      if (at < 0) continue;
      for (let i = open.length - 1; i >= at; i -= 1) out += `</${open[i]}>`;
      open.length = at;
      continue;
    }

    open.push(name);
    out += `<${name}>`;
  }

  for (let i = open.length - 1; i >= 0; i -= 1) out += `</${open[i]}>`;
  return out;
}

/**
 * Plain-text form, for searching and for anywhere formatting is meaningless.
 *
 * Block boundaries become spaces so words cannot be welded together
 * ("<p>uno</p><p>dos</p>" must not read "unodos").
 */
export function richTextToPlainText(value: string | null | undefined): string {
  if (!value) return "";
  if (!isRichText(value)) return value;

  return value
    .replace(/<\s*(br|\/p|\/li|\/ul|\/ol)\s*\/?\s*>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Markup ready to render: sanitised, with legacy plain text wrapped.
 *
 * Always returns block-level markup. Lexical's root only accepts element
 * nodes, so returning a bare text run made `root.append` throw and took the
 * whole screen down when an existing record was opened for editing.
 */
export function richTextToHtml(value: string | null | undefined): string {
  if (!value) return "";
  if (!isRichText(value)) {
    // Preserve the line breaks a plain textarea allowed.
    return `<p>${escapeText(value).replace(/\r?\n/g, "<br>")}</p>`;
  }
  return sanitizeRichText(value);
}

/** True when the value holds nothing a clinician would consider written. */
export function isRichTextEmpty(value: string | null | undefined): boolean {
  return richTextToPlainText(value).length === 0;
}
