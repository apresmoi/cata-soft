import React from "react";
import {
  PatientCardAgeDateField,
  PatientCardTextAreaField,
} from "../../components";
import { CalendarIcon } from "@radix-ui/react-icons";
import { useEvolution, useNewEvolution } from "../../hooks";

interface EvolucionDialogContentProps {
  update: ReturnType<typeof useEvolution>["update"];
  data?:
    | ReturnType<typeof useEvolution>["data"]
    | ReturnType<typeof useNewEvolution>["data"];
}

export function EvolucionDialogContent(
  props: React.PropsWithChildren<EvolucionDialogContentProps>
) {
  const { update, data } = props;

  return (
    <div className="flex gap-2 flex-col p-4 h-[60vh]">
      <PatientCardAgeDateField
        icon={<CalendarIcon />}
        label="FECHA"
        onChange={update("fecha")}
        value={data?.fecha}
        className="max-w-[200px]"
      />
      <PatientCardTextAreaField
        label="MOTIVO"
        onChange={update("motivo")}
        value={data?.motivo || ""}
        className="flex-1"
      />
      <PatientCardTextAreaField
        label="EXAMEN FISICO"
        onChange={update("examenFisico")}
        value={data?.examenFisico || ""}
        className="flex-1"
      />
      <PatientCardTextAreaField
        label="PLAN"
        onChange={update("plan")}
        value={data?.plan || ""}
        className="flex-1"
      />
    </div>
  );
}
