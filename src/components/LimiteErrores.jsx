import { Component } from 'react'
export default class LimiteErrores extends Component {
  state = { fallo: false }
  static getDerivedStateFromError() { return { fallo: true } }
  render() {
    if (!this.state.fallo) return this.props.children
    return <section className="placeholder-card" role="alert"><h1>No se pudo mostrar esta pantalla</h1><p>Ocurrió un error al cargar la información. Puedes reintentar o abrir otra sección.</p><button className="button-primary" type="button" onClick={() => this.setState({ fallo: false })}>Reintentar</button></section>
  }
}
