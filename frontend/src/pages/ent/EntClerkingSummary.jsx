import React, { useState } from "react";

const isBoolSet = (v) => v === true || v === false;
const isTextSet = (v) => v !== null && v !== undefined && v !== "";

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ value }) =>
  value === true ? (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      No
    </span>
  );

// ─── Compact inline chip: "Throat pain — Yes" ─────────────────────────────────
const FieldChip = ({ label, value }) => {
  if (!isBoolSet(value) && !isTextSet(value)) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
      <span className="text-xs text-slate-600 leading-tight">{label}</span>
      {isBoolSet(value) ? (
        <Badge value={value} />
      ) : (
        <span className="text-xs font-medium text-slate-800 text-right max-w-[55%] truncate" title={value}>
          {value}
        </span>
      )}
    </div>
  );
};

// ─── Bilateral chip: "Nasal polyps  L:Yes  R:No" ─────────────────────────────
const BilateralChip = ({ label, left, right }) => {
  if (!isBoolSet(left) && !isBoolSet(right)) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
      <span className="text-xs text-slate-600 leading-tight">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {isBoolSet(left)  && <span className="flex items-center gap-1 text-xs text-slate-400">L <Badge value={left}  /></span>}
        {isBoolSet(right) && <span className="flex items-center gap-1 text-xs text-slate-400">R <Badge value={right} /></span>}
      </div>
    </div>
  );
};

// ─── helpers to check if a chip element actually has data ────────────────────
const chipHasData = (child) => {
  if (!child || typeof child !== "object") return false;
  const { props } = child;
  if (!props) return false;
  // FieldChip
  if ("value" in props && !("left" in props)) {
    return isBoolSet(props.value) || isTextSet(props.value);
  }
  // BilateralChip
  if ("left" in props || "right" in props) {
    return isBoolSet(props.left) || isBoolSet(props.right);
  }
  // SubGroup — check its values array
  if ("values" in props) {
    return props.values.some((v) => isBoolSet(v) || isTextSet(v));
  }
  // appearance tags div or anything else — keep
  return true;
};

// ─── Section card with grid of chips ─────────────────────────────────────────
const SectionCard = ({ title, icon, accent = "slate", children }) => {
  const validChildren = React.Children.toArray(children).filter(chipHasData);
  if (validChildren.length === 0) return null;

  const accents = {
    slate:  "border-slate-200 bg-white",
    blue:   "border-blue-100 bg-blue-50/30",
    indigo: "border-indigo-100 bg-indigo-50/30",
    teal:   "border-teal-100 bg-teal-50/30",
    amber:  "border-amber-100 bg-amber-50/30",
    rose:   "border-rose-100 bg-rose-50/30",
    violet: "border-violet-100 bg-violet-50/30",
  };

  const titleAccents = {
    slate:  "text-slate-500",
    blue:   "text-blue-600",
    indigo: "text-indigo-600",
    teal:   "text-teal-600",
    amber:  "text-amber-600",
    rose:   "text-rose-600",
    violet: "text-violet-600",
  };

  return (
    <div className={`rounded-xl border p-3 ${accents[accent] ?? accents.slate}`}>
      <div className="flex items-center gap-1.5 mb-2.5">
        {icon && <span className="text-sm leading-none">{icon}</span>}
        <span className={`text-xs font-bold uppercase tracking-wider ${titleAccents[accent] ?? titleAccents.slate}`}>
          {title}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {validChildren}
      </div>
    </div>
  );
};

// ─── Sub-group label inside a section (full-width row label) ──────────────────
const SubGroup = ({ label, values, children }) => {
  const hasAny = values.some((v) => isBoolSet(v) || isTextSet(v));
  if (!hasAny) return null;
  const validChildren = React.Children.toArray(children).filter(chipHasData);
  if (validChildren.length === 0) return null;
  return (
    <>
      <div className="col-span-2 sm:col-span-3 pt-1 pb-0.5">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">{label}</span>
      </div>
      {validChildren}
    </>
  );
};

