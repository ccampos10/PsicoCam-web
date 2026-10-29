# PsicoCam - Frontend

## Descripción general

Aplicación web de una sola página (SPA) desarrollada en React para el proyecto **PsicoCam: Sistema de Monitoreo y Alerta Temprana para Boxes Clínicos**.

Este repositorio contiene el componente **web** que usa el personal para:

1. Iniciar sesión y navegar según los permisos de su cuenta.
2. Revisar el panel general (dashboard) con las métricas, el estado de los boxes y las alertas recientes.
3. Consultar, revisar el detalle e historial de las alertas, y la bitácora del sistema.
4. Gestionar usuarios y la configuración del sistema.

El proyecto completo se divide en tres repositorios: frontend (este), backend y detección. En producción, el backend sirve la compilación de este repositorio.

## Estructura de carpetas

```
PsicoCam-web/
├── public/
└── src/
    ├── assets/
    │   └── acceso/
    ├── components/
    │   ├── ConfiguracionForm/
    │   └── PaginaTabla/
    ├── context/
    ├── hooks/
    ├── layouts/
    ├── models/
    ├── pages/
    ├── repositories/
    ├── routes/
    ├── services/
    ├── styles/
    └── utils/
```

## Descripción de carpetas y archivos

### Carpetas

| Carpeta | Funcionalidad |
| --- | --- |
| `public/` | Archivos públicos que se copian tal cual a la compilación (favicon e iconos). |
| `src/assets/` | Recursos estáticos: logos e imágenes. `acceso/` contiene los íconos de la pantalla de inicio de sesión. |
| `src/components/` | Componentes reutilizables de interfaz: barra superior y lateral, modales, tablas con paginación, formularios y los componentes del dashboard (métricas, gráfico de distribución de riesgo, lista de alertas recientes, lista de boxes, progreso de detecciones). |
| `src/context/` | Contexto de React que comparte la sesión del usuario entre los componentes. |
| `src/hooks/` | Hooks personalizados para reutilizar lógica. |
| `src/layouts/` | Estructura general de las vistas autenticadas (barra lateral, barra superior y área de contenido). |
| `src/models/` | Modelos de datos de la aplicación (`Alerta`, `Usuario`). |
| `src/pages/` | Páginas de la aplicación, una por cada ruta. |
| `src/repositories/` | Interfaces de acceso a datos de alertas. |
| `src/routes/` | Definición de las rutas, del menú de navegación y de los permisos de acceso. |
| `src/services/` | Acceso a los datos: interfaces de los repositorios y servicio simulado con datos de prueba. |
| `src/styles/` | Estilos globales y compartidos (variables de diseño, layout, dashboard, inicio de sesión). |
| `src/utils/` | Funciones auxiliares, como los colores del semáforo de riesgo. |

### Archivos principales

| Archivo | Descripción |
| --- | --- |
| `src/main.jsx` | Punto de entrada de React. Monta la aplicación con `BrowserRouter` y carga los estilos globales y la tipografía. |
| `src/App.jsx` | Componente raíz. Envuelve la aplicación con el proveedor de sesión y renderiza las rutas. |
| `src/routes/RutasAplicacion.jsx` | Define las rutas de la aplicación, la protección por sesión y por permisos, y las redirecciones. |
| `src/routes/mapaRutas.js` | Lista central de rutas con su título y la página que muestra cada una. |
| `src/routes/navegacion.js` | Opciones del menú lateral y la función `puedeAcceder`, que decide si un usuario puede entrar a una ruta. |
| `src/context/ProveedorSesion.jsx` | Proveedor del estado de la sesión (usuario, cierre de sesión). |
| `src/hooks/useSesion.js` | Hook para acceder a la sesión desde cualquier componente. |
| `src/layouts/Layout.jsx` | Plantilla con `Sidebar`, `Navbar` y el contenido de la página. |
| `src/services/MockService.js` | Servicio simulado que entrega datos de prueba (`mockData.json`, `usuariosMock.json`). |
| `index.html` | Documento HTML base de la aplicación. |
| `vite.config.js` | Configuración de Vite, incluido el prefijo de recursos de la compilación. |
| `eslint.config.js` | Reglas de análisis de código (lint). |
| `package.json` | Metadatos, scripts y dependencias del proyecto. |
| `package-lock.json` | Versiones exactas de las dependencias instaladas. |
| `.gitignore` | Archivos y carpetas que Git ignora (`node_modules`, `dist`, etc.). |

