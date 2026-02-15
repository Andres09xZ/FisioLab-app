# Clinical Institutional Design System
## FisioLab - Historia Clínica Traumatológica

**Domain:** Medical record documentation for traumatology specialists  
**Intent:** Clinical and efficient. Professional medical tool, not SaaS dashboard.  
**Feel:** Serious institutional, precise like clinical protocol, dense but organized.

---

## Design Direction

**Expediente Clínico Digital**

This interface follows the MSP Ecuador HCU-form.002/2021 standard for medical history documentation. It must feel like a professional medical tool used in clinical/legal contexts, not a modern web app.

**Core Principles:**
- Borders-only depth strategy (no shadows)
- Subtle institutional color palette
- Dense information hierarchy
- Professional typography (Inter)
- Efficiency over aesthetics

---

## Color System

### Clinical Institutional Palette

```css
/* Primary Clinical */
--primary: #0891b2           /* Medical cyan - institutional blue */
--primary-hover: #0e7490
--primary-active: #155e75

/* Surface Hierarchy (Subtle Layering) */
--surface-base: #ffffff       /* White clinical background */
--surface-elevated: #f8fafc   /* Barely elevated surfaces */
--surface-section: #f0f9ff    /* Section backgrounds (light hospital blue) */
--surface-inset: #f1f5f9      /* Inset fields */

/* Text Hierarchy */
--text-primary: #0f172a       /* Primary text - high contrast */
--text-secondary: #475569     /* Secondary text */
--text-tertiary: #64748b      /* Muted text */
--text-label: #475569         /* Form labels */

/* Borders (Subtle Definition) */
--border-subtle: rgba(71, 85, 105, 0.08)
--border-default: #e2e8f0     /* Slate-200 */
--border-strong: #cbd5e1      /* Slate-300 */
--border-clinical: #0891b2    /* Accent indicator */

/* Semantic Clinical */
--success: #059669            /* Emerald-600 */
--warning: #f59e0b            /* Amber-500 */
--error: #dc2626              /* Red-600 */
```

### Why These Colors?

