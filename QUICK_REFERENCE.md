# ⚡ Quick Reference - Design System FisioLab

## Tokens Principales

### Surfaces (Elevación)
```css
surface-50   #ffffff       /* Inputs, modales */
surface-100  #f9fafb       /* Background base */
surface-200  #f3f4f6       /* Cards, hover */
surface-300  #e5e7eb       /* Inputs, dividers */
surface-400  #d1d5db       /* Borders oscuros */
```

### Borders
```css
border-subtle   rgba(0, 0, 0, 0.04)
border-default  rgba(0, 0, 0, 0.08)
border-overlay  rgba(0, 0, 0, 0.12)
```

### Colors
```css
primary     #D466F2     /* CTAs, acciones */
secondary   #056CF2     /* Info, secundario */
accent      #4BA4F2     /* Highlights */
success     #0AA640     /* Éxito */
destructive Rojo        /* Peligro */
```

---

## Componentes: Uso Rápido

### Button
```tsx
<Button>Default</Button>                    /* Primario */
<Button variant="outline">Outline</Button>  /* Secundario */
<Button variant="ghost">Ghost</Button>      /* Terciario */
<Button variant="destructive">Delete</Button>
<Button variant="link">Link</Button>
```

### Input
```tsx
<Input placeholder="Escribe..." />
<Input type="email" placeholder="tu@email.com" />
<Input disabled />
```

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
</Card>
```

### Badge
```tsx
<Badge>Default</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="secondary">Secondary</Badge>
```

---

## Spacing: Escala Rápida

```
xs   → 0.25rem (4px)
sm   → 0.5rem  (8px)
md   → 1rem    (16px)
lg   → 1.5rem  (24px)
xl   → 2rem    (32px)
2xl  → 3rem    (48px)
```

### Ejemplo
```tsx
<div className="p-md gap-lg">        /* Padding md, gap lg */
<div className="mt-md mb-lg">        /* Margin top/bottom */
<nav className="space-y-sm">         /* Space between items */
```

---

## Estados Interactivos

### Hover
```tsx
className="hover:bg-surface-200 transition-[background-color] duration-200"
className="hover:shadow-md transition-shadow duration-200"
```

### Focus
```tsx
className="focus-visible:ring-2 focus-visible:ring-ring/40"
className="focus-visible:border-ring focus-visible:ring-offset-2"
```

### Active/Pressed
```tsx
className="active:bg-primary/80"
className="aria-pressed:bg-primary/90"
```

### Disabled
```tsx
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

---

## Transiciones: Template

### Background + Shadow (típico para botones)
```tsx
className="transition-[background-color,box-shadow] duration-200"
```

### Border + Ring (típico para inputs)
```tsx
className="transition-[border-color,box-shadow] duration-200"
```

### Opacity (típico para hover)
```tsx
className="transition-opacity duration-200"
```

### Shadow (típico para cards)
```tsx
className="transition-shadow duration-200"
```

### Todo en uno
```tsx
className="transition-[background-color,border-color,box-shadow,color,opacity] duration-200"
```

---

## Responsive: Mobile First

```
(sin prefijo) → sm (640px)
md:           → md (768px)
lg:           → lg (1024px)
xl:           → xl (1280px)
2xl:          → 2xl (1536px)
```

### Ejemplo
```tsx
<div className="text-sm md:text-base lg:text-lg">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="p-sm md:p-md lg:p-lg">
```

---

## Accesibilidad: Checklist

```tsx
/* SIEMPRE agregar focus states */
className="focus-visible:ring-2 focus-visible:ring-ring/40"

/* NUNCA sin label en inputs */
<label htmlFor="email">Email</label>
<input id="email" />

/* SIEMPRE alt en imágenes */
<img src="..." alt="Descripción" />

/* NUNCA confíes solo en color */
<Badge className="bg-green-100 text-green-700">
  ✓ Completado
</Badge>

/* SIEMPRE aria-labels si necesario */
<button aria-label="Abrir menú" />
```

---

## Dark Mode (cuando esté implementado)

```tsx
/* Los tokens se invierten automáticamente */
<div className="bg-surface-100 dark:bg-surface-300">

/* Los colores CSS van en .dark */
.dark {
  --surface-50:  oklch(0.185 0 0);
  --surface-100: oklch(0.205 0 0);
}
```

---

## Anti-Patterns: NO HAGAS ESTO

```tsx
❌ <div className="bg-#f3f4f6">              /* Hardcoded color */
❌ <div className="transition-all">          /* transition-all */
❌ <div className="p-2.5 gap-3">             /* Spacing arbitrario */
❌ <div className="border border-#e5e7eb">  /* Border hex */
❌ <button className="focus:ring-4">        /* Ring demasiado grande */
❌ <div className="text-4xl">               /* No responsive */
❌ <img src="..." />                         /* Sin alt */
```

---

## Estructura de Proyecto

```
components/ui/           ← Componentes base
├── button.tsx           ✨ Bien hecho
├── input.tsx            ✨ Bien hecho
├── card.tsx             ✨ Bien hecho
└── ...

components/dashboard/    ← Componentes específicos
├── sidebar.tsx          ✨ Mejorado
├── topbar.tsx           ✨ Mejorado
└── ...

app/globals.css          ← Tokens (aquí!)
lib/utils.ts             ← Utilidades

📚 Documentación:
├── DESIGN_SYSTEM_GUIDE.md      ← Lee esto
├── MAINTENANCE_GUIDE.md        ← Para desarrollar
├── BEFORE_AFTER_VISUAL.md      ← Visual
└── README_UIUX_V2.1.0.md       ← Overview
```

---

## Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "Muy plano" | Usa `surface-200` en hover + `shadow-sm` |
| "Focus invasivo" | Cambia a `ring-2 ring-ring/40` |
| "Border muy visible" | Usa `border-subtle` en lugar de `border-default` |
| "No responsive" | Agrega `md:` y `lg:` prefixes |
| "Se ve roto" | Revisa que uses `surface-*` no grises |
| "Transición lenta" | Cambia `duration-300` a `duration-200` |

---

## Comandos Útiles

```bash
# Iniciar proyecto
npm run dev

# Build para producción
npm run build

# Verificar tipos
npm run type-check

# Lint code
npm run lint
```

---

## Archivos Clave

```
✅ app/globals.css              Tokens, escala de colores
✅ components/ui/button.tsx     Ejemplo de button bien hecho
✅ components/ui/input.tsx      Ejemplo de input bien hecho
✅ components/dashboard/sidebar  Componente mejorado
```

---

## Checklist Antes de Commit

- [ ] ¿Uso tokens? (no hardcoded colors)
- [ ] ¿Transiciones suaves? (duration-200, specific props)
- [ ] ¿Borders son rgba?
- [ ] ¿Focus states son sutiles?
- [ ] ¿Es responsive? (sm, md, lg)
- [ ] ¿Pasa squint test?
- [ ] ¿WCAG AA mínimo?

---

## Recursos

```
Local:
- DESIGN_SYSTEM_GUIDE.md (guía completa)
- MAINTENANCE_GUIDE.md (cómo desarrollar)
- Este archivo (quick ref)

Inspiración:
- vercel.com (design system)
- supabase.com (UI patterns)
```

---

## Soporte

❓ Preguntas → Lee `DESIGN_SYSTEM_GUIDE.md`
🐛 Bug → Revisa `MAINTENANCE_GUIDE.md`
💡 Idea → Abre issue con contexto

---

**¡Happy coding! ✨**
