// AntenatalHistory.jsx
// Shows ALL bookings for the patient as collapsible pregnancy cards.
// Timeline is built by fetching ALL API endpoints and grouping by booking (obstetric-history) id.
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import AntenatalLayout from "./AntenatalLayout";

/* ── date helpers ── */
const fmtDate = (ds) => {
  if (!ds) return "—";
  return new Date(ds).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtDT = (ds) => {
  if (!ds) return "—";
  const d = new Date(ds);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
};

const calcGA = (lmp, visitDate) => {
  if (!lmp) return null;
  const from = new Date(lmp);
  const to   = visitDate ? new Date(visitDate) : new Date();
  if (isNaN(from) || isNaN(to)) return null;
  const diff = Math.floor((to - from) / (1000 * 60 * 60 * 24 * 7));
  return Math.max(0, diff);
};

const safeFetch = async (url) => {
  try {
    const res = await axiosInstance.get(url);
    return res.data;
  } catch {
    return null;
  }
};

/* ── pill ── */
const Pill = ({ children, color = "gray" }) => {
  const map = {
    gray:    "bg-gray-100 text-gray-600",
    blue:    "bg-blue-100 text-blue-700",
    green:   "bg-green-100 text-green-700",
    red:     "bg-red-100 text-red-700",
    amber:   "bg-amber-100 text-amber-700",
    teal:    "bg-teal-100 text-teal-700",
    violet:  "bg-violet-100 text-violet-700",
    orange:  "bg-orange-100 text-orange-700",
    indigo:  "bg-indigo-100 text-indigo-700",
    pink:    "bg-pink-100 text-pink-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${map[color] || map.gray}`}>{children}</span>;
};

/* ── event config ── */
const EVENT_CONFIG = {
  registration: { label: "ANC Registration",    color: "blue",   bg: "bg-blue-600",    dot: "bg-blue-500",   icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  menstrual:    { label: "Menstrual History",    color: "emerald",bg: "bg-emerald-600", dot: "bg-emerald-500",icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  medical:      { label: "Medical History",      color: "amber",  bg: "bg-amber-500",   dot: "bg-amber-400",  icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  pregnancy:    { label: "Current Pregnancy",    color: "rose",   bg: "bg-rose-500",    dot: "bg-rose-400",   icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  vitals:       { label: "Antenatal Vitals",     color: "pink",   bg: "bg-pink-500",    dot: "bg-pink-400",   icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  followup:     { label: "Follow-up Visit",      color: "teal",   bg: "bg-teal-600",    dot: "bg-teal-500",   icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  ultrasound:   { label: "Ultrasound",           color: "violet", bg: "bg-violet-600",  dot: "bg-violet-500", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
  delivery:     { label: "Delivery",             color: "indigo", bg: "bg-indigo-600",  dot: "bg-indigo-500", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z" },
};

/* ── Event card renderers ── */
const RegistrationCard = ({ item }) => (
  <div className="space-y-2 text-xs">
    <div className="grid grid-cols-3 gap-2">
      {[["Gravida", item.data?.gravida], ["Para", item.data?.para], ["Abortions", item.data?.abortions]].map(([k, v]) => (
        <div key={k} className="bg-blue-50 rounded-lg p-2 border border-blue-100">
          <p className="text-gray-400">{k}</p>
          <p className="font-semibold text-gray-700">{v ?? "—"}</p>
        </div>
      ))}
    </div>
    <div className="flex flex-wrap gap-4">
      {item.data?.previous_c_section && <Pill color="amber">Prev C-Section</Pill>}
      {item.data?.previous_stillbirth && <Pill color="red">Prev Stillbirth</Pill>}
      {item.data?.previous_neonatal_death && <Pill color="red">Prev Neonatal Death</Pill>}
    </div>
    {item.data?.pregnancy_complications && (
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
        <p className="text-gray-400 mb-0.5">Complications</p>
        <p className="text-gray-700">{item.data.pregnancy_complications}</p>
      </div>
    )}
  </div>
);

const MenstrualCard = ({ item }) => (
  <div className="space-y-2 text-xs">
    <div className="grid grid-cols-2 gap-2">
      {[
        ["LMP", item.data?.last_menstrual_period ? fmtDate(item.data.last_menstrual_period) : "—"],
        ["EDD", item.data?.estimated_due_date ? fmtDate(item.data.estimated_due_date) : "—"],
        ["Cycle Length", item.data?.cycle_length ? `${item.data.cycle_length} days` : "—"],
        ["Cycle Regular", item.data?.cycle_regular ? "Yes" : "No"],
      ].map(([k, v]) => (
        <div key={k} className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
          <p className="text-gray-400">{k}</p>
          <p className="font-semibold text-gray-700">{v}</p>
        </div>
      ))}
    </div>
    {item.data?.contraceptive_history && (
      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
        <p className="text-gray-400 mb-0.5">Contraceptive History</p>
        <p className="text-gray-700">{item.data.contraceptive_history}</p>
      </div>
    )}
    {item.data?.gynecological_conditions && (
      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
        <p className="text-gray-400 mb-0.5">Gynecological Conditions</p>
        <p className="text-gray-700">{item.data.gynecological_conditions}</p>
      </div>
    )}
  </div>
);

const MedicalCard = ({ item }) => (
  <div className="space-y-2 text-xs">
    <div className="flex flex-wrap gap-1.5">
      {item.data?.hypertension  && <Pill color="red">Hypertension</Pill>}
      {item.data?.diabetes       && <Pill color="amber">Diabetes</Pill>}
      {item.data?.asthma         && <Pill color="blue">Asthma</Pill>}
      {item.data?.heart_disease  && <Pill color="red">Heart Disease</Pill>}
      {!item.data?.hypertension && !item.data?.diabetes && !item.data?.asthma && !item.data?.heart_disease && (
        <span className="text-gray-400 italic">No significant conditions</span>
      )}
    </div>
    {item.data?.allergies && (
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
        <p className="text-gray-400 mb-0.5">Allergies</p>
        <p className="text-gray-700">{item.data.allergies}</p>
      </div>
    )}
    {item.data?.family_genetic_disorders && (
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
        <p className="text-gray-400 mb-0.5">Family Genetic Disorders</p>
        <p className="text-gray-700">{item.data.family_genetic_disorders}</p>
      </div>
    )}
  </div>
);

const PregnancyInfoCard = ({ item }) => (
  <div className="space-y-2 text-xs">
    <div className="grid grid-cols-2 gap-2">
      {[
        ["Gestational Age", item.data?.gestational_age_weeks ? `${item.data.gestational_age_weeks} wks` : "—"],
        ["Fetuses", item.data?.number_of_fetuses ?? "—"],
        ["Smoking", item.data?.smoking ? "Yes" : "No"],
        ["Alcohol", item.data?.alcohol ? "Yes" : "No"],
      ].map(([k, v]) => (
        <div key={k} className="bg-rose-50 rounded-lg p-2 border border-rose-100">
          <p className="text-gray-400">{k}</p>
          <p className="font-semibold text-gray-700">{v}</p>
        </div>
      ))}
    </div>
    {item.data?.presenting_complaints && (
      <div className="bg-rose-50 border border-rose-100 rounded-lg p-2">
        <p className="text-gray-400 mb-0.5">Complaints</p>
        <p className="text-gray-700">{item.data.presenting_complaints}</p>
      </div>
    )}
    {item.data?.medications && (
      <div className="bg-rose-50 border border-rose-100 rounded-lg p-2">
        <p className="text-gray-400 mb-0.5">Medications</p>
        <p className="text-gray-700">{item.data.medications}</p>
      </div>
    )}
  </div>
);

const VitalsCard = ({ item }) => (
  <div className="grid grid-cols-3 gap-2 text-xs">
    {[
      ["BP",        item.data?.blood_pressure],
      ["Pulse",     item.data?.pulse     ? `${item.data.pulse} bpm` : null],
      ["Temp",      item.data?.temperature ? `${item.data.temperature} °C` : null],
      ["Weight",    item.data?.weight    ? `${item.data.weight} kg` : null],
      ["Fundal Ht", item.data?.fundal_height ? `${item.data.fundal_height} cm` : null],
      ["FHR",       item.data?.fetal_heart_rate ? `${item.data.fetal_heart_rate} bpm` : null],
    ].map(([k, v]) => (
      <div key={k} className="bg-pink-50 rounded-lg p-2 border border-pink-100">
        <p className="text-gray-400">{k}</p>
        <p className="font-semibold text-gray-700">{v || "—"}</p>
      </div>
    ))}
    {item.data?.edema && <div className="col-span-3"><Pill color="amber">Edema Present</Pill></div>}
  </div>
);

const FollowUpCard = ({ item, lmp }) => {
  const ga = item.data?.gestational_age ?? (lmp && item.date ? calcGA(lmp, item.date) : null);
  return (
    <div className="space-y-2 text-xs">
      <div className="grid grid-cols-3 gap-2">
        {[
          ["GA",        ga != null ? `${ga} wks` : null],
          ["BP",        item.data?.blood_pressure],
          ["FHR",       item.data?.fetal_heart_rate ? `${item.data.fetal_heart_rate} bpm` : null],
          ["Fundal Ht", item.data?.fundal_height ? `${item.data.fundal_height} cm` : null],
          ["Weight",    item.data?.weight ? `${item.data.weight} kg` : null],
        ].map(([k, v]) => (
          <div key={k} className="bg-teal-50 rounded-lg p-2 border border-teal-100">
            <p className="text-gray-400">{k}</p>
            <p className="font-semibold text-gray-700">{v || "—"}</p>
          </div>
        ))}
      </div>
      {item.data?.complaints && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2">
          <p className="text-teal-600 font-bold mb-0.5">Complaints</p>
          <p className="text-gray-700 whitespace-pre-wrap">{item.data.complaints}</p>
        </div>
      )}
      {item.data?.clinical_notes && (
        <div className="bg-teal-50 border border-teal-100 rounded-lg p-2">
          <p className="text-teal-600 font-bold mb-0.5">Clinical Notes</p>
          <p className="text-gray-700 whitespace-pre-wrap">{item.data.clinical_notes}</p>
        </div>
      )}
      {item.data?.next_visit_date && (
        <p className="text-teal-600">Next: <strong>{fmtDate(item.data.next_visit_date)}</strong></p>
      )}
    </div>
  );
};

const UltrasoundCard = ({ item }) => (
  <div className="space-y-2 text-xs">
    <div className="grid grid-cols-3 gap-2">
      {[
        ["GA",          item.data?.gestational_age ? `${item.data.gestational_age} wks` : "—"],
        ["Fetuses",     item.data?.number_of_fetuses ?? "—"],
        ["FHB",         item.data?.fetal_heartbeat ? "Present" : "Absent"],
        ["Placenta",    item.data?.placenta_position || "—"],
        ["Amniotic Fl", item.data?.amniotic_fluid || "—"],
        ["Est. Weight", item.data?.fetal_weight_estimate ? `${item.data.fetal_weight_estimate} kg` : "—"],
      ].map(([k, v]) => (
        <div key={k} className="bg-violet-50 rounded-lg p-2 border border-violet-100">
          <p className="text-gray-400">{k}</p>
          <p className="font-semibold text-gray-700">{v}</p>
        </div>
      ))}
    </div>
    {item.data?.findings && (
      <div className="bg-violet-50 border border-violet-100 rounded-lg p-2">
        <p className="text-violet-600 font-bold mb-0.5">Findings</p>
        <p className="text-gray-700 whitespace-pre-wrap">{item.data.findings}</p>
      </div>
    )}
    {item.data?.scan_image && (
      <a href={item.data.scan_image} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-violet-600 hover:underline">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        View Scan Image
      </a>
    )}
  </div>
);

const DeliveryEventCard = ({ item }) => {
  const d = item.data;
  const babies = d?.babies || [];
  return (
    <div className="space-y-3 text-xs">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-3 text-white">
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Mode",    d?.delivery_mode?.replace(/_/g, " ").toUpperCase()],
            ["Place",   d?.place_of_delivery || "—"],
            ["Mother",  d?.mother_condition || "—"],
          ].map(([k, v]) => (
            <div key={k} className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-green-100 text-xs">{k}</p>
              <p className="font-bold text-sm mt-0.5 capitalize">{v || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-baby details */}
      {babies.length > 0 ? (
        <div className="space-y-2">
          {babies.map((baby, bi) => (
            <div key={bi} className="border border-green-100 rounded-xl p-3 bg-white">
              <p className="text-xs font-bold text-green-700 mb-2">Baby #{baby.baby_number || bi + 1}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Sex",           baby.baby_sex],
                  ["Birth Weight",  baby.birth_weight ? `${baby.birth_weight} kg` : "—"],
                  ["APGAR 1 min",   baby.apgar_score_1min ?? "—"],
                  ["APGAR 5 min",   baby.apgar_score_5min ?? "—"],
                  ["Condition",     baby.baby_condition || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-green-50 rounded-lg p-2 border border-green-100">
                    <p className="text-gray-400">{k}</p>
                    <p className="font-semibold text-gray-800 capitalize mt-0.5">{v ?? "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Legacy single-baby fallback */
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Baby Sex",      d?.baby_sex],
            ["Birth Weight",  d?.birth_weight ? `${d.birth_weight} kg` : "—"],
            ["APGAR 1 min",   d?.apgar_score_1min ?? "—"],
            ["APGAR 5 min",   d?.apgar_score_5min ?? "—"],
            ["Baby Condition",d?.baby_condition || "—"],
          ].map(([k, v]) => (
            <div key={k} className="bg-green-50 rounded-lg p-2 border border-green-100">
              <p className="text-gray-400">{k}</p>
              <p className="font-semibold text-gray-800 capitalize mt-0.5">{v ?? "—"}</p>
            </div>
          ))}
        </div>
      )}

      {d?.complications && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
          <p className="text-xs font-bold text-amber-700 mb-1">Complications</p>
          <p className="text-xs text-gray-700 whitespace-pre-wrap">{d.complications}</p>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
          🔒 Booking Closed
        </span>
      </div>
    </div>
  );
};

/* ── Progress bar ── */
const GestationProgress = ({ lmp, edd }) => {
  if (!lmp) return null;
  const start   = new Date(lmp);
  const end     = edd ? new Date(edd) : new Date(start.getTime() + 280 * 24 * 60 * 60 * 1000);
  const now     = new Date();
  const total   = end - start;
  const elapsed = Math.min(now - start, total);
  const pct     = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
  const weeks   = Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24 * 7)));
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1 text-xs">
        <span className="text-gray-400">Gestation progress</span>
        <span className="font-semibold text-blue-600">{weeks} / 40 wks ({pct}%)</span>
      </div>
      <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/* ── Single pregnancy card ── */
const PregnancyCard = ({ pregnancy, pid }) => {
  const [open, setOpen] = useState(false);
  const isActive  = pregnancy.is_active === true;
  const lmp       = pregnancy.lmp;
  const edd       = pregnancy.edd;
  const totalEvt  = pregnancy.timeline?.length || 0;
  const delivered = pregnancy.timeline?.find((t) => t.type === "delivery");

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isActive ? "border-blue-200" : "border-gray-100"}`}>

      {/* Header */}
      <div
        className={`px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${isActive ? "bg-gradient-to-r from-blue-50 to-indigo-50" : "bg-gradient-to-r from-gray-50 to-slate-50"}`}
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? "bg-blue-600" : delivered ? "bg-emerald-600" : "bg-gray-400"}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-gray-800">Pregnancy #{pregnancy.index}</p>
                <Pill color={isActive ? "blue" : delivered ? "emerald" : "gray"}>
                  {isActive ? "Active" : delivered ? "Delivered" : "Closed"}
                </Pill>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                <span>Registered: {fmtDate(pregnancy.date_created)}</span>
                {lmp && <span>LMP: {fmtDate(lmp)}</span>}
                {edd && <span>EDD: {fmtDate(edd)}</span>}
                {delivered && <span>Delivered: {fmtDate(delivered.data?.delivery_date)}</span>}
                <span>{totalEvt} events</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {pregnancy.followup_count > 0 && <Pill color="teal">{pregnancy.followup_count} visits</Pill>}
              {pregnancy.ultrasound_count > 0 && <Pill color="violet">{pregnancy.ultrasound_count} scans</Pill>}
              {delivered && (
                <Pill color="indigo">
                  {delivered.data?.delivery_mode?.replace(/_/g, " ") || "Delivered"}
                </Pill>
              )}
            </div>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {isActive && <GestationProgress lmp={lmp} edd={edd} />}

        {isActive && pregnancy.followup_count !== undefined && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">WHO ANC contacts</span>
              <span className="text-xs font-semibold text-blue-600">{pregnancy.followup_count} / 8</span>
            </div>
            <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (pregnancy.followup_count / 8) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {open && (
        <div className="px-5 py-4">
          {(!pregnancy.timeline || pregnancy.timeline.length === 0) ? (
            <p className="text-xs text-gray-400 text-center py-4">No events recorded for this pregnancy</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
              <div className="space-y-5">
                {pregnancy.timeline.map((item, i) => {
                  const cfg = EVENT_CONFIG[item.type] || EVENT_CONFIG.registration;
                  return (
                    <div key={`${item.type}-${i}`} className="flex gap-4 relative">
                      <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 z-10 shadow-sm`}>
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.icon} />
                        </svg>
                      </div>

                      <div className={`flex-1 bg-white border border-gray-100 rounded-xl p-3 shadow-sm mb-1 ${item.type === "delivery" ? "ring-2 ring-indigo-200" : ""}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Pill color={cfg.color}>{cfg.label}</Pill>
                            {lmp && item.date && ["followup", "vitals", "ultrasound"].includes(item.type) && (
                              <span className="text-xs text-gray-400">GA: {calcGA(lmp, item.date)} wks</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{fmtDT(item.date)}</span>
                        </div>

                        {item.type === "registration" && <RegistrationCard item={item} />}
                        {item.type === "menstrual"    && <MenstrualCard item={item} />}
                        {item.type === "medical"      && <MedicalCard item={item} />}
                        {item.type === "pregnancy"    && <PregnancyInfoCard item={item} />}
                        {item.type === "vitals"       && <VitalsCard item={item} />}
                        {item.type === "followup"     && <FollowUpCard item={item} lmp={lmp} />}
                        {item.type === "ultrasound"   && <UltrasoundCard item={item} />}
                        {item.type === "delivery"     && <DeliveryEventCard item={item} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick-action links for active pregnancy */}
          {isActive && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              {[
                { to: `/antenatal-followup/${pid}`,   label: "Add Visit",       color: "teal" },
                { to: `/antenatal-vitals/${pid}`,     label: "Add Vitals",      color: "pink" },
                { to: `/antenatal-labs/${pid}`,       label: "Request Lab",     color: "violet" },
                { to: `/antenatal-complaints/${pid}`, label: "Add Note",        color: "orange" },
                { to: `/antenatal-delivery/${pid}`,   label: "Record Delivery", color: "indigo" },
              ].map(({ to, label, color }) => (
                <Link key={to} to={to}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg bg-${color}-50 text-${color}-700 border border-${color}-200 hover:bg-${color}-100 transition-colors`}>
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main ── */
const AntenatalHistory = () => {
  const { pid } = useParams();
  const [patient, setPatient]         = useState(null);
  const [pregnancies, setPregnancies] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!pid) return;

    const fetchAll = async () => {
      try {
        // 1. Patient info
        const patientRes = await axiosInstance.get(`/patientsapi/patient_detail/${pid}/`);
        setPatient(patientRes.data);

        // 2. ALL obstetric bookings (all pregnancies)
        const obsData = await safeFetch(`/anc_specialtyapi/obstetric-history/?patient=${pid}`);
        const allBookings = Array.isArray(obsData) ? obsData : obsData ? [obsData] : [];

        if (allBookings.length === 0) {
          setPregnancies([]);
          return;
        }

        // 3. Fetch all related data in parallel (patient-level queries)
        const [
          menstrualData,
          medicalData,
          pregnancyData,
          vitalsData,
          revisitData,
          ultrasoundData,
          deliveryData,
        ] = await Promise.all([
          safeFetch(`/anc_specialtyapi/menstrual-history/?patient=${pid}`),
          safeFetch(`/anc_specialtyapi/medical-history/?patient=${pid}`),
          safeFetch(`/anc_specialtyapi/current-pregnancy/?patient=${pid}`),
          safeFetch(`/anc_specialtyapi/antenatal-vitals/?patient=${pid}`),
          safeFetch(`/anc_specialtyapi/anc-revisit/?patient=${pid}`),
          safeFetch(`/anc_specialtyapi/ultrasound/?patient=${pid}`),
          safeFetch(`/anc_specialtyapi/delivery/?patient=${pid}`),
        ]);

        const toArray = (d) => Array.isArray(d) ? d : d ? [d] : [];

        const menstrualList  = toArray(menstrualData);
        const medicalList    = toArray(medicalData);
        const pregnancyList  = toArray(pregnancyData);
        const vitalsList     = toArray(vitalsData);
        const revisitList    = toArray(revisitData);
        const ultrasoundList = toArray(ultrasoundData);
        const deliveryList   = toArray(deliveryData);

        // 4. Build a timeline for each booking
        const enriched = allBookings.map((booking, idx) => {
          const bookingId = booking.id;

          // Find menstrual record matching this booking's patient (most recent = closest date_created)
          // Since menstrual/medical/current-pregnancy are per-patient (not per-booking),
          // we associate them with the booking by proximity of date_created.
          const sortedMenstrual = [...menstrualList].sort((a, b) => new Date(b.date_created || 0) - new Date(a.date_created || 0));
          const sortedMedical   = [...medicalList].sort((a, b) => new Date(b.date_created || 0) - new Date(a.date_created || 0));
          const sortedPregnancy = [...pregnancyList].sort((a, b) => new Date(b.date_created || 0) - new Date(a.date_created || 0));

          // For a multi-pregnancy patient, associate by index (oldest booking → oldest record)
          const bookingIndex = allBookings.length - 1 - idx; // 0 = oldest
          const menstrual  = sortedMenstrual[bookingIndex]  ?? sortedMenstrual[0]  ?? null;
          const medical    = sortedMedical[bookingIndex]    ?? sortedMedical[0]    ?? null;
          const pregnancy  = sortedPregnancy[bookingIndex]  ?? sortedPregnancy[0]  ?? null;

          // Booking-scoped records (have booking FK)
          const revisits    = revisitList.filter((r) => r.booking === bookingId);
          const ultrasounds = ultrasoundList.filter((u) => u.booking === bookingId);
          const delivery    = deliveryList.find((d) => d.booking === bookingId) ?? null;
          // Also check vitals (patient-scoped)
          const vitals = vitalsList; // all vitals, we'll group them all under the active booking

          // LMP and EDD from menstrual record
          const lmp = menstrual?.last_menstrual_period ?? null;
          const edd = menstrual?.estimated_due_date    ?? null;

          // Build timeline
          const timeline = [];

          // Registration event
          timeline.push({
            type: "registration",
            date: booking.date_created,
            data: booking,
          });

          // Menstrual history
          if (menstrual) {
            timeline.push({
              type: "menstrual",
              date: menstrual.date_created || booking.date_created,
              data: menstrual,
            });
          }

          // Medical history
          if (medical) {
            timeline.push({
              type: "medical",
              date: medical.date_created || booking.date_created,
              data: medical,
            });
          }

          // Current pregnancy info
          if (pregnancy) {
            timeline.push({
              type: "pregnancy",
              date: pregnancy.date_created || booking.date_created,
              data: pregnancy,
            });
          }

          // Antenatal vitals (only associate with active/most-recent booking if patient has multiple)
          if (idx === 0) {
            vitals.forEach((v) => {
              timeline.push({
                type: "vitals",
                date: v.date_created,
                data: v,
              });
            });
          }

          // ANC revisits
          revisits.forEach((r) => {
            timeline.push({
              type: "followup",
              date: r.date_created || r.visit_date,
              data: r,
            });
          });

          // Ultrasounds
          ultrasounds.forEach((u) => {
            timeline.push({
              type: "ultrasound",
              date: u.date_created || u.scan_date,
              data: u,
            });
          });

          // Delivery
          if (delivery) {
            timeline.push({
              type: "delivery",
              date: delivery.date_created || delivery.delivery_date,
              data: delivery,
            });
          }

          // Sort by date ascending
          timeline.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

          return {
            ...booking,
            index:           allBookings.length - idx,
            lmp,
            edd,
            timeline,
            followup_count:  revisits.length,
            ultrasound_count: ultrasounds.length,
          };
        });

        // Active pregnancies first
        setPregnancies([
          ...enriched.filter((p) => p.is_active === true),
          ...enriched.filter((p) => p.is_active !== true),
        ]);
      } catch (err) {
        console.error("Error building pregnancy history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [pid]);

  const activeCount = pregnancies.filter((p) => p.is_active === true).length;
  const closedCount = pregnancies.filter((p) => p.is_active !== true).length;
  const totalVisits = pregnancies.reduce((s, p) => s + (p.followup_count || 0), 0);
  const totalScans  = pregnancies.reduce((s, p) => s + (p.ultrasound_count || 0), 0);

  if (loading) return (
    <AntenatalLayout>
      <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-slate-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-slate-600 font-medium">Loading complete pregnancy history…</p>
        <p className="text-xs text-gray-400">Fetching all records from all endpoints</p>
      </div>
    </AntenatalLayout>
  );

  return (
    <AntenatalLayout>
      <div className="space-y-4 p-2">

        {/* Patient banner */}
        {patient && (
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
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Complete Pregnancy History</h1>
              {patient && (
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs bg-white/15 text-white px-2 py-0.5 rounded-full">
                    {patient.first_name} {patient.last_name}
                  </span>
                  <span className="text-xs bg-white/15 text-white px-2 py-0.5 rounded-full">
                    G{pregnancies.length}P{closedCount}
                  </span>
                  {activeCount > 0 && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                      ● Active Pregnancy
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-4 gap-2">
          {[
            ["Total",      pregnancies.length, "slate"],
            ["Active",     activeCount,         "blue"],
            ["Delivered",  closedCount,         "emerald"],
            ["ANC Visits", totalVisits,         "teal"],
          ].map(([l, v, c]) => (
            <div key={l} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <div className="text-xs text-gray-400 mb-1">{l}</div>
              <div className={`text-lg font-bold ${
                c === "blue" ? "text-blue-600" :
                c === "emerald" ? "text-emerald-600" :
                c === "teal" ? "text-teal-600" : "text-gray-800"}`}>
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 px-1">
          {Object.values(EVENT_CONFIG).map((cfg) => (
            <div key={cfg.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-xs text-gray-500">{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* Pregnancy cards */}
        {pregnancies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold">No pregnancy history found</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">This patient has not been registered for ANC</p>
            <Link to={`/antenatal-bookings/${pid}`}
              className="inline-block px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-100">
              Register for ANC
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {pregnancies.map((preg, i) => (
              <PregnancyCard key={preg.id || i} pregnancy={preg} pid={pid} />
            ))}
          </div>
        )}
      </div>
    </AntenatalLayout>
  );
};

export default AntenatalHistory;