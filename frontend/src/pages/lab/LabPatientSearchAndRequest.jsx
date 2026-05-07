import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../api/axiosInstance";
import LabTestRequest from "./LabTestRequest";

const LabPatientSearchAndRequest = ({ mode = "embed", onRequestCreated }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const debounceRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchPatients(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const searchPatients = async (text) => {
    setLoading(true);
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    try {
      const res = await axiosInstance.get(
        `/patientsapi/patient_search/?q=${encodeURIComponent(text)}`,
        { signal: controllerRef.current.signal }
      );
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (!err?.name || !["AbortError", "CanceledError"].includes(err.name)) {
        console.error("Patient search error:", err);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = (p) => {
    if (mode === "redirect") {
      window.location.href = `/lab/request/${p.id}`;
      return;
    }
    setSelectedPatient(p);
    setResults([]);
    setQuery("");
  };

  const handleRequestSuccess = () => {
    setSelectedPatient(null);
    if (typeof onRequestCreated === "function") onRequestCreated();
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div className="space-y-3">
      {/* Single-line Beautiful Search Bar */}
      <div className="relative group">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow"
              placeholder="Search patient by name, phone, or PID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => searchPatients(query)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-300 flex items-center gap-2"
            title="Search patients"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm">Search</span>
          </button>
        </div>
        
        {/* Live Search Indicator */}
        {query && (
          <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Live search</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{results.length} results</span>
            </div>
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600">
                <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compact Results Dropdown */}
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-50 rounded">
                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  Found {results.length} patient{results.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={clearSearch}
                className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPatient(p)}
                className="w-full p-3 text-left hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-800 group-hover:text-blue-600">
                        {p.first_name} {p.last_name}
                      </span>
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        PID: {p?.patient_data?.id || p.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {p?.patient_data?.phone && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {p.patient_data.phone}
                        </span>
                      )}
                      {p?.patient_data?.age && (
                        <span className="flex items-center gap-1">
                          <span className="text-gray-400">•</span>
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">
                            {p.patient_data.age}yrs
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-center text-gray-500">
              Click patient to {mode === "redirect" ? "redirect" : "request tests"}
            </p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg">
          <div className="p-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-700 mb-1">No patients found</p>
            <p className="text-xs text-gray-500">Try searching with different terms</p>
          </div>
        </div>
      )}

      {/* Selected Patient & Form */}
      {selectedPatient && mode === "embed" && (
        <div className="mt-3 space-y-3">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-700 text-xs font-medium rounded">
                      PID: {selectedPatient.patient_data?.id || selectedPatient.id}
                    </span>
                    {selectedPatient.patient_data?.phone && (
                      <span className="text-xs text-gray-600">{selectedPatient.patient_data.phone}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-blue-100 shadow-sm">
            <LabTestRequest
              patient={selectedPatient.patient_data || selectedPatient}
              onSuccess={handleRequestSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LabPatientSearchAndRequest;