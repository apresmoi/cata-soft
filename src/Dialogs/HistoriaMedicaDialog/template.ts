import {
  Antropometrias,
  Evoluciones,
  Hospitalizaciones,
  Interconsultas,
  Pacientes,
} from "@prisma/client";
import { PacienteHistoryItem, usePaciente } from "../../hooks";

const head = `<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Historia Clínica</title>
    <style>
      html {
        max-width: 100vw;
      }
      @page {
        size: A4;
        margin: 0;
      }
      * {
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        margin: 0;
        padding: 10px;
        width: 100vw;
        overflow-x: hidden;
      }
      .header {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
      }
      .header-title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: left;
        text-transform: uppercase;
      }
      .header-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
      }
      .header-item {
        display: flex;
        flex-direction: column;
      }
      .label {
        font-weight: bold;
        color: #333;
        margin-bottom: 3px;
      }
      .divider {
        border-top: 1px solid #ccc;
        grid-column: span 3;
      }
      .value {
        border: 1px solid #ccc;
        padding: 5px;
        border-radius: 4px;
        background-color: #f9f9f9;
      }
      .full-width {
        grid-column: span 2;
      }

      /* Medical History Section */
      .medical-history {
        margin-top: 20px;
      }
      .section-title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
        text-transform: uppercase;
        border-bottom: 2px solid #888;
        padding-bottom: 5px;
      }
      .history-item {
        margin-bottom: 10px;
        padding: 10px;
        margin-top: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #f9f9f9;
      }
      .history-item-header {
        font-weight: bold;
        margin-bottom: 12px;
      }
      .history-field {
        margin-bottom: 10px;
      }
      .history-label {
        font-weight: bold;
        color: #333;
        display: inline-block;
        margin-right: 5px;
      }
      .history-value {
        display: inline-block;
        color: #000;
      }

      .history-item.flex {
        display: flex;
        justify-content: space-between;
        padding-right: 10%;
      }
      .history-item.flex .history-field {
        margin-bottom: 0;
      }
      .history-item.flex .history-item-header {
        margin-bottom: 0;
      }

      @media print {
        .history-item {
          page-break-inside: avoid;
        }
      }
    </style>
  </head>
`;

const headerFormatter = (paciente: ReturnType<typeof usePaciente>["data"]) => {
  return `<div class="header">
        <div class="header-title">INFORMACION DEL PACIENTE</div>
        <div class="header-grid">
            <div class="header-item">
                <span class="label">Nombre y Apellido:</span>
                <div class="value">${paciente?.nombre}</div>
            </div>
            <div class="header-item">
                <span class="label">DNI:</span>
                <div class="value">${paciente?.documento}</div>
            </div>
            <div class="header-item">
                <span class="label">Edad:</span>
                <div class="value">${paciente?.edad}</div>
            </div>
            <div class="header-item">
                <span class="label">Dirección:</span>
                <div class="value">${paciente?.direccion}</div>
            </div>
            <div class="header-item">
                <span class="label">Teléfono:</span>
                <div class="value">${paciente?.telefono}</div>
            </div>
            <div class="header-item">
                <span class="label">Email:</span>
                <div class="value">${paciente?.email}</div>
            </div>
            <div class="header-item">
                <span class="label">Obra Social:</span>
                <div class="value">${paciente?.obraSocial}</div>
            </div>
            <div class="header-item">
                <span class="label">Número:</span>
                <div class="value">${paciente?.numeroObraSocial}</div>
            </div>
        </div>
    </div>`;
};

const formatDate = (date?: Date | null) => {
  if (!date) return "";
  return date.toLocaleString("es-AR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

const antropometriaFormatter = (history: Antropometrias) => {
  return `<div class="history-item flex">
            <div class="history-item-header">Antropometría - ${formatDate(
              history.fecha
            )}</div>
            <div class="history-field">
                <span class="history-label">Peso:</span>
                <span class="history-value">${history.peso} kg</span>
            </div>
            <div class="history-field">
                <span class="history-label">Talla:</span>
                <span class="history-value">${history.talla} m</span>
            </div>
            <div class="history-field">
                <span class="history-label">IMC:</span>
                <span class="history-value">${history.imc}</span>
            </div>
        </div>`;
};

const hospitalizacionFormatter = (history: Hospitalizaciones) => {
  return `<div class="history-item">
                <div class="history-item-header">
                    Hospitalización - Ingreso: ${formatDate(
                      history.fechaIngreso
                    )} | Egreso: ${formatDate(history.fechaEgreso)}
                </div>
                <div class="history-field">
                    <span class="history-label">Motivo:</span>
                    <span class="history-value">${history.motivo || ""}</span>
                </div>
                <div class="history-field">
                    <span class="history-label">Notas:</span>
                    <span class="history-value">${history.notas || ""}</span>
                </div>
            </div>`;
};

const interconsultaFormatter = (history: Interconsultas) => {
  return `<div class="history-item">
                    <div class="history-item-header">Interconsulta - ${formatDate(
                      history.fecha
                    )}</div>
                    <div class="history-field">
                        <span class="history-label">Motivo:</span>
                        <span class="history-value">${
                          history.motivo || ""
                        }</span>
                    </div>
                    <div class="history-field">
                        <span class="history-label">Notas:</span>
                        <span class="history-value">${
                          history.notas || ""
                        }</span>
                    </div>
                </div>`;
};

const evolucionFormatter = (history: Evoluciones) => {
  return `<div class="history-item">
                        <div class="history-item-header">Evolución - ${formatDate(
                          history.fecha
                        )}</div>
                        <div class="history-field">
                            <span class="history-label">Motivo:</span>
                            <span class="history-value">${
                              history.motivo || ""
                            }</span>
                        </div>
                        <div class="history-field">
                            <span class="history-label">Examen Físico:</span>
                            <span class="history-value">${
                              history.examenFisico
                            }</span>
                        </div>
                        <div class="history-field">
                            <span class="history-label">Plan:</span>
                            <span class="history-value">${
                              history.plan || ""
                            }</span>
                        </div>
                    </div>`;
};

const historyItemFormatter = (history: PacienteHistoryItem) => {
  switch (history.type) {
    case "antropometria":
      return antropometriaFormatter(history);
    case "evolucion":
      return evolucionFormatter(history);
    case "hospitalizacion":
      return hospitalizacionFormatter(history);
    case "interconsulta":
      return interconsultaFormatter(history);
    default:
      return "";
  }
};

export const getTemplate = (
  paciente: ReturnType<typeof usePaciente>["data"],
  history: PacienteHistoryItem[]
) => `<!DOCTYPE html>
<html lang="en">
  ${head}
  <body>
    <!-- Header Section -->
    ${headerFormatter(paciente)}

    <!-- Medical History Section -->
    <div class="medical-history">
      <div class="section-title">HISTORIA CLÍNICA</div>
      ${history?.map((item) => historyItemFormatter(item)).join("")}
    </div>
  </body>
</html>
`;
