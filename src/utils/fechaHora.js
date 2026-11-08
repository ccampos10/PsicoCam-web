export function formatearFechaEvaluacion(valor) {
  if (!valor || !Number.isFinite(Date.parse(valor))) return 'No registrada'
  const p = Object.fromEntries(new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(valor)).map(({ type, value }) => [type, value]))
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}
