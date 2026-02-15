# Plan de Mejora UI/UX - FisioLab Dashboard

## 📋 Análisis Actual

### Fortalezas Existentes
✅ Sistema de tokens de color bien definido
✅ Tipografía clara con Poppins
✅ Radio de borde consistente (1rem)
✅ Estructura de componentes modular
✅ Sombras sutiles aplicadas

### Áreas de Mejora Identificadas

#### 1. **Jerarquía de Superficies - Incoherente**
**Problema:** 
- El sidebar es blanco puro (#ffffff) pero el fondo también es casi blanco (#f9fafb)
- No hay suficiente contraste sutil para separar visualmente las regiones
- Borders duros (solid #e5e7eb) sin transparencia

**Solución:**
- Crear una escala de elevación con variaciones de gris muy sutiles
- Usar borders con rgba para que se adapten al fondo
- Implementar surface-50, surface-100, surface-200 tokens

#### 2. **Estados de Focus - Demasiado Agresivos**
**Problema:**
- Ring de 3px con color primario es demasiado llamativo
- Interrumpe la fluidez del diseño subtle

**Solución:**
- Reducir a 2px
- Usar opacidad en el ring para suavizar
- Aumentar focus-visible:ring-opacity

#### 3. **Botones - Falta Gradualidad**
**Problema:**
- Solo hover:bg-primary/90 no es suficiente
- Falta transición clara entre estados
- No hay diferenciación clara de "inset" vs "raised"

**Solución:**
- Agregar estados: default, hover, active, disabled con transiciones suaves
- Para botones outline: usar background más oscuro que no-hovered
- Implementar drop shadow sutil en hover

#### 4. **Input Fields - Falta Inset Appearance**
**Problema:**
- Los inputs tienen border pero falta el "inset" visual
- No hay diferenciación clara entre background-input vs background-card

**Solución:**
- Dark background para inputs (inset appearance)
- Aumentar border opacity en focus
- Agregar background color más oscura

#### 5. **Elevación de Tarjetas**
**Problema:**
- `box-shadow: 0 1px 2px` es casi invisible
- No hay clara jerarquía de qué está arriba de qué

**Solución:**
- Aumentar a múltiples niveles de shadow
- Shadow-sm para cards
- Shadow-md para dropdowns/modales

#### 6. **Espaciado - Inconsistente**
**Problema:**
- Padding y gaps no siguen una escala clara
- Transiciones de 300ms en algunos lugares, no es consistente

**Solución:**
- Implementar escala de espaciado: xs, sm, md, lg, xl
- Usar para padding, margin, gaps de forma consistente

---

## 🎨 Cambios a Realizar

### A. Mejorar CSS Globals

#### Token adicionales para elevación:
```css
--surface-50: (blanco puro, para lo más elevado)
--surface-100: (gris muy ligero - 96% brightness)
--surface-200: (gris claro - 92% brightness)
--surface-300: (gris medio-claro - 85% brightness)
--border-subtle: rgba(0, 0, 0, 0.05)
--border-default: rgba(0, 0, 0, 0.08)
--border-overlay: rgba(0, 0, 0, 0.12)
```

### B. Mejorar Sidebar

#### Cambios:
- Background: surface-100 en lugar de white puro
- Borders: usar rgba en lugar de solid hex
- Hover states: surface-200 (más claro que surface-100)
- Active state: surface-accent con color sutil

### C. Mejorar Button Component

#### Variantes mejoradas:
- **default**: Añadir shadow hover y transición suave
- **outline**: Dark background + subtle border
- **ghost**: Hover background más definido
- Todos: Transición de 200ms suave

### D. Mejorar Input Component

#### Cambios:
- Background más oscuro (surface-300)
- Border sutil por defecto
- Border + ring en focus
- Transición suave de colores

### E. Mejorar Card Component

#### Cambios:
- Shadow aumentado
- Border sutil en lugar de border fuerte
- Padding consistente

---

## 📊 Orden de Implementación

1. **Fase 1:** Actualizar tokens de color en globals.css
2. **Fase 2:** Mejorar Button component
3. **Fase 3:** Mejorar Input component
4. **Fase 4:** Mejorar Card component
5. **Fase 5:** Actualizar Sidebar
6. **Fase 6:** Testing visual (squint test)

---

## ✅ Checklist de Validación

- [ ] Jerarquía de elevación clara (squint test)
- [ ] Borders no son lo primero que se nota
- [ ] Estados de focus sutiles pero claros
- [ ] Transiciones suaves (no instant)
- [ ] Colores coherentes sin saltos drásticos
- [ ] Espaciado consistente
- [ ] Contraste suficiente para accesibilidad
- [ ] Responsive en móvil
