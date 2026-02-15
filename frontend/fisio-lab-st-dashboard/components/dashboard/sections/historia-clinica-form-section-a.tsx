'use client';

import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import type { FieldErrors, Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  sexo: string;
  edad: number;
  documento: string;
  email: string;
  celular: string;
}

interface FormData {
  paciente_id?: string;
  institucion_del_sistema: string;
  establecimiento_de_salud: string;
  primer_apellido_paciente: string;
  segundo_apellido_paciente?: string;
  primer_nombre_paciente: string;
  segundo_nombre_paciente?: string;
  sexo_paciente: 'M' | 'F' | 'O';
  edad_anos: number;
  [key: string]: any;
}

interface Props {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  onPacienteChange?: (paciente: Paciente) => void;
}

const getErrorMessage = (error: any): string | null => {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error.message && typeof error.message === 'string') return error.message;
  return null;
};

export default function HistoriaClinicaFormSectionA({ control, errors, onPacienteChange }: Props) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/pacientes');
        const result = await response.json();
        if (result.success && result.data) {
          setPacientes(result.data);
        }
      } catch (error) {
        console.error('Error al cargar pacientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);
  return (
    <Card>
      <CardHeader>
        <CardTitle>A. Datos del Establecimiento y Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector de Paciente */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Label htmlFor="paciente_id" className="text-blue-900 font-semibold">Seleccionar Paciente Registrado *</Label>
          <Controller
            name="paciente_id"
            control={control}
            rules={{ required: 'Debes seleccionar un paciente' }}
            render={({ field }) => (
              <Select 
                value={field.value || ''} 
                onValueChange={(value) => {
                  field.onChange(value);
                  const paciente = pacientes.find(p => p.id === value);
                  if (paciente) {
                    // Dividir nombres y apellidos
                    const apellidos = paciente.apellidos.split(' ');
                    const nombres = paciente.nombres.split(' ');
                    
                    onPacienteChange?.(paciente);
                  }
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={loading ? "Cargando pacientes..." : "Selecciona un paciente"} />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map(paciente => (
                    <SelectItem key={paciente.id} value={paciente.id}>
                      {paciente.nombres} {paciente.apellidos} - {paciente.documento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.paciente_id && (
            <p className="text-sm text-red-500 mt-1">
              {getErrorMessage(errors.paciente_id)}
            </p>
          )}
        </div>

        {/* Institución y establecimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="institucion_del_sistema">Institución del Sistema</Label>
            <Controller
              name="institucion_del_sistema"
              control={control}
              rules={{ required: 'Este campo es requerido' }}
              render={({ field }) => (
                <Input {...field} disabled className="bg-gray-100" />
              )}
            />
            {errors.institucion_del_sistema && (
              <p className="text-sm text-red-500">
                {getErrorMessage(errors.institucion_del_sistema)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="establecimiento_de_salud">Establecimiento de Salud</Label>
            <Controller
              name="establecimiento_de_salud"
              control={control}
              rules={{ required: 'Este campo es requerido' }}
              render={({ field }) => (
                <Input {...field} placeholder="Nombre del establecimiento" />
              )}
            />
            {errors.establecimiento_de_salud && (
              <p className="text-sm text-red-500">
                {getErrorMessage(errors.establecimiento_de_salud)}
              </p>
            )}
          </div>
        </div>

        {/* Datos del paciente */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Datos del Paciente</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primer_apellido_paciente">Primer Apellido *</Label>
              <Controller
                name="primer_apellido_paciente"
                control={control}
                rules={{ required: 'Este campo es requerido' }}
                render={({ field }) => (
                  <Input {...field} placeholder="Apellido" disabled className="bg-gray-100" />
                )}
              />
              {errors.primer_apellido_paciente && (
                <p className="text-sm text-red-500">
                  {getErrorMessage(errors.primer_apellido_paciente)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="segundo_apellido_paciente">Segundo Apellido</Label>
              <Controller
                name="segundo_apellido_paciente"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Segundo apellido (opcional)" disabled className="bg-gray-100" />
                )}
              />
            </div>

            <div>
              <Label htmlFor="primer_nombre_paciente">Primer Nombre *</Label>
              <Controller
                name="primer_nombre_paciente"
                control={control}
                rules={{ required: 'Este campo es requerido' }}
                render={({ field }) => (
                  <Input {...field} placeholder="Nombre" disabled className="bg-gray-100" />
                )}
              />
              {errors.primer_nombre_paciente && (
                <p className="text-sm text-red-500">
                  {getErrorMessage(errors.primer_nombre_paciente)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="segundo_nombre_paciente">Segundo Nombre</Label>
              <Controller
                name="segundo_nombre_paciente"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Segundo nombre (opcional)" disabled className="bg-gray-100" />
                )}
              />
            </div>
          </div>

          {/* Sexo y edad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="sexo_paciente">Sexo *</Label>
              <Controller
                name="sexo_paciente"
                control={control}
                rules={{ required: 'Este campo es requerido' }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled>
                    <SelectTrigger className="bg-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.sexo_paciente && (
                <p className="text-sm text-red-500">
                  {getErrorMessage(errors.sexo_paciente)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edad_anos">Edad (años) *</Label>
              <Controller
                name="edad_anos"
                control={control}
                rules={{
                  required: 'Este campo es requerido',
                  min: { value: 0, message: 'La edad no puede ser negativa' },
                  max: { value: 150, message: 'Edad inválida' }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    max="150"
                    placeholder="Edad"
                    value={field.value || ''}
                    disabled
                    className="bg-gray-100"
                  />
                )}
              />
              {errors.edad_anos && (
                <p className="text-sm text-red-500">
                  {getErrorMessage(errors.edad_anos)}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="numero_historia_clinica_unica">Número HC (auto)</Label>
              <Input disabled className="bg-gray-100" placeholder="Se asigna automáticamente" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
