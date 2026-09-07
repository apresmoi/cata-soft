import React from "react";
import {
  PatientCardAgeDateField,
  RichTextField,
} from "../../components";
import { CalendarIcon } from "@radix-ui/react-icons";
import { useEvolution, useNewEvolution } from "../../hooks";
import { Tab, TabsContainer } from "../../components/Tabs";

interface EvolucionDialogContentProps {
  update: ReturnType<typeof useEvolution>["update"];
  data?:
    | ReturnType<typeof useEvolution>["data"]
    | ReturnType<typeof useNewEvolution>["data"];
  invalid?: string[];
}

export function EvolucionDialogContent(
  props: React.PropsWithChildren<EvolucionDialogContentProps>
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
        <Tab name="EXAMEN FISICO">
          <RichTextField
            // label="EXAMEN FISICO"
            onChange={update("examenFisico")}
            value={data?.examenFisico || ""}
            className="flex-1"
          />
        </Tab>
        <Tab name="PLAN">
          <RichTextField
            // label="PLAN"
            onChange={update("plan")}
            value={data?.plan || ""}
            className="flex-1"
          />
        </Tab>
      </TabsContainer>
    </div>
  );
}
