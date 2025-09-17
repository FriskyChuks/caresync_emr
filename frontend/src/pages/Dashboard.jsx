import React from 'react'

const Dashboard = () => {
  return (
    <>
    {/* <!-- Row starts --> */}
            <div className="row gx-4">
              <div className="col-xxl-9 col-sm-12">

                {/* <!-- Row starts --> */}
                <div className="row gx-4">
                  <div className="col-lg-4 col-sm-6 col-12">
                    <div className="card mb-4">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="p-2 border border-primary rounded-circle me-3">
                            <div className="icon-box md bg-primary-lighten rounded-5">
                              <i className="ri-empathize-line fs-4 text-primary"></i>
                            </div>
                          </div>
                          <div className="d-flex flex-column">
                            <h2 className="lh-1">660</h2>
                            <p className="m-0">Patients</p>
                          </div>
                        </div>
                        <div className="d-flex gap-2 flex-wrap align-items-center justify-content-between mt-2">
                          <div className="text-start">
                            <p className="mb-0 text-primary">+40</p>
                            <span className="badge bg-primary-light text-primary small">this month</span>
                          </div>
                          <div id="sparkline1"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-sm-6 col-12">
                    <div className="card mb-4">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="p-2 border border-primary rounded-circle me-3">
                            <div className="icon-box md bg-primary-lighten rounded-5">
                              <i className="ri-calendar-2-line fs-4 text-primary"></i>
                            </div>
                          </div>
                          <div className="d-flex flex-column">
                            <h2 className="lh-1">230</h2>
                            <p className="m-0">Appointments</p>
                          </div>
                        </div>
                        <div className="d-flex gap-2 flex-wrap align-items-center justify-content-between mt-2">
                          <div className="text-start">
                            <p className="mb-0 text-primary">+30</p>
                            <span className="badge bg-primary-light text-primary small">this month</span>
                          </div>
                          <div id="sparkline2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-sm-12 col-12">
                    <div className="card mb-4">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="p-2 border border-primary rounded-circle me-3">
                            <div className="icon-box md bg-primary-lighten rounded-5">
                              <i className="ri-money-dollar-circle-line fs-4 text-primary"></i>
                            </div>
                          </div>
                          <div className="d-flex flex-column">
                            <h2 className="lh-1">$9900</h2>
                            <p className="m-0">Revenue</p>
                          </div>
                        </div>
                        <div className="d-flex gap-2 flex-wrap align-items-center justify-content-between mt-2">
                          <div className="text-start">
                            <p className="mb-0 text-primary">+20%</p>
                            <span className="badge bg-primary-light text-primary small">this month</span>
                          </div>
                          <div id="sparkline3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <!-- Row ends --> */}

                {/* <!-- Row starts --> */}
                <div className="row gx-4">
                  <div className="col-sm-12">
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5 className="card-title">Available Doctors</h5>
                      </div>
                      <div className="card-body pt-0">

                        {/* <!-- Row starts --> */}
                        <div className="row g-4">
                          <div className="col-xl-4 col-sm-6 col-12">
                            <a href="doctors-profile.html" className="d-flex align-items-center gap-3 appointment-card">
                              <img src="src/assets/images/doctor1.png" className="img-3x rounded-5" alt="Doctor Dashboard" />
                              <div className="d-flex gap-1 flex-column flex-fill">
                                <div className="fw-semibold">Dr. Lillie Kennedy</div>
                                <div className="text-muted small">Periodontist - 9 yrs</div>
                                <div className="small">
                                  <i className="ri-star-fill text-primary me-1"></i>5.0
                                </div>
                              </div>
                              <i className="ri-arrow-right-s-line text-primary fs-1 opacity-25"></i>
                            </a>
                          </div>
                          <div className="col-xl-4 col-sm-6 col-12">
                            <a href="doctors-profile.html" className="d-flex align-items-center gap-3 appointment-card">
                              <img src="src/assets/images/doctor3.png" className="img-3x rounded-5" alt="Doctor Dashboard" />
                              <div className="d-flex gap-1 flex-column flex-fill">
                                <div className="fw-semibold">Dr. Kerri Myers</div>
                                <div className="text-muted small">Endodontist - 6 yrs</div>
                                <div className="small">
                                  <i className="ri-star-fill text-primary me-1"></i>4.9
                                </div>
                              </div>
                              <i className="ri-arrow-right-s-line text-primary fs-1 opacity-25"></i>
                            </a>
                          </div>
                          <div className="col-xl-4 col-sm-6 col-12">
                            <a href="doctors-profile.html" className="d-flex align-items-center gap-3 appointment-card">
                              <img src="src/assets/images/doctor4.png" className="img-3x rounded-5" alt="Doctor Dashboard" />
                              <div className="d-flex gap-1 flex-column flex-fill">
                                <div className="fw-semibold">Dr. Tobias Wong</div>
                                <div className="text-muted small">Orthodontist - 8 yrs</div>
                                <div className="small">
                                  <i className="ri-star-fill text-primary me-1"></i>4.8
                                </div>
                              </div>
                              <i className="ri-arrow-right-s-line text-primary fs-1 opacity-25"></i>
                            </a>
                          </div>
                        </div>
                        {/* <!-- Row ends --> */}

                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12">
                    <div className="card mb-4">
                      <div className="card-header pb-0 d-flex align-items-center justify-content-between">
                        <h5 className="card-title">Revenue</h5>
                        <div className="btn-group btn-group-sm" role="group">
                          <button type="button" className="btn btn-primary">2024</button>
                          <button type="button" className="btn btn-outline-primary">2023</button>
                          <button type="button" className="btn btn-outline-primary">2022</button>
                        </div>
                      </div>
                      <div className="card-body pt-0">
                        <div className="overflow-hidden">
                          <div id="income"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <!-- Row ends --> */}

              </div>
              <div className="col-xxl-3 col-sm-12">
                <div className="card mb-4">
                  <div className="card-header pb-0">
                    <h5 className="card-title">Appointments</h5>
                  </div>
                  <div className="card-body">

                    {/* <!-- Date calendar starts --> */}
                    <div className="datepicker-bg d-flex justify-content-center align-items-center mb-3">
                      {/* <!-- Loader starts --> */}
                      <div id="datepicker-loader" className="text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                      {/* <!-- Loader ends --> */}
                      <div id="datepicker" className="d-none w-100"></div>
                    </div>
                    {/* <!-- Date calendar ends --> */}

                    {/* <!-- Appointments starts --> */}
                    <div className="mb-4">
                      <div className="scroll300">

                        {/* <!-- Grid starts --> */}
                        <div className="d-grid gap-2">
                          <a href="patient-profile.html" className="d-flex align-items-center gap-3 appointment-card">
                            <img src="src/assets/images/patient1.png" className="img-3x rounded-5" alt="Doctor Dashboard" />
                            <div className="d-flex flex-column flex-fill">
                              <div className="fw-semibold text-truncate">Kitty Miller</div>
                              <div className="text-muted small">Consultation</div>
                            </div>
                            <span className="badge bg-danger">8:00</span>
                          </a>
                          <a href="patient-profile.html" className="d-flex align-items-center gap-3 appointment-card">
                            <img src="src/assets/images/patient2.png" className="img-3x rounded-5" alt="Doctor Dashboard" />
                            <div className="d-flex flex-column flex-fill">
                              <div className="fw-semibold text-truncate">Anne Wallace</div>
                              <div className="text-muted small">Medication</div>
                            </div>
                            <span className="badge bg-success">9:00</span>
                          </a>
                          <a href="patient-profile.html" className="d-flex align-items-center gap-3 appointment-card">
                            <img src="src/assets/images/patient3.png" className="img-3x rounded-5" alt="Doctor Dashboard" />
                            <div className="d-flex flex-column flex-fill">
                              <div className="fw-semibold text-truncate">Lesley Chaney</div>
                              <div className="text-muted small">Laboratory</div>
                            </div>
                            <span className="badge bg-warning">9:00</span>
                          </a>
                          <a href="patient-profile.html" className="d-flex align-items-center gap-3 appointment-card">
                            <img src="src/assets/images/patient5.png" className="img-3x rounded-5" alt="Doctor Dashboard" />
                            <div className="d-flex flex-column flex-fill">
                              <div className="fw-semibold text-truncate">Darcy May</div>
                              <div className="text-muted small">Emergency</div>
                            </div>
                            <span className="badge bg-primary">9:30</span>
                          </a>
                          <a href="patient-profile.html" className="d-flex align-items-center gap-3 appointment-card">
                            <img src="src/assets/images/patient4.png" className="img-3x rounded-5" alt="Doctor Dashboard" />
                            <div className="d-flex flex-column flex-fill">
                              <div className="fw-semibold text-truncate">Monroe Barron</div>
                              <div className="text-muted small">Emergency</div>
                            </div>
                            <span className="badge bg-warning">9:30</span>
                          </a>
                          <a href="patient-profile.html" className="d-flex align-items-center gap-3 appointment-card">
                            <img src="src/assets/images/patient.png" className="img-3x rounded-5" alt="Doctor Dashboard" />
                            <div className="d-flex flex-column flex-fill">
                              <div className="fw-semibold text-truncate">Allen Roth</div>
                              <div className="text-muted small">Appointment</div>
                            </div>
                            <span className="badge bg-danger">9:00</span>
                          </a>
                        </div>
                        {/* <!-- Grid ends --> */}

                      </div>
                    </div>
                    {/* <!-- Appointments ends --> */}

                    {/* <!-- Available doctor starts --> */}
                    <div className="available-doc">
                      <a href="doctors-profile.html">
                        <div className="d-flex align-items-center gap-3 text-white">
                          <img src="src/assets/images/doctor4.png" className="img-3x rounded-5" alt="Doctor Dashboard" />
                          <div className="d-flex flex-column flex-fill">
                            <div className="fw-semibold">Dr. Tobias Wong</div>
                            <div className="small">Dentist</div>
                          </div>
                        </div>
                        <div className="timing mt-2 text-white small">
                          <span className="day"></span> <span className="today-date"></span>, 9AM - 2PM
                        </div>
                      </a>
                    </div>
                    {/* <!-- Available doctor ends --> */}

                  </div>
                </div>
              </div>
            </div>
            {/* <!-- Row ends --> */}

            {/* <!-- Row starts --> */}
            <div className="row gx-4">
              <div className="col-xxl-9 col-sm-12">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title">Patients</h5>
                  </div>
                  <div className="card-body pt-0">
                    <div className="d-flex gap-4 flex-wrap">
                      <div className="div">
                        <h6 className="mb-0">New Patients</h6>
                        <div className="d-flex align-items-center gap-1">
                          <div className="fs-2 fw-semibold">2000</div>
                          <div className="d-flex">
                            <div>20.2%</div>
                            <i className="ri-arrow-right-up-line text-success"></i>
                          </div>
                        </div>
                        <span
                          className="monthDisplay badge bg-primary-subtle text-primary border border-primary small"></span>
                      </div>
                      <div className="div">
                        <h6 className="mb-0">Return Patients</h6>
                        <div className="d-flex align-items-center gap-1">
                          <div className="fs-2 fw-semibold">6000</div>
                          <div className="d-flex">
                            <div>22.8%</div>
                            <i className="ri-arrow-right-up-line text-success"></i>
                          </div>
                        </div>
                        <span
                          className="monthDisplay badge bg-primary-subtle text-primary border border-primary small"></span>
                      </div>
                      <div className="div">
                        <h6 className="mb-0">Male Patients</h6>
                        <div className="d-flex align-items-center gap-1">
                          <div className="fs-2 fw-semibold">3000</div>
                          <div className="d-flex">
                            <div>38.9%</div>
                            <i className="ri-arrow-right-up-line text-success"></i>
                          </div>
                        </div>
                        <span
                          className="monthDisplay badge bg-primary-subtle text-primary border border-primary small"></span>
                      </div>
                      <div className="div">
                        <h6 className="mb-0">Female Patients</h6>
                        <div className="d-flex align-items-center gap-1">
                          <div className="fs-2 fw-semibold">4000</div>
                          <div className="d-flex">
                            <div>49.3%</div>
                            <i className="ri-arrow-right-up-line text-success"></i>
                          </div>
                        </div>
                        <span
                          className="monthDisplay badge bg-primary-subtle text-primary border border-primary small"></span>
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <div id="patients"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xxl-3 col-sm-12">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title">Overview</h5>
                  </div>
                  <div className="card-body">
                    <div className="overflow-hidden">
                      <div className="auto-align-graph">
                        <div id="overview"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <!-- Row ends --> */}

            {/* <!-- Row starts --> */}
            <div className="row gx-4">
              <div className="col-sm-12">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title">Income By Department</h5>
                  </div>
                  <div className="card-body">
                    <div className="overflow-hidden">
                      <div id="departments"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <!-- Row ends --> */}

            {/* <!-- Row starts --> */}
            <div className="row gx-4">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title">Patient Visits</h5>
                  </div>
                  <div className="card-body pt-0">

                    {/* <!-- Table starts --> */}
                    <div className="table-responsive">
                      <table id="hideSearchExample" className="table m-0 align-middle">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Patient Name</th>
                            <th>Age</th>
                            <th>Date of Birth</th>
                            <th>Diagnosis</th>
                            <th>Type</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>001</td>
                            <td>
                              <img src="src/assets/images/patient.png" className="img-2x rounded-5 me-1"
                                alt="Doctors Admin Template" />
                              Willian Mathews
                            </td>
                            <td>21</td>
                            <td>
                              20/06/2010
                            </td>
                            <td>Implant</td>
                            <td>
                              <span className="badge bg-danger-subtle text-danger fs-6">Emergency</span>
                            </td>
                            <td>
                              <div className="d-inline-flex gap-1">
                                <button type="button" className="btn btn-hover btn-sm rounded-5" data-bs-toggle="modal"
                                  data-bs-target="#delRow">
                                  <span data-bs-toggle="tooltip" data-bs-placement="top"
                                    data-bs-title="Delete Patient Details">
                                    <i className="ri-delete-bin-line"></i>
                                  </span>
                                </button>
                                <a href="edit-patient.html" className="btn btn-hover btn-sm rounded-5"
                                  data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Patient Details">
                                  <i className="ri-edit-box-line"></i>
                                </a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>002</td>
                            <td>
                              <img src="src/assets/images/patient1.png" className="img-2x rounded-5 me-1"
                                alt="Doctors Admin Template" />
                              Adam Bradley
                            </td>
                            <td>36</td>
                            <td>
                              24/09/2002
                            </td>
                            <td>Periodontics</td>
                            <td>
                              <span className="badge bg-primary-subtle text-primary fs-6">Non Urgent</span>
                            </td>
                            <td>
                              <div className="d-inline-flex gap-1">
                                <button type="button" className="btn btn-hover btn-sm rounded-5" data-bs-toggle="modal"
                                  data-bs-target="#delRow">
                                  <span data-bs-toggle="tooltip" data-bs-placement="top"
                                    data-bs-title="Delete Patient Details">
                                    <i className="ri-delete-bin-line"></i>
                                  </span>
                                </button>
                                <a href="edit-patient.html" className="btn btn-hover btn-sm rounded-5"
                                  data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Patient Details">
                                  <i className="ri-edit-box-line"></i>
                                </a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>003</td>
                            <td>
                              <img src="src/assets/images/patient2.png" className="img-2x rounded-5 me-1"
                                alt="Doctors Admin Template" />
                              Mayra Hatfield
                            </td>
                            <td>82</td>
                            <td>
                              22/02/2007
                            </td>
                            <td>Root Canal</td>
                            <td>
                              <span className="badge bg-warning-subtle text-warning fs-6">Out Patient</span>
                            </td>
                            <td>
                              <div className="d-inline-flex gap-1">
                                <button type="button" className="btn btn-hover btn-sm rounded-5" data-bs-toggle="modal"
                                  data-bs-target="#delRow">
                                  <span data-bs-toggle="tooltip" data-bs-placement="top"
                                    data-bs-title="Delete Patient Details">
                                    <i className="ri-delete-bin-line"></i>
                                  </span>
                                </button>
                                <a href="edit-patient.html" className="btn btn-hover btn-sm rounded-5"
                                  data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Patient Details">
                                  <i className="ri-edit-box-line"></i>
                                </a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>004</td>
                            <td>
                              <img src="src/assets/images/patient3.png" className="img-2x rounded-5 me-1"
                                alt="Doctors Admin Template" />
                              Nicole Sellers
                            </td>
                            <td>29</td>
                            <td>
                              28/09/1996
                            </td>
                            <td>Dentures</td>
                            <td>
                              <span className="badge bg-info-subtle text-info fs-6">Discharge</span>
                            </td>
                            <td>
                              <div className="d-inline-flex gap-1">
                                <button type="button" className="btn btn-hover btn-sm rounded-5" data-bs-toggle="modal"
                                  data-bs-target="#delRow">
                                  <span data-bs-toggle="tooltip" data-bs-placement="top"
                                    data-bs-title="Delete Patient Details">
                                    <i className="ri-delete-bin-line"></i>
                                  </span>
                                </button>
                                <a href="edit-patient.html" className="btn btn-hover btn-sm rounded-5"
                                  data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Patient Details">
                                  <i className="ri-edit-box-line"></i>
                                </a>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td>005</td>
                            <td>
                              <img src="src/assets/images/patient4.png" className="img-2x rounded-5 me-1"
                                alt="Doctors Admin Template" />
                              Roseann Kane
                            </td>
                            <td>58</td>
                            <td>
                              30/03/1989
                            </td>
                            <td>Implant</td>
                            <td>
                              <span className="badge bg-danger-subtle text-danger fs-6">Urgent</span>
                            </td>
                            <td>
                              <div className="d-inline-flex gap-1">
                                <button type="button" className="btn btn-hover btn-sm rounded-5" data-bs-toggle="modal"
                                  data-bs-target="#delRow">
                                  <span data-bs-toggle="tooltip" data-bs-placement="top"
                                    data-bs-title="Delete Patient Details">
                                    <i className="ri-delete-bin-line"></i>
                                  </span>
                                </button>
                                <a href="edit-patient.html" className="btn btn-hover btn-sm rounded-5"
                                  data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Patient Details">
                                  <i className="ri-edit-box-line"></i>
                                </a>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    {/* <!-- Table ends --> */}

                    {/* <!-- Modal Delete Row --> */}
                    <div className="modal fade" id="delRow" tabIndex={-1} aria-labelledby="delRowLabel" aria-hidden="true">
                      <div className="modal-dialog modal-sm">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h5 className="modal-title" id="delRowLabel">
                              Confirm
                            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div className="modal-body">
                            Are you sure you want to delete the patient details?
                          </div>
                          <div className="modal-footer">
                            <div className="d-flex justify-content-end gap-2">
                              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal"
                                aria-label="Close">No</button>
                              <button type="button" className="btn btn-danger" data-bs-dismiss="modal"
                                aria-label="Close">Yes</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
            {/* <!-- Row ends --> */}
    </>
  )
}

export default Dashboard