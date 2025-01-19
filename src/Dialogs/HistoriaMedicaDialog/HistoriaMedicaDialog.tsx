import React from "react";
import { CalendarIcon, ListBulletIcon } from "@radix-ui/react-icons";
import {
  PatientCard,
  PatientCardFieldContainer,
  PatientCardSelect,
} from "../../components";
import {
  Dialog,
  DialogButton,
  DialogCancelButton,
  DialogContainer,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../../components/Dialog";
import { getTemplate } from "./template";
import { PacienteHistoryItem, usePaciente } from "../../hooks";

const tipos = [
  { value: "evolucion", label: "Evoluciones" },
  { value: "hospitalizacion", label: "Hospitalizaciones" },
  { value: "interconsulta", label: "Interconsultas" },
  { value: "antropometria", label: "Antropometrias" },
];

export function HistoriaMedicaDialog(
  props: React.PropsWithChildren<{
    patient: ReturnType<typeof usePaciente>["data"];
    history?: PacienteHistoryItem[];
  }>
) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [open, setOpen] = React.useState(false);

  const [selectedPeriod, setSelectedPeriod] = React.useState("ultimos-5");

  const [selectedTypes, setSelectedTypes] = React.useState({
    evolucion: true,
    hospitalizacion: true,
    interconsulta: true,
    antropometria: true,
  });

  const handleSelectedTypesChange =
    (value: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedTypes((prev) => ({
        ...prev,
        [value]: e.target.checked,
      }));
    };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const handleDownload = () => {
    iframeRef.current?.contentWindow?.focus();
    iframeRef.current?.contentWindow?.print();
  };

  const filteredHistory = props.history
    ?.filter((item) => {
      if (!selectedTypes[item.type as keyof typeof selectedTypes]) return false;

      if (selectedPeriod === "todo") return true;
      return true;
    })
    .reduce((r, item, index) => {
      if (selectedPeriod === "todo") return [...r, item];

      switch (selectedPeriod) {
        case "ultimos-5":
          if (index < 5) r.push(item);
          break;
        case "ultimos-3":
          if (index < 3) r.push(item);
          break;
        case "ultimo":
          if (index === 0) r.push(item);
          break;
        case "ultimos-3-meses":
          if (
            "fecha" in item &&
            new Date().getTime() - item.fecha.getTime() <=
              1000 * 60 * 60 * 24 * 30 * 3
          )
            r.push(item);
          break;
        case "ultimos-6-meses":
          if (
            "fecha" in item &&
            new Date().getTime() - item.fecha.getTime() <=
              1000 * 60 * 60 * 24 * 30 * 6
          )
            r.push(item);
          break;
        case "ultimo-ano":
          if (
            "fecha" in item &&
            new Date().getTime() - item.fecha.getTime() <=
              1000 * 60 * 60 * 24 * 365
          )
            r.push(item);
          break;
        case "ultimos-3-anos":
          if (
            "fecha" in item &&
            new Date().getTime() - item.fecha.getTime() <=
              1000 * 60 * 60 * 24 * 365 * 3
          )
            r.push(item);
          break;
      }

      return r;
    }, [] as PacienteHistoryItem[]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>{props.children}</DialogTrigger>
      <DialogContainer className="min-w-[80vw] max-w-[80vw] ">
        <DialogTitle>DESCARGAR RESUMEN DE HISTORIA</DialogTitle>

        <div className="flex gap-2 min-h-[50vh]">
          <PatientCard className="max-w-[300px] gap-4">
            <PatientCardSelect
              icon={<CalendarIcon />}
              label="Periodo"
              options={[
                { value: "ultimos-5", label: "5 registros" },
                { value: "ultimos-3", label: "3 registros" },
                { value: "ultimo", label: "1 registro" },
                { value: "ultimos-3-meses", label: "3 meses" },
                { value: "ultimos-6-meses", label: "6 meses" },
                { value: "ultimo-ano", label: "Un Año" },
                { value: "ultimos-3-anos", label: "3 Años" },
                { value: "todo", label: "Todo" },
              ]}
              value={selectedPeriod}
              onChange={setSelectedPeriod}
            />
            <PatientCardFieldContainer
              icon={<ListBulletIcon />}
              label="Tipos de Historia"
            >
              {tipos.map((tipo) => (
                <div>
                  <label className="flex items-center gap-2 p-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-[20px] h-[20px]"
                      checked={
                        selectedTypes[tipo.value as keyof typeof selectedTypes]
                      }
                      onChange={handleSelectedTypesChange(tipo.value)}
                    />
                    {tipo.label}
                  </label>
                </div>
              ))}
            </PatientCardFieldContainer>
          </PatientCard>

          <div className="flex-1 bg-white rounded-lg">
            <iframe
              ref={iframeRef}
              className="h-full w-full"
              srcDoc={getTemplate(props.patient, filteredHistory || [])}
              title="Historia Medica"
            ></iframe>
          </div>
        </div>
        <DialogFooter>
          <DialogCancelButton />
          <DialogButton variant="primary" onClick={handleDownload}>
            DESCARGAR
          </DialogButton>
        </DialogFooter>
      </DialogContainer>
    </Dialog>
  );
}
