# 💰 Walletfy

**Walletfy** es una aplicación web construida con React + TanStack Router que permite a los usuarios llevar el control de su dinero, registrar ingresos y egresos, y visualizar su balance mensual de forma clara y estética. Ideal para fines académicos, pruebas técnicas o proyectos personales de finanzas.

---

## 1. 🧠 Descripción

Walletfy permite a los usuarios:

- Establecer un **balance inicial**.
- Registrar eventos de tipo **ingreso** o **egreso**, cada uno con:
  - Nombre
  - Descripción
  - Cantidad
  - Fecha
  - Imagen adjunta (opcional)
- Visualizar los eventos agrupados por mes, con:
  - Totales de ingresos y egresos
  - Balance mensual
  - Balance global acumulado

### 🔧 Arquitectura general

- La app está dividida en rutas (`routes/`) con TanStack Router.
- El estado global del tema (modo claro/oscuro) se gestiona con Redux Toolkit.
- Los datos se almacenan localmente con `LocalStorage` mediante `DataRepo` (`api/datasource`).
- El balance inicial y los eventos son persistentes entre sesiones.
- Las búsquedas por mes y año usan `debounce` para optimizar el rendimiento.
- Toda la lógica de agrupación y procesamiento de eventos está separada en `/lib/event.utils.ts` para facilitar su mantenimiento.

---

## 2. 🛠️ Ejecución local

### 🔄 Requisitos previos

- Node.js ≥ 16
- npm o pnpm

### 🔧 Pasos para correr la app

1. Clonar el repositorio:

```bash
git clone https://github.com/DaniloTorres2001/walletfy.git
cd walletfy
npm install
npm run dev
```

## 3. Despliegue recomendado
Puedes desplegar Walletfy fácilmente en plataformas como:

Cloudflare Pages

## Configuración sugerida para Vite:

Build command

npm run build

## ✅ Requisitos funcionales cubiertos
✔️ Agregar, editar y guardar eventos

✔️ Validación con Zod (campos requeridos, tipos)

✔️ Persistencia en LocalStorage

✔️ Mostrar balance inicial y cálculos acumulados

✔️ Agrupar eventos por mes

✔️ Buscar por mes y año (con debounce)

✔️ Adjuntar imágenes base64 por evento

✔️ Soporte dark/light mode persistente

✔️ Carga automática de datos por defecto
