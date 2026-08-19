# The VideoClub - CineClub

Aplicación web para buscar películas, consultar detalles y gestionar reseñas de usuarios. El proyecto consume la API pública de TMDB (The Movie Database) para obtener información de catálogo y permite registrar opiniones de la comunidad en tiempo real.

## Requisitos previos

- Node.js (versión 18 o superior)
- npm (gestor de paquetes de Node)

## Configuración

Es necesario configurar las variables de entorno tanto para el backend como para el frontend.

### 1. Variables del Backend
Crea un archivo `.env` dentro de la carpeta `backend/` con las siguientes variables:

```env
PORT=3000
TMDB_API_KEY=tu_api_key_de_tmdb
```

### 2. Variables del Frontend
Crea un archivo `.env` dentro de la carpeta `frontend/` para definir la URL del backend:

```env
VITE_API_URL=http://localhost:3000/api
```

## Instalación

Instala las dependencias de cada parte del proyecto de manera independiente.

### Servidor (Backend)
```bash
cd backend
npm install
```

### Cliente (Frontend)
```bash
cd frontend
npm install
```

## Ejecución en desarrollo

Para ejecutar la aplicación localmente, debes iniciar ambos servicios en terminales separadas.

### Iniciar Backend
```bash
cd backend
npm run dev
```
El servidor backend se ejecutará en `http://localhost:3000`.

### Iniciar Frontend
```bash
cd frontend
npm run dev
```
El cliente de desarrollo se ejecutará en `http://localhost:5173`. Abre esta URL en el navegador.

## Características del proyecto

### Backend (Express)
- **Middleware de logs**: Registra cada petición HTTP detallando la hora, método, URL, código de respuesta y tiempo transcurrido.
- **Validaciones**: Comprobación estricta de campos obligatorios en las reseñas (autor, comentario y puntuación entre 1.0 y 5.0).
- **Manejo de errores**: Propagación directa de códigos de error de TMDB (por ejemplo, 404 ante ids inexistentes).
- **Búsqueda por director**: Integra resultados cruzando los créditos cinematográficos de TMDB para obtener películas dirigidas por el cineasta buscado.
- **Almacenamiento temporal**: Base de datos en memoria para registrar y eliminar reseñas dinámicamente.

### Frontend (React)
- **Modularidad**: Componentes desacoplados para la barra de búsqueda, listado de resultados, detalle de películas y formulario de reseñas.
- **Navegación reactiva**: Flujo continuo entre vistas controlado mediante estados de React.
- **Optimización de peticiones**: La búsqueda se ejecuta de manera explícita al hacer clic o presionar Enter, evitando llamadas innecesarias.
- **Indicadores de carga y error**: Mensajes claros en pantalla y loaders al cargar contenidos.
- **Calificación por estrellas**: Interfaz visual de estrellas que soporta calificaciones fraccionadas (por ejemplo, 3.5 estrellas).
- **Enlaces rápidos**: Búsqueda inmediata de películas de un director al hacer clic sobre su nombre en la vista de detalle.
