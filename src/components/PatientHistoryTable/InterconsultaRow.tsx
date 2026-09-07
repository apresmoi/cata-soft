import { Interconsultas } from "@prisma/client";
import { TableRow, TableCol, RowProps, TableActionButton } from "../Table";
import { useDeleteInterconsulta } from "../../hooks";
import { Tooltip } from "../Tooltip";
import { DeleteDialog } from "../../Dialogs/DeleteDialog";
import { ThrashCanIcon } from "../Icons/ThrashCanIcon";
import { richTextToPlainText } from "../../richText";

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
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-800">
          {"INTERCONSULTA"}
        </div>
      </TableCol>
      <TableCol>
        <div className="flex items-center gap-2">
          {richTextToPlainText(props.motivo)}
          {props.estado !== "respondida" ? (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
              Pendiente
            </span>
          ) : null}
        </div>
      </TableCol>
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
