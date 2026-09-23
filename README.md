# PsicoCam - FrontEnd

Aplicación web desarrollada en React para el proyecto **PsicoCam: Sistema de Monitoreo y Alerta Temprana para Boxes Clínicos**.

## Estructura del proyecto

```text
PagWeb/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Descripción de las carpetas

- **assets/**: recursos estáticos utilizados por la aplicación, como imágenes, logos e iconos.
- **components/**: componentes reutilizables de React, como botones, tarjetas, tablas y otros elementos de interfaz.
- **context/**: contextos de React utilizados para compartir estados entre distintos componentes de la aplicación.
- **hooks/**: hooks personalizados de React para reutilizar lógica.
- **layouts/**: estructuras generales de las vistas, como la plantilla principal que contendrá Navbar y Sidebar.
- **pages/**: páginas principales de la aplicación, como Login, Dashboard e Historial.
- **routes/**: configuración y definición de las rutas de navegación de la aplicación.
- **services/**: servicios encargados del acceso a datos y comunicación con fuentes externas o API.
- **styles/**: archivos de estilos generales y compartidos de la aplicación.
- **utils/**: funciones auxiliares y utilidades reutilizables.

## Archivos principales

- **App.jsx**: componente principal de la aplicación.
- **main.jsx**: punto de entrada de React.
- **App.css**: estilos asociados al componente principal.
- **index.css**: estilos globales de la aplicación.
- **package.json**: configuración del proyecto y dependencias.
- **vite.config.js**: configuración de Vite.

## Ejecución del proyecto

Instalar las dependencias:

```bash
npm install
```

Iniciar el entorno de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en la dirección local indicada por Vite en la terminal.
## SCRUM-27 — Estructura base

Se implementó el shell sobre el proyecto existente, sin desarrollar módulos clínicos ni login. Al inspeccionar el repositorio, las carpetas de componentes, páginas, contexto y rutas no tenían implementaciones. Por eso las cinco páginas son destinos de integración explícitos, no reproducciones funcionales del Dashboard, Alertas, Historial, Configuración o Mi cuenta.

### Ejecutar y revisar

Entorno verificado: Node 24.14.1 y npm 11.11.0. Usa `npm ci` para reproducir las versiones del lockfile.

```bash
npm run dev
npm test
npm run lint
npm run build
```

Abre la dirección local de Vite. En `/login`, pulsa **Abrir vista previa del Layout**. Este acceso existe únicamente en desarrollo (`import.meta.env.DEV`), usa un perfil ficticio en memoria y no autentica usuarios. La sesión de prueba termina al recargar o cerrar sesión. `npm run preview` sirve el build de producción: el acceso de demostración no está habilitado allí.

No se guardaron las credenciales del prototipo en el repositorio. La fuente Inter se sirve localmente; la aplicación no necesita consultar Google Fonts.

### Subtareas y alcance verificable

| Subtarea | Implementado | Validación y pendientes |
| --- | --- | --- |
| SCRUM-215 | `src/layouts/Layout.jsx`, Sidebar y Navbar compartidos, main semántico, enlace para saltar al contenido | Permanencia de los nodos del shell comprobada al navegar. Integración con módulos reales pendiente porque no existen. |
| SCRUM-216 | Identidad provisional del prototipo, navegación principal e inferior, estado activo, usuario desde contexto, notificaciones, menú de usuario, confirmación de cierre y drawer móvil | Interacciones verificadas en jsdom. Comparación visual, desbordamiento, teclado y foco nativo de dialog pendientes en navegador real. |
| SCRUM-217 | BrowserRouter, Routes, Route, NavLink, Navigate, rutas requeridas, ruta predeterminada, 404, filtro de enlaces y control de permisos por URL | Entradas directas, navegación, historial, permisos y logout comprobados. Autenticación y autorización del servidor pendientes. |
| SCRUM-219 | Outlet dentro del contenedor central, sin duplicar el shell por página y sin alturas fijas para el contenido | Cambio del contenido central preservando Sidebar/Navbar comprobado. Tablas, formularios y modales de futuros módulos requieren integración posterior. |

La implementación de las cuatro subtareas está disponible; no se declara su aceptación visual completa sin revisión en navegador.

### Referencia utilizada

Prototipo: https://ide-east-45298112.figma.site/

Se inspeccionaron su HTML, JavaScript y CSS públicos, incluidos los componentes publicados del shell. No hubo navegador conectado para iniciar sesión o comparar capturas. No se verificó el archivo Figma Design por separado.

Se conservaron las medidas encontradas: sidebar de 176 px desde 1024 px de ancho, encabezado de 56 px como altura mínima, drawer de 240 px, padding del contenido de 24 px en escritorio y 16 px en móvil, radios de 8 y 12 px. El contenido ocupa el ancho disponible como en el shell del prototipo, sin imponer un ancho máximo adicional ni recortar los futuros módulos. Los tokens están centralizados en `src/styles/tokens.css`. Los colores de riesgo están definidos para los futuros módulos y no se usan como decoración del shell.

El símbolo de marca reproduce el marcador geométrico provisional del sitio. No representa un logo definitivo aprobado por el cliente.

### Arquitectura y rutas

```text
BrowserRouter (main.jsx)
└── ProveedorSesion (App.jsx)
    └── RutasAplicacion
        ├── /login → AccesoPendiente (sin formulario de login)
        └── RequiereSesion
            └── Layout
                ├── Sidebar
                ├── Navbar
                └── main → Outlet
                    ├── / → redirección a la primera ruta permitida
                    ├── /dashboard
                    ├── /alertas
                    ├── /historial
                    ├── /configuracion
                    ├── /mi-cuenta
                    └── * → PaginaNoEncontrada