## Arquitectura y rutas

### Arquitectura

La aplicación es una SPA construida con React y Vite, organizada por responsabilidades:

- **Navegación:** `BrowserRouter` (React Router) gestiona el historial del navegador. `Routes` elige la página según la URL y `Outlet` la inserta dentro del `Layout`, que mantiene la barra lateral y la superior. Los enlaces del menú usan `NavLink`, que actualiza la URL sin recargar la página y marca la opción activa.
- **Sesión:** `ProveedorSesion` guarda el usuario autenticado y las rutas a las que tiene permiso (`rutasPermitidas`). Los componentes la consultan con el hook `useSesion`. Los permisos provienen de la sesión, no del nombre visible del rol.
- **Páginas y componentes:** cada ruta muestra una página de `pages/`, que se compone de componentes reutilizables de `components/`. Los estilos están en archivos globales (`styles/`) y en CSS Modules por componente o página.
- **Acceso a datos:** las páginas obtienen los datos mediante interfaces de repositorio (`repositories/` y `services/`), de modo que el origen de los datos se pueda cambiar sin modificar la interfaz. Actualmente el origen es un servicio simulado con datos de prueba.
- **Integración con el backend:** el inicio de sesión y los datos reales mediante la API del backend (`/api`) aún no están integrados. El inicio de sesión funciona con una vista previa con un perfil de prueba, disponible solo en modo desarrollo.

### Protección de rutas

1. Las URLs internas exigen una sesión activa. Sin sesión, se redirige a `/login` y, tras iniciar sesión, se puede volver a la ruta solicitada.
2. Con sesión, cada ruta verifica que esté en las `rutasPermitidas` del usuario. Si no lo está, se muestra el mensaje "Acceso restringido".
3. La ruta `/` redirige a la primera ruta permitida del usuario (o a `/dashboard`).
4. Una URL desconocida muestra la página 404 dentro del layout, cuando hay sesión.

### Rutas de la aplicación

| Ruta | Página | Menú lateral |
| --- | --- | --- |
| `/login` | Inicio de sesión (única ruta pública) | No |
| `/` | Redirección a la primera ruta permitida | No |
| `/dashboard` | Dashboard | Sí |
| `/alertas` | Alertas | Sí |
| `/alertas/:idAlerta` | Detalle de alerta | No (se abre desde una alerta) |
| `/historial` | Historial de alertas | Sí |
| `/bitacora` | Bitácora | Sí |
| `/usuarios` | Gestión de usuarios | Sí |
| `/configuracion` | Configuración | Sí (grupo cuenta) |
| `/mi-cuenta` | Mi cuenta (módulo pendiente) | Sí (grupo cuenta) |
| `*` | Página no encontrada | No |

### Integración con el backend

La compilación se genera con el prefijo `/resources/` para que el backend la sirva (el prefijo se define en `vite.config.js`; en desarrollo se mantiene `/`). El backend entrega `index.html` para las rutas internas de la aplicación, lo que permite entrar directamente a una URL como `/historial`.

## Instrucciones de ejecución

### Requisitos previos

- Node.js 24 y npm 11 (versiones con las que se verificó el proyecto: Node 24.14.1 y npm 11.11.0)

### Variables de entorno

El frontend no requiere variables de entorno propias, por lo que no necesita un archivo `.env`. La vista previa de sesión depende de la variable integrada de Vite `import.meta.env.DEV`, que está activa solo con `npm run dev`.

### Instalación

1. Clonar el repositorio y cambiarse a la rama de desarrollo:

   ```bash
   git clone https://github.com/ccampos10/PsicoCam-web.git
   cd PsicoCam-web
   git checkout Dev
   ```

