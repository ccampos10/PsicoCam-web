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