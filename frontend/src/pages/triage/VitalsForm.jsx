import React from "react";

const fields = [
  { 
    name: 'temp', 
    label: 'Temperature', 
    type: 'number', 
    step: '0.1', 
    placeholder: '36.5',
    icon: '🌡️',
    unit: '°C'
  },
  { 
    name: 'weight', 
    label: 'Weight', 
    type: 'number', 
    step: '0.1', 
    placeholder: '70.0',
    icon: '⚖️',
    unit: 'kg'
  },
  { 
    name: 'height', 
    label: 'Height', 
    type: 'number', 
    step: '0.1', 
    placeholder: '175.0',
    icon: '📏',
    unit: 'cm'
  },
  { 
    name: 'bp', 
    label: 'BP', 
    type: 'text', 
    placeholder: '120/80',
    icon: '❤️',
    unit: 'mmHg'
  },
  { 
    name: 'spo2', 
    label: 'SpO₂', 
    type: 'number', 
    step: '1', 
    placeholder: '98',
    icon: '🫁',
    unit: '%'
  },
  { 
    name: 'pulse', 
    label: 'Pulse', 
    type: 'number', 
    step: '1', 
    placeholder: '72',
    icon: '💓',
    unit: 'bpm'
  },
];

const VitalsForm = ({ formData, onChange, disabled }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {fields.map(({ name, label, type, step, placeholder, icon, unit }) => (
          <div key={name} className="group">
            <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{icon}</span>
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </div>
              
              <div className="relative">
                <input
                  type={type}
                  step={step}
                  name={name}
                  value={formData[name]}
                  onChange={onChange}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 font-medium"
                  disabled={disabled}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {unit}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-blue-800">
            <p className="font-medium">Quick Tips</p>
            <p className="mt-0.5">BP format: systolic/diastolic (e.g., 120/80)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsForm;