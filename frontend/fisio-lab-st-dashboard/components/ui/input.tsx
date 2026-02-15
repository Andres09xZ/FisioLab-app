import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
        'h-9 w-full min-w-0 rounded-md border border-[rgba(0,0,0,0.08)] bg-surface-100',
        'px-3 py-2 text-base transition-[color,border-color,box-shadow,background-color] duration-200',
        'outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:bg-surface-50',
        'aria-invalid:ring-destructive/30 dark:aria-invalid:ring-destructive/50 aria-invalid:border-destructive',
        'dark:bg-input/40 dark:border-input/60 dark:focus-visible:bg-input/50',
        'md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
