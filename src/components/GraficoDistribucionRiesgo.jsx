import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PanelEstadistica from './PanelEstadistica'
import { colorNivel } from '../utils/coloresSemafaro'

export default function GraficoDistribucionRiesgo({ datos }) {
  const descripcionAccesible = datos.map(dato => `${dato.nivel}: ${dato.cantidad}`).join(', ')
  return <PanelEstadistica titulo="Distribución por nivel de riesgo" etiqueta="Distribución por nivel de riesgo" descripcion="Alertas registradas">
    <div className="grafico-barras" role="img" aria-label={`Distribución por nivel de riesgo: ${descripcionAccesible}`}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos} margin={{ top: 26, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-muted)" />
          <XAxis dataKey="nivel" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
          <Tooltip cursor={{ fill: 'var(--canvas)' }} labelFormatter={(etiqueta) => `Nivel: ${etiqueta}`} formatter={() => 'alertas'} />
          <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive={false}>
            <LabelList dataKey="cantidad" position="top" style={{ fontSize: 12, fontWeight: 600, fill: 'var(--text-primary)' }} />
            {datos.map(dato => <Cell key={dato.nivel} fill={colorNivel[dato.nivel]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </PanelEstadistica>
}