# XIEMBRA CONTROL CENTER

Portal Operativo y Centro de Control de Mando para la gestión comercial, inventario, ventas y proyecciones de **Xiembra**.

---

## 1. ARQUITECTURA OFICIAL DE REPOSITORIOS DE XIEMBRA

El ecosistema de software y conocimiento de Xiembra se divide en 3 repositorios oficiales independientes y desacoplados:

1. **`xiembraperu/Controlinterno`**
   * **Responsabilidad:** Operación Central, Obsidian Vault corporativo, base de datos de conocimiento y automatizaciones de JARVIS.
   * **Acceso:** Confidencial / Operaciones.

2. **`xiembraperu/xiembra-web`**
   * **Responsabilidad:** Landing page comercial pública para clientes finales (`index.html`), catálogo de productos, identidad visual pública y canal de ventas WhatsApp.
   * **Acceso:** Público / Clientes.

3. **`xiembraperu/xiembra-controlcenter`** (este repositorio)
   * **Responsabilidad:** Dashboard operativo SPA (`control-center.html`) para gestión de tareas, CRM B2B de clientes, control de inventario de lotes y materias primas, registro y cálculo de ventas, y proyecciones de rentabilidad.
   * **Acceso:** Privado / Interno de gestión.

---

## 2. ARQUITECTURA TÉCNICA DEL CONTROL CENTER

* **Archivo Principal:** `control-center.html`
* **Naturaleza:** Single Page Application (SPA) modular construida con vanilla JavaScript y Tailwind CSS.
* **Persistencia:** Local mediante `localStorage` con fallback estructurado en el esquema reactivo `appData`.
  * **Inventario:** Persistencia en tiempo real de lotes terminados (cajas 100g, bolsas 20g, café 100g) y materias primas (cacao nativo, granos de café verde).
  * **Ventas:** Registro persistente de cotizaciones/ventas con cálculo automático de totales, impuestos, generación de mensajes para WhatsApp y persistencia en historial local.
* **Despliegue:** Preparado para Vercel mediante reglas en `vercel.json` que enrutan la raíz `/` y `/control-center` a `control-center.html`.

---

## 3. EJECUCIÓN LOCAL

Para visualizar y trabajar en el Control Center de forma local:

1. Abrir `control-center.html` directamente en cualquier navegador web moderno (Edge, Chrome, Firefox, Safari).
2. O iniciar un servidor HTTP estático local:
   ```bash
   npx serve .
   # O con Python:
   python -m http.server 3000
   ```
3. Navegar a `http://localhost:3000/`.

---

## 4. DESPLIEGUE EN VERCEL

* **Configuración del proyecto:**
  * **Framework Preset:** Other
  * **Root Directory:** `./`
  * **Build Command:** Ninguno (aplicación estática autónoma)
  * **Output Directory:** `./`
* El archivo `vercel.json` se encarga de servir automáticamente `control-center.html` sin necesidad de extensiones en la URL.
