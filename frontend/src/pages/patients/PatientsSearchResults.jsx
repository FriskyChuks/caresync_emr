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

  const getPatientPhoto = (patient) => {
    const pdata = patient.patient_data || {};
    if (pdata.photo) return pdata.photo;
    if (patient.photo) return patient.photo;
    return null;
  };

  const getDefaultAvatar = (patient) => {
    const pdata = patient.patient_data || {};
    const gender = pdata.gender?.title?.toLowerCase() || patient.gender?.title?.toLowerCase();
    if (gender === 'female') return "/assets/images/patients/female-default.jpg";
    return "/assets/images/patients/male-default.jpg";
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = patients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(patients.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

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
      </div>
    );
  }

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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">

        {/* HEADER (UNCHANGED - BEAUTY PRESERVED) */}
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

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <th className="text-left p-4">👤 Patient</th>
                  <th className="text-left p-4">🎂 Age</th>
                  <th className="text-left p-4">📱 Contact</th>
                  <th className="text-left p-4">📍 Location</th>
                  <th className="text-left p-4">⚡ Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {currentPatients.map((patient) => {
                  const pdata = patient.patient_data || {};
                  const activeVisit = pdata.active_visit || null;

                  const photoUrl = getPatientPhoto(patient);
                  const defaultAvatar = getDefaultAvatar(patient);

                  return (
                    <tr key={patient.id} className="hover:bg-blue-50/40">

                      {/* PATIENT */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">

                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                            <img
                              src={photoUrl || defaultAvatar}
                              className="w-full h-full object-cover"
                              alt="patient"
                            />
                          </div>

                          <div>
                            <Link
                              to={`/patient-summary/${pdata.id || patient.id}`}
                              className="font-semibold text-blue-600"
                            >
                              {patient.first_name} {patient.last_name}
                            </Link>

                            {/* ✅ ONLY CHANGE HERE */}
                            <div className="text-xs text-gray-500">
                              <span className="font-mono bg-blue-50 px-2 py-0.5 rounded">
                                {pdata.patient_number || `PID-${pdata.id || patient.id}`}
                              </span>
                            </div>

                          </div>
                        </div>
                      </td>

                      {/* AGE */}
                      <td className="p-4">
                        {pdata.age ? `${pdata.age} yrs` : "—"}
                      </td>

                      {/* CONTACT */}
                      <td className="p-4">
                        {pdata.phone || "—"}
                      </td>

                      {/* LOCATION */}
                      <td className="p-4">
                        {activeVisit ? "Active Visit" : "No Visit"}
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4">
                        <Link
                          to={`/patient-summary/${pdata.id || patient.id}`}
                          className="text-blue-600"
                        >
                          View
                        </Link>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientSearchResults;