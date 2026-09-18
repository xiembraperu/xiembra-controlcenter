# AUDITORÍA TÉCNICA — XIEMBRA CONTROL CENTER V1

**Fecha de Auditoría:** 17 de Septiembre de 2026  
**Documento Auditado:** `C:\Users\Usuario\Documents\Xiembra\01_Web_y_Plataforma\control-center.html`  
**Entorno de Ejecución:** Navegador Web (HTML5 / ES6 / Tailwind CDN / Lucide CDN)  
**Propósito:** Evaluar la arquitectura actual, dependencias, datos, riesgos y viabilidad de integración antes de avanzar a la fase de API, despliegue y conexión con JARVIS.

---

## 1. RESUMEN EJECUTIVO

El portal **XIEMBRA CONTROL CENTER V1** es una aplicación web interactiva autónoma (*Single Page Application* en un solo archivo) diseñada para dar soporte operativo y comercial a **Karla** (asistente de operaciones) y **Roger** (dirección). 

### Diagnóstico General:
* **Interfaz y Experiencia de Usuario (UX):** 🟢 **Excelente.** Estética limpia basada en la paleta corporativa oficial de Xiembra, tipografías modernas (*Outfit* y *Plus Jakarta Sans*), uso estricto de los logos oficiales y una clara separación entre las metas inmediatas (*Ready to Sell*) y las de volumen industrial (*Ready to Scale*).
* **Operatividad para Karla:** 🟢 **Completamente funcional y amigable.** Permite filtrar tareas, marcar avances con modal de confirmación, abrir chats directos de WhatsApp con 25 clientes B2B, calcular facturación y generar mensajes de cobranza sin tocar código ni Markdown.
* **Persistencia:** 🟡 **Local a nivel de navegador (`localStorage`).** Las modificaciones persisten mientras no se limpie el caché del navegador, pero no se sincronizan entre diferentes dispositivos (la sesión de Karla no ve los cambios de Roger en tiempo real).
* **Integración con Obsidian:** 🟡 **Desacoplada por diseño.** Los datos iniciales provienen de una extracción estática de los archivos atómicos del Vault (`Tareas/*.md` y `Clientes B2B/*.md`), pero los cambios web no escriben de vuelta en el disco local ni en el Vault de Obsidian.
* **Control de Versiones (Git):** 🔴 **Alerta importante.** La carpeta `01_Web_y_Plataforma` se encuentra fuera del repositorio Git `xiembraperu/Controlinterno` (el cual cubre exclusivamente `Xiembra Vault`). El código web no tiene actualmente control de versiones en GitHub.

---

## 2. ARQUITECTURA ACTUAL

```
[ Navegador Web (Karla / Roger) ]
   │
   ├── DOM / HTML5 (control-center.html - 167 KB)
   │     ├── Tailwind CSS (CDN Runtime)
   │     ├── Lucide Icons (CDN Runtime)
   │     └── Fuentes Web (Google Fonts: Outfit & Plus Jakarta Sans)
   │
   ├── Control de Estado (JavaScript en memoria)
   │     ├── INITIAL_DATA (Copia estática embebida: 24 tareas, 25 clientes)
   │     └── appData { tasks, clients }
   │
   └── Persistencia Local
         └── localStorage['xiembra_control_center_v1']
               └── Descarga manual: xiembra_data_backup_YYYY-MM-DD.json
```

La aplicación es **100% cliente (*client-side only*)**. No cuenta aún con backend, microservicio ni base de datos centralizada.

---

## 3. INVENTARIO DE ARCHIVOS (`01_Web_y_Plataforma`)

| Archivo / Carpeta | Tamaño | Rol / Propósito |
| :--- | :---: | :--- |
| **`control-center.html`** | 167 KB | **Aplicación principal auditada.** Contiene toda la lógica visual, navegación de 11 vistas, modales, controladores JS y datos iniciales. |
| **`index.html`** | 6.4 MB | **Página web comercial oficial (Landing Page D2C).** Presentación del producto al consumidor final, historia del origen y catálogo. |
| **`dist/index.html`** | 6.4 MB | Versión standalone distribuible generada por `build_standalone.ps1`. |
| **`template_clean.html`** | 86 KB | Plantilla base HTML para la generación del sitio web principal. |
| **`build_standalone.ps1`** | 2.3 KB | Script en PowerShell para compilar y empaquetar imágenes base64 en `index.html`. |
| **`vercel.json`** | 696 B | Configuración de despliegue en Vercel con reglas de caché para fuentes e imágenes. |
| **`package.json`** / `package-lock.json` | 624 B / 40 KB | Manifiesto de dependencias Node (`docx`, `exceljs`) utilizado para scripts auxiliares de exportación. |
| **`catalogo_de_activos.json`** / `.md` | 19 KB / 13 KB | Inventario formal de imágenes de empaques, tablas nutricionales y especificaciones. |
| **`contexto.md`** / **`design.md`** | 4 KB / 15 KB | Especificaciones de diseño corporativo, tokens de color y lineamientos de marca. |
| **`images/`** | Directorio | Contiene los activos gráficos corporativos oficiales (logos, pacarana, productos). |
| **`fonts/`** | Directorio | Tipografías corporativas locales (*Forrest*, *Sequel Sans*, *UT-Marmalade*). |
| **`node_modules/`** | Directorio | Dependencias locales de compilación documental. |

