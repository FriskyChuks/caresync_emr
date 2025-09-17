import { Link } from "react-router-dom"
import useAuth from "../../hooks/useAuth"

const PatientList = () => {
  return (
    <>
      <div class="row gx-4">
        <div class="col-sm-12">
          <div class="card">
            <div class="card-header">
              <div class="d-flex align-items-center justify-content-between">
                <h5 class="card-title m-0">Patients List</h5>
                <div class="ms-auto d-flex gap-2">

                  <div class="search-container d-xl-block d-none">
                    <input type="text" class="form-control border" id="searchPatient" placeholder="Search" />
                    <i class="ri-search-line"></i>
                  </div>

                  <Link to="/patient-registration" class="btn btn-primary">Add Patient</Link>

                </div>
              </div>
            </div>
            <div class="card-body">

              <div class="row gx-4">
                <div class="col-sm-4">
                  <div class="card mb-4 border">
                    <div class="card-body">

                      <Link to="/patient-dashboard">
                        <div class="d-flex flex-wrap gap-3 border-bottom mb-2">
                          <img src="/assets/images/patient1.png" class="img-4x rounded-3"
                            alt="Dental Admin Dashboard" />
                          <div class="d-flex flex-column">
                            <div class="text-primary mb-1">
                              #PT0001
                            </div>
                            <div class="fw-semibold mb-1">Janine Gomez</div>
                            <ul class="list-unstyled d-flex">
                              <li class="pe-2 border-end">Age: 32</li>
                              <li class="px-2 border-end">Female</li>
                              <li class="px-2">O+</li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h6 class="text-primary">Diagnosis</h6>
                          <p class="text-truncate mb-2">The process of identifying a disease, condition, or injury
                            from its signs and symptoms.
                          </p>
                          <p class="text-truncate m-0"><span class="text-primary">Last Visit:</span> 06/06/2024 at
                            2:30PM</p>
                        </div>
                      </Link>

                    </div>
                  </div>
                </div>
                <div class="col-sm-4">
                  <div class="card mb-4 border">
                    <div class="card-body">

                      <Link to="/patient-dashboard">
                        <div class="d-flex flex-wrap gap-3 border-bottom mb-2">
                          <img src="/assets/images/patient2.png" class="img-4x rounded-3"
                            alt="Dental Admin Dashboard" />
                          <div class="d-flex flex-column">
                            <div class="text-primary mb-1">
                              #PT0002
                            </div>
                            <div class="fw-semibold mb-1">Graciela Chase</div>
                            <ul class="list-unstyled d-flex">
                              <li class="pe-2 border-end">Age: 39</li>
                              <li class="px-2 border-end">Female</li>
                              <li class="px-2">B+</li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h6 class="text-primary">Diagnosis</h6>
                          <p class="text-truncate mb-2">The process of identifying a disease, condition, or injury
                            from its signs and symptoms.
                          </p>
                          <p class="text-truncate m-0"><span class="text-primary">Last Visit:</span> 18/02/2024 at
                            6:30PM</p>
                        </div>
                      </Link>

                    </div>
                  </div>
                </div>
                <div class="col-sm-4">
                  <div class="card mb-4 border">
                    <div class="card-body">

                      <Link to="/patient-dashboard">
                        <div class="d-flex flex-wrap gap-3 border-bottom mb-2">
                          <img src="/assets/images/patient3.png" class="img-4x rounded-3"
                            alt="Dental Admin Dashboard" />
                          <div class="d-flex flex-column">
                            <div class="text-primary mb-1">
                              #PT0003
                            </div>
                            <div class="fw-semibold mb-1">Rose Lindsey</div>
                            <ul class="list-unstyled d-flex">
                              <li class="pe-2 border-end">Age: 32</li>
                              <li class="px-2 border-end">Female</li>
                              <li class="px-2">AB+</li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h6 class="text-primary">Diagnosis</h6>
                          <p class="text-truncate mb-2">The process of identifying a disease, condition, or injury
                            from its signs and symptoms.
                          </p>
                          <p class="text-truncate m-0"><span class="text-primary">Last Visit:</span> 16/01/2024 at
                            4:45PM</p>
                        </div>
                      </Link>

                    </div>
                  </div>
                </div>
                <div class="col-sm-4">
                  <div class="card mb-4 border">
                    <div class="card-body">

                      <a href="patient-dashboard.html">
                        <div class="d-flex flex-wrap gap-3 border-bottom mb-2">
                          <img src="/assets/images/patient4.png" class="img-4x rounded-3"
                            alt="Dental Admin Dashboard" />
                          <div class="d-flex flex-column">
                            <div class="text-primary mb-1">
                              #PT0004
                            </div>
                            <div class="fw-semibold mb-1">Alba Mathews</div>
                            <ul class="list-unstyled d-flex">
                              <li class="pe-2 border-end">Age: 65</li>
                              <li class="px-2 border-end">Female</li>
                              <li class="px-2">A-</li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h6 class="text-primary">Diagnosis</h6>
                          <p class="text-truncate mb-2">The process of identifying a disease, condition, or injury
                            from its signs and symptoms.
                          </p>
                          <p class="text-truncate m-0"><span class="text-primary">Last Visit:</span> 20/03/2024 at
                            3:45PM</p>
                        </div>
                      </a>

                    </div>
                  </div>
                </div>
                <div class="col-sm-4">
                  <div class="card mb-4 border">
                    <div class="card-body">

                      <a href="patient-dashboard.html">
                        <div class="d-flex flex-wrap gap-3 border-bottom mb-2">
                          <img src="/assets/images/patient.png" class="img-4x rounded-3"
                            alt="Dental Admin Dashboard" />
                          <div class="d-flex flex-column">
                            <div class="text-primary mb-1">
                              #PT0005
                            </div>
                            <div class="fw-semibold mb-1">Jacob Calderon</div>
                            <ul class="list-unstyled d-flex">
                              <li class="pe-2 border-end">Age: 23</li>
                              <li class="px-2 border-end">Male</li>
                              <li class="px-2">O-</li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h6 class="text-primary">Diagnosis</h6>
                          <p class="text-truncate mb-2">The process of identifying a disease, condition, or injury
                            from its signs and symptoms.
                          </p>
                          <p class="text-truncate m-0"><span class="text-primary">Last Visit:</span> 09/02/2024 at
                            10:30AM</p>
                        </div>
                      </a>

                    </div>
                  </div>
                </div>
                <div class="col-sm-4">
                  <div class="card mb-4 border">
                    <div class="card-body">

                      <a href="patient-dashboard.html">
                        <div class="d-flex flex-wrap gap-3 border-bottom mb-2">
                          <img src="/assets/images/patient5.png" class="img-4x rounded-3"
                            alt="Dental Admin Dashboard" />
                          <div class="d-flex flex-column">
                            <div class="text-primary mb-1">
                              #PT0006
                            </div>
                            <div class="fw-semibold mb-1">Cyrus Henson</div>
                            <ul class="list-unstyled d-flex">
                              <li class="pe-2 border-end">Age: 48</li>
                              <li class="px-2 border-end">Male</li>
                              <li class="px-2">B+</li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h6 class="text-primary">Diagnosis</h6>
                          <p class="text-truncate mb-2">The process of identifying a disease, condition, or injury
                            from its signs and symptoms.
                          </p>
                          <p class="text-truncate m-0"><span class="text-primary">Last Visit:</span> 24/02/2024 at
                            6:15PM</p>
                        </div>
                      </a>

                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div class="card-footer">

              <nav>
                <ul class="pagination justify-content-center">
                  <li class="page-item">
                    <a class="page-link">
                      <i class="ri-arrow-left-s-line"></i>
                    </a>
                  </li>
                  <li class="page-item"><a class="page-link" href="#">1</a></li>
                  <li class="page-item"><a class="page-link" href="#">2</a></li>
                  <li class="page-item"><a class="page-link" href="#">3</a></li>
                  <li class="page-item"><a class="page-link" href="#">4</a></li>
                  <li class="page-item"><a class="page-link" href="#">5</a></li>
                  <li class="page-item">
                    <a class="page-link" href="#">
                      <i class="ri-arrow-right-s-line"></i>
                    </a>
                  </li>
                </ul>
              </nav>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PatientList