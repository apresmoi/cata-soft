import { Hospitalizaciones } from "@prisma/client";
import { TableCol, TableRow, RowProps } from "../Table";

export function HospitalizacionRow(props: RowProps<Hospitalizaciones>) {
  const handleClick = () => {
    props.onClick?.(props.id);
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
      <TableCol>{"HOSPITALIZACION"}</TableCol>
      <TableCol>{props.motivo}</TableCol>
    </TableRow>
  );
}
