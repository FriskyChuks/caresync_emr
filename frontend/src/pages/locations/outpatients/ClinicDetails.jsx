// src/pages/clinics/ClinicDetails.js
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import SendPatientModal from "../../encounters/SendPatientModal";
import DischargeAction from "../../encounters/discharge/DischargeAction";
import TransferDetailsModal from "../../encounters/TransferDetailsModal";

const ClinicDetails = () => {
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showTransferDetailsModal, setShowTransferDetailsModal] = useState(false);
  const [transferDetailsData, setTransferDetailsData] = useState(null);
  const [transferDetailsType, setTransferDetailsType] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-10 h-10 border-3 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-3 text-blue-600 font-medium text-sm">Loading clinic...</p>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  // Patient Image Component
  const PatientImage = ({ patient, className = "w-10 h-10" }) => {
    const userInfo = patient && patient.user_info;
    const gender = (userInfo && userInfo.gender && userInfo.gender.title) || (patient && patient.gender);
    const genderLower = gender ? gender.toLowerCase() : '';
    const isMale = genderLower === 'male';
    const isFemale = genderLower === 'female';
    
    // Check if patient has a profile image
    const hasImage = (userInfo && userInfo.profile_picture) || (patient && patient.profile_picture);
    const imageUrl = hasImage ? `/api/media/${(userInfo && userInfo.profile_picture) || (patient && patient.profile_picture)}` : null;

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          className={`${className} rounded-lg object-cover border border-gray-200 shadow-sm`}
          alt={`${(userInfo && userInfo.first_name) || 'Patient'}`}
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextElementSibling) {
              e.target.nextElementSibling.style.display = 'flex';
            }
          }}
        />
      );
    }

    // Gender-based placeholders
    if (isMale) {
      return (
        <div className={`${className} rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-sm`}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
    } else if (isFemale) {
      return (
        <div className={`${className} rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-sm`}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.5a9 9 0 01-18 0" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className={`${className} rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-sm`}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
    }
  };

  const patientCount = filtered.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      {/* Updating overlay */}
      {updating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-8 h-8 border-3 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-2 text-blue-600 font-medium text-sm">Updating...</p>
          </div>
        </div>
      )}

      {/* Compact Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 shadow-lg mb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{clinic.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue-100 bg-white/20 px-2 py-0.5 rounded">
                    {patientCount} patient{patientCount !== 1 ? 's' : ''}
                  </span>
                  {clinic.capacity && (
                    <span className="text-xs text-emerald-100 bg-emerald-500/30 px-2 py-0.5 rounded">
                      {clinic.capacity} beds
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  className="w-full sm:w-48 px-3 pl-9 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-1 focus:ring-white/50"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
                  <svg className="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <Link
                to="/clinics"
                className="px-3 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-xs font-medium text-white transition-colors whitespace-nowrap"
              >
                ← All Clinics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Patient Cards Grid */}
      <div className="max-w-7xl mx-auto">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
                >
                  {/* Status Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                    {hasPendingTransfer && (
                      <button
                        onClick={() => {
                          setTransferDetailsData(p);
                          setTransferDetailsType("pending");
                          setShowTransferDetailsModal(true);
                        }}
                        className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-md shadow-xs hover:shadow-sm transition-all"
                        title="View pending transfer details"
                      >
                        <div className="flex items-center gap-1">
                          <svg className="w-2 h-2 animate-pulse" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="4" />
                          </svg>
                          Pending
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
                        className="px-2 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-medium rounded-md shadow-xs hover:shadow-sm transition-all"
                        title="View transfer rejection details"
                      >
                        <div className="flex items-center gap-1">
                          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rejected
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Patient Info */}
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Patient Image with Gender Indicator */}
                      <div className="relative">
                        <PatientImage patient={p} className="w-10 h-10" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white ${
                          isMale ? 'bg-blue-500' : 
                          isFemale ? 'bg-pink-500' : 'bg-gray-400'
                        }`}>
                          {isMale ? 'M' : isFemale ? 'F' : '?'}
                        </div>
                      </div>

                      {/* Patient Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">
                              {fullName || "Unnamed"}
                            </h3>
                            {hasPendingTransfer && (
                              <p className="text-xs text-amber-600 mt-0.5 truncate">
                                Awaiting transfer
                              </p>
                            )}
                            {hasRejectedTransfer && (
                              <p className="text-xs text-red-600 mt-0.5 truncate">
                                Transfer rejected
                              </p>
                            )}
                          </div>
                          
                          {/* Quick Actions - UPDATED SECTION */}
                          <div className="flex items-center gap-1 ml-2">
                            {/* Transfer Button - Show only when NO pending transfer */}
                            {hasGender && !hasPendingTransfer ? (
                              <button
                                onClick={() => {
                                  setSelectedPatient(p);
                                  setShowModal(true);
                                }}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                                title="Transfer patient"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </button>
                            ) : !hasGender ? (
                              <span
                                className="p-1 text-amber-500 cursor-help"
                                title="Update gender before transfer"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </span>
                            ) : null}

                            {/* Info Icon for Transfer Status - Show for both pending and rejected */}
                            {(hasPendingTransfer || hasRejectedTransfer) && (
                              <button
                                onClick={() => {
                                  if (hasPendingTransfer) {
                                    setTransferDetailsData(p);
                                    setTransferDetailsType("pending");
                                    setShowTransferDetailsModal(true);
                                  } else if (hasRejectedTransfer) {
                                    setTransferDetailsData(p);
                                    setTransferDetailsType("rejected");
                                    setShowTransferDetailsModal(true);
                                  }
                                }}
                                className="p-1 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                                title={hasPendingTransfer ? "View pending transfer details" : "View rejection details"}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}

                            {/* Discharge Action */}
                            {p.active_visit && (
                              <div className="ml-0.5">
                                <DischargeAction
                                  visit={p.active_visit}
                                  onSuccess={fetchClinicAndPatients}
                                  compact={true}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Patient Metadata - Ultra Compact */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 mb-2">
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                            ID: {p.id}
                          </span>
                          {p.age && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                              {p.age}y
                            </span>
                          )}
                          {!hasGender && (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded flex items-center gap-0.5">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Gender
                            </span>
                          )}
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/patient/folder/${p.id}`}
                              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Patient Folder"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                            </Link>

                            <Link
                              to={`/clerking/${p.id}`}
                              className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Clerking"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </Link>

                            <Link
                              to={`/create-triage/${p.id}`}
                              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Vitals"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </Link>

                            {/* ENT Icon */}
                            {showENTIcon && (
                              <Link
                                to={`/ent/entclerking/${p.id}`}
                                className="p-1 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-md transition-colors"
                                title="ENT Clerking"
                              >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 3
                                    C8 3,5 6,5 10
                                    C5 13,7 15,9 16
                                    C10.5 17,11 18,11 19
                                    C11 20.5,12 21,13 21
                                    C14.5 21,16 20,16 18.5
                                    C16 17,15 16,14 15
                                    C13 14,12 13.5,12 12
                                    C12 11,13 10,14 9
                                    C15 8,16 7,16 6
                                    C16 4.5,14.5 3,12 3Z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10 10
                                    C10 8.5,11.5 7.5,13 8
                                    C14.5 8.5,14.5 10,13.5 11
                                    C12.5 12,11 12.5,11 14"
                                />
                              </svg>
                              </Link>
                            )}

                            {/* Pregnancy Icon */}
                            {showPregnancyIcon && (
                              <Link
                                to={`/antenatal-dashboard/${p.id}`}
                                className="p-1 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-md transition-colors"
                                title="Antenatal Form"
                              >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0112 0c0 .459-.031.909-.086 1.333A5 5 0 0010 11z" clipRule="evenodd" />
                                </svg>
                              </Link>
                            )}
                          </div>

                          {/* Status Indicator */}
                          <div className="text-xs">
                            <span className={`px-1.5 py-0.5 rounded ${
                              p.active_visit ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {p.active_visit ? 'Active' : 'Inactive'}
                            </span>
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
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.5a9 9 0 01-18 0" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              {searchTerm ? "No matching patients" : "No patients in clinic"}
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {searchTerm 
                ? `No results for "${searchTerm}"`
                : "Patients will appear here when admitted"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
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