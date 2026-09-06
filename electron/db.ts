import {
  Antropometrias,
  ArchivosAdjuntos,
  Evoluciones,
  Hospitalizaciones,
  Interconsultas,
  Pacientes,
} from "@prisma/client";

import { prisma } from "./database";

const computeAge = (date: Date) => {
  //to the day
  const diff = Date.now() - date.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export async function getPacientes() {
  const pacientes = await prisma.pacientes.findMany({
    select: {
      id: true,
      nombre: true,
      documento: true,
      obraSocial: true,
      numeroObraSocial: true,
      direccion: true,
      telefono: true,
      fechaNacimiento: true,
      email: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return pacientes.map((paciente) => ({
    ...paciente,
    edad: computeAge(paciente.fechaNacimiento),
  }));
}

export async function getPaciente(id: string) {
  const paciente = await prisma.pacientes.findUnique({
    where: {
      id,
    },
  });

  if (paciente)
    return { ...paciente, edad: computeAge(paciente.fechaNacimiento) };

  return null;
}

export async function createPaciente(
  data: Omit<Pacientes, "id" | "createdAt" | "updatedAt">
) {
  const paciente = await prisma.pacientes.create({
    data,
  });

  return paciente;
}

export async function updatePaciente(
  id: string,
  data: Partial<
    Omit<Pacientes & { edad: number }, "id" | "createdAt" | "updatedAt">
  >
) {
  const { edad, ...rest } = data;

  const paciente = await prisma.pacientes.update({
    where: {
      id,
    },
    data: rest,
  });

  return paciente;
}

export async function deletePaciente(id: string) {
  const paciente = await prisma.pacientes.delete({
    where: {
      id,
    },
  });

  return paciente;
}

export async function getEvolucion(id: string) {
  const evolucion = await prisma.evoluciones.findUnique({
    where: {
      id,
    },
  });

  return evolucion;
}

export async function createEvolucion(
  pacienteId: string,
  data: Omit<Evoluciones, "id" | "createdAt" | "updatedAt">
) {
  const evolucion = await prisma.evoluciones.create({
    data: {
      ...data,
      pacienteId,
    },
  });

  return evolucion;
}

export async function updateEvolucion(
  id: string,
  data: Partial<Omit<Evoluciones, "id" | "createdAt" | "updatedAt">>
) {
  const evolucion = await prisma.evoluciones.update({
    where: {
      id,
    },
    data,
  });

  return evolucion;
}

export async function deleteEvolucion(id: string) {
  const evolucion = await prisma.evoluciones.delete({
    where: {
      id,
    },
  });

  return evolucion;
}

export async function getAntropometria(id: string) {
  const antropometria = await prisma.antropometrias.findUnique({
    where: {
      id,
    },
  });

  return antropometria;
}

export async function createAntropometria(
  pacienteId: string,
  data: Omit<Antropometrias, "id" | "createdAt" | "updatedAt">
) {
  const antropometria = await prisma.antropometrias.create({
    data: {
      ...data,
      peso: Number(data.peso),
      talla: Number(data.talla),
      imc: Number(data.imc),
      pacienteId,
    },
  });

  return antropometria;
}

export async function updateAntropometria(
  id: string,
  data: Partial<Omit<Antropometrias, "id" | "createdAt" | "updatedAt">>
) {
  const antropometria = await prisma.antropometrias.update({
    where: {
      id,
    },
    data,
  });

  return antropometria;
}

export async function deleteAntropometria(id: string) {
  const antropometria = await prisma.antropometrias.delete({
    where: {
      id,
    },
  });

  return antropometria;
}

export async function getHospitalizacion(id: string) {
  const hospitalizacion = await prisma.hospitalizaciones.findUnique({
    where: {
      id,
    },
  });

  return hospitalizacion;
}

export async function createHospitalizacion(
  pacienteId: string,
  data: Omit<Hospitalizaciones, "id" | "createdAt" | "updatedAt">
) {
  const hospitalizacion = await prisma.hospitalizaciones.create({
    data: {
      ...data,
      pacienteId,
    },
  });

  return hospitalizacion;
}

export async function updateHospitalizacion(
  id: string,
  data: Partial<Omit<Hospitalizaciones, "id" | "createdAt" | "updatedAt">>
) {
  const hospitalizacion = await prisma.hospitalizaciones.update({
    where: {
      id,
    },
    data,
  });

  return hospitalizacion;
}

export async function deleteHospitalizacion(id: string) {
  const hospitalizacion = await prisma.hospitalizaciones.delete({
    where: {
      id,
    },
  });

  return hospitalizacion;
}

export async function getInterconsulta(id: string) {
  const interconsulta = await prisma.interconsultas.findUnique({
    where: {
      id,
    },
  });

  return interconsulta;
}

export async function createInterconsulta(
  pacienteId: string,
  data: Omit<Interconsultas, "id" | "createdAt" | "updatedAt">
) {
  const interconsulta = await prisma.interconsultas.create({
    data: {
      ...data,
      pacienteId,
    },
  });

  return interconsulta;
}

export async function updateInterconsulta(
  id: string,
  data: Partial<Omit<Interconsultas, "id" | "createdAt" | "updatedAt">>
) {
  const interconsulta = await prisma.interconsultas.update({
    where: {
      id,
    },
    data,
  });

  return interconsulta;
}

export async function deleteInterconsulta(id: string) {
  const interconsulta = await prisma.interconsultas.delete({
    where: {
      id,
    },
  });

  return interconsulta;
}

export async function getHistorial(id: string) {
  const paciente = await prisma.pacientes.findUnique({
    where: {
      id,
    },
    include: {
      evoluciones: {
        select: {
          id: true,
          fecha: true,
          motivo: true,
          createdAt: true,
          examenFisico: true,
          plan: true,
        },
      },
      antropometrias: {
        select: {
          id: true,
          fecha: true,
          createdAt: true,
          peso: true,
          talla: true,
          imc: true,
        },
      },
      hospitalizaciones: {
        select: {
          id: true,
          fechaIngreso: true,
          fechaEgreso: true,
          motivo: true,
          createdAt: true,
          notas: true,
        },
      },
      interconsultas: {
        select: {
          id: true,
          fecha: true,
          motivo: true,
          createdAt: true,
          notas: true,
        },
      },
      archivos: {
        select: {
          id: true,
          nombre: true,
          createdAt: true,
          notas: true,
          path: true,
        },
      },
    },
  });

  return [
    ...(paciente?.evoluciones.map((evolucion) => ({
      ...evolucion,
      type: "evolucion",
    })) || []),
    ...(paciente?.antropometrias.map((antropometria) => ({
      ...antropometria,
      type: "antropometria",
    })) || []),
    ...(paciente?.hospitalizaciones.map((hospitalizacion) => ({
      ...hospitalizacion,
      // The admission date is this entry's clinical date. Without it the
      // entry sorted by row-insertion time, so an old hospitalization could
      // land anywhere in the timeline.
      fecha: hospitalizacion.fechaIngreso,
      type: "hospitalizacion",
    })) || []),
    ...(paciente?.interconsultas.map((interconsulta) => ({
      ...interconsulta,
      type: "interconsulta",
    })) || []),
    ...(paciente?.archivos.map((archivo) => ({
      ...archivo,
      type: "archivoadjunto",
    })) || []),
  ].sort((a, b) => {
    // Newest first, by clinical date where the entry has one; attachments only
    // carry the moment they were uploaded.
    const dateA = "fecha" in a ? a.fecha : a.createdAt;
    const dateB = "fecha" in b ? b.fecha : b.createdAt;
    return dateB.getTime() - dateA.getTime();
  });
}

export async function getArchivoAdjunto(id: string) {
  return await prisma.archivosAdjuntos.findUnique({ where: { id } });
}

export async function getArchivosAdjuntos(pacienteId: string) {
  const archivosAdjuntos = await prisma.archivosAdjuntos.findMany({
    where: {
      pacienteId,
    },
  });

  return archivosAdjuntos;
}

export async function createArchivoAdjunto(
  pacienteId: string,
  data: Omit<ArchivosAdjuntos, "id" | "createdAt" | "updatedAt">
) {
  return await prisma.archivosAdjuntos.create({
    data: {
      ...data,
      pacienteId,
    },
  });
}

export async function deleteArchivoAdjunto(id: string) {
  return await prisma.archivosAdjuntos.delete({
    where: {
      id,
    },
  });
}
