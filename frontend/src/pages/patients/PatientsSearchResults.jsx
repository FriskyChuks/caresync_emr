// PatientSearchResults.js
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const PatientSearchResults = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

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

  if (loading) return <p>Searching...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="row gx-4">
      <div className="col-sm-12">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 className="card-title">Patient Search Results
                <span style={{fontStyle:"italic"}}>
                    {query && (` for "${query}"`)}... ({patients.length} records found)
                </span>
            </h5>
          </div>
          <div className="card-body pt-0">
            {/* <!-- Table starts --> */}
            <div className="table-responsive">
              <table className="table truncate m-0 align-middle">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>PID</th>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Phone</th>
                    <th>Current Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => {
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

                      return (
                        <tr
                          key={patient.id}
                          className={!activeVisit ? "table-light text-muted" : ""}
                        >
                          {/* Patient Image */}
                          <td>
                            <img
                              src="/assets/images/doctor.png"
                              className="img-2x rounded-5 me-1"
                              alt="Patient"
                            />
                          </td>

                          {/* Patient ID */}
                          <td>
                            <Link
                              to={`/patient-summary/${pdata.id || patient.id}`}
                              className="text-muted small text-decoration-none"
                            >
                              #{pdata.id || patient.id}
                            </Link>
                          </td>

                          {/* Patient Name */}
                          <td>
                            <Link
                              to={`/patient-summary/${pdata.id || patient.id}`}
                              className="fw-bold text-decoration-none text-dark"
                            >
                              {patient.first_name} {patient.last_name}
                            </Link>
                          </td>

                          {/* Age */}
                          <td>
                            {pdata.date_of_birth
                              ? `${pdata.date_of_birth} | ${pdata.age}yrs`
                              : "—"}
                          </td>

                          {/* Phone */}
                          <td>{pdata.phone || "—"}</td>

                          {/* Current Location */}
                          <td>
                            {activeVisit ? (
                              <Link
                                to={locationLink}
                                className="text-primary fw-semibold"
                              >
                                {locationName}
                              </Link>
                            ) : (
                              <span className="badge bg-secondary">
                                No Active Visit
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="d-inline-flex gap-1">
                              <Link
                                to={`/patient-summary/${pdata.id || patient.id}`}
                                className="btn btn-outline-info btn-sm"
                                title="View Summary"
                              >
                                <i className="ri-eye-line"></i>
                              </Link>
                              <Link
                                to={`/patient/folder/${pdata.id || patient.id}`}
                                className="btn btn-outline-success btn-sm"
                                title="Edit Patient"
                              >
                                <i className="ri-folder-2-line text-primary"></i>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* <!-- Table ends --> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSearchResults;
