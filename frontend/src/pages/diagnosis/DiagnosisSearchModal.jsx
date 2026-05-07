import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";

const DiagnosisSearchModal = ({ 
  show, 
  onClose, 
  patientId, 
  encounterRouteId, 
  onDiagnosisAdded 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [diagnosisType, setDiagnosisType] = useState("primary");
  const [severity, setSeverity] = useState("");
  const [clinicalDescription, setClinicalDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const { showMessage } = useMessage();

  // Diagnosis type options
  const diagnosisTypes = [
    { value: "primary", label: "Primary Diagnosis", desc: "Main diagnosis for this encounter", color: "blue" },
    { value: "secondary", label: "Secondary Diagnosis", desc: "Additional diagnoses", color: "gray" },
    { value: "complication", label: "Complication", desc: "Condition arising from primary diagnosis", color: "red" },
    { value: "comorbidity", label: "Comorbidity", desc: "Co-existing condition", color: "yellow" },
    { value: "provisional", label: "Provisional Diagnosis", desc: "Tentative diagnosis awaiting confirmation", color: "orange" },
    { value: "differential", label: "Differential Diagnosis", desc: "Alternative diagnoses being considered", color: "purple" },
    { value: "rule_out", label: "Rule Out", desc: "Diagnosis to be excluded", color: "gray" }
  ];

  // Severity options with proper Tailwind color classes
  const severityOptions = [
    { value: "mild", label: "Mild", color: "green", bgClass: "bg-green-500", hoverClass: "hover:bg-green-600", selectedClass: "bg-green-500 text-white shadow-md" },
    { value: "moderate", label: "Moderate", color: "yellow", bgClass: "bg-yellow-500", hoverClass: "hover:bg-yellow-600", selectedClass: "bg-yellow-500 text-white shadow-md" },
    { value: "severe", label: "Severe", color: "orange", bgClass: "bg-orange-500", hoverClass: "hover:bg-orange-600", selectedClass: "bg-orange-500 text-white shadow-md" },
    { value: "critical", label: "Critical", color: "red", bgClass: "bg-red-500", hoverClass: "hover:bg-red-600", selectedClass: "bg-red-500 text-white shadow-md" }
  ];

  // Search for diagnoses
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await axiosInstance.get(`/icd11api/search/?q=${encodeURIComponent(searchTerm)}&limit=20`);
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Error searching diagnoses:", error);
        showMessage("Failed to search diagnoses", "danger");
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, showMessage]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show]);

  const resetForm = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedDiagnosis(null);
    setDiagnosisType("primary");
    setSeverity("");
    setClinicalDescription("");
    setNotes("");
    setSaving(false);
  };

  const handleSave = async () => {
    if (!selectedDiagnosis) return;

    setSaving(true);
    try {
      const payload = {
        patient_id: patientId,  // Changed from 'patient' to 'patient_id'
        encounter_route_id: encounterRouteId,  // Changed from 'encounter_route' to 'encounter_route_id'
        category_code: selectedDiagnosis.code,  // This is correct
        diagnosis_type: diagnosisType,
        severity: severity || null,
        clinical_description: clinicalDescription || null,
        notes: notes || null
      };

      console.log("Sending payload:", payload); // Debug: log the payload

      const response = await axiosInstance.post("/icd11api/diagnoses/", payload);
      console.log("Response:", response); // Debug: log the response
      
      showMessage("Diagnosis added successfully", "success");
      onDiagnosisAdded?.();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding diagnosis:", error);
      // Enhanced error logging
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        showMessage(error.response?.data?.message || error.response?.data?.error || "Failed to add diagnosis", "danger");
      } else if (error.request) {
        console.error("No response received:", error.request);
        showMessage("No response from server", "danger");
      } else {
        console.error("Error setting up request:", error.message);
        showMessage("Error sending request", "danger");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSelectDiagnosis = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setSearchTerm("");
    setSearchResults([]);
    // Focus on the first form field after selection
    setTimeout(() => {
      const typeSelect = document.getElementById("diagnosis-type");
      if (typeSelect) typeSelect.focus();
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      if (selectedDiagnosis) {
        setSelectedDiagnosis(null);
      } else {
        onClose();
      }
    }
  };

  // Determine if a diagnosis has been selected
  const hasSelectedDiagnosis = selectedDiagnosis !== null;

  // Dynamic spacing class
  const getSpacingClass = () => {
    if (!hasSelectedDiagnosis) {
      // No diagnosis selected - large spacing to push content up
      return 'space-y-48 sm:space-y-64 md:space-y-80';
    }
    // Diagnosis selected - normal spacing
    return 'space-y-4 sm:space-y-5';
  };

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  Add ICD-11 Diagnosis
                </h3>
                {patientId && (
                  <p className="text-xs text-gray-500 truncate">
                    Patient ID: {patientId}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Dynamic spacing based on selection state */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all duration-300 ${getSpacingClass()}`}>
          {/* Search Section */}
          <div className="space-y-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code or diagnosis name..."
                className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                autoFocus
                disabled={hasSelectedDiagnosis}
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && !hasSelectedDiagnosis && (
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-64 overflow-y-auto shadow-sm">
                {searchResults.map((result) => (
                  <button
                    key={result.code}
                    onClick={() => handleSelectDiagnosis(result)}
                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                        {result.code}
                      </span>
                      <span className="text-sm text-gray-700 flex-1">
                        {result.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {searchTerm.length >= 2 && searchResults.length === 0 && !searching && !hasSelectedDiagnosis && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-500">No diagnoses found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
              </div>
            )}

            {/* Search Prompt */}
            {searchTerm.length < 2 && !hasSelectedDiagnosis && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm text-gray-500">Start typing to search</p>
                <p className="text-xs text-gray-400 mt-1">Search by ICD-11 code or diagnosis name</p>
              </div>
            )}
          </div>

          {/* Selected Diagnosis Form - Only shows when a diagnosis is selected */}
          {hasSelectedDiagnosis && (
            <div className="space-y-4 animate-fade-in">
              {/* Selected Diagnosis Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-blue-700">
                        {selectedDiagnosis.code}
                      </span>
                      <button
                        onClick={() => setSelectedDiagnosis(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedDiagnosis.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnosis Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Diagnosis Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="diagnosis-type"
                  value={diagnosisType}
                  onChange={(e) => setDiagnosisType(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {diagnosisTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity - Fixed orange color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Severity
                </label>
                <div className="flex flex-wrap gap-2">
                  {severityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSeverity(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        severity === option.value
                          ? option.selectedClass
                          : `bg-gray-100 text-gray-700 ${option.hoverClass}`
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Clinical Description
                </label>
                <textarea
                  rows={2}
                  value={clinicalDescription}
                  onChange={(e) => setClinicalDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Brief clinical description..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer - Only show actions when diagnosis is selected */}
        {hasSelectedDiagnosis && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={() => setSelectedDiagnosis(null)}
                disabled={saving}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 order-2 sm:order-1"
              >
                Change Diagnosis
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Diagnosis
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisSearchModal;