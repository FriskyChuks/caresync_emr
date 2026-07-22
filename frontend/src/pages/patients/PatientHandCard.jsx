// src/pages/patients/PatientHandCard.jsx
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

const PatientHandCard = ({ patient, onClose, onPrint }) => {
  const cardRef = useRef(null);

  if (!patient) return null;

  const { user_info, patient_number, age, date_of_birth, phone, email, gender, status, blood_group, genotype } = patient;
  
  const fullName = `${user_info?.first_name || ''} ${user_info?.last_name || ''}`.trim();
  const genderTitle = user_info?.gender?.title || gender || 'N/A';
  
  // Get initials for avatar
  const getInitials = () => {
    const first = user_info?.first_name?.charAt(0) || '';
    const last = user_info?.last_name?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  // Handle print/save as image
  const handlePrint = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          scale: 3,
          backgroundColor: null,
          logging: false
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${patient_number}_handcard.png`;
        link.href = image;
        link.click();
        onPrint?.();
      } catch (error) {
        console.error('Error generating card:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hand Card - ATM Card Style */}
        <div
          ref={cardRef}
          className="w-[350px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl overflow-hidden relative"
        >
          {/* Card Chip and Brand */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-xs font-bold text-gray-800">💳</span>
              </div>
              <span className="text-[10px] font-bold text-white/80 tracking-wider">CARESYNC</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-5 pt-8">
            {/* Hospital Logo/Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-white/80">Federal Medical Centre Keffi</div>
                <div className="text-[9px] text-white/60">Patient Identification Card</div>
              </div>
            </div>

            {/* Patient Name */}
            <div className="mb-3">
              <div className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Patient Name</div>
              <div className="text-base font-bold text-white tracking-wide">
                {fullName || 'Unknown Patient'}
              </div>
            </div>

            {/* Patient ID Row */}
            <div className="mb-3">
              <div className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Patient ID</div>
              <div className="text-sm font-mono font-semibold text-white">
                {patient_number || 'N/A'}
              </div>
            </div>

            {/* Patient Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-[9px] text-white/60 uppercase tracking-wider mb-0.5">Age</div>
                <div className="text-sm font-semibold text-white">
                  {age ? `${age} years` : 'N/A'}
                  {date_of_birth && (
                    <span className="text-[9px] text-white/60 ml-1">
                      ({new Date(date_of_birth).toLocaleDateString()})
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-white/60 uppercase tracking-wider mb-0.5">Gender</div>
                <div className="text-sm font-semibold text-white">
                  {genderTitle}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {phone && (
                <div>
                  <div className="text-[9px] text-white/60 uppercase tracking-wider mb-0.5">Phone</div>
                  <div className="text-xs font-medium text-white">{phone}</div>
                </div>
              )}
              {email && (
                <div>
                  <div className="text-[9px] text-white/60 uppercase tracking-wider mb-0.5">Email</div>
                  <div className="text-xs font-medium text-white truncate">{email}</div>
                </div>
              )}
            </div>

            {/* Medical Info (if available) */}
            {(blood_group || genotype) && (
              <div className="flex gap-3 mb-4 pt-2 border-t border-white/20">
                {blood_group && (
                  <div>
                    <div className="text-[8px] text-white/60 uppercase tracking-wider mb-0.5">Blood Group</div>
                    <div className="text-xs font-semibold text-white">{blood_group}</div>
                  </div>
                )}
                {genotype && (
                  <div>
                    <div className="text-[8px] text-white/60 uppercase tracking-wider mb-0.5">Genotype</div>
                    <div className="text-xs font-semibold text-white">{genotype}</div>
                  </div>
                )}
              </div>
            )}

            {/* Status Badge */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-[9px] font-medium text-white/70 uppercase tracking-wider">
                  {status === 'active' ? 'Active Patient' : 'Inactive'}
                </span>
              </div>
              <div className="text-[8px] text-white/50">
                Issued: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-black/20 px-5 py-2 flex items-center justify-between">
            <div className="flex gap-1">
              {['⬤', '⬤', '⬤'].map((dot, i) => (
                <div key={i} className="text-[6px] text-white/40">{dot}</div>
              ))}
            </div>
            <div className="text-[8px] font-mono text-white/40">
              {patient_number?.slice(-11) || 'XXXXXXXX'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mt-5">
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-lg shadow hover:shadow-md transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Save as Image
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white text-gray-700 text-sm font-semibold rounded-lg shadow hover:bg-gray-50 transition-all"
          >
            Close
          </button>
        </div>

        {/* Size Guide */}
        <div className="text-center mt-3 text-[10px] text-gray-500">
          Card size: 350px × ~220px • Compatible with ATM card dimensions
        </div>
      </div>
    </div>
  );
};

export default PatientHandCard;