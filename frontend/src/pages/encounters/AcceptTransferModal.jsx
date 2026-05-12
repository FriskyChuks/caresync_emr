import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const AcceptTransferModal = ({ show, onClose, transfer, onSuccess }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBed, setSelectedBed] = useState("");
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (show) {
      setTimeout(() => setAnimateIn(true), 10);
    } else {
      setAnimateIn(false);
    }
  }, [show]);

  useEffect(() => {
    if (transfer && show) {
      const fetchRooms = async () => {
        try {
          setLoading(true);
          const res = await axiosInstance.get(
            `/locationsapi/wards/${transfer.to_ward_id}/rooms/`
          );
          setRooms(res.data || []);
        } catch (err) {
          console.error("Error fetching rooms:", err);
          setRooms([]);
        } finally {
          setLoading(false);
        }
      };
      fetchRooms();
    }
  }, [transfer, show]);

  useEffect(() => {
    if (!selectedRoom) {
      setAvailableBeds([]);
      setSelectedBed("");
      return;
    }
    const room = rooms.find((r) => r.id === Number(selectedRoom));
    if (room) setAvailableBeds(room.available_beds || []);
    else setAvailableBeds([]);
    setSelectedBed("");
  }, [selectedRoom, rooms]);

  const handleAccept = async () => {
    if (!selectedRoom || !selectedBed) {
      alert("Please select both room and bed before accepting transfer.");
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post(`/encounterapi/accept-transfer/`, {
        transfer_request_id: transfer.id,
        room_id: selectedRoom,
        bed_number: selectedBed,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error accepting transfer:", err);
      alert(err.response?.data?.error || "Failed to accept transfer. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !transfer) return null;

  const patientName = transfer.patient.fullname || transfer.patient.user_info?.fullname;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Gradient Backdrop */}
      <div 
        className={`fixed inset-0 bg-gradient-to-br from-emerald-900/20 via-green-800/15 to-teal-900/10 backdrop-blur-sm transition-opacity duration-300 ${
          animateIn ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          animateIn 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-10 opacity-0 scale-95'
        }`}
      >
        {/* Animated Border Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl opacity-20 blur-lg animate-pulse"></div>
        
        <div className="relative bg-gradient-to-b from-white to-emerald-50 rounded-2xl shadow-2xl overflow-hidden border border-emerald-100/50">
          {/* Header with Gradient */}
          <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-green-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Accept Transfer</h3>
                  <p className="text-emerald-100 text-sm">Assign room & bed to patient</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
              >
                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Patient Info Card */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {patientName?.[0]?.toUpperCase() || "P"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 truncate">{patientName}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      PID: {transfer.patient.patient_number || transfer.patient.id}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                      Incoming
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Details */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">From Location</label>
                  <div className="p-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <span className="font-medium text-gray-800">
                      {transfer.from_location_name || "Unknown"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Requested</label>
                  <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-gray-800 text-sm">
                      {new Date(transfer.date_created).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Room and Bed Selection */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Assign Accommodation
              </h4>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-emerald-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-emerald-600 font-medium">Loading available rooms...</p>
                  <p className="text-sm text-gray-500 mt-1">Fetching ward accommodation data</p>
                </div>
              ) : (
                <>
                  {/* Room Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Select Room
                      {selectedRoom && (
                        <span className="text-xs font-normal text-emerald-600 ml-2">
                          {availableBeds.length} bed{availableBeds.length !== 1 ? 's' : ''} available
                        </span>
                      )}
                    </label>
                    <div className="relative group">
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700 font-medium appearance-none shadow-sm hover:border-emerald-300 transition-all duration-200 cursor-pointer"
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                      >
                        <option value="" className="text-gray-400">Choose a room</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id} className="py-2">
                            {room.name}
                            {room.available_beds && (
                              <span className="text-gray-500 text-sm ml-2">
                                • {room.available_beds.length} bed{room.available_beds.length !== 1 ? 's' : ''} available
                              </span>
                            )}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Bed Selection */}
                  {selectedRoom && (
                    <div className="space-y-2 animate-fadeIn">
                      <label className="block text-sm font-semibold text-gray-700">Select Bed</label>
                      <div className="relative group">
                        <select
                          className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-700 font-medium appearance-none shadow-sm hover:border-emerald-300 transition-all duration-200 cursor-pointer"
                          value={selectedBed}
                          onChange={(e) => setSelectedBed(e.target.value)}
                        >
                          <option value="" className="text-gray-400">Choose a bed</option>
                          {availableBeds.map((bedNumber) => (
                            <option key={bedNumber} value={bedNumber} className="py-2">
                              Bed {bedNumber}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Bed Preview */}
                      {selectedBed && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-100 rounded-lg">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-emerald-800">Ready to assign</p>
                              <p className="text-sm text-emerald-600">
                                {patientName} will be assigned to Bed {selectedBed}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50/50">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all duration-200 hover:shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={submitting || loading || !selectedRoom || !selectedBed}
                className="group relative flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg overflow-hidden"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Accept Transfer
                    </>
                  )}
                </span>
                {!submitting && selectedRoom && selectedBed && (
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptTransferModal;