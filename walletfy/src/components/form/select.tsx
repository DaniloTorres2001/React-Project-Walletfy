import * as React from 'react'

import { cn } from '@/lib/utils'
import { useField } from '@/hooks/form'

type SelectProps = React.ComponentProps<'select'> & {
  label?: string
  error?: string
  options: Array<{
    value: string
    label: string
  }>
}

function Select({ className, options, label, ...props }: SelectProps) {
  const fieldContext = useField()

  const error = props.error || fieldContext.errors[0]?.message

  const onBlur = props.onBlur || fieldContext.field?.handleBlur

  const value = props.value || fieldContext.field?.state.value

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <select
        data-slot="select"
        className={cn(
          'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
        )}
        {...props}
        onBlur={onBlur}
        value={value as string}
        onChange={(e) => {
          if (props.onChange) {
            props.onChange(e)
          } else if (fieldContext.field?.handleChange) {
            fieldContext.field.handleChange(e.target.value)
          }
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export { Select }
