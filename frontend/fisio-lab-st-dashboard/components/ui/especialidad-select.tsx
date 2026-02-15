'use client'

import React from 'react'
import { ESPECIALIDADES } from '@/lib/constants/especialidades'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EspecialidadSelectProps {
  value: string | null
  onChange: (value: string | null) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
}

export const EspecialidadSelect: React.FC<EspecialidadSelectProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Seleccionar especialidad'
}) => {
  return (
    <Select
      value={value || 'none'}
      onValueChange={(val) => onChange(val === 'none' ? null : val)}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {!required && (
          <SelectItem value="none">Sin especialidad</SelectItem>
        )}
        {ESPECIALIDADES.map((esp) => (
          <SelectItem key={esp.value} value={esp.value}>
            <span className="flex items-center gap-2">
              <span>{esp.icon}</span>
              <span>{esp.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
