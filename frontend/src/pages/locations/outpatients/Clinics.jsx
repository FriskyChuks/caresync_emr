import axiosInstance from "../../../api/axiosInstance"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

const Clinics = () => {
    const [clinics, setClinics] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
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
        return (
            <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-r-transparent mx-auto"></div>
                    <p className="mt-3 text-gray-500 text-sm">Loading clinics...</p>
                </div>
            </div>
        )
    }

    const filteredClinics = clinics.filter(clinic =>
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            {/* Beautiful Compact Header */}
            <div className="mb-3">
                <div className="rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white shadow-md">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/20">
                <div className="flex items-center gap-2">
                    {/* Hide full title on mobile, show short version */}
                    <h1 className="text-base font-bold hidden sm:block">Clinics & Out-Patients</h1>
                    <h1 className="text-sm font-bold sm:hidden">OPD</h1>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full hidden sm:inline-block">OPD</span>
                </div>
  
                <div className="flex items-center gap-2">
                    {/* Search - Mobile optimized */}
                    <div className="relative">
                    <input
                        type="text"
                        className="w-28 sm:w-36 pl-7 pr-2 py-1 text-xs border border-white/30 bg-white/10 rounded-md text-white placeholder-white/70 focus:outline-none focus:ring-1 focus:ring-white/50"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-2 top-1.5 text-white/70">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    </div>
                </div>
                </div>
                    
                    {/* Ultra Compact Stats */}
                    <div className="grid grid-cols-4 divide-x divide-white/20 text-center">
                        <div className="py-1.5">
                            <div className="text-[9px] opacity-80 uppercase tracking-wider">Total</div>
                            <div className="text-sm font-bold">{clinics.length}</div>
                        </div>
                        <div className="py-1.5">
                            <div className="text-[9px] opacity-80 uppercase tracking-wider">Patients</div>
                            <div className="text-sm font-bold">
                                {clinics.reduce((sum, clinic) => sum + clinic.patient_count, 0)}
                            </div>
                        </div>
                        <div className="py-1.5">
                            <div className="text-[9px] opacity-80 uppercase tracking-wider">Avg</div>
                            <div className="text-sm font-bold">
                                {Math.round(clinics.reduce((sum, clinic) => sum + clinic.patient_count, 0) / clinics.length) || 0}
                            </div>
                        </div>
                        <div className="py-1.5">
                            <div className="text-[9px] opacity-80 uppercase tracking-wider">Active</div>
                            <div className="text-sm font-bold">
                                {clinics.filter(c => c.patient_count > 0).length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Beautiful Clinics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredClinics.map(clinic => (
                    <Link 
                        key={clinic.id} 
                        to={`/clinic-details/${clinic.id}`}
                        className="group bg-white rounded-xl border border-gray-200 p-3 hover:border-purple-300 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-purple-600 truncate">
                                        {clinic.name}
                                    </h3>
                                    <p className="text-gray-500 text-xs truncate">
                                        {clinic.description || 'Outpatient clinic'}
                                    </p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs font-medium">
                                {clinic.patient_count}
                            </span>
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs">
                                <div className="text-gray-600">
                                    {clinic.male_only ? '👨 Male Only' : clinic.female_only ? '👩 Female Only' : '👥 All Genders'}
                                </div>
                                <svg className="w-3 h-3 text-purple-500 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Clinics