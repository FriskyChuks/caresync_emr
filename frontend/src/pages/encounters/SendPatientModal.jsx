import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";

const SendPatientModal = ({
  show,
  onClose,
  patient,
  initialLocationType = "clinic",
  onSuccess,
}) => {
  const { showMessage } = useMessage();
  const [locationType, setLocationType] = useState("clinic");
  const [clinics, setClinics] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [sending, setSending] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const isWard = locationType === "ward";
  const isClinic = locationType === "clinic";
  const noActiveLocation = !patient?.active_visit;
  const inClinic = !!patient?.active_visit?.current_location?.clinic_id;
  const inWard = !!patient?.active_visit?.current_location?.ward_id;
  const showToggle = noActiveLocation || inClinic;

  // Animation effect
  useEffect(() => {
    if (show) {
      setTimeout(() => setAnimateIn(true), 10);
    } else {
      setAnimateIn(false);
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;
    if (noActiveLocation || inClinic) {
      setLocationType("clinic");
    } else if (inWard) {
      setLocationType("ward");
    } else {
      setLocationType(initialLocationType || "clinic");
    }
    setSelectedId("");
  }, [show, noActiveLocation, inClinic, inWard, initialLocationType]);

  const getGender = () => {
    const raw = patient?.user_info?.gender?.title ?? patient?.gender ?? patient?.user_info?.gender ?? null;
    return raw ? String(raw).toLowerCase() : null;
  };

  useEffect(() => {
    if (!show) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchLocations = async () => {
      try {
        const gender = getGender();
        if (isClinic) {
          const res = await axiosInstance.get("/locationsapi/clinics/");
          if (!mounted) return;
          let available = res.data || [];
          if (gender === "male") available = available.filter((c) => !c.female_only);
          else if (gender === "female") available = available.filter((c) => !c.male_only);
          setClinics(available);
        } else {
          const res = await axiosInstance.get("/locationsapi/wards/");
          if (!mounted) return;
          let available = res.data || [];
          if (gender === "male") available = available.filter((w) => !w.female_only);
          else if (gender === "female") available = available.filter((w) => !w.male_only);
          setWards(available);
        }
      } catch (err) {
        console.error("Failed to load locations:", err);
        if (mounted) setError("Failed to load locations");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLocations();
    return () => { mounted = false; };
  }, [show, locationType, patient?.user_info?.gender, patient?.gender]);

  const handleSend = async () => {
    if (!selectedId) return;
    setSending(true);
    setError(null);

    const payload = {
      patient_id: patient.id,
      clinic_id: isClinic ? Number(selectedId) : null,
      ward_id: isWard ? Number(selectedId) : null,
      from_clinic_id: isClinic ? patient?.active_visit?.current_location?.clinic_id || null : null,
      from_ward_id: isWard ? patient?.active_visit?.current_location?.ward_id || null : null,
    };

    try {
      await axiosInstance.post("/encounterapi/transfer_patient/", payload);
      showMessage("Patient transferred successfully", "success");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Transfer failed:", err);
      setError("Failed to transfer patient. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!show) return null;

  const currentLocationId = isClinic
    ? patient?.active_visit?.current_location?.clinic_id ?? null
    : patient?.active_visit?.current_location?.ward_id ?? null;

  const locations = isClinic ? clinics : wards;
  const filteredLocations = locations.filter((loc) => loc.id !== currentLocationId);
  const locationLabel = isClinic ? "Clinic" : "Ward";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with gradient */}
      <div 
        className={`fixed inset-0 bg-gradient-to-br from-blue-900/30 via-indigo-800/20 to-purple-900/30 backdrop-blur-sm transition-opacity duration-300 ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          animateIn 
            ? "translate-y-0 opacity-100 scale-100" 
            : "translate-y-10 opacity-0 scale-95"
        }`}
      >
        {/* Animated border effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-lg animate-pulse"></div>
        
        <div className="relative bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-2xl overflow-hidden border border-blue-100/50">
          
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Transfer Patient</h3>
                  {patient && (
                    <p className="text-blue-100 text-sm font-medium">
                      {patient.user_info?.first_name} {patient.user_info?.last_name}
                      <span className="mx-2">•</span>
                      PID: {patient.id}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
              >
                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {error && (
              <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl animate-shake">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Location Type Toggle - Beautiful pill design */}
            {showToggle && (
              <div className="mb-6">
                <div className="inline-flex p-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200 shadow-inner">
                  <button
                    type="button"
                    className={`relative flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isClinic 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                        : 'text-blue-700 hover:text-blue-900 hover:bg-white/50'
                    }`}
                    onClick={() => {
                      setLocationType("clinic");
                      setSelectedId("");
                    }}
                  >
                    {isClinic && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></span>
                    )}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Clinics
                  </button>
                  <button
                    type="button"
                    className={`relative flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isWard 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                        : 'text-purple-700 hover:text-purple-900 hover:bg-white/50'
                    }`}
                    onClick={() => {
                      setLocationType("ward");
                      setSelectedId("");
                    }}
                  >
                    {isWard && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></span>
                    )}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Wards
                  </button>
                </div>
              </div>
            )}

            {/* Location Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Select {locationLabel}
                </label>
                <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {filteredLocations.length} available
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-blue-600 font-medium">Loading {locationLabel.toLowerCase()}s...</p>
                  <p className="text-sm text-gray-500 mt-2">Filtering by patient gender restrictions</p>
                </div>
              ) : filteredLocations.length === 0 ? (
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-center">
                  <div className="inline-flex p-3 bg-white rounded-full shadow-sm mb-3">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-blue-700 mb-1">No {locationLabel.toLowerCase()}s available</h4>
                  <p className="text-blue-600 text-sm">
                    {isClinic ? 'All clinics are full or restricted by gender' : 'All wards are full or restricted by gender'}
                  </p>
                </div>
              ) : (
                <div className="relative group">
                  <select
                    className="w-full px-5 py-3.5 bg-white border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 text-sm font-medium appearance-none shadow-sm hover:border-blue-300 transition-all duration-200 cursor-pointer"
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    <option value="" className="text-gray-400">Select {locationLabel}</option>
                    {filteredLocations.map((loc) => (
                      <option key={loc.id} value={loc.id} className="py-2">
                        {loc.name}
                        {loc.capacity && (
                          <span className="text-gray-500 text-xs ml-2">
                            • {loc.capacity} beds
                          </span>
                        )}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Selected location preview */}
            {selectedId && filteredLocations.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-800">Ready to transfer</p>
                    <p className="text-emerald-600 text-sm">
                      Patient will be moved to selected {locationLabel.toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-blue-100/50 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${noActiveLocation ? 'bg-amber-400' : inClinic ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                <span>
                  Current: {noActiveLocation ? 'No active location' : inClinic ? 'In Clinic' : 'In Ward'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all duration-200 hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !selectedId}
                className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg overflow-hidden"
              >
                <span className="relative flex items-center gap-2">
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Transferring...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Transfer to {locationLabel}
                    </>
                  )}
                </span>
                {!sending && selectedId && (
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendPatientModal;