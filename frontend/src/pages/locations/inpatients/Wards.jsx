import axiosInstance from "../../../api/axiosInstance"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

const Wards = () => {
    const navigate = useNavigate()
    const [wards, setWards] = useState([])
    const [loading, setLoading] = useState(true)    

    useEffect(() => {
        // Fetch wards data from the backend API
        axiosInstance.get('/locationsapi/wards/')   
            .then(response => {
                setWards(response.data)
                setLoading(false)
            })
            .catch(error => {
                console.error("There was an error fetching the wards data!", error)
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
                <span><i class="ri-hotel-bed-line text-primary"></i> </span>
                Wards/In-Patients
            </h5>

            <div className="mt-4">
                {/* <!-- Row starts --> */}
                <div className="row g-2 justify-content-center">
                {wards.map(ward => (
                    <div key={ward.id} className="col-xl-3 col-sm-6 col-12">
                    <Link to={`/ward-details/${ward.id}`} className="d-flex align-items-center gap-3 appointment-card">    
                    {/* <img src="assets/images/ward.png" className="img-3x rounded-5" alt="Dentistry Dashboard" /> */}
                    <div className="d-flex flex-column flex-fill" >
                        <div className="fw-semibold text-truncate">{ward.name}</div>  
                        <div className="text-muted small">{ward.description}</div>
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

export default Wards