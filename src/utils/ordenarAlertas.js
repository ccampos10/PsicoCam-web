function fechaAlerta(alerta) {
  const fechaConZona = alerta?.fecha_generacion ?? alerta?.fecha_hora ?? alerta?.fechaHora
  if (fechaConZona) {
    const instante = Date.parse(fechaConZona)
    if (!Number.isNaN(instante)) return instante
  }

  const fecha = String(alerta?.fecha ?? '').trim()
  const hora = String(alerta?.hora ?? '00:00:00').trim()
  const instante = Date.parse(`${fecha}T${hora}`)
  return Number.isNaN(instante) ? Number.NEGATIVE_INFINITY : instante
}

export function ordenarAlertasMasRecientes(alertas = []) {
  return alertas
    .map((alerta, indice) => ({ alerta, indice, instante: fechaAlerta(alerta) }))
    .sort((a, b) => b.instante - a.instante || a.indice - b.indice)
    .map(({ alerta }) => alerta)
}
