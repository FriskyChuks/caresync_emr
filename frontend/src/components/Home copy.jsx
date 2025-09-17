import React from 'react'

const Home = () => {
  return (
    <>
    {/* <!-- Loading starts --> */}
    <div id="loading-wrapper">
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="spin-wrapper">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
    </div>
    {/* <!-- Loading ends --> */}

    {/* <!-- Page wrapper starts --> */}
    <div className="page-wrapper">

      {/* <!-- Main container starts --> */}
      <div className="main-container">

        {/* <!-- Sidebar wrapper starts --> */}
        <nav id="sidebar" className="sidebar-wrapper">

          {/* <!-- Brand container starts --> */}
          <div className="brand-container d-flex align-items-center justify-content-between">

            {/* <!-- App brand starts --> */}
            <div className="app-brand ms-3">
              <a href="index.html">
                <img src="src/assets/images/logo.svg" className="logo" alt="Dental Care Admin Template" />
              </a>
            </div>
            {/* <!-- App brand ends --> */}

            {/* <!-- Pin sidebar starts --> */}
            <button type="button" className="pin-sidebar me-3">
              <i className="ri-menu-line"></i>
            </button>
            {/* <!-- Pin sidebar ends --> */}

          </div>
          {/* <!-- Brand container ends --> */}

          {/* <!-- Sidebar profile starts --> */}
          <div className="sidebar-profile">
            <img src="src/assets/images/doctor5.png" className="rounded-5 border border-primary border-3"
              alt="Dentist Admin Templates" />
            <h6 className="mb-1 profile-name text-nowrap text-truncate text-primary">Jennifer Arter</h6>
            <small className="profile-name text-nowrap text-truncate">Department Head</small>
          </div>
          {/* <!-- Sidebar profile ends --> */}

          {/* <!-- Sidebar menu starts --> */}
          <div className="sidebarMenuScroll">
            <ul className="sidebar-menu">
              <li className="active current-page">
                <a href="index.html">
                  <i className="ri-home-6-line"></i>
                  <span className="menu-text">Dentist Admin</span>
                </a>
              </li>
              <li>
                <a href="dashboard2.html">
                  <i className="ri-home-smile-2-line"></i>
                  <span className="menu-text">Dentist Dashboard</span>
                </a>
              </li>
              <li>
                <a href="dashboard3.html">
                  <i className="ri-home-5-line"></i>
                  <span className="menu-text">Dental Clinic</span>
                </a>
              </li>
              <li>
                <a href="doc-appointments.html">
                  <i className="ri-calendar-2-line"></i>
                  <span className="menu-text">Appointments</span>
                </a>
              </li>
              <li>
                <a href="my-patients.html">
                  <i className="ri-empathize-line"></i>
                  <span className="menu-text">My Patients</span>
                </a>
              </li>
              <li>
                <a href="patient-profile.html">
                  <i className="ri-empathize-line"></i>
                  <span className="menu-text">Patient Profile</span>
                </a>
              </li>
              <li>
                <a href="doctor-dashboard.html">
                  <i className="ri-stethoscope-line"></i>
                  <span className="menu-text">Doctors Dashboard</span>
                </a>
              </li>
              <li>
                <a href="doctors-grid.html">
                  <i className="ri-stethoscope-line"></i>
                  <span className="menu-text">Doctors Grid</span>
                </a>
              </li>
              <li>
                <a href="doctors-cards.html">
                  <i className="ri-stethoscope-line"></i>
                  <span className="menu-text">Doctors Cards</span>
                </a>
              </li>
              <li>
                <a href="doctors-profile.html">
                  <i className="ri-stethoscope-line"></i>
                  <span className="menu-text">Doctors Profile</span>
                </a>
              </li>
              <li>
                <a href="add-doctors.html">
                  <i className="ri-stethoscope-line"></i>
                  <span className="menu-text">Add Doctor</span>
                </a>
              </li>
              <li>
                <a href="edit-doctors.html">
                  <i className="ri-stethoscope-line"></i>
                  <span className="menu-text">Edit Doctor</span>
                </a>
              </li>
              <li>
                <a href="patient-dashboard.html">
                  <i className="ri-heart-pulse-line"></i>
                  <span className="menu-text">Patients Dashboard</span>
                </a>
              </li>
              <li>
                <a href="patients-list.html">
                  <i className="ri-heart-pulse-line"></i>
                  <span className="menu-text">Patients List</span>
                </a>
              </li>
              <li>
                <a href="add-patient.html">
                  <i className="ri-heart-pulse-line"></i>
                  <span className="menu-text">Add Patient</span>
                </a>
              </li>
              <li>
                <a href="edit-patient.html">
                  <i className="ri-heart-pulse-line"></i>
                  <span className="menu-text">Edit Patient Details</span>
                </a>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-nurse-line"></i>
                  <span className="menu-text">Staff</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="staff.html">Staff List</a>
                  </li>
                  <li>
                    <a href="add-staff.html">Add Staff</a>
                  </li>
                  <li>
                    <a href="edit-staff.html">Edit Staff Details</a>
                  </li>
                </ul>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-dossier-line"></i>
                  <span className="menu-text">Appointments</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="appointments.html">Appointments</a>
                  </li>
                  <li>
                    <a href="appointments-list.html">Appointments List</a>
                  </li>
                  <li>
                    <a href="book-appointment.html">Book Appointment</a>
                  </li>
                  <li>
                    <a href="appointment-success.html">Appointment Success</a>
                  </li>
                  <li>
                    <a href="edit-appointment.html">Edit Appointment</a>
                  </li>
                </ul>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-building-2-line"></i>
                  <span className="menu-text">Departments</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="departments-list.html">Departments List</a>
                  </li>
                  <li>
                    <a href="add-department.html">Add Department</a>
                  </li>
                  <li>
                    <a href="edit-department.html">Edit Department</a>
                  </li>
                </ul>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-secure-payment-line"></i>
                  <span className="menu-text">Accounts</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="income.html">Income</a>
                  </li>
                  <li>
                    <a href="payments.html">Payments</a>
                  </li>
                  <li>
                    <a href="invoices.html">Invoices</a>
                  </li>
                  <li>
                    <a href="invoice-details.html">Invoice Details</a>
                  </li>
                  <li>
                    <a href="create-invoice.html">Create Invoice</a>
                  </li>
                  <li>
                    <a href="expenses.html">Expenses</a>
                  </li>
                </ul>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-group-2-line"></i>
                  <span className="menu-text">Human Resources</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="hr-approvals.html">HR Approvals</a>
                  </li>
                  <li>
                    <a href="staff-attendance.html">Attendance</a>
                  </li>
                  <li>
                    <a href="staff-leaves.html">Staff Leaves</a>
                  </li>
                  <li>
                    <a href="staff-holidays.html">Holidays</a>
                  </li>
                </ul>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-money-dollar-circle-line"></i>
                  <span className="menu-text">Salaries</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="salaries.html">Salary List</a>
                  </li>
                  <li>
                    <a href="payslip.html">Payslip</a>
                  </li>
                </ul>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-hotel-bed-line"></i>
                  <span className="menu-text">Rooms</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="room-statistics.html">Statistics</a>
                  </li>
                  <li>
                    <a href="rooms-allotted.html">Rooms Allotted</a>
                  </li>
                  <li>
                    <a href="rooms-by-dept.html">Rooms By Department</a>
                  </li>
                  <li>
                    <a href="available-rooms.html">Available Rooms</a>
                  </li>
                  <li>
                    <a href="book-room.html">Book Room</a>
                  </li>
                  <li>
                    <a href="add-room.html">Add Room</a>
                  </li>
                  <li>
                    <a href="edit-room.html">Edit Room</a>
                  </li>
                </ul>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-car-washing-line"></i>
                  <span className="menu-text">Ambulance</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="ambulance-list.html">Ambulance List</a>
                  </li>
                  <li>
                    <a href="add-ambulance.html">Add Ambulance</a>
                  </li>
                  <li>
                    <a href="edit-ambulance.html">Edit Ambulance</a>
                  </li>
                  <li>
                    <a href="ambulance-call-list.html">Ambulance Call List</a>
                  </li>
                  <li>
                    <a href="add-driver.html">Add Driver</a>
                  </li>
                  <li>
                    <a href="edit-driver.html">Edit Driver</a>
                  </li>
                  <li>
                    <a href="driver-list.html">Driver List</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="events.html">
                  <i className="ri-calendar-line"></i>
                  <span className="menu-text">Event Management</span>
                </a>
              </li>
              <li>
                <a href="gallery.html">
                  <i className="ri-tent-line"></i>
                  <span className="menu-text">Gallery</span>
                </a>
              </li>
              <li>
                <a href="news.html">
                  <i className="ri-news-line"></i>
                  <span className="menu-text">News & Updates</span>
                </a>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-color-filter-line"></i>
                  <span className="menu-text">UI Elements</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="alerts.html">Alerts</a>
                  </li>
                  <li>
                    <a href="avatars.html">Avatars</a>
                  </li>
                  <li>
                    <a href="badges.html">Badges</a>
                  </li>
                  <li>
                    <a href="buttons.html">Buttons</a>
                  </li>
                  <li>
                    <a href="button-groups.html">Button Groups</a>
                  </li>
                  <li>
                    <a href="cards.html">Cards</a>
                  </li>
                  <li>
                    <a href="advanced-cards.html">Advanced Cards</a>
                  </li>
                  <li>
                    <a href="dropdowns.html">Dropdowns</a>
                  </li>
                  <li>
                    <a href="list-items.html">List Items</a>
                  </li>
                  <li>
                    <a href="progress.html">Progress Bars</a>
                  </li>
                  <li>
                    <a href="placeholders.html">Placeholders</a>
                  </li>
                  <li>
                    <a href="spinners.html">Spinners</a>
                  </li>
                </ul>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-notification-badge-line"></i>
                  <span className="menu-text">Jquery Components</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="accordions.html">Accordions</a>
                  </li>
                  <li>
                    <a href="carousel.html">Carousel</a>
                  </li>
                  <li>
                    <a href="modals.html">Modals</a>
                  </li>
                  <li>
                    <a href="popovers.html">Popovers</a>
                  </li>
                  <li>
                    <a href="tabs.html">Tabs</a>
                  </li>
                  <li>
                    <a href="tooltips.html">Tooltips</a>
                  </li>
                </ul>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-terminal-window-line"></i>
                  <span className="menu-text">Forms</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="form-inputs.html">Form Inputs</a>
                  </li>
                  <li>
                    <a href="form-checkbox-radio.html">Checkbox &amp; Radio</a>
                  </li>
                  <li>
                    <a href="form-file-input.html">File Input</a>
                  </li>
                  <li>
                    <a href="form-validations.html">Validations</a>
                  </li>
                  <li>
                    <a href="date-time-pickers.html">Date Time Pickers</a>
                  </li>
                  <li>
                    <a href="form-masks.html">Input Masks</a>
                  </li>
                  <li>
                    <a href="form-tags.html">Input Tags</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="tables.html">
                  <i className="ri-table-line"></i>
                  <span className="menu-text">Tables</span>
                </a>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-bar-chart-line"></i>
                  <span className="menu-text">Graphs</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="apex.html">Apex Graphs</a>
                  </li>
                  <li>
                    <a href="morris.html">Morris Graphs</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="maps.html">
                  <i className="ri-road-map-line"></i>
                  <span className="menu-text">Vector Maps</span>
                </a>
              </li>
              <li>
                <a href="icons.html">
                  <i className="ri-send-plane-2-line"></i>
                  <span className="menu-text">Icons</span>
                </a>
              </li>
              <li>
                <a href="settings.html">
                  <i className="ri-settings-5-line"></i>
                  <span className="menu-text">Account Settings</span>
                </a>
              </li>
              <li>
                <a href="typography.html">
                  <i className="ri-font-size"></i>
                  <span className="menu-text">Typography</span>
                </a>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-login-circle-line"></i>
                  <span className="menu-text">Login/Signup</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="login.html">Login</a>
                  </li>
                  <li>
                    <a href="signup.html">Signup</a>
                  </li>
                  <li>
                    <a href="forgot-password.html">Forgot Password</a>
                  </li>
                  <li>
                    <a href="reset-password.html">Reset Password</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="page-not-found.html">
                  <i className="ri-alert-line"></i>
                  <span className="menu-text">Page Not Found</span>
                </a>
              </li>
              <li>
                <a href="maintenance.html">
                  <i className="ri-auction-line"></i>
                  <span className="menu-text">Maintenance</span>
                </a>
              </li>
              <li className="treeview">
                <a href="#!">
                  <i className="ri-dropdown-list"></i>
                  <span className="menu-text">Menu Level</span>
                </a>
                <ul className="treeview-menu">
                  <li>
                    <a href="#!">Level One Link</a>
                  </li>
                  <li>
                    <a href="#!">
                      Level One Menu
                      <i className="ri-arrow-right-s-line"></i>
                    </a>
                    <ul className="treeview-menu">
                      <li>
                        <a href="#!">Level Two Link</a>
                      </li>
                      <li>
                        <a href="#!">Level Two Menu
                          <i className="ri-arrow-right-s-line"></i>
                        </a>
                        <ul className="treeview-menu">
                          <li>
                            <a href="#!">Level Three Link</a>
                          </li>
                          <li>
                            <a href="#!">Level Three Link</a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="#!">Level One Link</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="default.html">
                  <i className="ri-send-plane-line"></i>
                  <span className="menu-text">Default Page</span>
                </a>
              </li>
              <li>
                <a href="#!">
                  <i className="ri-exchange-line"></i>
                  <span className="menu-text">Chip</span>
                  <span className="badge bg-primary ms-auto">6</span>
                </a>
              </li>
              <li>
                <a href="#!">
                  <i className="ri-ticket-line"></i>
                  <span className="menu-text">Badge</span>
                  <span className="badge border border-primary text-primary ms-auto">Chip</span>
                </a>
              </li>
              <li>
                <a href="#!" className="disabled">
                  <i className="ri-magic-line"></i>
                  <span className="menu-text">Disabled Link</span>
                </a>
              </li>
            </ul>
          </div>
          {/* <!-- Sidebar menu ends --> */}

          {/* <!-- Sidebar contact starts --> */}
          <div className="sidebar-contact">
            <p className="fw-light mb-1 text-nowrap text-truncate">Emergency Contact</p>
            <h5 className="m-0 lh-1 text-nowrap text-truncate">0987654321</h5>
            <i className="ri-phone-line"></i>
          </div>
          {/* <!-- Sidebar contact ends --> */}

        </nav>
        {/* <!-- Sidebar wrapper ends --> */}

        {/* <!-- App container starts --> */}
        <div className="app-container">

          {/* <!-- App header starts --> */}
          <div className="app-header d-flex align-items-center">

            {/* <!-- Brand container sm starts --> */}
            <div className="brand-container-sm d-xl-none d-flex align-items-center">

              {/* <!-- App brand starts --> */}
              <div className="app-brand">
                <a href="index.html">
                  <img src="src/assets/images/logo.svg" className="logo" alt="Dental Care Admin Template" />
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
              <input type="text" className="form-control" id="searchId" placeholder="Search" />
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
                    <img src="src/assets/images/flags/1x1/fr.svg" className="header-country-flag" alt="Bootstrap Dashboards" />
                  </a>
                  <div className="dropdown-menu dropdown-menu-end dropdown-mini">
                    <div className="country-container">
                      <a href="index.html" className="py-2">
                        <img src="src/assets/images/flags/1x1/us.svg" alt="Admin Panel" />
                      </a>
                      <a href="index.html" className="py-2">
                        <img src="src/assets/images/flags/1x1/in.svg" alt="Admin Panels" />
                      </a>
                      <a href="index.html" className="py-2">
                        <img src="src/assets/images/flags/1x1/br.svg" alt="Admin Dashboards" />
                      </a>
                      <a href="index.html" className="py-2">
                        <img src="src/assets/images/flags/1x1/tr.svg" alt="Admin Templatess" />
                      </a>
                      <a href="index.html" className="py-2">
                        <img src="src/assets/images/flags/1x1/gb.svg" alt="Google Admin" />
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
                                    <img src="src/assets/images/products/1.jpg" className="img-3x rounded-1"
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
                                    <img src="src/assets/images/products/2.jpg" className="img-3x rounded-1"
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
                                    <img src="src/assets/images/products/8.jpg" className="img-3x rounded-1"
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
                                    <img src="src/assets/images/products/9.jpg" className="img-3x rounded-1"
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
                          <img src="src/assets/images/doctor3.png" className="img-3x me-3 rounded-5"
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
                          <img src="src/assets/images/doctor1.png" className="img-3x me-3 rounded-5"
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
                          <img src="src/assets/images/doctor4.png" className="img-3x me-3 rounded-5"
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
                    <img src="src/assets/images/doctor5.png" className="img-2xx rounded-5 border border-3 border-white"
                      alt="Dentist Dashboard" />
                    <span className="status busy"></span>
                  </div>
                </a>
                <div className="dropdown-menu dropdown-menu-end dropdown-300 shadow-lg">
                  <div className="d-flex align-items-center justify-content-between p-3">
                    <div>
                      <span className="small">Doctor</span>
                      <h6 className="m-0">Martin Boyer, MD</h6>
                    </div>
                    <div className="d-flex flex-column text-end">
                      <h5 className="fw-bold lh-1 m-0">$5900</h5>
                      <div className="text-primary small">Weekly Earnings</div>
                    </div>
                  </div>
                  <div className="mx-3 my-2 d-grid">
                    <a href="login.html" className="btn btn-primary">Logout</a>
                  </div>
                </div>
              </div>
              {/* <!-- Header user settings ends --> */}

            </div>
            {/* <!-- App header actions ends --> */}

          </div>
          {/* <!-- App header ends --> */}

          {/* <!-- App hero header starts --> */}
          <div className="app-hero-header d-flex align-items-center">

            {/* <!-- Breadcrumb starts --> */}
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="index.html">
                  <i className="ri-home-3-line"></i>
                </a>
              </li>
              <li className="breadcrumb-item text-primary" aria-current="page">
                Dentist Admin
              </li>
            </ol>
            {/* <!-- Breadcrumb ends --> */}

            {/* <!-- Sales stats starts --> */}
            <div className="ms-auto d-lg-flex d-none flex-row">
              <div className="input-group">
                <span className="input-group-text bg-primary-lighten">
                  <i className="ri-calendar-2-line text-primary"></i>
                </span>
                <input type="text" id="abc" className="form-control custom-daterange" />
              </div>
            </div>
            {/* <!-- Sales stats ends --> */}

          </div>
          {/* <!-- App Hero header ends --> */}

          {/* <!-- App body starts --> */}
          <div className="app-body">

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

          </div>
          {/* <!-- App body ends --> */}

          {/* <!-- App footer starts --> */}
          <div className="app-footer">
            <span>© Dental Care Admin 2025</span>
          </div>
          {/* <!-- App footer ends --> */}

        </div>
        {/* <!-- App container ends --> */}

      </div>
      {/* <!-- Main container ends --> */}

    </div>
    {/* <!-- Page wrapper ends --> */}
    </>
  )
}

export default Home