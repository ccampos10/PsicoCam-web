import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Usuarios from '../src/pages/Usuarios'
import { MockService } from '../src/services/MockService'

describe('Página Usuarios', () => {
  it('carga desde el servicio, busca desde otra página y combina ambos filtros', async () => {
    const interaccion = userEvent.setup()
    const datos = await MockService.listarUsuarios()
    const servicio = { listarUsuarios: async () => [...datos, ...Array.from({ length: 4 }, (_, indice) => ({ ...datos[0], id: 20 + indice, nombre: 'Extra ' + indice }))] }
    render(<Usuarios servicio={servicio} />)
    expect(screen.getByRole('status').textContent).toContain('Cargando')
    await screen.findByText('Dra. Gabriela Sánchez')
    expect(screen.getAllByRole('columnheader')).toHaveLength(6)
    expect(screen.getByRole('button', { name: 'Agregar Usuario' }).disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Editar a Dra. Gabriela Sánchez' }).disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Habilitar a Dr. Luis Pérez' }).disabled).toBe(true)
    await interaccion.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getByText('Extra 3')).toBeTruthy()
    await interaccion.type(screen.getByRole('searchbox'), 'SANCHEZ')
    expect(screen.getByText('Dra. Gabriela Sánchez')).toBeTruthy()
    expect(screen.getByText('Página 1 de 1 - 1 registros')).toBeTruthy()
    await interaccion.clear(screen.getByRole('searchbox'))
    await interaccion.selectOptions(screen.getByLabelText('Rol'), 'Profesional')
    await interaccion.selectOptions(screen.getByLabelText('Estado'), 'Inactivo')
    expect(screen.getByText('Dr. Luis Pérez')).toBeTruthy()
    expect(screen.queryByText('Dra. Gabriela Sánchez')).toBeNull()
    await interaccion.type(screen.getByRole('searchbox'), 'luis.perez@')
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2)
    await interaccion.type(screen.getByRole('searchbox'), 'no-existe')
    expect(screen.getByText('No hay usuarios que coincidan con la búsqueda y los filtros.')).toBeTruthy()
  })

  it('permite reintentar una carga fallida y muestra una lista vacía', async () => {
    const servicio = { listarUsuarios: vi.fn().mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce([]) }
    render(<Usuarios servicio={servicio} />)
    expect(await screen.findByRole('alert')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('No hay usuarios registrados.')).toBeTruthy()
    expect(servicio.listarUsuarios).toHaveBeenCalledTimes(2)
  })

  it('entrega una copia de los perfiles y conserva los datos de origen', async () => {
    const usuarios = await MockService.listarUsuarios()
    usuarios[0].nombre = 'Modificado'
    const nuevaLista = await MockService.listarUsuarios()
    expect(nuevaLista[0].nombre).toBe('Administrador PsicoCam')
  })
})
