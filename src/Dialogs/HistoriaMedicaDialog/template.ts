import {
  Antropometrias,
  Evoluciones,
  Hospitalizaciones,
  Interconsultas,
} from "@prisma/client";
import { PacienteHistoryItem, usePaciente } from "../../hooks";

// Escapes values interpolated into the printable HTML template. Every value
// that originates from the database (patient demographics, history notes)
// or otherwise from user input MUST pass through this before being embedded
// in the srcDoc HTML, since the iframe renders that markup directly.
const esc = (v: unknown): string =>
  v == null
    ? ""
    : String(v)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

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
      .section {
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
                <span class="label">NOMBRE Y APELLIDO:</span>
                <div class="value">${esc(paciente?.nombre)}</div>
            </div>
            <div class="header-item">
                <span class="label">DNI:</span>
                <div class="value">${esc(paciente?.documento)}</div>
            </div>
            <div class="header-item">
                <span class="label">EDAD:</span>
                <div class="value">${esc(paciente?.edad)}</div>
            </div>
            <div class="header-item">
                <span class="label">DIRECCIÓN:</span>
                <div class="value">${esc(paciente?.direccion)}</div>
            </div>
            <div class="header-item">
                <span class="label">TELÉFONO:</span>
                <div class="value">${esc(paciente?.telefono)}</div>
            </div>
            <div class="header-item">
                <span class="label">EMAIL:</span>
                <div class="value">${esc(paciente?.email)}</div>
            </div>
            <div class="header-item">
                <span class="label">OBRA SOCIAL:</span>
                <div class="value">${esc(paciente?.obraSocial)}</div>
            </div>
            <div class="header-item">
                <span class="label">NÚMERO:</span>
                <div class="value">${esc(paciente?.numeroObraSocial)}</div>
            </div>
        </div>
    </div>
    <div class="section">
      <div class="section-title">ANTECEDENTES</div>
      <div class="section-content">
        ${esc(paciente?.antecedentes)}
      </div>
    </div>

    <div class="section">
      <div class="section-title">MEDICACION HABITUAL</div>
      <div class="section-content">
        ${esc(paciente?.medicacionHabitual)}
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
                <div class="history-item-header">ANTROPOMETRÍA - ${formatDate(
                  history.fecha
                )}</div>
            <div class="history-field">
                <span class="history-label">PESO:</span>
                <span class="history-value">${esc(history.peso)} KG</span>
            </div>
            <div class="history-field">
                <span class="history-label">TALLA:</span>
                <span class="history-value">${esc(history.talla)} m</span>
            </div>
            <div class="history-field">
                <span class="history-label">IMC:</span>
                <span class="history-value">${esc(history.imc)}</span>
            </div>
        </div>`;
};

const hospitalizacionFormatter = (history: Hospitalizaciones) => {
  return `<div class="history-item">
                <div class="history-item-header">
                    HOSPITALIZACIÓN - INGRESO: ${formatDate(
                      history.fechaIngreso
                    )} | EGRESO: ${formatDate(history.fechaEgreso)}
                </div>
                <div class="history-field">
                    <span class="history-label">MOTIVO:</span>
                    <span class="history-value">${esc(history.motivo || "")}</span>
                </div>
                <div class="history-field">
                    <span class="history-label">NOTAS:</span>
                    <span class="history-value">${esc(history.notas || "")}</span>
                </div>
            </div>`;
};

const interconsultaFormatter = (history: Interconsultas) => {
  return `<div class="history-item">
                    <div class="history-item-header">Interconsulta - ${formatDate(
                      history.fecha
                    )}</div>
                    <div class="history-field">
                        <span class="history-label">MOTIVO:</span>
                        <span class="history-value">${esc(
                          history.motivo || ""
                        )}</span>
                    </div>
                    <div class="history-field">
                        <span class="history-label">NOTAS:</span>
                        <span class="history-value">${esc(
                          history.notas || ""
                        )}</span>
                    </div>
                </div>`;
};

const evolucionFormatter = (history: Evoluciones) => {
  return `<div class="history-item">
                        <div class="history-item-header">EVOLUCIÓN - ${formatDate(
                          history.fecha
                        )}</div>
                        <div class="history-field">
                            <span class="history-label">MOTIVO:</span>
                            <span class="history-value">${esc(
                              history.motivo || ""
                            )}</span>
                        </div>
                        <div class="history-field">
                            <span class="history-label">EXAMEN FÍSICO:</span>
                            <span class="history-value">${esc(
                              history.examenFisico || ""
                            )}</span>
                        </div>
                        <div class="history-field">
                            <span class="history-label">PLAN:</span>
                            <span class="history-value">${esc(
                              history.plan || ""
                            )}</span>
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
