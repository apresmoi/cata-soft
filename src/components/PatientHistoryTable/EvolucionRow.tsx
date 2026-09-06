import { Evoluciones } from "@prisma/client";
import { TableRow, TableCol, RowProps, TableActionButton } from "../Table";
import { DeleteDialog } from "../../Dialogs/DeleteDialog";
import { Tooltip } from "../Tooltip";
import { ThrashCanIcon } from "../Icons/ThrashCanIcon";
import { useDeleteEvolucion } from "../../hooks";

export function EvolucionRow(props: RowProps<Evoluciones>) {
  const { remove } = useDeleteEvolucion(props.id);

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
        <div className="inline-flex items-center gap-2 rounded-full bg-vessel-100 px-2 py-1 text-xs font-semibold text-vessel-800">
          {"EVOLUCION"}
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
