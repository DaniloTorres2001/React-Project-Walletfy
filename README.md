# 💰 Walletfy + 🤖 Walletfy AI (WebLLM)

**Walletfy** es una aplicación web construida con **React + Vite + TanStack Router** para llevar el control de tus finanzas personales (ingresos/egresos), y ahora incluye **Walletfy AI**, un asistente local impulsado por **WebLLM** que analiza tus datos **en el navegador** (sin enviar información a servidores externos).

> Ideal para fines académicos, pruebas técnicas o proyectos personales de finanzas.
>
> 🔐 **Privacidad**: Todo el análisis del asistente ocurre *on‑device* vía WebGPU (si está disponible).

---
## 🔗 Demo en producción
**URL:** https://react-project-walletfy.pages.dev/events

## 1) 🧠 Descripción

Walletfy permite:

- Establecer un **balance inicial**.
- Registrar **eventos** de tipo **ingreso** o **egreso** con:
  - `nombre`, `descripcion`, `cantidad`, `fecha`, `adjunto (opcional)`
- Visualizar eventos **agrupados por mes** con:
  - Totales de **ingresos** y **egresos**
  - **Balance mensual** = ingresos − egresos
  - **Balance global acumulado** (*montoGlobal*)

### 🔧 Arquitectura general

- Ruteo con **TanStack Router** (`/routes`).
- Tema (claro/oscuro) con **Redux Toolkit**.
- Datos en **LocalStorage** mediante `DataRepo` (`/api/datasource`).
- Balance inicial y eventos **persistentes** entre sesiones.
- Búsqueda por **mes/año** con **debounce**.
- Lógica de agrupación en `lib/event.utils.ts`.
- Asistente **Walletfy AI** en `components/asistenteLLM.tsx`.

---

## 2) 🤖 Walletfy AI (WebLLM)

Asistente local que responde preguntas como:

- “¿En qué meses gasté más y menos?”
- “¿Cuál fue mi mejor y peor mes?”
- “¿Cómo cambió mi **montoGlobal** (acumulado)?”
- “¿Cuál fue el evento con mayor gasto/ingreso y en qué mes?”
- Recomendaciones para mejorar tus finanzas.

### 🧩 Cómo lee tus datos

Antes de cada consulta, Walletfy AI construye un **JSON de contexto** con definiciones claras:

- **índice de mes (`YYYY-MM`)**
- **ingresos**: suma de montos con `tipo = "ingreso"` por mes
- **egresos**: suma de montos con `tipo = "egreso"` por mes
- **balance**: `ingresos − egresos` del mes
- **montoGlobal**: `balance del mes + suma de balances previos`
- **todos_los_eventos**: lista (mes, nombre, cantidad, tipo, fecha) para análisis fino
- **topEventos**: eventos más altos de egresos/ingresos
- **resumen**: máximos/mínimos por mes

> Reglas clave incluidas en el *system prompt*:
> 1) “**mayores gastos**” = mes con mayor **egresos** (no el peor balance).  
> 2) “**mejor mes**” = mayor **balance**; “peor mes” = menor **balance**.  
> 3) Para acumulados, usa **montoGlobal**.  
> 4) Si piden el **evento con mayor gasto/ingreso**, usa el de mayor `cantidad`.  
> 5) Cita siempre mes `YYYY-MM` y cifras exactas.  
> 6) Si un dato no existe, dilo sin inventar.

### 🧪 Ventana de contexto y compactación automática

- El asistente envía **todos los meses y eventos** por defecto.
- Si se alcanza el límite del modelo (**ContextWindowSizeExceededError**), se activa la **reducción automática**:
  1. Quita `todos_los_eventos` del contexto.
  2. Reduce `topEventos` a 5.
  3. Limita a los **últimos 12 meses**.
- Esto permite seguir respondiendo sin perder lo esencial.

### 🎛️ Parámetros de inferencia

- `temperature` (por defecto `0.3`) – respuestas más determinísticas para finanzas.
- `top_p` (por defecto `0.85`).
- `max_tokens` fijo en `600` para evitar desbordes.

### ⌨️ Atajos & UI

- **Ctrl + Enter**: enviar mensaje.
- **Limpiar**: borra la conversación (y LocalStorage del chat).

---

## 3) 🛠️ Ejecución local

### Requisitos

- Node.js ≥ 16
- npm o pnpm
- Navegador con **WebGPU** (Chrome/Edge recientes).

> En Windows con GPU integrada/discreta, mantén los drivers al día.