---

## 4. AUDITORÍA DE FUNCIONALIDADES

| Módulo / Funcionalidad | Nivel | Comportamiento Técnico Actual |
| :--- | :---: | :--- |
| **1. Dashboard (Inicio)** | 🟢 Funcional | Cálculo dinámico en tiempo real de métricas: % Ready to Sell, ratio de avance, conteo de bloqueos, semáforo de estado (🔴/🟡/🟢), % Ready to Scale, total de prospectos y clientes contactados. |
| **2. Selector Karla / Roger** | 🟢 Funcional | Conmuta la identidad activa, avatar, rol institucional y re-filtra la sección "🎯 HOY" en pantalla. |
| **3. Módulo 🎯 HOY** | 🟢 Funcional | Filtra tareas activas ordenadas por criticidad. Checkbox interactivo conectado al modal de confirmación (*¿Estás segura de marcar esta tarea como completada?*). |
| **4. Módulo ⚠️ BLOQUEOS** | 🟢 Funcional | Exclusivo para tareas con `bloqueado: true` en Ready to Sell. Muestra motivo, responsable, dependencia y abre modal de edición al hacer clic. |
| **5. Gestión de Tareas** | 🟢 Funcional | Vista dual: **Kanban** (Pendiente, En Progreso, Esperando, Terminado) y **Tabla interactiva** con filtros por responsable, fase y estado. Permite editar y crear tareas. |
| **6. Directorio Clientes B2B** | 🟢 Funcional | Directorio de 25 cuentas con buscador por texto, filtro por canal comercial y drawer modal para actualizar datos y lanzar chat directo de WhatsApp. |
| **7. Pipeline Comercial** | 🟢 Funcional | Embudo dinámico de 6 fases agrupando clientes y mostrando el conteo por etapa. |
| **8. Inventario** | 🟡 Parcial | Permite modificar cantidades desde la interfaz con botones `+` / `-` y mediante modal `Actualizar Stock`. **Limitación:** Modifica el DOM directamente, no está integrado dentro del objeto `appData`, por lo que no se persiste en `localStorage`. |
| **9. Ventas y Facturación** | 🟡 Parcial | Calculadora live de pedidos (20g y 100g) que desglosa Base Imponible e IGV (18%) y copia al portapapeles el texto exacto con datos bancarios BCP para WhatsApp. **Limitación:** El botón "Registrar Venta" actualiza la cifra superior, pero no guarda un historial de órdenes en un array persistente. |
| **10. Finanzas y Costos** | 🔴 Mock / Visual | Tarjetas estáticas con márgenes brutos (64.3%), costo unitario (S/ 1.72) y estructura de maquila Chanchamayo / Multipack. |
| **11. Calendario** | 🔴 Mock / Visual | Listado visual fijo de visitas comerciales programadas para Septiembre 2026. |
| **12. Reportes** | 🔴 Mock / Visual | Tablas estáticas de auditoría de lanzamiento y métricas de escala. |
| **13. Consola JARVIS 24/7** | 🟡 Parcial | Indicadores visuales de telemetría (Oracle Cloud VPS, modelo Gemini Flash, estado Online). Botones de acción rápida muestran mensajes orientativos. |
| **14. Configuración** | 🟢 Funcional | Visualización de datos fiscales (RUC 20616165365), botón de exportación de backup JSON y botón de reseteo a datos originales. |
| **15. Exportación de Backup** | 🟢 Funcional | Genera un archivo descargable `xiembra_data_backup_YYYY-MM-DD.json` con el estado completo de `appData`. |
| **16. Persistencia LocalStorage** | 🟢 Funcional | Guarda y recupera automáticamente los cambios en la clave `xiembra_control_center_v1`. |

---

