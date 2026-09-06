import React from "react";
import {
  PatientCardAgeDateField,
  RichTextField,
} from "../../components";
import { CalendarIcon } from "@radix-ui/react-icons";
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
      <PatientCardAgeDateField
        icon={<CalendarIcon />}
        label="FECHA"
        onChange={update("fecha")}
        value={data?.fecha}
        className="max-w-[288px]"
        inline
      />
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
