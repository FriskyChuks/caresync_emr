// components/radiology/RadiologyDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useMessage } from '../../context/MessageProvider';
import PendingRequestsList from './dashboardsubcomponents/PendingRequestsList';
import ResultsList from './dashboardsubcomponents/ResultsList';
import DashboardFilters from './dashboardsubcomponents/DashboardFilters';

const RadiologyDashboard = () => {
  const { showMessage } = useMessage();
  
  const [allPendingRequests, setAllPendingRequests] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Filter states - initialized with today's date for default view
  const [filters, setFilters] = useState({
    patientSearch: '',
    dateFrom: getTodayDate(),
    dateTo: getTodayDate(),
    status: '',
    urgency: ''
  });

  // Handle date preset selection
  const handleDatePreset = (preset) => {
    const today = new Date();
    let dateFrom = '';
    let dateTo = getTodayDate();
    
    switch(preset) {
      case 'today':
        dateFrom = getTodayDate();
        dateTo = getTodayDate();
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        dateFrom = yesterday.toISOString().split('T')[0];
        dateTo = dateFrom;
        break;
      case 'last7':
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        dateFrom = last7.toISOString().split('T')[0];
        break;
      case 'last30':
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        dateFrom = last30.toISOString().split('T')[0];
        break;
      case 'month':
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      default:
        return;
    }
    
    setFilters(prev => ({ 
      ...prev, 
      dateFrom, 
      dateTo 
    }));
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, resultsRes] = await Promise.all([
        axiosInstance.get('/radiologyapi/requests/pending/'),
        axiosInstance.get('/radiologyapi/results/')
      ]);
      
      setAllPendingRequests(pendingRes.data || []);
      setAllResults(resultsRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
      showMessage('Failed to load dashboard data', 'danger');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter function for pending requests - this determines what gets passed to the list
  const getFilteredPendingRequests = () => {
    let filtered = [...allPendingRequests];
    
    // Apply patient search filter
    if (filters.patientSearch) {
      const searchTerm = filters.patientSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.patient_name?.toLowerCase().includes(searchTerm) ||
        item.patient_id?.toString().toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    // Apply urgency filter
    if (filters.urgency) {
      filtered = filtered.filter(item => item.urgency === filters.urgency);
    }
    
    // Apply date range filters - This ensures only current day shows by default
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => new Date(item.date_created) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.date_created) <= toDate);
    }
    
    // Sort by date_created (most recent first)
    filtered.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    
    return filtered;
  };

  // Filter function for results
  const getFilteredResults = () => {
    let filtered = [...allResults];
    
    if (filters.patientSearch) {
      const searchTerm = filters.patientSearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.patient_name?.toLowerCase().includes(searchTerm) ||
        item.patient_id?.toString().toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(item => new Date(item.date_created) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.date_created) <= toDate);
    }
    
    filtered.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    
    return filtered;
  };

  const filteredPendingRequests = getFilteredPendingRequests();
  const filteredResults = getFilteredResults();

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Check if any additional filters are active beyond the default date range
  const hasActiveFilters = () => {
    const today = getTodayDate();
    return filters.patientSearch || 
           filters.status || 
           filters.urgency ||
           (filters.dateFrom && filters.dateFrom !== today) ||
           (filters.dateTo && filters.dateTo !== today);
  };

  return (
    <div className="">
      {/* Main Card with Glassmorphism Effect */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* Animated Gradient Header */}
        <div className="relative px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -inset-[100%] animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-lg blur-sm animate-pulse"></div>
                <div className="relative p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">Radiology Dashboard</h4>
                <p className="text-xs text-blue-100">Real-time imaging workflow</p>
              </div>
            </div>
            
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-all disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <svg className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xs font-medium text-white">
                {loading ? 'Syncing...' : 'Sync'}
              </span>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </div>

        <div className="p-4">
          {/* Filters */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl blur-xl"></div>
            <div className="relative">
              <DashboardFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                onDatePreset={handleDatePreset}
              />
            </div>
          </div>

          {/* Date Range Indicator */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {filters.dateFrom === filters.dateTo && filters.dateFrom ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Showing requests from <span className="font-semibold text-gray-700">{filters.dateFrom}</span>
                </span>
              ) : filters.dateFrom && filters.dateTo ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Showing requests from <span className="font-semibold text-gray-700">{filters.dateFrom}</span> to <span className="font-semibold text-gray-700">{filters.dateTo}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Showing all requests
                </span>
              )}
            </div>
            {hasActiveFilters() && (
              <button
                onClick={() => setFilters({
                  patientSearch: '',
                  dateFrom: getTodayDate(),
                  dateTo: getTodayDate(),
                  status: '',
                  urgency: ''
                })}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset to Today
              </button>
            )}
          </div>

          {/* Premium Tabs */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl blur-sm"></div>
              
              <div className="relative flex p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-inner">
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 relative px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                    activeTab === 'pending' 
                      ? 'text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {activeTab === 'pending' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg shadow-amber-500/30 animate-gradient-x"></div>
                  )}
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className={`w-3.5 h-3.5 ${activeTab === 'pending' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      activeTab === 'pending' 
                        ? 'bg-white/30 text-white' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {filteredPendingRequests.length}
                    </span>
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab('results')}
                  className={`flex-1 relative px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
                    activeTab === 'results' 
                      ? 'text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {activeTab === 'results' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg shadow-emerald-500/30 animate-gradient-x"></div>
                  )}
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className={`w-3.5 h-3.5 ${activeTab === 'results' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Results
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      activeTab === 'results' 
                        ? 'bg-white/30 text-white' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {filteredResults.length}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl animate-pulse"></div>
                <div className="relative flex gap-1">
                  <div className="w-2 h-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-8 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-8 bg-gradient-to-t from-purple-500 to-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-8 bg-gradient-to-t from-pink-500 to-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-8 bg-gradient-to-t from-rose-500 to-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
              <p className="mt-4 text-sm font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
                Loading dashboard...
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3 animate-fadeIn">
              {activeTab === 'pending' && (
                <div className="transform transition-all duration-300 hover:scale-[1.01]">
                  <PendingRequestsList 
                    requests={filteredPendingRequests}
                    onRefresh={fetchData}
                    filters={filters}
                    isFiltered={hasActiveFilters()}
                  />
                </div>
              )}
              
              {activeTab === 'results' && (
                <div className="transform transition-all duration-300 hover:scale-[1.01]">
                  <ResultsList 
                    results={filteredResults}
                    onRefresh={fetchData}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RadiologyDashboard;