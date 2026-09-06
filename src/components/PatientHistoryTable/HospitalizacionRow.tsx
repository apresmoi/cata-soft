import { Hospitalizaciones } from "@prisma/client";
import { TableCol, TableRow, RowProps, TableActionButton } from "../Table";
import { useDeleteHospitalizacion } from "../../hooks";
import { Tooltip } from "../Tooltip";
import { DeleteDialog } from "../../Dialogs/DeleteDialog";
import { ThrashCanIcon } from "../Icons/ThrashCanIcon";
import { richTextToPlainText } from "../../richText";
export function HospitalizacionRow(props: RowProps<Hospitalizaciones>) {
  const { remove } = useDeleteHospitalizacion(props.id);

  const handleClick = () => {
    props.onClick?.(props.id);
  };

  const handleRemove = () => {
    remove();
  };

  return (
    <TableRow onClick={handleClick}>
      <TableCol>
        {props.fechaIngreso.toLocaleString("es-AR", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })}
      </TableCol>
      <TableCol>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
          {"HOSPITALIZACION"}
        </div>
      </TableCol>
      <TableCol>{richTextToPlainText(props.motivo)}</TableCol>
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
