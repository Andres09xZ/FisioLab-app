import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'placeholder:text-slate-500 focus-visible:border-cyan-600 focus-visible:ring-cyan-600/20',
        'aria-invalid:ring-red-600/20 aria-invalid:border-red-600',
        'flex field-sizing-content min-h-16 w-full rounded border border-slate-300 bg-white',
        'px-3 py-2 text-base transition-[color,border-color,box-shadow] outline-none',
        'focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
        'md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
