/**
 * Fixture data for the design gallery.
 *
 * The gallery renders the real screens, which talk to the main process over
 * `window.ipcRenderer`. In a browser that object does not exist, so we install
 * a stub backed by this data. Inside the Electron app the real bridge is left
 * alone and the gallery shows live records.
 *
 * Invented names only -- never point this at real patient data.
 */

const now = new Date();

function daysAgo(days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

const paciente = {
  id: "p1",
  nombre: "MARIA LOPEZ FERNANDEZ",
  documento: "30.145.678",
  edad: 43,
  fechaNacimiento: new Date(1982, 4, 17),
  telefono: "+54 11 4555 1234",
  direccion: "Av. Rivadavia 4820, CABA",
  email: "maria.lopez@example.com",
  obraSocial: "OSDE",
  numeroObraSocial: "210-4455-01",
  antecedentes:
    "Hipertension arterial diagnosticada en 2019. Apendicectomia en 2005. Sin alergias conocidas.",
  medicacionHabitual: "Enalapril 10mg cada 12h. Vitamina D 1000UI diaria.",
  createdAt: daysAgo(420),
  updatedAt: daysAgo(3),
};

const pacientes = [
  paciente,
  {
    ...paciente,
    id: "p2",
    nombre: "JORGE ALBERTO SOSA",
    documento: "24.980.112",
    edad: 57,
    fechaNacimiento: new Date(1968, 10, 2),
    obraSocial: "SWISS MEDICAL",
    numeroObraSocial: "884-1200-77",
  },
  {
    ...paciente,
    id: "p3",
    nombre: "CARLA BEATRIZ MENDEZ",
    documento: "38.221.905",
    edad: 31,
    fechaNacimiento: new Date(1994, 2, 21),
    obraSocial: "IOMA",
    numeroObraSocial: "455-9081-04",
  },
  {
    ...paciente,
    id: "p4",
    nombre: "HECTOR RAMIREZ",
    documento: "16.774.320",
    edad: 68,
    fechaNacimiento: new Date(1957, 7, 9),
    obraSocial: "PAMI",
    numeroObraSocial: "101-7788-12",
  },
];

const evolucion = {
  id: "e1",
  pacienteId: "p1",
  fecha: daysAgo(3),
  motivo: "Control de presion arterial. Refiere buena adherencia al tratamiento.",
  examenFisico: "TA 130/85. Frecuencia cardiaca 72 lpm. Auscultacion sin particularidades.",
  plan: "Continuar enalapril. Control en 3 meses con laboratorio.",
  createdAt: daysAgo(3),
  updatedAt: daysAgo(3),
};

const interconsulta = {
  id: "i1",
  pacienteId: "p1",
  fecha: daysAgo(21),
  motivo: "Cardiologia",
  notas: "Se solicita ecocardiograma y evaluacion de riesgo cardiovascular.",
  createdAt: daysAgo(21),
  updatedAt: daysAgo(21),
};

const antropometria = {
  id: "a1",
  pacienteId: "p1",
  fecha: daysAgo(3),
  peso: 68.4,
  talla: 1.62,
  imc: 26.1,
  createdAt: daysAgo(3),
  updatedAt: daysAgo(3),
};

const hospitalizacion = {
  id: "h1",
  pacienteId: "p1",
  fechaIngreso: daysAgo(180),
  fechaEgreso: daysAgo(176),
  motivo: "Neumonia adquirida en la comunidad",
  notas: "Tratamiento antibiotico endovenoso. Evolucion favorable, alta sin oxigeno.",
  createdAt: daysAgo(180),
  updatedAt: daysAgo(176),
};

const archivo = {
  id: "f1",
  pacienteId: "p1",
  tipo: "application/pdf",
  nombre: "laboratorio-marzo.pdf",
  notas: "Hemograma y perfil lipidico",
  path: "/uploads/p1/laboratorio-marzo.pdf",
  createdAt: daysAgo(30),
  updatedAt: daysAgo(30),
};

const historial = [
  { ...evolucion, type: "evolucion" },
  { ...antropometria, type: "antropometria" },
  { ...interconsulta, type: "interconsulta" },
  { ...archivo, type: "archivoadjunto" },
  { ...hospitalizacion, fecha: hospitalizacion.fechaIngreso, type: "hospitalizacion" },
];

/**
 * Direct exports for the layout variants, which restructure the screens and so
 * do not go through the app's hooks. Same data the bridge serves.
 */
export const FIXTURES = {
  paciente,
  pacientes,
  historial,
  evolucion,
  interconsulta,
  antropometria,
  hospitalizacion,
  archivo,
};

export type HistorialEntry = (typeof historial)[number];
export type Paciente = typeof paciente;

const responses: Record<string, unknown> = {
  "get-pacientes": pacientes,
  "get-paciente": paciente,
  "get-historial": historial,
  "get-archivos": [archivo],
  "get-evolucion": evolucion,
  "get-interconsulta": interconsulta,
  "get-antropometria": antropometria,
  "get-hospitalizacion": hospitalizacion,
};

/** Install the fixture bridge only when the real one is absent. */
export function installFixtureBridge() {
  if ("ipcRenderer" in window) return false;

  Object.defineProperty(window, "ipcRenderer", {
    value: {
      invoke: async (channel: string) => responses[channel] ?? null,
    },
    configurable: true,
  });

  return true;
}
