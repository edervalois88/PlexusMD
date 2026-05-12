# Spec: High-Fidelity 5-Stage Scrollytelling Agenda

**Fecha:** 2026-05-11
**Proyecto:** PlexusMD Elite
**Estado:** Design Approved

## 1. Objetivo
Rediseñar la sección de "Agenda Autónoma" para narrar el proceso clínico completo en 5 etapas interactivas, eliminando el empalme de textos y utilizando atmósferas dinámicas (cambios de fondo) para una experiencia "Ultra-Smooth".

## 2. Estructura Narrativa (Los 5 Momentos)

| Etapa | Rango Scroll | Visual Principal | Acción de IA / Automatización | Fondo |
| :--- | :--- | :--- | :--- | :--- |
| **1. Agendado WA** | 0% - 20% | Chat de WhatsApp | Chatbot responde con horarios disponibles. | `bg-white` |
| **2. Pago Seguro** | 20% - 40% | Link de Pago / Card | Autorización instantánea (efecto pulso/escudo). | `bg-slate-50` |
| **3. Sincronización** | 40% - 60% | Dashboard Agenda | La cita aparece sola en el calendario del doctor. | `bg-teal-50` |
| **4. Confirmación** | 60% - 80% | WhatsApp (Checks) | Mensaje final de éxito con doble check azul. | `bg-blue-50` |
| **5. Side Doctor** | 80% - 100% | Dashboard EMR | Análisis proactivo antes de iniciar consulta. | `bg-slate-900` |

## 3. Lógica de Animación (Framer Motion)

### 3.1 Gestión de Textos (Evitar Empalme)
Cada bloque de texto utilizará una transformación de opacidad y posición `y` con rangos de "seguridad" para asegurar que no se solapen:
- **Salida:** `[start, center - 0.05, center]` -> `[0, 1, 1]`
- **Entrada:** `[center, center + 0.05, end]` -> `[1, 1, 0]`
*(Ejemplo: El texto 1 desaparece totalmente al 18% antes de que el texto 2 sea legible al 22%)*.

### 3.2 Efecto "Push" de Tarjetas
Las tarjetas visuales mantendrán el efecto de empuje vertical:
- Entran desde `y: 100%` y salen hacia `y: -100%`.
- Sincronizadas con los mismos rangos del 20% del contenedor de `500vh`.

### 3.3 Micro-animaciones de Proceso
- **Chatbot:** Burbujas con `staggerChildren` para simular flujo de conversación.
- **Pago:** Icono de candado/escudo con escala elástica.
- **Calendario:** Celda que cambia de color y expande un "glare" teal.
- **Side Doctor:** Scanlines horizontales sobre el historial clínico.

## 4. Especificaciones Técnicas
- **Contenedor:** `lg:h-[500vh]`.
- **Background Color:** `useTransform(progress, [0, 0.2, 0.4, 0.6, 0.8], ["#ffffff", "#f8fafc", "#f0fdfa", "#eff6ff", "#0f172a"])`.
- **Texto:** El color del texto de los títulos cambiará de `slate-900` a `white` al entrar en la etapa 5 (Fondo oscuro).

## 5. Plan de Validación
- **Transición de Color:** Verificar que el cambio de fondo sea suave (`ease: "easeInOut"`).
- **Lectura:** Asegurar que el texto sea siempre legible contra el fondo actual.
- **Performance:** Monitorear el frame rate durante el cambio de color de fondo en containers grandes.
