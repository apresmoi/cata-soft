import React from "react";
import {
  PatientCardAgeDateField,
  PatientCardTextAreaField,
} from "../../components";
import { CalendarIcon } from "@radix-ui/react-icons";
import { useHospitalizacion, useNewHospitalizacion } from "../../hooks";
import { Tab } from "../../components/Tabs";
import { TabsContainer } from "../../components/Tabs";

interface HospitalizacionDialogContentProps {
  update: ReturnType<typeof useHospitalizacion>["update"];
  data?:
    | ReturnType<typeof useHospitalizacion>["data"]
    | ReturnType<typeof useNewHospitalizacion>["data"];
  invalid?: string[];
}

export function HospitalizacionDialogContent(
  props: React.PropsWithChildren<HospitalizacionDialogContentProps>
) {
  const { update, data, invalid = [] } = props;

  return (
    <div className="flex gap-2 flex-col p-4 h-[60vh]">
      <div className="flex flex-wrap gap-4">
        <PatientCardAgeDateField
          icon={<CalendarIcon />}
          label="FECHA INGRESO"
          onChange={update("fechaIngreso")}
          value={data?.fechaIngreso}
          className="w-[300px]"
          inline
        />
        <PatientCardAgeDateField
          icon={<CalendarIcon />}
          label="FECHA EGRESO"
          onChange={update("fechaEgreso")}
          value={data?.fechaEgreso}
          className="w-[300px]"
          inline
        />
      </div>
      <TabsContainer>
        <Tab name="MOTIVO">
          <PatientCardTextAreaField
            // label="MOTIVO"
            onChange={update("motivo")}
            value={data?.motivo || ""}
            className="flex-1"
            invalid={invalid.includes("motivo")}
          />
        </Tab>
        <Tab name="NOTAS">
          <PatientCardTextAreaField
            // label="NOTAS"
            onChange={update("notas")}
            value={data?.notas || ""}
            className="flex-1"
          />
        </Tab>
      </TabsContainer>
    </div>
  );
}
