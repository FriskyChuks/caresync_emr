// AntenatalUltrasound.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";
import ReusableModal from "../../components/common/ReusableModal";
import AntenatalLayout from "./AntenatalLayout";
import PatientRadiology from "../patients/folderComponents/PatientRadiology"


const AntenatalUltrasound = () => {
  const { pid } = useParams();
  const [patient, setPatient]       = useState(null);
  const [loading, setLoading]       = useState(true);

  const [form, setForm] = useState({
    scan_date: "",
    gestational_age: "",
    fetal_heartbeat: true,
    number_of_fetuses: 1,
    placenta_position: "",
    amniotic_fluid: "",
    fetal_weight_estimate: "",
    findings: "",
    scan_image: null,
  });
  const cleanPid = parseInt(pid);
  /* Fetch data */
  useEffect(() => {
    if (!pid) return;
    Promise.all([
      axiosInstance.get(`/patientsapi/patient_detail/${cleanPid}`),
    ]).then(([pRes]) => {
      setPatient(pRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [pid]);

  if (loading) return (
    <AntenatalLayout>
      <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 border-4 border-purple-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-purple-600 font-medium">Loading ultrasound records…</p>
      </div>
    </AntenatalLayout>
  );

  if (!patient) return null;

  return (
    <AntenatalLayout>
      <div className="space-y-4 p-2">

        {/* Patient banner */}
        <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-lg border border-purple-200 p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">
                {patient.user_info?.fullname || `${patient.first_name} ${patient.last_name}`}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>PID: {patient.id}</span><span>•</span><span>{patient.phone}</span>
              </div>
            </div>
          </div>
        </div>
        <PatientRadiology patient={patient} />
      </div>
      
    </AntenatalLayout>
  );
};

export default AntenatalUltrasound;