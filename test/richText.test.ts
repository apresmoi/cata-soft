import { describe, expect, it } from "vitest";
import {
  isRichText,
  isRichTextEmpty,
  richTextToHtml,
  richTextToPlainText,
  sanitizeRichText,
} from "../src/richText";

/**
 * These fields hold patient text that ends up inside the printed clinical
 * summary, so the allowlist is a security boundary, not a formatting
 * preference. `AGENTS.md` requires patient text rendered as HTML to be
 * escaped; storing markup is the deliberate exception and this is the test
 * that keeps the exception narrow.
 */
describe("sanitizeRichText", () => {
  it("keeps the formatting a clinician can apply", () => {
    expect(sanitizeRichText("<p>Dolor <strong>agudo</strong></p>")).toBe(
      "<p>Dolor <strong>agudo</strong></p>"
    );
    expect(sanitizeRichText("<ul><li>uno</li><li>dos</li></ul>")).toBe(
      "<ul><li>uno</li><li>dos</li></ul>"
    );
    expect(sanitizeRichText("<p>a<br>b</p>")).toBe("<p>a<br>b</p>");
  });

  it("drops script and style with their contents", () => {
    expect(sanitizeRichText("<p>hola</p><script>alert(1)</script>")).toBe("<p>hola</p>");
    expect(sanitizeRichText("<style>p{x:1}</style><p>hola</p>")).toBe("<p>hola</p>");
    expect(sanitizeRichText("<p>a</p><script>alert('x')</script><p>b</p>")).toBe(
      "<p>a</p><p>b</p>"
    );
  });

  it("strips attributes, so handlers and javascript urls cannot survive", () => {
    expect(sanitizeRichText('<p onclick="steal()">texto</p>')).toBe("<p>texto</p>");
    expect(sanitizeRichText('<strong style="position:fixed">t</strong>')).toBe(
      "<strong>t</strong>"
    );
    const result = sanitizeRichText('<p><a href="javascript:alert(1)">click</a></p>');
    expect(result).toBe("<p>click</p>");
    expect(result).not.toContain("javascript");
  });

  it("unwraps disallowed tags but keeps their text", () => {
    expect(sanitizeRichText('<p>ver <img src="x" onerror="alert(1)">radiografía</p>')).toBe(
      "<p>ver radiografía</p>"
    );
    expect(sanitizeRichText("<div><p>texto</p></div>")).toBe("<p>texto</p>");
  });

  it("balances the output when the input is malformed", () => {
    expect(sanitizeRichText("<p>abierto")).toBe("<p>abierto</p>");
    expect(sanitizeRichText("texto</strong>")).toBe("texto");
    expect(sanitizeRichText("<p>a<strong>b</p>")).toBe("<p>a<strong>b</strong></p>");
  });

  it("escapes text that only looks like markup", () => {
    expect(sanitizeRichText("TA < 130/85")).toBe("TA &lt; 130/85");
    expect(sanitizeRichText("dosis 5 mg & 10 mg")).toBe("dosis 5 mg &amp; 10 mg");
  });

  it("returns an empty string for absent values", () => {
    expect(sanitizeRichText(null)).toBe("");
    expect(sanitizeRichText(undefined)).toBe("");
    expect(sanitizeRichText("")).toBe("");
  });

  it("escapes an unterminated tag instead of guessing where it ends", () => {
    // A truncated paste must not silently swallow the rest of a note.
    expect(sanitizeRichText("<p>dosis <strong")).toBe("<p>dosis &lt;strong</p>");
    expect(sanitizeRichText("<p>ok</p><script")).toBe("<p>ok</p>&lt;script");
  });

  it("drops an unterminated script to the end of the input", () => {
    // No closing tag to scan to: everything after it must go, not be emitted.
    expect(sanitizeRichText("<p>ok</p><script>alert(1)")).toBe("<p>ok</p>");
  });
});

describe("richTextToPlainText", () => {
  it("separates blocks so words are not welded together", () => {
    expect(richTextToPlainText("<p>uno</p><p>dos</p>")).toBe("uno dos");
    expect(richTextToPlainText("<ul><li>uno</li><li>dos</li></ul>")).toBe("uno dos");
    expect(richTextToPlainText("<p>a<br>b</p>")).toBe("a b");
  });

  it("keeps legacy plain text untouched", () => {
    expect(richTextToPlainText("Control de presion arterial")).toBe(
      "Control de presion arterial"
    );
  });

  it("decodes the entities it produced, so search matches what is displayed", () => {
    expect(richTextToPlainText("<p>TA &lt; 130 &amp; estable</p>")).toBe(
      "TA < 130 & estable"
    );
  });
});

describe("richTextToHtml", () => {
  it("always returns block markup, because Lexical's root rejects bare text", () => {
    expect(richTextToHtml("linea uno\nlinea dos")).toBe("<p>linea uno<br>linea dos</p>");
    expect(richTextToHtml("hola")).toBe("<p>hola</p>");
  });

  it("escapes legacy text rather than trusting it", () => {
    expect(richTextToHtml("5 < 10")).toBe("<p>5 &lt; 10</p>");
  });

  it("passes stored markup through the allowlist", () => {
    expect(richTextToHtml("<p>a<script>x()</script></p>")).toBe("<p>a</p>");
  });
});

describe("isRichText / isRichTextEmpty", () => {
  it("tells markup from prose", () => {
    expect(isRichText("<p>hola</p>")).toBe(true);
    expect(isRichText("hola")).toBe(false);
    expect(isRichText(null)).toBe(false);
  });

  it("treats an empty editor as empty, whatever wrapper it left behind", () => {
    expect(isRichTextEmpty("<p></p>")).toBe(true);
    expect(isRichTextEmpty("<p><br></p>")).toBe(true);
    expect(isRichTextEmpty("<p>algo</p>")).toBe(false);
    expect(isRichTextEmpty("")).toBe(true);
  });
});
