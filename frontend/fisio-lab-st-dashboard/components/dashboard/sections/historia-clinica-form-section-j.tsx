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

export default function HistoriaClinicaFormSectionJ({ control, errors }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>J. Plan de Tratamiento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan diagnóstico */}
        <div>
          <Label htmlFor="plan_diagnostico">Plan Diagnóstico *</Label>
          <Controller
            name="plan_diagnostico"
            control={control}
            rules={{ required: 'Este campo es requerido' }}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Estudios y análisis solicitados"
                rows={4}
              />
            )}
          />
          {errors.plan_diagnostico && (
            <p className="text-sm text-red-500 mt-1">
              {errors.plan_diagnostico?.message?.toString()}
            </p>
          )}
        </div>

        {/* Plan terapéutico */}
        <div>
          <Label htmlFor="plan_terapeutico">Plan Terapéutico *</Label>
          <Controller
            name="plan_terapeutico"
            control={control}
            rules={{ required: 'Este campo es requerido' }}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Tratamiento a seguir, medicamentos, recomendaciones"
                rows={4}
              />
            )}
          />
          {errors.plan_terapeutico && (
            <p className="text-sm text-red-500 mt-1">
              {errors.plan_terapeutico?.message?.toString()}
            </p>
          )}
        </div>

        {/* Plan educacional */}
        <div>
          <Label htmlFor="plan_educacional">Plan Educacional</Label>
          <Controller
            name="plan_educacional"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Orientaciones, ejercicios en casa, cambios de estilo de vida"
                rows={4}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
