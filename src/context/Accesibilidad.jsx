import { useLayoutEffect, useState } from 'react'
import '../styles/accesibilidad.css'

const opciones = {
  texto: ['normal', 'grande', 'mayor'],
  contraste: ['normal', 'alto'],
  paleta: ['predeterminada', 'protanopia', 'deuteranopia', 'tritanopia', 'monocromatico'],
  indicador: ['completo', 'texto'],
}
const inicial = { texto: 'normal', contraste: 'normal', paleta: 'predeterminada', indicador: 'completo' }
import { ContextoAccesibilidad } from './ContextoAccesibilidad'

export function ProveedorAccesibilidad({ usuario, children }) {
  const identificador = usuario?.id ?? usuario?.correo
  const clave = identificador != null ? `psicocam_accesibilidad_${identificador}` : null
  const [preferencias, establecerPreferencias] = useState(() => {
    try {
      const guardadas = clave ? JSON.parse(localStorage.getItem(clave)) : null
      if (guardadas?.paleta === 'alternativa') guardadas.paleta = 'protanopia'
      return Object.fromEntries(Object.keys(inicial).map(campo => [campo, opciones[campo].includes(guardadas?.[campo]) ? guardadas[campo] : inicial[campo]]))
    } catch { return inicial }
  })

  useLayoutEffect(() => {
    const raiz = document.documentElement
    raiz.dataset.contraste = preferencias.contraste
    raiz.dataset.paleta = preferencias.paleta
    raiz.dataset.indicador = preferencias.indicador
    raiz.style.zoom = { normal: '1', grande: '1.15', mayor: '1.3' }[preferencias.texto]
    try { if (clave) localStorage.setItem(clave, JSON.stringify(preferencias)) } catch { /* almacenamiento no disponible */ }
    return () => {
      delete raiz.dataset.contraste
      delete raiz.dataset.paleta
      delete raiz.dataset.indicador
      raiz.style.zoom = ''
    }
  }, [clave, preferencias])

  function actualizarPreferencia(campo, valor) {
    if (opciones[campo]?.includes(valor)) establecerPreferencias(actual => ({ ...actual, [campo]: valor }))
  }
  return <ContextoAccesibilidad.Provider value={{ preferencias, actualizarPreferencia }}>{children}</ContextoAccesibilidad.Provider>
}
