import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import type {
  AntropometriaRow,
  ArchivoRow,
  EvolucionRow,
  InterconsultaRow,
  InternacionRow,
  PatientData,
} from "./data";

/**
 * Centralized modal editing surface. Every record shown on the Resumen (and
 * the unified records table) is edited through one of these forms rather
 * than an inline strip -- callers pass a `ModalTarget` describing what to
 * edit (and, for record rows, the row itself when editing an existing one)
 * and this file owns rendering, local form state, and save wiring.
 */

export type ModalTarget =
  | { kind: "paciente" }
  | { kind: "antecedentes" }
  | { kind: "medicacion" }
  | { kind: "evolucion"; row?: EvolucionRow }
  | { kind: "antropometria"; row?: AntropometriaRow }
  | { kind: "interconsulta"; row?: InterconsultaRow }
  | { kind: "internacion"; row?: InternacionRow }
  | { kind: "archivo"; row?: ArchivoRow };

type EditModalProps = {
  target: ModalTarget;
  patient: PatientData;
  onClose: () => void;
  onSavePatient: (patch: Partial<PatientData>) => void;
  onSaveEvolucion: (row: EvolucionRow) => void;
  onSaveAntropometria: (row: AntropometriaRow) => void;
  onSaveInterconsulta: (row: InterconsultaRow) => void;
  onSaveInternacion: (row: InternacionRow) => void;
  onSaveArchivo: (row: ArchivoRow) => void;
};

const inputCls =
  "rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

/*
 * `<input type="date">` speaks calendar days, `Date` holds an instant. Going
 * through toISOString()/new Date(string) reads those days as UTC, which slides
 * the date one day back at every negative UTC offset -- a patient born on the
 * 17th showed up as the 16th in Buenos Aires. Both directions therefore use
 * local calendar components only.
 */
