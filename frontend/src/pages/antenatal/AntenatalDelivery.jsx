// AntenatalDelivery.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";
import ReusableModal from "../../components/common/ReusableModal";
import AntenatalLayout from "./AntenatalLayout";

const formatDate = (ds) => {
  if (!ds) return "—";
  return new Date(ds).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

/* ── Field components ── */
const Select = ({ label, name, value, onChange, options, required }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <select
      name={name} value={value} onChange={onChange}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
    >
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const Field = ({ label, name, value, onChange, type = "text", placeholder, unit, required, min, max, step }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      {unit && <span className="text-gray-400 font-normal ml-1">({unit})</span>}
    </label>
    <input
      type={type} name={name} value={value ?? ""} onChange={onChange}
      placeholder={placeholder} min={min} max={max} step={step}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white transition-all"
    />
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-indigo-500" : "bg-gray-300"}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : ""}`} />
    </div>
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

const SectionHead = ({ title, icon }) => (
  <div className="flex items-center gap-2 -mx-5 px-5 py-2 bg-indigo-50 border-y border-indigo-100">
    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
    </svg>
    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">{title}</p>
  </div>
);

/* ── Empty baby template ── */
const emptyBaby = () => ({
  baby_sex: "", birth_weight: "",
  apgar_score_1min: "", apgar_score_5min: "", baby_condition: "",
});

/* ── BabyForm ── */
const BabyForm = ({ index, baby, onChange, onRemove, canRemove }) => {
  const handle = (e) => {
    const { name, value } = e.target;
    onChange(index, name, value);
  };

  return (
    <div className="relative border border-indigo-100 rounded-xl p-4 bg-indigo-50/30 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {index + 1}
          </div>
          <p className="text-xs font-bold text-indigo-700">Baby #{index + 1}</p>
        </div>
        {canRemove && (
          <button
            type="button" onClick={() => onRemove(index)}
            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Sex" name="baby_sex" value={baby.baby_sex} onChange={handle}
          options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]}
        />
        <Field label="Birth Weight" name="birth_weight" value={baby.birth_weight}
          onChange={handle} type="number" placeholder="3.2" unit="kg" step="0.01" />
        <Field label="APGAR 1 min" name="apgar_score_1min" value={baby.apgar_score_1min}
          onChange={handle} type="number" min="0" max="10" placeholder="8" />
        <Field label="APGAR 5 min" name="apgar_score_5min" value={baby.apgar_score_5min}
          onChange={handle} type="number" min="0" max="10" placeholder="9" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Baby Condition</label>
        <input
          name="baby_condition" value={baby.baby_condition} onChange={handle}
          placeholder="e.g. Good, Admitted to NICU…"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
      </div>
    </div>
  );
};

/* ── Delivery record card (read-only, expandable) ── */
const DeliveryCard = ({ delivery, index }) => {
  const [expanded, setExpanded] = useState(false);
  const d = delivery;
  const babies = d.babies || [];

  return (
    <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-green-50/40 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z" />
          </svg>
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Delivery #{index + 1}</span><br />
            <span className="font-semibold text-gray-700">{formatDate(d.delivery_date)}</span>
          </div>
          <div>
            <span className="text-gray-400">Mode</span><br />
            <span className="font-semibold text-gray-700 capitalize">
              {d.delivery_mode?.replace(/_/g, " ") || "—"}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Babies</span><br />
            <span className="font-semibold text-gray-700">{babies.length || 1}</span>
          </div>
          <div>
            <span className="text-gray-400">Place</span><br />
            <span className="font-semibold text-gray-700">{d.place_of_delivery || "—"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
            Booking Closed
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-green-50 bg-green-50/20">
          {/* Summary banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white mt-3 mb-3 shadow">
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Mode",   d.delivery_mode?.replace(/_/g, " ").toUpperCase()],
                ["Place",  d.place_of_delivery || "—"],
                ["Mother", d.mother_condition  || "—"],
              ].map(([k, v]) => (
                <div key={k} className="bg-white/15 rounded-xl p-2.5 text-center">
                  <p className="text-green-100 text-xs">{k}</p>
                  <p className="font-bold text-sm mt-0.5">{v || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Per-baby details */}
          {babies.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Neonatal Details</h4>
              {babies.map((baby, bi) => (
                <div key={bi} className="border border-green-100 rounded-xl p-3 bg-white">
                  <p className="text-xs font-bold text-green-700 mb-2">Baby #{baby.baby_number || bi + 1}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["Sex",            baby.baby_sex],
                      ["Birth Weight",   baby.birth_weight ? `${baby.birth_weight} kg` : "—"],
                      ["APGAR 1 min",    baby.apgar_score_1min ?? "—"],
                      ["APGAR 5 min",    baby.apgar_score_5min ?? "—"],
                      ["Baby Condition", baby.baby_condition || "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-green-50 rounded-lg p-2 border border-green-100">
                        <p className="text-xs text-gray-400">{k}</p>
                        <p className="text-sm font-semibold text-gray-800 capitalize mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Fallback for legacy single-baby deliveries */
            <div className="border border-green-100 rounded-xl p-3 bg-white mb-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Neonatal Details</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Sex",            d.baby_sex],
                  ["Birth Weight",   d.birth_weight ? `${d.birth_weight} kg` : "—"],
                  ["APGAR 1 min",    d.apgar_score_1min ?? "—"],
                  ["APGAR 5 min",    d.apgar_score_5min ?? "—"],
                  ["Baby Condition", d.baby_condition || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-green-50 rounded-lg p-2 border border-green-100">
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize mt-0.5">{v ?? "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complications */}
          {d.complications && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-3">
              <p className="text-xs font-bold text-amber-700 mb-1">Complications</p>
              <p className="text-xs text-gray-700 whitespace-pre-wrap">{d.complications}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main ── */
const AntenatalDelivery = () => {
  const { pid } = useParams();
  const { showMessage } = useMessage();

  const [patient, setPatient]             = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);  // is_active=true booking only
  const [deliveries, setDeliveries]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [pendingData, setPendingData]     = useState(null);

  const emptyForm = {
    delivery_date:     new Date().toISOString().split("T")[0],
    delivery_mode:     "",
    place_of_delivery: "",
    complications:     "",
    mother_condition:  "",
    is_multiple:       false,
  };

  const [form, setForm]     = useState(emptyForm);
  const [babies, setBabies] = useState([emptyBaby()]);

  const cleanPid = parseInt(pid);

  useEffect(() => {
    if (!pid) return;

    Promise.all([
      axiosInstance.get(`/patientsapi/patient_detail/${cleanPid}`),
      axiosInstance.get(`/anc_specialtyapi/obstetric-history/?patient=${cleanPid}`).catch(() => ({ data: [] })),
      axiosInstance.get(`/anc_specialtyapi/delivery/?patient=${cleanPid}`).catch(() => ({ data: [] })),
    ]).then(([p, obs, d]) => {
      setPatient(p.data);

      // Find the one active booking
      const allBookings = Array.isArray(obs.data)
        ? obs.data
        : obs.data ? [obs.data] : [];
      const active = allBookings.find((bk) => bk.is_active === true) ?? null;
      setActiveBooking(active);

      // All past deliveries for history list
      const raw  = d.data;
      const list = Array.isArray(raw) ? raw : raw?.id ? [raw] : [];
      setDeliveries(
        list.sort((a, b) => new Date(b.delivery_date) - new Date(a.delivery_date))
      );
    }).catch(console.error).finally(() => setLoading(false));
  }, [pid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleToggle = (name, val) => {
    setForm((p) => ({ ...p, [name]: val }));
    if (name === "is_multiple" && val && babies.length < 2)
      setBabies([emptyBaby(), emptyBaby()]);
    if (name === "is_multiple" && !val)
      setBabies((prev) => [prev[0]]);
  };

  const handleBabyChange = (index, name, value) =>
    setBabies((prev) => prev.map((b, i) => (i === index ? { ...b, [name]: value } : b)));

  const addBaby    = () => setBabies((prev) => [...prev, emptyBaby()]);
  const removeBaby = (index) => {
    if (babies.length <= 1) return;
    setBabies((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.delivery_mode) {
      showMessage("Mode of delivery is required.", "warning");
      return;
    }
    if (!activeBooking?.id) {
      showMessage("No active pregnancy booking found for this patient.", "danger");
      return;
    }
    setPendingData({ form, babies });
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const { form: f, babies: babyList } = pendingData;

      // POST delivery — the serializer will automatically set is_active=false on the booking
      const res = await axiosInstance.post(
        `/anc_specialtyapi/delivery/`,
        {
          booking:           activeBooking.id,
          delivery_date:     f.delivery_date,
          delivery_mode:     f.delivery_mode,
          place_of_delivery: f.place_of_delivery || null,
          complications:     f.complications     || null,
          mother_condition:  f.mother_condition   || null,
          babies: babyList.map((b) => ({
            baby_sex:         b.baby_sex         || null,
            birth_weight:     b.birth_weight      || null,
            apgar_score_1min: b.apgar_score_1min !== "" ? Number(b.apgar_score_1min) : null,
            apgar_score_5min: b.apgar_score_5min !== "" ? Number(b.apgar_score_5min) : null,
            baby_condition:   b.baby_condition   || null,
          })),
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // Update local state — booking is now closed
      setDeliveries((prev) => [res.data, ...prev]);
      setActiveBooking(null);
      setForm(emptyForm);
      setBabies([emptyBaby()]);
      setShowModal(false);
      showMessage("Delivery recorded and booking closed successfully.", "success");

    } catch (err) {
      console.error(err);
      const detail = err.response?.data;
      const msg =
        typeof detail === "object"
          ? Object.entries(detail)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : "Failed to save delivery record.";
      showMessage(msg, "danger");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AntenatalLayout>
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 border-4 border-indigo-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-indigo-600 font-medium">Loading delivery records…</p>
        </div>
      </AntenatalLayout>
    );
  }

  return (
    <AntenatalLayout>
      <div className="space-y-4 p-2">

        {/* Patient banner */}
        {patient && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
        )}

        {/* Page header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-3 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Delivery Records</h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {patient && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                    {patient.first_name} {patient.last_name}
                  </span>
                )}
                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {deliveries.length} {deliveries.length === 1 ? "delivery" : "deliveries"}
                </span>
                {activeBooking && (
                  <span className="text-xs bg-green-400/80 text-white px-2 py-0.5 rounded-full animate-pulse">
                    ● Active Booking
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Record Delivery button — only visible when there IS an active booking */}
          {activeBooking && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-indigo-600 text-xs font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Record Delivery
            </button>
          )}
        </div>

        {/* Summary strip */}
        {deliveries.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Total Deliveries", deliveries.length,                                                       "indigo"],
              ["Vaginal",          deliveries.filter((d) => d.delivery_mode === "vaginal").length,          "green"],
              ["C-Section",        deliveries.filter((d) => d.delivery_mode === "c_section").length,        "amber"],
            ].map(([l, v, c]) => (
              <div key={l} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm text-center">
                <div className="text-xs text-gray-400 mb-1">{l}</div>
                <div className={`text-lg font-bold text-${c}-600`}>{v}</div>
              </div>
            ))}
          </div>
        )}

        {/* No active booking notice */}
        {!activeBooking && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 font-medium">
              No active pregnancy booking — all pregnancies have been delivered and closed.
            </p>
          </div>
        )}

        {/* Delivery history list */}
        {deliveries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm py-14 text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold">No deliveries recorded yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Recording a delivery will finalise the active ANC booking
            </p>
            {activeBooking && (
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
              >
                Record Delivery
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((d, i) => (
              <DeliveryCard key={d.id} delivery={d} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Delivery Modal ── */}
      <ReusableModal
        show={showModal}
        onClose={() => { setShowModal(false); setBabies([emptyBaby()]); setForm(emptyForm); }}
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Record Delivery</p>
              {patient && (
                <p className="text-xs text-gray-400">{patient.first_name} {patient.last_name}</p>
              )}
            </div>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">

          <div className="grid grid-cols-2 gap-3">
            <Field label="Delivery Date" name="delivery_date" value={form.delivery_date}
              onChange={handleChange} type="date" required />
            <Field label="Place of Delivery" name="place_of_delivery" value={form.place_of_delivery}
              onChange={handleChange} placeholder="e.g. Labour Ward" />
          </div>

          <SectionHead
            title="Mode of Delivery"
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
          <Select
            label="Mode of Delivery" name="delivery_mode" value={form.delivery_mode}
            onChange={handleChange} required
            options={[
              { value: "vaginal",   label: "Vaginal Delivery" },
              { value: "c_section", label: "Caesarean Section" },
              { value: "assisted",  label: "Assisted Delivery" },
            ]}
          />

          {/* Multiple birth toggle */}
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-indigo-700">Multiple Births</p>
              <p className="text-xs text-gray-400">Enable for twins, triplets, etc.</p>
            </div>
            <Toggle label="" checked={form.is_multiple} onChange={(val) => handleToggle("is_multiple", val)} />
          </div>

          <SectionHead
            title={`Neonatal Details (${babies.length} ${babies.length === 1 ? "Baby" : "Babies"})`}
            icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />

          <div className="space-y-3">
            {babies.map((baby, i) => (
              <BabyForm
                key={i} index={i} baby={baby}
                onChange={handleBabyChange} onRemove={removeBaby}
                canRemove={babies.length > 1}
              />
            ))}
          </div>

          <button
            type="button" onClick={addBaby}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-indigo-200 text-indigo-600 text-xs font-semibold rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Another Baby
          </button>

          <SectionHead
            title="Maternal Outcome"
            icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mother Condition</label>
            <input name="mother_condition" value={form.mother_condition} onChange={handleChange}
              placeholder="e.g. Stable, PPH managed…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Complications</label>
            <textarea name="complications" value={form.complications} onChange={handleChange} rows={3}
              placeholder="Intrapartum or postpartum complications, if any…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1 sticky bottom-0 bg-white pb-1">
            <button type="button" onClick={() => { setShowModal(false); setBabies([emptyBaby()]); setForm(emptyForm); }}
              disabled={submitting}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-100 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>Record Delivery</>
              )}
            </button>
          </div>
        </form>
      </ReusableModal>

      {/* ── Confirmation modal ── */}
      <ReusableModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={<span className="text-sm font-bold text-red-700">⚠ Confirm Delivery Record</span>}
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            <p className="font-semibold mb-1">
              This will permanently record the delivery for {babies.length}{" "}
              {babies.length === 1 ? "baby" : "babies"} and close the active booking.
            </p>
            <p className="text-xs text-red-500">
              Once confirmed, the current ANC booking will be closed and no new follow-up
              visits can be added under it.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button onClick={confirmSubmit} disabled={submitting}
              className="flex-1 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 rounded-xl hover:from-red-700 hover:to-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
              ) : "Yes, Record & Close Booking"}
            </button>
          </div>
        </div>
      </ReusableModal>
    </AntenatalLayout>
  );
};

export default AntenatalDelivery;