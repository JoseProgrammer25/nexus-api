# Nexus API

> Un cliente HTTP de escritorio minimalista, libre y de código abierto, construido con Tauri 2, Vue 3 y Dexie.js.

**Nexus API** (antes `nexus-API`) es una herramienta para desarrollar y probar APIs directamente desde tu escritorio, inspirada en la fluidez de las herramientas modernas de testing HTTP, pero con una identidad visual, una paleta de colores y una interfaz 100% propias. Rápida, ligera y sin registros de cuenta: todo el historial se guarda de forma local y privada.

---

## Descargas

| Sistema operativo | Instalador |
| ----------------- | ---------- |
| macOS (Apple Silicon) | [Nexus API 0.1.0 (.dmg)](https://github.com/JoseProgrammer25/nexus-api/releases/latest) |
| Windows | [Nexus API 0.1.0 (.msi)](https://github.com/JoseProgrammer25/nexus-api/releases/latest) |
| Linux | [Nexus API 0.1.0 (.AppImage)](https://github.com/JoseProgrammer25/nexus-api/releases/latest) |

Todos los instaladores se publican en la [página de releases](https://github.com/JoseProgrammer25/nexus-api/releases). No necesitas cuenta ni conexión para usarla: todo el historial vive en tu máquina.

---

## Características

- **Historial local** con Dexie.js (IndexedDB): cada petición exitosa se guarda automáticamente, sin sincronización en la nube.
- **Sidebar de historial** con búsqueda/filtrado por URL, método o código de estado, eliminación individual y vaciado completo.
- **Selector de método HTTP** (GET, POST, PUT, PATCH, DELETE) con código de colores por verbo.
- **Editor de peticiones por pestañas**: Headers (pares clave-valor dinámicos), Params (query parameters) y Body (editor JSON con validación en vivo y formateo automático).
- **Panel de respuesta** con código de estado coloreado (2xx verde, 3xx azul, 4xx/5xx rojo), tiempo de respuesta en ms, tamaño y vista Body / Headers de la respuesta.
- **Respuesta JSON formateada** automáticamente con scroll y visualización en monospace.
- **Atajos de teclado**: `Cmd/Ctrl + Enter` para enviar.
- **Interfaz moderna** con Tailwind CSS 4, tema oscuro y acentos en degradado.

## Stack tecnológico

| Capa       | Tecnología                          |
| ---------- | ----------------------------------- |
| Frontend   | Vue 3 (Composition API) + TypeScript |
| Build      | Vite 6                              |
| Estilos    | Tailwind CSS 4                      |
| Escritorio | Tauri 2                             |
| Datos      | Dexie.js 4 (IndexedDB)              |

## Requisitos previos

Instala los siguientes componentes en orden:

1. **Node.js 18+** (recomendado Node 20 LTS)
   - <https://nodejs.org>
2. **Rust + Cargo** (stable)
   - <https://rustup.rs> — una sola línea: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
3. **Dependencias del sistema para Tauri** según tu SO:
   - **macOS**: Xcode Command Line Tools (`xcode-select --install`) y, opcionalmente, Homebrew.
   - **Linux**: `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libxdo-dev`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`.
   - **Windows**: WebView2 (incluido en Windows 11), Visual Studio Build Tools con "Desktop development with C++".
4. **Tauri CLI**: se instala como dependencia de desarrollo del proyecto (no hace falta instalación global).
   - Verifica: `node -v`, `cargo --version` y `rustc --version`.

## Puesta en marcha

```bash
# 1. Clona el repositorio
git clone https://github.com/JoseProgrammer25/nexus-api.git
cd nexus-api

# 2. Instala las dependencias de JavaScript
npm install

# 3. Ejecuta la aplicación en modo desarrollo (compila el binario y abre la ventana)
npm run tauri dev
```

> En el primer arranque, `cargo` compilará el binario nativo de Tauri. Puede tardar varios minutos.

### Otros comandos útiles

```bash
npm run dev          # solo el frontend (Vite) en http://localhost:1420
npm run build        # typecheck (vue-tsc) + build de producción del frontend
npm run preview      # previsualiza el build de Vite
npm run tauri build  # genera los instaladores (.dmg/.appimage/.msi) en src-tauri/target/release
```

## Guía de uso de la interfaz

### 1. Barra superior
Selecciona el **método HTTP** (GET, POST, PUT, PATCH o DELETE), escribe la **URL** y pulsa **Send** (o `Cmd/Ctrl + Enter`). Mientras la petición viaja, el botón muestra un spinner y queda deshabilitado.

### 2. Pestañas de petición
- **Headers**: añade o elimina cabeceras clave-valor con el botón `+ Agregar header`. Usa el checkbox para habilitarlas/deshabilitarlas sin borrarlas.
- **Params**: define los query parameters de la URL de forma estructurada; se serializan automáticamente al enviar.
- **Body**: editor de texto/JSON para peticiones POST/PUT/PATCH. Valida el JSON en vivo y formatea con un clic.

### 3. Historial (sidebar izquierda)
Cada petición con respuesta (incluidos 4xx/5xx) se guarda automáticamente. Haz clic en una entrada para **recargar** la petición y su respuesta, usa el buscador para filtrar, el botón de la papelera de cada fila para eliminar una entrada y el icono superior para vaciar todo el historial.

### 4. Panel de respuesta
Muestra el **código de estado** con su texto y color según el resultado (2xx verde, 3xx azul, 4xx/5xx rojo), el **tiempo de respuesta** en milisegundos y el **tamaño** del cuerpo. Cambia entre las vistas **Body** (JSON formateado) y **Headers** (cabeceras de respuesta) con los botones superiores.

> **Sobre CORS**: las peticiones se ejecutan a través de Rust (plugin oficial `@tauri-apps/plugin-http`), por lo que **no hay restricciones CORS**: puedes probar cualquier API sin necesidad de que envíe cabeceras CORS.

## Estructura del proyecto

```
nexus-api/
├── src/                  # Frontend (Vue 3 + TypeScript)
│   ├── App.vue           # Layout principal + lógica de red y persistencia
│   ├── main.ts           # Punto de entrada Vue
│   ├── style.css         # Tema global (Tailwind CSS 4)
│   ├── types/index.ts    # Tipos e interfaces (métodos, headers, params, historial)
│   ├── db.ts             # Configuración Dexie.js (NexusDB)
│   ├── components/       # RequestBar, HistorySidebar, KeyValueTable, BodyEditor, ResponsePanel
│   └── utils/            # format.ts (colores/formato) y url.ts (build/parse de query)
├── src-tauri/            # Backend nativo (Rust) y configuración de Tauri
├── index.html
├── package.json
└── vite.config.ts
```

## Licencia

Código abierto bajo la licencia **MIT** (ver [`LICENSE`](./LICENSE)). Eres libre de descargar, modificar y mejorar el proyecto para uso personal, educativo o interno. El nombre **Nexus API**, su logo y su identidad visual son propiedad del autor y no pueden usarse para publicar o vender versiones modificadas sin permiso previo: las versiones derivadas deben indicar que son una modificación del proyecto original.

---

Hecho con Vue, Rust y mucho café. Si te gusta, dale una estrella al repositorio.
