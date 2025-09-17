import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from '../../context/MessageProvider';

// Reusable info block
const InfoBlock = ({ icon, label, value }) =>
  value ? (
    <li>
      <i className={`${icon} text-muted me-1`}></i> {value}
    </li>
  ) : null;

const PatientSummary = ({ data: initialData }) => {
  const {showMessage} = useMessage();
  const navigate = useNavigate();
  const { patientId } = useParams();
  const location = useLocation();

  const [data, setData] = useState(initialData || location.state?.patient || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);

  // Clinic/Ward modal states
  const [showModal, setShowModal] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [wards, setWards] = useState([]);
  const [isWardMode, setIsWardMode] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [sending, setSending] = useState(false);

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

  // fetch clinic & ward options once
  useEffect(() => {
    axiosInstance.get("/locationsapi/clinics/").then((res) => setClinics(res.data));
    axiosInstance.get("/locationsapi/wards/").then((res) => setWards(res.data));
  }, []);

  const handleSend = async () => {
    if (!selectedClinic && !selectedWard) {
      alert("Please select a clinic or ward");
      return;
    }
    setSending(true);
    const payload = {
        patient_id: data.id,
        clinic_id: !isWardMode ? Number(selectedClinic) || null : null,
        ward_id: isWardMode ? selectedWard : null,
      }

    try {
      await axiosInstance.post("/encounterapi/send-to-clinic/", payload);
      
      showMessage("Patient sent/transferred successfully ✅", "success");
      navigate('/dashboard');
      setShowModal(false);
      setSelectedClinic(null);
      setSelectedWard(null);
    } catch (err) {
      console.error(err);
      alert("Failed to send patient ❌");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading patient record...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-3" role="alert">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="alert alert-warning my-3" role="alert">
        No patient data available.
      </div>
    );
  }
//  console.log("Patient data:", data);

  // Destructure nested data for easier access  
  const {
    residential_address_data,
    permanent_address_data,
    next_of_kin_data,
  } = data;

  return (
    <>
      {/* <!-- Top Row starts --> */}
      <div className="row gx-4">
        <div className="col-sm-12">
          <div className="card mb-4">
            <div className="card-body">
              {/* Patient profile top section */}
              <div className="row gx-4">
                <div className="col-xxl-6 col-sm-12 col-12">
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    <img
                      src="/assets/images/doctors/14.jpg"
                      className="mw-240 rounded-2 border border-primary border-2"
                      alt="Patient"
                    />
                    <div>
                      <span className="badge bg-primary-subtle text-primary me-1">
                        <i className="ri-circle-fill me-1"></i>Regular
                      </span>
                      <span className="badge bg-primary-subtle text-danger">
                        <i className="ri-circle-fill me-1"></i>Emergency
                      </span>
                      <p className="fs-5 fw-semibold mt-2 mb-1">
                        {data.user_info.first_name} {data.user_info.last_name}{" "}
                        <span>(PID-{data.id})</span>
                      </p>
                      <p className="mb-1">
                        DOB: {data.date_of_birth} | {data.age} yrs old |  
                        ({data.status})
                      </p>
                      <p className="mb-1">
                        Phone: {data.phone}
                      </p>
                      <p className="mb-1">
                        Email: {data.email}
                      </p>
                       Gender: {data.gender }
                    </div>
                  </div>
                </div>

                <div className="col-xxl-6 col-sm-12 col-12">
                  <div className="h-100 border-start border-sm-none">
                    <div className="ps-4">
                      <div>
                        <p className="mb-1">
                          Marital Status: {data.marital_status} 
                        </p>
                        <p className="mb-1">
                          Occupation: {data.occupation}
                        </p>
                        <p className="mb-1">
                          Date Registered: {new Date(data.date_created).toLocaleDateString()}
                        </p>
                        {data.created_by ? (
                          <p className="mb-1">Registered by: 
                            {data.registered_by.first_name} {data.registered_by.last_name}
                          </p>
                        ) : null}

                        {/* LOCATION STARTS HERE */}
                          <p className="bt-1 pt-1 border-top">
                            Current Location:{" "}
                              {data.active_visit ? (
                                data.active_visit.current_location.ward ? (
                                  <>
                                      <Link to={`/ward-details/${data.active_visit.current_location.ward_id}`} className="btn btn-sm btn-primary">
                                        {data.active_visit.current_location.ward} Ward
                                      </Link>
                                  </>
                                ) : (
                                  <>
                                    <Link to={`/clinic-details/${data.active_visit.current_location.clinic_id}`} className="btn btn-sm btn-primary">
                                      {data.active_visit.current_location.clinic} Clinic
                                    </Link>
                                  </>
                                )
                              ) : (
                                <span className="text-muted">Not yet assigned</span>
                              )}
                          </p>
                        {/* LOCATION END HERE */}
                      </div>
                      <div className="d-flex gap-1 mt-3">
                        <a href="#" className="btn btn-sm btn-primary">
                          <i className="ri-user-settings-line"></i> Update Record
                        </a>
                        <a href="#" className="btn btn-sm btn-primary">
                          <i className="ri-calendar-2-line"></i> Book Appointment
                        </a>
                        <Link to="/patient-registration" className="btn btn-sm btn-primary">
                          <i className="ri-user-add-line"></i> New Registration
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <!-- Row ends --> */}
            </div>

            <div className="card-footer border-top">
              <div className="d-flex align-items-center flex-row flex-wrap gap-3">
                <div className="d-flex align-items-center">
                  <div className="icon-box sm icon-box-hover rounded-5 me-2">
                    <i className="ri-building-2-line fs-5 text-primary"></i>
                  </div>
                  <div>9 appointments today</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="icon-box sm icon-box-hover rounded-5 me-2">
                    <i className="ri-chat-1-line fs-5 text-primary"></i>
                  </div>
                  <div>18 years in practice</div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="icon-box sm icon-box-hover rounded-5 me-2">
                    <i className="ri-account-circle-line fs-5 text-primary"></i>
                  </div>
                  <div>
                    <span className="fw-bold text-primary">$150</span> consulting fee
                  </div>
                </div>
                <div className="ms-auto">
                  <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        <i className="ri-walk-line"></i> Send to Clinic/Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* <!-- Top Row ends --> */}

      {/* Contact Info Section */}
      {(residential_address_data ||
        permanent_address_data ||
        next_of_kin_data) && (
        <div className="accordion mt-4" id="contactAccordion">
          <div className="accordion-item border rounded-3 shadow-sm">
            <h2 className="accordion-header" id="headingContact">
              <button
                className="accordion-button fw-bold text-primary"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseContact"
                aria-expanded="true"
                aria-controls="collapseContact"
              >
                <i className="ri-contacts-book-2-line me-2"></i> Contact Information
              </button>
            </h2>
            <div
              id="collapseContact"
              className="accordion-collapse collapse show"
              aria-labelledby="headingContact"
              data-bs-parent="#contactAccordion"
            >
              <div className="accordion-body bg-light rounded-bottom">
                <div className="row gx-4 gy-3">
                  {residential_address_data && (
                    <div className="col-md-4">
                      <h6 className="fw-bold text-primary mb-2">
                        <i className="ri-home-4-line me-1"></i> Residential Address
                      </h6>
                      <ul className="list-unstyled small">
                        <InfoBlock
                          icon="ri-map-pin-2-line"
                          value={residential_address_data.address}
                        />
                        <InfoBlock
                          icon="ri-community-line"
                          value={residential_address_data.town}
                        />
                        <InfoBlock
                          icon="ri-phone-line"
                          value={residential_address_data.phone1}
                        />
                        <InfoBlock
                          icon="ri-phone-line"
                          value={residential_address_data.phone2}
                        />
                      </ul>
                    </div>
                  )}

                  {permanent_address_data && (
                    <div className="col-md-4">
                      <h6 className="fw-bold text-success mb-2">
                        <i className="ri-map-pin-user-line me-1"></i> Permanent Address
                      </h6>
                      <ul className="list-unstyled small">
                        <InfoBlock
                          icon="ri-map-pin-2-line"
                          value={permanent_address_data.address}
                        />
                        <InfoBlock
                          icon="ri-community-line"
                          value={permanent_address_data.town}
                        />
                        <InfoBlock
                          icon="ri-map-pin-line"
                          value={permanent_address_data.state_of_residence}
                        />
                      </ul>
                    </div>
                  )}

                  {next_of_kin_data && (
                    <div className="col-md-4">
                      <h6 className="fw-bold text-danger mb-2">
                        <i className="ri-user-heart-line me-1"></i> Next of Kin
                      </h6>
                      <ul className="list-unstyled small">
                        <InfoBlock
                          icon="ri-user-line"
                          value={next_of_kin_data.full_names}
                        />
                        <InfoBlock
                          icon="ri-phone-line"
                          value={next_of_kin_data.phone_no}
                        />
                        <InfoBlock
                          icon="ri-map-pin-2-line"
                          value={next_of_kin_data.address}
                        />
                        <InfoBlock
                          icon="ri-mail-line"
                          value={next_of_kin_data.email}
                        />
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* If no contact info at all */}
      {!residential_address_data &&
        !permanent_address_data &&
        !next_of_kin_data && (
          <div className="alert alert-info mt-4">
            <i className="ri-information-line me-1"></i> No contact information
            available.
          </div>
        )}

      {/* Modal for Send to Clinic/Ward */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg rounded-3">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isWardMode ? "Send to Ward" : "Send to Clinic"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Toggle Clinic/Ward */}
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isWardMode}
                    onChange={() => {
                      setIsWardMode(!isWardMode);
                      setSelectedClinic(null);
                      setSelectedWard(null);
                    }}
                  />
                  <label className="form-check-label">
                    Switch to {isWardMode ? "Clinic" : "Ward"}
                  </label>
                </div>
                {/* Dropdown */}
                {!isWardMode ? (
                  <select
                    className="form-select"
                    value={selectedClinic || ""}
                    onChange={(e) => setSelectedClinic(e.target.value)}
                  >
                    <option value="">-- Select Clinic --</option>
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    className="form-select"
                    value={selectedWard || ""}
                    onChange={(e) => setSelectedWard(e.target.value)}
                  >
                    <option value="">-- Select Ward --</option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientSummary;
