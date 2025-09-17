import { Link } from "react-router-dom"

const BottomNav = () => {
  return (
    <>
    {/* <!-- App hero header starts --> */}
          <div className="app-hero-header d-flex align-items-center">

            {/* <!-- Breadcrumb starts --> */}
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/dashboard">
                  <i className="ri-home-3-line"></i>
                </Link>
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
    </>
  )
}

export default BottomNav