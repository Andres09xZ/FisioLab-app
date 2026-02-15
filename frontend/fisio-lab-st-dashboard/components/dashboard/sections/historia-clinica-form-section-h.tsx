'use client';

import { Controller } from 'react-hook-form';
import type { FieldErrors, Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function HistoriaClinicaFormSectionH({ control, errors }: Props) {
  const seccionesExamen = [
    {
      titulo: 'Examen Regional',
      campos: [
        { field: 'examen_piel_panecas', label: 'Piel-Panecas' },
        { field: 'examen_cabeza', label: 'Cabeza' },
        { field: 'examen_ojos', label: 'Ojos' },
        { field: 'examen_oidos', label: 'Oídos' },
        { field: 'examen_nariz', label: 'Nariz' },
        { field: 'examen_cuello', label: 'Cuello' }
      ]
    },
    {
      titulo: 'Abdomen y Estructuras',
      campos: [
        { field: 'examen_boca', label: 'Boca' },
        { field: 'examen_garganta', label: 'Garganta' },
        { field: 'examen_abdomen', label: 'Abdomen' },
        { field: 'examen_axlas_mamas', label: 'Axilas-Mamas' },
        { field: 'examen_supereores', label: 'Superiores' }
      ]
    },
    {
      titulo: 'Examen de Sistemas',
      campos: [
        { field: 'examen_abdomen_completo', label: 'Abdomen Completo' },
        { field: 'examen_urogenital', label: 'Urogenital' },
        { field: 'examen_respiratorio', label: 'Respiratorio' },
        { field: 'examen_vascular', label: 'Vascular' },
        { field: 'examen_digestivo', label: 'Digestivo' },
        { field: 'examen_hemo_linfatico', label: 'Hemo-Linfático' },
        { field: 'examen_esqueletico', label: 'Esquelético' },
        { field: 'examen_neurologico', label: 'Neurológico' }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>H. Examen Físico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {seccionesExamen.map((seccion) => (
          <div key={seccion.titulo} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">{seccion.titulo}</h3>
            <div className="space-y-4">
              {seccion.campos.map(({ field, label }) => (
                <div key={field}>
                  <Label htmlFor={field}>{label}</Label>
                  <Controller
                    name={field as any}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Textarea
                        value={value}
                        onChange={onChange}
                        placeholder={`Hallazgos de ${label}`}
                        rows={2}
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
