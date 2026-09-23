import GraficoDistribucionRiesgo from '../components/GraficoDistribucionRiesgo'
import ListaAlertasRecientes from '../components/ListaAlertasRecientes'
import ListaBoxes from '../components/ListaBoxes'
import ProgresoDetecciones from '../components/ProgresoDetecciones'
import TarjetaMetrica from '../components/TarjetaMetrica'
import '../styles/dashboard.css'

const resumenAlertas = { registradas: 15, pendientes: 5, evaluadas: 8, riesgoAlto: 2 }

const nivelRiesgo = [
  { nivel: 'Bajo', cantidad: 6 },
  { nivel: 'Medio', cantidad: 7 },
  { nivel: 'Alto', cantidad: 2 },
]

const detecciones = [
  { nombre: 'Riesgo Suicida', abreviatura: 'RS', alertas: 9, color: 'var(--secondary)' },
  { nombre: 'Vulneración de Derechos', abreviatura: 'VD', alertas: 6, color: '#5d7a88' },
]

const boxesClínicos = ['Box 4', 'Box 5', 'Box 6', 'Box 7', 'Box Infanto-Juvenil']

const alertasRecientes = [
  { box: 'Box 6', tipo: 'RS', nivel: 'alto', hora: '14:32' },
  { box: 'Box 4', tipo: 'VD', nivel: 'medio', hora: '13:48' },
  { box: 'Box 7', tipo: 'RS', nivel: 'bajo', hora: '12:15' },
]

export default function Dashboard({ titulo }) {
  return <div className="dashboard">
    <section className="dashboard-cabecera" aria-labelledby="dashboard-titulo">
      <div>
        <h1 id="dashboard-titulo" className="dashboard-titulo">{titulo}</h1>
        <p className="dashboard-subtitulo">Visión general del estado de alertas y monitoreo de los boxes clínicos.</p>
      </div>
      <span className="dashboard-estado"><span className="dashboard-estado-punto" aria-hidden="true"></span>Monitoreo activo</span>
    </section>
    <section className="dashboard-metricas" aria-label="Métricas principales">
      <TarjetaMetrica etiqueta="Alertas registradas" valor={resumenAlertas.registradas} nota="Total de detecciones" color="var(--secondary)" />
      <TarjetaMetrica etiqueta="Pendientes" valor={resumenAlertas.pendientes} nota="Requieren evaluación" color="var(--risk-medium)" />
      <TarjetaMetrica etiqueta="Evaluadas" valor={resumenAlertas.evaluadas} nota="Con evaluación registrada" color="var(--risk-low)" />
      <TarjetaMetrica etiqueta="Riesgo alto" valor={resumenAlertas.riesgoAlto} nota="Prioridad visual" color="var(--risk-high)" destacado />
    </section>
    <section className="dashboard-fila" aria-label="Estadísticas de alertas">
      <GraficoDistribucionRiesgo datos={nivelRiesgo} />
      <ProgresoDetecciones datos={detecciones} />
    </section>
    <section className="dashboard-fila" aria-label="Boxes y alertas recientes">
      <ListaBoxes boxes={boxesClínicos} />
      <ListaAlertasRecientes alertas={alertasRecientes} />
    </section>
  </div>
}