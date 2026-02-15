// Constantes de especialidades de fisioterapia
export const ESPECIALIDADES = [
  { value: 'Traumatologia', label: 'Traumatología', icon: '🦴', color: '#FF6B6B' },
  { value: 'Neurologia', label: 'Neurología', icon: '🧠', color: '#4ECDC4' },
  { value: 'Deportologia', label: 'Deportología', icon: '⚽', color: '#45B7D1' },
  { value: 'Pediatria', label: 'Pediatría', icon: '👶', color: '#FFA07A' },
  { value: 'Geriatria', label: 'Geriatría', icon: '👴', color: '#98D8C8' }
] as const;

export type EspecialidadValue = typeof ESPECIALIDADES[number]['value'];

// Función helper para obtener información de una especialidad
export const getEspecialidadInfo = (value: string | null) => {
  if (!value) return null;
  return ESPECIALIDADES.find(esp => esp.value === value);
};

// Validar si una especialidad es válida
export const isEspecialidadValida = (value: string | null): boolean => {
  if (!value) return true; // null es válido
  return ESPECIALIDADES.some(esp => esp.value === value);
};
