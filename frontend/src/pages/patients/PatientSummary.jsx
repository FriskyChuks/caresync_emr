import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from '../../context/MessageProvider';
import SendPatientModal from "../encounters/SendPatientModal";
import ScheduleAppointmentModal from "../appointments/ScheduleAppointmentModal";
import DischargeAction from "../encounters/discharge/DischargeAction";

// Reusable info block with beautiful styling
const InfoBlock = ({ icon, label, value, className = "", iconClassName = "" }) =>
  value ? (
    <div className={`flex items-start gap-2 ${className}`}>
      <div className={`mt-0.5 ${iconClassName}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 mb-0.5">{label}</p>
        <p className="text-xs font-medium text-gray-800 truncate">{value}</p>
      </div>
    </div>
  ) : null;

// Status badge component
const StatusBadge = ({ status, children, className = "" }) => {
  const statusColors = {
    'active': 'bg-gradient-to-r from-emerald-500 to-teal-500',
    'inactive': 'bg-gradient-to-r from-gray-500 to-gray-600',
    'emergency': 'bg-gradient-to-r from-rose-500 to-pink-600',
    'regular': 'bg-gradient-to-r from-blue-500 to-indigo-500',
    'default': 'bg-gradient-to-r from-indigo-500 to-purple-500'
  };

  const color = statusColors[status?.toLowerCase()] || statusColors.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white ${color} ${className}`}>
      {children}
    </span>
  );
};

