import { cn } from '../../lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import { InputHTMLAttributes, FC } from 'react'
import Check from "../../assets/images/svg/check.svg?react";

export const radioVariants = cva(
  'active:scale-105',
  {
    variants: {
      effect: {
        slide: 'input',
        default: '',
      },
      variant: {
        default: 'input-primary',
        dark: 'input-dark',
        light: 'input-light',
      },
      isRound: {
        true: 'rounded-md',
        false: '',
      },
    },
    defaultVariants: {
      effect: 'slide',
      variant: 'default',
    },
  }
)

export interface RadioProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof radioVariants> {
  rightIcon?: React.ReactNode
  labelVisible?:boolean;
}

export const InputRadio: FC<RadioProps> = ({
  className,
  variant,
  effect,
  isRound,
  rightIcon,
  labelVisible,
  ...props
}) => {
  const id = props.id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label htmlFor={id} className={cn(radioVariants({ variant, effect, isRound, className }), 'flex items-center cursor-pointer')}>
      <input
        type="radio"
        id={id}
        className="hidden"
        {...props}
      />
      <span className="flex justify-center items-center gap-x-2 px-4 py-2 h-8 sm:h-10">
        <div className={`${labelVisible ? "flex" : "hidden sm:flex" }  p-0 m-0`}>
          {props.placeholder}
        </div>
        {rightIcon && <div className="px-4 sm:p-0 transform transition-transform group-hover:translate-x-2 duration-300">{rightIcon}</div>}
      </span>
      <div className="checkIcon"> 
        <Check className="h-4 w-4"/>
      </div>
    </label>
  )
}

