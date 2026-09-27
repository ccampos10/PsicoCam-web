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

BrowserRouter gestiona el historial del navegador; NavLink actualiza la URL sin recargar y expone `aria-current="page"`. Routes selecciona la página y Outlet la inserta dentro del mismo Layout. Las URLs internas sin sesión redirigen a `/login`; una sesión sin permiso recibe Acceso restringido. Las URLs desconocidas muestran la página 404 dentro del shell cuando hay sesión.

El hosting de producción debe devolver `index.html` para rutas de la SPA como `/historial`, manteniendo las rutas de archivos estáticos.

### Versiones instaladas

| Dependencia | Versión | Uso |
| --- | --- | --- |
| react | 19.3.0 | Existente |
| react-dom | 19.3.0 | Existente |
| react-router-dom | 7.18.4 | Nueva: enrutamiento |
| lucide-react | 1.47.0 | Nueva: iconos |
| recharts | 3.10.1 | Nueva: gráficos de barras del dashboard |
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

### Pruebas del programa

Para ver que el programa este corriendo de manera perfecta se creo un directorio dentro de src llamado tests, se encargan de revisar que el código este funcionando correctamente y ayudan a detectar si un cambio rompe algo en el código que antes funcionaba. 

Para poder ejecutarlos en consola se usa 'npm test' ejecutara una serie de pruebas y nos mostrará si fueron superadas en su totalidad; si es que no es así; mostrará el error en consola