import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

const ClerkingForm = ({ formData, onChange, disabled }) => {
  const [noteTypes, setNoteTypes] = useState([]);
  const [loadingNoteTypes, setLoadingNoteTypes] = useState(true);

  useEffect(() => {
    const fetchNoteTypes = async () => {
      try {
        const response = await axiosInstance.get("/clerkingapi/notetype/");
        const noteTypesData = Array.isArray(response.data) ? response.data : response.data.results || [];
        setNoteTypes(noteTypesData);
      } catch (error) {
        console.error("Error fetching note types:", error);
      } finally {
        setLoadingNoteTypes(false);
      }
    };

    fetchNoteTypes();
  }, []);

  const clerkingTemplate = `PRESENTING COMPLAINTS:


HISTORY OF PRESENTING COMPLAINTS:


PAST MEDICAL HISTORY:


FAMILY HISTORY:


PLAN:`;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'note_type') {
      const selectedNoteType = noteTypes.find(type => type.id == value);
      
      if (selectedNoteType && selectedNoteType.title === 'Clerking/History Taking') {
        onChange('body', clerkingTemplate);
      } else {
        onChange('body', '');
      }
    }
    
    onChange(name, value);
  };

  if (loadingNoteTypes) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <span className="text-blue-600 font-medium ml-2">Loading note types...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        {/* Note Type Selector */}
        <div className="space-y-2">
          <label htmlFor="note_type" className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Note Type
          </label>
          <select
            id="note_type"
            name="note_type"
            value={formData.note_type || ""}
            onChange={handleInputChange}
            disabled={disabled}
            required
            className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="" disabled className="text-gray-400">Select the Note Type</option>
            {noteTypes.slice().sort((a, b) => a.title.localeCompare(b.title)).map((note) => (
              <option key={note.id} value={note.id} className="text-gray-700">
                {note.title}
              </option>
            ))}
          </select>
        </div>

        {/* Note Header Input */}
        <div className="space-y-2">
          <label htmlFor="header" className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Note Header
          </label>
          <input
            type="text"
            id="header"
            name="header"
            placeholder="Enter note header..."
            value={formData.header || ""}
            onChange={handleInputChange}
            disabled={disabled}
            required
            className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-blue-300 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Notes Textarea */}
      <div className="space-y-3">
        <label htmlFor="body" className="flex items-center gap-2 text-sm font-semibold text-blue-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Detailed Notes
        </label>
        <div className="relative group">
          <textarea
            id="body"
            name="body"
            rows="15"
            placeholder="Enter detailed notes... The clerking template will auto-populate when 'Clerking/History Taking' is selected."
            value={formData.body || ""}
            onChange={handleInputChange}
            disabled={disabled}
            required
            className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 hover:border-blue-300 placeholder:text-gray-400 font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-gray-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formData.body ? formData.body.length : 0} characters
          </div>
        </div>
      </div>

      {/* Template Info */}
      {formData.body === clerkingTemplate && (
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-emerald-200 rounded-lg">
          <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-sm">
            <span className="font-medium text-emerald-700">Clerking template loaded</span>
            <p className="text-emerald-600">Fill in each section for comprehensive patient history</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClerkingForm;