import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  className = '',
  ...rest
}) => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  // Size variants
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base',
  };

  // Color variants
  const variantClasses = {
    primary: `bg-${theme.colors.primary[500]} text-white hover:bg-${theme.colors.primary[600]} focus:ring-${theme.colors.primary[500]}`,
    secondary: `bg-${theme.colors.secondary[500]} text-white hover:bg-${theme.colors.secondary[600]} focus:ring-${theme.colors.secondary[500]}`,
    outline: `border border-${theme.colors.gray[300]} bg-white text-${theme.colors.gray[700]} hover:bg-${theme.colors.gray[50]} focus:ring-${theme.colors.primary[500]}`,
    ghost: `text-${theme.colors.gray[700]} hover:bg-${theme.colors.gray[100]} focus:ring-${theme.colors.primary[500]}`,
    danger: `bg-${theme.colors.error[500]} text-white hover:bg-${theme.colors.error[600]} focus:ring-${theme.colors.error[500]}`,
    success: `bg-${theme.colors.success[500]} text-white hover:bg-${theme.colors.success[600]} focus:ring-${theme.colors.success[500]}`,
  };

  // Disabled state
  const disabledClasses = isDisabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // Full width
  const fullWidthClass = isFullWidth ? 'w-full' : '';

  // Loading state
  const loadingClasses = isLoading ? 'opacity-70 cursor-wait' : '';

  return (
    <button
      type="button"
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${loadingClasses} ${fullWidthClass} ${className}`}
      disabled={isDisabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  isFullWidth: PropTypes.bool,
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
};

export default Button;
