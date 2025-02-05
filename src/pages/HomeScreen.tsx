import React from "react";

import { ReaderIcon } from "@radix-ui/react-icons";
import { Toolbar } from "../components/Toolbar";
import { ToolbarSearch } from "../components/ToolbarSearch";
import { AppContainer, Tooltip } from "../components";
import { HistoriaMedicaDialog, NewPatientDialog } from "../Dialogs";
import { Pacientes } from "@prisma/client";
import { useNavigate } from "react-router-dom";
import { usePacientes } from "../hooks";
import {
  Table,
  TableActionButton,
  TableCol,
  TableRow,
} from "../components/Table";

const searchKeys = [
  "nombre",
  "documento",
  "telefono",
  "direccion",
  "numeroObraSocial",
  "obraSocial",
  "email",
] as (keyof Pacientes)[];

function isBirthDay(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() && date.getMonth() === today.getMonth()
  );
}

export function HomeScreen() {
  const navigate = useNavigate();

  const pacientes = usePacientes();
  const [search, setSearch] = React.useState("");

  const filteredPacientes = pacientes.data?.filter((row) =>
    searchKeys.some(
      (key) =>
        row &&
        key in row &&
        row[key]?.toString().toUpperCase().includes(search.toUpperCase())
    )
  );

  const handleRowClick = (paciente: Pacientes) => () => {
    navigate(`/patient/${paciente.id}`);
  };

  return (
    <AppContainer>
      <Toolbar>
        <NewPatientDialog />
        <div className="absolute w-[50%] left-[25%]">
          <ToolbarSearch
            search={search}
            onChange={setSearch}
            legend="Buscar paciente"
          />
        </div>
      </Toolbar>

      <Table
        tableHeaderContent={
          <tr className="border-b">
            <TableCol className="max-w-[120px] w-[120px]">DNI</TableCol>
            <TableCol className="w-auto">Nombre</TableCol>
            <TableCol className="w-[200px]">Direccion</TableCol>
            <TableCol className="w-[150px]">Telefono</TableCol>
            <TableCol className="w-[100px] text-center">EDAD</TableCol>
            <TableCol className="w-[200px]">OBRA SOC. (Nro)</TableCol>
            <TableCol className="w-[100px] text-center">Acciones</TableCol>
          </tr>
        }
        tableBody={
          <tbody>
            {filteredPacientes?.map((paciente, index) => (
              <TableRow key={index} onClick={handleRowClick(paciente)}>
                <TableCol className="max-w-[120px]">
                  {paciente.documento}
                </TableCol>

                <TableCol className="w-auto">
                  {isBirthDay(paciente.fechaNacimiento) && (
                    <span className="mr-4 p-2 bg-yellow-900 rounded-2xl">
                      {"🎂🎈"}
                    </span>
                  )}
                  {paciente.nombre}
                </TableCol>
                <TableCol className="max-w-[200px]">
                  {paciente.direccion}
                </TableCol>
                <TableCol className="w-[150px]">{paciente.telefono}</TableCol>
                <TableCol className="w-[100px] text-center">
                  {paciente.edad}
                </TableCol>
                <TableCol className="w-[200px]">
                  {paciente.obraSocial} ({paciente.numeroObraSocial})
                </TableCol>
                <TableCol className="w-[100px] text-center">
                  <Tooltip tooltip="Descargar Historial">
                    <HistoriaMedicaDialog patientId={paciente.id} asChild>
                      <span onClick={(e) => e.stopPropagation()}>
                        <TableActionButton>
                          <ReaderIcon />
                        </TableActionButton>
                      </span>
                    </HistoriaMedicaDialog>
                  </Tooltip>
                </TableCol>
              </TableRow>
            ))}
          </tbody>
        }
      />
    </AppContainer>
  );
}
