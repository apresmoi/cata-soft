import {
  Antropometrias,
  ArchivosAdjuntos,
  Evoluciones,
  Hospitalizaciones,
  Interconsultas,
  Pacientes,
} from "@prisma/client";
import {
  useCommonNewRegistry,
  useCommonRegistry,
  useCommonRegistryList,
} from "./useRegistry";

export function usePacientes() {
  return useCommonRegistryList<Pacientes & { edad: number }>({
    endpointKey: "pacientes",
  });
}

export function useNewPaciente() {
  return useCommonNewRegistry<Pacientes>({ endpointKey: "paciente" });
}

export function usePaciente(id: string) {
  return useCommonRegistry<Pacientes & { edad: number }>(
    { endpointKey: "paciente", invalidateQueries: [["pacientes"]] },
    id
  );
}

export function useEvolutions(patientId: string) {
  return useCommonRegistryList<Evoluciones>(
    { endpointKey: "evolucion" },
    patientId
  );
}

export function useNewEvolution(patientId: string) {
  return useCommonNewRegistry<Evoluciones>(
    {
      endpointKey: "evolucion",
      invalidateQueries: [["historial"]],
      initialValues: {
        fecha: new Date(),
      },
    },
    patientId
  );
}

export function useEvolution(
  evolutionId: string,
  options: { enabled?: boolean } = {}
) {
  return useCommonRegistry<Evoluciones>(
    {
      endpointKey: "evolucion",
      enabled: options.enabled,
      invalidateQueries: [["historial"]],
    },
    evolutionId
  );
}

export type PacienteHistoryItem =
  | (Evoluciones & { type: "evolucion" })
  | (Interconsultas & { type: "interconsulta" })
  | (Hospitalizaciones & {
      type: "hospitalizacion";
    })
  | (Antropometrias & { type: "antropometria" })
  | (ArchivosAdjuntos & { type: "archivoadjunto" });

export function usePacienteHistorial(patientId: string) {
  return useCommonRegistryList<PacienteHistoryItem>(
    { endpointKey: "historial" },
    patientId
  );
}

export function useNewInterconsulta(patientId: string) {
  return useCommonNewRegistry<Interconsultas>(
    {
      endpointKey: "interconsulta",
      invalidateQueries: [["historial"]],
      initialValues: {
        fecha: new Date(),
      },
    },
    patientId
  );
}

export function useInterconsulta(
  interconsultaId: string,
  options: { enabled?: boolean } = {}
) {
  return useCommonRegistry<Interconsultas>(
    {
      endpointKey: "interconsulta",
      enabled: options.enabled,
      invalidateQueries: [["historial"]],
    },
    interconsultaId
  );
}

export function useNewAntropometria(patientId: string) {
  return useCommonNewRegistry<Antropometrias>(
    {
      endpointKey: "antropometria",
      invalidateQueries: [["historial"]],
      initialValues: {
        fecha: new Date(),
      },
    },
    patientId
  );
}

export function useAntropometria(
  antropometriaId: string,
  options: { enabled?: boolean } = {}
) {
  return useCommonRegistry<Antropometrias>(
    {
      endpointKey: "antropometria",
      enabled: options.enabled,
      invalidateQueries: [["historial"]],
    },
    antropometriaId
  );
}

export function useNewHospitalizacion(patientId: string) {
  return useCommonNewRegistry<Hospitalizaciones>(
    {
      endpointKey: "hospitalizacion",
      invalidateQueries: [["historial"]],
      initialValues: {
        fechaIngreso: new Date(),
      },
    },
    patientId
  );
}

export function useHospitalizacion(
  hospitalizacionId: string,
  options: { enabled?: boolean } = {}
) {
  return useCommonRegistry<Hospitalizaciones>(
    {
      endpointKey: "hospitalizacion",
      enabled: options.enabled,
      invalidateQueries: [["historial"]],
    },
    hospitalizacionId
  );
}

export function useNewArchivoAdjunto(patientId: string) {
  return useCommonNewRegistry<
    Omit<ArchivosAdjuntos, "path"> & {
      file: Uint8Array | undefined;
      fileName: string | undefined;
      fileType: string | undefined;
    }
  >(
    {
      endpointKey: "archivoadjunto",
      invalidateQueries: [["historial"]],
    },
    patientId
  );
}
