import axiosInstance from "../../../api/axiosInstance"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

const Clinics = () => {
    const navigate = useNavigate()
    const [clinics, setClinics] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch clinics data from the backend API
        axiosInstance.get('/locationsapi/clinics/')
            .then(response => {
                setClinics(response.data)
                setLoading(false)
            })
            .catch(error => {
                console.error("There was an error fetching the clinics data!", error)
                setLoading(false)
            })  
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

  return (
    <>
    <div className="row gx-4">
        <div className="col-sm-12">
        <div className="card mb-4">
            
            <div className="card-body">

            <h5 className="text-center my-4">
                <span><i class="ri-hospital-line text-primary"></i>  </span>
                Clinics/Out-Patients
            </h5>

            <div className="mt-4">
                {/* <!-- Row starts --> */}
                <div className="row g-2 justify-content-center">
                {clinics.map(clinic => (
                    <div key={clinic.id} className="col-xl-3 col-sm-6 col-12">
                    <Link to={`/clinic-details/${clinic.id}`} className="d-flex align-items-center gap-3 appointment-card">    
                    {/* <img src="assets/images/clinic.png" className="img-3x rounded-5" alt="Dentistry Dashboard" /> */}
                    <div className="d-flex flex-column flex-fill" >
                        <div className="fw-semibold text-truncate">{clinic.name}</div>  
                        <div className="text-muted small">{clinic.description}</div>
                    </div>
                    <span className="badge bg-primary">8</span>
                    </Link>
                    </div>
                ))}
                </div>
                {/* /* <!-- Row ends -->   */}
            </div>

            </div>
        </div>
        </div>
    </div>
    </>
  )
}

export default Clinics