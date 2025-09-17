// src/pages/clinics/ClinicDetails.js
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";

const ClinicDetails = () => {
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClinicAndPatients = async () => {
      try {
        // fetch clinic info
        const res = await axiosInstance.get(`/locationsapi/clinics/${id}/`);
        setClinic(res.data);

        // fetch patients assigned to this clinic
        const pres = await axiosInstance.get(
          `/locationsapi/clinics/${id}/patients/`
        );
        setPatients(pres.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching clinic or patients!", error);
        setLoading(false);
      }
    };

    fetchClinicAndPatients();
  }, [id]);

  // console.log("Patients in clinic:", patients);

  if (loading) return <div>Loading...</div>;
  if (!clinic) return <div>No clinic found.</div>;

  // in-memory filtering
  const q = searchTerm.trim().toLowerCase();
  const filtered = q
    ? patients.filter((p) => {
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
        return (
          fullName.includes(q) ||
          String(p.patient_data?.id || "").includes(q) ||
          String(p.patient_data?.age || "").includes(q) ||
          (p.patient_data?.phone || "").toLowerCase().includes(q)
        );
      })
    : patients;

  return (
    <div className="row gx-4">
      <div className="col-sm-12">
        <div className="card">
          <div className="card-header">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="card-title m-0">
                <i className="ri-hospital-line text-primary"></i>{" "}
                <strong>{clinic.name}</strong> | Patient List
              </h5>

              <div className="ms-auto d-flex gap-2">
                <div className="search-container d-xl-block d-none">
                  <input
                    type="text"
                    className="form-control border"
                    placeholder="Search patients by name, PID, age or phone"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="ri-search-line"></i>
                </div>

                <Link to="/clinics" className="btn btn-primary">
                  Back to Clinics
                </Link>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="row gx-4">
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const pdata = p.patient_data || {};
                  const fullName = `${p.user_info.first_name} ${p.user_info.last_name}`;
                  return (
                    <div className="col-sm-4" key={p.id}>
                      <div className="card mb-4 border">
                        <div className="card-body">
                          <Link to={`/patient-summary/${p.id}`}>
                            <div className="d-flex flex-wrap gap-3 border-bottom mb-2">
                              <img
                                src={"/assets/images/patient.png"}
                                className="img-4x rounded-3"
                                alt={fullName}
                              />
                              <div className="d-flex flex-column">
                                <div className="text-primary mb-1">
                                  #{p.id}
                                </div>
                                <div className="fw-semibold mb-1">
                                  {p.user_info.first_name} {p.user_info.last_name}
                                </div>
                                <ul className="list-unstyled d-flex m-0">
                                  <li className="pe-2 border-end">
                                    Age: {p.age || "—"}
                                  </li>
                                  <li className="px-2 border-end">
                                    {p.user_info.gender ? p.user_info.gender.title : "—" }
                                  </li>
                                  <li className="px-2">
                                    {p.phone || "—"}
                                  </li>
                                </ul>
                              </div>
                              <span style={{ fontSize: "1.5rem" }}>
                                <Link to={`/patient/folder/${p.id}`}
                                  title="Edit Patient">
                                  <i className="ri-folder-2-line text-primary"></i>{" "}
                                </Link>
                                &nbsp;&nbsp;
                                <Link title="Clerking">
                                  <i className="ri-file-list-3-line text-success"></i>
                                </Link>
                                &nbsp;
                                <Link to={`/create-triage/${p.id}`} title="Vitals">
                                  <i className="ri-heart-pulse-line text-danger"></i>
                                </Link>
                              </span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-12">
                  <div className="text-center text-muted py-4">
                    No patients found in this clinic.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* <div className="card-footer">
            <nav>
              <ul className="pagination justify-content-center">
                <li className="page-item">
                  <a className="page-link" href="#!">
                    <i className="ri-arrow-left-s-line"></i>
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    1
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    2
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    3
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    <i className="ri-arrow-right-s-line"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ClinicDetails;
