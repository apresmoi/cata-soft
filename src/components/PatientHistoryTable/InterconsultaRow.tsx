import { Interconsultas } from "@prisma/client";
import { TableRow, TableCol, RowProps, TableActionButton } from "../Table";
import { useDeleteInterconsulta } from "../../hooks";
import { Tooltip } from "../Tooltip";
import { DeleteDialog } from "../../Dialogs/DeleteDialog";
import { ThrashCanIcon } from "../Icons/ThrashCanIcon";

export function InterconsultaRow(props: RowProps<Interconsultas>) {
  const { remove } = useDeleteInterconsulta(props.id);

  const handleClick = () => {
    props.onClick?.(props.id);
  };

  const handleRemove = () => {
    remove();
  };

  return (
    <TableRow onClick={handleClick}>
      <TableCol>
        {props.fecha.toLocaleString("es-AR", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })}
      </TableCol>
      <TableCol>
        <div className="flex items-center gap-2 bg-yellow-800 px-2 py-1 rounded-lg justify-center">
          {"INTERCONSULTA"}
        </div>
      </TableCol>
      <TableCol>{props.motivo}</TableCol>
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
