import logoUa from '../assets/ua-logo.png'

export default function PanelPresentacionSesion() {
  return <section className="acceso-panel-marca" aria-labelledby="titulo-presentacion">
    <img className="acceso-logo-ua" src={logoUa} alt="Universidad Autónoma" width="141" height="197" />
    <div className="acceso-presentacion">
      <p className="acceso-antetitulo">PSICOCAM - MONITOREO CLÍNICO</p>
      <h2 id="titulo-presentacion">Supervisión<br />continua de los<br /><span>boxes clínicos</span></h2>
      <p className="acceso-descripcion">Detección temprana de señales de riesgo suicida (RS) y<br className="acceso-salto-descripcion" /> vulneración de derechos (VD) para una respuesta clínica<br className="acceso-salto-descripcion" /> oportuna.</p>
    </div>
  </section>
}
