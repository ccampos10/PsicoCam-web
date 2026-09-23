export function Fila({ celdas }) {
  return (
    <tr>
      {celdas.map((valor, i) => (
        <td key={i}>{valor}</td>
      ))}
    </tr>
  );
}