- **Cyan (#0891b2)**: Medical blue found in hospital signage, surgical gowns, institutional branding
- **Slate grays**: Stainless steel medical equipment, neutral institutional surfaces
- **White base**: Clinical cleanliness, medical forms, batas de laboratorio
- **Desaturated palette**: Professional seriousness over friendly vibrancy

---

## Typography

**Font:** Inter (Google Fonts)  
**Weights:** 400 (regular), 500 (medium), 600 (semibold)  
**Mono:** JetBrains Mono for data fields (CIE codes, numeric IDs)

### Hierarchy

```css
/* Headlines */
--text-2xl: 24px / semibold / -0.01em    /* Page title */
--text-base: 16px / semibold / normal    /* Section headers */

/* Body */
--text-sm: 14px / regular / normal       /* Primary text, labels */
--text-xs: 12px / medium / normal        /* Meta info, badges */

/* Data */
--text-mono: 14px / JetBrains Mono       /* CIE codes, IDs */
```

**Why Inter:**  
Clean, professional, high legibility at small sizes. Medical-grade readability. Not friendly/playful like Poppins.

---

## Spacing System

**Base unit:** 4px  
**Scale:** 0.25rem (4px) → 0.5rem (8px) → 0.75rem (12px) → 1rem (16px) → 1.5rem (24px) → 2rem (32px)

### Application

```
Component internal padding:   12px
Section padding:             16px  
Card gaps:                   24px
Major section breaks:        32px
```

**Symmetrical padding enforced** — TLBR must match unless content creates natural balance.

---

## Border Radius

**Clinical Rectangular:**  
- `4px` (--radius: 0.25rem) for all elements
- Sharper corners convey technical/professional feel
- Consistent with printed form aesthetics

**No rounded pills** — too friendly for medical-legal context.

---

## Depth Strategy

**Borders-only (Flat Technical)**

- **No shadows** on any element
- All depth created through subtle border weight and color shifts
- Hover states: border color intensifies (slate-200 → slate-300)
- Focus states: 2px ring with cyan-600/20 opacity

```css
/* Standard border */
border: 1px solid #e2e8f0

/* Hover state */
border: 1px solid #cbd5e1

/* Focus state */
border: 1px solid #0891b2
box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.2)
```

**Why no shadows:**  
Dense information tools (Linear, Raycast) use borders-only for technical clarity. Medical forms are flat documents.

---

## Signature Element

**Section Completeness Badges**

Inspired by surgical checklists — functional status indicators, not decorative.

```tsx
<CompletenessIndicator status="pending | partial | complete" />

States:
○ Pendiente   - slate-400, bg-slate-50, border-slate-200
◐ Parcial     - cyan-600, bg-cyan-50, border-cyan-200  
● Completo    - emerald-600, bg-emerald-50, border-emerald-200
```

**Rationale:**  
Medical forms track completion status. Nurses check off sections. This pattern is native to the domain, not borrowed from SaaS.

---

## Components

### Section Headers

```tsx
<CardHeader className="
  border-b border-slate-200 
  border-l-4 border-l-cyan-600 
  bg-slate-50 
  flex flex-row items-center justify-between
">
  <CardTitle className="text-base font-semibold text-slate-900">
    A. Datos del Paciente
  </CardTitle>
  <CompletenessIndicator status="complete" />
</CardHeader>
```

**Key features:**
- 4px left border in clinical cyan (institutional indicator)
- Subtle gray background (barely different from white)
- Completeness badge aligned right
- Base font size (16px) — not oversized headlines

### Input Fields

```tsx
<Input className="
  h-10 
  rounded 
  border border-slate-300 
  bg-white
  focus:border-cyan-600 
  focus:ring-2 
  focus:ring-cyan-600/20
" />
```

**Measurements:**
- Height: 40px (medical form field standard)
- Radius: 4px (rectangular, not rounded)
- Border: 1px solid slate-300 (visible but not harsh)
- Focus: cyan ring (institutional accent)

### Buttons

```tsx
/* Primary action (Save) */
<Button className="
  h-10 px-4 
  rounded 
  bg-cyan-600 
  text-white 
  hover:bg-cyan-700
  border border-cyan-600
">

/* Secondary action (Generate prescription) */
<Button variant="secondary" className="
  bg-slate-600 
  hover:bg-slate-700
">

/* Tertiary (Download PDF) */
<Button variant="outline" className="
  border-slate-300 
  bg-white 
  text-slate-900 
  hover:bg-slate-50
">
```

**Why no shadows:**  
Buttons are actions, not objects. Flat buttons are standard in technical tools.

### Cards

```tsx
<Card className="
  border border-slate-200 
  rounded 
  bg-white
">
```

- No shadow (borders-only)
- Subtle border (whisper-quiet)
- 4px radius
- 24px internal spacing (gap-6)

---

## Collapsible Sections

```tsx
<CardHeader 
  onClick={() => toggleSection('name')}
  className="cursor-pointer hover:bg-slate-100 transition-colors"
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <CardTitle>C. Antecedentes</CardTitle>
      <CompletenessIndicator status="partial" />
    </div>
    <span className="text-slate-400 text-sm">▼</span>
  </div>
</CardHeader>
```

**Interaction:**
- 200ms color transition (not bouncy/spring)
- Arrow rotates ▶ → ▼
- Hover: bg-slate-100 (barely noticeable)

---

## Validation

### Squint Test
✅ Section hierarchy visible  
✅ No harsh borders jumping out  
✅ Cyan clinical accent provides orientation  
✅ White-to-gray-50 transitions are subtle but findable

### Swap Test
✅ Inter cannot be swapped for Poppins — feel changes dramatically  
✅ Borders-only cannot be swapped for shadows — loses clinical precision  
✅ Layout is sequential (vertical form), not dashboard grid

### Signature Test
✅ Completeness badges appear in 7 section headers  
✅ Left-border clinical accent on every section  
✅ Rectangular inputs (not rounded) throughout  
✅ No decorative elements anywhere

### Token Test
✅ `--border-clinical`, `--surface-section`, `--primary` all evoke medical context  
✅ Not generic `--primary`, `--accent` without meaning

---

## Defaults Rejected

| Default | Replacement | Why |
|---------|-------------|-----|
| Card grid dashboard | Vertical linear form | Medical forms are sequential documents |
| Rounded inputs (radius 8px+) | Rectangular (radius 4px) | Matches printed form fields |
| Vibrant SaaS colors (#0EA5E9, #10B981) | Desaturated institutional (#0891b2) | Medical-legal seriousness |
| Poppins (friendly) | Inter (professional) | Clinical context requires neutral legibility |
| Shadows for depth | Borders-only | Dense technical tools use flat hierarchy |

---

## Accessibility

- **Contrast:** All text meets WCAG AA (4.5:1 minimum)
- **Focus states:** 2px ring visible on all interactive elements
- **Labels:** Semantic HTML labels for all form fields
- **Status indicators:** Color + icon (not color alone)

---

## Future Patterns

When adding new components:

1. **Check domain first** — What does this element look like in a hospital?
2. **Use existing tokens** — Don't invent new colors
3. **Stay rectangular** — 4px radius maximum
4. **No shadows** — Borders-only strategy applies to everything
5. **Update this doc** — Add pattern measurements below

---

## Pattern Library

### Data Table Component
**Component**: DataTable (TanStack React Table v8)
**Location**: `components/ui/data-table.tsx`

**Features**:
- Sorting, filtering, pagination
- 10 items per page default
- Subtle borders (slate-300)
- Hover state: `bg-slate-50`
- Search with icon (slate-400)

**Measurements**:
- Search input: h-10, pl-10
- Table header: bg-slate-50, text-slate-900 font-semibold
- Row borders: border-slate-200
- Pagination buttons: h-10, gap-2

**Usage**: CRUD views for Pacientes, Evaluaciones, Planes

---

### CRUD List View
**Pattern**: Table-based list with actions

**Structure**:
```tsx
<Card border-slate-300>
  <CardContent p-6>
    <DataTable 
      data={items}
      searchKey="campo"
      isLoading={loading}
    />
  </CardContent>
</Card>
```

**Action Buttons** (column):
- Ver: `hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200`
- Editar: `hover:bg-slate-50`
- Unique actions per entity

**Badge Color Scheme**:
- EVA Leve (0-3): `bg-emerald-50 text-emerald-700 border-emerald-200`
- EVA Moderado (4-6): `bg-amber-50 text-amber-700 border-amber-200`
- EVA Severo (7-10): `bg-red-50 text-red-700 border-red-200`
- Activa: `bg-cyan-50 text-cyan-700 border-cyan-200`

---

### Form View Sections
**Pattern**: Sectioned forms with completeness indicators

**Card Structure**:
```tsx
<Card border-slate-300>
  <CardHeader 
    border-b border-slate-200 
    border-l-4 border-l-cyan-600 
    bg-slate-50 
    py-3 px-6
  >
    <CardTitle text-base font-semibold>
      A. Section Title
    </CardTitle>
  </CardHeader>
  <CardContent p-6>
    {/* Form fields */}
  </CardContent>
</Card>
```

**Section States** (same as clinical histories):
- Pendiente: `○` slate-400
- Parcial: `◐` cyan-600
- Completo: `●` emerald-600

---

### Input Fields (Forms)
- Height: h-10
- Border: `border-slate-300`
- Focus: `focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20`
- Labels: `text-sm font-medium text-slate-700`

**Textarea**: Same style, `resize-none` by default

**Select**: Same height and borders, cyan focus ring

---

### Buttons (Actions)
**Primary** (Create, Save):
```css
bg-cyan-600 hover:bg-cyan-700 
border border-cyan-600
h-10 gap-2
```

**Outline** (Cancel, Secondary):
```css
border-slate-300 h-10
```

**With Icon**: Icon first (h-4 w-4), gap-2, text follows

---

### Progress Indicators
**Used in**: Plans table

```tsx
<div className="w-20 h-2 bg-slate-200 rounded-full">
  <div 
    className="h-full bg-cyan-600 rounded-full"
    style={{ width: `${progreso}%` }}
  />
</div>
```

- Outer: w-20 h-2, bg-slate-200
- Inner: bg-cyan-600, dynamic width
- Radius: full (pill shape)

---

### Info Cards / Alerts
**Pattern**: Contextual information boxes

```tsx
<Card border-slate-300 bg-cyan-50>
  <CardContent p-6>
    <div className="flex gap-3">
      <div className="p-2 bg-cyan-100 rounded border-cyan-200">
        <Icon className="h-5 w-5 text-cyan-700" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">
          Title
        </h3>
        <p className="text-sm text-slate-600">
          Description
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

**Use cases**:
- Evaluation versioning explanation
- Treatment plan smart scheduling info
- Feature highlights

---

### Metric Display (if needed)
TBD - Check clinical context (vital signs, EVA scale)

### Data Tables (if needed)  
TBD - Check medical records format

### Date Picker (if needed)
Custom component (native date inputs can't be styled)

---

**Last updated:** 2026-02-08  
**Version:** 1.0 - Clinical Institutional Foundation
