# Documentación Técnica del Proyecto PaqueTrack UI Service

## Introducción

Este documento proporciona un análisis completo y técnico del proyecto **PaqueTrack UI Service**, una aplicación frontend desarrollada en React para la gestión y seguimiento de envíos logísticos. El proyecto forma parte de un sistema de microservicios que incluye servicios de autenticación, envíos y tracking.

## Descripción del Proyecto

PaqueTrack es una plataforma de visibilidad logística que ofrece autenticación JWT, gestión de envíos, registro de eventos de tracking y trazabilidad en tiempo casi real. La aplicación proporciona un panel único para operar y auditar operaciones logísticas.

### Características Principales
- **Autenticación JWT**: Sistema de login con tokens de acceso y refresh
- **Gestión de Envíos**: Creación, búsqueda y visualización de envíos
- **Sistema de Tracking**: Registro de eventos y historial de seguimiento
- **Panel Administrativo**: Estadísticas y gestión de usuarios por roles
- **Interfaz Responsiva**: Diseño adaptativo con navegación móvil

## Arquitectura

### Arquitectura General
La aplicación sigue una arquitectura de microservicios frontend, integrada con múltiples servicios backend a través de un API Gateway. Utiliza React con hooks para la gestión de estado y React Router para el enrutamiento.

### Patrón de Diseño
- **Componentes Funcionales**: Uso de hooks de React (useState, useEffect, useContext)
- **Separación de Concerns**: API, componentes, páginas y contexto separados
- **Provider Pattern**: AuthContext para gestión global de autenticación
- **Layout Pattern**: MainLayout con sidebar para navegación consistente

### Comunicación con Backend
- **API Gateway**: Punto único de entrada a servicios backend
- **Axios Interceptors**: Manejo automático de tokens y refresh
- **Servicios Especializados**: authApi, shipmentApi, trackingApi

## Tecnologías Utilizadas

### Framework y Librerías Principales
- **React 19.2.4**: Framework principal para la construcción de la interfaz
- **React Router DOM 7.14.1**: Enrutamiento y navegación
- **Axios 1.15.0**: Cliente HTTP para llamadas a APIs
- **Vite 7.3.0**: Herramienta de build y desarrollo

### Herramientas de Desarrollo
- **ESLint 9.39.4**: Linting con reglas específicas para React
- **Vite Plugin React**: Integración de React con Vite
- **TypeScript Types**: Definiciones de tipos para React

### Estilos y UI
- **CSS Variables**: Sistema de design tokens
- **Fuentes Google**: DM Sans y JetBrains Mono
- **Tema Oscuro**: Paleta de colores enfocada en logística

## Estructura de Archivos

```
ui-service-main/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── api/
│   │   ├── authApi.js          # Funciones de autenticación
│   │   ├── httpClient.js       # Cliente HTTP configurado
│   │   ├── shipmentApi.js      # API de envíos
│   │   └── trackingApi.js      # API de tracking
│   ├── assets/                 # Recursos estáticos
│   ├── components/
│   │   ├── AppSidebar.jsx      # Barra lateral de navegación
│   │   ├── MainLayout.jsx      # Layout principal
│   │   ├── Navbar.jsx          # Barra de navegación
│   │   └── ProtectedRoute.jsx  # Ruta protegida
│   ├── context/
│   │   └── AuthContext.jsx     # Contexto de autenticación
│   ├── pages/
│   │   ├── AdminPage.jsx       # Página administrativa
│   │   ├── HomePage.jsx        # Página principal
│   │   ├── LoginPage.jsx       # Página de login
│   │   ├── ShipmentsPage.jsx   # Gestión de envíos
│   │   └── TrackingPage.jsx    # Seguimiento de envíos
│   ├── App.jsx                 # Componente raíz
│   ├── index.css               # Estilos globales
│   └── main.jsx                # Punto de entrada
├── package.json                # Dependencias y scripts
├── vite.config.js              # Configuración de Vite
├── eslint.config.js            # Configuración de ESLint
├── index.html                  # HTML raíz
└── README.md                   # Documentación básica
```

## Componentes Principales

### App.jsx
Componente raíz que configura el enrutamiento y el proveedor de autenticación.

