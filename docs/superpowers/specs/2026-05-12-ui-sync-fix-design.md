# Spec: UI Synchronization & Mobile Interleaving Fix

**Fecha:** 2026-05-12
**Proyecto:** PlexusMD Elite
**Estado:** Design Approved

## 1. Objetivo
Corregir los errores de UX reportados: el orden incorrecto de elementos en dispositivos móviles y el empalme persistente de textos en la versión de escritorio, añadiendo además un efecto de desenfoque progresivo para mayor fluidez.

## 2. Solución Mobile (Intercalado Real)
- **Reestructuración:** Cada bloque de texto en el `motion.div` de la agenda ahora contendrá su respectiva tarjeta visual como un hijo directo.
- **Visibilidad:** 
    - El visual dentro del bloque de texto tendrá la clase `block lg:hidden`.
    - El contenedor de tarjetas absoluto (derecha en desktop) mantendrá `hidden lg:flex`.
- **Resultado:** En móvil, el navegador renderizará naturalmente: Título 1 -> Descripción 1 -> Visual 1 -> Título 2 -> Descripción 2 -> Visual 2...

## 3. Solución Desktop (Sincronización y "Zonas Muertas")

### 3.1 Eliminación de Empalmes
Se ampliarán las zonas de transición para garantizar que un texto sea invisible antes de que el siguiente aparezca.
- **Nuevos Rangos de Seguridad (Ejemplo):**
    - Etapa 1 activa: `0% - 15%`
    - Transición (Pantalla Limpia): `15% - 25%`
    - Etapa 2 activa: `25% - 35%`
- **Lógica de Tira:** La tira de texto (`textStripY`) se moverá de forma más instantánea durante el periodo de "zona muerta" (15-25%).

### 3.2 Efecto Blur Progresivo (Ultra-Smooth)
Se implementará un hook `textBlur` vinculado al progreso del scroll:
- **Estado Ideal (Centro de etapa):** `filter: blur(0px)`, `opacity: 1`.
- **Estado de Transición (Entre etapas):** `filter: blur(8px)`, `opacity: 0`.

### 3.3 Unificación de Puntos de Anclaje
Se utilizarán constantes para los puntos de transición (0.2, 0.4, 0.6, 0.8) de modo que tanto `cardY` como `textStripY` y `textBlur` cambien exactamente en el mismo milisegundo de scroll.

## 4. Stack Tecnológico
- **Framer Motion:** `useTransform`, `filter` support.
- **Tailwind CSS:** `lg:` media queries.

## 5. Plan de Validación
- **Mobile Audit:** Hacer scroll rápido en móvil y verificar que no haya bloques de texto "huérfanos".
- **Desktop Audit:** Detener el scroll a la mitad de una transición (ej. 30%) y confirmar que la pantalla se vea intencionalmente desenfocada o vacía, nunca con dos textos legibles al mismo tiempo.
