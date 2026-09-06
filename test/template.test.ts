import { describe, expect, it } from "vitest";
import { getTemplate } from "../src/Dialogs/HistoriaMedicaDialog/template";

type Paciente = Parameters<typeof getTemplate>[0];
type HistoryItem = Parameters<typeof getTemplate>[1][number];

const basePaciente = (overrides: Partial<Paciente> = {}): Paciente =>
  ({
    id: "p1",
    nombre: "Juan Perez",
    documento: "12345678",
    edad: 40,
    telefono: "123",
    direccion: "Calle Falsa 123",
    email: "juan@example.com",
    fechaNacimiento: new Date("1985-01-01"),
    obraSocial: "OSDE",
    numeroObraSocial: "999",
    antecedentes: "Ninguno",
    medicacionHabitual: "Ninguna",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as Paciente;

const evolucion = (overrides: Record<string, unknown> = {}): HistoryItem =>
  ({
    type: "evolucion",
    id: "e1",
    pacienteId: "p1",
    fecha: new Date("2024-01-01"),
    motivo: "Control",
    examenFisico: "Normal",
    plan: "Seguimiento",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as HistoryItem;

const hospitalizacion = (overrides: Record<string, unknown> = {}): HistoryItem =>
  ({
    type: "hospitalizacion",
    id: "h1",
    pacienteId: "p1",
    fechaIngreso: new Date("2024-01-01"),
    fechaEgreso: new Date("2024-01-05"),
    motivo: "Neumonia",
    notas: "Notas de internacion",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as HistoryItem;

const interconsulta = (overrides: Record<string, unknown> = {}): HistoryItem =>
  ({
    type: "interconsulta",
    id: "i1",
    pacienteId: "p1",
    fecha: new Date("2024-01-01"),
    motivo: "Derivacion",
    notas: "Notas de interconsulta",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as HistoryItem;

describe("getTemplate", () => {
  it("escapes a script tag injected via the patient's nombre", () => {
    const html = getTemplate(
      basePaciente({ nombre: "<script>alert(1)</script>" }),
      []
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes a script tag injected via the patient's antecedentes", () => {
    const html = getTemplate(
      basePaciente({ antecedentes: "<script>alert(2)</script>" }),
      []
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes a script tag injected via an evolucion's motivo and plan", () => {
    const html = getTemplate(basePaciente(), [
      evolucion({
        motivo: "<script>alert(3)</script>",
        plan: "<img src=x onerror=alert(4)>",
      }),
    ]);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<img src=x onerror=alert(4)>");
    expect(html).toContain("&lt;img src=x onerror=alert(4)&gt;");
  });

  it("escapes a script tag injected via a hospitalizacion's notas", () => {
    const html = getTemplate(basePaciente(), [
      hospitalizacion({ notas: "<script>alert(5)</script>" }),
    ]);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes a script tag injected via an interconsulta's notas", () => {
    const html = getTemplate(basePaciente(), [
      interconsulta({ notas: "<script>alert(6)</script>" }),
    ]);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("neutralises double quotes so they cannot break out of surrounding attributes", () => {
    const html = getTemplate(
      basePaciente({ direccion: 'Calle "Falsa" 123' }),
      []
    );
    const valueLine = html
      .split("\n")
      .find((line) => line.includes('Calle') && line.includes('Falsa'));
    expect(valueLine).toBeDefined();
    expect(valueLine).toContain("&quot;Falsa&quot;");
    expect(valueLine).not.toContain('"Falsa"');
  });

  it("escapes ampersand exactly once, without double-encoding", () => {
    const html = getTemplate(basePaciente(), [
      evolucion({ motivo: "Fiebre & tos" }),
    ]);
    expect(html).toContain("Fiebre &amp; tos");
    expect(html).not.toContain("&amp;amp;");
  });

  it("renders null and undefined demographic fields as empty strings", () => {
    const html = getTemplate(
      basePaciente({ telefono: null, direccion: undefined }),
      []
    );
    expect(html).not.toContain("null");
    expect(html).not.toContain("undefined");
  });

  it("renders null history fields as empty strings, not the literal text", () => {
    const html = getTemplate(basePaciente(), [
      hospitalizacion({ notas: null }),
    ]);
    expect(html).not.toContain(">null<");
  });

  it("passes legitimate accented Spanish text through unchanged", () => {
    const html = getTemplate(
      basePaciente({ antecedentes: "Hipertensión" }),
      []
    );
    expect(html).toContain("Hipertensión");
  });
});
