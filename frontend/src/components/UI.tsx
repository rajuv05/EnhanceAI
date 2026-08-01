import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  isLoading?: boolean
}

export const Button = ({ children, variant = 'primary', isLoading, className, ...props }: ButtonProps) => {
  const baseStyles = "px-6 py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"

  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    secondary: "bg-dark-lightest hover:bg-dark-lighter text-white",
    outline: "border border-primary text-primary hover:bg-primary hover:text-white"
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  )
}

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export const Card = ({ children, className, title }: CardProps) => {
  return (
    <div className={`bg-dark-lighter border border-dark-lightest rounded-xl p-6 ${className}`}>
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      {children}
    </div>
  )
}

export const Loader = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}
