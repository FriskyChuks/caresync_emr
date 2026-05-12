// src/locations/outpatients/ClinicDetails.jsx
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import SendPatientModal from "../../encounters/SendPatientModal";
import DischargeAction from "../../encounters/discharge/DischargeAction";
import TransferDetailsModal from "../../encounters/TransferDetailsModal";
import PatientFolderButton from "../components/PatientFolderButton";

const ClinicDetails = () => {
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showTransferDetailsModal, setShowTransferDetailsModal] = useState(false);
  const [transferDetailsData, setTransferDetailsData] = useState(null);
  const [transferDetailsType, setTransferDetailsType] = useState(null);
  
  const PregnancyHeartIcon = ({ className = "w-4 h-4" }) => (
        <span className="group-hover:scale-110 transition-transform inline-block">
          🤰
        </span>
  );

  const fetchClinicAndPatients = async () => {
    try {
      setUpdating(true);
      const res = await axiosInstance.get(`/locationsapi/clinics/${id}/`);
      setClinic(res.data);
      const pres = await axiosInstance.get(`/locationsapi/clinics/${id}/patients/`);
      setPatients(pres.data || []);
    } catch (error) {
      console.error("Error fetching clinic or patients!", error);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchClinicAndPatients();
  }, [id]);

  // Helper function to get patient photo URL
  const getPatientPhoto = (patient) => {
    const userInfo = patient?.user_info || {};
    // Check in user_info
    if (userInfo.profile_picture) {
      return userInfo.profile_picture;
    }
    // Check directly on patient
    if (patient?.photo) {
      return patient.photo;
    }
    // Check in patient_data
    if (patient?.patient_data?.photo) {
      return patient.patient_data.photo;
    }
    return null;
  };

  // Helper function to get gender-based default avatar
  const getDefaultAvatar = (patient) => {
    const userInfo = patient?.user_info || {};
    const gender = userInfo?.gender?.title?.toLowerCase() || patient?.gender?.title?.toLowerCase();
    
    if (gender === 'female') {
      return '/assets/images/patients/female-default.jpg';
    }
    return '/assets/images/patients/male-default.jpg';
  };

  // Patient Image Component with actual photos
  const PatientImage = ({ patient, className = "w-12 h-12", showStatus = false }) => {
    const userInfo = patient?.user_info || {};
    const gender = userInfo?.gender?.title?.toLowerCase() || patient?.gender?.title?.toLowerCase();
    const isMale = gender === 'male';
    const isFemale = gender === 'female';
    
    const photoUrl = getPatientPhoto(patient);
    const defaultAvatar = getDefaultAvatar(patient);
    const hasActiveVisit = patient?.active_visit;

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
              alt={userInfo?.first_name || patient?.first_name || 'Patient'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultAvatar;
              }}
            />
          ) : (
            <img
              src={defaultAvatar}
              className="w-full h-full object-cover"
              alt={userInfo?.first_name || patient?.first_name || 'Patient'}
            />
          )}
        </div>
        {showStatus && hasActiveVisit && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-12 h-12 border-3 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-3 border-purple-500 border-r-transparent rounded-full animate-spin" style={{ animationDirection: "reverse" }}></div>
          </div>
          <p className="mt-3 text-blue-600 font-medium text-sm">Loading clinic...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Clinic Not Found</h3>
          <Link
            to="/clinics"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Clinics
          </Link>
        </div>
      </div>
    );
  }

  // Search filter
  const q = searchTerm.trim().toLowerCase();
  const filtered = q
    ? patients.filter((p) => {
        const fullName = String(
          (p.user_info && p.user_info.fullname) ||
            `${p.user_info && p.user_info.first_name || ""} ${p.user_info && p.user_info.last_name || ""}`
        ).toLowerCase();
        return (
          fullName.includes(q) ||
          String(p && p.id || "").includes(q) ||
          String(p && p.age || "").includes(q) ||
          String(p && p.phone || "").toLowerCase().includes(q)
        );
      })
    : patients;

  // ANC check
  const clinicNameNormalized = String(clinic && clinic.name || "").toLowerCase();
  const viewingANC = clinicNameNormalized.includes("anc") || clinicNameNormalized.includes("antenatal");
  const viewingENT = clinicNameNormalized.includes("ent") || clinicNameNormalized.includes("ent");

  const patientCount = filtered.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Updating overlay */}
      {updating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-10 h-10 border-3 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-2 text-blue-600 font-medium text-sm">Updating...</p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative mb-3 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 shadow-lg">
  <div className="relative px-3 py-2.5">
    <div className="flex flex-col gap-2">
      {/* Top Row - Clinic Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-white truncate">{clinic.name}</h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[10px] text-white">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {patientCount} patient{patientCount !== 1 ? 's' : ''}
              </span>
              {clinic.capacity && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-500/40 backdrop-blur-sm rounded-full text-[10px] text-white">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {clinic.capacity} beds
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-1.5 flex-shrink-0">
          <Link
            to="/clinics"
            className="px-2 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-[10px] font-medium text-white transition-all whitespace-nowrap"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Search and View Toggle - Row */}
      <div className="flex items-center gap-2 mt-0.5">
        <div className="relative flex-1">
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full pl-7 pr-2 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 text-xs focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* View Toggle Buttons */}
        <div className="flex gap-1 bg-white/20 backdrop-blur-sm rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1 rounded-md transition-all ${viewMode === "grid" ? "bg-white/30 text-white shadow-sm" : "text-white/70 hover:text-white"}`}
            title="Grid View"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM14 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1 rounded-md transition-all ${viewMode === "list" ? "bg-white/30 text-white shadow-sm" : "text-white/70 hover:text-white"}`}
            title="List View"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-2">
        {filtered.length > 0 ? (
          viewMode === "grid" ? (
            /* GRID VIEW - Enhanced Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((p) => {
                const userInfo = p && p.user_info;
                const firstName = userInfo && userInfo.first_name || "";
                const lastName = userInfo && userInfo.last_name || "";
                const fullName = `${firstName} ${lastName}`.trim();
                const genderTitle = userInfo && userInfo.gender && userInfo.gender.title;
                const activeClinic = p && p.active_visit && p.active_visit.current_location && p.active_visit.current_location.clinic;
                const showPregnancyIcon = viewingANC && activeClinic && (activeClinic.toLowerCase().includes("anc") || activeClinic.toLowerCase().includes("antenatal"));
                const showENTIcon = viewingENT && activeClinic && (activeClinic.toLowerCase().includes("ent") || activeClinic.toLowerCase().includes("ent"));
                const hasGender = !!genderTitle;
                const hasPendingTransfer = p && p.active_transfer && p.active_transfer.status === "pending";
                const hasRejectedTransfer = p && p.transfer_request_status && p.transfer_request_status.status === "rejected";
                const isMale = genderTitle && genderTitle.toLowerCase() === 'male';
                const isFemale = genderTitle && genderTitle.toLowerCase() === 'female';

                return (
                  <div
                    key={p.id}
                    className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
                  >
                    {/* Gradient Top Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                      hasPendingTransfer ? 'from-amber-400 to-orange-500' :
                      hasRejectedTransfer ? 'from-red-400 to-pink-500' :
                      isMale ? 'from-blue-400 to-indigo-500' :
                      isFemale ? 'from-pink-400 to-rose-500' :
                      'from-gray-400 to-gray-500'
                    }`}></div>

                    {/* Status Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                      {hasPendingTransfer && (
                        <button
                          onClick={() => {
                            setTransferDetailsData(p);
                            setTransferDetailsType("pending");
                            setShowTransferDetailsModal(true);
                          }}
                          className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            Pending Transfer
                          </div>
                        </button>
                      )}
                      {hasRejectedTransfer && (
                        <button
                          onClick={() => {
                            setTransferDetailsData(p);
                            setTransferDetailsType("rejected");
                            setShowTransferDetailsModal(true);
                          }}
                          className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow transition-all"
                        >
                          <div className="flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Transfer Rejected
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <PatientImage patient={p} className="w-14 h-14" showStatus={true} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h3 className="text-base font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                                {fullName || "Unnamed"}
                              </h3>
                              {hasPendingTransfer && (
                                <p className="text-xs text-amber-600 mt-0.5 font-medium">Awaiting transfer</p>
                              )}
                              {hasRejectedTransfer && (
                                <p className="text-xs text-red-600 mt-0.5 font-medium">Transfer rejected</p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {/* Transfer Button */}
                              {hasGender && !hasPendingTransfer ? (
                                <button
                                  onClick={() => {
                                    setSelectedPatient(p);
                                    setShowModal(true);
                                  }}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Transfer patient"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                </button>
                              ) : !hasGender ? (
                                <span className="p-1.5 text-amber-500 cursor-help" title="Update gender before transfer">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Patient Metadata */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs mb-3">
                            <span className="px-2 py-0.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full font-medium">
                              {p.patient_number}
                            </span>
                            {p.age && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                                {p.age} years
                              </span>
                            )}
                            {!hasGender && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full flex items-center gap-0.5">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                No Gender
                              </span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              {/* Patient Folder Button */}
                              <PatientFolderButton patientId={p.id} className="p-1.5" />
                              
                              {/* ENT Icon */}
                              {showENTIcon && (
                                <Link
                                  to={`/ent/entclerking/${p.id}`}
                                  className="p-1.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                  title="ENT Clerking"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3C8 3,5 6,5 10C5 13,7 15,9 16C10.5 17,11 18,11 19C11 20.5,12 21,13 21C14.5 21,16 20,16 18.5C16 17,15 16,14 15C13 14,12 13.5,12 12C12 11,13 10,14 9C15 8,16 7,16 6C16 4.5,14.5 3,12 3Z" />
                                  </svg>
                                </Link>
                              )}

                              {/* Pregnancy Icon - Using the beautiful SVG icon */}
                              {showPregnancyIcon && (
                                <Link
                                  to={`/antenatal-dashboard/${p.id}`}
                                  className="p-1.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors group relative"
                                  title="Antenatal Care"
                                >
                                  <PregnancyHeartIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </Link>
                              )}
                            </div>
                            
                            {/* Status Indicator & Discharge */}
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                p.active_visit ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {p.active_visit ? 'Active' : 'Inactive'}
                              </span>
                              {p.active_visit && (
                                <DischargeAction
                                  visit={p.active_visit}
                                  onSuccess={fetchClinicAndPatients}
                                  compact={true}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW - Enhanced Table */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((p) => {
                      const userInfo = p && p.user_info;
                      const firstName = userInfo && userInfo.first_name || "";
                      const lastName = userInfo && userInfo.last_name || "";
                      const fullName = `${firstName} ${lastName}`.trim();
                      const genderTitle = userInfo && userInfo.gender && userInfo.gender.title;
                      const activeClinic = p && p.active_visit && p.active_visit.current_location && p.active_visit.current_location.clinic;
                      const showPregnancyIcon = viewingANC && activeClinic && (activeClinic.toLowerCase().includes("anc") || activeClinic.toLowerCase().includes("antenatal"));
                      const showENTIcon = viewingENT && activeClinic && (activeClinic.toLowerCase().includes("ent") || activeClinic.toLowerCase().includes("ent"));
                      const hasPendingTransfer = p && p.active_transfer && p.active_transfer.status === "pending";
                      const hasRejectedTransfer = p && p.transfer_request_status && p.transfer_request_status.status === "rejected";
                      const hasGender = !!genderTitle;
                      const isMale = genderTitle && genderTitle.toLowerCase() === 'male';
                      const isFemale = genderTitle && genderTitle.toLowerCase() === 'female';

                      return (
                        <tr key={p.id} className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all ${hasPendingTransfer ? 'bg-gradient-to-r from-amber-50/30 to-orange-50/20' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <PatientImage patient={p} className="w-10 h-10" showStatus={true} />
                              <div>
                                <div className="font-semibold text-gray-800">{fullName || "Unnamed"}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {p.age && <span className="text-xs text-gray-500">{p.age} years</span>}
                                  {genderTitle && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                      isMale ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                                    }`}>
                                      {genderTitle}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm-bold font-mono text-gray-600">{p.patient_number}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="text-sm text-gray-600">{p.phone || "—"}</div>
                            <div className="text-xs text-gray-400 truncate max-w-[150px]">
                              {p.user_info?.email || "—"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-medium ${
                                p.active_visit ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {p.active_visit ? 'Active' : 'Inactive'}
                              </span>
                              {hasPendingTransfer && (
                                <button
                                  onClick={() => {
                                    setTransferDetailsData(p);
                                    setTransferDetailsType("pending");
                                    setShowTransferDetailsModal(true);
                                  }}
                                  className="inline-flex w-fit items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full hover:bg-amber-200 transition-colors"
                                >
                                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                  Pending Transfer
                                </button>
                              )}
                              {hasRejectedTransfer && (
                                <button
                                  onClick={() => {
                                    setTransferDetailsData(p);
                                    setTransferDetailsType("rejected");
                                    setShowTransferDetailsModal(true);
                                  }}
                                  className="inline-flex w-fit items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full hover:bg-red-200 transition-colors"
                                >
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Transfer Rejected
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <PatientFolderButton patientId={p.id} className="p-1.5" />
                              
                              {showENTIcon && (
                                <Link
                                  to={`/ent/entclerking/${p.id}`}
                                  className="p-1.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                  title="ENT Clerking"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3C8 3,5 6,5 10C5 13,7 15,9 16C10.5 17,11 18,11 19C11 20.5,12 21,13 21C14.5 21,16 20,16 18.5C16 17,15 16,14 15C13 14,12 13.5,12 12C12 11,13 10,14 9C15 8,16 7,16 6C16 4.5,14.5 3,12 3Z" />
                                  </svg>
                                </Link>
                              )}
                              
                              {/* Pregnancy Icon - Using the beautiful SVG icon (same as grid view) */}
                              {showPregnancyIcon && (
                                <Link
                                  to={`/antenatal-dashboard/${p.id}`}
                                  className="p-1.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors group relative"
                                  title="Antenatal Care"
                                >
                                  <PregnancyHeartIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </Link>
                              )}
                              
                              {hasGender && !hasPendingTransfer && (
                                <button
                                  onClick={() => {
                                    setSelectedPatient(p);
                                    setShowModal(true);
                                  }}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Transfer patient"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                                </button>
                              )}
                              
                              {p.active_visit && (
                                <DischargeAction
                                  visit={p.active_visit}
                                  onSuccess={fetchClinicAndPatients}
                                  compact={true}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.5a9 9 0 01-18 0" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {searchTerm ? "No matching patients" : "No patients in clinic"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm 
                ? `No results found for "${searchTerm}"`
                : "Patients will appear here when admitted to this clinic"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && selectedPatient && (
        <SendPatientModal
          show={showModal}
          onClose={() => setShowModal(false)}
          patient={selectedPatient}
          onSuccess={fetchClinicAndPatients}
        />
      )}

      {showTransferDetailsModal && (
        <TransferDetailsModal
          show={showTransferDetailsModal}
          onClose={() => {
            setShowTransferDetailsModal(false);
            setTransferDetailsData(null);
            setTransferDetailsType(null);
          }}
          data={transferDetailsData}
          type={transferDetailsType}
        />
      )}
    </div>
  );
};

export default ClinicDetails;