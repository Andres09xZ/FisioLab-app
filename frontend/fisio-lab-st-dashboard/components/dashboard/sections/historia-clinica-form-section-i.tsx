'use client';

import { Controller } from 'react-hook-form';
import type { FieldErrors, Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function HistoriaClinicaFormSectionI({ control, errors }: Props) {
  const clasificaciones = ['CK', 'FME', 'IMF'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>I. Diagnóstico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Diagnóstico principal */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Diagnóstico Principal *</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="diagnostico_principal">Diagnóstico</Label>
              <Controller
                name="diagnostico_principal"
                control={control}
                rules={{ required: 'Este campo es requerido' }}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Diagnóstico principal" rows={2} />
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo_diagnostico_principal">Código CIE-10</Label>
                <Controller
                  name="codigo_diagnostico_principal"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="M54.5" />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="clasificacion_principal">Clasificación</Label>
                <Controller
                  name="clasificacion_principal"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clasificaciones.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Diagnóstico secundario 1 */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Diagnóstico Secundario 1</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="diagnostico_secundario_1">Diagnóstico</Label>
              <Controller
                name="diagnostico_secundario_1"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Diagnóstico secundario 1" rows={2} />
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo_diagnostico_secundario_1">Código CIE-10</Label>
                <Controller
                  name="codigo_diagnostico_secundario_1"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="M62.8" />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="clasificacion_secundario_1">Clasificación</Label>
                <Controller
                  name="clasificacion_secundario_1"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clasificaciones.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Diagnóstico secundario 2 */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Diagnóstico Secundario 2</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="diagnostico_secundario_2">Diagnóstico</Label>
              <Controller
                name="diagnostico_secundario_2"
                control={control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Diagnóstico secundario 2" rows={2} />
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo_diagnostico_secundario_2">Código CIE-10</Label>
                <Controller
                  name="codigo_diagnostico_secundario_2"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="" />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="clasificacion_secundario_2">Clasificación</Label>
                <Controller
                  name="clasificacion_secundario_2"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clasificaciones.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
