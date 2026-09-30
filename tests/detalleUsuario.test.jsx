import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Usuarios from '../src/pages/Usuarios'

const usuarios = Array.from({ length: 12 }, (_, indice) => ({
  id: indice + 1, nombre: `Persona ${indice + 1}`, correo: `persona${indice + 1}@example.com`,
  rol: 'Profesional', estado: indice === 11 ? 'Inactivo' : 'Activo',
  ultimoAcceso: indice === 11 ? null : '2026-09-24T12:00:00-03:00',
}))
const servicio = { listarUsuarios: async () => usuarios }

describe('Detalle de usuario', () => {
  it('abre con teclado, muestra los cinco campos y conserva la página y el foco al cerrar', async () => {
    const interaccion = userEvent.setup()
    render(<Usuarios servicio={servicio} />)
    await screen.findByRole('button', { name: 'Ver detalle de Persona 1' })
    await interaccion.click(screen.getByRole('button', { name: 'Siguiente' }))
    const nombre = screen.getByRole('button', { name: 'Ver detalle de Persona 11' })
    nombre.focus()
    await interaccion.keyboard('{Enter}')
    const modal = screen.getByRole('dialog', { name: 'Detalle de usuario' })
    for (const valor of ['Persona 11', 'persona11@example.com', 'Profesional', 'Activo', '24/09/2026']) {
      expect(within(modal).getByText(valor)).toBeTruthy()
    }
    expect(within(modal).getAllByRole('term')).toHaveLength(5)
    expect(within(modal).queryByRole('textbox')).toBeNull()
    expect(within(modal).queryByRole('combobox')).toBeNull()
    await interaccion.click(within(modal).getByRole('button', { name: 'Cerrar', exact: true }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText('Página 2 de 2 - 12 registros')).toBeTruthy()
    expect(document.activeElement).toBe(nombre)
  })

  it('muestra el usuario inactivo sin accesos y conserva los filtros al cerrar con X o cancelar', async () => {
    const interaccion = userEvent.setup()
    render(<Usuarios servicio={servicio} />)
    await screen.findByRole('button', { name: 'Ver detalle de Persona 1' })
    await interaccion.selectOptions(screen.getByLabelText('Estado'), 'Inactivo')
    await interaccion.selectOptions(screen.getByLabelText('Rol'), 'Profesional')
    await interaccion.type(screen.getByRole('searchbox'), 'persona12@')
    const nombre = screen.getByRole('button', { name: 'Ver detalle de Persona 12' })
    await interaccion.click(nombre)
    const modal = screen.getByRole('dialog')
    expect(within(modal).getByText('Inactivo')).toBeTruthy()
    expect(within(modal).getByText('Sin accesos')).toBeTruthy()
    await interaccion.click(within(modal).getByRole('button', { name: 'Cerrar detalle de usuario' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('searchbox').value).toBe('persona12@')
    expect(screen.getByLabelText('Estado').value).toBe('Inactivo')
    expect(screen.getByLabelText('Rol').value).toBe('Profesional')
    await interaccion.click(nombre)
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true, cancelable: true }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(usuarios[11].estado).toBe('Inactivo')
  })
})
