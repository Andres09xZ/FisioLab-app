'use client';

import { Controller } from 'react-hook-form';
import type { FieldErrors, Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  control: Control<any>;
  errors: FieldErrors<any>;
  doctorId?: string;
}

export default function HistoriaClinicaFormSectionK({ control, errors, doctorId }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>K. Datos del Profesional Responsable</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fecha y hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fecha_consulta_registro">Fecha de Consulta</Label>
            <Controller
              name="fecha_consulta"
              control={control}
              render={({ field }) => (
                <Input {...field} type="date" disabled className="bg-gray-100" />
              )}
            />
          </div>
          <div>
            <Label htmlFor="hora_consulta_registro">Hora de Consulta</Label>
            <Controller
              name="hora_consulta"
              control={control}
              render={({ field }) => (
                <Input {...field} type="time" disabled className="bg-gray-100" />
              )}
            />
          </div>
        </div>

        {/* Datos del doctor */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Datos del Doctor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre_doctor">Nombre del Doctor *</Label>
              <Controller
                name="nombre_doctor"
                control={control}
                rules={{ required: 'Este campo es requerido' }}
                render={({ field }) => (
                  <Input {...field} placeholder="Nombre" />
                )}
              />
              {errors.nombre_doctor && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.nombre_doctor?.message?.toString()}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="primer_apellido_doctor">Primer Apellido *</Label>
              <Controller
                name="primer_apellido_doctor"
                control={control}
                rules={{ required: 'Este campo es requerido' }}
                render={({ field }) => (
                  <Input {...field} placeholder="Apellido" />
                )}
              />
              {errors.primer_apellido_doctor && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.primer_apellido_doctor?.message?.toString()}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="segundo_apellido_doctor">Segundo Apellido</Label>
              <Controller
                name="segundo_apellido_doctor"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Segundo apellido (opcional)" />
                )}
              />
            </div>

            <div>
              <Label htmlFor="numero_documento_doctor">Documento/Cédula *</Label>
              <Controller
                name="numero_documento_doctor"
                control={control}
                rules={{ required: 'Este campo es requerido' }}
                render={({ field }) => (
                  <Input {...field} placeholder="Número de documento" />
                )}
              />
              {errors.numero_documento_doctor && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.numero_documento_doctor?.message?.toString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Firma y sello */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Firma y Sello</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firma_doctor">Firma Digital</Label>
              <Controller
                name="firma_doctor"
                control={control}
                render={({ field }) => (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-2">Clic para cargar firma</p>
                    <Input
                      {...field}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="firma_doctor"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('firma_doctor')?.click()}
                    >
                      Cargar Firma
                    </Button>
                  </div>
                )}
              />
            </div>

            <div>
              <Label htmlFor="sello_doctor">Sello Profesional</Label>
              <Controller
                name="sello_doctor"
                control={control}
                render={({ field }) => (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-2">Clic para cargar sello</p>
                    <Input
                      {...field}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="sello_doctor"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('sello_doctor')?.click()}
                    >
                      Cargar Sello
                    </Button>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Esta historia clínica será guardada con la información del doctor autenticado. Todos los datos serán registrados y auditable.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
