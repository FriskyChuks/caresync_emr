import React from "react";
import dayjs from "dayjs";

const TransferDetailsModal = ({ show, onClose, data, type }) => {
  if (!show || !data) return null;

  const isRejected = type === "rejected";
  const isPending = type === "pending";
  
  // Get patient info based on type
  const getPatientInfo = () => {
    if (isRejected) {
      return {
        name: data?.user_info?.fullname || data?.user_info?.first_name + " " + data?.user_info?.last_name,
        id: data?.id || data?.user_info?.id,
        avatarColor: "from-red-400 to-pink-500"
      };
    } else {
      return {
        name: data?.active_transfer?.patient?.fullname || 
               data?.user_info?.fullname || 
               data?.user_info?.first_name + " " + data?.user_info?.last_name,
        id: data?.active_transfer?.patient?.id || data?.id,
        avatarColor: isPending ? "from-amber-400 to-orange-500" : "from-blue-400 to-indigo-500"
      };
    }
  };

  const patientInfo = getPatientInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Animated Backdrop */}
      <div 
        className={`fixed inset-0 transition-opacity duration-300 ${
          show ? 'opacity-100' : 'opacity-0'
        } ${
          isRejected 
            ? 'bg-gradient-to-br from-red-900/20 via-rose-800/15 to-pink-900/10' 
            : isPending
            ? 'bg-gradient-to-br from-amber-900/20 via-orange-800/15 to-yellow-900/10'
            : 'bg-gradient-to-br from-blue-900/20 via-indigo-800/15 to-purple-900/10'
        } backdrop-blur-sm`}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
        }`}
      >
        {/* Animated Border Effect */}
        <div className={`absolute -inset-1 rounded-2xl opacity-20 blur-lg ${
          isRejected 
            ? 'bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 animate-pulse'
            : isPending
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 animate-pulse'
            : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'
        }`}></div>
        
        <div className="relative bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50">
          {/* Header with Gradient */}
          <div className={`px-6 py-4 bg-gradient-to-r ${
            isRejected 
              ? 'from-red-500 to-pink-600'
              : isPending
              ? 'from-amber-500 to-orange-600'
              : 'from-blue-500 to-indigo-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  {isRejected ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isRejected ? "Transfer Rejected" : isPending ? "Pending Transfer" : "Transfer Details"}
                  </h3>
                  <p className="text-white/80 text-sm">Patient transfer information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors group"
              >
                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Patient Card */}
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${patientInfo.avatarColor} flex items-center justify-center shadow-md`}>
                  <span className="text-white font-bold text-lg">
                    {patientInfo.name?.[0]?.toUpperCase() || "P"}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{patientInfo.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      PID: {patientInfo.id}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      isRejected 
                        ? 'bg-red-100 text-red-700'
                        : isPending
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isRejected ? 'Rejected' : isPending ? 'Pending' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              {isRejected ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Rejected By</label>
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-800">
                          {data.transfer_request_status?.rejected_by || "Unknown"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Ward</label>
                      <div className="p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <span className="font-medium text-gray-800">
                          {data.transfer_request_status?.ward || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Rejection Reason</label>
                    <div className="p-3 bg-gradient-to-r from-red-50/50 to-pink-50/50 rounded-lg border border-red-200">
                      <p className="text-gray-800 font-medium">
                        {data.transfer_request_status?.reason || "No reason provided"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Rejected On</label>
                    <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-gray-800">
                        {data.transfer_request_status?.rejection_date
                          ? dayjs(data.transfer_request_status.rejection_date).format("DD MMM YYYY, HH:mm")
                          : "—"}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Destination</label>
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="font-medium text-gray-800">
                          {data?.active_transfer?.to_ward_name || data?.active_transfer?.to_clinic_name || "—"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Initiated By</label>
                      <div className="p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <span className="font-medium text-gray-800">
                          {data?.active_transfer?.requested_by || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                      <div className={`p-2 rounded-lg ${
                        data.active_transfer?.status === "pending"
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
                          : data.active_transfer?.status === "accepted"
                          ? "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
                          : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            data.active_transfer?.status === "pending" ? "bg-amber-400 animate-pulse" :
                            data.active_transfer?.status === "accepted" ? "bg-emerald-400" : "bg-gray-400"
                          }`}></div>
                          <span className={`font-bold text-sm ${
                            data.active_transfer?.status === "pending" ? "text-amber-700" :
                            data.active_transfer?.status === "accepted" ? "text-emerald-700" : "text-gray-700"
                          }`}>
                            {data.active_transfer?.status?.toUpperCase() || "UNKNOWN"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-gray-800">
                          {data.date_created || data.active_transfer?.date_created
                            ? dayjs(data.date_created || data.active_transfer.date_created).format("DD MMM, HH:mm")
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {(data.active_transfer?.notes || data.active_transfer?.reason) && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
                      <div className="p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg border border-blue-200">
                        <p className="text-gray-800 text-sm">
                          {data.active_transfer?.notes || data.active_transfer?.reason || ""}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
            <button
              type="button"
              onClick={onClose}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md ${
                isRejected 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                  : isPending
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
              }`}
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferDetailsModal;