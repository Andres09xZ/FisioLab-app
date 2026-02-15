'use client'

import React from 'react'
import { getEspecialidadInfo } from '@/lib/constants/especialidades'
import { Badge } from '@/components/ui/badge'

interface EspecialidadBadgeProps {
  especialidad: string | null | undefined
  className?: string
}

export const EspecialidadBadge: React.FC<EspecialidadBadgeProps> = ({ 
  especialidad,
  className = ''
}) => {
  if (!especialidad) {
    return (
      <Badge variant="secondary" className={className}>
        Sin especialidad
      </Badge>
    )
  }

  const esp = getEspecialidadInfo(especialidad)
  
  if (!esp) {
    return (
      <Badge variant="secondary" className={className}>
        {especialidad}
      </Badge>
    )
  }

  return (
    <Badge 
      className={`${className}`}
      style={{ 
        backgroundColor: esp.color, 
        color: '#fff',
        borderColor: esp.color
      }}
    >
      <span className="flex items-center gap-1">
        <span>{esp.icon}</span>
        <span>{esp.label}</span>
      </span>
    </Badge>
  )
}
