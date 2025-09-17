// src/components/vitals/VitalsForm.jsx
import React from 'react';

const fields = [
  { name: 'temp', label: '🌡️ Temperature (°C)', type: 'number', step: '0.1', placeholder: '36.5' },
  { name: 'weight', label: '⚖️ Weight (kg)', type: 'number', step: '0.1', placeholder: '70.0' },
  { name: 'height', label: '📏 Height (cm)', type: 'number', step: '0.1', placeholder: '175.0' },
  { name: 'bp', label: '❤️ Blood Pressure', type: 'text', placeholder: '120/80' },
  { name: 'spo2', label: '🫁 SpO₂ (%)', type: 'number', step: '1', placeholder: '98' },
  { name: 'pulse', label: '💓 Pulse (bpm)', type: 'number', step: '1', placeholder: '72' },
];

const VitalsForm = ({ formData, onChange, disabled }) => {
  return (
    <div className="row g-3">
      {fields.map(({ name, label, type, step, placeholder }) => (
        <div className="col" key={name}>
          <label className="form-label small fw-medium">{label}</label>
          <input
            type={type}
            step={step}
            name={name}
            value={formData[name]}
            onChange={onChange}
            placeholder={placeholder}
            className="form-control"
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
};

export default VitalsForm;
