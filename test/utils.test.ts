import { describe, expect, it } from "vitest";
import { parseFile, parseFileName } from "../src/utils";

describe("parseFileName", () => {
  it("splits a normal name on the last dot", () => {
    expect(parseFileName("informe.pdf")).toEqual({
      name: "informe",
      extension: ".pdf",
    });
  });

  it("keeps everything before the LAST dot as the name", () => {
    expect(parseFileName("a.b.pdf")).toEqual({
      name: "a.b",
      extension: ".pdf",
    });
  });

  it("includes the leading dot in the returned extension", () => {
    const result = parseFileName("photo.png");
    expect(result?.extension.startsWith(".")).toBe(true);
    expect(result?.extension).toBe(".png");
  });

  it("returns the whole string as name with an empty extension when the dot is the first character", () => {
    expect(parseFileName(".hidden")).toEqual({
      name: ".hidden",
      extension: "",
    });
  });

  it("returns the whole string as name with an empty extension when the dot is the last character", () => {
    expect(parseFileName("trailing.")).toEqual({
      name: "trailing.",
      extension: "",
    });
  });

  it("returns an empty extension when there is no dot at all", () => {
    expect(parseFileName("noextension")).toEqual({
      name: "noextension",
      extension: "",
    });
  });

  it("returns null when the extension contains a space", () => {
    expect(parseFileName("report.p df")).toBeNull();
  });

  it("returns null when the extension contains a slash", () => {
    expect(parseFileName("report.p/df")).toBeNull();
  });

  it("trims whitespace around the name and extension", () => {
    expect(parseFileName("  informe  . pdf ")).toEqual({
      name: "informe",
      extension: ".pdf",
    });
  });

  it("returns null when the name is only whitespace before the dot", () => {
    expect(parseFileName("   .pdf")).toBeNull();
  });
});

describe("parseFile", () => {
  it("returns null for undefined", () => {
    expect(parseFile(undefined)).toBeNull();
  });

  it("returns null for null", () => {
    expect(parseFile(null)).toBeNull();
  });

  it("returns null when name is not a string", () => {
    const file = { name: 123 } as unknown as File;
    expect(parseFile(file)).toBeNull();
  });

  it("returns the file reference plus the parsed name/extension on success", () => {
    const file = { name: "informe.pdf" } as unknown as File;
    expect(parseFile(file)).toEqual({
      file,
      name: "informe",
      extension: ".pdf",
    });
  });

  // parseFileName returns null for a filename with an invalid extension. parseFile
  // spreads that null result (`...null`), which contributes no keys at all, so the
  // caller gets back only `{ file }` with no `name`/`extension` properties — not a
  // `{ file, name: null, extension: null }` shape one might expect. This is a design
  // smell worth flagging (see report), but it is the actual, verified contract.
  it("returns only the file reference when the filename is invalid, with no name/extension keys", () => {
    const file = { name: "report.p df" } as unknown as File;
    const result = parseFile(file);
    expect(result).toEqual({ file });
    expect(result && "name" in result).toBe(false);
    expect(result && "extension" in result).toBe(false);
  });
});