function toDateInputValue(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function parseDateInput(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date();
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function parseNumberInput(value: string): number {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function ModalShell(props: {
  title: string;
  maxWidth?: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") props.onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [props.onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4"
      onClick={props.onClose}
    >
      <div
        className={`w-full ${props.maxWidth ?? "max-w-lg"} rounded-xl border border-stone-200 bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="text-base font-semibold text-stone-900">{props.title}</h2>
          <button
            type="button"
            onClick={props.onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{props.children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-stone-200 px-5 py-4">
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={props.onSubmit}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field(props: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${props.className ?? ""}`}>
      <span className="font-medium text-stone-700">{props.label}</span>
      {props.children}
    </label>
  );
}

function PacienteForm(props: {
  patient: PatientData;
  onClose: () => void;
  onSavePatient: (patch: Partial<PatientData>) => void;
}) {
  const { patient } = props;
  const [nombre, setNombre] = useState(patient.nombre);
  const [documento, setDocumento] = useState(patient.documento);
  const [edad, setEdad] = useState(String(patient.edad));
  const [fechaNacimiento, setFechaNacimiento] = useState(toDateInputValue(patient.fechaNacimiento));
  const [telefono, setTelefono] = useState(patient.telefono);
  const [direccion, setDireccion] = useState(patient.direccion);
  const [email, setEmail] = useState(patient.email);
  const [obraSocial, setObraSocial] = useState(patient.obraSocial);
  const [numeroObraSocial, setNumeroObraSocial] = useState(patient.numeroObraSocial);

  function submit() {
    props.onSavePatient({
      nombre,
      documento,
      edad: parseNumberInput(edad),
      fechaNacimiento: parseDateInput(fechaNacimiento),
      telefono,
      direccion,
      email,
      obraSocial,
      numeroObraSocial,
    });
    props.onClose();
  }

  return (
    <ModalShell title="Editar datos del paciente" maxWidth="max-w-2xl" onClose={props.onClose} onSubmit={submit}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre completo">
          <input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Field>
        <Field label="Documento">
          <input className={inputCls} value={documento} onChange={(e) => setDocumento(e.target.value)} />
        </Field>
        <Field label="Edad">
          <input
            type="number"
            className={inputCls}
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
          />
        </Field>
        <Field label="Fecha de nacimiento">
          <input
            type="date"
            className={inputCls}
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
          />
        </Field>
        <Field label="Teléfono">
          <input className={inputCls} value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </Field>
        <Field label="Dirección">
          <input className={inputCls} value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </Field>
        <Field label="Email">
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Obra social">
          <input className={inputCls} value={obraSocial} onChange={(e) => setObraSocial(e.target.value)} />
        </Field>
        <Field label="N° de obra social">
          <input
            className={inputCls}
            value={numeroObraSocial}
            onChange={(e) => setNumeroObraSocial(e.target.value)}
          />
        </Field>
      </div>
    </ModalShell>
  );
}

function AntecedentesForm(props: {
  patient: PatientData;
  onClose: () => void;
  onSavePatient: (patch: Partial<PatientData>) => void;
}) {
  const [antecedentes, setAntecedentes] = useState(props.patient.antecedentes);

  function submit() {
    props.onSavePatient({ antecedentes });
    props.onClose();
  }

  return (
    <ModalShell title="Editar antecedentes" onClose={props.onClose} onSubmit={submit}>
      <Field label="Antecedentes">
        <textarea
          className={`${inputCls} min-h-[10rem] resize-y`}
          value={antecedentes}
          onChange={(e) => setAntecedentes(e.target.value)}
        />
      </Field>
    </ModalShell>
  );
}

function MedicacionForm(props: {
  patient: PatientData;
  onClose: () => void;
  onSavePatient: (patch: Partial<PatientData>) => void;
}) {
  const [medicacionHabitual, setMedicacionHabitual] = useState(props.patient.medicacionHabitual);

  function submit() {
    props.onSavePatient({ medicacionHabitual });
    props.onClose();
  }

  return (
    <ModalShell title="Editar medicación habitual" onClose={props.onClose} onSubmit={submit}>
      <Field label="Medicación habitual">
        <textarea
          className={`${inputCls} min-h-[10rem] resize-y`}
          value={medicacionHabitual}
          onChange={(e) => setMedicacionHabitual(e.target.value)}
        />
      </Field>
    </ModalShell>
  );
}

function EvolucionForm(props: {
  row?: EvolucionRow;
  onClose: () => void;
  onSaveEvolucion: (row: EvolucionRow) => void;
}) {
  const { row } = props;
  const [fecha, setFecha] = useState(toDateInputValue(row?.fecha ?? new Date()));
  const [motivo, setMotivo] = useState(row?.motivo ?? "");
  const [examenFisico, setExamenFisico] = useState(row?.examenFisico ?? "");
  const [plan, setPlan] = useState(row?.plan ?? "");

  function submit() {
    props.onSaveEvolucion({
      id: row?.id ?? crypto.randomUUID(),
      fecha: parseDateInput(fecha),
      motivo,
      examenFisico,
      plan,
    });
    props.onClose();
  }

  return (
    <ModalShell
      title={row ? "Editar evolución" : "Nueva evolución"}
      onClose={props.onClose}
      onSubmit={submit}
    >
      <div className="flex flex-col gap-4">
        <Field label="Fecha">
          <input type="date" className={inputCls} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Field>
        <Field label="Motivo">
          <input className={inputCls} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </Field>
        <Field label="Examen físico">
          <textarea
            className={`${inputCls} min-h-[6rem] resize-y`}
            value={examenFisico}
            onChange={(e) => setExamenFisico(e.target.value)}
          />
        </Field>
        <Field label="Plan">
          <textarea
            className={`${inputCls} min-h-[6rem] resize-y`}
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          />
        </Field>
      </div>
    </ModalShell>
  );
}

function AntropometriaForm(props: {
  row?: AntropometriaRow;
  onClose: () => void;
  onSaveAntropometria: (row: AntropometriaRow) => void;
}) {
  const { row } = props;
  const [fecha, setFecha] = useState(toDateInputValue(row?.fecha ?? new Date()));
  const [peso, setPeso] = useState(row ? String(row.peso) : "");
  const [talla, setTalla] = useState(row ? String(row.talla) : "");

  const pesoNum = parseNumberInput(peso);
  const tallaNum = parseNumberInput(talla);
  const imc = tallaNum > 0 ? pesoNum / (tallaNum * tallaNum) : 0;

  function submit() {
    props.onSaveAntropometria({
      id: row?.id ?? crypto.randomUUID(),
      fecha: parseDateInput(fecha),
      peso: pesoNum,
      talla: tallaNum,
      imc,
    });
    props.onClose();
  }

  return (
    <ModalShell
      title={row ? "Editar antropometría" : "Nueva antropometría"}
      onClose={props.onClose}
      onSubmit={submit}
    >
      <div className="flex flex-col gap-4">
        <Field label="Fecha">
          <input type="date" className={inputCls} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Field>
        <Field label="Peso (kg)">
          <input
            type="number"
            step="0.1"
            className={inputCls}
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
          />
        </Field>
        <Field label="Talla (m)">
          <input
            type="number"
            step="0.01"
            className={inputCls}
            value={talla}
            onChange={(e) => setTalla(e.target.value)}
          />
        </Field>
        <Field label="IMC (calculado)">
          <p className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
            {imc > 0 ? imc.toFixed(2) : "—"}
          </p>
        </Field>
      </div>
    </ModalShell>
  );
}

function InterconsultaForm(props: {
  row?: InterconsultaRow;
  onClose: () => void;
  onSaveInterconsulta: (row: InterconsultaRow) => void;
}) {
  const { row } = props;
  const [fecha, setFecha] = useState(toDateInputValue(row?.fecha ?? new Date()));
  const [especialidad, setEspecialidad] = useState(row?.especialidad ?? "");
  const [notas, setNotas] = useState(row?.notas ?? "");
  const [estado, setEstado] = useState<"pendiente" | "respondida">(row?.estado ?? "pendiente");

  function submit() {
    props.onSaveInterconsulta({
      id: row?.id ?? crypto.randomUUID(),
      fecha: parseDateInput(fecha),
      especialidad,
      notas,
      estado,
    });
    props.onClose();
  }

  return (
    <ModalShell
      title={row ? "Editar interconsulta" : "Nueva interconsulta"}
      onClose={props.onClose}
      onSubmit={submit}
    >
      <div className="flex flex-col gap-4">
        <Field label="Fecha">
          <input type="date" className={inputCls} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Field>
        <Field label="Especialidad">
          <input
            className={inputCls}
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
          />
        </Field>
        <Field label="Notas">
          <textarea
            className={`${inputCls} min-h-[6rem] resize-y`}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </Field>
        <Field label="Estado">
          <select
            className={inputCls}
            value={estado}
            onChange={(e) => setEstado(e.target.value as "pendiente" | "respondida")}
          >
            <option value="pendiente">Pendiente</option>
            <option value="respondida">Respondida</option>
          </select>
        </Field>
      </div>
    </ModalShell>
  );
}

function InternacionForm(props: {
  row?: InternacionRow;
  onClose: () => void;
  onSaveInternacion: (row: InternacionRow) => void;
}) {
  const { row } = props;
  const [ingreso, setIngreso] = useState(toDateInputValue(row?.ingreso ?? new Date()));
  const [egreso, setEgreso] = useState(toDateInputValue(row?.egreso ?? new Date()));
  const [motivo, setMotivo] = useState(row?.motivo ?? "");
  const [notas, setNotas] = useState(row?.notas ?? "");

  function submit() {
    props.onSaveInternacion({
      id: row?.id ?? crypto.randomUUID(),
      ingreso: parseDateInput(ingreso),
      egreso: parseDateInput(egreso),
      motivo,
      notas,
    });
    props.onClose();
  }

  return (
    <ModalShell
      title={row ? "Editar internación" : "Nueva internación"}
      onClose={props.onClose}
      onSubmit={submit}
    >
      <div className="flex flex-col gap-4">
        <Field label="Ingreso">
          <input type="date" className={inputCls} value={ingreso} onChange={(e) => setIngreso(e.target.value)} />
        </Field>
        <Field label="Egreso">
          <input type="date" className={inputCls} value={egreso} onChange={(e) => setEgreso(e.target.value)} />
        </Field>
        <Field label="Motivo">
          <input className={inputCls} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </Field>
        <Field label="Notas">
          <textarea
            className={`${inputCls} min-h-[6rem] resize-y`}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </Field>
      </div>
    </ModalShell>
  );
}

function ArchivoForm(props: {
  row?: ArchivoRow;
  onClose: () => void;
  onSaveArchivo: (row: ArchivoRow) => void;
}) {
  const { row } = props;
  const [nombre, setNombre] = useState(row?.nombre ?? "");
  const [tipo, setTipo] = useState(row?.tipo ?? "");
  const [fecha, setFecha] = useState(toDateInputValue(row?.fecha ?? new Date()));
  const [tamanioKb, setTamanioKb] = useState(row ? String(row.tamanioKb) : "");

  function submit() {
    props.onSaveArchivo({
      id: row?.id ?? crypto.randomUUID(),
      nombre,
      tipo,
      fecha: parseDateInput(fecha),
      tamanioKb: parseNumberInput(tamanioKb),
    });
    props.onClose();
  }

  return (
    <ModalShell title={row ? "Editar archivo" : "Adjuntar archivo"} onClose={props.onClose} onSubmit={submit}>
      <div className="flex flex-col gap-4">
        <Field label="Nombre">
          <input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Field>
        <Field label="Tipo">
          <input className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value)} />
        </Field>
        <Field label="Fecha">
          <input type="date" className={inputCls} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Field>
        <Field label="Tamaño (KB)">
          <input
            type="number"
            className={inputCls}
            value={tamanioKb}
            onChange={(e) => setTamanioKb(e.target.value)}
          />
        </Field>
      </div>
    </ModalShell>
  );
}

export function EditModal(props: EditModalProps): JSX.Element {
  const { target } = props;
  switch (target.kind) {
    case "paciente":
      return (
        <PacienteForm patient={props.patient} onClose={props.onClose} onSavePatient={props.onSavePatient} />
      );
    case "antecedentes":
      return (
        <AntecedentesForm patient={props.patient} onClose={props.onClose} onSavePatient={props.onSavePatient} />
      );
    case "medicacion":
      return (
        <MedicacionForm patient={props.patient} onClose={props.onClose} onSavePatient={props.onSavePatient} />
      );
    case "evolucion":
      return (
        <EvolucionForm row={target.row} onClose={props.onClose} onSaveEvolucion={props.onSaveEvolucion} />
      );
    case "antropometria":
      return (
        <AntropometriaForm
          row={target.row}
          onClose={props.onClose}
          onSaveAntropometria={props.onSaveAntropometria}
        />
      );
    case "interconsulta":
      return (
        <InterconsultaForm
          row={target.row}
          onClose={props.onClose}
          onSaveInterconsulta={props.onSaveInterconsulta}
        />
      );
    case "internacion":
      return (
        <InternacionForm
          row={target.row}
          onClose={props.onClose}
          onSaveInternacion={props.onSaveInternacion}
        />
      );
    case "archivo":
      return <ArchivoForm row={target.row} onClose={props.onClose} onSaveArchivo={props.onSaveArchivo} />;
  }
}
