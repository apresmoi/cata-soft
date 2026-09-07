import React from "react";
import {
  PatientCardAgeDateField,
  PatientCardSelect,
  RichTextField,
} from "../../components";
import { CalendarIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { useInterconsulta, useNewInterconsulta } from "../../hooks";
import { Tab } from "../../components/Tabs";
import { TabsContainer } from "../../components/Tabs";

interface InterconsultasDialogContentProps {
  update: ReturnType<typeof useInterconsulta>["update"];
  data?:
    | ReturnType<typeof useInterconsulta>["data"]
    | ReturnType<typeof useNewInterconsulta>["data"];
  invalid?: string[];
}

export function InterconsultasDialogContent(
  props: React.PropsWithChildren<InterconsultasDialogContentProps>
) {
  const { update, data, invalid = [] } = props;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-start gap-3">
        <PatientCardAgeDateField
          icon={<CalendarIcon />}
          label="FECHA"
          onChange={update("fecha")}
          value={data?.fecha}
          className="max-w-[288px]"
          inline
        />
        <PatientCardSelect
          icon={<CheckCircledIcon />}
          label="ESTADO"
          onChange={update("estado")}
          value={data?.estado ?? "pendiente"}
          options={[
            { value: "pendiente", label: "Pendiente" },
            { value: "respondida", label: "Respondida" },
          ]}
          className="max-w-[220px]"
          inline
        />
      </div>
      <TabsContainer>
        <Tab name="MOTIVO">
          <RichTextField
            // label="MOTIVO"
            onChange={update("motivo")}
            value={data?.motivo || ""}
            className="flex-1"
            invalid={invalid.includes("motivo")}
          />
        </Tab>
        <Tab name="NOTAS">
          <RichTextField
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
