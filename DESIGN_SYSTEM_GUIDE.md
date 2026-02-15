# 🎨 Design System & Guía de Estilo - FisioLab

## 1. Token Architecture

### Surface Elevation Scale

```
┌─────────────────────────────────────────────────────────┐
│ surface-50   #ffffff       ← Lo más elevado (modales)   │
├─────────────────────────────────────────────────────────┤
│ surface-100  #f9fafb       ← Base (background)          │
├─────────────────────────────────────────────────────────┤
│ surface-200  #f3f4f6       ← Cards, hover              │
├─────────────────────────────────────────────────────────┤
│ surface-300  #e5e7eb       ← Inputs, dividers          │
├─────────────────────────────────────────────────────────┤
│ surface-400  #d1d5db       ← Borders oscuros           │
└─────────────────────────────────────────────────────────┘
```

**Uso:**
- Use `surface-100` como fondo por defecto
- Use `surface-200` para cards y hover states
- Use `surface-50` para inputs y áreas edibles
- Cambios sutiles = apenas 4-6% de lightness

### Border Tokens

```css
--border-subtle:   rgba(0, 0, 0, 0.04)  /* Casi invisible *)
--border-default:  rgba(0, 0, 0, 0.08)  /* Sutilmente visible *)
--border-overlay:  rgba(0, 0, 0, 0.12)  /* Más visible (modales) *)
```

**Regla:** Usa `rgba` siempre, no hex. Los borders se adaptan al background.

### Primary Colors

```css
--primary:     #D466F2  (Púrpura - CTAs)
--secondary:   #056CF2  (Azul - Info)
--accent:      #4BA4F2  (Azul claro - Highlights)
--success:     #0AA640  (Verde)
--warning:     Ámbar
--destructive: Rojo
```

---

## 2. Typography Hierarchy

### Fonts
```css
--font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;
--font-mono: "Geist Mono";
```

### Escala
```
Display    → 32px, bold       (Títulos principales)
Heading-1  → 28px, semibold   (Títulos de página)
Heading-2  → 24px, semibold   (Subtítulos)
Heading-3  → 20px, semibold   (Secciones)
Body       → 16px, regular    (Contenido)
Caption    → 14px, regular    (Descripciones)
Label      → 12px, medium     (Etiquetas)
```

---

## 3. Componentes & Patrones

### Button States

#### Default (Primario)
```
Normal:   bg-primary text-white
Hover:    bg-primary/90 shadow-sm
Active:   bg-primary/80
Focus:    ring-ring/40 ring-2
Disabled: opacity-50 pointer-events-none
```

#### Outline (Secundario)
```
Normal:   bg-surface-100 border-default text-foreground
Hover:    bg-surface-200 shadow-sm
Active:   bg-surface-300
Focus:    ring-ring/40 ring-2
```

#### Ghost (Terciario)
```
Normal:   transparent
Hover:    bg-rgba(0,0,0,0.04)
Active:   bg-rgba(0,0,0,0.08)
```

### Input Fields

```
Background:   surface-100
Border:       border-default (rgba)
Focus Border: border-ring + ring
Focus Ring:   ring-ring/40 ring-2
Placeholder:  text-muted-foreground
```

**Patrón:** Inputs siempre son "inset" (background más oscuro que el contenedor)

### Cards

```
Background:   surface-50 (blanco)
Border:       border-subtle (rgba)
Shadow:       shadow-sm
Hover Shadow: shadow-md (con transición)
Border-R:     rounded-xl (1rem)
```

---

## 4. Spacing System

```
xs:   0.25rem  (4px)
sm:   0.5rem   (8px)
md:   1rem     (16px)
lg:   1.5rem   (24px)
xl:   2rem     (32px)
2xl:  3rem     (48px)
```

**Uso:**
```tsx
// En padding/margin
<div className="p-md gap-lg">
  <div className="px-md py-sm">

// En espaciado de lista
<nav className="space-y-sm">
```

---

## 5. Transiciones & Animations

### Timing
```css
Duration:    200ms (estándar)
Easing:      ease-in-out (implícito)
Properties:  Específicas (no transition-all)
```

