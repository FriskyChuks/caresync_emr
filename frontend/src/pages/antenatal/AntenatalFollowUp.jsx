// AntenatalFollowUp.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";
import ReusableModal from "../../components/common/ReusableModal";
import AntenatalLayout from "./AntenatalLayout";

/* ─── helpers ─── */
const calcGestWeeks = (lmp) => {
  if (!lmp) return "";
  const diff = Math.floor((new Date() - new Date(lmp)) / (1000 * 60 * 60 * 24 * 7));
  return Math.max(0, diff);
};

const formatDate = (ds) => {
  if (!ds) return "—";
  return new Date(ds).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const Badge = ({ label, color = "gray" }) => {
  const map = {
    gray:  "bg-gray-100 text-gray-600",
    green: "bg-green-100 text-green-700",
    red:   "bg-red-100 text-red-700",
    blue:  "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${map[color]}`}>{label}</span>;
};

const Field = ({ label, name, value, onChange, type = "text", placeholder, unit, required, readOnly }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      {unit && <span className="text-gray-400 font-normal ml-1">({unit})</span>}
    </label>
    <input
      type={type} name={name} value={value ?? ""} onChange={onChange}
      placeholder={placeholder} readOnly={readOnly}
      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all
        ${readOnly ? "bg-teal-50 border-teal-200 text-teal-700 cursor-not-allowed" : "border-gray-200 bg-white"}`}
    />
  </div>
);

const SectionHeader = ({ title, color = "teal" }) => (
  <div className={`-mx-5 px-5 py-2 bg-${color}-50 border-b border-${color}-100 mb-3`}>
    <p className={`text-xs font-bold text-${color}-700 uppercase tracking-wider`}>{title}</p>
  </div>
);

const VISIT_COLORS = ["blue", "emerald", "violet", "amber", "rose", "cyan", "orange", "pink"];

/* ─── Main ─── */
const AntenatalFollowUp = () => {
  const { pid } = useParams();
  const { showMessage } = useMessage();

  const [patient, setPatient]     = useState(null);
  const [booking, setBooking]     = useState(null);   // ObstetricHistory (has id + last_menstrual_period)
  const [visits, setVisits]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const emptyForm = {
    visit_date:       new Date().toISOString().split("T")[0],
    gestational_age:  "",
    weight:           "",
    blood_pressure:   "",
    fetal_heart_rate: "",
    fundal_height:    "",
    complaints:       "",
    clinical_notes:   "",
    next_visit_date:  "",
  };

  const [form, setForm] = useState(emptyForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /* Auto-populate gestational age from LMP */
  useEffect(() => {
    if (booking?.last_menstrual_period) {
      setForm((p) => ({ ...p, gestational_age: calcGestWeeks(booking.last_menstrual_period) }));
    }
  }, [booking]);

  useEffect(() => {
    if (!pid) return;
    Promise.all([
      axiosInstance.get(`/patientsapi/patient_detail/${pid}/`),
      axiosInstance.get(`/anc_specialtyapi/obstetric-history/?patient=${pid}`).catch(() => ({ data: null })),
      axiosInstance.get(`/anc_specialtyapi/anc-revisit/?patient=${pid}`).catch(() => ({ data: [] })),
    ]).then(([pRes, bRes, vRes]) => {
      setPatient(pRes.data);
      const bookingData = Array.isArray(bRes.data)
        ? bRes.data[0]
        : bRes.data;
      setBooking(bookingData);
        
      const raw = vRes.data;
      setVisits(Array.isArray(raw) ? raw : raw?.results ?? []);
      // console.log("Booking response:", bRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [pid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.blood_pressure || !form.gestational_age || !form.weight) {
      showMessage("Blood pressure, gestational age, and weight are required.", "warning");
      return;
    }
    if (!booking?.id) {
      showMessage("No obstetric booking found for this patient.", "danger");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        booking:          booking.id,   // FK to ObstetricHistory
        visit_date:       form.visit_date,
        gestational_age:  Number(form.gestational_age),
        weight:           form.weight,
        blood_pressure:   form.blood_pressure,
        fetal_heart_rate: form.fetal_heart_rate || null,
        fundal_height:    form.fundal_height    || null,
        complaints:       form.complaints       || null,
        clinical_notes:   form.clinical_notes   || null,
        next_visit_date:  form.next_visit_date  || null,
      };

      const res = await axiosInstance.post(`/anc_specialtyapi/anc-revisit/`, payload);
      setVisits((p) => [res.data, ...p]);
      setForm({ ...emptyForm, gestational_age: form.gestational_age });
      setShowModal(false);
      showMessage("Follow-up visit recorded successfully.", "success");
    } catch (err) {
      console.error(err);
      showMessage("Failed to save visit. Please try again.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <AntenatalLayout>
      <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 border-4 border-teal-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-teal-600 font-medium">Loading follow-up records…</p>
      </div>
    </AntenatalLayout>
  );

  if (!patient) return null;

  return (
    <AntenatalLayout>
      <div className="space-y-4 p-2">

        {/* Patient banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded">
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

        {/* Page header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-2 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-white">ANC Follow-up Visits</h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {patient.first_name} {patient.last_name}
                </span>
                {booking?.last_menstrual_period && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                    LMP: {formatDate(booking.last_menstrual_period)}
                  </span>
                )}
                {booking?.estimated_due_date && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                    EDD: {formatDate(booking.estimated_due_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-teal-600 text-xs font-semibold rounded-xl hover:bg-teal-50 transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Visit
          </button>
        </div>

        {/* Summary cards */}
        {visits.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total Visits",    value: visits.length },
              { label: "Gestational Age", value: booking?.last_menstrual_period ? `${calcGestWeeks(booking.last_menstrual_period)} wks` : "—" },
              { label: "Next Appt",       value: visits[0]?.next_visit_date ? formatDate(visits[0].next_visit_date) : "—" },
              { label: "WHO Minimum",     value: visits.length >= 8 ? "✓ Met" : `${8 - visits.length} more`, color: visits.length >= 8 ? "green" : "amber" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                <div className="text-xs text-gray-400 mb-1">{s.label}</div>
                <div className={`text-sm font-bold ${s.color === "green" ? "text-green-600" : s.color === "amber" ? "text-amber-600" : "text-gray-800"}`}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visit list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-sm font-semibold text-gray-800">Visit History</span>
              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">{visits.length}</span>
            </div>
            <span className="text-xs text-gray-400">WHO recommends ≥ 8 contacts</span>
          </div>

          {visits.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-3">No follow-up visits recorded</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 transition-colors"
              >
                Record First Visit
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {visits.map((v, i) => (
                <div key={v.id} className="group">
                  <div
                    className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50/40 cursor-pointer transition-colors"
                    onClick={() => setExpandedRow(expandedRow === v.id ? null : v.id)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-${VISIT_COLORS[i % VISIT_COLORS.length]}-500 shrink-0`}>
                      {visits.length - i}
                    </div>
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div><span className="text-gray-400">Date</span><br /><span className="font-semibold text-gray-700">{formatDate(v.visit_date)}</span></div>
                      <div><span className="text-gray-400">GA</span><br /><span className="font-semibold text-gray-700">{v.gestational_age} wks</span></div>
                      <div><span className="text-gray-400">BP</span><br /><span className="font-semibold text-gray-700">{v.blood_pressure || "—"}</span></div>
                      <div><span className="text-gray-400">FHR</span><br /><span className="font-semibold text-gray-700">{v.fetal_heart_rate ? `${v.fetal_heart_rate} bpm` : "—"}</span></div>
                      <div className="hidden sm:block"><span className="text-gray-400">Next</span><br /><span className="font-semibold text-gray-700">{v.next_visit_date ? formatDate(v.next_visit_date) : "—"}</span></div>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedRow === v.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {expandedRow === v.id && (
                    <div className="px-4 pb-4 bg-teal-50/30 border-t border-teal-100">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                        {[
                          ["Weight",      v.weight      ? `${v.weight} kg`  : "—"],
                          ["Fundal Ht",   v.fundal_height ? `${v.fundal_height} cm` : "—"],
                          ["FHR",         v.fetal_heart_rate ? `${v.fetal_heart_rate} bpm` : "—"],
                          ["Next Visit",  v.next_visit_date ? formatDate(v.next_visit_date) : "—"],
                        ].map(([k, val]) => (
                          <div key={k} className="bg-white rounded-lg p-2 border border-teal-100">
                            <div className="text-gray-400 mb-0.5">{k}</div>
                            <div className="font-semibold text-gray-700">{val}</div>
                          </div>
                        ))}
                      </div>
                      {v.complaints && (
                        <div className="mt-3 bg-amber-50 rounded-lg p-3 border border-amber-100">
                          <p className="text-xs font-semibold text-amber-600 mb-1">Complaints</p>
                          <p className="text-xs text-gray-700 whitespace-pre-wrap">{v.complaints}</p>
                        </div>
                      )}
                      {v.clinical_notes && (
                        <div className="mt-3 bg-white rounded-lg p-3 border border-teal-100">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Clinical Notes</p>
                          <p className="text-xs text-gray-700 whitespace-pre-wrap">{v.clinical_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Visit Modal */}
      <ReusableModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 rounded-lg">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">ANC Follow-up Visit — Visit #{visits.length + 1}</p>
              {patient && <p className="text-xs text-gray-400">{patient.first_name} {patient.last_name}</p>}
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Visit Date" name="visit_date" value={form.visit_date} onChange={handleChange} type="date" required />
            <Field label="Gestational Age" name="gestational_age" value={form.gestational_age} onChange={handleChange} type="number" unit="wks" required />
          </div>

          <SectionHeader title="Vital Signs" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Blood Pressure" name="blood_pressure" value={form.blood_pressure} onChange={handleChange} placeholder="120/80" unit="mmHg" required />
            <Field label="Weight" name="weight" value={form.weight} onChange={handleChange} type="number" placeholder="65" unit="kg" required />
            <Field label="Fundal Height" name="fundal_height" value={form.fundal_height} onChange={handleChange} type="number" placeholder="28" unit="cm" />
            <Field label="Fetal Heart Rate" name="fetal_heart_rate" value={form.fetal_heart_rate} onChange={handleChange} type="number" placeholder="140" unit="bpm" />
          </div>

          <SectionHeader title="Clinical Details" />
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Complaints</label>
            <textarea
              name="complaints" value={form.complaints} onChange={handleChange}
              rows={2} placeholder="Patient's complaints or concerns…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Clinical Notes</label>
            <textarea
              name="clinical_notes" value={form.clinical_notes} onChange={handleChange}
              rows={3} placeholder="Examination findings, counselling given, plan…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none"
            />
          </div>

          <SectionHeader title="Follow-up" />
          <Field label="Next Visit Date" name="next_visit_date" value={form.next_visit_date} onChange={handleChange} type="date" />

          {/* Actions */}
          <div className="flex gap-2 pt-1 sticky bottom-0 bg-white pb-1">
            <button type="button" onClick={() => setShowModal(false)} disabled={submitting}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl hover:from-teal-700 hover:to-cyan-700 shadow-md shadow-teal-100 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5">
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Save Visit</>
              }
            </button>
          </div>
        </form>
      </ReusableModal>
    </AntenatalLayout>
  );
};

export default AntenatalFollowUp;