// ─── Narrative card ───────────────────────────────────────────────────────────
const NarrativeCard = ({ label, value, accent = "blue" }) => {
  const [expanded, setExpanded] = useState(false);
  if (!isTextSet(value)) return null;

  const isLong = value.length > 200 || value.split("\n").filter(Boolean).length > 3;

  const styles = {
    blue:  { wrap: "bg-blue-50 border-blue-100",   label: "text-blue-500",  btn: "text-blue-400 hover:text-blue-600"  },
    slate: { wrap: "bg-slate-50 border-slate-200",  label: "text-slate-400", btn: "text-slate-400 hover:text-slate-600" },
    teal:  { wrap: "bg-teal-50 border-teal-100",    label: "text-teal-600",  btn: "text-teal-500 hover:text-teal-700"  },
    amber: { wrap: "bg-amber-50 border-amber-100",  label: "text-amber-600", btn: "text-amber-500 hover:text-amber-700" },
  };
  const s = styles[accent] ?? styles.blue;

  return (
    <div className={`rounded-xl border px-4 pt-3 pb-3 ${s.wrap}`}>
      <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${s.label}`}>{label}</p>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded || !isLong ? "none" : "4rem" }}
      >
        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{value}</p>
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={`mt-1.5 text-xs font-medium transition-colors ${s.btn}`}
        >
          {expanded ? "Show less ▲" : "Show more ▼"}
        </button>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ENTClerkingSummary = ({ record, onClose, inlineMode = false }) => {
  if (!record) return null;

  const oto   = record.otologic_history     ?? {};
  const rhino = record.rhinologic_history   ?? {};
  const laryn = record.laryngology_history  ?? {};
  const hn    = record.head_neck_history    ?? {};
  const pm    = record.past_medical_history ?? {};
  const drug  = record.drug_history         ?? {};
  const genEx = record.general_examination  ?? {};
  const earEx = record.ear_examination      ?? {};
  const nasal = record.nasal_examination    ?? {};
  const oral  = record.oral_examination     ?? {};
  const neck  = record.neck_examination     ?? {};

  const fmt = (d) =>
    new Date(d).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const appearances = [
    genEx.acutely_ill_looking     === true && "Acutely ill-looking",
    genEx.chronically_ill_looking === true && "Chronically ill-looking",
    genEx.dehydrated              === true && "Dehydrated",
    genEx.pallor                  === true && "Pallor",
    genEx.cyanosis                === true && "Cyanosis",
    genEx.lymph_node              === true && "Lymph node",
    genEx.jaundice                === true && "Jaundice",
    genEx.weight_loss             === true && "Weight loss",
    genEx.normal                  === true && "Normal",
  ].filter(Boolean);

  const content = (
    <div className="space-y-2.5">

      {/* ── Narrative cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <NarrativeCard label="Presenting Complaint"            value={record.presenting_complaint}             accent="blue"  />
        <NarrativeCard label="History of Presenting Complaint" value={record.history_of_presenting_complaint} accent="slate" />
        <NarrativeCard label="Diagnosis"                       value={record.diagnosis}                       accent="teal"  />
        <NarrativeCard label="Treatment Plan"                  value={record.treatment_plan}                  accent="amber" />
      </div>

      {/* ── All section cards in one unified grid — cards align to top, flow naturally ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">

        <SectionCard title="Otologic History" icon="🦻" accent="blue">
          <FieldChip label="Otalgia"      value={oto.otalgia}      />
          <FieldChip label="Otorrhoea"    value={oto.otorrhoea}    />
          <FieldChip label="Tinnitus"     value={oto.tinnitus}     />
          <FieldChip label="Vertigo"      value={oto.vertigo}      />
          <FieldChip label="Hearing loss" value={oto.hearing_loss} />
          <FieldChip label="Others"       value={oto.others}       />
        </SectionCard>

        <SectionCard title="Rhinologic History" icon="👃" accent="indigo">
          <FieldChip label="Nasal obstruction"  value={rhino.nasal_obstruction}  />
          <FieldChip label="Rhinorrhea"         value={rhino.rhinorrhea}         />
          <FieldChip label="Excessive sneezing" value={rhino.excessive_sneezing} />
          <FieldChip label="Facial pain"        value={rhino.facial_pain}        />
          <FieldChip label="Anosmia"            value={rhino.anosmia}            />
          <FieldChip label="Hyposmia"           value={rhino.hyposmia}           />
          <FieldChip label="Nose bleeding"      value={rhino.nose_bleeding}      />
          <FieldChip label="Nasal growth"       value={rhino.nasal_growth}       />
          <FieldChip label="Others"             value={rhino.others}             />
        </SectionCard>

        <SectionCard title="Laryngology History" icon="🗣️" accent="violet">
          <FieldChip label="Throat pain"          value={laryn.throat_pain}              />
          <FieldChip label="Dysphagia"            value={laryn.dysphagia}                />
          <FieldChip label="Odynophagia"          value={laryn.odynophagia}              />
          <FieldChip label="Hoarseness"           value={laryn.hoarseness}               />
          <FieldChip label="Halitosis"            value={laryn.halitosis}                />
          <FieldChip label="Lump in throat"       value={laryn.lump_in_throat}           />
          <FieldChip label="Throat hawking"       value={laryn.excessive_throat_hawking} />
          <FieldChip label="Breathing difficulty" value={laryn.breathing_difficulty}     />
          <FieldChip label="Snoring"              value={laryn.snoring}                  />
          <FieldChip label="Loss of taste"        value={laryn.loss_of_taste}            />
          <FieldChip label="Other voice changes"  value={laryn.other_voice_changes}      />
          <FieldChip label="Others"               value={laryn.others}                   />
        </SectionCard>

        <SectionCard title="Head & Neck History" icon="🧠" accent="rose">
          <FieldChip label="Neck swelling"    value={hn.neck_swelling}    />
          <FieldChip label="Jaw swelling"     value={hn.jaw_swelling}     />
          <FieldChip label="Facial deformity" value={hn.facial_deformity} />
          <FieldChip label="Others"           value={hn.others}           />
        </SectionCard>

        <SectionCard title="Past Medical History" icon="📋" accent="amber">
          <FieldChip label="Prev. ENT surgery"   value={pm.previous_ent_surgery}   />
          <FieldChip label="Prev. other surgery" value={pm.previous_other_surgery} />
          <FieldChip label="Prev. trauma"        value={pm.previous_trauma}        />
          <FieldChip label="PUD"                 value={pm.history_of_pud}         />
          <FieldChip label="Hypertension"        value={pm.hypertension}           />
          <FieldChip label="Diabetes"            value={pm.diabetes}               />
          <FieldChip label="Allergy"             value={pm.allergy}                />
          <FieldChip label="Migraine"            value={pm.migraine_headache}      />
          <FieldChip label="Autoimmune disease"  value={pm.autoimmune_disease}     />
          <FieldChip label="Others"              value={pm.others}                 />
        </SectionCard>

        <SectionCard title="Drug History" icon="💊" accent="teal">
          <FieldChip label="On medications" value={drug.on_medications}     />
          <FieldChip label="Medications"    value={drug.medications_detail} />
          <FieldChip label="Drug allergy"   value={drug.drug_allergy}       />
        </SectionCard>

        <SectionCard title="General Examination" icon="🩺" accent="slate">
          {appearances.length > 0 && (
            <div className="col-span-2 sm:col-span-3 flex flex-wrap gap-1 pb-1">
              {appearances.map((a) => (
                <span key={a} className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  {a}
                </span>
              ))}
            </div>
          )}
          <FieldChip label="Dyspnoeic"       value={genEx.dyspnoeic}                       />
          <FieldChip label="Tachypnoea"      value={genEx.tachypnoea}                      />
          <FieldChip label="IC/SC recession" value={genEx.intercostal_subcostal_recession} />
        </SectionCard>

        <SectionCard title="Oral Examination" icon="🦷" accent="rose">
          <FieldChip label="Good oral hygiene"  value={oral.good_oral_hygiene}                  />
          <FieldChip label="Halitosis"          value={oral.halitosis}                          />
          <FieldChip label="Free labial/buccal" value={oral.free_labial_buccal_sulci}           />
          <FieldChip label="Free retromolar"    value={oral.free_retromolar_trigone}            />
          <FieldChip label="Tonsil normal"      value={oral.tonsil_normal}                      />
          <FieldChip label="Hyperaemia"         value={oral.hyperaemia}                         />
          <FieldChip label="Exudates"           value={oral.exudates}                           />
          <FieldChip label="Granular PPW"       value={oral.granular_posterior_pharyngeal_wall} />
          <FieldChip label="Grade"              value={oral.grade}                              />
        </SectionCard>

        <SectionCard title="Ear Examination" icon="👂" accent="blue">
        <SubGroup
          label="Pinna & Canal"
          values={[earEx.pinna_deformity, earEx.tragal_pinna_tenderness, earEx.otorrhoea]}
        >
          <FieldChip label="Pinna deformity"    value={earEx.pinna_deformity}        />
          <FieldChip label="Tragal tenderness"  value={earEx.tragal_pinna_tenderness} />
          <FieldChip label="Otorrhoea"          value={earEx.otorrhoea}              />
        </SubGroup>
        <SubGroup label="EAC Findings" values={[earEx.eac_findings_left, earEx.eac_findings_right]}>
          <FieldChip label="EAC Left"  value={earEx.eac_findings_left}  />
          <FieldChip label="EAC Right" value={earEx.eac_findings_right} />
        </SubGroup>
        <SubGroup label="Tympanic Membrane" values={[earEx.tm_findings_left, earEx.tm_findings_right]}>
          <FieldChip label="TM Left"  value={earEx.tm_findings_left}  />
          <FieldChip label="TM Right" value={earEx.tm_findings_right} />
        </SubGroup>
        <SubGroup
          label="Tuning Fork Tests"
          values={[earEx.rinne_test_left, earEx.rinne_test_right, earEx.weber_test, earEx.other_tuning_fork_findings]}
        >
          <FieldChip label="Rinne's – Left"  value={earEx.rinne_test_left}            />
          <FieldChip label="Rinne's – Right" value={earEx.rinne_test_right}           />
          <FieldChip label="Weber's"         value={earEx.weber_test}                 />
          <FieldChip label="Other TF"        value={earEx.other_tuning_fork_findings} />
        </SubGroup>
        <SubGroup
          label="Facial Nerve"
          values={[earEx.left_facial_nerve_paralysis, earEx.right_facial_nerve_paralysis]}
        >
          <FieldChip label="Facial nerve – Left"  value={earEx.left_facial_nerve_paralysis}  />
          <FieldChip label="Facial nerve – Right" value={earEx.right_facial_nerve_paralysis} />
        </SubGroup>
        </SectionCard>

        <SectionCard title="Nasal Examination" icon="👃" accent="indigo">
        <SubGroup
          label="Nasal Pyramid"
          values={[nasal.nasal_pyramid_normal, nasal.nasal_pyramid_deformed, nasal.patent_nasal_cavity, nasal.olfactory_intact]}
        >
          <FieldChip label="Normal"              value={nasal.nasal_pyramid_normal}   />
          <FieldChip label="Deformed"            value={nasal.nasal_pyramid_deformed} />
          <FieldChip label="Patent nasal cavity" value={nasal.patent_nasal_cavity}    />
          <FieldChip label="Olfactory intact"    value={nasal.olfactory_intact}       />
        </SubGroup>
        <SubGroup label="Septum" values={[nasal.septum_central, nasal.septum_deviated]}>
          <FieldChip label="Central"  value={nasal.septum_central}  />
          <FieldChip label="Deviated" value={nasal.septum_deviated} />
        </SubGroup>
        <SubGroup
          label="Bilateral Findings"
          values={[
            nasal.engorged_inferior_turbinate_left, nasal.engorged_inferior_turbinate_right,
            nasal.otorrhoea_left, nasal.otorrhoea_right,
            nasal.nose_bleeding_left, nasal.nose_bleeding_right,
            nasal.nasal_polyps_left, nasal.nasal_polyps_right,
            nasal.nasal_mass_left, nasal.nasal_mass_right,
          ]}
        >
          <BilateralChip label="Inf. turbinates" left={nasal.engorged_inferior_turbinate_left}  right={nasal.engorged_inferior_turbinate_right} />
          <BilateralChip label="Otorrhoea"       left={nasal.otorrhoea_left}                    right={nasal.otorrhoea_right}                    />
          <BilateralChip label="Nose bleeding"   left={nasal.nose_bleeding_left}                right={nasal.nose_bleeding_right}                />
          <BilateralChip label="Nasal polyps"    left={nasal.nasal_polyps_left}                 right={nasal.nasal_polyps_right}                 />
          <BilateralChip label="Nasal mass"      left={nasal.nasal_mass_left}                   right={nasal.nasal_mass_right}                   />
        </SubGroup>
        <FieldChip label="Other findings" value={nasal.other_findings} />
        </SectionCard>

        <SectionCard title="Neck Examination" icon="🔍" accent="teal">
        <FieldChip label="Cervical LN level"      value={neck.cervical_lymph_nodes_level}     />
        <FieldChip label="LN description"         value={neck.lymph_nodes_description}        />
        <FieldChip label="Laryngeal fw preserved" value={neck.laryngeal_framework_preserved}  />
        <FieldChip label="Anterior neck mass"     value={neck.anterior_neck_mass}             />
        <FieldChip label="Ant. mass description"  value={neck.anterior_neck_mass_description} />
        <FieldChip label="Lateral neck mass"      value={neck.lateral_neck_mass}              />
        <FieldChip label="Lat. mass description"  value={neck.lateral_neck_mass_description}  />
        </SectionCard>

      </div>{/* end unified grid */}

    </div>
  );

  // ── Inline mode (inside history tab accordion) ────────────────────────────
  if (inlineMode) {
    return <div>{content}</div>;
  }

  // ── Standalone modal mode (kept for backward compat) ─────────────────────
  return (
    <div className="flex flex-col" style={{ maxHeight: "85vh" }}>
      <div className="shrink-0 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 shrink-0">
            <span className="text-lg">👂</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">ENT Clerking Summary</h2>
            <p className="text-xs text-slate-400">{fmt(record.date_created)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-2">{content}</div>

      <div className="shrink-0 flex justify-end pt-3 border-t border-slate-100 mt-1">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ENTClerkingSummary;