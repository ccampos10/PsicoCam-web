import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Bell } from 'lucide-react'
import TarjetaMetrica from '../src/components/TarjetaMetrica'

describe('TarjetaMetrica: SCRUM-30', () => {
  it('maqueta el contenedor base de la tarjeta con los textos inyectados', () => {
    render(<TarjetaMetrica etiqueta="Alertas registradas" valor={15} nota="Total de detecciones" />)
    const tarjeta = screen.getByRole('article')
    expect(screen.getByText('Alertas registradas')).toBeTruthy()
    expect(screen.getByText('15')).toBeTruthy()
    expect(screen.getByText('Total de detecciones')).toBeTruthy()
    expect(tarjeta.className).toBe('tarjeta-metrica')
  })

  it('permite diferenciar la categoría por color de acento', () => {
    render(<TarjetaMetrica etiqueta="Pendientes" valor={5} color="var(--risk-medium)" />)
    expect(screen.getByRole('article').style.getPropertyValue('--accento')).toBe('var(--risk-medium)')
  })

  it('permite diferenciar la categoría por ícono de acento visual', () => {
    const { container } = render(<TarjetaMetrica etiqueta="Alertas registradas" valor={15} icono={Bell} />)
    const icono = container.querySelector('.tarjeta-metrica-icono svg')
    expect(icono).toBeTruthy()
    expect(icono.getAttribute('aria-hidden')).toBe('true')
  })

  it('resalta la tarjeta cuando se marca como destacada', () => {
    render(<TarjetaMetrica etiqueta="Riesgo alto" valor={2} destacado />)
    expect(screen.getByRole('article').className).toContain('tarjeta-metrica-destacada')
  })
})