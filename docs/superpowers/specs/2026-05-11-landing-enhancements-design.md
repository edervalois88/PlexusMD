# Spec: Landing Page Enhancements - Tarea 28 (IA, Agenda & Smooth Benefits)

**Fecha:** 2026-05-11
**Proyecto:** PlexusMD Elite
**Estado:** Design Approved

## 1. Objetivo
Enriquecer la página de aterrizaje (`AnimatedLanding.tsx`) con módulos visualmente impactantes que demuestren las capacidades de IA ("Side Doctor") y automatización de la agenda, manteniendo un estándar de diseño "Ultra-Smooth" y garantizando el cumplimiento legal visible.

## 2. Componentes a Implementar

### 2.1 Módulo "Side Doctor" (Validación Clínica Inteligente)
- **Visual:** Card estilo receta médica (blanca, bordes redondeados, sombras suaves).
- **Animaciones (Framer Motion):**
    - **Láser de Escaneo:** Una línea horizontal `teal-400` que se desplaza verticalmente en loop infinito sobre la receta.
    - **Detección (Glow Teal):** Un elemento de la receta (medicamento) que emite un pulso de luz teal (`box-shadow` expansivo) cuando el "láser" pasa por encima.
    - **Alerta de Interacción:** Un componente `AnimatePresence` que revela una notificación de color `rose-50` indicando un riesgo detectado después de completar el ciclo de escaneo.
- **Copy:** "Seguridad Clínica Elevada". Enfoque en ahorro de riesgos y validación con Vademécum.

### 2.2 Módulo "Agenda Autónoma" (Operación 24/7)
- **Visual:** Línea de tiempo vertical minimalista.
- **Interacción:** 
    - Uso de `whileInView` de Framer Motion para iluminar los pasos (1, 2, 3) conforme el usuario hace scroll.
    - Los pasos inactivos tendrán opacidad reducida (`opacity-40`).
- **Contenido:**
    1. Cita Agendada (Paciente reserva).
    2. Recordatorio WhatsApp (Automatización 24h antes).
    3. Confirmación Recibida (Estado actualizado en tiempo real).

### 2.3 Estética "Ultra-Smooth" (Sticky Parallax)
- Los títulos de sección (`h2`) y subtítulos utilizarán `position: sticky` con un `top` de aproximadamente `100px`.
- El contenido visual (la receta o la línea de tiempo) se desplazará lateralmente mientras el texto permanece anclado, creando un efecto de profundidad parallax.

### 2.4 Compliance Footer (Legales Meta/GDPR)
- **Ubicación:** Pie de página.
- **Estilo:** Texto en itálica, tipografía pequeña (`text-xs`), color gris neutro (`text-slate-500`).
- **Contenido:** Declaración de cumplimiento con políticas de WhatsApp Business de Meta y protección de datos internacionales (GDPR/HIPAA design standards).

## 3. Stack Tecnológico
- **Framework:** Next.js (App Router).
- **Estilos:** Tailwind CSS.
- **Animaciones:** Framer Motion.
- **Iconografía:** Lucide React.

## 4. Plan de Validación
- **Visual:** Verificar que el pulso teal no sea demasiado agresivo para la vista.
- **Performance:** Asegurar que las animaciones infinitas (láser) no disparen el uso de CPU mediante el uso de `will-change-transform`.
- **Responsive:** Los elementos sticky deben desactivarse o ajustarse en pantallas móviles para no bloquear el contenido.
