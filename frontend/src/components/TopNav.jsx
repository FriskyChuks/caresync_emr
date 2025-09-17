import useAuth from "../hooks/useAuth"
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const TopNav = () => {
  const { user, logout, loading } = useAuth();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`patient/search?q=${encodeURIComponent(query)}`);
      setQuery("");
    }
  };

  if (loading || !user) return null; // or show a spinner/loading state

  return (
    <>
    {/* <!-- App header starts --> */}
          <div className="app-header d-flex align-items-center">

            {/* <!-- Brand container sm starts --> */}
            <div className="brand-container-sm d-xl-none d-flex align-items-center">

              {/* <!-- App brand starts --> */}
              <div className="app-brand">
                <a href="index.html">
                  <img src="/assets/images/caresync_logo.png" className="logo" alt="Dental Care Admin Template" />
                  <span style={{color:"white"}}><strong>CARESYNC</strong></span>
                </a>
              </div>
              {/* <!-- App brand ends --> */}

              {/* <!-- Toggle sidebar starts --> */}
              <button type="button" className="toggle-sidebar">
                <i className="ri-menu-line"></i>
              </button>
              {/* <!-- Toggle sidebar ends --> */}

            </div>
            {/* <!-- Brand container sm ends --> */}

            {/* <!-- Search container starts --> */}
            <div className="search-container d-xl-block d-none">
              <form action="" onSubmit={handleSearch} className="position-relative">
                <input type="text" className="form-control" id="searchId" placeholder="Search Patient"
              value={query} onChange={ (e) => setQuery(e.target.value) } 
              />
              </form>
              <i className="ri-search-line"></i>
            </div>
            {/* <!-- Search container ends --> */}

            {/* <!-- App header actions starts --> */}
            <div className="header-actions">

              {/* <!-- Header actions starts --> */}
              <div className="d-lg-flex d-none gap-2">

                {/* <!-- Select country dropdown starts --> */}
                <div className="dropdown">
                  <a className="dropdown-toggle header-icon" href="#!" role="button" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <img src="/assets/images/flags/1x1/fr.svg" className="header-country-flag" alt="Bootstrap Dashboards" />
                  </a>
                  <div className="dropdown-menu dropdown-menu-end dropdown-mini">
                    <div className="country-container">
                      <a href="index.html" className="py-2">
                        <img src="/assets/images/flags/1x1/us.svg" alt="Admin Panel" />
                      </a>
                      <a href="index.html" className="py-2">
                        <img src="/assets/images/flags/1x1/in.svg" alt="Admin Panels" />
                      </a>
                      <a href="index.html" className="py-2">
                        <img src="/assets/images/flags/1x1/br.svg" alt="Admin Dashboards" />
                      </a>
                      <a href="index.html" className="py-2">
                        <img src="/assets/images/flags/1x1/tr.svg" alt="Admin Templatess" />
                      </a>
                      <a href="index.html" className="py-2">
                        <img src="/assets/images/flags/1x1/gb.svg" alt="Google Admin" />
                      </a>
                    </div>
                  </div>
                </div>
                {/* <!-- Select country dropdown ends --> */}

                {/* <!-- Bookmarks starts --> */}
                <div className="dropdown">
                  <a className="dropdown-toggle header-icon" href="#!" role="button" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <i className="ri-star-line"></i>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end dropdown-300">
                    <h5 className="fw-semibold px-3 py-2 text-primary">Bookmarks</h5>

                    <div className="d-flex justify-content-center gap-3">
                      <a href="doctors-cards.html" className="text-center">
                        <div className="icon-box lg bg-primary-subtle rounded-5 mb-1">
                          <i className="ri-stethoscope-line text-primary fs-4"></i>
                        </div>
                        Doctors
                      </a>
                      <a href="staff.html" className="text-center">
                        <div className="icon-box lg bg-primary-subtle rounded-5 mb-1">
                          <i className="ri-nurse-line text-primary fs-4"></i>
                        </div>
                        Staff
                      </a>
                      <a href="patients-list.html" className="text-center">
                        <div className="icon-box lg bg-primary-subtle rounded-5 mb-1">
                          <i className="ri-group-2-line text-primary fs-4"></i>
                        </div>
                        Patients
                      </a>
                    </div>

                    {/* <!-- View all button starts --> */}
                    <div className="d-grid m-3">
                      <a href="javascript:void(0)" className="btn btn-outline-primary">Add New Bookmark</a>
                    </div>
                    {/* <!-- View all button ends --> */}

                  </div>
                </div>
                {/* <!-- Bookmarks ends --> */}

                {/* <!-- Notifications dropdown starts --> */}
                <div className="dropdown">
                  <a className="dropdown-toggle header-icon" href="#!" role="button" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <i className="ri-list-check-3"></i>
                    <span className="count-label warning"></span>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end dropdown-300">
                    <h5 className="fw-semibold px-3 py-2 text-primary">Activity</h5>

                    {/* <!-- Scroll starts --> */}
                    <div className="scroll300">

                      {/* <!-- Activity List Starts --> */}
                      <div className="p-3">
                        <ul className="p-0 activity-list2">
                          <li className="activity-item pb-3 mb-3">
                            <a href="#!">
                              <h5 className="fw-regular">
                                <i className="ri-circle-fill text-danger me-1"></i>
                                Invoices.
                              </h5>
                              <div className="ps-3 ms-2 border-start">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="flex-shrink-0">
                                    <img src="/assets/images/products/1.jpg" className="img-3x rounded-1"
                                      alt="Dentist Admin Templates" />
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    23 invoices have been paid to the Clove Labs.
                                  </div>
                                </div>
                                <p className="m-0 small">10:20AM Today</p>
                              </div>
                            </a>
                          </li>
                          <li className="activity-item pb-3 mb-3">
                            <a href="#!">
                              <h5 className="fw-regular">
                                <i className="ri-circle-fill text-info me-1"></i>
                                Purchased.
                              </h5>
                              <div className="ps-3 ms-2 border-start">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="flex-shrink-0">
                                    <img src="/assets/images/products/2.jpg" className="img-3x rounded-1"
                                      alt="Dentist Admin Templates" />
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    28 new surgical equipments have been purchased.
                                  </div>
                                </div>
                                <p className="m-0 small">04:30PM Today</p>
                              </div>
                            </a>
                          </li>
                          <li className="activity-item pb-3 mb-3">
                            <a href="#!">
                              <h5 className="fw-regular">
                                <i className="ri-circle-fill text-success me-1"></i>
                                Appointed.
                              </h5>
                              <div className="ps-3 ms-2 border-start">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="flex-shrink-0">
                                    <img src="/assets/images/products/8.jpg" className="img-3x rounded-1"
                                      alt="Dentist Admin Templates" />
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    36 new doctors and 28 staff members appointed.
                                  </div>
                                </div>
                                <p className="m-0 small">06:50PM Today</p>
                              </div>
                            </a>
                          </li>
                          <li className="activity-item">
                            <a href="#!">
                              <h5 className="fw-regular">
                                <i className="ri-circle-fill text-warning me-1"></i>
                                Requested
                              </h5>
                              <div className="ps-3 ms-2 border-start">
                                <div className="d-flex align-items-center mb-2">
                                  <div className="flex-shrink-0">
                                    <img src="/assets/images/products/9.jpg" className="img-3x rounded-1"
                                      alt="Dentist Admin Templates" />
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    Requested for 6 new vehicles for medical emergency. .
                                  </div>
                                </div>
                                <p className="m-0 small">08:30PM Today</p>
                              </div>
                            </a>
                          </li>
                        </ul>
                      </div>
                      {/* <!-- Activity List Ends --> */}

                    </div>
                    {/* <!-- Scroll ends --> */}

                    {/* <!-- View all button starts --> */}
                    <div className="d-grid m-3">
                      <a href="javascript:void(0)" className="btn btn-primary">View all</a>
                    </div>
                    {/* <!-- View all button ends --> */}

                  </div>
                </div>
                {/* <!-- Notifications dropdown ends --> */}

                {/* <!-- Notifications dropdown starts --> */}
                <div className="dropdown">
                  <a className="dropdown-toggle header-icon" href="#!" role="button" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <i className="ri-alarm-warning-line"></i>
                    <span className="count-label success"></span>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end dropdown-300">
                    <h5 className="fw-semibold px-3 py-2 text-primary">Alerts</h5>

                    {/* <!-- Scroll starts --> */}
                    <div className="scroll300">

                      {/* <!-- Alert list starts --> */}
                      <div className="p-3">
                        <div className="d-flex py-2">
                          <div className="icon-box md bg-primary rounded-circle me-3">
                            <span>BS</span>
                          </div>
                          <div className="m-0">
                            <h6 className="mb-1 fw-semibold">Becky Shah</h6>
                            <p className="mb-1">
                              Appointed as a new President 2025
                            </p>
                            <p className="small m-0 opacity-50">Today, 07:30pm</p>
                          </div>
                        </div>
                        <div className="d-flex py-2">
                          <div className="icon-box md bg-primary rounded-circle me-3">
                            <span>UF</span>
                          </div>
                          <div className="m-0">
                            <h6 className="mb-1 fw-semibold">Ursula Frazier</h6>
                            <p className="mb-1">
                              Congratulate, James for new job.
                            </p>
                            <p className="small m-0 opacity-50">Today, 08:00pm</p>
                          </div>
                        </div>
                        <div className="d-flex py-2">
                          <div className="icon-box md bg-primary rounded-circle me-3">
                            <span>MK</span>
                          </div>
                          <div className="m-0">
                            <h6 className="mb-1 fw-semibold">Myra Kane</h6>
                            <p className="mb-1">
                              Lewis added new doctors training schedule.
                            </p>
                            <p className="small m-0 opacity-50">Today, 09:30pm</p>
                          </div>
                        </div>
                      </div>
                      {/* <!-- Alert list ends --> */}

                    </div>
                    {/* <!-- Scroll ends --> */}

                    {/* <!-- View all button starts --> */}
                    <div className="d-grid m-3">
                      <a href="javascript:void(0)" className="btn btn-primary">View all</a>
                    </div>
                    {/* <!-- View all button ends --> */}

                  </div>
                </div>
                {/* <!-- Notifications dropdown ends --> */}

                {/* <!-- Messages dropdown starts --> */}
                <div className="dropdown">
                  <a className="dropdown-toggle header-icon" href="#!" role="button" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <i className="ri-message-3-line"></i>
                    <span className="count-label"></span>
                  </a>
                  <div className="dropdown-menu dropdown-menu-end dropdown-300">
                    <h5 className="fw-semibold px-3 py-2 text-primary">Messages</h5>

                    {/* <!-- Scroll starts --> */}
                    <div className="scroll300">

                      {/* <!-- Messages list starts --> */}
                      <div className="p-3">
                        <div className="d-flex py-2">
                          <img src="/assets/images/doctor3.png" className="img-3x me-3 rounded-5"
                            alt="Dentist Admin Templates" />
                          <div className="m-0">
                            <h6 className="mb-1 fw-semibold">Albert Winters</h6>
                            <p className="mb-1">
                              Appointed as a new President 2025
                            </p>
                            <p className="small m-0 opacity-50">Today, 07:30pm</p>
                          </div>
                        </div>
                        <div className="d-flex py-2">
                          <img src="/assets/images/doctor1.png" className="img-3x me-3 rounded-5"
                            alt="Dentist Admin Templates" />
                          <div className="m-0">
                            <h6 className="mb-1 fw-semibold">Van Robinson</h6>
                            <p className="mb-1">
                              Congratulate, James for new job.
                            </p>
                            <p className="small m-0 opacity-50">Today, 08:00pm</p>
                          </div>
                        </div>
                        <div className="d-flex py-2">
                          <img src="/assets/images/doctor4.png" className="img-3x me-3 rounded-5"
                            alt="Dentist Admin Templates" />
                          <div className="m-0">
                            <h6 className="mb-1 fw-semibold">Mara Coffey</h6>
                            <p className="mb-1">
                              Lewis added new doctors training schedule.
                            </p>
                            <p className="small m-0 opacity-50">Today, 09:30pm</p>
                          </div>
                        </div>
                      </div>
                      {/* <!-- Messages list ends --> */}

                    </div>
                    {/* <!-- Scroll ends --> */}

                    {/* <!-- View all button starts --> */}
                    <div className="d-grid m-3">
                      <a href="javascript:void(0)" className="btn btn-primary">View all</a>
                    </div>
                    {/* <!-- View all button ends --> */}

                  </div>
                </div>
              </div>
              {/* <!-- Header actions ends --> */}

              {/* <!-- Header user settings starts --> */}
              <div className="dropdown ms-3">
                <a id="userSettings" className="dropdown-toggle d-flex align-items-center" href="#!" role="button"
                  data-bs-toggle="dropdown" aria-expanded="false">
                  <div className="avatar-box">
                    <img src="/assets/images/doctor5.png" className="img-2xx rounded-5 border border-3 border-white"
                      alt="Dentist Dashboard" />
                    <span className="status busy"></span>
                  </div>
                </a>
                <div className="dropdown-menu dropdown-menu-end dropdown-300 shadow-lg">
                  <div className="d-flex align-items-center justify-content-between p-3">
                    <div>
                      <span className="small">{user.category}</span>
                      <h6 className="m-0">{user.first_name} {user.last_name}</h6>
                      <hr />
                    <Link to="/change-password">Change Password</Link>
                    </div>
                    
                    {/* <div className="d-flex flex-column text-end">
                      <h5 className="fw-bold lh-1 m-0">$5900</h5>
                      <div className="text-primary small">Weekly Earnings</div>
                    </div> */}
                  </div>
                  <div className="mx-3 my-2 d-grid">
                    <button onClick={logout} className="btn btn-primary">Logout</button>
                  </div>
                </div>
              </div>
              {/* <!-- Header user settings ends --> */}

            </div>
            {/* <!-- App header actions ends --> */}

          </div>
          {/* <!-- App header ends --> */}
    </>
  )
}

export default TopNav