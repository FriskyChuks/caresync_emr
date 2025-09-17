import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth"

const menuItems = [
  // {
  //   label: "Staff Registration",
  //   icon: "ri-id-card-line ri-user-settings-line",
  //   path: "/staff-registration",
  // },
  {
    label: "Patient Registration",
    icon: "ri-user-add-line text-primary",
    path: "/patient-registration",
  },
  {
    label: "Clinics",
    icon: "ri-hospital-line text-primary",
    path: "/clinics",
  },
  {
    label: "Wards",
    icon: "ri-hotel-bed-line text-primary",
    path: "/wards",
  },
  {
    label: "Appointments",
    icon: "ri-calendar-2-line text-primary",
    path: "/appointment-list",
  },
  {
    label: "Radiology",
    icon: "ri-camera-line text-primary",
    children: [
      { label: "Raise Request", path: "/create-radiology-request" },
      { label: "Create New Test", path: "/create-radiology-request" },
    ],
  },
  {
    label: "Laboratory",
    icon: "ri-flask-line text-primary",
    children: [
      { label: "Request Investigation", path: "/" },
      { label: "Create Lab Test", path: "/create-lab-test" },
    ],
  },
  // {
  //   label: "Departments",
  //   icon: "ri-building-2-line",
  //   children: [
  //     { label: "Departments List", href: "departments-list.html" },
  //     { label: "Add Department", href: "add-department.html" },
  //     { label: "Edit Department", href: "edit-department.html" },
  //   ],
  // },
  // … continue defining others in the same structure
];

const Sidebar = () => {

  const { user } = useAuth();

  return (
    <nav id="sidebar" className="sidebar-wrapper">
      {/* Brand */}
      <div className="brand-container d-flex align-items-center justify-content-between">
        <div className="app-brand ms-3">
          <Link to="/">
            <img
              src="/assets/images/caresync_logo.png"
              className="logo"
              alt="Dental Care Admin Template"
            />
            <strong style={{color:"darkblue"}}>CareSync</strong>
          </Link>
        </div>
        <button type="button" className="pin-sidebar me-3">
          <i className="ri-menu-line"></i>
        </button>
      </div>

      {/* Profile */}
      <div className="sidebar-profile">
        <img
          src="/assets/images/doctor5.png"
          className="rounded-5 border border-primary border-3"
          alt="Dentist Admin Templates"
        />
        <h6 className="mb-1 profile-name text-nowrap text-truncate text-primary">
          {user.first_name} {user.last_name}
        </h6>
        <small className="profile-name text-nowrap text-truncate">
          {user.category}
        </small>
      </div>

      {/* Menu */}
      <div className="sidebarMenuScroll">
        <ul className="sidebar-menu">
          {menuItems.map((item, index) =>
            item.children ? (
              <li className="treeview" key={index}>
                <Link to="#!">
                  <i className={item.icon}></i>
                  <span className="menu-text">{item.label}</span>
                </Link>
                <ul className="treeview-menu">
                  {item.children.map((child, idx) => (
                    <li key={idx}>
                      {child.path ? (
                        <Link to={child.path}>{child.label}</Link>
                      ) : (
                        <a href={child.href}>{child.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={index}>
                {item.path ? (
                  <Link to={item.path}>
                    <i className={item.icon}></i>
                    <span className="menu-text">{item.label}</span>
                  </Link>
                ) : (
                  <Link to={item.href}>
                    <i className={item.icon}></i>
                    <span className="menu-text">{item.label}</span>
                  </Link>
                )}
              </li>
            )
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
