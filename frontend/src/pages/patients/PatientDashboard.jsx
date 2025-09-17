import React from 'react'

const PatientDashboard = () => {
  return (
    <>
            <div className="row gx-4">
              <div className="col-sm-12">
                <div className="card mb-4">
                  <div className="card-body">

                    <div className="d-flex">
                      
                      <div className="d-flex align-items-center flex-wrap gap-4">
                        <div className="d-flex align-items-center">
                          <div className="icon-box lg bg-primary-subtle rounded-5 me-2">
                            <i className="ri-account-circle-line fs-3 text-primary"></i>
                          </div>
                          <div>
                            <h4 className="mb-1">Juana</h4>
                            <p className="m-0">Name</p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="icon-box lg bg-primary-subtle rounded-5 me-2">
                            <i className="ri-women-line fs-3 text-primary"></i>
                          </div>
                          <div>
                            <h4 className="mb-1">Female</h4>
                            <p className="m-0">Gender</p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="icon-box lg bg-primary-subtle rounded-5 me-2">
                            <i className="ri-arrow-right-up-line fs-3 text-primary"></i>
                          </div>
                          <div>
                            <h4 className="mb-1">24</h4>
                            <p className="m-0">Age</p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="icon-box lg bg-primary-subtle rounded-5 me-2">
                            <i className="ri-contrast-drop-2-line fs-3 text-primary"></i>
                          </div>
                          <div>
                            <h4 className="mb-1">O+</h4>
                            <p className="m-0">Blood Type</p>
                          </div>
                        </div>
                      </div>

                      <img src="/assets/images/patient2.png"
                        className="img-7x rounded-circle ms-auto border border-primary border-2"
                        alt="Dentit Admin Template" />
                    </div>

                  </div>
                  <div className="card-footer">
                    <div className="d-flex flex-row flex-wrap gap-3">
                      <div className="d-flex align-items-center">
                        <div className="icon-box sm bg-primary-subtle rounded-5 me-2">
                          <i className="ri-stethoscope-line fs-5 text-primary"></i>
                        </div>
                        <div>
                          Consulting Doctor: <span className="text-primary">Dr. Elina</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="icon-box sm bg-primary-subtle rounded-5 me-2">
                          <i className="ri-building-2-line fs-5 text-primary"></i>
                        </div>
                        <div>
                          Recent Visit: <span className="text-primary">28/08/2024</span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="icon-box sm bg-primary-subtle rounded-5 me-2">
                          <i className="ri-calendar-2-line fs-5 text-primary"></i>
                        </div>
                        <div>
                          Upcoming Visit: <span className="text-primary">08/09/2024</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row gx-4">
              <div className="col-sm-12">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title">Visits</h5>
                  </div>
                  <div className="card-body pt-0">
                    <div className="table-outer">
                      <div className="table-responsive">
                        <table className="table align-middle truncate m-0">
                          <thead>
                            <tr>
                              <th>Consulting Doctor</th>
                              <th>Visit Date</th>
                              <th>Department</th>
                              <th>Fee Paid</th>
                              <th>Lab Reports</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <img src="src/assets/images/doctor1.png" className="img-3x rounded-2" alt="Dentist Dashboard" />
                                Dr.
                                Hector
                              </td>
                              <td>20/05/2024</td>
                              <td>
                                Orthopaedics
                              </td>
                              <td>$200</td>
                              <td>
                                <div className="d-inline-flex gap-1">
                                  <button className="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-bs-target="#viewReportsModal1">
                                    View Reports
                                  </button>
                                  <button className="btn btn-outline-primary btn-sm" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-title="Download Report">
                                    <i className="ri-file-download-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="5">
                                <h6>Prescription</h6>
                                <p className="text-wrap m-0">The prescriptions featured in the dataset exhibit illegible
                                  handwriting, commonly encountered in medical practices. These images serve as
                                  invaluable resources for developing and evaluating algorithms aimed at enhancing
                                  handwriting recognition technologies within the medical domain.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="5">
                                <h6>Reports</h6>
                                <ul className="list-unstyled d-flex m-0">
                                  <li className="pe-2 border-end">Weight: 48lbs</li>
                                  <li className="px-2 border-end">Blood Pressure: 120</li>
                                  <li className="px-2 border-end">Sugar Levels Before: 90</li>
                                  <li className="px-2 border-end">Sugar Levels After: 180</li>
                                </ul>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="5">
                                <h6>Medicines</h6>
                                <p>For 10 Days</p>
                                <div className="d-flex gap-3">
                                  <ul className="d-flex gap-5 m-0">
                                    <li>
                                      <div>
                                        <h6>Aricep Tablet</h6>
                                        <ul className="list-unstyled d-flex mb-3">
                                          <li className="pe-2 border-end">Morning: 1</li>
                                          <li className="px-2 border-end">Afternoon: 0</li>
                                          <li className="px-2">Night: 1</li>
                                        </ul>
                                      </div>
                                    </li>
                                    <li>
                                      <div>
                                        <h6>Cresemba Capsule</h6>
                                        <ul className="list-unstyled d-flex mb-3">
                                          <li className="pe-2 border-end">Morning: 0</li>
                                          <li className="px-2 border-end">Afternoon: 1</li>
                                          <li className="px-2">Night: 1</li>
                                        </ul>
                                      </div>
                                    </li>
                                    <li>
                                      <div>
                                        <h6>Justoza Tablet</h6>
                                        <ul className="list-unstyled d-flex mb-3">
                                          <li className="pe-2 border-end">Morning: 1</li>
                                          <li className="px-2 border-end">Afternoon: 1</li>
                                          <li className="px-2">Night: 0</li>
                                        </ul>
                                      </div>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row gx-4">
              <div className="col-xxl-3 col-sm-6 col-12">
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center flex-column">
                      <div className="icon-box md rounded-5 border mb-3">
                        <i className="ri-capsule-line fs-4 text-primary"></i>
                      </div>
                      <div className="mb-4 text-center">
                        <h5>BP Levels</h5>
                        <span className="badge bg-primary">Recent five visits</span>
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <div id="bpLevels" className="mb-3"></div>
                    </div>
                    <ul className="list-group">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>24/04/2024</div>
                        <div>140</div>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>16/04/2024</div>
                        <div>190</div>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>10/04/2024</div>
                        <div>230</div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xxl-3 col-sm-6 col-12">
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center flex-column">
                      <div className="icon-box md rounded-5 border mb-3">
                        <i className="ri-contrast-drop-2-line fs-4 text-primary"></i>
                      </div>
                      <div className="mb-4 text-center">
                        <h5>Sugar Levels</h5>
                        <span className="badge bg-primary">Recent five visits</span>
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <div id="sugarLevels" className="mb-3"></div>
                    </div>
                    <ul className="list-group">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>24/04/2024</div>
                        <div>140</div>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>16/04/2024</div>
                        <div>190</div>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>10/04/2024</div>
                        <div>230</div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xxl-3 col-sm-6 col-12">
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center flex-column">
                      <div className="icon-box md rounded-5 border mb-3">
                        <i className="ri-heart-pulse-line fs-4 text-primary"></i>
                      </div>
                      <div className="mb-4 text-center">
                        <h5>Heart Rate</h5>
                        <span className="badge bg-primary">Recent five visits</span>
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <div id="heartRate" className="mb-3"></div>
                    </div>
                    <ul className="list-group">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>24/04/2024</div>
                        <div>110</div>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>16/04/2024</div>
                        <div>120</div>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>10/04/2024</div>
                        <div>100</div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xxl-3 col-sm-6 col-12">
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center flex-column">
                      <div className="icon-box md rounded-5 border mb-3">
                        <i className="ri-flask-line fs-4 text-primary"></i>
                      </div>
                      <div className="mb-4 text-center">
                        <h5>Clolesterol</h5>
                        <span className="badge bg-primary">Recent five visits</span>
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <div id="clolesterolLevels" className="mb-3"></div>
                    </div>
                    <ul className="list-group">
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>24/04/2024</div>
                        <div>180</div>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>16/04/2024</div>
                        <div>220</div>
                      </li>
                      <li className="list-group-item d-flex justify-content-between align-items-center">
                        <div>10/04/2024</div>
                        <div>230</div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="row gx-4">
              <div className="col-xl-6 col-sm-12">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title">Insurance Claims</h5>
                  </div>
                  <div className="card-body">
                    <div className="overflow-hidden">
                      <div id="insuranceClaims"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-sm-12">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title">Medical Expenses</h5>
                  </div>
                  <div className="card-body">
                    <div className="overflow-hidden">
                      <div id="medicalExpenses"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-sm-12">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title">Doctor Visits</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-outer">
                      <div className="table-responsive">
                        <table className="table align-middle truncate m-0">
                          <thead>
                            <tr>
                              <th>Doctor</th>
                              <th>Date</th>
                              <th>Department</th>
                              <th>Reports</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <img src="src/assets/images/doctor1.png" className="img-3x rounded-2" alt="Dentist Dashboard" />
                                Dr.
                                Hector
                              </td>
                              <td>20/05/2024</td>
                              <td>
                                Dentist
                              </td>
                              <td>
                                <div className="d-inline-flex gap-1">
                                  <button className="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-bs-target="#viewReportsModal1">
                                    View Reports
                                  </button>
                                  <button className="btn btn-outline-primary btn-sm" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-title="Download Report">
                                    <i className="ri-file-download-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <img src="src/assets/images/doctor5.png" className="img-3x rounded-2" alt="Dentist Dashboard" />
                                Dr.
                                Mitchel
                              </td>
                              <td>20/05/2024</td>
                              <td>
                                Urologist
                              </td>
                              <td>
                                <div className="d-inline-flex gap-1">
                                  <button className="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-bs-target="#viewReportsModal1">
                                    View Reports
                                  </button>
                                  <button className="btn btn-outline-primary btn-sm" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-title="Download Report">
                                    <i className="ri-file-download-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <img src="/assets/images/doctor3.png" className="img-3x rounded-2" alt="Dentist Dashboard" />
                                Dr.
                                Fermin
                              </td>
                              <td>18/03/2024</td>
                              <td>
                                Surgeon
                              </td>
                              <td>
                                <div className="d-inline-flex gap-1">
                                  <button className="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-bs-target="#viewReportsModal1">
                                    View Reports
                                  </button>
                                  <button className="btn btn-outline-primary btn-sm" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-title="Download Report">
                                    <i className="ri-file-download-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-sm-12">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title">Reports</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-outer">
                      <div className="table-responsive">
                        <table className="table align-middle truncate m-0">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>File</th>
                              <th>Reports Link</th>
                              <th>Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>1</td>
                              <td>
                                <div className="icon-box md bg-primary rounded-2">
                                  <i className="ri-file-excel-2-line"></i>
                                </div>
                              </td>
                              <td>
                                <a href="#!" className="link-primary text-truncate">Reports 1 clinical
                                  documentation</a>
                              </td>
                              <td>May-28, 2024</td>
                              <td>
                                <div className="d-inline-flex gap-1">
                                  <button className="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-bs-target="#delRow">
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                  <button className="btn btn-outline-primary btn-sm" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-title="Download Report">
                                    <i className="ri-file-download-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>
                                <div className="icon-box md bg-primary rounded-2">
                                  <i className="ri-file-excel-2-line"></i>
                                </div>
                              </td>
                              <td>
                                <a href="#!" className="link-primary text-truncate">Reports 2 random files
                                  documentation</a>
                              </td>
                              <td>Mar-20, 2024</td>
                              <td>
                                <div className="d-inline-flex gap-1">
                                  <button className="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-bs-target="#delRow">
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                  <button className="btn btn-outline-primary btn-sm" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-title="Download Report">
                                    <i className="ri-file-download-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td>3</td>
                              <td>
                                <div className="icon-box md bg-primary rounded-2">
                                  <i className="ri-file-excel-2-line"></i>
                                </div>
                              </td>
                              <td>
                                <a href="#!" className="link-primary text-truncate">Reports 3 glucose level
                                  complete report</a>
                              </td>
                              <td>Feb-18, 2024</td>
                              <td>
                                <div className="d-inline-flex gap-1">
                                  <button className="btn btn-primary btn-sm" data-bs-toggle="modal"
                                    data-bs-target="#delRow">
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                  <button className="btn btn-outline-primary btn-sm" data-bs-toggle="tooltip"
                                    data-bs-placement="top" data-bs-title="Download Report">
                                    <i className="ri-file-download-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-sm-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title">Health Activity</h5>
                  </div>
                  <div className="card-body">
                    <div className="scroll350">
                      <div className="overflow-hidden">
                        <div id="healthActivity"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-sm-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title">Pharmacy</h5>
                  </div>
                  <div className="card-body">
                    <div className="scroll350">
                      <div className="text-center">
                        <img className="img-fluid mb-3" src="/assets/images/reports.svg" style={{width: '180px'}}
                          alt="Dentist Admin Templates" />
                        <h2>$980</h2>
                        <span className="d-block mb-1">Average Spending</span>
                        <span className="d-block mb-2"><b>+20%</b> vs last month</span>
                        <p className="m-0 opacity-75">You can choose from over 1600 admin dashboard templates on Bootstrap
                          Gallery.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-sm-12">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="card-title">Timeline</h5>
                  </div>
                  <div className="card-body">

                    <div className="scroll350">
                      <div className="activity-feed px-2 pt-2">
                        <div className="feed-item">
                          <span className="feed-date pb-1" data-bs-toggle="tooltip" data-bs-title="Today 05:32:35">An
                            Hour Ago</span>
                          <div className="mb-1">
                            <a href="#" className="text-primary">Dr. Janie Mcdonald</a> - sent a new prescription.
                          </div>
                          <div className="mb-1">Medecine Name - <a href="#" className="text-danger">Amocvmillin</a></div>
                          <a href="#!" className="text-dark">Payment Link <i className="ri-arrow-right-up-line"></i> </a>
                        </div>
                        <div className="feed-item">
                          <span className="feed-date pb-1" data-bs-toggle="tooltip" data-bs-title="Today 05:32:35">An
                            Hour Ago</span>
                          <div className="mb-1">
                            <a href="#" className="text-primary">Dr. Hector Banks</a> - uploaded a report.
                          </div>
                          <div className="mb-1">Report Name - <a href="#" className="text-danger">Lisymorpril</a></div>
                          <a href="#!" className="text-dark">Payment Link <i className="ri-arrow-right-up-line"></i> </a>
                        </div>
                        <div className="feed-item">
                          <span className="feed-date pb-1" data-bs-toggle="tooltip" data-bs-title="Today 05:32:35">An
                            Hour Ago</span>
                          <div className="mb-1">
                            <a href="#" className="text-primary">Dr. Deena Cooley</a> - sent medecine details.
                          </div>
                          <div className="mb-1">Medecine Name - <a href="#" className="text-danger">Predeymsone</a></div>
                          <a href="#!" className="text-dark">Payment Link <i className="ri-arrow-right-up-line"></i> </a>
                        </div>
                        <div className="feed-item">
                          <span className="feed-date pb-1" data-bs-toggle="tooltip" data-bs-title="Today 05:32:35">An
                            Hour Ago</span>
                          <div className="mb-1">
                            <a href="#" className="text-primary">Dr. Mitchel Alvarez</a> - added import files.
                          </div>
                          <div className="mb-1">File Name - <a href="#" className="text-danger">Naverreone</a></div>
                          <a href="#!" className="text-dark">Payment Link <i className="ri-arrow-right-up-line"></i> </a>
                        </div>
                        <div className="feed-item">
                          <span className="feed-date pb-1" data-bs-toggle="tooltip" data-bs-title="Today 05:32:35">An
                            Hour Ago</span>
                          <div className="mb-1">
                            <a href="#" className="text-primary">Dr. Owen Scott</a> - reviewed your file.
                          </div>
                          <div className="mb-1">File Name - <a href="#" className="text-danger">Gabateyntin</a></div>
                          <a href="#!" className="text-dark">Payment Link <i className="ri-arrow-right-up-line"></i> </a>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div className="modal fade" id="delRow" tabindex="-1" aria-labelledby="delRowLabel" aria-hidden="true">
              <div className="modal-dialog modal-sm">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="delRowLabel">
                      Confirm
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    Are you sure you want to delete this report?
                  </div>
                  <div className="modal-footer">
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-outline-secondary" data-bs-dismiss="modal" aria-label="Close">No</button>
                      <button className="btn btn-danger" data-bs-dismiss="modal" aria-label="Close">Yes</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal fade" id="viewReportsModal1" tabindex="-1" aria-labelledby="viewReportsModalLabel1"
              aria-hidden="true">
              <div className="modal-dialog modal-xl">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="viewReportsModalLabel1">
                      View Reports
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">

                    <div className="row g-4">
                      <div className="col-sm-2">
                        <a href="#" className="d-flex flex-column bg-light p-2 rounded-2 text-center"
                          data-bs-target="#viewReportsModal2" data-bs-toggle="modal">
                          <img src="/assets/images/report.svg" className="img-fluid rounded-2" alt="Dentist Dashboards" />
                          <h6 className="mt-3 mb-1 text-truncate">Clinical Report</h6>
                          <p className="m-0 small">10/05/2024</p>
                        </a>
                      </div>
                      <div className="col-sm-2">
                        <a href="#" className="d-flex flex-column bg-light p-2 rounded-2 text-center"
                          data-bs-target="#viewReportsModal2" data-bs-toggle="modal">
                          <img src="/assets/images/report.svg" className="img-fluid rounded-2" alt="Dentist Dashboards" />
                          <h6 className="mt-3 mb-1 text-truncate">Dentist Report</h6>
                          <p className="m-0 small">20/06/2024</p>
                        </a>
                      </div>
                      <div className="col-sm-2">
                        <a href="#" className="d-flex flex-column bg-light p-2 rounded-2 text-center"
                          data-bs-target="#viewReportsModal2" data-bs-toggle="modal">
                          <img src="/assets/images/report.svg" className="img-fluid rounded-2" alt="Dentist Dashboards" />
                          <h6 className="mt-3 mb-1 text-truncate">Glucose Report</h6>
                          <p className="m-0 small">30/06/2024</p>
                        </a>
                      </div>
                      <div className="col-sm-2">
                        <a href="#" className="d-flex flex-column bg-light p-2 rounded-2 text-center"
                          data-bs-target="#viewReportsModal2" data-bs-toggle="modal">
                          <img src="/assets/images/report.svg" className="img-fluid rounded-2" alt="Dentist Dashboards" />
                          <h6 className="mt-3 mb-1 text-truncate">X-ray Report</h6>
                          <p className="m-0 small">26/08/2024</p>
                        </a>
                      </div>
                      <div className="col-sm-2">
                        <a href="#" className="d-flex flex-column bg-light p-2 rounded-2 text-center"
                          data-bs-target="#viewReportsModal2" data-bs-toggle="modal">
                          <img src="/assets/images/report.svg" className="img-fluid rounded-2" alt="Dentist Dashboards" />
                          <h6 className="mt-3 mb-1 text-truncate">Ultrasound Report</h6>
                          <p className="m-0 small">21/08/2024</p>
                        </a>
                      </div>
                      <div className="col-sm-2">
                        <a href="#" className="d-flex flex-column bg-light p-2 rounded-2 text-center"
                          data-bs-target="#viewReportsModal2" data-bs-toggle="modal">
                          <img src="/assets/images/report.svg" className="img-fluid rounded-2" alt="Dentist Dashboards" />
                          <h6 className="mt-3 mb-1 text-truncate">Hypothermia Report</h6>
                          <p className="m-0 small">15/04/2024</p>
                        </a>
                      </div>
                      <div className="col-sm-2">
                        <a href="#" className="d-flex flex-column bg-light p-2 rounded-2 text-center"
                          data-bs-target="#viewReportsModal2" data-bs-toggle="modal">
                          <img src="/assets/images/report.svg" className="img-fluid rounded-2" alt="Dentist Dashboards" />
                          <h6 className="mt-3 mb-1 text-truncate">Discharge Report</h6>
                          <p className="m-0 small">22/07/2024</p>
                        </a>
                      </div>
                      <div className="col-sm-2">
                        <a href="#" className="d-flex flex-column bg-light p-2 rounded-2 text-center"
                          data-bs-target="#viewReportsModal2" data-bs-toggle="modal">
                          <img src="/assets/images/report.svg" className="img-fluid rounded-2" alt="Dentist Dashboards" />
                          <h6 className="mt-3 mb-1 text-truncate">Diabetes Report</h6>
                          <p className="m-0 small">17/05/2024</p>
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div className="modal fade" id="viewReportsModal2" tabindex="-1" aria-labelledby="viewReportsModalLabel2"
              aria-hidden="true">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="viewReportsModalLabel2">
                      <div className="d-flex align-items-center">
                        <a href="#!" className="btn btn-sm btn-outline-primary me-2" data-bs-target="#viewReportsModal1"
                          data-bs-toggle="modal">
                          <i className="ri-arrow-left-wide-fill"></i>
                        </a>
                        Clinical Report
                      </div>
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">

                    <div className="row g-4">
                      <div className="col-sm-12">
                        <a href="#" className="d-flex flex-column bg-light p-2 rounded-2 text-center">
                          <img src="/assets/images/report.svg" className="img-fluid rounded-2" alt="Dentist Dashboards" />
                          <h6 className="mt-3 mb-1 text-truncate">Clinical Report</h6>
                          <p className="m-0 small">10/05/2024</p>
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
    </>
  )
}

export default PatientDashboard