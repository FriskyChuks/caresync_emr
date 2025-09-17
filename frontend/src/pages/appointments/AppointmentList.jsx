import { Link } from "react-router-dom"

const AppointmentList = () => {
  return (
    <>
        <div className="row gx-4">
            <div className="col-sm-12">
            <div className="card mb-4">
                <div className="card-body">

                <div className="row gx-4">
                    <div className="col-xxl-6 col-sm-12 col-12">
                    <div className="d-flex align-items-start gap-3 flex-wrap">
                        <img src="assets/images/doctors/12.jpg"
                        className="mw-240 rounded-2 border border-primary border-2" alt="Dentist Dashboard" />
                        <div className="">
                        <span className="badge bg-primary-subtle text-primary"><i
                            className="ri-circle-fill me-1"></i>Available</span>
                        <p className="mb-1 mt-2">Good Morning,</p>
                        <p className="fs-5 fw-semibold">Dr. Leonor Spears</p>
                        <p className="mb-1">MBBS, MS - General Physician</p>
                        <p className="mb-1">Speaks: English, French, and Spanish</p>
                        <p className="mb-1">Location: 9 E 2nd St, New York, NY 30003, USA</p>
                        </div>
                    </div>
                    </div>
                    <div className="col-xxl-6 col-sm-12 col-12">

                    <div className="h-100 border-start border-sm-none">
                        <div className="ps-4">
                        <div className="d-flex justify-content-between">
                            <div className="d-flex flex-row flex-wrap gap-2">
                            <div className="d-flex align-items-center">
                                <div className="icon-box sm bg-primary-subtle rounded-5 me-2">
                                <i className="ri-chat-1-line fs-5 text-primary"></i>
                                </div>
                                <div>
                                Online Consultation Available
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="icon-box sm bg-primary-subtle rounded-5 me-2">
                                <i className="ri-building-2-line fs-5 text-primary"></i>
                                </div>
                                <div>
                                Clove Dental Care Medicals & Hospital
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="icon-box sm bg-primary-subtle rounded-5 me-2">
                                <i className="ri-account-circle-line fs-5 text-primary"></i>
                                </div>
                                <div>
                                <span className="fw-semibold text-primary">99%</span> Recommended
                                </div>
                            </div>
                            </div>
                            <div className="d-flex flex-row gap-2">
                            <a href="javascript:void(0)" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-star-line fs-6 text-primary"></i>
                            </a>
                            <a href="javascript:void(0)" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-link-m fs-6 text-primary"></i>
                            </a>
                            <a href="javascript:void(0)" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-share-line fs-6 text-primary"></i>
                            </a>
                            </div>
                        </div>
                        <div className="d-flex mt-3">
                            <div className="rating-stars">
                            <div className="readonly5"></div>
                            </div>
                            <span className="fw-bold fs-6 me-1">6680</span> Reviews
                        </div>
                        <div className="d-flex gap-1 mt-3">
                            <a href="#" className="btn btn-sm btn-outline-primary"><i
                                className="ri-chat-1-line me-1"></i>Chat</a>
                            <a href="#" className="btn btn-sm btn-outline-primary"><i
                                className="ri-headphone-line me-1"></i>Audio
                            Call</a>
                            <a href="#" className="btn btn-sm btn-outline-primary"><i
                                className="ri-vidicon-line me-1"></i>Video
                            Call</a>
                        </div>
                        </div>
                    </div>

                    </div>
                </div>

                </div>
                <div className="card-footer border-top">
                <div className="d-flex align-items-center flex-row flex-wrap gap-1">
                    <div className="d-flex align-items-center">
                    <div className="bg-primary-subtle text-primary rounded-2 py-1 px-2 lh-1">
                        Upcoming <span className="badge bg-primary">9</span>
                    </div>
                    </div>
                    <div className="d-flex align-items-center">
                    <div className="bg-danger-subtle text-danger rounded-2 py-1 px-2 lh-1">
                        Cancelled <span className="badge bg-danger">2</span>
                    </div>
                    </div>
                    <div className="d-flex align-items-center">
                    <div className="bg-warning-subtle text-warning rounded-2 py-1 px-2 lh-1">
                        Completed <span className="badge bg-warning">21</span>
                    </div>
                    </div>
                    <div className="ms-auto">
                    <Link to="/patient-list" className="btn btn-primary">
                        My Patient List
                    </Link>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>

        <div className="row gx-4">
            <div className="col-sm-12">
            <div className="card">
                <div className="card-header">
                <div className="d-flex align-items-center justify-content-between">
                    <h5 className="card-title m-0">Appointments</h5>
                    <div className="ms-auto d-flex gap-2">

                    
                    <div className="search-container d-xl-block d-none">
                        <input type="text" className="form-control border" id="searchPatient" placeholder="Search" />
                        <i className="ri-search-line"></i>
                    </div>

                    <div className="ms-2">
                        <button type="button" className="btn btn-primary">
                        <i className="ri-list-check-2"></i>
                        </button>
                        <button type="button" className="btn btn-outline-primary">
                        <i className="ri-grid-line"></i>
                        </button>
                        <button type="button" className="btn btn-outline-primary">
                        <i className="ri-calendar-2-line"></i>
                        </button>
                    </div>

                    </div>
                </div>
                </div>
                <div className="card-body">

                <div className="d-grid gap-2">
                    <div className="card">
                    <div className="card-body">
                        <div className="d-flex align-items-center flex-wrap gap-4">
                        <img src="assets/images/patient.png" className="img-3x rounded-5 border border-primary border-2"
                            alt="Dental Admin Dashboard" />
                        <div className="d-flex flex-column mw-90">
                            <div className="text-primary">
                            #APT009
                            </div>
                            <div className="fw-semibold">Mcdowell</div>
                        </div>
                        <div className="d-flex flex-column mw-180">
                            <div className="text-primary">
                            Today
                            </div>
                            <div>Direct Visit</div>
                        </div>
                        <div className="d-flex flex-column mw-120">
                            <div className="text-primary">
                            Time
                            </div>
                            <div>10:30AM</div>
                        </div>
                        <div className="d-flex flex-column">
                            <div className="text-primary">
                            mcdowell@test.com
                            </div>
                            <div><i className="ri-phone-line"></i> 9876543210</div>
                        </div>
                        <div className="ms-auto d-flex align-items-center gap-3">
                            <div className="d-flex flex-column">
                            <div className="text-primary">
                                Payment
                            </div>
                            <div>Paid</div>
                            </div>
                            <div className="d-flex gap-2">
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-checkbox-circle-line text-primary"></i>
                            </a>
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-close-circle-line text-primary"></i>
                            </a>
                            </div>
                            <div className="fw-semibold text-primary">
                            <a href="patient-dashboard.html"
                                className="bg-primary-subtle text-primary py-2 px-3 rounded-5">
                                Details
                            </a>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="card">
                    <div className="card-body">
                        <div className="d-flex align-items-center flex-wrap gap-4">
                        <img src="assets/images/patient1.png"
                            className="img-3x rounded-5 border border-primary border-2" alt="Dental Admin Dashboard" />
                        <div className="d-flex flex-column mw-90">
                            <div className="text-primary">
                            #APT242
                            </div>
                            <div className="fw-semibold">Johana</div>
                        </div>
                        <div className="d-flex flex-column mw-180">
                            <div className="text-primary">
                            Today
                            </div>
                            <div>Video Consultation</div>
                        </div>
                        <div className="d-flex flex-column mw-120">
                            <div className="text-primary">
                            Time
                            </div>
                            <div>11:00AM</div>
                        </div>
                        <div className="d-flex flex-column">
                            <div className="text-primary">
                            johana@test.com
                            </div>
                            <div><i className="ri-phone-line"></i> 9876543210</div>
                        </div>
                        <div className="ms-auto d-flex align-items-center gap-3">
                            <div className="d-flex flex-column">
                            <div className="text-primary">
                                Payment
                            </div>
                            <div>Paid</div>
                            </div>
                            <div className="d-flex gap-2">
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-checkbox-circle-line text-primary"></i>
                            </a>
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-close-circle-line text-primary"></i>
                            </a>
                            </div>
                            <div className="fw-semibold text-primary">
                            <a href="patient-dashboard.html"
                                className="bg-primary-subtle text-primary py-2 px-3 rounded-5">
                                Details
                            </a>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="card">
                    <div className="card-body">
                        <div className="d-flex align-items-center flex-wrap gap-4">
                        <img src="assets/images/patient2.png"
                            className="img-3x rounded-5 border border-primary border-2" alt="Dental Admin Dashboard" />
                        <div className="d-flex flex-column mw-90">
                            <div className="text-primary">
                            #APT037
                            </div>
                            <div className="fw-semibold">Braun</div>
                        </div>
                        <div className="d-flex flex-column mw-180">
                            <div className="text-primary">
                            Today
                            </div>
                            <div>Direct Visit</div>
                        </div>
                        <div className="d-flex flex-column mw-120">
                            <div className="text-primary">
                            Time
                            </div>
                            <div>11:30AM</div>
                        </div>
                        <div className="d-flex flex-column">
                            <div className="text-primary">
                            braun@test.com
                            </div>
                            <div><i className="ri-phone-line"></i> 9876543210</div>
                        </div>
                        <div className="ms-auto d-flex align-items-center gap-3">
                            <div className="d-flex flex-column">
                            <div className="text-primary">
                                Payment
                            </div>
                            <div>Paid</div>
                            </div>
                            <div className="d-flex gap-2">
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-checkbox-circle-line text-primary"></i>
                            </a>
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-close-circle-line text-primary"></i>
                            </a>
                            </div>
                            <div className="fw-semibold text-primary">
                            <a href="patient-dashboard.html"
                                className="bg-primary-subtle text-primary py-2 px-3 rounded-5">
                                Details
                            </a>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="card">
                    <div className="card-body">
                        <div className="d-flex align-items-center flex-wrap gap-4">
                        <img src="assets/images/patient3.png"
                            className="img-3x rounded-5 border border-primary border-2" alt="Dental Admin Dashboard" />
                        <div className="d-flex flex-column mw-90">
                            <div className="text-primary">
                            #APT028
                            </div>
                            <div className="fw-semibold">Raymon</div>
                        </div>
                        <div className="d-flex flex-column mw-180">
                            <div className="text-primary">
                            Today
                            </div>
                            <div>Video Consultation</div>
                        </div>
                        <div className="d-flex flex-column mw-120">
                            <div className="text-primary">
                            Time
                            </div>
                            <div>12:00PM</div>
                        </div>
                        <div className="d-flex flex-column">
                            <div className="text-primary">
                            raymon@test.com
                            </div>
                            <div><i className="ri-phone-line"></i> 9876543210</div>
                        </div>
                        <div className="ms-auto d-flex align-items-center gap-3">
                            <div className="d-flex flex-column">
                            <div className="text-primary">
                                Payment
                            </div>
                            <div>Paid</div>
                            </div>
                            <div className="d-flex gap-2">
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-checkbox-circle-line text-primary"></i>
                            </a>
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-close-circle-line text-primary"></i>
                            </a>
                            </div>
                            <div className="fw-semibold text-primary">
                            <a href="patient-dashboard.html"
                                className="bg-primary-subtle text-primary py-2 px-3 rounded-5">
                                Details
                            </a>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="card">
                    <div className="card-body">
                        <div className="d-flex align-items-center flex-wrap gap-4">
                        <img src="assets/images/patient4.png"
                            className="img-3x rounded-5 border border-primary border-2" alt="Dental Admin Dashboard" />
                        <div className="d-flex flex-column mw-90">
                            <div className="text-primary">
                            #APT024
                            </div>
                            <div className="fw-semibold">Jerald</div>
                        </div>
                        <div className="d-flex flex-column mw-180">
                            <div className="text-primary">
                            Today
                            </div>
                            <div>Video Consultation</div>
                        </div>
                        <div className="d-flex flex-column mw-120">
                            <div className="text-primary">
                            Time
                            </div>
                            <div>12:30PM</div>
                        </div>
                        <div className="d-flex flex-column">
                            <div className="text-primary">
                            jerald@test.com
                            </div>
                            <div><i className="ri-phone-line"></i> 9876543210</div>
                        </div>
                        <div className="ms-auto d-flex align-items-center gap-3">
                            <div className="d-flex flex-column">
                            <div className="text-primary">
                                Payment
                            </div>
                            <div>Pending</div>
                            </div>
                            <div className="d-flex gap-2">
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-checkbox-circle-line text-primary"></i>
                            </a>
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-close-circle-line text-primary"></i>
                            </a>
                            </div>
                            <div className="fw-semibold text-primary">
                            <a href="patient-dashboard.html"
                                className="bg-primary-subtle text-primary py-2 px-3 rounded-5">
                                Details
                            </a>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="card">
                    <div className="card-body">
                        <div className="d-flex align-items-center flex-wrap gap-4">
                        <img src="assets/images/patient5.png"
                            className="img-3x rounded-5 border border-primary border-2" alt="Dental Admin Dashboard" />
                        <div className="d-flex flex-column mw-90">
                            <div className="text-primary">
                            #APT032
                            </div>
                            <div className="fw-semibold">Hendrix</div>
                        </div>
                        <div className="d-flex flex-column mw-180">
                            <div className="text-primary">
                            Today
                            </div>
                            <div>Direct Visit</div>
                        </div>
                        <div className="d-flex flex-column mw-120">
                            <div className="text-primary">
                            Time
                            </div>
                            <div>02:30PM</div>
                        </div>
                        <div className="d-flex flex-column">
                            <div className="text-primary">
                            hendrix@test.com
                            </div>
                            <div><i className="ri-phone-line"></i> 9876543210</div>
                        </div>
                        <div className="ms-auto d-flex align-items-center gap-3">
                            <div className="d-flex flex-column">
                            <div className="text-primary">
                                Payment
                            </div>
                            <div>Paid</div>
                            </div>
                            <div className="d-flex gap-2">
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-checkbox-circle-line text-primary"></i>
                            </a>
                            <a href="#!" className="icon-box xs icon-box-hover rounded-5">
                                <i className="ri-close-circle-line text-primary"></i>
                            </a>
                            </div>
                            <div className="fw-semibold text-primary">
                            <a href="patient-dashboard.html"
                                className="bg-primary-subtle text-primary py-2 px-3 rounded-5">
                                Details
                            </a>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>

                </div>
            </div>
            </div>
        </div>
    </>
  )
}

export default AppointmentList