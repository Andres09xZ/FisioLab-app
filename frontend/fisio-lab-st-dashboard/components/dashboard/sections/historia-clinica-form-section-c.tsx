'use client';

import { Controller } from 'react-hook-form';
import type { FieldErrors, Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function HistoriaClinicaFormSectionC({ control, errors }: Props) {
  const antecedentes = [
    { field: 'antecedente_cardiopatia', label: 'Cardiopatía' },
    { field: 'antecedente_hipertension', label: 'Hipertensión' },
    { field: 'antecedente_enf_cardiovascular', label: 'Enfermedad Cardiovascular' },
    { field: 'antecedente_endocrino', label: 'Endocrino (Diabetes)' },
    { field: 'antecedente_cancer', label: 'Cáncer' },
    { field: 'antecedente_tuberculosis', label: 'Tuberculosis' },
    { field: 'antecedente_enf_infecciosa', label: 'Enfermedad Infecciosa' },
    { field: 'antecedente_mal_formacion', label: 'Mal de Formación' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>C. Antecedentes Patológicos Personales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Checkboxes de antecedentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {antecedentes.map(({ field, label }) => (
            <div key={field} className="flex items-center space-x-2">
              <Controller
                name={field as any}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <>
                    <Checkbox
                      id={field}
                      checked={value}
                      onCheckedChange={onChange}
                    />
                    <Label htmlFor={field} className="font-normal cursor-pointer">
                      {label}
                    </Label>
                  </>
                )}
              />
            </div>
          ))}
        </div>

        {/* Otros antecedentes */}
        <div>
          <Label htmlFor="antecedente_otro">Otros Antecedentes</Label>
          <Controller
            name="antecedente_otro"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="Especifique otros antecedentes" rows={2} />
            )}
          />
        </div>

        {/* Datos clínico-quirúrgicos */}
        <div className="border-t pt-4">
          <Label htmlFor="datos_clinico_quirurgicos">Datos Clínico-Quirúrgicos</Label>
          <Controller
            name="datos_clinico_quirurgicos"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="Registre datos clínico-quirúrgicos relevantes" rows={2} />
            )}
          />
        </div>

        {/* Datos obstétricos */}
        <div>
          <Label htmlFor="datos_obstetricos">Datos Obstétricos (si aplica)</Label>
          <Controller
            name="datos_obstetricos"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="Registre datos obstétricos si es aplicable" rows={2} />
            )}
          />
        </div>

        {/* Datos alérgicos */}
        <div>
          <Label htmlFor="datos_alergicos_relevantes">Datos Alérgicos Relevantes</Label>
          <Controller
            name="datos_alergicos_relevantes"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="Registre alergias y reacciones adversas" rows={2} />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
