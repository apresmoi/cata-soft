import { Interconsultas } from "@prisma/client";
import { TableRow, TableCol, RowProps } from "../Table";

export function InterconsultaRow(props: RowProps<Interconsultas>) {
  const handleClick = () => {
    props.onClick?.(props.id);
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
      <TableCol>{"INTERCONSULTA"}</TableCol>
      <TableCol>{props.motivo}</TableCol>
    </TableRow>
  );
}
