import React from "react";
import {
  PatientCardAgeDateField,
  PatientCardTextAreaField,
} from "../../components";
import { CalendarIcon } from "@radix-ui/react-icons";
import { useInterconsulta, useNewInterconsulta } from "../../hooks";

interface InterconsultasDialogContentProps {
  update: ReturnType<typeof useInterconsulta>["update"];
  data?:
    | ReturnType<typeof useInterconsulta>["data"]
    | ReturnType<typeof useNewInterconsulta>["data"];
}

export function InterconsultasDialogContent(
  props: React.PropsWithChildren<InterconsultasDialogContentProps>
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
        label="NOTAS"
        onChange={update("notas")}
        value={data?.notas || ""}
        className="flex-1"
      />
    </div>
  );
}
