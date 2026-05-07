// components/radiology/dashboardsubcomponents/DashboardFilters.js
import React, { useState } from 'react';

const DashboardFilters = ({ filters, onFilterChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      patientSearch: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      urgency: ''
    });
    setShowAdvanced(false);
  };

  const hasActiveFilters = filters.patientSearch || filters.dateFrom || filters.dateTo || filters.status || filters.urgency;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Main Filters Section */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Patient Search */}
          <div className="md:col-span-4">
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Search Patient
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors placeholder:text-gray-400"
                placeholder="Name or ID..."
                value={filters.patientSearch}
                onChange={(e) => handleInputChange('patientSearch', e.target.value)}
              />
            </div>
          </div>

          {/* Urgency Filter */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Urgency
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <select
                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors appearance-none bg-white"
                value={filters.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
              >
                <option value="">All Urgencies</option>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <select
                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors appearance-none bg-white"
                value={filters.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2">
              <button 
                className={`inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  showAdvanced 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <svg className={`w-3.5 h-3.5 mr-1.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                {showAdvanced ? 'Simple' : 'Advanced'}
              </button>
              
              {hasActiveFilters && (
                <button 
                  className="inline-flex items-center px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  onClick={clearFilters}
                >
                  <svg className="w-3.5 h-3.5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
              )}
              
              <div className={`text-xs px-2 py-1 rounded-md border ${
                hasActiveFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {hasActiveFilters ? 'Filtered' : 'All'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-3">
                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Date From
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                    value={filters.dateFrom}
                    onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Date To
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                    value={filters.dateTo}
                    onChange={(e) => handleInputChange('dateTo', e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-6 flex items-end">
                {(filters.dateFrom || filters.dateTo) && (
                  <button 
                    className="inline-flex items-center px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      handleInputChange('dateFrom', '');
                      handleInputChange('dateTo', '');
                    }}
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Dates
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                Active Filters:
              </span>
              
              {filters.patientSearch && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-[10px] font-medium text-blue-700">{filters.patientSearch}</span>
                  <button 
                    className="ml-1 text-blue-500 hover:text-blue-700"
                    onClick={() => handleInputChange('patientSearch', '')}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              
              {filters.urgency && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-md">
                  <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-[10px] font-medium text-amber-700">
                    {filters.urgency.charAt(0).toUpperCase() + filters.urgency.slice(1)}
                  </span>
                  <button 
                    className="ml-1 text-amber-500 hover:text-amber-700"
                    onClick={() => handleInputChange('urgency', '')}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              
              {filters.status && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-md">
                  <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-[10px] font-medium text-emerald-700">
                    {filters.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <button 
                    className="ml-1 text-emerald-500 hover:text-emerald-700"
                    onClick={() => handleInputChange('status', '')}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              
              {(filters.dateFrom || filters.dateTo) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-md">
                  <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] font-medium text-purple-700">
                    {filters.dateFrom || 'Any'} → {filters.dateTo || 'Any'}
                  </span>
                  <button 
                    className="ml-1 text-purple-500 hover:text-purple-700"
                    onClick={() => {
                      handleInputChange('dateFrom', '');
                      handleInputChange('dateTo', '');
                    }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFilters;