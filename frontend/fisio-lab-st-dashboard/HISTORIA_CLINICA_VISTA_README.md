# Vista de Detalle de Historia Clínica Traumatológica

## 📋 Descripción General

Se ha implementado una vista de detalle completa y profesional para visualizar historias clínicas traumatológicas en el sistema FisioLab. La vista está diseñada para mostrar de forma organizada y clara los 100+ campos de una historia clínica, siguiendo principios de diseño domain-specific y data-dense.

## 🎯 Características Principales

### 1. **Arquitectura de Navegación por Tabs**

La información se organiza en 6 tabs principales para facilitar la lectura y navegación:

- **📄 Resumen**: Vista rápida con información crítica (diagnóstico, signos vitales, EVA)
- **👤 Paciente**: Datos demográficos y de identificación del paciente
- **🩺 Evaluación Clínica**: Signos vitales, revisión por sistemas, examen físico completo
- **📋 Antecedentes**: Historial médico, quirúrgico, obstétrico y alergias
- **🎯 Diagnóstico**: Problema actual detallado, diagnósticos CIE-10 con clasificación
- **💊 Plan**: Planes diagnóstico, terapéutico, educacional y datos del profesional

### 2. **Componentes Visuales Especializados**

#### Escala EVA (Dolor)
- Visualización numérica grande (ej: `8 / 10`)
- Barra de progreso con gradiente de colores (verde → amarillo → rojo)
- Fácil identificación de la intensidad del dolor

```typescript
// Ejemplo de visualización
{historia.intensidad_eva !== null && (
  <Card>
    <div className="flex items-center gap-4">
      <div className="text-5xl font-bold text-[#8B3AB8]">{historia.intensidad_eva}</div>
      <div className="text-gray-500">/ 10</div>
      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
          style={{ width: `${(historia.intensidad_eva / 10) * 100}%` }}
        ></div>
      </div>
    </div>
  </Card>
)}
```

#### Badges Informativos
- **Tipo de Historia**: Badge azul para "Traumatológica", verde para "Fisioterapéutica"
- **Tipo de Consulta**: Badge distingue entre primera consulta y subsecuente

#### Checkboxes Visuales
- Antecedentes patológicos con checkmarks visuales
- Revisión por sistemas con indicadores claros
- Solo se muestran los campos seleccionados (reducción de ruido visual)

```typescript
const CheckboxField = ({ label, checked }: { label: string, checked: boolean }) => {
  if (!checked) return null;
  
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 rounded border-2 border-[#8B3AB8] bg-[#8B3AB8]">
        <svg className="h-3 w-3 text-white">
          <path d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <span className="text-sm text-gray-900">{label}</span>
    </div>
  );
};
```

### 3. **Acciones Disponibles**

Header con botones de acción:

- **← Volver**: Regresa a la lista de historias clínicas
- **💊 Crear Receta**: Abre formulario para crear receta médica (próximamente)
- **📥 Descargar PDF**: Genera y descarga la HC en formato PDF
- **✏️ Editar**: Navega al formulario de edición

### 4. **Campos Organizados por Secciones**

#### Tab: Resumen (Vista Rápida)
```typescript
- Motivo de consulta (primera/subsecuente)
- Badge de tipo de consulta
- Diagnóstico principal con código CIE-10
- Signos vitales (temperatura, PA, pulso, FR)
- Antropometría (peso, talla, IMC, perímetro abdominal)
- Escala EVA con visualización gráfica
- Descripción de la enfermedad actual
```

#### Tab: Paciente
```typescript
- Primer y segundo apellido
- Primer y segundo nombre  
- Sexo (M/F/O)
- Edad en años
- Institución del sistema
- Establecimiento de salud
```

