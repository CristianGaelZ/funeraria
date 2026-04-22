# Sistema Gestor de Funeraria
### Versión 1.0 — Documentación de Instalación y Uso

---

## ¿Cómo ejecutarlo?

Este sistema es 100% frontend (HTML + CSS + JavaScript puro). **No requiere servidor, instalación ni dependencias**.

### Opción 1 — Abrir directo en el navegador
1. Descomprime el archivo ZIP
2. Abre la carpeta `funeraria/`
3. Haz doble clic en `index.html`
4. Se abrirá automáticamente en tu navegador predeterminado

### Opción 2 — Visual Studio Code (recomendado)
1. Instala la extensión **Live Server** en VS Code
2. Abre la carpeta del proyecto en VS Code
3. Clic derecho sobre `index.html` → **"Open with Live Server"**

---

## Estructura del proyecto

```
funeraria/
│
├── index.html          → Página principal y estructura HTML
│
├── css/
│   └── style.css       → Estilos completos del sistema
│
└── js/
    ├── db.js           → Base de datos en memoria (localStorage)
    ├── app.js          → Navegación, modales y utilidades
    ├── difuntos.js     → Microservicio de Difuntos
    ├── familiares.js   → Microservicio de Familiares
    ├── salas.js        → Microservicio de Salas y Capillas
    ├── agenda.js       → Microservicio de Agenda
    ├── reportes.js     → Microservicio de Reportes
    └── init.js         → Dashboard y datos de demostración
```

---

## Módulos del sistema

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Resumen general, actividad reciente y log |
| **Difuntos** | Registro de expedientes de servicio funerario |
| **Familiares** | Directorio de contactos responsables |
| **Salas y Capillas** | Control de disponibilidad de espacios |
| **Agenda** | Calendario de eventos y servicios |
| **Reportes** | Estadísticas y métricas operativas |

---

## Persistencia de datos

Los datos se guardan automáticamente en el **localStorage** del navegador.  
Esto significa:
- Los datos persisten aunque cierres y vuelvas a abrir el navegador
- Son locales al equipo y navegador donde se usa el sistema
- Para limpiar los datos: `F12 → Application → Local Storage → Borrar`

---

## Exportar datos

Desde el Dashboard o la sección de Reportes, usa el botón **"Exportar CSV"** para descargar todos los expedientes en formato CSV (compatible con Excel).

---

## Datos de demostración

Al abrir por primera vez, el sistema carga automáticamente datos de ejemplo para que puedas explorar todas las funcionalidades sin necesidad de registrar nada.

---

*Sistema Gestor de Funeraria — Desarrollado con HTML5, CSS3 y JavaScript puro*
