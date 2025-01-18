import { Antropometrias } from "@prisma/client";
import { TableRow, TableCol, RowProps } from "../Table";

export function AntropometriaRow(props: RowProps<Antropometrias>) {
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
      <TableCol>{"ANTROPOMETRIA"}</TableCol>
      <TableCol>{`Peso ${props.peso} - Talla ${props.talla} - IMC ${props.imc}`}</TableCol>
    </TableRow>
  );
}
