
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'; // Added ghost
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-azul-marinho focus:ring-opacity-70 transition-all duration-150 ease-in-out flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-azul-primario text-branco-nav hover:bg-azul-primario-hover focus:ring-azul-primario',
    secondary: 'bg-cinza-fundo-elemento text-branco-nav hover:bg-gray-700 focus:ring-azul-claro', // Adjusted for dark theme
    danger: 'bg-red-600 text-branco-nav hover:bg-red-700 focus:ring-red-500',
    outline: 'bg-transparent border border-azul-primario text-azul-primario hover:bg-azul-primario hover:text-branco-nav focus:ring-azul-primario',
    ghost: 'bg-transparent text-azul-primario hover:bg-blue-500/10 focus:ring-azul-primario', // For subtle actions
  };

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="flex items-center">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && !isLoading && <span className="flex items-center">{rightIcon}</span>}
    </button>
  );
};

export default Button;