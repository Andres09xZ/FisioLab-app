'use client';

import { Controller } from 'react-hook-form';
import type { FieldErrors, Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Props {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function HistoriaClinicaFormSectionB({ control, errors }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>B. Motivo de Consulta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de consulta */}
        <div>
          <Label className="mb-3">Tipo de Consulta</Label>
          <Controller
            name="es_primera_consulta"
            control={control}
            render={({ field }) => (
              <RadioGroup value={field.value ? 'primera' : 'subsecuente'} onValueChange={(val) => field.onChange(val === 'primera')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="primera" id="primera" />
                  <Label htmlFor="primera">Primera Consulta</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subsecuente" id="subsecuente" />
                  <Label htmlFor="subsecuente">Consulta Subsecuente</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {/* Motivo de consulta */}
        <div>
          <Label htmlFor="motivo_consulta_primera">Motivo de Consulta *</Label>
          <Controller
            name="motivo_consulta_primera"
            control={control}
            rules={{ required: 'Este campo es requerido' }}
            render={({ field }) => (
              <Textarea {...field} placeholder="Describa el motivo de la consulta" rows={4} />
            )}
          />
        </div>

        {/* Motivo subsecuente */}
        <div>
          <Label htmlFor="motivo_consulta_subsecuente">Motivo Subsecuente</Label>
          <Controller
            name="motivo_consulta_subsecuente"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="Si es consulta subsecuente, describa el motivo" rows={3} />
            )}
          />
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fecha_consulta">Fecha de Consulta *</Label>
            <Controller
              name="fecha_consulta"
              control={control}
              rules={{ required: 'Este campo es requerido' }}
              render={({ field }) => (
                <Input {...field} type="date" />
              )}
            />
          </div>
          <div>
            <Label htmlFor="hora_consulta">Hora de Consulta *</Label>
            <Controller
              name="hora_consulta"
              control={control}
              rules={{ required: 'Este campo es requerido' }}
              render={({ field }) => (
                <Input {...field} type="time" />
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
