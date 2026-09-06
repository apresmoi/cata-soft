import React from "react";

import { ReaderIcon, GearIcon } from "@radix-ui/react-icons";
import { Toolbar } from "../components/Toolbar";
import { ToolbarSearch } from "../components/ToolbarSearch";
import { AppContainer, Tooltip } from "../components";
import {
  ConfiguracionDialog,
  HistoriaMedicaDialog,
  NewPatientDialog,
} from "../Dialogs";
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

function calculateAge(fechaNacimiento: Date): number {
  const today = new Date();
  const birth = new Date(fechaNacimiento);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
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

  const totalCount = pacientes.data?.length ?? 0;
  const filteredCount = filteredPacientes?.length ?? 0;

  const handleRowClick = (paciente: Pacientes) => () => {
    navigate(`/patient/${paciente.id}`);
  };

  return (
    <AppContainer>
      <Toolbar>
        <div className="flex shrink-0 items-center gap-2">
          <img src="/icon.png" className="h-7 w-7" alt="" />
          <h1 className="text-sm font-bold uppercase tracking-wide text-stone-900">
            CATASOFT
          </h1>
        </div>

        <div className="flex-1">
          <ToolbarSearch
            search={search}
            onChange={setSearch}
            legend="Buscar paciente"
          />
        </div>

        <NewPatientDialog />
      </Toolbar>

      <div className="min-h-0 flex-1 flex flex-col">
        <Table
          tableHeaderContent={
            <tr>
              <TableCol component="th" className="max-w-[120px] w-[120px]">DNI</TableCol>
              <TableCol component="th" className="w-auto">Nombre</TableCol>
              <TableCol component="th" className="w-[200px]">Direccion</TableCol>
              <TableCol component="th" className="w-[150px]">Telefono</TableCol>
              <TableCol component="th" className="w-[100px] text-center">EDAD</TableCol>
              <TableCol component="th" className="w-[200px]">OBRA SOC. (Nro)</TableCol>
              <TableCol component="th" className="w-[100px] text-center">Acciones</TableCol>
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
                    {calculateAge(paciente.fechaNacimiento)}
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
              {filteredCount === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="border-t border-stone-200 px-4 py-8 text-center text-sm text-stone-500"
                  >
                    Ningún paciente coincide con la búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          }
        />
        {/*
         * Count on the left, settings on the right. The backup export lives in
         * there rather than the toolbar: it is occasional maintenance, not an
         * everyday action, and it does not deserve equal billing with opening
         * a patient.
         */}
        <footer className="flex shrink-0 items-center justify-between border-t border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-500">
          <span>
            {filteredCount} {filteredCount === 1 ? "paciente" : "pacientes"}
            {filteredCount !== totalCount ? ` de ${totalCount}` : ""}
          </span>
          <ConfiguracionDialog asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <GearIcon /> Configuración
            </button>
          </ConfiguracionDialog>
        </footer>
      </div>
    </AppContainer>
  );
}
