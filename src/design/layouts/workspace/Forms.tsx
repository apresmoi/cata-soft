import React, { useState } from "react";
import type { AntropometriaRow, ArchivoRow, EvolucionRow, InterconsultaRow, InternacionRow } from "./data";

/**
 * Inline "form bar" treatment: a full-width strip that expands in place at
 * the top of the active tab, fields laid out side by side, Guardar/Cancelar
 * on the right. Never a centred modal, never internal tabs -- every field for
 * a record type is visible and editable at once.
 */

function FormShell(props: { title: string; onCancel: () => void; onSubmit: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50/60 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-800">{props.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={props.onCancel}
            className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            onClick={props.onSubmit}
            className="rounded-md bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
          >
            Guardar
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">{props.children}</div>
    </div>
  );
}

function Field(props: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${props.className ?? ""}`}>
      <span className="font-medium text-stone-500">{props.label}</span>
      {props.children}
    </label>
  );
}

const inputCls = "rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-800 focus:border-teal-500 focus:outline-none";

export function EvolucionFormBar(props: { onSave: (row: EvolucionRow) => void; onCancel: () => void }) {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [motivo, setMotivo] = useState("");
  const [examenFisico, setExamenFisico] = useState("");
  const [plan, setPlan] = useState("");

  function submit() {
    props.onSave({
      id: `e-${Date.now()}`,
      fecha: new Date(fecha),
      motivo: motivo || "Sin motivo consignado.",
      examenFisico: examenFisico || "Sin hallazgos consignados.",
      plan: plan || "Sin plan consignado.",
    });
  }

  return (
    <FormShell title="Nueva evolución" onCancel={props.onCancel} onSubmit={submit}>
      <Field label="Fecha" className="w-36">
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Motivo de consulta" className="min-w-[220px] flex-1">
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className={inputCls} placeholder="Ej: control de rutina" />
      </Field>
      <Field label="Examen físico" className="min-w-[220px] flex-1">
        <input value={examenFisico} onChange={(e) => setExamenFisico(e.target.value)} className={inputCls} placeholder="Hallazgos al examen" />
      </Field>
      <Field label="Plan" className="min-w-[220px] flex-1">
        <input value={plan} onChange={(e) => setPlan(e.target.value)} className={inputCls} placeholder="Conducta / seguimiento" />
      </Field>
    </FormShell>
  );
}

export function AntropometriaFormBar(props: { onSave: (row: AntropometriaRow) => void; onCancel: () => void }) {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [peso, setPeso] = useState("70");
  const [talla, setTalla] = useState("1.62");

  const pesoNum = parseFloat(peso) || 0;
  const tallaNum = parseFloat(talla) || 1;
  const imc = Math.round((pesoNum / (tallaNum * tallaNum)) * 10) / 10;

  function submit() {
    props.onSave({ id: `a-${Date.now()}`, fecha: new Date(fecha), peso: pesoNum, talla: tallaNum, imc });
  }

  return (
    <FormShell title="Nueva antropometría" onCancel={props.onCancel} onSubmit={submit}>
      <Field label="Fecha" className="w-36">
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Peso (kg)" className="w-28">
        <input type="number" step="0.1" value={peso} onChange={(e) => setPeso(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Talla (m)" className="w-28">
        <input type="number" step="0.01" value={talla} onChange={(e) => setTalla(e.target.value)} className={inputCls} />
      </Field>
      <Field label="IMC calculado" className="w-28">
        <div className={`${inputCls} bg-stone-100 font-semibold text-teal-800`}>{imc || "--"}</div>
      </Field>
    </FormShell>
  );
}

export function InterconsultaFormBar(props: { onSave: (row: InterconsultaRow) => void; onCancel: () => void }) {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [especialidad, setEspecialidad] = useState("");
  const [notas, setNotas] = useState("");
  const [estado, setEstado] = useState<"pendiente" | "respondida">("pendiente");

  function submit() {
    props.onSave({
      id: `i-${Date.now()}`,
      fecha: new Date(fecha),
      especialidad: especialidad || "Sin especificar",
      notas,
      estado,
    });
  }

  return (
    <FormShell title="Nueva interconsulta" onCancel={props.onCancel} onSubmit={submit}>
      <Field label="Fecha" className="w-36">
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Especialidad" className="w-48">
        <input value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} className={inputCls} placeholder="Ej: Cardiología" />
      </Field>
      <Field label="Estado" className="w-40">
        <select value={estado} onChange={(e) => setEstado(e.target.value as "pendiente" | "respondida")} className={inputCls}>
          <option value="pendiente">Pendiente</option>
          <option value="respondida">Respondida</option>
        </select>
      </Field>
      <Field label="Notas" className="min-w-[220px] flex-1">
        <input value={notas} onChange={(e) => setNotas(e.target.value)} className={inputCls} placeholder="Motivo / observaciones" />
      </Field>
    </FormShell>
  );
}

export function InternacionFormBar(props: { onSave: (row: InternacionRow) => void; onCancel: () => void }) {
  const [ingreso, setIngreso] = useState(new Date().toISOString().slice(0, 10));
  const [egreso, setEgreso] = useState(new Date().toISOString().slice(0, 10));
  const [motivo, setMotivo] = useState("");
  const [notas, setNotas] = useState("");

  function submit() {
    props.onSave({
      id: `h-${Date.now()}`,
      ingreso: new Date(ingreso),
      egreso: new Date(egreso),
      motivo: motivo || "Sin especificar",
      notas,
    });
  }

  return (
    <FormShell title="Nueva internación" onCancel={props.onCancel} onSubmit={submit}>
      <Field label="Ingreso" className="w-36">
        <input type="date" value={ingreso} onChange={(e) => setIngreso(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Egreso" className="w-36">
        <input type="date" value={egreso} onChange={(e) => setEgreso(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Motivo" className="min-w-[220px] flex-1">
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} className={inputCls} placeholder="Diagnóstico de ingreso" />
      </Field>
      <Field label="Notas de evolución" className="min-w-[220px] flex-1">
        <input value={notas} onChange={(e) => setNotas(e.target.value)} className={inputCls} placeholder="Curso clínico / alta" />
      </Field>
    </FormShell>
  );
}

export function ArchivoFormBar(props: { onSave: (row: ArchivoRow) => void; onCancel: () => void }) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("PDF");

  function submit() {
    props.onSave({
      id: `f-${Date.now()}`,
      nombre: nombre || "documento.pdf",
      tipo,
      fecha: new Date(),
      tamanioKb: 128,
    });
  }

  return (
    <FormShell title="Adjuntar archivo" onCancel={props.onCancel} onSubmit={submit}>
      <Field label="Nombre de archivo" className="min-w-[220px] flex-1">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputCls} placeholder="laboratorio-junio.pdf" />
      </Field>
      <Field label="Tipo" className="w-40">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
          <option value="PDF">PDF</option>
          <option value="Imagen">Imagen</option>
          <option value="Documento">Documento</option>
        </select>
      </Field>
      <Field label="Origen" className="w-56">
        <div className={`${inputCls} bg-stone-100 text-stone-500`}>Selector de archivo (simulado)</div>
      </Field>
    </FormShell>
  );
}
