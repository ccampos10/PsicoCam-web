import { useEffect, useState } from 'react'
import { Bell, CircleCheck, Clock, TriangleAlert, Users } from 'lucide-react'
import GraficoDistribucionRiesgo from '../components/GraficoDistribucionRiesgo'
import ListaAlertasRecientes from '../components/ListaAlertasRecientes'
import ListaBoxes from '../components/ListaBoxes'
import ProgresoDetecciones from '../components/ProgresoDetecciones'
import TarjetaMetrica from '../components/TarjetaMetrica'
import { MockService } from '../services/MockService'
import '../styles/dashboard.css'

const ORDEN_NIVELES = ['Bajo', 'Medio', 'Alto']

const NOMBRES_CATEGORIA = {
  RS: { nombre: 'Riesgo Suicida', abreviatura: 'RS', color: 'var(--secondary)' },
  VD: { nombre: 'Vulneración de Derechos', abreviatura: 'VD', color: '#5d7a88' },
}

function agruparPorNivel(alertas) {
  const conteo = alertas.reduce((acumulado, alerta) => {
    acumulado[alerta.nivel] = (acumulado[alerta.nivel] ?? 0) + 1
    return acumulado
  }, {})
  return ORDEN_NIVELES.map(nivel => ({ nivel, cantidad: conteo[nivel] ?? 0 }))
}

function agruparPorCategoria(alertas) {
  const conteo = alertas.reduce((acumulado, alerta) => {
    acumulado[alerta.categoria] = (acumulado[alerta.categoria] ?? 0) + 1
    return acumulado
  }, {})
  return Object.entries(conteo).map(([categoria, cantidad]) => ({ categoria, cantidad }))
}

function agruparEvaluaciones(alertas) {
  return alertas.reduce((acumulado, alerta) => {
    if (alerta.estado_evaluacion === null || alerta.estado_evaluacion === undefined || alerta.estado_evaluacion === 'neutro') acumulado.pendientes += 1
    else acumulado.evaluadas += 1
    return acumulado
  }, { pendientes: 0, evaluadas: 0 })
}

function contarAtencionesPorSupervisor(alertas) {
  return alertas.reduce((acumulado, alerta) => {
    acumulado[alerta.supervisor] = (acumulado[alerta.supervisor] ?? 0) + 1
    return acumulado
  }, {})
}

export default function Dashboard({ titulo }) {
  const [alertas, setAlertas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    MockService.listarAlertas().then(datos => {
      if (activo) {
        setAlertas(datos)
        setCargando(false)
      }
    })
    return () => { activo = false }
  }, [])

  const totalAlertas = alertas.length
  const nivelRiesgo = agruparPorNivel(alertas)
  const detecciones = agruparPorCategoria(alertas).map(({ categoria, cantidad }) => ({
    ...NOMBRES_CATEGORIA[categoria],
    alertas: cantidad,
  }))
  const evaluaciones = agruparEvaluaciones(alertas)

  const atencionesPorSupervisor = contarAtencionesPorSupervisor(alertas)
  const supervisores = Object.keys(atencionesPorSupervisor)
  const mediaAtenciones = supervisores.length
    ? supervisores.reduce((acumulado, supervisor) => acumulado + atencionesPorSupervisor[supervisor], 0) / supervisores.length
    : 0

  const boxesClinicos = [...new Set(alertas.map(alerta => alerta.box))]

  const alertasRecientes = [...alertas]
    .sort((a, b) => `${b.fecha}T${b.hora}`.localeCompare(`${a.fecha}T${a.hora}`))
    .slice(0, 3)
    .map(alerta => ({ box: alerta.box, tipo: alerta.categoria, nivel: alerta.nivel.toLowerCase(), hora: alerta.hora }))

  const resumenAlertas = {
    registradas: totalAlertas,
    pendientes: evaluaciones.pendientes,
    evaluadas: evaluaciones.evaluadas,
    riesgoAlto: nivelRiesgo.find(nivel => nivel.nivel === 'Alto')?.cantidad ?? 0,
    mediaAtenciones: Number.isInteger(mediaAtenciones) ? mediaAtenciones : mediaAtenciones.toFixed(1),
  }

  return <div className="dashboard">
    <section className="dashboard-cabecera" aria-labelledby="dashboard-titulo">
      <div>
        <h1 id="dashboard-titulo" className="dashboard-titulo">{titulo}</h1>
        <p className="dashboard-subtitulo">Visión general del estado de alertas y monitoreo de los boxes clínicos.</p>
      </div>
      <span className="dashboard-estado"><span className="dashboard-estado-punto" aria-hidden="true"></span>Monitoreo activo</span>
    </section>
    {cargando
      ? <p className="dashboard-cargando">Cargando alertas…</p>
      : <>
          <section className="dashboard-metricas" aria-label="Métricas principales">
            <TarjetaMetrica etiqueta="Alertas registradas" valor={resumenAlertas.registradas} nota="Total de detecciones" color="var(--secondary)" icono={Bell} />
            <TarjetaMetrica etiqueta="Pendientes" valor={resumenAlertas.pendientes} nota="Requieren evaluación" color="var(--risk-medium)" icono={Clock} />
            <TarjetaMetrica etiqueta="Evaluadas" valor={resumenAlertas.evaluadas} nota="Con evaluación registrada" color="var(--risk-low)" icono={CircleCheck} />
            <TarjetaMetrica etiqueta="Riesgo alto" valor={resumenAlertas.riesgoAlto} nota="Prioridad visual" color="var(--risk-high)" icono={TriangleAlert} destacado />
            <TarjetaMetrica etiqueta="Promedio por supervisor" valor={resumenAlertas.mediaAtenciones} nota="Media de atenciones" color="var(--secondary)" icono={Users} />
          </section>
          <section className="dashboard-fila" aria-label="Estadísticas de alertas">
            <GraficoDistribucionRiesgo datos={nivelRiesgo} />
            <ProgresoDetecciones datos={detecciones} />
          </section>
          <section className="dashboard-fila" aria-label="Boxes y alertas recientes">
            <ListaBoxes boxes={boxesClinicos} />
            <ListaAlertasRecientes alertas={alertasRecientes} />
          </section>
        </>}
  </div>
}