export function Fila({ celdas, alSeleccionar }) {
  function seleccionar(evento) {
    if (evento.target.closest('button, a, input, select, textarea, [role="button"]')) return;
    evento.currentTarget.focus();
    alSeleccionar();
  }

  return (
    <tr tabIndex={alSeleccionar ? 0 : undefined}
      onClick={alSeleccionar ? seleccionar : undefined}
      onKeyDown={alSeleccionar ? (evento) => {
        if (evento.target !== evento.currentTarget) return;
        if (evento.key === 'Enter' || evento.key === ' ') {
          evento.preventDefault();
          alSeleccionar();
        }
      } : undefined}>
      {celdas.map((valor, i) => (
        <td key={i}>{valor}</td>
      ))}
    </tr>
  );
}
