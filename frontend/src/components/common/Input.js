import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';

const Input = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  helperText = '',
  isRequired = false,
  isDisabled = false,
  isReadOnly = false,
  leftIcon,
  rightIcon,
  className = '',
  inputClassName = '',
  ...rest
}) => {
  const baseClasses = `block w-full rounded-md shadow-sm border-${error ? 'red' : 'gray'}-300 focus:ring-${error ? 'red' : 'indigo'}-500 focus:border-${error ? 'red' : 'indigo'}-500 sm:text-sm`;
  const disabledClasses = isDisabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white';
  const errorClasses = error ? 'border-red-300 text-red-900 placeholder-red-300' : 'border-gray-300';
  const readOnlyClasses = isReadOnly ? 'bg-gray-50' : '';

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          readOnly={isReadOnly}
          className={`${baseClasses} ${disabledClasses} ${errorClasses} ${readOnlyClasses} ${leftIcon ? 'pl-10' : 'pl-3'} ${rightIcon ? 'pr-10' : 'pr-3'} py-2 ${inputClassName}`}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-description` : undefined}
          {...rest}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500" id={`${name}-description`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'search']),
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  helperText: PropTypes.string,
  isRequired: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
};

export default Input;
