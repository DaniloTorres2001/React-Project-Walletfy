import React from 'react'

import { cn } from '@/lib/utils'

type SubmitButtonProps = React.ComponentProps<'button'> & {
  text?: string
  loading?: boolean
}

const SubmitButton = (props: SubmitButtonProps) => {
  const { text, loading, className, ...rest } = props

  const loadingText = 'Loading...'
  const buttonText = loading ? loadingText : text

  return (
    <button
      type="submit"
      data-slot="submit"
      className={cn(
        'bg-blue-500 text-white font-bold py-2 px-4 rounded',
        'hover:bg-blue-700 focus:outline-none focus:shadow-outline',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition duration-150 ease-in-out',
        'flex items-center justify-center',
        'w-full',
        loading &&
          'cursor-not-allowed opacity-50 transition-opacity duration-150 ease-in-out shadow-none',
        className,
      )}
      {...rest}
    >
      {buttonText}
    </button>
  )
}

export default SubmitButton