### Ejemplos
```tsx
// Button
transition-[background-color,border-color,box-shadow,color] duration-200

// Input Focus
transition-[color,border-color,box-shadow,background-color] duration-200

// Card Hover
transition-shadow duration-200
```

---

## 6. Accesibilidad

### Focus States
- ✅ Siempre visible
- ✅ Ring de 2px (no 3px)
- ✅ Ring con opacidad: `ring-ring/40`
- ✅ Contraste mínimo WCAG AA

### Color Contrast
- ✅ Foreground sobre background: mínimo 4.5:1
- ✅ Borders sobre background: mínimo 3:1
- ✅ No confíes solo en color, usa iconos/texto

### Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Dark Mode (Pendiente Mejora)

### Escala en Dark
```css
.dark {
  --background: oklch(0.145 0 0);       /* Casi negro *)
  --surface-50:  oklch(0.185 0 0);      /* Un poco más claro *)
  --surface-100: oklch(0.205 0 0);      (* Gris oscuro *)
  --surface-200: oklch(0.269 0 0);      (* Gris más oscuro *)
}
```

**Principio:** En dark, MORE lightness = MORE elevation (opuesto a light mode)

---

## 8. Patrones UI Comunes

### Card con Contenido

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenido */}
  </CardContent>
</Card>
```

### Form Group

```tsx
<div className="space-y-md">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="tu@email.com" />
  {error && <span className="text-xs text-destructive">{error}</span>}
</div>
```

### Button Group

```tsx
<div className="flex gap-md">
  <Button variant="default">Guardar</Button>
  <Button variant="outline">Cancelar</Button>
  <Button variant="ghost">Más opciones</Button>
</div>
```

### Status Badge

```tsx
<Badge variant={status === 'active' ? 'default' : 'outline'}>
  {status}
</Badge>
```

---

## 9. Checklist para Nuevos Componentes

- [ ] ¿Usa tokens en lugar de colores hardcoded?
- [ ] ¿Tiene transiciones suaves (200ms)?
- [ ] ¿Es responsive (sm, md, lg breakpoints)?
- [ ] ¿Tiene focus states claros?
- [ ] ¿Tiene hover states?
- [ ] ¿Es accesible (WCAG AA)?
- [ ] ¿Sigue el spacing system?
- [ ] ¿Usa surface tokens correctamente?
- [ ] ¿Los borders son rgba?
- [ ] ¿Pasa el squint test?

---

## 10. Recursos & Referencias

### Color Tokens
Definidos en: `app/globals.css` (`:root` y `.dark`)

### Componentes Base
Ubicación: `components/ui/`
- button.tsx
- input.tsx
- card.tsx
- badge.tsx
- dialog.tsx
- etc.

### Principios
- Vercel Design System: https://vercel.com
- Supabase UI: https://supabase.com
- Subtle Layering: Cambios pequeños, jerarquía clara

---

## 11. Ejemplos: Antes vs Después

### Before (Old Style)
```tsx
<button className="bg-blue-500 hover:bg-blue-600 border border-blue-300 
  focus:ring-4 focus:ring-blue-200">
  Click me
</button>
```

### After (New Design System)
```tsx
<Button variant="default" className="transition-[background-color,box-shadow] duration-200">
  Click me
</Button>
```

**Beneficios:**
- ✅ Consistencia global
- ✅ Fácil de mantener
- ✅ Tokens reutilizables
- ✅ Transiciones suaves
- ✅ Profesional

---

## 12. Troubleshooting Comun

### Problema: "Mi elemento se ve demasiado claro"
**Solución:** Usa `surface-200` en lugar de `surface-100` para más contraste.

### Problema: "Los borders son muy visibles"
**Solución:** Cambia a `border-subtle` (rgba con 0.04 opacity).

### Problema: "El focus state es muy agresivo"
**Solución:** Usa `ring-ring/40` en lugar de `ring-ring` (reduce opacity).

### Problema: "Las transiciones se ven entrecortadas"
**Solución:** Asegúrate de usar `transition-[prop1,prop2] duration-200` específicamente.

---

**¡Usa estos principios para mantener la consistencia y mejorar la experiencia!** 🎨✨
