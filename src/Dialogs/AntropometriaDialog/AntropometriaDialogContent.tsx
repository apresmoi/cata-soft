import React from "react";
import { PatientCardAgeDateField, PatientCardField } from "../../components";
import {
  BlendingModeIcon,
  CalendarIcon,
  PinBottomIcon,
  SpaceBetweenVerticallyIcon,
} from "@radix-ui/react-icons";
import { useAntropometria, useNewAntropometria } from "../../hooks";

interface AntropometriaDialogContentProps {
  update: ReturnType<typeof useAntropometria>["update"];
  data?:
    | ReturnType<typeof useAntropometria>["data"]
    | ReturnType<typeof useNewAntropometria>["data"];
}

export function AntropometriaDialogContent(
  props: React.PropsWithChildren<AntropometriaDialogContentProps>
) {
  const { update, data } = props;

  return (
    <div className="flex gap-2 flex-col p-4 h-[auto]">
      <PatientCardAgeDateField
        icon={<CalendarIcon />}
        label="FECHA"
        onChange={update("fecha")}
        value={data?.fecha}
        align="right"
        inline
        inlineFieldMaxWidth={50}
      />
      <PatientCardField
        className="w-[100%]"
        icon={<PinBottomIcon />}
        label="PESO"
        onChange={update("peso")}
        value={data?.peso || 0}
        align="right"
        inline
        inlineFieldMaxWidth={50}
      />
      <PatientCardField
        className="w-[100%]"
        icon={<SpaceBetweenVerticallyIcon />}
        label="TALLA"
        onChange={update("talla")}
        value={data?.talla || 0}
        align="right"
        inline
        inlineFieldMaxWidth={50}
      />
      <PatientCardField
        className="w-[100%]"
        icon={<BlendingModeIcon />}
        label="IMC"
        onChange={update("imc")}
        value={data?.imc || 0}
        align="right"
        inline
        inlineFieldMaxWidth={50}
      />
    </div>
  );
}
