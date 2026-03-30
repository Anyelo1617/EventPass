# 🎟️ Módulo 4 - Event Pass

**Full-Stack App con Next.js App Router & React 19**

Plataforma moderna para el descubrimiento, creación y registro de eventos. Este proyecto aprovecha al máximo los paradigmas más recientes de la web, utilizando **Server Components** para el renderizado inicial rápido y **Server Actions** para la mutación de datos sin necesidad de construir una API REST separada.

Implementa patrones avanzados de UX como actualizaciones optimistas y estado basado en URL.

---

## 💻 Stack Tecnológico

A diferencia del Módulo 3, este proyecto utiliza una arquitectura monolítica moderna (Full-Stack unificado) gracias a Next.js, ejecutando el cliente y el servidor en el mismo entorno.

| Dependencia   | Versión | Propósito |
|--------------|--------|----------|
| Next.js      | 15.x   | Framework React Full-Stack (App Router) |
| React        | 19.x   | Biblioteca UI Core (nuevos hooks como `useOptimistic`) |
| TypeScript   | 5.x    | Tipado estático para código robusto |
| Tailwind CSS | 4.x    | Framework de estilos utilitarios |
| Zod          | 3.x    | Validación de esquemas en el servidor |
| Shadcn UI    | Manual | Componentes UI accesibles |
| Lucide React | 0.x    | Sistema de iconografía |

---

## 🧠 Conceptos Clave Implementados

Este módulo marca la adopción de las últimas características de React y Next.js:

- **React Server Components (RSC):**  
  Componentes renderizados en el servidor (`HomePage`), permitiendo acceso directo a la base de datos sin enviar JavaScript al cliente.

- **Server Actions (`'use server'`):**  
  Funciones seguras que reemplazan endpoints tradicionales, permitiendo mutaciones directas desde componentes del cliente.

- **Optimistic UI (React 19):**  
  Uso de `useOptimistic` y `useTransition` para simular respuestas instantáneas.

- **Estado en URL (URL State):**  
  Manejo de filtros mediante `searchParams`, haciendo las vistas compartibles.

- **Mutaciones y Revalidación:**  
  Uso de `revalidatePath` para mantener la UI sincronizada tras mutaciones.

---

## 🏗️ Arquitectura de la Aplicación

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA NEXT.JS (APP ROUTER)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌─────────────────────┐         ┌─────────────────────┐                  │
│    │    CLIENT (Browser) │         │   SERVER (Next.js)  │                  │
│    │                     │         │                     │                  │
│    │  ┌───────────────┐  │         │  ┌───────────────┐  │                  │
│    │  │ UI Optimista  │  │ HTTP POST  │ Server Action │  │                  │
│    │  │ (useOptimistic│ ├───────────►│ (eventActions) │  │                  │
│    │  └──────┬────────┘  │         │  └───────┬───────┘  │                  │
│    │         │           │         │          │          │                  │
│    │         ▼           │         │          ▼          │                  │
│    │  ┌───────────────┐  │         │  ┌───────────────┐  │                  │
│    │  │ URL State     │◄─┼─────────┤  │ In-Memory DB  │  │                  │
│    │  │ (?category=X) │  │  Render │  │ (events.ts)   │  │                  │
│    │  └───────────────┘  │         │  └───────────────┘  │                  │
│    └─────────────────────┘         └─────────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 20.19+ o 22.12+
- npm 10+

> Nota: La base de datos vive en memoria (RAM). Los datos se reinician al reiniciar el servidor.

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (puerto 3000)
npm run dev
```

---

## 📂 Estructura del Proyecto

```text
module4-event-pass/
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── events/
│   │       ├── page.tsx
│   │       ├── new/
│   │       └── [id]/
│   ├── actions/
│   │   └── eventActions.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── EventCard.tsx
│   │   ├── EventFiltersForm.tsx
│   │   └── RegisterButton.tsx
│   ├── data/
│   │   └── events.ts
│   ├── lib/
│   │   └── utils.ts
│   └── types/
│       └── event.ts
└── README.md
```

---

## 📄 Parte 1: Event Filters con URL State

### Contexto
El usuario necesita filtrar eventos por categoría y estado, manteniendo una experiencia moderna y compartible.

### Implementación Realizada

- **Lectura de Parámetros:**  
  Se utilizan `searchParams` en Server Components para filtrar datos directamente desde el servidor.

- **Mutación de URL:**  
  Se implementó `useRouter().push()` para actualizar la URL sin recargar la página.

- **Persistencia y UI Activa:**  
  Los filtros leen la URL actual para reflejar el estado activo visualmente.

- **Estados Vacíos y Reset:**  
  Se agregó un botón para limpiar filtros y mensajes amigables cuando no hay resultados.

---

## 📄 Parte 2: Optimistic Event Registration

### Contexto
La latencia simulada generaba mala experiencia al registrar usuarios en eventos.

### Implementación Realizada

- **Feedback Instantáneo (`useOptimistic`):**  
  La UI descuenta plazas disponibles inmediatamente al hacer clic.

- **Gestión de Transiciones (`useTransition`):**  
  El botón muestra estado de carga y desactiva interacción.

- **Rollback Automático:**  
  Si falla la operación, React revierte automáticamente el estado optimista.

- **Protección de Lógica de Negocio:**  
  Cuando no hay plazas disponibles, se bloquea la acción y se muestra "Evento Agotado".
