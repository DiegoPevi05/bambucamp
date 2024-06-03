import { cn } from '../../lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, FC } from 'react'
import { useState } from 'react'

export const buttonVariants = cva(
  'active:scale-95 inline-flex items-center justify-center text-md transition-color focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:bg-gray-200 disabled:text-gray-500 font-tertiary group rounded-lg shadow-2xl',
  {
    variants: {
      variant: {
        default: 'bg-tertiary text-white hover:bg-primary focus:ring-fourth',
        dark: 'bg-primary text-white hover:bg-tertiary focus:ring-tertiary',
        ghost: 'bg-white border-2 text-primary border-primary hover:border-0 hover:bg-secondary hover:text-white focus:ring-secondary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-2',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button: FC<ButtonProps> = ({
  className,
  children,
  variant,
  isLoading,
  size,
  rightIcon,
  ...props
}) => {

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading}
      {...props}>
      {isLoading ? <Loader2 className='mr-2 text-secondary h-4 w-4 animate-spin' /> : null}
      {children}
      {rightIcon ? <div className="transform transition-transform group-hover:translate-x-2 duration-300">{rightIcon}</div> : null}
    </button>
  )
}

export default Button
