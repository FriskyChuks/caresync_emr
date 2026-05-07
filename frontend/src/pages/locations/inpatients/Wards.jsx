import axiosInstance from "../../../api/axiosInstance"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

const Wards = () => {
    const [wards, setWards] = useState([])
    const [loading, setLoading] = useState(true)    
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'

    useEffect(() => {
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

    const filteredWards = wards.filter(ward => 
        ward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ward.description && ward.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center space-y-2">
                    <div className="relative inline-block">
                        <div className="h-8 w-8 rounded-full border-3 border-blue-200"></div>
                        <div className="absolute top-0 left-0 h-8 w-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Loading wards...</p>
                </div>
            </div>
        )
    } 

    return (
        <div className="space-y-4">
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
  <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  </div>
  <div className="min-w-0 flex-1">
    {/* Responsive title - changes based on screen size */}
    <h1 className="text-base sm:text-lg font-bold text-white truncate">
      <span className="hidden xs:inline">Hospital Wards</span>
      <span className="xs:hidden">Wards</span>
    </h1>
    <p className="text-blue-100 text-xs mt-0.5">
      <span className="hidden xs:inline">{wards.length} wards • Manage assignments</span>
      <span className="xs:hidden">{wards.length} wards</span>
    </p>
  </div>
</div>
                    
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-md transition-colors ${
                                viewMode === "grid" 
                                    ? "bg-white text-blue-600 shadow-sm" 
                                    : "text-white hover:bg-white/30"
                            }`}
                            title="Grid view"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-md transition-colors ${
                                viewMode === "list" 
                                    ? "bg-white text-blue-600 shadow-sm" 
                                    : "text-white hover:bg-white/30"
                            }`}
                            title="List view"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <input
                    type="text"
                    className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search wards by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Wards Display */}
            {filteredWards.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <p className="text-base font-medium text-gray-700 mb-1">No wards found</p>
                    {searchTerm && (
                        <p className="text-sm text-gray-500">No results for "{searchTerm}"</p>
                    )}
                </div>
            ) : viewMode === "grid" ? (
                /* Compact Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredWards.map(ward => (
                        <Link 
                            key={ward.id} 
                            to={`/ward-details/${ward.id}`}
                            className="group bg-white rounded-xl border border-gray-200 p-3 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 truncate">
                                        {ward.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 truncate">
                                        {ward.room_count || 0} rooms • {ward.bed_count || 0} beds
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-xs text-gray-600 line-clamp-2 min-h-[32px] mb-2">
                                {ward.description || 'Hospital ward facility'}
                            </p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-gray-500">Patients:</span>
                                    <span className="text-sm font-bold text-blue-600">{ward.patient_count || 0}</span>
                                </div>
                                <span className="text-xs text-blue-600 group-hover:underline">View details →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                /* Compact List View */
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {filteredWards.map(ward => (
                            <Link 
                                key={ward.id} 
                                to={`/ward-details/${ward.id}`}
                                className="flex items-center justify-between p-3 hover:bg-blue-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 text-sm truncate">{ward.name}</h3>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {ward.room_count || 0} rooms
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate max-w-md">
                                            {ward.description || 'Hospital ward'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 ml-4">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">Patients</div>
                                        <div className="text-sm font-bold text-blue-600">{ward.patient_count || 0}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">Beds</div>
                                        <div className="text-sm font-bold text-gray-700">{ward.bed_count || '—'}</div>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Wards