# 🛡️ Guía de Mantenimiento del Design System

## Objetivo
Mantener la coherencia visual y los principios de diseño subtle layering mientras el proyecto crece.

---

## 1. Cuando Crees un Nuevo Componente

### Checklist Pre-Desarrollo

- [ ] ¿Necesita un nuevo componente o puedo reutilizar uno existente?
- [ ] ¿He revisado `components/ui/` para similares?
- [ ] ¿Necesita tokens de color o puedo usar variables CSS?

### Checklist de Diseño

- [ ] ¿Usa tokens de `globals.css` (surface-*, border-*)?
- [ ] ¿Tiene transición suave? (`duration-200`)
- [ ] ¿Los borders son `rgba` o `border-*` tokens?
- [ ] ¿El focus state es sutil? (ring-2, ring-*/40)
- [ ] ¿Es responsive? (sm, md, lg breakpoints)

### Checklist Post-Desarrollo

- [ ] ¿Pasa el squint test?
- [ ] ¿Contraste WCAG AA mínimo?
- [ ] ¿Los hover effects son claros?
- [ ] ¿Las transiciones son suaves?
- [ ] ¿Es accesible con teclado?

---

## 2. Colores: Qué Hacer y Qué No

### ✅ Correcto

```tsx
// Usar tokens
<div className="bg-surface-100 border border-[rgba(0,0,0,0.08)]">

// Usar variables CSS
<div style={{ backgroundColor: 'var(--surface-200)' }}>

// Tailwind tokens
<Button className="text-primary hover:text-primary/80">
```

### ❌ Incorrecto

```tsx
// Hardcoded hex
<div className="bg-#f3f4f6 border border-#e5e7eb">

// Nombres de colores genéricos
<div className="bg-gray-100 border border-gray-300">

// Valores aleatorios
<div className="bg-orange-200 text-blue-900">
```

---

## 3. Espaciado: Sistema Consistente

### Escala de Espaciado
```css
xs:   0.25rem  (4px)
sm:   0.5rem   (8px)
md:   1rem     (16px)
lg:   1.5rem   (24px)
xl:   2rem     (32px)
2xl:  3rem     (48px)
```

### ✅ Correcto
```tsx
<div className="p-md gap-lg">
  <input className="px-md py-sm">
  <button className="px-lg">Save</button>
</div>

<nav className="space-y-sm">
  {items.map(item => <div>{item}</div>)}
</nav>
```

### ❌ Incorrecto
```tsx
<div className="p-2 gap-3">           /* Números arbitrarios */
<div className="space-y-px gap-1">    /* Números pequeños */
<div className="p-10 gap-20">         /* Espaciado excesivo */
```

---

## 4. Transiciones: Timing Consistente

### ✅ Correcto
```tsx
// Background + shadow en hover
className="hover:bg-surface-200 hover:shadow-sm 
  transition-[background-color,box-shadow] duration-200"

// Border + ring en focus
className="focus:border-ring focus:ring-2 
  transition-[border-color,box-shadow] duration-200"

// Múltiples propiedades
className="transition-[opacity,transform,background-color] duration-200"
```

### ❌ Incorrecto
```tsx
// transition-all (ineficiente)
className="transition-all" 

// Duraciones diferentes
className="hover:bg-gray-50 duration-300"  /* Inconsistente */

// Sin transición
className="hover:shadow-lg"  /* Cambio instant */
```

### Duraciones Estándar
- Inmediato: `duration-0` (raro)
- Rápido: `duration-100` (micro-interactions)
- Estándar: `duration-200` (default para todo)
- Lento: `duration-300` (animaciones grandes)

---

## 5. Focus States: Sutileza es Key

### ✅ Correcto

```tsx
// Input
focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40

// Button  
focus-visible:ring-2 focus-visible:ring-ring/40

// Link
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring

// Custom
focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2
```

### ❌ Incorrecto

```tsx
// Ring demasiado grande
focus:ring-4 focus:ring-ring/60

// Sin focus (inaccesible)
<button className="hover:bg-primary">Click</button>

// Ring invasivo
focus:ring-8 focus:ring-offset-8

// Opacidad muy alta
focus:ring-ring (sin /40)
```

