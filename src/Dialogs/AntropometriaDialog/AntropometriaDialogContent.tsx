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
  /** Field names to ring red -- required fields left empty on save. */
  invalid?: string[];
}

export function AntropometriaDialogContent(
  props: React.PropsWithChildren<AntropometriaDialogContentProps>
) {
  const { update, data, invalid } = props;

  // IMC is derived from peso and talla (kg / m^2), never typed directly.
  const peso = Number(data?.peso) || 0;
  const talla = Number(data?.talla) || 0;
  const imc = talla > 0 ? peso / (talla * talla) : 0;

  React.useEffect(() => {
    // Keep the saved value in sync with the computed one so the save path
    // still persists whatever `update("imc")` receives.
    update("imc")(imc);
    // Only recompute when the source values change -- `update` is a fresh
    // closure every render and would otherwise re-fire this every time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peso, talla]);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <PatientCardAgeDateField
        icon={<CalendarIcon />}
        label="FECHA"
        onChange={update("fecha")}
        value={data?.fecha}
      />
      <PatientCardField
        icon={<PinBottomIcon />}
        label="PESO"
        onChange={update("peso")}
        value={data?.peso || 0}
        invalid={invalid?.includes("peso")}
      />
      <PatientCardField
        icon={<SpaceBetweenVerticallyIcon />}
        label="TALLA"
        onChange={update("talla")}
        value={data?.talla || 0}
        invalid={invalid?.includes("talla")}
      />
      <PatientCardField
        icon={<BlendingModeIcon />}
        label="IMC"
        onChange={update("imc")}
        value={data?.imc || 0}
        disabled
        invalid={invalid?.includes("imc")}
      />
    </div>
  );
}
