import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';

const Card = ({
  children,
  title,
  subtitle,
  header,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  hoverable = false,
  shadow = 'md',
  rounded = 'md',
  border = true,
  ...rest
}) => {
  // Shadow classes
  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    inner: 'shadow-inner',
  };

  // Rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  };

  // Border classes
  const borderClasses = border ? 'border border-gray-200' : 'border-0';

  // Hover effect
  const hoverClasses = hoverable
    ? 'transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg'
    : '';

  return (
    <div
      className={`bg-white ${borderClasses} ${roundedClasses[rounded]} ${shadowClasses[shadow]} overflow-hidden ${hoverClasses} ${className}`}
      {...rest}
    >
      {/* Header */}
      {header || title || subtitle ? (
        <div
          className={`px-6 py-4 border-b border-gray-200 ${headerClassName}`}
        >
          {header || (
            <>
              {title && (
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </>
          )}
        </div>
      ) : null}

      {/* Body */}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div
          className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${footerClassName}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  header: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  hoverable: PropTypes.bool,
  shadow: PropTypes.oneOf([
    'none',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
    'inner',
  ]),
  rounded: PropTypes.oneOf([
    'none',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
    '3xl',
    'full',
  ]),
  border: PropTypes.bool,
};

Card.defaultProps = {
  shadow: 'md',
  rounded: 'md',
  border: true,
};

export default Card;
