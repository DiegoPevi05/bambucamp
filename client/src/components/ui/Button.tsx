import { cn } from '../../lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, FC } from 'react'

export const buttonVariants = cva(
  'active:scale-95 inline-flex items-center justify-center rounded-lg text-md transition-color focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:bg-gray-200 disabled:text-gray-500 font-primary',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-white hover:bg-fourth focus:ring-fourth',
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
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading}
      {...props}>
      {isLoading ? <Loader2 className='mr-2 text-secondary h-4 w-4 animate-spin' /> : null}
      {children}
    </button>
  )
}

export default Button