## 5. ORIGEN Y FLUJO DE DATOS

| Dato / Entidad | Ubicación Actual | Tipo de Gestión |
| :--- | :--- | :--- |
| **Tareas (24 registros)** | Embebido en `const INITIAL_DATA.tasks` | Dinámico en memoria, sincronizado con `localStorage`. |
| **Clientes (25 registros)** | Embebido en `const INITIAL_DATA.clients` | Dinámico en memoria, sincronizado con `localStorage`. |
| **Inventario de Productos** | Hardcodeado en el marcado HTML | Manipulación directa del DOM (volátil). |
| **Ventas Acumuladas** | Hardcodeado en elemento `#stat-ventas-monto` | Manipulación directa del DOM (volátil). |
| **Estructura de Costos** | Hardcodeado en el marcado HTML de Finanzas | Estático. |
| **Citas de Calendario** | Hardcodeado en el marcado HTML de Calendario | Estático. |
| **Datos Fiscales / BCP** | Hardcodeado en funciones JS y vistas HTML | Constantes corporativas. |

---

## 6. AUDITORÍA DE LOCALSTORAGE

* **Clave Utilizada:** `xiembra_control_center_v1`
* **Estructura JSON almacenada:**
  ```json
  {
    "tasks": [
      {
        "id": "TAR-001",
        "titulo": "...",
        "fase": "ready_to_sell | ready_to_scale",
        "area": "comercial | operaciones | finanzas | marketing",
        "estado": "pendiente | en_progreso | esperando | terminado",
        "prioridad": "critica | alta | media | baja",
        "responsable": "Roger | Karla | Ambos",
        "fecha_limite": "YYYY-MM-DD",
        "bloqueado": true,
        "motivo_bloqueo": "...",
        "dependencia": "...",
        "critica_lanzamiento": true
      }
    ],
    "clients": [
      {
        "id_cliente": "CLI-001",
        "empresa": "...",
        "contacto": "...",
        "canal": "Biomarket | Cafetería | ...",
        "etapa": "prospeccion | contactado | visita_agendada | muestra_entregada | en_negociacion | cerrado",
        "responsable": "Karla | Roger",
        "ultimo_contacto": "YYYY-MM-DD",
        "proximo_contacto": "YYYY-MM-DD",
        "potencial": "alto | medio | bajo",
        "notas": "..."
      }
    ]
  }
  ```
* **Operaciones de Lectura:** Se ejecuta en `loadData()` durante el evento `DOMContentLoaded`. Si la clave existe, sobreescribe `INITIAL_DATA`.
* **Operaciones de Escritura:** Se ejecuta mediante `persistData()` al:
  1. Confirmar una tarea completada (`executeConfirmComplete`).
  2. Guardar cambios en una tarea (`saveTaskEdits`).
  3. Crear una nueva tarea (`saveNewTask`).
  4. Eliminar una tarea (`deleteCurrentTask`).
  5. Guardar cambios en un cliente (`saveClientEdits`).
  6. Crear un nuevo cliente (`saveNewClient`).
  7. Registrar seguimiento comercial (`confirmSeguimiento`).
* **Operaciones de Borrado:** `resetToInitialData()` invoca `localStorage.removeItem(...)` previa confirmación del usuario.
* **Evaluación de Riesgo de Pérdida de Información:**
  - ⚠️ **Alto riesgo de desincronización:** Si Karla actualiza desde su teléfono o laptop, los cambios no viajan a la laptop de Roger.
  - ⚠️ **Vulnerabilidad a limpieza de historial:** Si el usuario limpia cookies/caché o utiliza modo incógnito, los cambios se pierden y vuelve al estado inicial de `INITIAL_DATA`.
  - 🛡️ **Mitigación actual:** La función `exportAllData()` permite generar un backup `.json` descargable en cualquier momento.

---

## 7. RELACIÓN CON OBSIDIAN

* **¿El portal lee Markdown en vivo?** **NO.** Los navegadores web no tienen permisos para leer el disco duro local de forma arbitraria sin un servidor o API intermedia.
* **¿El portal escribe archivos Markdown en el Vault?** **NO.** Los cambios que realiza Karla en la web no actualizan los archivos `.md` en `Tareas/` ni `Clientes B2B/`.
* **Mecanismo de carga actual:** El portal contiene una instantánea congelada (`INITIAL_DATA`) obtenida directamente del YAML de los archivos atómicos de Obsidian al momento de su construcción.
* **Relación con documentos clave:**
  - `Tareas/*.md`: 24 archivos atómicos que sirvieron como fuente de verdad original.
  - `Clientes B2B/*.md`: 25 fichas de prospectos que sirvieron como fuente de verdad original.
  - `Dashboard de Lanzamiento.md`: Incluye un enlace y referencia explicativa que invita a usar `control-center.html`.
  - `Control de Tareas y Pendientes.md`: Documento maestro de seguimiento interno.

