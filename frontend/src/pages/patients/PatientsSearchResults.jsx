import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const PatientSearchResults = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    axiosInstance
      .get(`/patientsapi/patient_search/?q=${query}`)
      .then((res) => {
        setPatients(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search failed:", err);
        setError("Failed to fetch search results.");
        setLoading(false);
      });
  }, [query]);

  // Helper function to get patient photo URL
  const getPatientPhoto = (patient) => {
    const pdata = patient.patient_data || {};
    // Check if photo exists in patient_data
    if (pdata.photo) {
      return pdata.photo;
    }
    // Check if photo exists directly on patient (some APIs might return it here)
    if (patient.photo) {
      return patient.photo;
    }
    // Return null if no photo - will use default avatar
    return null;
  };

  // Helper function to get gender-based default avatar
  const getDefaultAvatar = (patient) => {
    const pdata = patient.patient_data || {};
    const gender = pdata.gender?.title?.toLowerCase() || patient.gender?.title?.toLowerCase();
    
    if (gender === 'female') {
      return "/assets/images/patients/female-default.jpg";
    }
    return "/assets/images/patients/male-default.jpg";
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = patients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(patients.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Loading Component
  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full"></div>
          </div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700">Searching patients...</p>
        <p className="text-sm text-gray-500">Looking for "{query}"</p>
      </div>
    );
  }

  // Error Component
  if (error) {
    return (
      <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl border border-red-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
            <span className="text-white">⚠️</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Search Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No Results Component
  if (patients.length === 0 && query) {
    return (
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-200 p-8">
        <div className="text-center">
          <div className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mb-4">
            <span className="text-3xl text-blue-600">🔍</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Patients Found</h3>
          <p className="text-gray-600 mb-4">
            No patients found for "<span className="font-medium text-blue-600">{query}</span>"
          </p>
          <div className="text-sm text-gray-500">
            Try searching with a different name, phone number, or patient ID
          </div>
        </div>
      </div>
    );
  }

  // Main Results Component
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Patient Search Results
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">
                    {query ? `"${query}"` : "All Patients"}
                  </span>
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg">
                  <span className="text-sm font-medium text-emerald-700">
                    {patients.length} {patients.length === 1 ? 'Patient' : 'Patients'} Found
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-gradient-to-r from-white to-blue-50 rounded-xl border border-blue-200">
                <span className="text-sm text-gray-600">
                  Page <span className="font-semibold text-blue-600">{currentPage}</span> of <span className="font-semibold text-blue-600">{totalPages}</span>
                </span>
              </div>
              <Link
                to="/patient-registration"
                className="group inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <span>➕</span>
                <span>New Patient</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200 overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="text-left p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">👤</span>
                      <span className="text-sm font-semibold text-gray-700">Patient</span>
                    </div>
                  </th>
                  <th className="text-left p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">🎂</span>
                      <span className="text-sm font-semibold text-gray-700">Age</span>
                    </div>
                  </th>
                  <th className="text-left p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">📱</span>
                      <span className="text-sm font-semibold text-gray-700">Contact</span>
                    </div>
                  </th>
                  <th className="text-left p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">📍</span>
                      <span className="text-sm font-semibold text-gray-700">Location</span>
                    </div>
                  </th>
                  <th className="text-left p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">⚡</span>
                      <span className="text-sm font-semibold text-gray-700">Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentPatients.map((patient, index) => {
                  const pdata = patient.patient_data || {};
                  const activeVisit = pdata.active_visit || null;
                  const location = activeVisit?.current_location || null;
                  const locationName = location
                    ? location.clinic || location.ward
                    : null;
                  const locationLink = location
                    ? location.clinic_id
                      ? `/clinic-details/${location.clinic_id}`
                      : `/ward-details/${location.ward_id}`
                    : "#";

                  // Get photo URL for this patient
                  const photoUrl = getPatientPhoto(patient);
                  const defaultAvatar = getDefaultAvatar(patient);

                  return (
                    <tr 
                      key={patient.id}
                      className={`group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 ${
                        !activeVisit ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      {/* Patient Cell */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {/* Avatar with actual photo */}
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                              activeVisit 
                                ? 'from-blue-100 to-indigo-100 border border-blue-200' 
                                : 'from-gray-100 to-gray-200 border border-gray-200'
                            } overflow-hidden`}>
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  className="w-full h-full object-cover"
                                  alt={`${patient.first_name} ${patient.last_name}`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultAvatar;
                                  }}
                                />
                              ) : (
                                <img
                                  src={defaultAvatar}
                                  className="w-full h-full object-cover"
                                  alt={`${patient.first_name} ${patient.last_name}`}
                                />
                              )}
                            </div>
                            {activeVisit && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>

                          {/* Patient Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/patient-summary/${pdata.id || patient.id}`}
                              className="block group-hover:text-blue-600 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-800 truncate">
                                  {patient.first_name} {patient.last_name}
                                </span>
                                {!activeVisit && (
                                  <span className="text-xs text-gray-400">(Inactive)</span>
                                )}
                              </div>
                            </Link>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                PID-{pdata.id || patient.id}
                              </span>
                              {pdata.gender && (
                                <span className="text-xs text-gray-500">
                                  • {pdata.gender.title}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Age Cell */}
                      <td className="p-4">
                        <div className="space-y-1">
                          {pdata.date_of_birth ? (
                            <>
                              <div className="text-sm font-medium text-gray-800">
                                {pdata.age} years
                              </div>
                              <div className="text-xs text-gray-500">
                                {pdata.date_of_birth}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Contact Cell */}
                      <td className="p-4">
                        <div className="space-y-1">
                          {pdata.phone ? (
                            <a
                              href={`tel:${pdata.phone}`}
                              className="inline-flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <span>📱</span>
                              <span>{pdata.phone}</span>
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                          {patient.email && (
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location Cell */}
                      <td className="p-4">
                        <div className="space-y-2">
                          {activeVisit ? (
                            <div>
                              <Link
                                to={locationLink}
                                className="inline-flex items-center space-x-2 group/link"
                              >
                                <div className={`p-2 rounded-lg ${
                                  location?.clinic_id 
                                    ? 'bg-emerald-100 text-emerald-600' 
                                    : 'bg-amber-100 text-amber-600'
                                }`}>
                                  {location?.clinic_id ? '🏥' : '🏨'}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700 group-hover/link:text-blue-600 transition-colors">
                                    {locationName}
                                  </span>
                                  {location?.room && (
                                    <div className="text-xs text-gray-500">
                                      Room {location.room}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </div>
                          ) : (
                            <div className="inline-flex items-center space-x-2">
                              <div className="p-2 bg-gray-100 text-gray-400 rounded-lg">
                                <span>📍</span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-400">No Active Visit</span>
                                <div className="text-xs text-gray-400">
                                  Last visit: —
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions Cell */}
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/patient-summary/${pdata.id || patient.id}`}
                            className="group/btn inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all duration-300"
                            title="View Patient Summary"
                          >
                            <span className="group-hover/btn:scale-110 transition-transform">👁️</span>
                            <span className="text-sm font-medium">View</span>
                          </Link>
                          
                          {/* <Link
                            to={`/billing/lab-desk-officer/${pdata.id || patient.id}`}
                            className="group/btn inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 rounded-lg border border-emerald-200 hover:border-emerald-300 hover:shadow-sm transition-all duration-300"
                            title="Billing & Lab"
                          >
                            <span className="group-hover/btn:scale-110 transition-transform">💰</span>
                            <span className="text-sm font-medium">Billing</span>
                          </Link> */}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-blue-600">{indexOfFirstItem + 1}</span>-
                  <span className="font-semibold text-blue-600">
                    {Math.min(indexOfLastItem, patients.length)}
                  </span> of <span className="font-semibold text-blue-600">{patients.length}</span> patients
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:shadow-sm'
                    }`}
                  >
                    ← Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="text-gray-400">...</span>
                        <button
                          onClick={() => paginate(totalPages)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                            currentPage === totalPages
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:shadow-sm'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                <span className="text-blue-600">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{patients.length}</p>
                <p className="text-sm text-gray-600">Total Patients</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl border border-emerald-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg">
                <span className="text-emerald-600">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {patients.filter(p => p.patient_data?.active_visit).length}
                </p>
                <p className="text-sm text-gray-600">Active Visits</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <span className="text-purple-600">🏥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {patients.filter(p => p.patient_data?.active_visit?.current_location?.clinic_id).length}
                </p>
                <p className="text-sm text-gray-600">In Clinic</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl border border-amber-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
                <span className="text-amber-600">🏨</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {patients.filter(p => p.patient_data?.active_visit?.current_location?.ward_id).length}
                </p>
                <p className="text-sm text-gray-600">In Ward</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            <span className="font-medium text-blue-600">Search Query:</span> "{query}" • 
            <span className="text-emerald-600 font-medium ml-2">✓ Secure Search</span> • 
            Results updated in real-time
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientSearchResults;