// AntenatalComplaints.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AntenatalLayout from "./AntenatalLayout";
import PatientNotes from "../patients/folderComponents/PatientNotes";

const AntenatalComplaints = () => {
  const { pid } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pid) return;
    Promise.all([
      axiosInstance.get(`/patientsapi/patient_detail/${pid}/`),
    ]).then(([p ]) => { setPatient(p.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, [pid]);

  if (loading) return (
    <AntenatalLayout>
      <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 border-4 border-orange-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-orange-600 font-medium">Loading complaint records…</p>
      </div>
    </AntenatalLayout>
  );

  return (
    <AntenatalLayout>
      <div className="space-y-4 p-2 m-2">
        {patient && (
          <div className="mt-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{patient.user_info?.fullname || `${patient.first_name} ${patient.last_name}`}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>PID: {patient.id}</span>
                      <span>•</span>
                      <span>{patient.phone}</span>
                    </div>
                  </div>
                </div>
                {/* <div className="text-xs text-gray-500">Requesting lab tests</div> */}
              </div>
            </div>
            
          </div>
        )}
      </div>
      <PatientNotes
        patientId={pid}
        // refreshTrigger={refreshNotes}
        showFilters={true}
        maxHeight="600px"
      />

    </AntenatalLayout>
  );
};

export default AntenatalComplaints;