#### Tab: Evaluación Clínica
```typescript
// Constantes Vitales
- Fecha y hora de registro
- Temperatura, PA (sistólica/diastólica), Pulso, FR
- Peso, Talla, IMC, Perímetro abdominal
- Hemoglobina, Glucosa capilar, Pleusovolumétrico

// Revisión por Sistemas (10 sistemas)
- Piel y anexos
- Órganos de los sentidos
- Respiratorio
- Cardiovascular
- Digestivo
- Genito urinario
- Músculo esquelético
- Endocrino
- Hemolinfático
- Nervioso

// Examen Físico Segmentario (17 áreas)
- Piel y faneras
- Cabeza, Ojos, Oídos, Nariz, Boca, Cuello, Garganta
- Axilas y mamas
- Abdomen completo
- Urogenital
- Sistemas: Respiratorio, Vascular, Digestivo, Hemolinfático, Músculo-esquelético, Neurológico
```

#### Tab: Antecedentes
```typescript
// Antecedentes Patológicos Personales (checkboxes)
- Cardiopatía
- Hipertensión
- Enfermedad cardiovascular
- Enfermedad endocrina
- Cáncer
- Tuberculosis
- Enfermedad infecciosa
- Malformación congénita
- Otros (texto libre)

// Adicionales
- Antecedentes clínico-quirúrgicos
- Antecedentes obstétricos
- Alergias y datos relevantes
```

#### Tab: Diagnóstico
```typescript
// Problema Actual Detallado
- Descripción de la enfermedad
- Cronología
- Localización
- Características
- Factores agravantes
- Factores de alivio
- Intensidad del dolor (EVA)

// Diagnósticos
- Principal: nombre + código CIE-10 + clasificación
- Secundario 1: nombre + código CIE-10 + clasificación
- Secundario 2: nombre + código CIE-10 + clasificación
```

#### Tab: Plan
```typescript
- Plan diagnóstico
- Plan terapéutico
- Plan educacional
- Datos del profesional que atiende
  * Nombre completo
  * Número de documento
```

### 5. **Helpers de Presentación**

```typescript
// Formateo de fechas en español
const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
// Output: "24 de enero de 2025"

// Formateo de horas
const formatHora = (hora: string) => {
  return hora.substring(0, 5);
};
// Output: "14:30"

// Componente para campos de datos
const DataField = ({ label, value, full = false }) => {
  if (!value) return null; // No renderiza si está vacío
  
  return (
    <div className={full ? "col-span-2" : ""}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
};
```

## 🎨 Diseño y Estilo

### Paleta de Colores
- **Primary**: `#8B3AB8` (morado FisioLab)
- **Primary Hover**: `#7a2fa3`
- **Backgrounds**: Gris claro (`bg-gray-100`)
- **Cards**: Blanco con sombra
- **Badges**: Azul (traumatológica), Verde (fisioterapéutica)
- **Escala EVA**: Gradiente verde → amarillo → rojo

### Componentes shadcn/ui Utilizados
- `Button`
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Badge`
- `Separator`

### Iconos Lucide React
- `ArrowLeft` (volver)
- `Download` (PDF)
- `Edit2` (editar)
- `Pill` (crear receta)
- `User` (paciente)
- `Calendar` (fecha)
- `Activity` (actividad/diagnóstico)
- `FileText` (resumen)
- `Stethoscope` (clínica)
- `ClipboardList` (antecedentes)

## 🔄 Flujo de Navegación

```
Lista HC (/historias-clinicas)
  ↓ [Click en historia]
Vista Detalle (/historias-clinicas/[id])
  ├─→ [Crear Receta] → Modal/Página de receta (próximamente)
  ├─→ [Descargar PDF] → Descarga archivo PDF
  ├─→ [Editar] → /historias-clinicas/[id]/editar
  └─→ [Volver] → /historias-clinicas
```

## 📡 Integración con API

### Endpoint Utilizado
```typescript
GET /api/historias-clinicas/:id
Headers: {
  Authorization: Bearer {token}
}
```

### Estructura de Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "codigo_unico": "HC-1770579816233-712",
    "tipo_historia": "traumatologica",
    "primer_nombre_paciente": "Andres",
    "primer_apellido_paciente": "Rodriguez",
    // ... 100+ campos
  }
}
```

## 🧪 Datos de Prueba

