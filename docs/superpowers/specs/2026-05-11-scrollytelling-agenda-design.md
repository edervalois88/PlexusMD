# Spec: Scrollytelling Autonomous Agenda - Tarea 28 (Extensión)

**Fecha:** 2026-05-11
**Proyecto:** PlexusMD Elite
**Estado:** Design Approved

## 1. Objetivo
Transformar la sección de "Agenda Autónoma" en una experiencia de "Scrollytelling" de alto impacto, donde el scroll del usuario controle directamente la transición entre los pasos del proceso mediante un efecto de "tarjetas que empujan" y micro-animaciones temáticas.

## 2. Estructura de Animación (Framer Motion)

### 2.1 Contenedor de Scroll
- **Altura:** `300vh` para proporcionar suficiente espacio de recorrido.
- **Hook:** `useScroll` vinculado al contenedor de la sección.

### 2.2 Layout de Dos Columnas (Sticky)
- **Izquierda (Texto):** Se mantiene fija (`sticky top-32`) mostrando el título y descripción general de la Agenda Autónoma.
- **Derecha (Visual):** Contenedor fijo que alberga el stack de tarjetas.

### 2.3 Secuencia de Tarjetas (Efecto "Push")
Utilizaremos `useTransform` para mapear el `scrollYProgress` [0, 1] a las posiciones `y` de cada tarjeta:

1. **Tarjeta 1 (Cita Agendada):** 
   - **Visual:** Grid de calendario minimalista.
   - **Animación Interna:** Un slot (10:00 AM) escala y emite un pulso teal cuando el progreso está entre 0% y 20%.
   - **Salida:** Se desplaza hacia arriba (`y: -100%`) cuando el progreso supera el 33%.

2. **Tarjeta 2 (Recordatorio WhatsApp):**
   - **Entrada:** Empuja a la Tarjeta 1 desde abajo (`y: 100%` -> `0%`) entre 33% y 40%.
   - **Visual:** Burbuja de chat estilizada con el logo de WhatsApp.
   - **Animación Interna:** Efecto "pop" con rebote elástico (`type: spring`) al centrarse.
   - **Salida:** Se desplaza hacia arriba cuando el progreso supera el 66%.

3. **Tarjeta 3 (Confirmación Recibida):**
   - **Entrada:** Empuja a la Tarjeta 2 desde abajo entre 66% y 73%.
   - **Visual:** Círculo de éxito grande.
   - **Animación Interna:** El icono de `Check` se dibuja usando `pathLength: 0` -> `1` entre 80% y 95%.

## 3. Especificaciones Técnicas
- **Z-Index Management:** Cada tarjeta sucesiva debe tener un `z-index` superior o igual para asegurar el efecto de empuje limpio.
- **Performance:** Uso de `layout` prop de Framer Motion para asegurar transiciones fluidas.
- **Mobile:** En dispositivos móviles, el efecto se simplificará a una lista vertical estándar con `whileInView` para evitar problemas de usabilidad con el scroll largo.

## 4. Plan de Validación
- **Fluidez:** Probar que la transición entre 33% (Card 1 a 2) y 66% (Card 2 a 3) no tenga saltos visuales.
- **Sincronización:** Asegurar que las micro-animaciones internas (pulso, pop, check) ocurran solo cuando la tarjeta correspondiente esté totalmente centrada.