```

BrowserRouter gestiona el historial del navegador; NavLink actualiza la URL sin recargar y expone `aria-current="page"`. Routes selecciona la página y Outlet la inserta dentro del mismo Layout. Las URLs internas sin sesión redirigen a `/login`; una sesión sin permiso recibe Acceso restringido. Las URLs desconocidas muestran la página 404 dentro del shell cuando hay sesión.

Documentación de referencia: https://reactrouter.com/start/declarative/routing

El hosting de producción debe devolver `index.html` para rutas de la SPA como `/historial`, manteniendo las rutas de archivos estáticos. Esa configuración depende del servidor y no se implementó un despliegue en esta tarea.

### Integrar los módulos y la sesión real

- Sustituir `ModuloPendiente` en `RutaModulo` por las páginas reales. Mantener Sidebar y Navbar exclusivamente en Layout.
- Conectar el proveedor al estado autenticado de la futura implementación de login. `usuarioInicial` permite inyectar la sesión resuelta al montar el proveedor; no es una API de actualización de sesión. El perfil esperado tiene `nombre`, `rol` y `rutasPermitidas` (lista de rutas internas autorizadas).
- Proporcionar `alCerrarSesion` para invalidar la sesión en el servidor. Si falla, el diálogo muestra un error y permite reintentar sin afirmar que la sesión terminó.
- Resolver los permisos desde el servicio autenticado según el rol. No se inventó una matriz de permisos clínicos. La ausencia de permisos deniega el acceso. La vista previa concede solo acceso al shell vacío.
- Aplicar autorización de datos en el backend. El filtro del frontend no es una barrera de seguridad para información clínica.
- Conectar el panel de notificaciones al servicio real cuando exista. Actualmente informa que el servicio está pendiente y permite navegar a Alertas; no inventa notificaciones ni contadores clínicos.

### Archivos

Creados:

- `src/layouts/Layout.jsx`
- `src/components/Marca.jsx`, `Sidebar.jsx`, `Navbar.jsx`, `PanelDesplegable.jsx`, `Modal.jsx`
- `src/context/ContextoSesion.js`, `ProveedorSesion.jsx`
- `src/hooks/useSesion.js`
- `src/routes/RutasAplicacion.jsx`, `navegacion.js`
- `src/pages/AccesoPendiente.jsx`, `ModuloPendiente.jsx`, `PaginaNoEncontrada.jsx`
- `src/styles/tokens.css`, `layout.css`
- `tests/prepararPrueba.js`, `tests/layout.test.jsx`, `vitest.config.js`

Modificados: `src/App.jsx`, `src/main.jsx`, `src/index.css`, `index.html`, `package.json`, `package-lock.json` y `README.md`.

`src/App.css` conserva el CSS inicial sin importar; no interviene en los estilos del Layout.

### Versiones instaladas

Versiones exactas verificadas con `npm ls --depth=0`; los rangos compatibles declarados permanecen en package.json y la resolución reproducible en package-lock.json.

| Dependencia | Versión | Uso |
| --- | --- | --- |
| react | 19.3.0 | Existente |
| react-dom | 19.3.0 | Existente |
| react-router-dom | 7.18.4 | Nueva: enrutamiento |
| lucide-react | 1.47.0 | Nueva: iconos |
| @fontsource/inter | 5.3.0 | Nueva: Inter local |
| vite | 8.3.0 | Existente |
| @vitejs/plugin-react | 6.1.1 | Existente |
| eslint | 10.10.0 | Existente |
| @eslint/js | 10.0.1 | Existente |
| eslint-plugin-react-hooks | 7.1.1 | Existente |
| eslint-plugin-react-refresh | 0.5.7 | Existente |
| globals | 17.12.0 | Existente |
| @types/react | 19.3.0 | Existente |
| @types/react-dom | 19.3.0 | Existente |
| vitest | 5.0.1 | Nueva: pruebas |
| jsdom | 29.1.1 | Nueva: DOM de pruebas |
| @testing-library/react | 16.3.3 | Nueva: pruebas de integración |
| @testing-library/user-event | 14.6.7 | Nueva: interacciones de prueba |

### Verificación

- `npm test`: 14 pruebas de integración aprobadas.
- `npm run lint`: aprobado, sin errores.
- `npm run build`: aprobado.
- La instalación informó 0 vulnerabilidades en 218 paquetes auditados.

Las pruebas cubren entradas directas a las cinco rutas, redirección, navegación e historial, estado activo, permanencia del shell, 404, acceso sin sesión, permisos, lectura del perfil, panel de notificaciones, cierre de drawer, cancelación/confirmación de logout y error de cierre remoto.

Limitación: jsdom no representa geometría, media queries, el top layer ni el focus trap nativo de `<dialog>`. Las funciones nativas del diálogo se simulan únicamente para probar el cableado React. No se afirma validación visual ni ausencia de desbordamientos.

Revisión manual pendiente en navegador: 320/375/768/1024/1440 px, zoom 200%, abrir/cerrar drawer con Escape y fondo, ciclo de Tab dentro del diálogo y devolución de foco, cambio de breakpoint con drawer abierto, Atrás/Adelante, contenido largo y tablas de los módulos futuros.

### Propuestas para decidir después — no aplicadas

- Evaluar objetivos táctiles de al menos 44 px en los controles compactos del prototipo.
- Revisar el contraste del texto secundario pequeño y acordar variantes accesibles de los tokens.
- Confirmar el logo definitivo con el cliente y actualizar la marca y el favicon de la plantilla cuando se apruebe.
