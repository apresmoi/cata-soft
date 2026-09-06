# CataSoft

CataSoft is a single-clinician patient-records desktop application with a
Spanish-language UI. It manages patient demographics plus per-patient
clinical records: evoluciones, interconsultas, antropometrías,
hospitalizaciones, and archivos adjuntos (attached files/documents).

## Stack

- Electron 30 (main process) owns Prisma + SQLite: all database access
  happens in the main process.
- React 18 + TypeScript (renderer process) talks to the main process over
  `ipcMain.handle` / `ipcRenderer.invoke` IPC channels — the renderer never
  touches Prisma directly.
- Vite 5 bundles both the renderer and, via `vite-plugin-electron`, the
  main/preload scripts.
- Tailwind CSS for styling.
## Instalación

### Usuarios finales
Para usar la aplicación, descarga la última versión desde la página de **Releases** en GitHub.
- **Windows**: Descarga el instalador `.exe` e instálalo (requiere permisos de administrador).
- **Mac**: Descarga el archivo `.dmg`.
- **Linux**: Descarga el archivo `.AppImage`.

### Actualizaciones
La aplicación cuenta con un sistema de **actualización automática**. Cuando haya una nueva versión publicada en GitHub Releases, CataSoft la detectará y la descargará en segundo plano. Te notificará para instalarla la próxima vez que cierres la aplicación, asegurando que siempre tengas las últimas funciones sin perder ningún dato.

## Desarrollo

### Requisitos

- Node.js (v20 o superior).
- `npm install`

### Iniciar la aplicación
```
npm run dev
```

This starts Vite and, through `vite-plugin-electron-simple`, automatically
launches the Electron window pointed at the dev server. There is no separate
"start Electron" step.
### Compilar la aplicación

```bash

```
npm run build
```


## Seguridad de Datos y Base de Datos

**Los datos de los pacientes son irremplazables.** CataSoft está diseñado para protegerlos en cada actualización:

1. **Ubicación de la Base de Datos**: La base de datos (`catasoft.db`) se guarda en la carpeta de datos de usuario del sistema operativo (UserData), no en la carpeta de instalación. Las actualizaciones nunca sobrescriben tus datos.
2. **Copias de Seguridad Automáticas**: Antes de aplicar cualquier actualización en la estructura de la base de datos (migraciones), el sistema realiza una copia de seguridad completa (`catasoft.db` -> `backups/`).
3. **Recuperación Ante Fallos**: Si una migración falla, el sistema bloquea el inicio, restaura la copia de seguridad automáticamente y avisa del error, previniendo la corrupción de los registros clínicos.

*Solo se incluyen en el paquete compilado los esquemas y las instrucciones de migración, la base de datos de pruebas (`dev.db`) nunca se empaqueta.*

## Archivos Adjuntos
Los archivos adjuntos de los pacientes se guardan en la subcarpeta `uploads` dentro del directorio UserData, bajo el ID de cada paciente. Solo se permite abrir extensiones seguras (PDF, imágenes, documentos Office, texto plano y DICOM).
## Desarrollo UI
`captures-actuales/` contiene capturas de pantalla de la interfaz de producción original. Sirven como especificación visual para futuros cambios.
Además, puedes probar distintas variantes de diseño y layouts accediendo a:
`http://localhost:5174/design.html` y `http://localhost:5174/design.html?mode=layouts`