### Regla de Oro
> El focus state debe ser **visible pero no invasivo**.

---

## 6. Sombras: Elevación Sutil

### Escala de Shadows
```css
shadow-xs:  0 1px 2px rgba(...)
shadow-sm:  0 1px 2px 0 rgba(...)
shadow-md:  0 4px 6px -1px rgba(...)
shadow-lg:  0 10px 15px -3px rgba(...)
```

### ✅ Correcto
```tsx
// Cards base
<Card className="shadow-sm">

// Hover effect
<Card className="shadow-sm hover:shadow-md transition-shadow duration-200">

// Modals/Popovers
<Modal className="shadow-lg">

// Never shadow-none for elevation
```

### ❌ Incorrecto
```tsx
// Sombra demasiado grande por defecto
<Card className="shadow-lg">

// Sin transición
<Card className="hover:shadow-lg">

// Sombra drástica
<Card className="shadow-none hover:shadow-2xl">
```

---

## 7. Borders: Always Use RGBA

### ✅ Correcto

```tsx
// Usando tokens CSS
<div className="border border-[rgba(0,0,0,0.06)]">

// O mejor aún, usar clases si las defines
<div className="border border-border-subtle">

// En diferentes contextos
<input className="border border-border-default">
<Card className="border border-border-subtle">
<Popover className="border border-border-overlay">
```

### ❌ Incorrecto

```tsx
// Hex colors
<div className="border border-[#e5e7eb]">

// Tailwind grays
<div className="border border-gray-300">

// Sin transparencia
<div className="border border-[rgb(229,231,235)]">
```

### Regla: Borders RGBA
> Usa `rgba(0, 0, 0, 0.XX)` siempre. Se adaptan al fondo automáticamente.

---

## 8. Responsive Design: Mobile First

### Breakpoints Estándar
```
sm:  640px   (móvil)
md:  768px   (tablet)
lg:  1024px  (desktop)
xl:  1280px  (wide desktop)
```

### ✅ Correcto

```tsx
// Mobile first (predeterminado, luego override)
<div className="p-md md:p-lg lg:p-xl">

<div className="text-sm md:text-base lg:text-lg">

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### ❌ Incorrecto

```tsx
// Desktop first (viejo, evitar)
<div className="lg:flex md:flex">

// Inconsistente
<div className="p-2 md:p-4 lg:p-8">  /* Números arbitrarios */

// Sin responsive
<div className="text-4xl">  /* Grande en móvil */
```

---

## 9. Dark Mode: Cuando lo Implementes

### Principios
> En dark mode: **MÁS lightness = MÁS elevation** (opuesto a light mode)

### Tokens de Ejemplo
```css
.dark {
  --surface-50:  oklch(0.185 0 0);
  --surface-100: oklch(0.205 0 0);
  --surface-200: oklch(0.269 0 0);
  --surface-300: oklch(0.320 0 0);
}
```

### ✅ Correcto

```tsx
// Mismo componente, diferentes colores automáticamente
<Card className="bg-card dark:bg-card">

// Con override explícito si necesario
<div className="bg-surface-100 dark:bg-surface-300">
```

### ❌ Incorrecto

```tsx
// Colores hardcoded
<div className="bg-white dark:bg-black">

