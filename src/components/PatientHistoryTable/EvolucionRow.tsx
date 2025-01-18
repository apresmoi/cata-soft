import { Evoluciones } from "@prisma/client";
import { TableRow, TableCol, RowProps } from "../Table";

export function EvolucionRow(props: RowProps<Evoluciones>) {
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
      <TableCol>{"EVOLUCION"}</TableCol>
      <TableCol>{props.motivo}</TableCol>
    </TableRow>
  );
}
