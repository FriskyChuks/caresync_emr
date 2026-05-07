// AntenatalVitalsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";
import ReusableModal from "../../components/common/ReusableModal";
import useAuth from "../../hooks/useAuth";
import AntenatalLayout from "./AntenatalLayout";

/* ─── Helpers ─── */
const calcBMI = (weight, height) => {
  if (!weight || !height) return null;
  const h = parseFloat(height) / 100;
  const bmi = parseFloat(weight) / (h * h);
  return isNaN(bmi) ? null : bmi.toFixed(1);
};

const getBMILabel = (bmi) => {
  if (!bmi) return null;
  const v = parseFloat(bmi);
  if (v < 18.5) return { label: "Underweight", color: "bg-blue-100 text-blue-700" };
  if (v < 25)   return { label: "Normal",      color: "bg-green-100 text-green-700" };
  if (v < 30)   return { label: "Overweight",  color: "bg-yellow-100 text-yellow-700" };
  return             { label: "Obese",         color: "bg-red-100 text-red-700" };
};

const getBPStatus = (bp) => {
  if (!bp) return "";
  const [sys] = bp.split("/").map(Number);
  if (sys < 90)  return "bg-blue-100 text-blue-700";
  if (sys < 120) return "bg-green-100 text-green-700";
  if (sys < 140) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const getTempStatus = (t) => {
  if (!t) return "";
  const v = parseFloat(t);
  if (v < 36)    return "bg-blue-100 text-blue-700";
  if (v <= 37.5) return "bg-green-100 text-green-700";
  if (v <= 38.5) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const getPulseStatus = (p) => {
  if (!p) return "";
  const v = parseInt(p);
  if (v < 60)   return "bg-blue-100 text-blue-700";
  if (v <= 100) return "bg-green-100 text-green-700";
  if (v <= 120) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const getFHRStatus = (fhr) => {
  if (!fhr) return "";
  const v = parseInt(fhr);
  if (v < 110 || v > 160) return "bg-red-100 text-red-700";
  return "bg-green-100 text-green-700";
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-800">
        {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
      </span>
      <span className="text-xs text-gray-400">
        {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
};

/* ─── Field component ─── */
const Field = ({ label, name, value, onChange, type = "text", placeholder, unit, required, min, max, step, readOnly, highlight }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      {unit && <span className="text-gray-400 font-normal ml-1">({unit})</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        readOnly={readOnly}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all ${
          readOnly
            ? "bg-pink-50 border-pink-200 text-pink-700 font-semibold cursor-not-allowed"
            : highlight
            ? "border-pink-200 bg-pink-50/30"
            : "border-gray-200 bg-white"
        }`}
      />
      {readOnly && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-pink-500 font-medium">Auto</span>
      )}
    </div>
  </div>
);

/* ─── Toggle ─── */
const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-pink-500" : "bg-gray-300"}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : ""}`} />
    </div>
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

/* ─── Stat card ─── */
const StatCard = ({ label, value, unit, statusClass }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    {value ? (
      <span className={`inline-block px-2 py-0.5 text-sm font-bold rounded-full ${statusClass}`}>
        {value}{unit}
      </span>
    ) : (
      <span className="text-sm font-bold text-gray-300">—</span>
    )}
  </div>
);

/* ─── Main Component ─── */
const AntenatalVitals = () => {
  const { pid } = useParams();
  const { showMessage } = useMessage();
  const { user } = useAuth();

  const [patient, setPatient]       = useState(null);
  const [records, setRecords]       = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal]   = useState(false);

  const emptyForm = {
    blood_pressure: "",
    pulse: "",
    temperature: "",
    weight: "",
    height: "",
    bmi: "",
    fundal_height: "",
    fetal_heart_rate: "",
    edema: false,
  };
  const [form, setForm] = useState(emptyForm);

  /* auto-calc BMI */
  useEffect(() => {
    const bmi = calcBMI(form.weight, form.height);
    setForm((p) => ({ ...p, bmi: bmi ?? "" }));
  }, [form.weight, form.height]);
  
  const VITALS_LIST_URL   = `/anc_specialtyapi/antenatal-vitals/?patient=${pid}`;
  const VITALS_CREATE_URL = `/anc_specialtyapi/antenatal-vitals/`;

  const fetchPatient = () =>
    axiosInstance.get(`/patientsapi/patient_detail/${pid}/`).then((r) => setPatient(r.data));

  const fetchRecords = () =>
    axiosInstance
      .get(VITALS_LIST_URL)
      .then((r) => {
        // Handle both list response and paginated response
        const data = Array.isArray(r.data) ? r.data : r.data.results ?? [];
        setRecords(data);
        // console.log(data);
      })
      .catch((err) => {
        // FIX: if the list endpoint returns 404, treat as empty rather than crashing
        if (err.response?.status === 404) {
          setRecords([]);
        } else {
          console.error("Failed to fetch vitals:", err);
        }
      });

  useEffect(() => {
    if (!pid) return;
    Promise.all([fetchPatient(), fetchRecords()])
      .catch((e) => console.error(e))
      .finally(() => setPageLoading(false));
  }, [pid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    if (!form.blood_pressure || !form.pulse || !form.temperature || !form.weight) {
      showMessage("Blood pressure, pulse, temperature, and weight are required.", "warning");
      return false;
    }
    if (!/^\d{2,3}\/\d{2,3}$/.test(form.blood_pressure)) {
      showMessage("Blood pressure must be in format XXX/XX (e.g. 120/80)", "warning");
      return false;
    }
    const temp = parseFloat(form.temperature);
    if (temp < 30 || temp > 45) {
      showMessage("Temperature should be between 30–45 °C", "warning");
      return false;
    }
    const pulse = parseInt(form.pulse);
    if (pulse < 30 || pulse > 200) {
      showMessage("Pulse should be between 30–200 bpm", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        patient:          parseInt(pid),   
        blood_pressure:   form.blood_pressure,
        pulse:            parseInt(form.pulse),
        temperature:      parseFloat(form.temperature),
        weight:           parseFloat(form.weight),
        bmi:              form.bmi    ? parseFloat(form.bmi)              : null,
        fundal_height:    form.fundal_height    ? parseFloat(form.fundal_height)    : null,
        fetal_heart_rate: form.fetal_heart_rate ? parseInt(form.fetal_heart_rate)  : null,
        edema:            Boolean(form.edema),
      };

      // FIX: POST to collection URL, not /{pid}/
      const res = await axiosInstance.post(VITALS_CREATE_URL, payload);
      setRecords((prev) => [res.data, ...prev]);
      setForm(emptyForm);
      setShowModal(false);
      showMessage("Antenatal vitals recorded successfully", "success");
    } catch (err) {
      console.error("Vitals save error:", err.response?.data || err.message);
      const detail = err.response?.data;
      const msg = typeof detail === 'object'
        ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        : "Failed to save vitals. Please try again.";
      showMessage(msg, "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const latest = records[records.length-1];
  // console.log(latest)

  if (pageLoading) {
    return (
      <AntenatalLayout>
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 border-4 border-pink-100 rounded-full" />
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-pink-600 font-medium">Loading antenatal vitals…</p>
        </div>
      </AntenatalLayout>
    );
  }

  return (
    <AntenatalLayout>
      <div className="space-y-4 p-2">
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

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-500 rounded-2xl p-1 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Antenatal Vitals</h1>
              {patient && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                    {patient.first_name} {patient.last_name}
                  </span>
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">PID-{pid}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-pink-600 text-xs font-semibold rounded-xl hover:bg-pink-50 transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Vitals
          </button>
        </div>

        {/* ── Stat cards ── */}
        {latest && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatCard label="Blood Pressure"   value={latest.blood_pressure}   unit=""      statusClass={getBPStatus(latest.blood_pressure)} />
            <StatCard label="Pulse"            value={latest.pulse}            unit=" bpm"  statusClass={getPulseStatus(latest.pulse)} />
            <StatCard label="Temperature"      value={latest.temperature}      unit=" °C"   statusClass={getTempStatus(latest.temperature)} />
            <StatCard label="Fetal Heart Rate" value={latest.fetal_heart_rate} unit=" bpm"  statusClass={getFHRStatus(latest.fetal_heart_rate)} />
          </div>
        )}

        {/* ── Records Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-800">Vitals History</span>
              <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full">{records.length}</span>
            </div>
            <button
              onClick={() => fetchRecords()}
              className="p-1.5 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            {records.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-50 mb-3">
                  <svg className="w-6 h-6 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-3">No antenatal vital records yet</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-pink-600 text-white text-xs font-medium rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Record First Vitals
                </button>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Date","BP","Pulse","Temp (°C)","Weight (kg)","BMI","Fundal Ht (cm)","FHR (bpm)","Edema"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.map((r) => {
                    const bmiInfo = getBMILabel(r.bmi);
                    return (
                      <tr key={r.id} className="hover:bg-pink-50/30 transition-colors">
                        <td className="px-3 py-3">{formatDateTime(r.date_created)}</td>

                        <td className="px-3 py-3">
                          {r.blood_pressure
                            ? <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getBPStatus(r.blood_pressure)}`}>{r.blood_pressure}</span>
                            : <span className="text-gray-300">—</span>}
                        </td>

                        <td className="px-3 py-3">
                          {r.pulse != null
                            ? <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPulseStatus(r.pulse)}`}>{r.pulse}</span>
                            : <span className="text-gray-300">—</span>}
                        </td>

                        <td className="px-3 py-3">
                          {r.temperature != null
                            ? <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTempStatus(r.temperature)}`}>{r.temperature}</span>
                            : <span className="text-gray-300">—</span>}
                        </td>

                        <td className="px-3 py-3">
                          <span className="text-sm text-gray-700 font-medium">{r.weight ?? "—"}</span>
                        </td>

                        <td className="px-3 py-3">
                          {r.bmi && bmiInfo
                            ? <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${bmiInfo.color}`}>{r.bmi} <span className="opacity-70">({bmiInfo.label})</span></span>
                            : <span className="text-gray-300">—</span>}
                        </td>

                        <td className="px-3 py-3">
                          <span className="text-sm text-gray-700">{r.fundal_height ?? "—"}</span>
                        </td>

                        <td className="px-3 py-3">
                          {r.fetal_heart_rate != null
                            ? <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getFHRStatus(r.fetal_heart_rate)}`}>{r.fetal_heart_rate}</span>
                            : <span className="text-gray-300">—</span>}
                        </td>

                        <td className="px-3 py-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${r.edema ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                            {r.edema ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      <ReusableModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-pink-100 rounded-lg">
              <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Record Antenatal Vitals</p>
              {patient && (
                <p className="text-xs text-gray-400">{patient.first_name} {patient.last_name} · PID-{pid}</p>
              )}
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <Field label="Blood Pressure" name="blood_pressure" value={form.blood_pressure} onChange={handleChange} placeholder="120/80" unit="mmHg" required />
            <Field label="Pulse"          name="pulse"          value={form.pulse}          onChange={handleChange} type="number" placeholder="72"    unit="bpm" min="30" max="200" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Temperature" name="temperature" value={form.temperature} onChange={handleChange} type="number" placeholder="36.6" unit="°C"  min="30" max="45" step="0.1" required />
            <Field label="Weight"      name="weight"      value={form.weight}      onChange={handleChange} type="number" placeholder="65.0" unit="kg"  min="20" max="200" step="0.1" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Height" name="height" value={form.height} onChange={handleChange} type="number" placeholder="160" unit="cm" min="100" max="220" />
            <Field label="BMI"    name="bmi"    value={form.bmi}    onChange={handleChange} placeholder="—" unit="kg/m²" readOnly={!!form.height && !!form.weight} />
          </div>
          {form.bmi && (() => { const b = getBMILabel(form.bmi); return b ? (
            <p className={`-mt-2 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${b.color}`}>{b.label}</p>
          ) : null; })()}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fundal Height"    name="fundal_height"    value={form.fundal_height}    onChange={handleChange} type="number" placeholder="28"  unit="cm"  min="0"  max="50"  step="0.5" />
            <Field label="Fetal Heart Rate" name="fetal_heart_rate" value={form.fetal_heart_rate} onChange={handleChange} type="number" placeholder="140" unit="bpm" min="60" max="200" />
          </div>

          {form.fetal_heart_rate && (parseInt(form.fetal_heart_rate) < 110 || parseInt(form.fetal_heart_rate) > 160) && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 -mt-2">
              ⚠ Normal fetal heart rate is 110–160 bpm. Please verify this reading.
            </p>
          )}

          <div className="flex items-center justify-between px-3 py-2.5 bg-orange-50 border border-orange-100 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-700">Edema Present</p>
              <p className="text-xs text-gray-400">Swelling of ankles, feet, or hands</p>
            </div>
            <Toggle label="" checked={form.edema} onChange={(val) => setForm((p) => ({ ...p, edema: val }))} />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              disabled={submitting}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-rose-500 rounded-xl hover:from-pink-700 hover:to-rose-600 shadow-md shadow-pink-100 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Vitals
                </>
              )}
            </button>
          </div>
        </form>
      </ReusableModal>
    </AntenatalLayout>
  );
};

export default AntenatalVitals;