import { useState } from "react";
import { ChevronRight } from "lucide-react"

import { PaginaTabla } from "../components/PaginaTabla/PaginaTabla"
import { ColorUrgencia, ColorNivel } from "../components/Pilas";
import Modal from "../components/Modal"
import BitacoraRepository from "../services/BitacoraRepository";

import styles from "./Bitacora.module.css";

const Registro = ({valor, item}) => {
  const [verModal, setVerModal] = useState(false);

  return <>
    <div>
      <ChevronRight className={styles.masDetallesButton} onClick={() => setVerModal(true)} />
    </div>
    {verModal && <Modal alCerrar={() => setVerModal(false)} className={styles.modal}>
      <div>
        <h1>Detalles del registro</h1>
        <p>Registro completo del evento.</p>
        <div className={styles.modalDetalle}>
          <p className={styles.modalTitulo}>Fecha</p>
          <p className={styles.modalDato}>{item.fecha}</p>
        </div>
        
        <div className={styles.modalDetalle}>
          <p className={styles.modalTitulo}>Hora</p>
          <p className={styles.modalDato}>{item.hora}</p>
        </div>

        <div className={styles.modalDetalle}>
          <p className={styles.modalTitulo}>Nivel</p>
          <ColorNivel valor={item.nivel}/>
        </div>
        
        <div className={styles.modalDetalle}>
          <p className={styles.modalTitulo}>Usuario</p>
          <p className={styles.modalDato}>{item.usuario}</p>
        </div>
        
        <div className={styles.modalDetalle}>
          <p className={styles.modalTitulo}>Descripción</p>
          <p className={styles.modalDato}>{item.descripcion}</p>
        </div>

        {item.alerta && (<><h3>Detalle de la alerta asociada</h3>
        <div className={styles.modalAlertaContenedor}>
          <div className={styles.modalAlertaDetalle}>
            <p className={styles.modalAlertaTitulo}>Box</p>
            <p className={styles.modalAlertaDato}>Box 5</p>
          </div>

          <div className={styles.modalAlertaDetalle}>
            <p className={styles.modalAlertaTitulo}>Tipo de detección</p>
            <p className={styles.modalAlertaDato}>Vulneración de derechos (VD)</p>
          </div>

          <div className={styles.modalAlertaDetalle}>
            <p className={styles.modalAlertaTitulo}>Fecha de detección</p>
            <p className={styles.modalAlertaDato}>27/03/2026</p>
          </div>

          <div className={styles.modalAlertaDetalle}>
            <p className={styles.modalAlertaTitulo}>Hora de detección</p>
            <p className={styles.modalAlertaDato}>13:32</p>
          </div>

          <div className={styles.modalAlertaDetalle}>
            <p className={styles.modalAlertaTitulo}>Supervisor</p>
            <p className={styles.modalAlertaDato}>roberto.rober2@psicocam.cl</p>
          </div>

          <div className={styles.modalAlertaDetalle}>
            <p className={styles.modalAlertaTitulo}>Nivel de urgencia</p>
            <ColorUrgencia valor={"Bajo"}/>
          </div>

          <div className={styles.modalAlertaDetalle}>
            <p className={styles.modalAlertaTitulo}>Nivel de urgencia</p>
            <ColorUrgencia valor={"Medio"}/>
          </div>

          <div className={styles.modalAlertaDetalle}>
            <p className={styles.modalAlertaTitulo}>Nivel de urgencia</p>
            <ColorUrgencia valor={"Alto"}/>
          </div>
        </div></>)}

        <button className={styles.modalButton} onClick={() => setVerModal(false)}>
          Cerrar
        </button>

      </div>
    </Modal>}
  </>
}

export default function Bitacora({ rutasDisponibles = [], alEnviar }) {
  const rep = new BitacoraRepository();
  const datos = rep.ObtenerRegistros()
  const columnas = [
    {
      clave: "fechaHora",
      encabezado: "Fecha/Hora",
    },
    {
      clave: "usuario",
      encabezado: "Usuario",
    },
    {
      clave: "nivel",
      encabezado: "Nivel",
      renderizar: (valor, item) => <ColorNivel valor={valor}/>,
    },
    {
      clave: "descripcion",
      encabezado: "Descripción",
    },
    {
      clave: "noExiste",
      encabezado: "Más Detalles",
      renderizar: (valor, item) => <Registro valor={valor} item={item}/>,
    }
  ]
  const filtros = [
    {
      clave: "usuario",
      etiqueta: "Usuario",
      opciones: [...new Set(datos.map((reg) => reg.usuario))]
    },
    {
      clave: "nivel",
      etiqueta: "Nivel",
      opciones: ["Información", "Advertencia", "Grave"]
    }
  ]

  const headerFiltros = <div className={styles.titulo}>
    <h2>Filtros</h2>
    <p className={styles.subtitulo}>Consulta eventos por fecha, usuarios o nivel del evento.</p>
  </div>
  const headerTabla = <div className={styles.titulo}>
    <h2>Registro de eventos</h2>
    <p className={styles.subtitulo}>Cada registro identifica cuándo ocurrió el evento, su responsable y el detalle.</p>
  </div>

  return <div>
    <div className={styles.header}>
      <h1>Bitácora y auditoría</h1>
      <p className={styles.subtitulo}>Trazabilidad de alertas, notificaciones, evaluaciones y eventos técnicos del sistema.</p>
    </div>
    <PaginaTabla datos={datos} columnas={columnas} filtros={filtros} headerFiltros={headerFiltros} headerTabla={headerTabla}/>
  </div>
}