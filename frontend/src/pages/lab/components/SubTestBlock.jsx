// src/lab/components/SubTestBlock.jsx
import React from "react";
import ReferenceRangeSelect from "./ReferenceRangeSelect";

const SubTestBlock = ({ detail, values = {}, editable = true, disabled = false, onSubValueChange, onSubFlagChange }) => {
  const subtests = detail.sub_tests || [];
  const subValues = values.sub_results || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">Subtests Analysis</h4>
          <p className="text-sm text-gray-500">Individual parameters for detailed analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subtests.map((st) => {
          const sr = subValues[st.id] || {};
          const isExisting = !!sr.existing;
          const isDisabled = !editable || disabled || isExisting;
          const hasValue = sr.value && sr.value.trim() !== "";

          return (
            <div
              key={st.id}
              className={`relative rounded-xl p-4 border transition-all duration-300 hover:shadow-md ${
                isDisabled
                  ? 'bg-gray-50 border-gray-200'
                  : hasValue
                  ? 'bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200'
                  : 'bg-white border-blue-100 hover:border-blue-300'
              }`}
            >
              {isExisting && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Saved
                  </span>
                </div>
              )}

              {/* Subtest Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-blue-800 text-sm">{st.parameter_name}</div>
                  {st.si_unit && (
                    <div className="text-xs text-gray-500 mt-0.5">Unit: {st.si_unit}</div>
                  )}
                </div>
              </div>

              {/* Value Input */}
              <div className="space-y-2 mb-3">
                <div className="relative">
                  <input
                    className={`w-full px-3 py-2 text-sm bg-white border ${
                      isDisabled
                        ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                        : 'border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    } rounded-lg outline-none transition-all duration-200 ${
                      hasValue ? 'font-medium text-blue-800' : 'text-gray-700'
                    }`}
                    value={sr.value ?? ""}
                    onChange={(e) => onSubValueChange(detail.id, st.id, "value", e.target.value)}
                    disabled={isDisabled}
                    placeholder={isDisabled ? "Disabled - payment required" : "Enter result"}
                  />
                  {hasValue && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>

                {st.requires_reference_range && (
                  <ReferenceRangeSelect
                    ranges={st.reference_ranges || []}
                    value={sr.reference_range || ""}
                    onChange={(val) => onSubValueChange(detail.id, st.id, "reference_range", val)}
                    disabled={isDisabled}
                  />
                )}
              </div>

              {/* Flags */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <label className={`inline-flex items-center gap-1.5 cursor-pointer transition-all duration-200 ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}>
                  <div className={`relative w-4 h-4 border rounded flex items-center justify-center transition-all duration-200 ${
                    sr.critical ? 'border-red-400 bg-red-500' : 'border-gray-400 bg-white'
                  }`}>
                    {sr.critical && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={!!sr.critical}
                    onChange={(e) => onSubFlagChange(detail.id, st.id, "critical", e.target.checked)}
                    disabled={isDisabled}
                  />
                  <span className={`text-xs font-medium ${
                    sr.critical ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    Critical
                  </span>
                </label>

                <label className={`inline-flex items-center gap-1.5 cursor-pointer transition-all duration-200 ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}>
                  <div className={`relative w-4 h-4 border rounded flex items-center justify-center transition-all duration-200 ${
                    sr.retest ? 'border-amber-400 bg-amber-500' : 'border-gray-400 bg-white'
                  }`}>
                    {sr.retest && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={!!sr.retest}
                    onChange={(e) => onSubFlagChange(detail.id, st.id, "retest", e.target.checked)}
                    disabled={isDisabled}
                  />
                  <span className={`text-xs font-medium ${
                    sr.retest ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    Retest
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubTestBlock;