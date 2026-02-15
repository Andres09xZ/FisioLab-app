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

export default function HistoriaClinicaFormSectionG({ control, errors }: Props) {
  const sistemas = [
    { field: 'sistema_piel_anexos', label: 'Piel - Anexos' },
    { field: 'sistema_organos_sentidos', label: 'Órganos de los Sentidos' },
    { field: 'sistema_respiratorio', label: 'Respiratorio' },
    { field: 'sistema_cardiovascular', label: 'Cardio-Vascular' },
    { field: 'sistema_digestivo', label: 'Digestivo' },
    { field: 'sistema_genito_urinario', label: 'Genito-Urinario' },
    { field: 'sistema_musculo_esqueletico', label: 'Músculo-Esquelético' },
    { field: 'sistema_endocrino', label: 'Endocrino' },
    { field: 'sistema_hemo_linfatico', label: 'Hemo-Linfático' },
    { field: 'sistema_nervioso', label: 'Nervioso' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>G. Revisión Actual de Órganos y Sistemas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-4 block">Marque los sistemas con patología presente</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sistemas.map(({ field, label }) => (
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
        </div>

        {/* Hallazgos relevantes */}
        <div className="border-t pt-4">
          <Label htmlFor="hallazgos_sistemas">Hallazgos Relevantes</Label>
          <Controller
            name="hallazgos_sistemas"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="Describa hallazgos relevantes de los sistemas" rows={4} />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