2. Instalar las dependencias. Se recomienda `npm ci`, que reproduce las versiones exactas del archivo de bloqueo:

   ```bash
   npm ci
   ```

### Ejecución

Iniciar el entorno de desarrollo:

```bash
npm run dev
```
La aplicación estará disponible en la dirección local indicada por Vite en la terminal.

Para usar datos reales durante el desarrollo, inicia también PsicoCam-Backend en
`http://localhost:3000`. Vite redirige las solicitudes `/api` a ese servidor; no
es necesario compilar el frontend para desarrollar. Si usas `VITE_API_URL`, esa
dirección reemplaza las rutas relativas y puede requerir configuración de CORS.
El backend debe tener su almacenamiento configurado o su modo de desarrollo en
memoria activado. Sin backend, la vista previa no proporciona datos reales.

Entorno verificado: Node 24.14.1 y npm 11.11.0. Usa `npm ci` para reproducir las versiones del lockfile.


### Arquitectura y rutas

```text
BrowserRouter (main.jsx)
└── ProveedorSesion (App.jsx)
    └── RutasAplicacion
        ├── /login -> AccesoPendiente (sin formulario de login aun)
        └── RequiereSesion
            └── Layout
                ├── Sidebar
                ├── Navbar
                └── main -> Outlet
                    ├── / -> redirección a la primera ruta permitida
                    ├── /dashboard
                    ├── /alertas
                    ├── /alertas/:idAlerta -> DetalleAlerta
                    ├── /historial
                    ├── /configuracion
                    ├── /mi-cuenta
                    └── * -> PaginaNoEncontrada
```

La aplicación queda disponible en la dirección que Vite indica en la terminal (por defecto, `http://localhost:5173`).

### Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo con recarga automática. |
| `npm run build` | Genera la compilación de producción en la carpeta `dist`. |
| `npm run preview` | Sirve localmente la compilación generada. |
| `npm run lint` | Revisa el código con ESLint. |
| `npm test` | Ejecuta las pruebas automatizadas con Vitest. |

Para servir la compilación desde el backend, consultar el README del repositorio `PsicoCam-Backend` (sección "Servir el frontend compilado").

## Librerías y versiones utilizadas

Las versiones corresponden a los rangos definidos en `package.json`; las versiones exactas instaladas quedan fijadas en `package-lock.json`.

### Dependencias

| Dependencia | Versión | Uso |
| --- | --- | --- |
| react | ^19.2.8 | Biblioteca de interfaz de usuario. |
| react-dom | ^19.2.8 | Renderizado de React en el navegador. |
| react-router-dom | ^7.18.4 | Enrutamiento de la aplicación. |
| lucide-react | ^1.47.0 | Iconos. |
| recharts | ^3.10.1 | Gráficos del dashboard. |
| @fontsource/inter | ^5.3.0 | Tipografía Inter alojada localmente. |

### Dependencias de desarrollo

| Dependencia | Versión | Uso |
| --- | --- | --- |
| vite | ^8.3.0 | Servidor de desarrollo y compilación. |
| @vitejs/plugin-react | ^6.1.1 | Soporte de React en Vite. |
| eslint | ^10.10.0 | Análisis estático del código. |
| @eslint/js | ^10.0.1 | Reglas base de ESLint. |
| eslint-plugin-react-hooks | ^7.1.1 | Reglas para los hooks de React. |
| eslint-plugin-react-refresh | ^0.5.6 | Reglas para la recarga en caliente. |
| globals | ^17.12.0 | Variables globales para ESLint. |
| @types/react | ^19.2.18 | Tipos de React. |
| @types/react-dom | ^19.2.7 | Tipos de React DOM. |
| vitest | ^5.0.1 | Ejecución de pruebas. |
| jsdom | ^29.1.1 | Entorno DOM para las pruebas. |
| @testing-library/react | ^16.3.3 | Pruebas de componentes. |
| @testing-library/user-event | ^14.6.7 | Simulación de interacciones en las pruebas. |

**Software requerido:** Node.js 24 y npm 11.