---

## 8. RECURSOS OFICIALES Y RUTAS

Se verificó exhaustivamente la disponibilidad física y la resolución de rutas de los recursos corporativos:
* `images/xiembra_logo_compacto_verde_nature.png` (122 KB) ➔ **Existe y carga perfectamente** en la barra lateral oscura y favicon.
* `images/xiembra_logo_compacto_verde_campo.png` (255 KB) ➔ **Existe y carga perfectamente** en modales de fondo blanco.
* `images/xiembra_mascota_pacarana_transparente.png` (625 KB) ➔ **Existe y carga perfectamente** en el widget de saludo y estado.
* `images/xiembra_producto_bolsita_20g.jpg` / `caja_100g_pacarana.jpg` ➔ **Existen y cargan correctamente.**

> **Conclusión de Rutas:** Debido a que `control-center.html` se ubica exactamente en `01_Web_y_Plataforma/` y las imágenes en `01_Web_y_Plataforma/images/`, las rutas relativas `images/...` funcionan al 100% tanto en local como al desplegarse en la web.

---

## 9. DIAGNÓSTICO GIT / GITHUB

| Aspecto | Estado Verificado | Detalle |
| :--- | :--- | :--- |
| **Root del repositorio Git** | `C:\Users\Usuario\Documents\Xiembra Vault` | El repositorio local está configurado **exclusivamente** sobre la carpeta del Vault de Obsidian. |
| **Rama actual** | `main` | Rama productiva. |
| **Remote Origin** | `https://github.com/xiembraperu/Controlinterno.git` | Repositorio de la organización Xiembra. |
| **Último Commit** | `616badd` | *"fix(vault): UTF-8 encoding corrections and web control center link"*. |
| **¿Está el portal web en Git?** | 🔴 **NO** | `control-center.html` se encuentra en `C:\Users\Usuario\Documents\Xiembra\01_Web_y_Plataforma\`, carpeta que **no es repositorio Git**. |
| **¿Están las imágenes en Git?** | 🔴 **NO** | Las imágenes oficiales están en `01_Web_y_Plataforma/images` y no forman parte del repositorio `Controlinterno`. |
| **Sincronización remota** | 🟡 Local commit listo | El commit `616badd` está registrado localmente en el Vault, pendiente de sincronización con el remote. |

---

## 10. EVALUACIÓN PARA DESPLIEGUE EN VERCEL

### ¿Puede desplegarse directamente?
**SÍ, de forma inmediata como sitio estático.**
`01_Web_y_Plataforma` ya cuenta con un archivo `vercel.json` válido con reglas de enrutamiento y cabeceras de caché para `/images/` y `/fonts/`.

### Estructura y consideraciones de despliegue:
1. **Ruta de acceso:** Al desplegarse la carpeta `01_Web_y_Plataforma`, `index.html` (landing page pública) será la raíz (`/`), y el centro de control estará disponible en `/control-center` o `/control-center.html`.
2. **Dependencias:** El archivo `package.json` actual declara dependencias auxiliares (`docx`, `exceljs`) sin script de build. En Vercel se debe configurar como **"Other / Static HTML"** para evitar errores de compilación innecesarios.
3. **Evolución Tecnológica recomendada:**
   - **Etapa actual (V1):** Mantener como HTML/CSS/JS estático. Ventajas: Cero tiempo de compilación, simplicidad total y despliegue en segundos.
   - **Etapa posterior (V2):** Migrar a Next.js / React cuando se requiera autenticación multiusuario (roles estrictos Karla vs. Roger con contraseñas) y conexión directa a base de datos PostgreSQL / Supabase.

---

## 11. PREPARACIÓN PARA ARQUITECTURA DE API

Para que el portal deje de depender de `localStorage` y pueda sincronizar en tiempo real entre Karla, Roger y JARVIS, se requerirán los siguientes endpoints conceptuales:

### Tareas (`/api/tasks`)
* `GET /api/tasks`: Obtener listado con filtros (`?fase=ready_to_sell&responsable=Karla&estado=activa`).
* `POST /api/tasks`: Crear una nueva tarea atómica.
* `PUT /api/tasks/:id`: Actualizar estado (ej. cambiar a `terminado`), fechas o bloqueos.
* `DELETE /api/tasks/:id`: Archivar tarea.

### Clientes y Pipeline (`/api/clients`, `/api/pipeline`)
* `GET /api/clients`: Directorio completo de prospectos con paginación y búsqueda.
* `POST /api/clients`: Registrar nuevo cliente B2B.
* `PUT /api/clients/:id`: Actualizar etapa comercial, registrar fecha de seguimiento o notas de contacto.
* `GET /api/pipeline/summary`: Resumen cuantitativo por cada etapa del embudo comercial.

### Inventario y Ventas (`/api/inventory`, `/api/sales`)
* `GET /api/inventory`: Existencias en tiempo real de café terminado, empaques y merchandising.
* `POST /api/inventory/adjust`: Registrar entradas de lote o salidas por muestras/degustación.
* `POST /api/sales`: Registrar pedido comercial confirmado (cliente, ítems, desglose de IGV y total).
* `GET /api/sales`: Historial de ventas piloto registradas.

### Tablero General (`/api/dashboard`)
* `GET /api/dashboard/stats`: Retornar en un solo payload el estado de Ready to Sell, bloqueos críticos, tareas urgentes de hoy y métricas de prospección.

---

## 12. PREPARACIÓN PARA INTEGRACIÓN CON JARVIS

JARVIS (operando en el VPS de Oracle Cloud con Gemini y canal WhatsApp) podrá interactuar directamente con este sistema una vez expuesta la API o sincronizado el repositorio:

### Casos de Uso Operativos de JARVIS:
1. **Despacho del Briefing Diario (10:00 AM vía WhatsApp):**
   - JARVIS consulta las tareas pendientes de HOY para Karla y Roger y las envía en un mensaje matutino consolidado.
2. **Actualización de Tareas por Voz/Chat:**
   - Karla envía: *"Jarvis, marca como completada la preparación de muestras para Organa"*.
   - JARVIS actualiza el estado y el dashboard lo refleja inmediatamente.
3. **Gestión de Visitas en Terreno:**
   - Roger o Karla desde campo: *"Jarvis, acabamos de dejar 3 muestras en Fresh2go Miraflores; coordinar llamada el viernes"*.
   - JARVIS mueve a Fresh2go a `muestra_entregada` y agenda la fecha de contacto.
4. **Asistente de Facturación Inmediata:**
   - Karla solicita: *"Jarvis, factura para La Sanahoria por 50 bolsitas de 20g"*.
   - JARVIS valida stock, calcula montos y responde con el mensaje formateado de cobro y datos bancarios.
5. **Alerta Temprana de Bloqueos:**
   - Si una tarea de Ready to Sell se marca con `bloqueado: true`, JARVIS envía una alerta prioritaria a Roger por WhatsApp para coordinar el desbloqueo.

---

## 13. RIESGOS TÉCNICOS IDENTIFICADOS

1. **Aislamiento Multiusuario:**
   - Si Karla trabaja desde su teléfono o navegador y Roger desde el suyo, no comparten datos porque `localStorage` vive aislado en cada navegador.
2. **Falta de Versionado del Código Web:**
   - `01_Web_y_Plataforma` no está bajo Git. Si se produce un fallo o sobreescritura accidental, no hay historial de recuperación en GitHub para el código web.
3. **Divergencia entre Obsidian y la Web:**
   - Si se editan tareas en Obsidian, el portal no se entera; si se completan tareas en el portal, los archivos Markdown de Obsidian no cambian.
4. **Volatilidad de Inventario y Ventas:**
   - El módulo de inventario y ventas no persiste en `appData`, perdiendo sus cambios al recargar la página.

---

## SIGUIENTE PASO RECOMENDADO

> [!IMPORTANT]
> **Acción Inmediata Sugerida (NO EJECUTADA):**
> 1. **Control de Versiones del Código Web:** Inicializar un repositorio Git en `C:\Users\Usuario\Documents\Xiembra` o crear el repositorio remoto `xiembra-web` en la organización `xiembraperu` de GitHub para asegurar y versionar `control-center.html`, la landing page y todos los recursos de diseño.
> 2. **Persistencia Unificada de Inventario:** Modificar levemente el script de `control-center.html` para que los números de stock de inventario también vivan dentro de `appData` y no se pierdan al refrescar la pantalla.
> 3. **Prueba de Despliegue Estático en Vercel:** Conectar el repositorio web a Vercel para proporcionar una URL privada segura (ej. `https://control.xiembra.pe` o similar) que permita a Karla y Roger acceder desde sus teléfonos móviles sin depender de archivos locales.
