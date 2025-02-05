import { ipcMain, shell } from "electron";
import fs from "fs";
import path from "path";

import {
  getPacientes,
  getPaciente,
  createPaciente,
  updatePaciente,
  deletePaciente,
  getAntropometria,
  createAntropometria,
  updateAntropometria,
  deleteAntropometria,
  getEvolucion,
  createEvolucion,
  updateEvolucion,
  deleteEvolucion,
  getHospitalizacion,
  createHospitalizacion,
  updateHospitalizacion,
  deleteHospitalizacion,
  getInterconsulta,
  createInterconsulta,
  updateInterconsulta,
  deleteInterconsulta,
  getHistorial,
  createArchivoAdjunto,
  getArchivosAdjuntos,
  deleteArchivoAdjunto,
} from "./db";

export function registerIpcHandlers() {
  ipcMain.handle("get-pacientes", async () => {
    try {
      const pacientes = await getPacientes();
      return pacientes;
    } catch (error) {
      console.error("Error fetching pacientes:", error);
      throw error;
    }
  });

  ipcMain.handle("get-paciente", async (_event, id) => {
    try {
      const paciente = await getPaciente(id);
      return paciente;
    } catch (error) {
      console.error("Error fetching paciente:", error);
      throw error;
    }
  });

  ipcMain.handle("create-paciente", async (_event, paciente) => {
    try {
      return await createPaciente(paciente);
    } catch (error) {
      console.error("Error creating paciente:", error);
      throw error;
    }
  });

  ipcMain.handle("update-paciente", async (_event, data, id) => {
    try {
      return await updatePaciente(id, data);
    } catch (error) {
      console.error("Error updating paciente:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-paciente", async (_event, id) => {
    try {
      return await deletePaciente(id);
    } catch (error) {
      console.error("Error deleting paciente:", error);
      throw error;
    }
  });

  ipcMain.handle("get-antropometria", async (_event, id) => {
    try {
      return await getAntropometria(id);
    } catch (error) {
      console.error("Error fetching antropometria:", error);
      throw error;
    }
  });

  ipcMain.handle("create-antropometria", async (_event, data, pacienteId) => {
    try {
      return await createAntropometria(pacienteId, data);
    } catch (error) {
      console.error("Error creating antropometria:", error);
      throw error;
    }
  });

  ipcMain.handle("update-antropometria", async (_event, data, id) => {
    try {
      return await updateAntropometria(id, data);
    } catch (error) {
      console.error("Error updating antropometria:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-antropometria", async (_event, id) => {
    try {
      return await deleteAntropometria(id);
    } catch (error) {
      console.error("Error deleting antropometria:", error);
      throw error;
    }
  });

  ipcMain.handle("get-evolucion", async (_event, id) => {
    try {
      return await getEvolucion(id);
    } catch (error) {
      console.error("Error fetching evolucion:", error);
      throw error;
    }
  });

  ipcMain.handle("create-evolucion", async (_event, data, pacienteId) => {
    try {
      return await createEvolucion(pacienteId, data);
    } catch (error) {
      console.error("Error creating evolucion:", error);
      throw error;
    }
  });

  ipcMain.handle("update-evolucion", async (_event, data, id) => {
    try {
      return await updateEvolucion(id, data);
    } catch (error) {
      console.error("Error updating evolucion:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-evolucion", async (_event, id) => {
    try {
      return await deleteEvolucion(id);
    } catch (error) {
      console.error("Error deleting evolucion:", error);
      throw error;
    }
  });

  ipcMain.handle("get-hospitalizacion", async (_event, id) => {
    try {
      return await getHospitalizacion(id);
    } catch (error) {
      console.error("Error fetching hospitalizacion:", error);
      throw error;
    }
  });

  ipcMain.handle("create-hospitalizacion", async (_event, data, pacienteId) => {
    try {
      return await createHospitalizacion(pacienteId, data);
    } catch (error) {
      console.error("Error creating hospitalizacion:", error);
      throw error;
    }
  });

  ipcMain.handle("update-hospitalizacion", async (_event, data, id) => {
    try {
      return await updateHospitalizacion(id, data);
    } catch (error) {
      console.error("Error updating hospitalizacion:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-hospitalizacion", async (_event, id) => {
    try {
      return await deleteHospitalizacion(id);
    } catch (error) {
      console.error("Error deleting hospitalizacion:", error);
      throw error;
    }
  });

  ipcMain.handle("get-interconsulta", async (_event, id) => {
    try {
      return await getInterconsulta(id);
    } catch (error) {
      console.error("Error fetching interconsulta:", error);
      throw error;
    }
  });

  ipcMain.handle("create-interconsulta", async (_event, data, pacienteId) => {
    try {
      return await createInterconsulta(pacienteId, data);
    } catch (error) {
      console.error("Error creating interconsulta:", error);
      throw error;
    }
  });

  ipcMain.handle("update-interconsulta", async (_event, data, id) => {
    try {
      return await updateInterconsulta(id, data);
    } catch (error) {
      console.error("Error updating interconsulta:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-interconsulta", async (_event, id) => {
    try {
      return await deleteInterconsulta(id);
    } catch (error) {
      console.error("Error deleting interconsulta:", error);
      throw error;
    }
  });

  ipcMain.handle("get-historial", async (_event, pacienteId) => {
    try {
      return await getHistorial(pacienteId);
    } catch (error) {
      console.error("Error fetching historial:", error);
      throw error;
    }
  });

  ipcMain.handle("get-archivos", async (_event, pacienteId) => {
    try {
      return await getArchivosAdjuntos(pacienteId);
    } catch (error) {
      console.error("Error fetching archivos:", error);
      throw error;
    }
  });

  ipcMain.handle("create-archivoadjunto", async (_event, data, pacienteId) => {
    try {
      const { file, fileName, fileType, ...rest } = data;

      //how do I get the current directory without using __Dirname?
      //answer: use process.cwd()

      const dirname = process.cwd();

      const uploadsDir = path.join(dirname, "uploads", pacienteId);
      console.log({ uploadsDir });
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

      const dateStr = new Date().toISOString().replace(/:/g, "-");

      const filePath = path.join(
        dirname,
        "uploads",
        pacienteId,
        dateStr + "-" + fileName
      );
      const fileData = Buffer.from(file);
      fs.writeFileSync(filePath, fileData);

      return await createArchivoAdjunto(pacienteId, {
        ...rest,
        tipo: fileType,
        path: filePath,
      });
    } catch (error) {
      console.error("Error saving file:", error);
      return error;
    }
  });

  ipcMain.handle("delete-archivoadjunto", async (_event, id) => {
    try {
      return await deleteArchivoAdjunto(id);
    } catch (error) {
      console.error("Error deleting archivo:", error);
      throw error;
    }
  });

  ipcMain.handle("open-path", async (_event, filePath) => {
    return shell.openPath(filePath);
  });
}