// No usar dark: si no es necesario
<div className="dark:text-white">  /* Ya usa foreground */
```

---

## 10. Cuando Hagas Revisiones de Código

### Preguntas Críticas

1. **¿Usa tokens?** 
   - Si no → Pedir cambio a variables CSS

2. **¿Las transiciones son específicas?**
   - Si usa `transition-all` → Pedir cambio

3. **¿El focus state es sutil?**
   - Si usa `ring-4` o mayor → Pedir cambio a `ring-2`

4. **¿Los borders son RGBA?**
   - Si usa hex o color nombres → Pedir cambio

5. **¿Es responsive?**
   - Si no tiene `md:` o `lg:` → Verificar si debe tener

6. **¿Pasa squint test?**
   - Si los borders son lo primero que ves → Reducir opacidad

---

## 11. Troubleshooting Común

### "Mi componente se ve demasiado plano"
```
Solución: Aumenta el contraste de superficies
- surface-100 → surface-200 en hover
- Agrega shadow-sm y hover:shadow-md
```

### "El focus state es demasiado agresivo"
```
Solución: Reduce la opacidad
- ring-ring → ring-ring/40
- ring-4 → ring-2
```

### "Los borders son muy visibles"
```
Solución: Usa baja opacidad
- rgba(0,0,0,0.08) → rgba(0,0,0,0.04)
O intenta: border-subtle en lugar de border-default
```

### "Las transiciones se ven entrecortadas"
```
Solución: Especifica propiedades
- transition-all → transition-[bg,border,shadow]
- transition-all 300ms → transition-[...] duration-200
```

---

## 12. Anti-Patterns: Lo Que NUNCA Hagas

### ❌ Anti-Pattern 1: Colores Hardcoded
```tsx
// NO
<button className="bg-#5B21B6 hover:bg-#6D28D9">
```

### ❌ Anti-Pattern 2: Espaciado Arbitrario
```tsx
// NO
<div className="p-2.5 gap-3.5 ml-1.5">
```

### ❌ Anti-Pattern 3: transition-all
```tsx
// NO
<div className="transition-all hover:shadow-lg">
```

### ❌ Anti-Pattern 4: Bordes Hardcoded
```tsx
// NO
<div className="border border-#E5E7EB">
```

### ❌ Anti-Pattern 5: Focus Invasivo
```tsx
// NO
<input className="focus:ring-8 focus:ring-offset-4">
```

### ❌ Anti-Pattern 6: Sin Responsivo
```tsx
// NO
<div className="text-4xl p-6">  // Grande siempre
```

---

## 13. Recursos Rápidos

### Archivos de Referencia
- `app/globals.css` - Tokens globales
- `components/ui/button.tsx` - Ejemplo de button bien hecho
- `components/ui/input.tsx` - Ejemplo de input bien hecho
- `DESIGN_SYSTEM_GUIDE.md` - Guía completa

### Comandos Útiles

```bash
# Verificar errores de TypeScript
npm run type-check

# Compilar CSS
npm run build

# Ver el proyecto
npm run dev
```

---

## 14. Cuando Implementes Nueva Feature

### Paso 1: Revisar Existentes
- ¿Hay un componente similar en `components/ui/`?
- ¿Puedo reutilizarlo?

### Paso 2: Diseñar con Tokens
- ¿Qué tokens necesito?
- ¿Están en `globals.css`?

### Paso 3: Implementar
- Sigue los patrones en componentes existentes
- Usa transiciones `duration-200`
- Borders con rgba

### Paso 4: Testear
- Squint test ✓
- WCAG AA ✓
- Responsive ✓
- Focus states ✓

### Paso 5: Code Review
- Un colega verifica contra esta guía

---

## 15. Evolucionando el Design System

### Cuando Hagas Cambios Globales

1. **Actualiza `globals.css`**
2. **Documenta en CHANGELOG**
3. **Notifica al equipo**
4. **Prueba en múltiples componentes**
5. **Haz PR y espera review**

### Nunca Hagas

- ❌ Cambiar tokens sin documentar
- ❌ Mezclar estilos antiguos y nuevos
- ❌ Crear nuevos tokens sin razón
- ❌ Hardcodear colores "por esta vez"

---

## 📝 Resumen Ejecutivo

```
┌──────────────────────────────────────────────────┐
│ PRINCIPIOS DEL DESIGN SYSTEM FISIOLAB          │
├──────────────────────────────────────────────────┤
│ 1. Usa TOKENS, no hardcoded colors              │
│ 2. Transiciones 200ms ESPECÍFICAS               │
│ 3. Borders RGBA adaptativos                     │
│ 4. Focus subtle (ring-2, /40)                   │
│ 5. Spacing con escala (sm, md, lg, xl)          │
│ 6. Responsive mobile-first                      │
│ 7. Pasa squint test (jerarquía clara)           │
│ 8. WCAG AA mínimo (accesibilidad)               │
└──────────────────────────────────────────────────┘
```

**¡Mantenlo simple, consistente y profesional!** ✨