### Pasos

```bash
git clone https://github.com/DaniloTorres2001/React-Project-Walletfy.git
cd React-Project-Walletfy
npm install
npm run dev
```

Abrir la URL local que muestre Vite (p. ej., `http://localhost:5173`).

### Build

```bash
npm run build
```

---

## 4) 🚀 Despliegue recomendado

**Cloudflare Pages** funciona muy bien con Vite.

**Build command:**

```bash
npm run build
```

**Output directory:** la carpeta que configure Vite (por defecto `dist`).

---

## 5) ✅ Requisitos funcionales cubiertos

- ✔️ Agregar, editar y guardar eventos (con validación **Zod**)  
- ✔️ Persistencia en **LocalStorage**  
- ✔️ Mostrar balance inicial y cálculos acumulados  
- ✔️ Agrupar eventos por mes  
- ✔️ Buscar por mes y año (**debounce**)  
- ✔️ Adjuntar imágenes **base64** por evento  
- ✔️ Soporte **dark/light mode** persistente  
- ✔️ Carga automática de datos por defecto  
- ✔️ **Walletfy AI (WebLLM)**: análisis local de ingresos, egresos, balance, montoGlobal, top eventos y comparativas.

---

## 6) 📁 Estructura del proyecto (resumen)

```
/src
  /api
    datasource.ts         # DataRepo (LocalStorage)
  /components
  /lib
    asistenteLLM.tsx      # Walletfy AI (WebLLM)
    event.utils.ts        # utilidades de agrupación/fechas
  /routes                 # vistas con TanStack Router
  /types
    event.ts              # Zod schema + tipos
```

---

## 7) 🧰 Desarrollo del asistente (detalles técnicos)

### Modelo

Se usa **Qwen2.5-1.5B-Instruct-q4f16_1-MLC** por balance entre calidad y consumo.
Si tu GPU es limitada o ves errores de dispositivo, considera una variante más pequeña.

### Construcción del contexto

`buildFinancialContext(eventos)`:
- Ordena por fecha, agrega por mes, calcula `ingresos`, `egresos`, `balance`, `montoGlobal`.
- Incluye `todos_los_eventos` (mes, nombre, cantidad, tipo, fecha).
- Deriva **máximos** y **top eventos**.
- **Token budgeting** con *auto‑shrink* cuando es necesario.

### Orden de mensajes

Para evitar `SystemMessageOrderError`, se envía el **system prompt** primero y luego el **historial reciente** (ventana deslizante de `maxTurns`).

### Streaming

Las respuestas del LLM llegan por **stream** y se muestran incrementales.

---

## 8) 🐛 Troubleshooting

### “ContextWindowSizeExceededError”
- Ocurre si el prompt supera la ventana de contexto del modelo.
- La app aplica *auto‑shrink* (ver sección 2).
- También puedes acortar la pregunta o limpiar el chat.

### “Device was lost / DXGI_ERROR_DEVICE_HUNG (D3D12)”
- Reduce el uso de memoria:
  - Cierra pestañas/Apps que usen GPU.
  - Actualiza drivers y navegador.
  - Evita tener muchas pestañas con WebGPU abiertas.

### “ModelNotFoundError”
- Asegúrate de usar un **model_id** válido de WebLLM prebuilds.
- Verifica tu conexión la **primera** vez (descarga de pesos).

---

## 9) 🔐 Privacidad

- Todos los datos permanecen en **tu navegador** (LocalStorage).
- El asistente procesa el JSON **localmente** con WebGPU.
- No hay envío a servidores externos.

---

## 10) 📝 Últimos cambios 

- ✅ Integración **WebLLM** con **streaming** y manejo de errores robusto.
- ✅ **System prompt** con definiciones y reglas de interpretación (ingresos, egresos, balance, montoGlobal).
- ✅ **Context builder** que ahora incluye **todos los eventos** por defecto y **auto‑shrink** cuando se excede la ventana.
- ✅ Ventana deslizante del chat para mantener el **system** primero y no romper el orden.
- ✅ Parámetros de inferencia configurables (`temperature`, `top_p`).
- ✅ UI mejorada: estado de carga, progreso, sugerencias y limpieza de conversación.
- ✅ Documentación y troubleshooting actualizados.

---

### Créditos
- [WebLLM / ChatBot](https://jsfiddle.net/neetnestor/4nmgvsa2/)
- [WebLLM / MLC AI](https://webllm.mlc.ai/)
- React, Vite, TanStack Router, Redux Toolkit, Zod
