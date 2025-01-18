import { ArchivosAdjuntos } from "@prisma/client";
import { TableRow, TableCol } from "../Table";

export function ArchivoAdjuntoRow(props: ArchivosAdjuntos) {
  return (
    <TableRow
      onClick={() => {
        window.ipcRenderer.invoke("open-path", props.path);
      }}
    >
      <TableCol>
        {props.createdAt.toLocaleString("es-AR", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })}
      </TableCol>
      <TableCol>{"ARCHIVO ADJUNTO"}</TableCol>
      <TableCol>{`${props.nombre}`}</TableCol>
    </TableRow>
  );
}
