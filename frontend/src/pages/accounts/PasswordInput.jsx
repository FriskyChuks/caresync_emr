import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordInput = ({
  id = 'password',
  label = 'Password',
  value,
  onChange,
  placeholder = 'Enter your password',
  required = true,
  helperText = 'Password must be at least 8 characters long',
  disabled = false,
  error = false,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          className={`
            w-full pl-11 pr-12 py-3 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
            placeholder:text-gray-400
          `}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`
            absolute right-3 top-1/2 transform -translate-y-1/2
            h-8 w-8 rounded-lg flex items-center justify-center
            transition-colors duration-200
            ${disabled 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
            }
          `}
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {helperText && (
        <p className={`mt-1.5 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;