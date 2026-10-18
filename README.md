# Técnica en Programación de Software - Megacolegio El Progreso & SENA

Página web para las sustentaciones de proyectos de los estudiantes de la Técnica en Programación de Software, articulada entre el Megacolegio El Progreso y el SENA Regional Casanare.

## 🚀 Características

- **Gestión de Proyectos**: Panel de administración para agregar, editar y eliminar proyectos
- **Galería de Imágenes**: Sección para mostrar fotos de eventos y actividades
- **Contenido Editable**: Todo el contenido del sitio es editable desde el panel de admin
- **Sistema de Votación**: Los usuarios pueden calificar el logo de la técnica
- **Contador Regresivo**: Cuenta regresiva hasta el evento de sustentaciones
- **Responsive**: Diseño adaptable a todos los dispositivos
- **Actualización en Tiempo Real**: Los cambios se reflejan inmediatamente en todos los dispositivos

## 📋 Requisitos

- Node.js 14 o superior
- Puerto 3000 disponible (configurable)

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/DanielPuin2025/PRPYECTOSTECNICA2026.git
cd PRPYECTOSTECNICA2026
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (opcional):
```bash
# Crear archivo .env
PORT=3000
ADMIN_PASSWORD=tu_contraseña_segura
DATA_DIR=./data
```

4. Iniciar el servidor:
```bash
npm start
```

5. Abrir en el navegador:
```
http://localhost:3000
```

## 🔐 Panel de Administración

Para acceder al panel de administración:

1. Haz clic en el botón "Administrar" en el pie de página
2. Ingresa la contraseña configurada en `ADMIN_PASSWORD`
3. Gestiona proyectos, galería y contenido del sitio

### Funcionalidades del Panel:

- **Proyectos**: Agregar hasta 12 proyectos con logo, descripción, autor y URL
- **Galería**: Subir imágenes de eventos (máximo 4MB por imagen)
- **Contenido**: Editar todos los textos, títulos y descripciones del sitio
- **Features**: Agregar hasta 9 características en "¿De qué se trata?"
- **Tecnologías**: Listar hasta 15 tecnologías que se enseñan

## 📁 Estructura del Proyecto

```
.
├── public/              # Archivos públicos
│   ├── img/            # Imágenes del sitio
│   ├── proyectos/      # Logos de proyectos
│   └── index.html      # Página principal
├── data/               # Base de datos y uploads (generado automáticamente)
│   ├── db.json        # Datos persistentes
│   └── uploads/       # Imágenes subidas
├── server.js          # Servidor Node.js
├── package.json       # Dependencias
├── Dockerfile         # Configuración para Docker
└── README.md          # Este archivo
```

## 🐳 Despliegue con Docker

```bash
# Construir imagen
docker build -t megacolegio-proyectos .

# Ejecutar contenedor
docker run -p 3000:3000 -e ADMIN_PASSWORD=tu_contraseña megacolegio-proyectos
```

## 🌐 Despliegue en Easypanel

1. Conectar repositorio de GitHub
2. Configurar variables de entorno:
   - `ADMIN_PASSWORD`: Contraseña del panel de admin
   - `PORT`: 3000 (o el puerto configurado)
3. Configurar persistencia de datos en `/app/data`
4. Desplegar

## 🔄 Actualización de Contenido

Los cambios realizados en el panel de administración se guardan en `data/db.json` y se reflejan **inmediatamente** en todos los dispositivos gracias a:

- Headers `Cache-Control: no-store` en la API
- Recarga automática de datos al guardar
- Sin necesidad de refrescar manualmente

## 📝 Límites Configurados

- **Proyectos**: Máximo 12
- **Features**: Máximo 9
- **Tecnologías**: Máximo 15
- **Imágenes de galería**: Sin límite (recomendado: 20-30)
- **Tamaño de imágenes**: 4MB por archivo
- **Tamaño de imágenes fuente**: 12MB (antes de procesamiento)

## 🎨 Personalización

### Colores
El sitio usa la paleta de colores del SENA:
- Verde SENA: `#39A900`
- Azul Oscuro: `#00324D`
- Slate (fondos oscuros)

### Logos
Los logos principales están en:
- Logo Megacolegio: `public/img/logo_mega_ok.png`
- Logo SENA: `public/img/logo_sena_ok.png`
- Logo Técnica: `public/img/LOGO TECNICA 2026 SIN FONDO.png`

## 🆘 Solución de Problemas

### Los cambios no se ven
1. Verifica que guardaste desde el panel de admin
2. Limpia la caché del navegador (Ctrl+Shift+R)
3. Verifica que el servidor esté corriendo

### Error de autenticación
1. Verifica que `ADMIN_PASSWORD` esté configurado
2. Revisa que la contraseña sea correcta
3. Limpia sessionStorage del navegador

### Imágenes no cargan
1. Verifica que el directorio `data/uploads` tenga permisos de escritura
2. Verifica que las imágenes sean menores a 4MB
3. Formatos soportados: JPG, PNG, GIF, WebP

## 👥 Autor

**Daniel Humberto Puin Granados**
Técnica en Programación de Software - Megacolegio El Progreso & SENA Regional Casanare

## 📄 Licencia

Este proyecto fue desarrollado para las sustentaciones 2026 del Megacolegio El Progreso.
