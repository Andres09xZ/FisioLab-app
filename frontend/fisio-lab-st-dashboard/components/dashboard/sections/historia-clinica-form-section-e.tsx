'use client';

import { Controller } from 'react-hook-form';
import type { FieldErrors, Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

interface Props {
  control: Control<any>;
  errors: FieldErrors<any>;
  watch: any;
}

export default function HistoriaClinicaFormSectionE({ control, errors, watch }: Props) {
  const intensidadEva = watch('intensidad_eva') || 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle>E. Enfermedad o Problema Actual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Descripción */}
        <div>
          <Label htmlFor="descripcion_enfermedad">Descripción del Problema *</Label>
          <Controller
            name="descripcion_enfermedad"
            control={control}
            rules={{ required: 'Este campo es requerido' }}
            render={({ field }) => (
              <Textarea {...field} placeholder="Describa detalladamente el problema" rows={4} />
            )}
          />
        </div>

        {/* Cronología */}
        <div>
          <Label htmlFor="cronologia">Cronología *</Label>
          <Controller
            name="cronologia"
            control={control}
            rules={{ required: 'Este campo es requerido' }}
            render={({ field }) => (
              <Input {...field} placeholder="Tiempo de evolución (ej: desde hace 2 meses)" />
            )}
          />
        </div>

        {/* Localización */}
        <div>
          <Label htmlFor="localizacion">Localización Anatómica *</Label>
          <Controller
            name="localizacion"
            control={control}
            rules={{ required: 'Este campo es requerido' }}
            render={({ field }) => (
              <Input {...field} placeholder="Ubicación del problema" />
            )}
          />
        </div>

        {/* Características */}
        <div>
          <Label htmlFor="caracteristicas">Características del Problema *</Label>
          <Controller
            name="caracteristicas"
            control={control}
            rules={{ required: 'Este campo es requerido' }}
            render={({ field }) => (
              <Textarea {...field} placeholder="Intensidad, tipo, duración, etc." rows={3} />
            )}
          />
        </div>

        {/* Escala EVA */}
        <div>
          <Label>Intensidad del Dolor (EVA): {intensidadEva}/10</Label>
          <Controller
            name="intensidad_eva"
            control={control}
            rules={{
              required: 'Este campo es requerido',
              min: { value: 0, message: 'Mínimo 0' },
              max: { value: 10, message: 'Máximo 10' }
            }}
            render={({ field }) => (
              <div className="pt-2">
                <Slider
                  value={[field.value]}
                  onValueChange={(val) => field.onChange(val[0])}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Sin dolor</span>
                  <span>Dolor máximo</span>
                </div>
              </div>
            )}
          />
        </div>

        {/* Factores agravantes */}
        <div>
          <Label htmlFor="factores_agravantes">Factores Agravantes</Label>
          <Controller
            name="factores_agravantes"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="¿Qué empeora el problema?" rows={2} />
            )}
          />
        </div>

        {/* Factores de alivio */}
        <div>
          <Label htmlFor="factores_alivio">Factores de Alivio</Label>
          <Controller
            name="factores_alivio"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="¿Qué mejora el problema?" rows={2} />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
