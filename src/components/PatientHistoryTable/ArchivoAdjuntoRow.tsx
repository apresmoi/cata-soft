import { ArchivosAdjuntos } from "@prisma/client";
import { TableRow, TableCol, TableActionButton } from "../Table";
import { Tooltip } from "../Tooltip";
import { DeleteDialog } from "../../Dialogs/DeleteDialog";
import { ThrashCanIcon } from "../Icons/ThrashCanIcon";
import { useDeleteArchivoAdjunto } from "../../hooks";
import { ImAttachment } from "react-icons/im";

export function ArchivoAdjuntoRow(props: ArchivosAdjuntos) {
  const { remove } = useDeleteArchivoAdjunto(props.id);

  const handleRemove = () => {
    remove();
  };

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
      <TableCol>
        <div className="flex items-center gap-2 bg-purple-800 px-2 py-1 rounded-lg justify-center">
          <ImAttachment />
          {"ARCHIVO ADJUNTO"}
        </div>
      </TableCol>
      <TableCol>{`${props.nombre}`}</TableCol>
      <TableCol>
        <Tooltip tooltip="Eliminar">
          <DeleteDialog asChild onDelete={handleRemove}>
            <span onClick={(e) => e.stopPropagation()}>
              <TableActionButton>
                <ThrashCanIcon />
              </TableActionButton>
            </span>
          </DeleteDialog>
        </Tooltip>
      </TableCol>
    </TableRow>
  );
}
