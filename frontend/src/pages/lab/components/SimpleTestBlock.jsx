// src/lab/components/SimpleTestBlock.jsx
import React from "react";
import ReferenceRangeSelect from "./ReferenceRangeSelect";

const SimpleTestBlock = ({ detail, values = {}, editable = true, disabled = false, onResultChange }) => {
  const isReadOnly = !!values.lab_result_has_value;
  const isDisabled = !editable || disabled || isReadOnly;
  const hasValue = values.value && values.value.trim() !== "";

  return (
    <div className={`relative bg-gradient-to-br ${hasValue ? 'from-blue-50 to-emerald-50' : 'from-gray-50 to-blue-50'} rounded-xl p-4 border ${isDisabled ? 'border-gray-200' : 'border-blue-200'} shadow-sm transition-all duration-300`}>
      {isReadOnly && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Saved
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Result Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Result {detail.test.si_unit && <span className="text-gray-500 font-normal">({detail.test.si_unit})</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              className={`w-full px-4 py-2.5 text-sm bg-white border ${isDisabled ? 'border-gray-300 text-gray-500 cursor-not-allowed' : 'border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'} rounded-lg outline-none transition-all duration-200 ${hasValue ? 'font-medium text-blue-800' : 'text-gray-700'}`}
              value={values.value ?? ""}
              onChange={(e) => onResultChange(detail.id, "value", e.target.value)}
              disabled={isDisabled}
              placeholder={isDisabled ? "Results entry disabled - payment required" : "Enter result"}
            />
            {hasValue && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Reference Range */}
        {detail.test.requires_reference_range && (
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-purple-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Reference Range
            </label>
            <ReferenceRangeSelect
              ranges={detail.test.reference_ranges || []}
              value={values.reference_range || ""}
              onChange={(val) => onResultChange(detail.id, "reference_range", val)}
              disabled={isDisabled}
            />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Notes
          </label>
          <input
            type="text"
            className={`w-full px-4 py-2.5 text-sm bg-white border ${isDisabled ? 'border-gray-300 text-gray-500 cursor-not-allowed' : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'} rounded-lg outline-none transition-all duration-200 placeholder:text-gray-400`}
            value={values.notes ?? ""}
            onChange={(e) => onResultChange(detail.id, "notes", e.target.value)}
            disabled={isDisabled}
            placeholder={isDisabled ? "Disabled - payment required" : "Add notes..."}
          />
        </div>
      </div>

      {/* Flags */}
      <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100 flex-wrap">
        <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${values.critical ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <div className={`relative w-4 h-4 border rounded ${values.critical ? 'border-red-400 bg-red-500' : 'border-gray-400 bg-white'} flex items-center justify-center transition-all duration-200`}>
            {values.critical && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={!!values.critical}
            onChange={(e) => onResultChange(detail.id, "critical", e.target.checked)}
            disabled={isDisabled}
          />
          <span className="text-sm font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Critical
          </span>
        </label>

        <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} ${values.retest ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <div className={`relative w-4 h-4 border rounded ${values.retest ? 'border-amber-400 bg-amber-500' : 'border-gray-400 bg-white'} flex items-center justify-center transition-all duration-200`}>
            {values.retest && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={!!values.retest}
            onChange={(e) => onResultChange(detail.id, "retest", e.target.checked)}
            disabled={isDisabled}
          />
          <span className="text-sm font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Needs Retest
          </span>
        </label>
      </div>
    </div>
  );
};

export default SimpleTestBlock;