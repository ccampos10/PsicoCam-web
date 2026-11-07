import { describe, expect, it, vi, afterEach } from 'vitest'
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { api } from '../src/services/api'
import { EVENTO_ALERTAS } from '../src/services/eventosAlertas'
import Alertas from '../src/pages/Alertas'
import ModalDetalle from '../src/components/ModalDetalle'

const alerta={id:'QA1',box:'Box 1',categoria:'RS',nivel:'Alto',fecha:'2026-11-06',hora:'08:30',supervisor:'qa@example.cl',estado_evaluacion:'neutro'}
const respuesta=datos=>new Response(JSON.stringify(datos),{status:200})
afterEach(()=>vi.restoreAllMocks())

describe('Correcciones de la verificación SCRUM-693',()=>{
  it('Recordarme usa persistencia optativa y cerrar sesión limpia ambas ubicaciones',async()=>{
    vi.spyOn(globalThis,'fetch').mockImplementation(async()=>respuesta({token:'token-qa',usuario:{id:1,nombre:'QA',rol:'administrador'}}))
    await api.iniciarSesion({usuario:'qa@example.cl',contrasena:'prueba123',recordarme:true})
    expect(localStorage.getItem('psicocam_token')).toBe('token-qa');expect(sessionStorage.getItem('psicocam_token')).toBeNull()
    await api.actualizarCuenta({nombre:'QA',correo:'qa@example.cl',passwordActual:'prueba123'})
    expect(localStorage.getItem('psicocam_token')).toBe('token-qa')
    await api.cerrarSesion();expect(api.sesionActual()).toBeNull();expect(localStorage.getItem('psicocam_token')).toBeNull()
    await api.iniciarSesion({usuario:'qa@example.cl',contrasena:'prueba123',recordarme:false})
    expect(sessionStorage.getItem('psicocam_token')).toBe('token-qa');expect(localStorage.getItem('psicocam_token')).toBeNull()
  })
  it('una respuesta de alertas inválida informa un error recuperable',async()=>{
    vi.spyOn(globalThis,'fetch').mockImplementation(async()=>respuesta({}))
    render(<Alertas />)
    expect((await screen.findByRole('alert')).textContent).toContain('formato inesperado')
    expect(screen.getByRole('button',{name:'Reintentar'})).toBeTruthy()
  })
  it('recibe la nueva lista sin perder el filtro de búsqueda',async()=>{
    const repo={actualizacionesEnVivo:true,getAll:vi.fn().mockResolvedValue([alerta])}
    render(<Alertas repositorio={repo} />);await screen.findByText('Box 1')
    fireEvent.change(screen.getByLabelText('Buscar'),{target:{value:'Box 99'}})
    expect(screen.getByText('No hay alertas pendientes de clasificación.')).toBeTruthy()
    fireEvent(window,new CustomEvent(EVENTO_ALERTAS,{detail:[alerta,{...alerta,id:'QA99',box:'Box 99'}]}))
    expect(screen.getByText('Box 99')).toBeTruthy();expect(screen.getByLabelText('Buscar').value).toBe('Box 99')
  })
  it('muestra evaluación y notas previas y guarda cambios explícitos',async()=>{
    const guardada={...alerta,puede_evaluar:true,estado_evaluacion:'correcta',fecha_evaluacion:'2026-11-06T14:00:00Z',notas_clinicas:'Nota anterior'}
    const guardar=vi.fn().mockResolvedValue(undefined)
    const usuario=userEvent.setup();render(<ModalDetalle alerta={guardada} onCerrar={vi.fn()} onGuardar={guardar} />)
    const modal=screen.getByRole('dialog');expect(within(modal).getByRole('radio',{name:/^Correcta/}).checked).toBe(true)
    expect(within(modal).getByText('06/11/2026 11:00')).toBeTruthy();expect(within(modal).getByRole('button',{name:'Guardar cambios de evaluación'}).disabled).toBe(true)
    await usuario.type(within(modal).getByLabelText('Notas clínicas (opcional)'),' ampliada')
    await usuario.click(within(modal).getByRole('button',{name:'Guardar cambios de evaluación'}))
    await waitFor(()=>expect(guardar).toHaveBeenCalledWith(guardada,'correcta','Nota anterior ampliada'))
  })
  it('un supervisor sin asignación no puede editar la evaluación ni las notas',()=>{
    render(<ModalDetalle alerta={{...alerta,puede_evaluar:false}} onCerrar={vi.fn()} onGuardar={vi.fn()} />)
    expect(screen.getByRole('radio',{name:/^Correcta/}).closest('fieldset').disabled).toBe(true)
    expect(screen.getByRole('button',{name:'Guardar evaluación'}).disabled).toBe(true)
    expect(screen.queryByLabelText('Notas clínicas (opcional)')).toBeNull()
  })
})
