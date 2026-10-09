import { useState, useEffect } from "react";
import { ConfiguracionForm } from "../components/ConfiguracionForm/ConfiguracionForm";
import { api } from '../services/api'
import styles from "./PaginaConfiguracion.module.css";

export default function PaginaConfiguracion({ titulo }) {
  const [configuracion, setConfiguracion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    api.obtenerConfiguracion().then((datos) => {
      if (activo) {
        setConfiguracion(datos);
        setCargando(false);
      }
    });
    return () => { activo = false; };
  }, []);

  async function handleGuardar(nuevaConfiguracion) {
    const actualizada = await api.actualizarConfiguracion(nuevaConfiguracion);
    setConfiguracion(actualizada);
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1>{titulo}</h1>
        <p>Ajusta los parámetros operativos que rigen la captura, el procesamiento de los boxes y los canales de notificación.</p>
      </header>

      {cargando ? (
        <p className={styles.cargando}>Cargando configuración...</p>
      ) : (
        <ConfiguracionForm valoresIniciales={configuracion} onGuardar={handleGuardar} />
      )}
    </div>
  );
}