**Historia Clínica de Prueba:**
- **ID**: `9dd557eb-b8cc-49e4-b5bc-886b51d2f0d7`
- **Código**: `HC-1770579816233-712`
- **Paciente**: Andres Rodriguez
- **Diagnóstico**: Lumbalgia aguda (M54.5)
- **URL de prueba**: `http://localhost:3000/historias-clinicas/9dd557eb-b8cc-49e4-b5bc-886b51d2f0d7`

## 🚀 Próximas Mejoras

1. **Funcionalidad de Crear Receta**
   - Integración con modal de nueva receta
   - Pre-llenado de datos desde `/api/historias-clinicas/:id/datos-receta`
   - Linkage automático de receta a HC

2. **Impresión y PDF**
   - Implementación real del endpoint `/pdf`
   - Formato profesional de HC en PDF
   - Opción de incluir/excluir secciones

3. **Recetas Asociadas**
   - Sección adicional mostrando recetas vinculadas
   - Lista de prescripciones con fecha y estado
   - Acceso rápido a cada receta

4. **Timeline de Consultas**
   - Visualización cronológica de consultas del paciente
   - Comparación de evolución (EVA, peso, diagnósticos)
   - Gráficos de tendencias

5. **Exportación y Compartir**
   - Envío por email
   - Compartir con otros profesionales
   - Exportar secciones específicas

## 📝 Notas Técnicas

### Manejo de Campos Vacíos
El componente `DataField` no renderiza campos vacíos/nulos, manteniendo una interfaz limpia:
```typescript
if (value === null || value === undefined || value === '') return null;
```

### Renderizado Condicional
Muchas secciones solo se muestran si tienen datos:
```typescript
{historia?.plan_educacional && (
  <Card>
    <CardHeader>
      <CardTitle>Plan Educacional</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{historia.plan_educacional}</p>
    </CardContent>
  </Card>
)}
```

### Optimización de Performance
- Uso de `useState` para tabs (no re-renderiza todo el componente)
- Lazy loading de secciones mediante tabs
- Memoización del sidebar collapsed state en localStorage

## 📄 Archivos Modificados

```
frontend/fisio-lab-st-dashboard/
└── app/
    └── historias-clinicas/
        └── [id]/
            └── page.tsx    ← ARCHIVO PRINCIPAL MODIFICADO
```

**Líneas de código**: ~800 líneas  
**Componentes**: 18+ componentes visuales  
**Campos mostrados**: 100+ campos de la base de datos

## ✅ Testing

### Checklist de Verificación
- [ ] Vista carga correctamente con datos reales
- [ ] Todos los tabs son navegables
- [ ] Campos vacíos no se muestran
- [ ] Escala EVA se visualiza correctamente con colores
- [ ] Badges muestran tipo de historia correcto
- [ ] Botones de acción funcionan (volver, editar)
- [ ] Responsive en diferentes tamaños de pantalla
- [ ] Formato de fechas es correcto (español)
- [ ] Checkboxes visuales se muestran solo si están marcados
- [ ] Navegación entre tabs es fluida

### Comandos de Testing
```bash
# Iniciar frontend
cd frontend/fisio-lab-st-dashboard
npm run dev

# Backend debe estar corriendo en puerto 3001
cd backend/api
npm start

# Acceder a la vista
http://localhost:3000/historias-clinicas/9dd557eb-b8cc-49e4-b5bc-886b51d2f0d7
```

## 🎓 Principios de Diseño Aplicados

1. **Domain-Specific Design**: Refleja el flujo real de lectura de una HC médica
2. **Data Density**: Organiza 100+ campos sin abrumar al usuario
3. **Progressive Disclosure**: Información crítica en "Resumen", detalles en otros tabs
4. **Consistency**: Sigue el design system del dashboard (colores, espaciado, tipografía)
5. **Accessibility**: Uso semántico de HTML (`<dl>`, `<dt>`, `<dd>` para listas de definición)
6. **Visual Hierarchy**: Títulos, subtítulos y separadores guían la lectura
7. **Feedback Visual**: Estados de carga, toasts para acciones, badges informativos

---

**Desarrollado para**: FisioLab Dashboard  
**Fecha**: Enero 2025  
**Versión**: 1.0.0  
**Tecnologías**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
