// src/components/PatientImage.jsx
import React from 'react';

const PatientImage = ({ patient, className = "w-10 h-10", showStatus = false }) => {
  // Helper function to get patient photo URL
  const getPatientPhoto = (patient) => {
    const pdata = patient.patient_data || {};
    const userInfo = patient.user_info || {};
    
    // Check in patient_data
    if (pdata.photo) {
      return pdata.photo;
    }
    // Check in user_info
    if (userInfo.profile_picture) {
      return userInfo.profile_picture;
    }
    // Check directly on patient
    if (patient.photo) {
      return patient.photo;
    }
    // Check in patient.user
    if (patient.user?.profile_picture) {
      return patient.user.profile_picture;
    }
    return null;
  };

  // Helper function to get gender-based default avatar
  const getDefaultAvatar = (patient) => {
    const pdata = patient.patient_data || {};
    const userInfo = patient.user_info || {};
    const gender = pdata.gender?.title?.toLowerCase() || 
                   userInfo.gender?.title?.toLowerCase() ||
                   patient.gender?.title?.toLowerCase();
    
    if (gender === 'female') {
      return '/assets/images/patients/female-default.jpg';
    }
    return '/assets/images/patients/male-default.jpg';
  };

  const photoUrl = getPatientPhoto(patient);
  const defaultAvatar = getDefaultAvatar(patient);
  const hasActiveVisit = patient.patient_data?.active_visit || patient.active_visit;
  
  // Determine gender for gradient
  const pdata = patient.patient_data || {};
  const userInfo = patient.user_info || {};
  const gender = pdata.gender?.title?.toLowerCase() || 
                 userInfo.gender?.title?.toLowerCase() ||
                 patient.gender?.title?.toLowerCase();
  const isMale = gender === 'male';
  const isFemale = gender === 'female';

  return (
    <div className="relative">
      <div className={`${className} rounded-xl bg-gradient-to-br ${
        isMale ? 'from-blue-400 to-indigo-500' :
        isFemale ? 'from-pink-400 to-rose-500' :
        'from-gray-400 to-gray-600'
      } overflow-hidden shadow-md`}>
        {photoUrl ? (
          <img
            src={photoUrl}
            className="w-full h-full object-cover"
            alt={patient.first_name || patient.user_info?.first_name || 'Patient'}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />
        ) : (
          <img
            src={defaultAvatar}
            className="w-full h-full object-cover"
            alt={patient.first_name || patient.user_info?.first_name || 'Patient'}
          />
        )}
      </div>
      {showStatus && hasActiveVisit && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

export default PatientImage;