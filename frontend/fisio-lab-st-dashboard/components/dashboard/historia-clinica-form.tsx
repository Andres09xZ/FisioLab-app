'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import HistoriaClinicaFormSectionA from './sections/historia-clinica-form-section-a';
import HistoriaClinicaFormSectionB from './sections/historia-clinica-form-section-b';
import HistoriaClinicaFormSectionC from './sections/historia-clinica-form-section-c';
import HistoriaClinicaFormSectionE from './sections/historia-clinica-form-section-e';
import HistoriaClinicaFormSectionF from './sections/historia-clinica-form-section-f';
import HistoriaClinicaFormSectionG from './sections/historia-clinica-form-section-g';
import HistoriaClinicaFormSectionH from './sections/historia-clinica-form-section-h';
import HistoriaClinicaFormSectionI from './sections/historia-clinica-form-section-i';
import HistoriaClinicaFormSectionJ from './sections/historia-clinica-form-section-j';
import HistoriaClinicaFormSectionK from './sections/historia-clinica-form-section-k';

/**
 * ==========================================
 * HISTORIA CLÍNICA FORM - MAIN COMPONENT
 * ==========================================
 * Formulario principal para crear/editar historias clínicas
 * Contiene 10 secciones (A-K) con validación progresiva
 */

export function HistoriaClinicaForm({ 
  pacienteId, 
  doctorId, 
  historiaId = null, 
  onSuccess = null 
}: {
  pacienteId?: string | null,
  doctorId?: string | null,
  historiaId?: string | null,
  onSuccess?: (() => void) | null
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('seccion-a');
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Obtener rol del usuario
  useEffect(() => {
    const user = localStorage.getItem('fisiolab_user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserRole(parsedUser.role);
    }
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    getValues
  } = useForm<any>({
    defaultValues: {
      paciente_id: pacienteId,
      doctor_id: doctorId,
      // Sección A
      institucion_del_sistema: 'FisioLab',
      establecimiento_de_salud: '',
      primer_apellido_paciente: '',
      segundo_apellido_paciente: '',
      primer_nombre_paciente: '',
      segundo_nombre_paciente: '',
      sexo_paciente: 'M',
      edad_anos: '',
      // Sección B
      motivo_consulta_primera: '',
      motivo_consulta_subsecuente: '',
      es_primera_consulta: true,
      fecha_consulta: new Date().toISOString().split('T')[0],
      hora_consulta: new Date().toTimeString().slice(0, 5),
      // Sección C - Antecedentes
      antecedente_cardiopatia: false,
      antecedente_hipertension: false,
      antecedente_enf_cardiovascular: false,
      antecedente_endocrino: false,
      antecedente_cancer: false,
      antecedente_tuberculosis: false,
      antecedente_enf_infecciosa: false,
      antecedente_mal_formacion: false,
      antecedente_otro: '',
      datos_clinico_quirurgicos: '',
      datos_obstetricos: '',
      datos_alergicos_relevantes: '',
      // Sección E
      descripcion_enfermedad: '',
      cronologia: '',
      localizacion: '',
      caracteristicas: '',
      intensidad_eva: 5,
      factores_agravantes: '',
      factores_alivio: '',
      // Sección F
      fecha_constantes: new Date().toISOString().split('T')[0],
      hora_constantes: new Date().toTimeString().slice(0, 5),
      temperatura: '',
      presion_arterial_sistolica: '',
      presion_arterial_diastolica: '',
      pulso: '',
      frecuencia_respiratoria: '',
      peso: '',
      talla: '',
      imc: '',
      perimetro_abdominal: '',
      hemoglobina: '',
      glucosa_capilar: '',
      pleusovolumerico: '',
      // Sección G
      sistema_piel_anexos: false,
      sistema_organos_sentidos: false,
      sistema_respiratorio: false,
      sistema_cardiovascular: false,
      sistema_digestivo: false,
      sistema_genito_urinario: false,
      sistema_musculo_esqueletico: false,
      sistema_endocrino: false,
      sistema_hemo_linfatico: false,
      sistema_nervioso: false,
      hallazgos_sistemas: '',
      // Sección H
      examen_piel_panecas: '',
      examen_cabeza: '',
      examen_ojos: '',
      examen_oidos: '',
      examen_nariz: '',
      examen_cuello: '',
      examen_boca: '',
      examen_garganta: '',
      examen_abdomen: '',
      examen_axlas_mamas: '',
      examen_supereores: '',
      examen_abdomen_completo: '',
      examen_urogenital: '',
      examen_respiratorio: '',
      examen_vascular: '',
      examen_digestivo: '',
      examen_hemo_linfatico: '',
      examen_esqueletico: '',
      examen_neurologico: '',
      // Sección I
      diagnostico_principal: '',
      codigo_diagnostico_principal: '',
      clasificacion_principal: 'CK',
      diagnostico_secundario_1: '',
      codigo_diagnostico_secundario_1: '',
      clasificacion_secundario_1: 'CK',
      diagnostico_secundario_2: '',
      codigo_diagnostico_secundario_2: '',
      clasificacion_secundario_2: 'CK',
      // Sección J
      plan_diagnostico: '',
      plan_terapeutico: '',
      plan_educacional: '',
      // Sección K
      nombre_doctor: '',
      primer_apellido_doctor: '',
      segundo_apellido_doctor: '',
      numero_documento_doctor: '',
      firma_doctor: null,
      sello_doctor: null
    }
  });

  // Cargar historia existente si es edición
  const { data: historiaData } = useQuery({
    queryKey: ['historia-clinica', historiaId],
    queryFn: async () => {
      if (!historiaId) return null;
      const response = await fetch(`http://localhost:3001/api/historias-clinicas/${historiaId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('fisiolab_token')}`
        }
      });
      if (!response.ok) throw new Error('Error al cargar historia clínica');
      return response.json();
    },
    enabled: !!historiaId
  });

  // Resetear forma cuando carga datos
  useEffect(() => {
    if (historiaData?.data) {
      reset(historiaData.data);
    }
  }, [historiaData, reset]);

  // Mutation para crear/editar
  const { mutate: saveHistoria, isPending } = useMutation({
    mutationFn: async (formData: any) => {
      const url = historiaId ? `http://localhost:3001/api/historias-clinicas/${historiaId}` : 'http://localhost:3001/api/historias-clinicas';
      const method = historiaId ? 'PUT' : 'POST';

      // Agregar tipo de historia según el rol
      const dataToSend: any = {
        ...formData,
        tipo_historia: userRole === 'DOCTOR' ? 'traumatologica' : 'fisioterapeutica'
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('fisiolab_token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar historia clínica');
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      setLastSavedTime(new Date());
      toast({
        title: 'Éxito',
        description: historiaId
          ? 'Historia clínica actualizada correctamente'
          : 'Historia clínica creada correctamente',
        variant: 'default'
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Auto-save cada 30 segundos
  useEffect(() => {
    if (!autoSaveEnabled || isPending) return;

    const interval = setInterval(() => {
      const formData = getValues();
      // Validar campos obligatorios antes de auto-guardar
      if (formData.diagnostico_principal && formData.plan_terapeutico) {
        saveHistoria(formData);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoSaveEnabled, getValues, saveHistoria, isPending]);

  const onSubmit = (data: any) => {
    setIsSaving(true);
    saveHistoria(data);
    setIsSaving(false);
  };

  const sections = [
    {
      id: 'seccion-a',
      label: 'A. Datos',
      description: 'Información del establecimiento y paciente'
    },
    {
      id: 'seccion-b',
      label: 'B. Motivo',
      description: 'Motivo de la consulta'
    },
    {
      id: 'seccion-c',
      label: 'C. Antecedentes',
      description: 'Antecedentes patológicos'
    },
    {
      id: 'seccion-e',
      label: 'E. Enfermedad',
      description: 'Problema actual'
    },
    {
      id: 'seccion-f',
      label: 'F. Constantes',
      description: 'Vitales y antropometría'
    },
    {
      id: 'seccion-g',
      label: 'G. Sistemas',
      description: 'Revisión de órganos'
    },
    {
      id: 'seccion-h',
      label: 'H. Examen',
      description: 'Examen físico'
    },
    {
      id: 'seccion-i',
      label: 'I. Diagnóstico',
      description: 'Diagnósticos'
    },
    {
      id: 'seccion-j',
      label: 'J. Plan',
      description: 'Plan de tratamiento'
    },
    {
      id: 'seccion-k',
      label: 'K. Profesional',
      description: 'Datos del doctor'
    }
  ];  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Historia Clínica {historiaId ? '- Editar' : '- Nueva'}</CardTitle>
              <CardDescription>
                Complete el formulario en las 10 secciones disponibles
              </CardDescription>
            </div>
            {lastSavedTime && (
              <div className="text-xs text-muted-foreground">
                Último guardado: {lastSavedTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              {sections.map((section) => (
                <TabsTrigger key={section.id} value={section.id} className="text-xs">
                  {section.label.split('.')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* SECCIÓN A */}
            <TabsContent value="seccion-a">
              <HistoriaClinicaFormSectionA 
                control={control as any}
                errors={errors as any}
                onPacienteChange={(paciente) => {
                  // Llenar automáticamente los datos del paciente
                  const apellidos = paciente.apellidos.split(' ');
                  const nombres = paciente.nombres.split(' ');
                  
                  reset({
                    ...getValues(),
                    paciente_id: paciente.id,
                    primer_apellido_paciente: apellidos[0] || '',
                    segundo_apellido_paciente: apellidos[1] || '',
                    primer_nombre_paciente: nombres[0] || '',
                    segundo_nombre_paciente: nombres.slice(1).join(' ') || '',
                    sexo_paciente: (paciente.sexo === 'M' || paciente.sexo === 'F' || paciente.sexo === 'O') ? paciente.sexo : 'M',
                    edad_anos: paciente.edad.toString(),
                  } as any);
                }}
              />
            </TabsContent>

            {/* SECCIÓN B */}
            <TabsContent value="seccion-b">
              <HistoriaClinicaFormSectionB control={control as any} errors={errors as any} />
            </TabsContent>

            {/* SECCIÓN C */}
            <TabsContent value="seccion-c">
              <HistoriaClinicaFormSectionC control={control as any} errors={errors as any} />
            </TabsContent>

            {/* SECCIÓN E */}
            <TabsContent value="seccion-e">
              <HistoriaClinicaFormSectionE control={control as any} errors={errors as any} watch={watch} />
            </TabsContent>

            {/* SECCIÓN F */}
            <TabsContent value="seccion-f">
              <HistoriaClinicaFormSectionF control={control as any} errors={errors as any} watch={watch} />
            </TabsContent>

            {/* SECCIÓN G */}
            <TabsContent value="seccion-g">
              <HistoriaClinicaFormSectionG control={control as any} errors={errors as any} />
            </TabsContent>

            {/* SECCIÓN H */}
            <TabsContent value="seccion-h">
              <HistoriaClinicaFormSectionH control={control as any} errors={errors as any} />
            </TabsContent>

            {/* SECCIÓN I */}
            <TabsContent value="seccion-i">
              <HistoriaClinicaFormSectionI control={control as any} errors={errors as any} />
            </TabsContent>

            {/* SECCIÓN J */}
            <TabsContent value="seccion-j">
              <HistoriaClinicaFormSectionJ control={control as any} errors={errors as any} />
            </TabsContent>

            {/* SECCIÓN K */}
            <TabsContent value="seccion-k">
              <HistoriaClinicaFormSectionK control={control} errors={errors} doctorId={doctorId || ''} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoSave"
            checked={autoSaveEnabled}
            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
            className="rounded border border-gray-300"
          />
          <label htmlFor="autoSave" className="text-sm text-muted-foreground">
            Auto-guardar cada 30 segundos
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending || isSaving}>
            {isPending || isSaving ? 'Guardando...' : 'Guardar Historia Clínica'}
          </Button>
        </div>
      </div>
    </form>
  );
}
