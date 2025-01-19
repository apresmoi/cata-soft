import { PacienteHistoryItem } from "../../hooks";
import { TableCol } from "../Table";
import { AntropometriaRow } from "./AntropometriaRow";
import { ArchivoAdjuntoRow } from "./ArchivoAdjuntoRow";
import { EvolucionRow } from "./EvolucionRow";
import { HospitalizacionRow } from "./HospitalizacionRow";
import { InterconsultaRow } from "./InterconsultaRow";

export function PatientHistoryTable(props: {
  history: PacienteHistoryItem[];
  onClick: (id: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden relative  select-none">
      <div className="pr-4 z-10 bg-stone-900">
        <table className="w-full">
          <thead className="border-b border-stone-600">
            <tr>
              <TableCol className="text-left w-[100px]">Fecha</TableCol>
              <TableCol className="text-left w-[150px]">Tipo</TableCol>
              <TableCol className="text-left">Contenido</TableCol>
              <TableCol className="text-left w-[50px]"></TableCol>
            </tr>
          </thead>
        </table>
      </div>
      <div className="absolute w-full h-full overflow-y-auto">
        <table className="w-full">
          <thead className="invisible max-h-0 h-0">
            <tr>
              <TableCol className="text-left w-[100px]">Fecha</TableCol>
              <TableCol className="text-left w-[150px]">Tipo</TableCol>
              <TableCol className="text-left">Contenido</TableCol>
              <TableCol className="text-left w-[50px]"></TableCol>
            </tr>
          </thead>
          <tbody className="">
            {props.history?.map((row, index) => {
              switch (row.type) {
                case "evolucion":
                  return (
                    <EvolucionRow
                      key={index}
                      {...row}
                      onClick={props.onClick}
                    />
                  );
                case "interconsulta":
                  return (
                    <InterconsultaRow
                      key={index}
                      {...row}
                      onClick={props.onClick}
                    />
                  );
                case "antropometria":
                  return (
                    <AntropometriaRow
                      key={index}
                      {...row}
                      onClick={props.onClick}
                    />
                  );
                case "hospitalizacion":
                  return (
                    <HospitalizacionRow
                      key={index}
                      {...row}
                      onClick={props.onClick}
                    />
                  );
                case "archivoadjunto":
                  return <ArchivoAdjuntoRow key={index} {...row} />;
                default:
                  return null;
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