// Patient Profile Card Component
const PatientProfileCard = ({ patient, onBookAppointment, onDischargeSuccess }) => {
  if (!patient) return null;

  const { user_info, date_of_birth, age, status, phone, email, gender, marital_status, 
    occupation, date_created, created_by, registered_by, active_visit, photo_url } = patient;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Default placeholder based on gender
  const getDefaultAvatar = () => {
    if (gender?.title?.toLowerCase() === 'female') {
      return "/assets/images/patients/female-default.jpg";
    }
    return "/assets/images/patients/male-default.jpg";
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-blue-200 overflow-hidden">
      <div className="p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-5">
          {/* Left Column - Avatar & Basic Info */}
          <div className="lg:w-2/5">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:items-start">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow overflow-hidden">
                    <img
                      src={photo_url || getDefaultAvatar()}
                      className="w-full h-full object-cover"
                      alt={`${user_info.first_name} ${user_info.last_name}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/images/patients/default-avatar.jpg";
                      }}
                    />
                  </div>
                  <StatusBadge 
                    status={status}
                    className="absolute -top-2 -right-2 shadow"
                  >
                    {status || 'Active'}
                  </StatusBadge>
                </div>
                
                {/* Patient ID Badge */}
                <div className="mt-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    <span className="text-xs font-mono font-semibold text-blue-700">
                      PID-{patient.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 mt-3 sm:mt-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1.5">
                  {user_info.first_name} {user_info.last_name}
                  {user_info.other_name && (
                    <span className="text-sm font-normal text-gray-600 ml-1">
                      ({user_info.other_name})
                    </span>
                  )}
                </h2>
                
                <div className="space-y-2">
                  {/* Demographics Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg">
                      <span className="text-blue-600 text-sm">🎂</span>
                      <span className="text-xs font-medium text-gray-700">
                        {age} years
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-600">{date_of_birth}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-lg">
                      <span className="text-purple-600 text-sm">👤</span>
                      <span className="text-xs font-medium text-gray-700">
                        {user_info?.gender?.title}
                      </span>
                      {marital_status && (
                        <>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-600">{marital_status}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contact Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {phone && (
                      <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <span className="text-emerald-600 text-sm">📱</span>
                        <a 
                          href={`tel:${phone}`}
                          className="text-xs font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                        >
                          {phone}
                        </a>
                      </div>
                    )}
                    
                    {user_info?.email && (
                      <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg">
                        <span className="text-amber-600 text-sm">✉️</span>
                        <a 
                          href={`mailto:${user_info.email}`}
                          className="text-xs font-medium text-gray-700 hover:text-amber-600 transition-colors truncate max-w-[180px]"
                        >
                          {user_info.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Occupation & Registration */}
                  <div className="flex flex-wrap items-center gap-2">
                    {occupation && (
                      <div className="flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        <span className="text-indigo-600 text-sm">💼</span>
                        <span className="text-xs font-medium text-gray-700">
                          {occupation}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg">
                      <span className="text-gray-600 text-sm">📅</span>
                      <span className="text-xs text-gray-600">
                        Registered {formatDate(date_created)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Location & Actions */}
          <div className="lg:w-3/5">
            <div className="h-full lg:border-l lg:border-blue-200 lg:pl-4 md:pl-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                {/* Current Location Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                      <span className="text-white text-sm">📍</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Current Location</h3>
                  </div>
                  
                  <div className="flex-1">
                    {active_visit ? (
                      active_visit?.current_location?.ward ? (
                        <div className="space-y-3">
                          <div className="group">
                            <Link 
                              to={`/ward-details/${active_visit.current_location.ward_id}`}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2.5 rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow transition-all duration-300"
                            >
                              <span className="text-amber-600">🏥</span>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">
                                  {active_visit.current_location.ward} Ward
                                </p>
                                <p className="text-xs text-gray-600">
                                  Room {active_visit.current_location.room}
                                </p>
                              </div>
                            </Link>
                          </div>
                          
                          {active_visit.is_inpatient && (
                            <div className="mt-2">
                              <DischargeAction 
                                visit={active_visit} 
                                onSuccess={onDischargeSuccess}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="group">
                            <Link 
                              to={`/clinic-details/${active_visit?.current_location?.clinic_id}`}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2.5 rounded-lg border border-emerald-200 hover:border-emerald-300 hover:shadow transition-all duration-300"
                            >
                              <span className="text-emerald-600">🏥</span>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">
                                  {active_visit?.current_location?.clinic} Clinic
                                </p>
                                <p className="text-xs text-gray-600">
                                  {active_visit?.current_location?.department}
                                </p>
                              </div>
                            </Link>
                          </div>
                          
                          <div className="mt-2">
                            <DischargeAction 
                              visit={active_visit} 
                              onSuccess={onDischargeSuccess}
                            />
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2.5 rounded-lg border border-gray-200">
                        <span className="text-gray-400">📍</span>
                        <div>
                          <p className="font-medium text-gray-700 text-sm">Not Assigned</p>
                          <p className="text-xs text-gray-500">No active visit</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                      <span className="text-white text-sm">⚡</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Quick Actions</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={onBookAppointment}
                      className="group flex flex-col items-center justify-center p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow transition-all duration-300"
                    >
                      <span className="text-blue-600 mb-1.5 group-hover:scale-110 transition-transform">📅</span>
                      <span className="text-xs font-medium text-gray-700">Book Appointment</span>
                    </button>
                    
                    <Link 
                      to="/patient-registration"
                      className="group flex flex-col items-center justify-center p-2.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow transition-all duration-300"
                    >
                      <span className="text-purple-600 mb-1.5 group-hover:scale-110 transition-transform">👤</span>
                      <span className="text-xs font-medium text-gray-700">New Registration</span>
                    </Link>
                    
                    <Link to={`/patient-update/${patient.id}`} className="group flex flex-col items-center justify-center p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow transition-all duration-300">
                      <span className="text-amber-600 mb-1.5 group-hover:scale-110 transition-transform">📝</span>
                      <span className="text-xs font-medium text-gray-700">Update Record</span>
                    </Link>
                    
                    <button className="group flex flex-col items-center justify-center p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 hover:border-emerald-300 hover:shadow transition-all duration-300">
                      <span className="text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform">📋</span>
                      <span className="text-xs font-medium text-gray-700">View History</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Contact Info Section Component
const ContactInfoSection = ({ residential, permanent, kin }) => {
  if (!residential && !permanent && !kin) {
    return (
      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2">
          <span className="text-blue-500">ℹ️</span>
          <p className="text-xs text-gray-600">
            No contact information available for this patient.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Contact Information
        </h3>
        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
          3 sections
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Residential Address */}
        {residential && (
          <div className="group">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg border border-blue-200 p-4 hover:shadow hover:border-blue-300 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                  <span className="text-blue-600">🏠</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Residential Address</h4>
                  <p className="text-xs text-gray-500">Current living address</p>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <InfoBlock 
                  icon="📍"
                  label="Address"
                  value={residential.address}
                  iconClassName="text-blue-500"
                />
                <InfoBlock 
                  icon="🏙️"
                  label="Town/City"
                  value={residential.town}
                  iconClassName="text-indigo-500"
                />
                <InfoBlock 
                  icon="📞"
                  label="Primary Phone"
                  value={residential.phone1}
                  iconClassName="text-emerald-500"
                />
                {residential.phone2 && (
                  <InfoBlock 
                    icon="📱"
                    label="Secondary Phone"
                    value={residential.phone2}
                    iconClassName="text-amber-500"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Permanent Address */}
        {permanent && (
          <div className="group">
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg border border-emerald-200 p-4 hover:shadow hover:border-emerald-300 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg">
                  <span className="text-emerald-600">📍</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Permanent Address</h4>
                  <p className="text-xs text-gray-500">Home/permanent address</p>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <InfoBlock 
                  icon="🏡"
                  label="Address"
                  value={permanent.address}
                  iconClassName="text-emerald-500"
                />
                <InfoBlock 
                  icon="🏘️"
                  label="Town/City"
                  value={permanent.town}
                  iconClassName="text-teal-500"
                />
                <InfoBlock 
                  icon="🗺️"
                  label="State"
                  value={permanent.state_of_residence}
                  iconClassName="text-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Next of Kin */}
        {kin && (
          <div className="group">
            <div className="bg-gradient-to-br from-white to-rose-50 rounded-lg border border-rose-200 p-4 hover:shadow hover:border-rose-300 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-1.5 bg-gradient-to-r from-rose-100 to-pink-100 rounded-lg">
                  <span className="text-rose-600">❤️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Next of Kin</h4>
                  <p className="text-xs text-gray-500">Emergency contact</p>
                </div>
              </div>
              
              <div className="space-y-2.5">
                <InfoBlock 
                  icon="👤"
                  label="Full Name"
                  value={kin.full_names}
                  iconClassName="text-rose-500"
                />
                <InfoBlock 
                  icon="📞"
                  label="Phone Number"
                  value={kin.phone_no}
                  iconClassName="text-purple-500"
                />
                <InfoBlock 
                  icon="🏡"
                  label="Address"
                  value={kin.address}
                  iconClassName="text-amber-500"
                />
                <InfoBlock 
                  icon="✉️"
                  label="Email"
                  value={kin.email}
                  iconClassName="text-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main PatientSummary Component
const PatientSummary = ({ data: initialData }) => {
  const { showMessage } = useMessage();
  const navigate = useNavigate();
  const { patientId } = useParams();
  const location = useLocation();

  const [data, setData] = useState(initialData || location.state?.patient || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const noActiveLocation = !data?.active_visit;
  const inClinic = !!data?.active_visit?.current_location?.clinic_id;
  const inWard = !!data?.active_visit?.current_location?.ward_id;

  useEffect(() => {
    if (!data && patientId) {
      setLoading(true);
      axiosInstance.get(`/patientsapi/patient_detail/${patientId}/`)
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch patient:", err);
          setError("Could not load patient record");
          setLoading(false);
        });
    }
  }, [patientId, data]);

  const handleBookAppointment = () => {
    setShowAppointmentModal(true);
  };

  const handleAppointmentScheduled = () => {
    showMessage("Appointment scheduled successfully!", "success");
  };

  const handlePatientTransferred = () => {
    showMessage("Patient transferred successfully!", "success");
    refreshPatientData();
  };

  const handleDischargeSuccess = () => {
    showMessage("Patient discharged successfully!", "success");
    refreshPatientData();
  };

  const refreshPatientData = () => {
    if (patientId) {
      axiosInstance.get(`/patientsapi/patient_detail/${patientId}/`)
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => {
          console.error("Failed to refresh patient data:", err);
        });
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full"></div>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-700">Loading patient record...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md p-5 bg-gradient-to-br from-white to-red-50 rounded-xl border border-red-200 shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-1.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
              <span className="text-white">⚠️</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">Error Loading Patient</h3>
              <p className="text-xs text-gray-600">We couldn't load the patient record</p>
            </div>
          </div>
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:shadow transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No Data State
  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md p-5 bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-200 shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <span className="text-white">ℹ️</span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">No Patient Data</h3>
              <p className="text-xs text-gray-600">Patient record not found</p>
            </div>
          </div>
          <Link
            to="/patient-registration"
            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:shadow transition-all"
          >
            <span>➕</span>
            <span>Register New Patient</span>
          </Link>
        </div>
      </div>
    );
  }

  const { residential_address_data, permanent_address_data, next_of_kin_data } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-3 md:p-4">
      {/* Header */}
      <div className="mb-4 md:mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Patient Summary
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Complete overview for {data.user_info.first_name} {data.user_info.last_name}
            </p>
          </div>
          
          <div className="flex items-center">
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <span className="text-xs font-medium text-blue-700">
                Updated: {new Date(data.date_created).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 md:space-y-5">
        <PatientProfileCard 
          patient={data} 
          onBookAppointment={handleBookAppointment}
          onDischargeSuccess={handleDischargeSuccess}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={data.status}>
              {data.status || 'Active'}
            </StatusBadge>
            {data.active_visit && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-emerald-700">
                  Currently in {inWard ? 'Ward' : 'Clinic'}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleBookAppointment}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-lg shadow hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>📅</span>
              <span>Book Appointment</span>
            </button>
            
            {!inWard && (
              <button 
                onClick={() => setShowSendModal(true)}
                className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-lg shadow hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>🚶</span>
                <span>{inClinic ? "Transfer Patient" : "Send to Clinic"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <ContactInfoSection
          residential={residential_address_data}
          permanent={permanent_address_data}
          kin={next_of_kin_data}
        />

        {/* Additional Stats / Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg border border-blue-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-600">📊</span>
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full">
                Visits
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800 mt-1.5">0</p>
            <p className="text-xs text-gray-500">Total visits</p>
          </div>
          
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg border border-emerald-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-emerald-600">💊</span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800 mt-1.5">0</p>
            <p className="text-xs text-gray-500">Prescriptions</p>
          </div>
          
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-lg border border-purple-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-purple-600">📝</span>
              <span className="text-xs font-medium text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full">
                Recent
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800 mt-1.5">0</p>
            <p className="text-xs text-gray-500">Notes</p>
          </div>
          
          <div className="bg-gradient-to-br from-white to-amber-50 rounded-lg border border-amber-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-amber-600">⚕️</span>
              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                Assigned
              </span>
            </div>
            <p className="text-lg font-bold text-gray-800 mt-1.5">0</p>
            <p className="text-xs text-gray-500">Doctors</p>
          </div>
        </div>
      </div>

      {/* Send Patient Modal */}
      {showSendModal && (
        <SendPatientModal
          show={showSendModal}
          patient={data}
          onClose={() => setShowSendModal(false)}
          onSuccess={handlePatientTransferred}
        />
      )}

      {/* Schedule Appointment Modal */}
      {showAppointmentModal && (
        <ScheduleAppointmentModal
          show={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          onAppointmentScheduled={handleAppointmentScheduled}
          preSelectedPatient={data}
        />
      )}

      {/* Footer Note */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <p className="text-center text-xs text-gray-500">
          <span className="font-medium text-blue-600">PID-{data.id}</span> • 
          <span className="mx-1">Last accessed: {new Date().toLocaleDateString()}</span> • 
          <span className="text-emerald-600 font-medium">✓ Secured</span>
        </p>
      </div>
    </div>
  );
};

export default PatientSummary;