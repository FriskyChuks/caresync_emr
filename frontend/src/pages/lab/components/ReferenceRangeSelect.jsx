// src/lab/components/ReferenceRangeSelect.jsx
import React from "react";

const ReferenceRangeSelect = ({ ranges = [], value = "", onChange = () => {}, disabled = false }) => {
  if (!ranges || ranges.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
        No reference ranges available
      </div>
    );
  }

  return (
    <div className="relative group">
      <select
        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none ${
          disabled 
            ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
            : 'border-blue-200 cursor-pointer hover:border-blue-300'
        } shadow-sm`}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="" className="text-gray-400">Select reference range</option>
        {ranges.map((r) => (
          <option key={r.id} value={r.id} className="py-2">
            {r.range_value}
            {r.category && ` (${r.category})`}
            {r.gender && r.gender !== 'Any' && ` • ${r.gender}`}
          </option>
        ))}
      </select>
      {!disabled && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ReferenceRangeSelect;