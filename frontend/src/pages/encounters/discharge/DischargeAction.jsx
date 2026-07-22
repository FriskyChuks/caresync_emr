// DischargeAction.jsx - Fixed case sensitivity

import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import useAuth from "../../../hooks/useAuth";
import { useMessage } from "../../../context/MessageProvider";
import DischargeSummaryForm from "./DischargeSummaryForm";
import NurseDischargeModal from "./NurseDischargeModal";

const DischargeAction = ({ visit, onSuccess, compact = false }) => {
  const { user } = useAuth();
  const { showMessage } = useMessage();
  const [discharge, setDischarge] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get user role with case-insensitive handling
  const userRole = user?.user_category?.title?.toLowerCase() || '';
  const isAdmin = userRole === 'admin' || userRole === 'superuser';
  
  // Case-insensitive role checks
  const isDoctor = userRole === 'doctor' || isAdmin;
  const isNurse = userRole === 'nurse' || isAdmin;

  // Determine if this is an inpatient visit (ward)
  const isInpatient = visit.is_inpatient || 
                      (visit.room && visit.room !== "—") || 
                      (visit.bed_number && visit.bed_number !== "—") ||
                      visit.visit_type === 'inpatient';

  // Fetch discharge info → only needed for INPATIENTS
  useEffect(() => {
    if (isInpatient) {
      const fetchDischarge = async () => {
        try {
          const res = await axiosInstance.get(
            `/encounterapi/discharge_details/${visit.id}/`
          );
          setDischarge(res.data);
        } catch (err) {
          if (err.response?.status === 404) {
            setDischarge(null); // no discharge yet
          }
        }
      };
      fetchDischarge();
    }
  }, [visit, isInpatient]);

  /**
   * OUTPATIENTS (clinic visits)
   * → Direct discharge with confirmation modal
   */
  if (!isInpatient) {
    const handleOutpatientDischarge = async () => {
      setLoading(true);
      try {
        await axiosInstance.post(`/encounterapi/discharge/`, {
          visit: visit.id,
        });
        showMessage("Patient discharged from clinic ✅", "success");
        setShowConfirm(false);
        onSuccess?.();
      } catch (err) {
        console.error(err);
        showMessage("Failed to discharge patient ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    if (compact) {
      return (
        <>
          <button
            onClick={() => setShowConfirm(true)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Discharge from clinic"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
              <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Discharge Patient</h3>
                      <p className="text-sm text-gray-600">From clinic visit</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-4">
                    Are you sure you want to <strong className="text-red-600">discharge</strong> this patient from the clinic? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleOutpatientDischarge}
                      disabled={loading}
                      className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Discharging...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Discharge
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <button
          onClick={() => setShowConfirm(true)}
          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          title="Discharge Patient from clinic"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Discharge
        </button>

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Confirm Patient Discharge</h3>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="text-white/80 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to <strong className="text-red-600">discharge</strong> this patient from the clinic? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOutpatientDischarge}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Discharging...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Discharge Patient
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /**
   * INPATIENTS (ward visits)
   * → Doctor fills summary, nurse discharges with reason.
   */
  // Doctor's flow
  if (isDoctor) {
    if (!discharge) {
      if (compact) {
        return (
          <>
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
              title="Fill discharge summary"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            {showConfirm && (
              <DischargeSummaryForm
                visitId={visit.id}
                onSuccess={onSuccess}
                onClose={() => setShowConfirm(false)}
                compact={compact}
              />
            )}
          </>
        );
      }

      return (
        <>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            title="Fill Discharge Summary"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Fill Summary
          </button>

          {showConfirm && (
            <DischargeSummaryForm
              visitId={visit.id}
              onSuccess={onSuccess}
              onClose={() => setShowConfirm(false)}
            />
          )}
        </>
      );
    }

    // Doctor - Summary already filled
    if (compact) {
      return (
        <span className="p-1.5 text-green-500 cursor-default" title="Discharge summary filled">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      );
    }

    return (
      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Summary filled
      </span>
    );
  }

  // Nurse's flow
  if (isNurse) {
    if (discharge && !discharge.reason) {
      if (compact) {
        return (
          <>
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Discharge patient"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

            {showConfirm && (
              <NurseDischargeModal
                discharge={discharge}
                onSuccess={onSuccess}
                onClose={() => setShowConfirm(false)}
                compact={compact}
              />
            )}
          </>
        );
      }

      return (
        <>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            title="Discharge Patient"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Discharge
          </button>

          {showConfirm && (
            <NurseDischargeModal
              discharge={discharge}
              onSuccess={onSuccess}
              onClose={() => setShowConfirm(false)}
            />
          )}
        </>
      );
    }

    if (discharge?.reason) {
      if (compact) {
        return (
          <span className="p-1.5 text-green-500 cursor-default" title="Patient discharged">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        );
      }

      return (
        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Discharged
        </span>
      );
    }

    // Nurse - No summary yet
    if (compact) {
      return (
        <span className="p-1.5 text-amber-500 cursor-help" title="No discharge summary yet - consult doctor">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      );
    }

    return (
      <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Awaiting summary
      </span>
    );
  }

  return null;
};

export default DischargeAction;