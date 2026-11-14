import { describe, expect, it } from 'vitest'
import { ordenarAlertasMasRecientes } from '../src/utils/ordenarAlertas'

describe('ordenarAlertasMasRecientes', () => {
  it('muestra primero las alertas más nuevas usando fecha y hora', () => {
    const alertas = [
      { id: 'antigua', fecha: '2026-11-11', hora: '05:02' },
      { id: 'nueva', fecha: '2026-11-13', hora: '18:45' },
      { id: 'intermedia', fecha: '2026-11-12', hora: '14:32' },
    ]

    expect(ordenarAlertasMasRecientes(alertas).map(alerta => alerta.id))
      .toEqual(['nueva', 'intermedia', 'antigua'])
  })

  it('prioriza una fecha de generación ISO cuando está disponible', () => {
    const alertas = [
      { id: 'primera', fecha: '2026-11-13', hora: '10:00' },
      { id: 'segunda', fecha: '2026-11-13', hora: '09:00', fecha_generacion: '2026-11-13T15:00:00Z' },
    ]

    expect(ordenarAlertasMasRecientes(alertas)[0].id).toBe('segunda')
  })
})