```jsx
<BrowserRouter>
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      // ... más rutas
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

### MainLayout.jsx
Layout principal que incluye:
- Verificación de autenticación
- Navegación móvil responsiva
- Sidebar integrada
- Protección de rutas

### AppSidebar.jsx
Barra lateral con:
- Logo y branding de PaqueTrack
- Navegación principal (Inicio, Envíos, Tracking)
- Funcionalidad de logout
- Indicadores de página activa

### AuthContext.jsx
Contexto de autenticación que maneja:
- Estado del usuario (id, email, roles)
- Tokens JWT en sessionStorage
- Funciones de login/logout
- Verificación de roles administrativos

## API y Servicios

### HttpClient (httpClient.js)
Cliente Axios configurado con:
- **Interceptors de Request**: Agrega token Bearer automáticamente
- **Interceptors de Response**: Manejo de refresh tokens en 401
- **Timeout**: 15 segundos por defecto
- **Base URL**: Configurable via variables de entorno

### AuthApi (authApi.js)
Funciones de autenticación:
- `login(email, password)`: Autenticación de usuario
- `refresh(refreshToken)`: Renovación de tokens
- `getMe()`: Obtención de datos del usuario actual
- `getAdminStats()`: Estadísticas administrativas

### ShipmentApi (shipmentApi.js)
Operaciones con envíos:
- `createShipment(data)`: Creación de nuevo envío
- `getShipmentById(id)`: Obtención por ID
- `getShipmentByTracking(trackingId)`: Búsqueda por código de tracking
- `searchShipments(params)`: Búsqueda paginada

### TrackingApi (trackingApi.js)
Sistema de seguimiento:
- `registerEvent(shipmentId, data)`: Registro de eventos
- `getHistory(shipmentId, params)`: Historial paginado
- `getCurrentStatus(shipmentId)`: Estado actual

## Autenticación

### Sistema JWT
- **Tokens**: Access y Refresh tokens
- **Almacenamiento**: sessionStorage (no persistente)
- **Refresh Automático**: Interceptor maneja renovación transparente
- **Roles**: Sistema basado en roles (ADMIN, USER, etc.)

### Flujo de Autenticación
1. Usuario ingresa credenciales en LoginPage
2. API retorna accessToken y refreshToken
3. Tokens almacenados en sessionStorage
4. AuthContext parsea JWT para extraer datos de usuario
5. Rutas protegidas verifican autenticación

### Protección de Rutas
- MainLayout verifica existencia de usuario
- Redirección automática a /login si no autenticado
- Roles verificados para acceso administrativo

## Páginas

### LoginPage.jsx
Página de autenticación con:
- Formulario de email/contraseña
- Manejo de errores
- Valores por defecto para desarrollo
- Redirección post-login

### HomePage.jsx
Dashboard principal con:
- Estadísticas generales
- Resumen de operaciones
- Navegación rápida

### ShipmentsPage.jsx
Gestión de envíos:
- Creación de nuevos envíos
- Búsqueda por remitente/destinatario
- Listado paginado
- Detalles de envío

### TrackingPage.jsx
Sistema de seguimiento:
- Historial de eventos por envío
- Registro de nuevos eventos
- Estados de tracking (DISPATCHED, IN_TRANSIT, DELIVERED, etc.)
- Paginación de historial

### AdminPage.jsx
Panel administrativo:
- Estadísticas de usuarios por rol
- Gestión de permisos
- Métricas del sistema

## Estilos y UI

### Sistema de Design Tokens
Variables CSS definidas en `:root`:
- **Colores**: Tema oscuro con acentos azules
- **Tipografía**: DM Sans para UI, JetBrains Mono para código
- **Espaciado**: Sistema consistente de márgenes y padding
- **Sombras**: Múltiples niveles para jerarquía visual

### Tema Visual
- **Modo Oscuro**: Interfaz optimizada para operaciones 24/7
- **Colores Logísticos**: Azul para acciones principales, verde para éxito
- **Iconografía**: SVG inline para mejor rendimiento
- **Responsividad**: Diseño mobile-first

## Configuración

### Variables de Entorno
- `VITE_API_GATEWAY_URL`: URL del API Gateway
- `VITE_AUTH_URL`: URL del servicio de autenticación (fallback)
- `VITE_SHIPMENT_URL`: URL del servicio de envíos (fallback)
- `VITE_TRACKING_URL`: URL del servicio de tracking (fallback)

### ESLint Configuration
Reglas específicas para React:
- Hooks recomendados
- Refresh plugin para Vite
- Variables no utilizadas ignoradas con patrón `[A-Z_]`

### Vite Configuration
Configuración mínima con plugin React:
```js
export default defineConfig({
  plugins: [react()],
})
```

## Despliegue

### Scripts de Package.json
- `npm run dev`: Servidor de desarrollo
- `npm run build`: Build de producción
- `npm run lint`: Verificación de código
- `npm run preview`: Vista previa del build

### Build Process
1. Vite compila React con ESBuild
2. Optimización de assets
3. Generación de dist/ con archivos estáticos
4. Configuración para despliegue en servidor web

### Requisitos de Producción
- Servidor web (Nginx, Apache, etc.)
- Variables de entorno configuradas
- API Gateway accesible
- Certificados SSL para HTTPS

## Conclusión

PaqueTrack UI Service es una aplicación frontend robusta y bien estructurada para la gestión logística. Su arquitectura modular, uso de mejores prácticas de React y integración con microservicios backend la hacen escalable y mantenible.

### Puntos Fuertes
- Arquitectura limpia con separación de concerns
- Sistema de autenticación seguro con JWT
- Interfaz responsiva y profesional
- Integración completa con APIs backend
- Manejo adecuado de errores y estados de carga

## Página web desplegada (Vercel)


```
https://ui-service-ashy.vercel.app/login
```
