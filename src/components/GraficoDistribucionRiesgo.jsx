import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PanelEstadistica from './PanelEstadistica'
import { colorNivel } from '../utils/coloresSemafaro'

export default function GraficoDistribucionRiesgo({ datos }) {
  const descripcionAccesible = datos.map(dato => `${dato.nivel}: ${dato.cantidad}`).join(', ')
  return <PanelEstadistica titulo="Distribución por nivel de riesgo" etiqueta="Distribución por nivel de riesgo" descripcion="Alertas registradas">
    <div className="grafico-barras" role="img" aria-label={`Distribución por nivel de riesgo: ${descripcionAccesible}`}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos} margin={{ top: 26, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
          <XAxis dataKey="nivel" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6e8794' }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6e8794' }} />
          <Tooltip cursor={{ fill: '#f3f6f9' }} labelFormatter={(etiqueta) => `Nivel: ${etiqueta}`} formatter={() => 'alertas'} />
          <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive={false}>
            <LabelList dataKey="cantidad" position="top" style={{ fontSize: 12, fontWeight: 600, fill: '#173445' }} />
            {datos.map(dato => <Cell key={dato.nivel} fill={colorNivel[dato.nivel]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </PanelEstadistica>
}