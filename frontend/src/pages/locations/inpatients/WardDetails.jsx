// src/locations/inpatients/WardDetails.jsx
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import dayjs from "dayjs";
import SendPatientModal from "../../encounters/SendPatientModal";
import AcceptTransferModal from "../../encounters/AcceptTransferModal";
import RejectTransferModal from "../../encounters/RejectTransferModal";
import TransferDetailsModal from "../../encounters/TransferDetailsModal";
import DischargeAction from "../../encounters/discharge/DischargeAction";
import PatientFolderButton from "../components/PatientFolderButton";

const WardDetails = () => {
  const { id } = useParams();
  const [ward, setWard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectTransfer, setSelectedRejectTransfer] = useState(null);
  const [showTransferDetailsModal, setShowTransferDetailsModal] = useState(false);
  const [transferDetailsData, setTransferDetailsData] = useState(null);
  const [transferDetailsType, setTransferDetailsType] = useState(null);

  const fetchWardDetails = async () => {
    try {
      setUpdating(true);
      const [wardRes, patientsRes, transfersRes] = await Promise.all([
        axiosInstance.get(`/locationsapi/wards/${id}/`),
        axiosInstance.get(`/locationsapi/wards/${id}/patients/`),
        axiosInstance.get(`/encounterapi/wards/${id}/incoming-transfers/`)
      ]);
      
      setWard(wardRes.data);
      setPatients(patientsRes.data || []);
      setIncomingTransfers(transfersRes.data || []);
    } catch (error) {
      console.error("Error fetching ward details:", error);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchWardDetails();
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

    if (photoUrl) {
      return (
        <div className="relative">
          <img
            src={photoUrl}
            className={`${className} rounded-xl object-cover border-2 border-white shadow-md`}
            alt={userInfo?.first_name || patient?.first_name || 'Patient'}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />
          {showStatus && hasActiveVisit && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      );
    }

    // Fallback to gradient avatars
    if (isMale) {
      return (
        <div className="relative">
          <div className={`${className} rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          {showStatus && hasActiveVisit && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      );
    } else if (isFemale) {
      return (
        <div className="relative">
          <div className={`${className} rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.5a9 9 0 01-18 0" />
            </svg>
          </div>
          {showStatus && hasActiveVisit && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      );
    } else {
      return (
        <div className="relative">
          <div className={`${className} rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-md`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          {showStatus && hasActiveVisit && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block mb-3">
            <div className="w-12 h-12 border-3 border-purple-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-3 border-pink-500 border-r-transparent rounded-full animate-spin" style={{ animationDirection: "reverse" }}></div>
          </div>
          <p className="text-sm font-medium text-gray-700">Loading ward dashboard</p>
          <p className="text-xs text-gray-400 mt-1">Fetching patient & transfer data</p>
        </div>
      </div>
    );
  }

  if (!ward) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Ward Not Found</h3>
          <p className="text-gray-600 text-sm mb-4">The requested ward does not exist or has been removed.</p>
          <Link
            to="/wards"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Wards
          </Link>
        </div>
      </div>
    );
  }

  const term = searchTerm.trim().toLowerCase();
  const filteredPatients = patients.filter((p) => {
    const firstName = p.user_info?.first_name || "";
    const lastName = p.user_info?.last_name || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const email = p.user_info?.email || "";
    const phone = p.phone || "";
    const pid = p.id || "";

    return fullName.includes(term) ||
           email.toLowerCase().includes(term) ||
           phone.includes(term) ||
           String(pid).includes(term);
  });

  const handleTransferRemoved = (transferId) => {
    setIncomingTransfers((prev) => prev.filter((tr) => tr.id !== transferId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {updating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block mb-2">
              <div className="w-10 h-10 border-3 border-purple-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-purple-600 font-medium">Updating ward data...</p>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Compact Header */}
      <div className="relative mb-3 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 shadow-lg">
        <div className="relative px-4 py-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9h16v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9zm0 0V6m16 3V6" />
                    <ellipse cx="12" cy="12" rx="1.5" ry="1" strokeWidth="1.5" />
                    <path d="M9 12h6" strokeWidth="1.5" />
                    <path d="M7 15v2m10-2v2" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-bold text-white truncate">{ward.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
                    </span>
                    {incomingTransfers.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/40 backdrop-blur-sm rounded-full text-xs text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        {incomingTransfers.length} transfer{incomingTransfers.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {ward.capacity && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/40 backdrop-blur-sm rounded-full text-xs text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {ward.capacity} beds
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  to="/wards"
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-xs font-medium text-white transition-all whitespace-nowrap"
                >
                  ← Back
                </Link>
              </div>
            </div>

            {/* Search and View Toggle - Row */}
            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex-1">
                <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* View Toggle Buttons */}
              <div className="flex gap-1 bg-white/20 backdrop-blur-sm rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white/30 text-white shadow-sm" : "text-white/70 hover:text-white"}`}
                  title="Grid View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM14 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white/30 text-white shadow-sm" : "text-white/70 hover:text-white"}`}
                  title="List View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Incoming Transfers Panel */}
        {incomingTransfers.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-amber-200 bg-gradient-to-r from-amber-100 to-yellow-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">Incoming Transfers</h3>
                    <p className="text-xs text-amber-700">Patients awaiting admission</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-full">
                  {incomingTransfers.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-50/80 to-yellow-50/80">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-amber-800">Patient</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-amber-800 hidden sm:table-cell">From</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-amber-800">Requested</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-amber-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/50">
                  {incomingTransfers.map((tr) => (
                    <tr key={tr.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">
                              {tr.patient.fullname?.charAt(0) || tr.patient.user_info?.fullname?.charAt(0) || "P"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/patient-summary/${tr.patient.id}`}
                              className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate block"
                            >
                              {tr.patient.fullname || tr.patient.user_info?.fullname}
                            </Link>
                            <div className="text-xs text-gray-500">ID: {tr.patient.patient_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden sm:table-cell">
                        <div className="text-xs text-gray-700 truncate max-w-[100px]">
                          {tr.from_location_name || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="text-xs font-medium text-gray-700">
                          {dayjs(tr.date_created).format("DD MMM")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dayjs(tr.date_created).format("HH:mm")}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white rounded text-xs font-bold transition-all shadow-sm"
                            onClick={() => {
                              setSelectedTransfer(tr);
                              setShowAcceptModal(true);
                            }}
                          >
                            Accept
                          </button>
                          <button
                            className="px-3 py-1 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white rounded text-xs font-bold transition-all shadow-sm"
                            onClick={() => {
                              setSelectedRejectTransfer(tr);
                              setShowRejectModal(true);
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Patients Section */}
        {filteredPatients.length > 0 ? (
          viewMode === "grid" ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPatients.map((p) => {
                const genderTitle = p.user_info?.gender?.title || null;
                const hasTransfer = p.active_transfer?.status === "pending";
                const isRejected = p.transfer_request_status?.status === "rejected";
                const isMale = genderTitle === 'Male';
                const isFemale = genderTitle === 'Female';
                const hasGender = !!genderTitle;
                const room = p.active_visit?.room || "—";
                const bed = p.active_visit?.bed_number || "—";

                return (
                  <div
                    key={p.id}
                    className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200"
                  >
                    {/* Gradient Top Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                      hasTransfer ? 'from-amber-400 to-orange-500' :
                      isRejected ? 'from-red-400 to-pink-500' :
                      isMale ? 'from-blue-400 to-indigo-500' :
                      isFemale ? 'from-pink-400 to-rose-500' :
                      'from-purple-400 to-pink-500'
                    }`}></div>

                    {/* Status Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                      {hasTransfer && (
                        <button
                          onClick={() => {
                            setTransferDetailsData(p);
                            setTransferDetailsType("pending");
                            setShowTransferDetailsModal(true);
                          }}
                          className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-medium rounded-md shadow-sm hover:shadow transition-all"
                        >
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            Pending Transfer
                          </div>
                        </button>
                      )}
                      {isRejected && (
                        <button
                          onClick={() => {
                            setTransferDetailsData(p);
                            setTransferDetailsType("rejected");
                            setShowTransferDetailsModal(true);
                          }}
                          className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[11px] font-medium rounded-md shadow-sm hover:shadow transition-all"
                        >
                          <div className="flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Rejected
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <PatientImage patient={p} className="w-14 h-14" showStatus={true} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h3 className="text-base font-bold text-gray-800 truncate group-hover:text-purple-600 transition-colors">
                                {p.user_info?.first_name} {p.user_info?.last_name}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">{p.patient_number}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-xs font-medium text-gray-600">{p.age || "—"} yrs</span>
                              </div>
                            </div>
                            
                            {/* Transfer Button */}
                            {hasGender && !hasTransfer && !isRejected && (
                              <button
                                onClick={() => {
                                  setSelectedPatient(p);
                                  setShowModal(true);
                                }}
                                className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Transfer patient"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Bed/Room Info */}
                          <div className="flex items-center gap-2 mt-2 mb-3">
                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              room !== "—" ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              🛏️ {room} | Bed {bed}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <PatientFolderButton patientId={p.id} className="p-1.5" />
                              {p.active_visit && (
                                <DischargeAction
                                  visit={p.active_visit}
                                  onSuccess={fetchWardDetails}
                                  compact={true}
                                />
                              )}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.active_visit ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {p.active_visit ? 'Active' : 'Discharged'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Bed/Room</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Patient Details</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-purple-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPatients.map((p) => {
                      const genderTitle = p.user_info?.gender?.title || null;
                      const hasTransfer = p.active_transfer?.status === "pending";
                      const isRejected = p.transfer_request_status?.status === "rejected";
                      const hasGender = !!genderTitle;
                      const room = p.active_visit?.room || "—";
                      const bed = p.active_visit?.bed_number || "—";

                      return (
                        <tr key={p.id} className={`hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/30 transition-all ${hasTransfer ? 'bg-gradient-to-r from-amber-50/30 to-orange-50/20' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                room !== "—" ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-gradient-to-br from-gray-300 to-gray-400'
                              }`}>
                                <span className="text-xs font-bold text-white">{room?.[0] || "—"}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">{room}</div>
                                <div className="text-xs text-gray-500">Bed {bed}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <PatientImage patient={p} className="w-10 h-10" showStatus={true} />
                              <div>
                                <div className="font-semibold text-gray-800 text-sm">
                                  {p.user_info?.first_name} {p.user_info?.last_name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-500">{p.patient_number}</span>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span className="text-xs text-gray-600">{p.age || "—"} years</span>
                                  {genderTitle && (
                                    <>
                                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                      <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                                        genderTitle === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                                      }`}>
                                        {genderTitle}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
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
                              {hasTransfer && (
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
                              {isRejected && (
                                <button
                                  onClick={() => {
                                    setTransferDetailsData(p);
                                    setTransferDetailsType("rejected");
                                    setShowTransferDetailsModal(true);
                                  }}
                                  className="inline-flex w-fit items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full hover:bg-red-200 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                              {hasGender && !hasTransfer && !isRejected && (
                                <button
                                  onClick={() => {
                                    setSelectedPatient(p);
                                    setShowModal(true);
                                  }}
                                  className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
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
                                  onSuccess={fetchWardDetails}
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
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchTerm ? "No matching patients" : "No patients in ward"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm 
                ? `No results found for "${searchTerm}"`
                : "Patients will appear here when admitted to this ward"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
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
          locationType="ward"
          onSuccess={fetchWardDetails}
        />
      )}

      {showAcceptModal && selectedTransfer && (
        <AcceptTransferModal
          show={showAcceptModal}
          onClose={() => setShowAcceptModal(false)}
          transfer={selectedTransfer}
          onSuccess={() => {
            handleTransferRemoved(selectedTransfer.id);
            fetchWardDetails();
          }}
        />
      )}

      {showRejectModal && selectedRejectTransfer && (
        <RejectTransferModal
          show={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedRejectTransfer(null);
          }}
          transfer={selectedRejectTransfer}
          onSuccess={() => {
            handleTransferRemoved(selectedRejectTransfer.id);
            fetchWardDetails();
            setShowRejectModal(false);
            setSelectedRejectTransfer(null);
          }}
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

export default WardDetails;