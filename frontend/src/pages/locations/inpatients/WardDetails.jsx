// WardDetails.js
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import dayjs from "dayjs";

const WardDetails = () => {
  const { id } = useParams();
  const [ward, setWard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchWardDetails = async () => {
      try {
        // Fetch ward info
        const wardRes = await axiosInstance.get(`/locationsapi/wards/${id}/`);
        setWard(wardRes.data);

        // Fetch admitted patients for this ward
        const patientsRes = await axiosInstance.get(
          `/locationsapi/wards/${id}/patients/`
        );

        setPatients(patientsRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ward details:", error);
        setLoading(false);
      }
    };

    fetchWardDetails();
  }, [id]);

  // console.log("Patients in ward:", patients);

  if (loading) return <div>Loading...</div>;
  if (!ward) return <div>Ward not found</div>;

  // 🔍 Filter patients by search term
  const term = searchTerm.toLowerCase();
  const filteredPatients = patients.filter((p) => {
    return (
      p.user_info.first_name?.toLowerCase().includes(term) ||
      p.user_info.last_name?.toLowerCase().includes(term) ||
      p.id?.toLowerCase().includes(term) ||
      p.user_info.email?.toLowerCase().includes(term) ||
      p.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="row gx-4">
      <div className="col-sm-12">
        <div className="card">
          {/* Header */}
          <div className="card-header">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="card-title m-0">
                <span>
                  <i className="ri-hotel-bed-line text-primary"></i>
                </span>{" "}
                <strong>{ward.name}</strong> | Patients
              </h5>
              <div className="ms-auto d-flex gap-2">
                <div className="search-container d-xl-block d-none">
                  <input
                    type="text"
                    className="form-control border"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="ri-search-line"></i>
                </div>
                <Link to="/wards" className="btn btn-primary">
                  Back to Wards
                </Link>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table truncate m-0 align-middle">
              <thead>
                <tr>
                  <th>Bed No</th>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Admission Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <tr key={p.id}>
                      {/* Bed No */}
                      <td>
                        <div>{p.bedNo || "—"}</div>
                      </td>

                      {/* Patient */}
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src="/assets/images/patient.png"
                            className="img-3x rounded-5 border border-primary border-2"
                            alt="Patient"
                          />
                          <div>
                            <Link
                              to={`/patient-summary/${p.id}`}
                              className="fw-semibold text-primary d-block"
                            >
                              {p.user_info.first_name} {p.user_info.last_name} | #{p.id}
                            </Link>
                            <div className="text-muted small">
                              Age: {p.age || "—"} | {p.user_info.gender? p.user_info.gender.title : "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div className="text-primary">{p.email || "No email"}</div>
                        <div>
                          <i className="ri-phone-line"></i> {p.phone || "—"}
                        </div>
                      </td>

                      {/* Admission */}
                      <td>
                        <div>{p.admissionType || "Direct"}</div>
                        <div className="text-muted small">
                          {dayjs(p.active_visit.current_location.date_created).format("DD MMM YYYY, HH:mm")}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge ${
                            p.paymentStatus === "Paid"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {p.paymentStatus || "Pending"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="align-items-center gap-3">
                        <Link
                          to={`/patient-summary/${p.id}`}
                          className="btn btn-outline-info btn-sm"
                          title="View Summary"
                        >
                          <i className="ri-eye-line"></i>
                        </Link> &nbsp;
                        <Link
                          to={`/patient/folder/${p.id}`}
                          className="btn btn-outline-success btn-sm"
                          title="Patient Folder"
                        >
                          <i className="ri-folder-2-line text-primary"></i>{" "}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardDetails;
