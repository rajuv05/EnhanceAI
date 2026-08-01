import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', isLoading, className, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"

    const variants = {
      primary: "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20",
      secondary: "bg-dark-lightest text-white hover:bg-dark-lighter border border-dark-lightest",
      outline: "border-2 border-primary/20 text-primary hover:bg-primary/10 hover:border-primary",
      ghost: "text-gray-400 hover:text-white hover:bg-dark-lightest",
      danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
    }

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg"
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Please wait</span>
          </>
        ) : children}
      </button>
    )
  }
)

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  noPadding?: boolean
}

export const Card = ({ children, className, title, subtitle, noPadding }: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={cn(
        "bg-dark-lighter border border-dark-lightest rounded-2xl overflow-hidden shadow-xl shadow-black/20",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-dark-lightest">
          {title && <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-1 font-medium">{subtitle}</p>}
        </div>
      )}
      <div className={cn(!noPadding && "p-6")}>
        {children}
      </div>
    </motion.div>
  )
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-dark-lightest bg-dark px-4 py-2 text-base text-white ring-offset-dark file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

export const Badge = ({ children, className, variant = 'neutral' }: { children: React.ReactNode, className?: string, variant?: 'success' | 'danger' | 'warning' | 'primary' | 'neutral' }) => {
  const variants = {
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    primary: "bg-primary/10 text-primary border-primary/20",
    neutral: "bg-dark-lightest text-gray-400 border-dark-lightest"
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn(
      "rounded-xl skeleton-shimmer",
      className
    )} />
  )
}

export const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center py-12 space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-gray-500 font-medium animate-pulse">Loading amazing things...</p>
    </div>
  )
}
