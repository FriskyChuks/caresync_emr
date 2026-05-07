// AntenatalDashboard.jsx
// Shows only the ACTIVE booking (is_active=true). When none exists, offers fresh registration.
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AntenatalLayout from './AntenatalLayout';

const safeFetch = async (url) => {
  try {
    const res = await axiosInstance.get(url);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};

const Val = ({ v, fallback = '—' }) => (
  <span className="font-semibold text-gray-800">
    {v !== undefined && v !== null && v !== '' ? String(v) : fallback}
  </span>
);

const BoolVal = ({ v }) => (
  <span className={`font-semibold ${v ? 'text-red-600' : 'text-green-600'}`}>
    {v ? 'Yes' : 'No'}
  </span>
);

const SectionCard = ({ title, colorClass, iconPath, children }) => (
  <div className={`group bg-gradient-to-br from-white ${colorClass.bg} border ${colorClass.border} rounded-xl p-3 hover:shadow-lg transition-all duration-300`}>
    <div className="flex items-center justify-between mb-2">
      <div className={`text-xs font-semibold ${colorClass.text}`}>{title}</div>
      <div className={`p-2 ${colorClass.iconBg} ${colorClass.text} rounded-lg group-hover:scale-110 transition-transform`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
        </svg>
      </div>
    </div>
    <div className={`pt-2 border-t ${colorClass.border} text-xs ${colorClass.text} space-y-1`}>
      {children}
    </div>
  </div>
);

const DataRow = ({ label, children, dotColor }) => (
  <div className="flex items-start gap-1.5">
    <div className={`w-1.5 h-1.5 ${dotColor} rounded-full shrink-0 mt-1`} />
    <span className="text-gray-500 shrink-0">{label}:</span>
    <span className="ml-auto text-right">{children}</span>
  </div>
);

const NotRegistered = ({ colorText }) => (
  <p className={`text-xs italic ${colorText} opacity-60`}>Not yet registered</p>
);

/* ─── Main ─── */
const AntenatalDashboard = () => {
  const { pid } = useParams();
  const [loading, setLoading]           = useState(true);
  const [lastUpdated, setLastUpdated]   = useState('');
  const [patient, setPatient]           = useState(null);

  // Active booking data
  const [activeObstetric, setActiveObstetric]   = useState(null);
  const [menstrual, setMenstrual]               = useState(null);
  const [medical, setMedical]                   = useState(null);
  const [currentPregnancy, setCurrentPregnancy] = useState(null);
  const [ancVitals, setAncVitals]               = useState([]);

  // Counts for the summary strip
  const [totalBookings, setTotalBookings]       = useState(0);

  const cleanPid = parseInt(pid);

  useEffect(() => {
    const updateTime = () =>
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        patientRes,
        obstetricRes,
        menstrualRes,
        medicalRes,
        currentPregnancyRes,
        ancVitalsRes,
      ] = await Promise.all([
        axiosInstance.get(`/patientsapi/patient_detail/${cleanPid}`),
        safeFetch(`/anc_specialtyapi/obstetric-history/?patient=${cleanPid}`),
        safeFetch(`/anc_specialtyapi/menstrual-history/?patient=${cleanPid}`),
        safeFetch(`/anc_specialtyapi/medical-history/?patient=${cleanPid}`),
        safeFetch(`/anc_specialtyapi/current-pregnancy/?patient=${cleanPid}`),
        safeFetch(`/anc_specialtyapi/antenatal-vitals/?patient=${cleanPid}`),
      ]);

      setPatient(patientRes.data);

      // Obstetric — find the single active one
      const allObs = Array.isArray(obstetricRes)
        ? obstetricRes
        : obstetricRes
        ? [obstetricRes]
        : [];
      setTotalBookings(allObs.length);

      const active = allObs.find((o) => o.is_active === true) ?? null;
      setActiveObstetric(active);

      // For menstrual/medical/pregnancy we want the record linked to the
      // active booking. Because these are filtered by patient and the API
      // may return multiple (one per pregnancy), we simply take the most
      // recent one (last in list). Future improvement: link them by booking FK.
      const last = (d) => {
        if (!d) return null;
        if (Array.isArray(d)) return d.length > 0 ? d[d.length - 1] : null;
        return d;
      };

      setMenstrual(last(menstrualRes));
      setMedical(last(medicalRes));
      setCurrentPregnancy(last(currentPregnancyRes));
      setAncVitals(
        Array.isArray(ancVitalsRes) ? ancVitalsRes : ancVitalsRes ? [ancVitalsRes] : []
      );
    } catch (err) {
      console.error('Error fetching antenatal dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pid) fetchData();
  }, [pid]);

  if (loading) {
    return (
      <AntenatalLayout>
        <div className="min-h-[300px] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-blue-100 rounded-full" />
            <div className="absolute top-0 left-0 w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="mt-4 text-blue-600 font-medium">Loading Antenatal dashboard...</p>
          <p className="text-sm text-gray-500 mt-1">Fetching latest records</p>
        </div>
      </AntenatalLayout>
    );
  }

  const latestVital    = ancVitals[ancVitals.length - 1] ?? null;
  const hasActiveBooking = !!activeObstetric;
  const closedCount    = totalBookings - (hasActiveBooking ? 1 : 0);

  return (
    <AntenatalLayout>
      <div className="space-y-4 p-2">

        {/* Patient banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  {patient?.user_info?.fullname || `${patient?.first_name} ${patient?.last_name}`}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>PID: {patient?.id}</span>
                  <span>•</span>
                  <span>{patient?.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveBooking && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full animate-pulse">
                  ● Active Pregnancy
                </span>
              )}
              <span className="text-xs text-gray-400">Updated: {lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Summary strip — only shown if patient has at least one booking */}
        {totalBookings > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total Bookings', value: totalBookings,                color: 'slate' },
              { label: 'Active',         value: hasActiveBooking ? 1 : 0,     color: hasActiveBooking ? 'green' : 'gray' },
              { label: 'Closed',         value: closedCount,                  color: 'amber' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm text-center">
                <div className="text-xs text-gray-400 mb-1">{s.label}</div>
                <div className={`text-lg font-bold ${
                  s.color === 'green' ? 'text-green-600' :
                  s.color === 'amber' ? 'text-amber-600' :
                  s.color === 'slate' ? 'text-slate-700' : 'text-gray-400'
                }`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Latest ANC vitals snapshot */}
        {latestVital && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'BP',    value: latestVital.blood_pressure,   unit: '' },
              { label: 'Pulse', value: latestVital.pulse,            unit: ' bpm' },
              { label: 'Temp',  value: latestVital.temperature,      unit: ' °C' },
              { label: 'FHR',   value: latestVital.fetal_heart_rate, unit: ' bpm' },
            ].map((c) => (
              <div key={c.label} className="bg-white border border-pink-100 rounded-xl p-2.5 text-center shadow-sm">
                <p className="text-xs text-gray-400 mb-0.5">{c.label}</p>
                <p className="text-sm font-bold text-pink-700">
                  {c.value ?? '—'}{c.value ? c.unit : ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* No active booking notice */}
        {!hasActiveBooking && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">No active pregnancy booking</p>
              <p className="text-xs text-amber-600 mt-0.5">
                {totalBookings > 0
                  ? 'All previous pregnancies have been delivered and closed. Register a new booking below.'
                  : 'This patient has not been registered for antenatal care yet.'}
              </p>
            </div>
          </div>
        )}

        {/*
          ── Register New Booking CTA ──
          Only shown when there is NO active booking.
          When a booking IS active, the link is intentionally removed
          so staff cannot accidentally start a duplicate booking.
        */}
        {!hasActiveBooking && (
          <Link
            to={`/antenatal-bookings/${pid}`}
            className="flex items-center justify-between w-full px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Register New Antenatal Booking</p>
                <p className="text-blue-100 text-xs">
                  Start a new pregnancy registration for this patient
                </p>
              </div>
            </div>
            <svg className="w-5 h-5 text-white opacity-70 group-hover:translate-x-1 transition-transform"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Active booking summary */}
        {hasActiveBooking ? (
          <>
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Current Active Booking Summary
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">

              {/* Obstetric History */}
              <SectionCard
                title="Obstetric History"
                colorClass={{ bg: 'to-blue-50', border: 'border-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-100' }}
                iconPath="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              >
                <DataRow label="Gravida"         dotColor="bg-blue-400"><Val v={activeObstetric.gravida} /></DataRow>
                <DataRow label="Para"            dotColor="bg-blue-400"><Val v={activeObstetric.para} /></DataRow>
                <DataRow label="Abortions"       dotColor="bg-blue-400"><Val v={activeObstetric.abortions} /></DataRow>
                <DataRow label="Living Children" dotColor="bg-blue-400"><Val v={activeObstetric.living_children} /></DataRow>
                <DataRow label="C-Section"       dotColor="bg-blue-400"><BoolVal v={activeObstetric.previous_c_section} /></DataRow>
                <DataRow label="Stillbirth"      dotColor="bg-blue-400"><BoolVal v={activeObstetric.previous_stillbirth} /></DataRow>
                <DataRow label="Neonatal Death"  dotColor="bg-blue-400"><BoolVal v={activeObstetric.previous_neonatal_death} /></DataRow>
                {activeObstetric.pregnancy_complications && (
                  <DataRow label="Complications" dotColor="bg-blue-400">
                    <Val v={activeObstetric.pregnancy_complications} />
                  </DataRow>
                )}
              </SectionCard>

              {/* Menstrual History */}
              <SectionCard
                title="Menstrual History"
                colorClass={{ bg: 'to-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-100' }}
                iconPath="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              >
                {menstrual ? (
                  <>
                    <DataRow label="LMP"           dotColor="bg-emerald-400"><Val v={menstrual.last_menstrual_period} /></DataRow>
                    <DataRow label="EDD"           dotColor="bg-emerald-400"><Val v={menstrual.estimated_due_date} /></DataRow>
                    <DataRow label="Cycle Regular" dotColor="bg-emerald-400"><BoolVal v={menstrual.cycle_regular} /></DataRow>
                    <DataRow label="Cycle Length"  dotColor="bg-emerald-400">
                      {menstrual.cycle_length
                        ? <Val v={`${menstrual.cycle_length} days`} />
                        : <Val v={null} />}
                    </DataRow>
                    {menstrual.contraceptive_history && (
                      <DataRow label="Contraception" dotColor="bg-emerald-400">
                        <Val v={menstrual.contraceptive_history} />
                      </DataRow>
                    )}
                  </>
                ) : <NotRegistered colorText="text-emerald-500" />}
              </SectionCard>

              {/* Medical History */}
              <SectionCard
                title="Medical & Family History"
                colorClass={{ bg: 'to-amber-50', border: 'border-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-100' }}
                iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              >
                {medical ? (
                  <>
                    <DataRow label="Hypertension"  dotColor="bg-amber-400"><BoolVal v={medical.hypertension} /></DataRow>
                    <DataRow label="Diabetes"      dotColor="bg-amber-400"><BoolVal v={medical.diabetes} /></DataRow>
                    <DataRow label="Asthma"        dotColor="bg-amber-400"><BoolVal v={medical.asthma} /></DataRow>
                    <DataRow label="Heart Disease" dotColor="bg-amber-400"><BoolVal v={medical.heart_disease} /></DataRow>
                    {medical.allergies && (
                      <DataRow label="Allergies"   dotColor="bg-amber-400"><Val v={medical.allergies} /></DataRow>
                    )}
                    {medical.other_medical_conditions && (
                      <DataRow label="Other"       dotColor="bg-amber-400"><Val v={medical.other_medical_conditions} /></DataRow>
                    )}
                  </>
                ) : <NotRegistered colorText="text-amber-500" />}
              </SectionCard>

              {/* Current Pregnancy */}
              <SectionCard
                title="Current Pregnancy"
                colorClass={{ bg: 'to-red-50', border: 'border-red-100', text: 'text-red-600', iconBg: 'bg-red-100' }}
                iconPath="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              >
                {currentPregnancy ? (
                  <>
                    <DataRow label="Gestational Age" dotColor="bg-red-400">
                      {currentPregnancy.gestational_age_weeks != null
                        ? <Val v={`${currentPregnancy.gestational_age_weeks} wks`} />
                        : <Val v={null} />}
                    </DataRow>
                    <DataRow label="No. of Fetuses"  dotColor="bg-red-400"><Val v={currentPregnancy.number_of_fetuses} /></DataRow>
                    <DataRow label="Smoking"         dotColor="bg-red-400"><BoolVal v={currentPregnancy.smoking} /></DataRow>
                    <DataRow label="Alcohol"         dotColor="bg-red-400"><BoolVal v={currentPregnancy.alcohol} /></DataRow>
                    {currentPregnancy.presenting_complaints && (
                      <DataRow label="Complaints"    dotColor="bg-red-400"><Val v={currentPregnancy.presenting_complaints} /></DataRow>
                    )}
                    {currentPregnancy.medications && (
                      <DataRow label="Medications"   dotColor="bg-red-400"><Val v={currentPregnancy.medications} /></DataRow>
                    )}
                  </>
                ) : <NotRegistered colorText="text-red-500" />}
              </SectionCard>

            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2 opacity-40 pointer-events-none select-none">
            {['Obstetric History', 'Menstrual History', 'Medical & Family', 'Current Pregnancy'].map((t) => (
              <div key={t} className="bg-gray-50 border border-gray-100 rounded-xl p-3 h-28 flex items-center justify-center">
                <p className="text-xs text-gray-400 italic">{t} — Not registered</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AntenatalLayout>
  );
};

export default AntenatalDashboard;