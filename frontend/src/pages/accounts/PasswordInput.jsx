// src/components/PasswordInput.jsx
import React, { useState } from 'react';

const PasswordInput = ({
  id = 'password',
  label = 'Password',
  value,
  onChange,
  required = true,
  helperText = 'Your password must be 8–20 characters long.',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="input-group">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          className="form-control"
          placeholder={`Enter ${label.toLowerCase()}`}
          value={value}
          onChange={onChange}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
        >
          <i className={`ri-eye${showPassword ? '-off' : ''}-line text-primary`}></i>
        </button>
      </div>
      {helperText && <div className="form-text">{helperText}</div>}
    </div>
  );
};

export default PasswordInput;