'use client';

import { Controller } from 'react-hook-form';
import type { FieldErrors, Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  control: Control<any>;
  errors: FieldErrors<any>;
  watch: any;
}

export default function HistoriaClinicaFormSectionF({ control, errors, watch }: Props) {
  const peso = watch('peso');
  const talla = watch('talla');
  const imc = peso && talla ? (peso / ((talla / 100) ** 2)).toFixed(2) : 'N/A';

  return (
    <Card>
      <CardHeader>
        <CardTitle>F. Constantes Vitales y Antropometría</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fecha y hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fecha_constantes">Fecha</Label>
            <Controller
              name="fecha_constantes"
              control={control}
              render={({ field }) => (
                <Input {...field} type="date" />
              )}
            />
          </div>
          <div>
            <Label htmlFor="hora_constantes">Hora</Label>
            <Controller
              name="hora_constantes"
              control={control}
              render={({ field }) => (
                <Input {...field} type="time" />
              )}
            />
          </div>
        </div>

        {/* Vitales */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Vitales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="temperatura">Temperatura (°C)</Label>
              <Controller
                name="temperatura"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" step="0.1" placeholder="36.5" />
                )}
              />
            </div>
            <div>
              <Label htmlFor="pulso">Pulso (x/min)</Label>
              <Controller
                name="pulso"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="72" />
                )}
              />
            </div>
            <div>
              <Label htmlFor="presion_arterial_sistolica">Presión Sistólica (mmHg)</Label>
              <Controller
                name="presion_arterial_sistolica"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="120" />
                )}
              />
            </div>
            <div>
              <Label htmlFor="presion_arterial_diastolica">Presión Diastólica (mmHg)</Label>
              <Controller
                name="presion_arterial_diastolica"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="80" />
                )}
              />
            </div>
            <div>
              <Label htmlFor="frecuencia_respiratoria">Frecuencia Respiratoria (/min)</Label>
              <Controller
                name="frecuencia_respiratoria"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="18" />
                )}
              />
            </div>
          </div>
        </div>

        {/* Antropometría */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Antropometría</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="peso">Peso (Kg) *</Label>
              <Controller
                name="peso"
                control={control}
                rules={{ required: 'Este campo es requerido' }}
                render={({ field }) => (
                  <Input {...field} type="number" step="0.1" placeholder="70" />
                )}
              />
            </div>
            <div>
              <Label htmlFor="talla">Talla (cm) *</Label>
              <Controller
                name="talla"
                control={control}
                rules={{ required: 'Este campo es requerido' }}
                render={({ field }) => (
                  <Input {...field} type="number" step="0.1" placeholder="175" />
                )}
              />
            </div>
            <div>
              <Label htmlFor="imc">IMC (Kg/m²) - Auto</Label>
              <Input disabled className="bg-gray-100" value={imc} />
            </div>
            <div>
              <Label htmlFor="perimetro_abdominal">Perímetro Abdominal (cm)</Label>
              <Controller
                name="perimetro_abdominal"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" step="0.1" placeholder="90" />
                )}
              />
            </div>
          </div>
        </div>

        {/* Laboratorios */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Laboratorios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hemoglobina">Hemoglobina (g/dl)</Label>
              <Controller
                name="hemoglobina"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" step="0.1" placeholder="14.5" />
                )}
              />
            </div>
            <div>
              <Label htmlFor="glucosa_capilar">Glucosa Capilar (g/dl)</Label>
              <Controller
                name="glucosa_capilar"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" step="0.1" placeholder="100" />
                )}
              />
            </div>
            <div>
              <Label htmlFor="pleusovolumerico">Pleusovolumétrico (%)</Label>
              <Controller
                name="pleusovolumerico"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="number" step="0.1" placeholder="98" />
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
