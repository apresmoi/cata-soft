import React from "react";
import {
  PatientCardAgeDateField,
  PatientCardTextAreaField,
} from "../../components";
import { CalendarIcon } from "@radix-ui/react-icons";
import { useHospitalizacion, useNewHospitalizacion } from "../../hooks";

interface HospitalizacionDialogContentProps {
  update: ReturnType<typeof useHospitalizacion>["update"];
  data?:
    | ReturnType<typeof useHospitalizacion>["data"]
    | ReturnType<typeof useNewHospitalizacion>["data"];
}

export function HospitalizacionDialogContent(
  props: React.PropsWithChildren<HospitalizacionDialogContentProps>
) {
  const { update, data } = props;

  return (
    <div className="flex gap-2 flex-col p-4 h-[60vh]">
      <div className="flex gap-2">
        <PatientCardAgeDateField
          icon={<CalendarIcon />}
          label="FECHA INGRESO"
          onChange={update("fechaIngreso")}
          value={data?.fechaIngreso}
          className="w-[200px]"
        />
        <PatientCardAgeDateField
          icon={<CalendarIcon />}
          label="FECHA EGRESO"
          onChange={update("fechaEgreso")}
          value={data?.fechaEgreso}
          className="w-[200px]"
        />
      </div>
      <PatientCardTextAreaField
        label="MOTIVO"
        onChange={update("motivo")}
        value={data?.motivo || ""}
        className="flex-1"
      />
      <PatientCardTextAreaField
        label="NOTAS"
        onChange={update("notas")}
        value={data?.notas || ""}
        className="flex-1"
      />
    </div>
  );
}
