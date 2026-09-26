export default function Marca({ imagenSimbolo }) {
  return <div className="brand">
    <span className="brand-mark" aria-hidden="true">{imagenSimbolo ? <img src={imagenSimbolo} alt="" width="14" height="14" /> : <span />}</span>
    <div><p>PsicoCam</p><span>Monitoreo clínico</span></div>
  </div>
}
