import React, { useState } from "react";
import { Link } from "react-router-dom";

const PatientOverview = ({ patient, vitals, loading }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (loading) return (
    <div className="flex items-center justify-center py-2">
      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-r-transparent"></div>
    </div>
  );
  
  if (!patient) return (
    <div className="text-center py-2">
      <p className="text-red-500 text-xs">Patient not found</p>
    </div>
  );

  // Get latest vital signs
  const latestVital = vitals?.[0];
  
  // Vital signs with abnormal detection
  const getVitalBadges = () => {
    const badges = [];
    
    if (latestVital?.bp) {
      const [sys, dia] = latestVital.bp.split("/").map(Number);
      const isAbnormal = sys < 90 || sys > 140 || dia < 60 || dia > 90;
      badges.push({
        label: `${latestVital.bp}`,
        unit: "mmHg",
        abnormal: isAbnormal,
        icon: "❤️",
        name: "BP"
      });
    }
    
    if (latestVital?.temp != null) {
      const isAbnormal = latestVital.temp > 37.5 || latestVital.temp < 36;
      badges.push({
        label: latestVital.temp,
        unit: "°C",
        abnormal: isAbnormal,
        icon: "🌡️",
        name: "Temp"
      });
    }
    
    if (latestVital?.pulse != null) {
      const isAbnormal = latestVital.pulse < 60 || latestVital.pulse > 100;
      badges.push({
        label: latestVital.pulse,
        unit: "bpm",
        abnormal: isAbnormal,
        icon: "💓",
        name: "Pulse"
      });
    }
    
    if (latestVital?.spo2 != null) {
      const isAbnormal = latestVital.spo2 < 95;
      badges.push({
        label: latestVital.spo2,
        unit: "%",
        abnormal: isAbnormal,
        icon: "🫁",
        name: "SpO₂"
      });
    }
    
    return badges;
  };

  const vitalBadges = getVitalBadges();
  const hasVitals = vitalBadges.length > 0;
  
  const current_ward_id = patient.active_visit?.current_location?.ward_id;
  const current_clinic_id = patient.active_visit?.current_location?.clinic_id;
  const current_ward = patient.active_visit?.current_location?.ward;
  const current_clinic = patient.active_visit?.current_location?.clinic;
  const locationName = current_clinic || current_ward || "No active visit";
  const locationLink = current_clinic ? `/clinic-details/${current_clinic_id}` : current_ward ? `/ward-details/${current_ward_id}` : null;
  const locationType = current_clinic ? "Clinic" : current_ward ? "Ward" : null;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Main Row - Always Visible */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base sm:text-lg">
                {patient.user_info?.fullname?.charAt(0) || patient.first_name?.charAt(0) || 'P'}
              </span>
            </div>
            {patient.active_visit && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          {/* Name and Basic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                {patient.user_info?.fullname || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Patient'}
              </h2>
              <span className="flex-shrink-0 px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-medium rounded">
                #{patient.id}
              </span>
            </div>
            
            {/* Info Row - Responsive: Wraps on mobile, single line on desktop */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-gray-500">
              <span className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {patient.user_info?.gender?.title || "N/A"}
              </span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {patient.age || "N/A"} yrs
              </span>
              {patient.blood_type && (
                <>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {patient.blood_type}
                  </span>
                </>
              )}
              
              {/* Location - Always visible with link */}
              {locationLink && (
                <>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300"></span>
                  <Link
                    to={locationLink}
                    className="flex items-center gap-0.5 sm:gap-1 text-blue-600 hover:text-blue-700 whitespace-nowrap"
                  >
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {locationName}
                  </Link>
                </>
              )}
              
              {/* Phone - Only on desktop */}
              {patient.phone && (
                <>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300"></span>
                  <a
                    href={`tel:${patient.phone}`}
                    className="hidden sm:flex items-center gap-0.5 sm:gap-1 text-gray-500 hover:text-blue-600 whitespace-nowrap"
                  >
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {patient.phone}
                  </a>
                </>
              )}
            </div>
          </div>
          
          {/* Expand/Collapse Button - Only visible on mobile */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="sm:hidden flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Vitals Badges - Only on desktop */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {hasVitals ? (
              vitalBadges.map((vital, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                    vital.abnormal
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  <span className="text-sm">{vital.icon}</span>
                  <span className="font-mono font-semibold">
                    {vital.label}{vital.unit}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400">No vitals</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Expandable Details Section - Mobile Only */}
      {showDetails && (
        <div className="sm:hidden border-t border-gray-100 bg-gray-50/50 animate-slide-down">
          {/* Contact Info - Mobile only */}
          {patient.phone && (
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500">Contact</div>
                  <a href={`tel:${patient.phone}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    {patient.phone}
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {/* Vitals Section - Mobile only */}
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-700">Vitals</span>
                {latestVital && (
                  <span className="text-[10px] text-gray-400">
                    {formatDate(latestVital.created_at)}
                  </span>
                )}
              </div>
              {!hasVitals && (
                <span className="text-[10px] text-gray-400">No recent vitals</span>
              )}
            </div>
            
            {hasVitals ? (
              <div className="flex flex-wrap gap-1.5">
                {vitalBadges.map((vital, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                      vital.abnormal
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <span className="text-sm">{vital.icon}</span>
                    <span className="font-medium">{vital.name}</span>
                    <span className="font-mono font-semibold">
                      {vital.label}{vital.unit}
                    </span>
                    {vital.abnormal && (
                      <svg className="w-2.5 h-2.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No vital signs recorded</p>
            )}
          </div>
          
          {/* Quick Actions - Mobile only */}
          {/* <div className="px-3 py-2 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <Link
                to={`/patient/${patient.id}/vitals`}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Vitals
              </Link>
              <Link
                to={`/patient/${patient.id}/lab`}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Lab
              </Link>
              <Link
                to={`/patient/${patient.id}/radiology`}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Imaging
              </Link>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default PatientOverview;