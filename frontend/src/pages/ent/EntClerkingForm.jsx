import { useState, useMemo } from "react";

const STEPS = [
  { id: "presenting",   label: "Presenting Complaint" },
  { id: "otologic",     label: "Otologic History" },
  { id: "rhinologic",   label: "Rhinologic History" },
  { id: "laryngology",  label: "Laryngology History" },
  { id: "headneck",     label: "Head & Neck History" },
  { id: "pastmedical",  label: "Past Medical History" },
  { id: "drug",         label: "Drug History" },
  { id: "general_exam", label: "General Examination" },
  { id: "ear_exam",     label: "Ear Examination" },
  { id: "nasal_exam",   label: "Nasal Examination" },
  { id: "oral_exam",    label: "Oral Examination" },
  { id: "neck_exam",    label: "Neck Examination" },
  { id: "diagnosis",    label: "Diagnosis & Plan" },
];

function buildPayload(patientId, allData) {
  const {
    presenting   = {},
    otologic     = {},
    rhinologic   = {},
    laryngology  = {},
    headneck     = {},
    pastmedical  = {},
    drug         = {},
    general_exam = {},
    ear_exam     = {},
    nasal_exam   = {},
    oral_exam    = {},
    neck_exam    = {},
    diagnosis    = {},
  } = allData;

  const bool = (v) => {
  if (v === true) return true;
  if (v === false) return false;
  return undefined; 
};

  const text = (v) => (v == null ? "" : String(v));
  const appearances = general_exam.general_appearance || [];
  const hasApp = (label) => appearances.includes(label);

  return {
    patient: parseInt(patientId, 10),
    presenting_complaint:            text(presenting.presenting_complaint),
    history_of_presenting_complaint: text(presenting.history_of_presenting_complaint),
    diagnosis:                       text(diagnosis.diagnosis),
    treatment_plan:                  text(diagnosis.treatment_plan),

    // ── otologic_history ───────────────────────────────────────────────────
    otologic_history: {
      otalgia:      bool(otologic.otalgia),
      otorrhoea:    bool(otologic.otorrhoea),
      tinnitus:     bool(otologic.tinnitus),
      vertigo:      bool(otologic.vertigo),
      hearing_loss: bool(otologic.hearing_loss),
      others:       text(otologic.others),
    },

    // ── rhinologic_history ─────────────────────────────────────────────────
    rhinologic_history: {
      nasal_obstruction:  bool(rhinologic.nasal_obstruction),
      rhinorrhea:         bool(rhinologic.rhinorrhea),
      excessive_sneezing: bool(rhinologic.excessive_sneezing),
      facial_pain:        bool(rhinologic.facial_pain),
      anosmia:            bool(rhinologic.anosmia),
      hyposmia:           bool(rhinologic.hyposmia),
      nose_bleeding:      bool(rhinologic.nose_bleeding),
      nasal_growth:       bool(rhinologic.nasal_growth),
      others:             text(rhinologic.other ?? rhinologic.others),
    },

    // ── laryngology_history ────────────────────────────────────────────────
    laryngology_history: {
      throat_pain:             bool(laryngology.throat_pain),
      dysphagia:               bool(laryngology.dysphagia),
      odynophagia:             bool(laryngology.odynophagia),
      hoarseness:              bool(laryngology.hoarseness),
      halitosis:               bool(laryngology.halitosis),
      lump_in_throat:          bool(laryngology.feeling_of_lump_in_throat ?? laryngology.lump_in_throat),
      excessive_throat_hawking: bool(laryngology.excessive_throat_hawking),
      breathing_difficulty:    bool(laryngology.breathing_difficulty),
      snoring:                 bool(laryngology.snoring),
      loss_of_taste:           bool(laryngology.loss_of_taste),
      other_voice_changes:     text(laryngology.other_voice_changes),
      others:                  text(laryngology.others),
    },

    // ── head_neck_history ──────────────────────────────────────────────────
    head_neck_history: {
      neck_swelling:    bool(headneck.neck_swelling),
      jaw_swelling:     bool(headneck.jaw_swelling),
      facial_deformity: bool(headneck.facial_deformity),
      others:           text(headneck.others),
    },

    // ── past_medical_history ───────────────────────────────────────────────
    past_medical_history: {
      previous_ent_surgery:   text(pastmedical.previous_ent_surgery),
      previous_other_surgery: text(pastmedical.previous_other_surgery),
      previous_trauma:        text(pastmedical.previous_trauma),
      history_of_pud:         bool(pastmedical.history_of_pudx ?? pastmedical.history_of_pud),
      hypertension:           bool(pastmedical.history_of_hypertension ?? pastmedical.hypertension),
      diabetes:               bool(pastmedical.history_of_diabetes ?? pastmedical.diabetes),
      allergy:                bool(pastmedical.history_of_allergy ?? pastmedical.allergy),
      migraine_headache:      bool(pastmedical.history_of_migraine_headache ?? pastmedical.migraine_headache),
      autoimmune_disease:     text(pastmedical.history_of_autoimmune_disease ?? pastmedical.autoimmune_disease),
      others:                 text(pastmedical.others),
    },

    // ── drug_history ───────────────────────────────────────────────────────
    drug_history: {
      on_medications:     bool(drug.history_of_any_medications ?? drug.on_medications),
      medications_detail: text(drug.medications_specify ?? drug.medications_detail),
      // form key: any_drug_allergy → model: drug_allergy
      drug_allergy:       bool(drug.any_drug_allergy ?? drug.drug_allergy),
    },

    // ── general_examination ────────────────────────────────────────────────
    // CheckGroup stores selections in general_appearance[]; map to booleans.
    general_examination: {
      acutely_ill_looking:               hasApp("Acutely ill-looking"),
      chronically_ill_looking:           hasApp("Chronically ill-looking"),
      pallor:                            hasApp("Pallor"),
      cyanosis:                          hasApp("Cyanosis"),
      dehydrated:                        hasApp("Dehydrated"),
      lymph_node:                        hasApp("Lymph node"),
      jaundice:                          hasApp("Jaundice"),
      weight_loss:                       hasApp("Weight loss"),
      normal:                            hasApp("Normal"),
      dyspnoeic:                         bool(general_exam.dyspnoeic),
      tachypnoea:                        bool(general_exam.tachypnoea),
      intercostal_subcostal_recession:   bool(general_exam.intercostal_subcostal_recession),
    },

    // ── ear_examination ────────────────────────────────────────────────────
    ear_examination: {
      pinna_deformity:               bool(ear_exam.pinna_deformity),
      tragal_pinna_tenderness:       bool(ear_exam.tragal_pinna_tenderness),
      otorrhoea:                     bool(ear_exam.otorrhoea),
      eac_findings_left:             text(ear_exam.eac_findings_left),
      eac_findings_right:            text(ear_exam.eac_findings_right),
      tm_findings_left:              text(ear_exam.tm_findings_left),
      tm_findings_right:             text(ear_exam.tm_findings_right),
      // form keys: rinnes_test_left/right → model: rinne_test_left/right
      rinne_test_left:               text(ear_exam.rinnes_test_left  ?? ear_exam.rinne_test_left),
      rinne_test_right:              text(ear_exam.rinnes_test_right ?? ear_exam.rinne_test_right),
      // form key: webers_test → model: weber_test
      weber_test:                    text(ear_exam.webers_test ?? ear_exam.weber_test),
      other_tuning_fork_findings:    text(ear_exam.others ?? ear_exam.other_tuning_fork_findings),
      left_facial_nerve_paralysis:   bool(ear_exam.left_facial_nerve_paralysis),
      right_facial_nerve_paralysis:  bool(ear_exam.right_facial_nerve_paralysis),
    },

    // ── nasal_examination ──────────────────────────────────────────────────
    // BilateralYesNo appends _left/_right → model also uses _left/_right.
    // form key: engorged_inferior_turbinates_left/right
    //   → model: engorged_inferior_turbinate_left/right  (singular "turbinate")
    nasal_examination: {
      nasal_pyramid_normal:               bool(nasal_exam.nasal_pyramid_normal  ),
      nasal_pyramid_deformed:             bool(nasal_exam.nasal_pyramid_deformed),
      patent_nasal_cavity:                bool(nasal_exam.patent_nasal_cavity   ),
      olfactory_intact:                   bool(nasal_exam.olfactory_intact      ),
      septum_central:                     bool(nasal_exam.septum_central        ),
      septum_deviated:                    bool(nasal_exam.septum_deviated),
      // singular "turbinate" in model vs plural "turbinates" in form
      engorged_inferior_turbinate_left:   bool(
        nasal_exam.engorged_inferior_turbinates_left ??
        nasal_exam.engorged_inferior_turbinate_left
      ),
      engorged_inferior_turbinate_right:  bool(
        nasal_exam.engorged_inferior_turbinates_right ??
        nasal_exam.engorged_inferior_turbinate_right
      ),
      otorrhoea_left:     bool(nasal_exam.otorrhoea_left),
      otorrhoea_right:    bool(nasal_exam.otorrhoea_right),
      nose_bleeding_left:  bool(nasal_exam.nose_bleeding_left),
      nose_bleeding_right: bool(nasal_exam.nose_bleeding_right),
      nasal_polyps_left:   bool(nasal_exam.nasal_polyps_left),
      nasal_polyps_right:  bool(nasal_exam.nasal_polyps_right),
      nasal_mass_left:     bool(nasal_exam.nasal_mass_left),
      nasal_mass_right:    bool(nasal_exam.nasal_mass_right),
      other_findings:      text(nasal_exam.other_findings),
    },

    // ── oral_examination ───────────────────────────────────────────────────
    oral_examination: {
      good_oral_hygiene:                  bool(oral_exam.good_oral_hygiene      ),
      halitosis:                          bool(oral_exam.halitosis),
      free_labial_buccal_sulci:           bool(oral_exam.free_labial_buccal_sulci ),
      free_retromolar_trigone:            bool(oral_exam.free_retromolar_trigone  ),
      tonsil_normal:                      bool(oral_exam.tonsil_normal           ),
      hyperaemia:                         bool(oral_exam.hyperaemia),
      exudates:                           bool(oral_exam.exudates),
      granular_posterior_pharyngeal_wall: bool(oral_exam.granular_posterior_pharyngeal_wall),
      // form key: grade_specify → model: grade
      grade:                              text(oral_exam.grade_specify ?? oral_exam.grade),
    },

    // ── neck_examination ───────────────────────────────────────────────────
    neck_examination: {
      cervical_lymph_nodes_level:     text(neck_exam.cervical_lymph_nodes_level),
      // form key: describe_lymph_nodes → model: lymph_nodes_description
      lymph_nodes_description:        text(neck_exam.describe_lymph_nodes ?? neck_exam.lymph_nodes_description),
      laryngeal_framework_preserved:  bool(neck_exam.laryngeal_framework_preserved ),
      anterior_neck_mass:             bool(neck_exam.anterior_neck_mass),
      anterior_neck_mass_description: text(neck_exam.anterior_neck_mass_description),
      lateral_neck_mass:              bool(neck_exam.lateral_neck_mass),
      lateral_neck_mass_description:  text(neck_exam.lateral_neck_mass_description),
    },
  };
}

// ── Primitive field components ────────────────────────────────────────────────

function YesNo({ label, name, value, onChange, readOnly, note }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700 flex-1 leading-snug">
        {label}
        {note && <span className="text-xs text-slate-400 ml-1">({note})</span>}
      </span>
      <div className="flex gap-1.5 shrink-0">
        {["Yes", "No"].map(opt => {
          const isYes = opt === "Yes";
          const active = value === isYes;
          return (
            <button
              key={opt}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onChange(name, isYes)}
              className={`px-3.5 py-1 text-xs font-bold rounded-full border transition-all ${
                active
                  ? isYes
                    ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                    : "bg-rose-500 text-white border-rose-500 shadow-sm"
                  : readOnly
                    ? "bg-slate-50 text-slate-300 border-slate-100 cursor-default"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BilateralYesNo({ label, name, values, onChange, readOnly }) {
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <span className="block text-sm text-slate-700 mb-2">{label}</span>
      <div className="flex gap-8 pl-2">
        {["left", "right"].map(side => (
          <div key={side} className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 w-9 capitalize">{side}</span>
            {["Yes", "No"].map(opt => {
              const isYes = opt === "Yes";
              const fieldName = `${name}_${side}`;
              const active = values[fieldName] === isYes;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={readOnly}
                  onClick={() => !readOnly && onChange(fieldName, isYes)}
                  className={`px-3 py-0.5 text-xs font-bold rounded-full border transition-all ${
                    active
                      ? isYes
                        ? "bg-teal-500 text-white border-teal-500"
                        : "bg-rose-500 text-white border-rose-500"
                      : readOnly
                        ? "bg-slate-50 text-slate-300 border-slate-100 cursor-default"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, readOnly, rows = 3, placeholder }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        value={value || ""}
        readOnly={readOnly}
        placeholder={readOnly ? "—" : placeholder}
        onChange={e => !readOnly && onChange(name, e.target.value)}
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 resize-none transition-colors ${
          readOnly
            ? "bg-slate-50 border-slate-100 text-slate-600 cursor-default"
            : "border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        }`}
      />
    </div>
  );
}

function CheckGroup({ label, name, options, values, onChange, readOnly }) {
  const current = values[name] || [];
  const toggle = opt => {
    if (readOnly) return;
    const next = current.includes(opt)
      ? current.filter(x => x !== opt)
      : [...current, opt];
    onChange(name, next);
  };
  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            disabled={readOnly}
            onClick={() => toggle(opt)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
              current.includes(opt)
                ? "bg-blue-500 text-white border-blue-500"
                : readOnly
                  ? "bg-slate-50 text-slate-300 border-slate-100 cursor-default"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mt-5 mb-2 first:mt-0">
      {children}
    </p>
  );
}

function SideBySide({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

// ── Step components ───────────────────────────────────────────────────────────

function PresentingStep({ data, onChange, readOnly }) {
  return (
    <div>
      <Field
        label="Presenting Complaint"
        name="presenting_complaint"
        value={data.presenting_complaint}
        onChange={onChange}
        readOnly={readOnly}
        rows={3}
      />
      <Field
        label="History of Presenting Complaint"
        name="history_of_presenting_complaint"
        value={data.history_of_presenting_complaint}
        onChange={onChange}
        readOnly={readOnly}
        rows={5}
      />
    </div>
  );
}

function OtologicStep({ data, onChange, readOnly }) {
  const fields = [
    ["otalgia",      "Otalgia"],
    ["otorrhoea",    "Otorrhoea"],
    ["tinnitus",     "Tinnitus"],
    ["vertigo",      "Vertigo"],
    ["hearing_loss", "Hearing loss"],
  ];
  return (
    <div>
      {fields.map(([name, label]) => (
        <YesNo key={name} name={name} label={label} value={data[name]} onChange={onChange} readOnly={readOnly} />
      ))}
      <div className="mt-3">
        <Field label="Others" name="others" value={data.others} onChange={onChange} readOnly={readOnly} rows={2} />
      </div>
    </div>
  );
}

function RhinologicStep({ data, onChange, readOnly }) {
  const fields = [
    ["nasal_obstruction",  "Nasal obstruction"],
    ["rhinorrhea",         "Rhinorrhea"],
    ["excessive_sneezing", "Excessive sneezing"],
    ["facial_pain",        "Facial pain"],
    ["anosmia",            "Anosmia"],
    ["hyposmia",           "Hyposmia"],
    ["nose_bleeding",      "Nose bleeding"],
    ["nasal_growth",       "Nasal growth"],
  ];
  return (
    <div>
      {fields.map(([name, label]) => (
        <YesNo key={name} name={name} label={label} value={data[name]} onChange={onChange} readOnly={readOnly} />
      ))}
      <div className="mt-3">
        {/* stored as "other" in form state; buildPayload maps to "others" */}
        <Field label="Others" name="other" value={data.other} onChange={onChange} readOnly={readOnly} rows={2} />
      </div>
    </div>
  );
}

function LaryngologyStep({ data, onChange, readOnly }) {
  const fields = [
    ["throat_pain",                "Throat pain"],
    ["dysphagia",                  "Dysphagia"],
    ["odynophagia",                "Odynophagia"],
    ["hoarseness",                 "Hoarseness"],
    ["halitosis",                  "Halitosis"],
    ["feeling_of_lump_in_throat",  "Feeling of lump in throat"],
    ["excessive_throat_hawking",   "Excessive throat hawking"],
    ["breathing_difficulty",       "Breathing difficulty"],
    ["snoring",                    "Snoring"],
    ["loss_of_taste",              "Loss of taste"],
  ];
  return (
    <div>
      {fields.map(([name, label]) => (
        <YesNo key={name} name={name} label={label} value={data[name]} onChange={onChange} readOnly={readOnly} />
      ))}
      <div className="mt-3">
        <Field label="Other voice changes" name="other_voice_changes" value={data.other_voice_changes} onChange={onChange} readOnly={readOnly} rows={2} />
        <Field label="Others" name="others" value={data.others} onChange={onChange} readOnly={readOnly} rows={2} />
      </div>
    </div>
  );
}

function HeadNeckStep({ data, onChange, readOnly }) {
  return (
    <div>
      <YesNo name="neck_swelling"    label="Neck swelling"    value={data.neck_swelling}    onChange={onChange} readOnly={readOnly} />
      <YesNo name="jaw_swelling"     label="Jaw swelling"     value={data.jaw_swelling}     onChange={onChange} readOnly={readOnly} />
      <YesNo name="facial_deformity" label="Facial deformity" value={data.facial_deformity} onChange={onChange} readOnly={readOnly} />
      <div className="mt-3">
        <Field label="Others" name="others" value={data.others} onChange={onChange} readOnly={readOnly} rows={2} />
      </div>
    </div>
  );
}

function PastMedicalStep({ data, onChange, readOnly }) {
  const conditions = [
    ["history_of_pudx",              "History of PUD"],
    ["history_of_hypertension",      "History of hypertension"],
    ["history_of_diabetes",          "History of diabetes"],
    ["history_of_allergy",           "History of allergy"],
    ["history_of_migraine_headache", "History of migraine headache"],
  ];
  return (
    <div>
      <SectionLabel>Surgical history</SectionLabel>
      <Field label="Previous ENT surgery (specify)"   name="previous_ent_surgery"   value={data.previous_ent_surgery}   onChange={onChange} readOnly={readOnly} rows={2} />
      <Field label="Previous other surgery (specify)" name="previous_other_surgery" value={data.previous_other_surgery} onChange={onChange} readOnly={readOnly} rows={2} />
      <Field label="Previous trauma (specify)"        name="previous_trauma"        value={data.previous_trauma}        onChange={onChange} readOnly={readOnly} rows={2} />
      <SectionLabel>Medical conditions</SectionLabel>
      {conditions.map(([name, label]) => (
        <YesNo key={name} name={name} label={label} value={data[name]} onChange={onChange} readOnly={readOnly} />
      ))}
      <div className="mt-3">
        <Field label="History of autoimmune disease" name="history_of_autoimmune_disease" value={data.history_of_autoimmune_disease} onChange={onChange} readOnly={readOnly} rows={2} />
        <Field label="Others" name="others" value={data.others} onChange={onChange} readOnly={readOnly} rows={2} />
      </div>
    </div>
  );
}

function DrugStep({ data, onChange, readOnly }) {
  return (
    <div>
      <YesNo name="history_of_any_medications" label="History of any medications" value={data.history_of_any_medications} onChange={onChange} readOnly={readOnly} />
      {data.history_of_any_medications === true && (
        <div className="mt-3 ml-2 pl-3 border-l-2 border-teal-200">
          <Field label="Specify medications" name="medications_specify" value={data.medications_specify} onChange={onChange} readOnly={readOnly} rows={3} />
        </div>
      )}
      <YesNo name="any_drug_allergy" label="Any drug allergy" value={data.any_drug_allergy} onChange={onChange} readOnly={readOnly} />
    </div>
  );
}

function GeneralExamStep({ data, onChange, readOnly }) {
  const appearances = [
    "Acutely ill-looking", "Chronically ill-looking", "Dehydrated",
    "Pallor", "Cyanosis", "Lymph node", "Jaundice", "Weight loss", "Normal",
  ];
  return (
    <div>
      <CheckGroup label="General appearance" name="general_appearance" options={appearances} values={data} onChange={onChange} readOnly={readOnly} />
      <SectionLabel>Respiratory</SectionLabel>
      <YesNo name="dyspnoeic"                       label="Dyspnoeic"                       value={data.dyspnoeic}                       onChange={onChange} readOnly={readOnly} />
      <YesNo name="tachypnoea"                      label="Tachypnoea"                      value={data.tachypnoea}                      onChange={onChange} readOnly={readOnly} />
      <YesNo name="intercostal_subcostal_recession" label="Intercostal/subcostal recession" value={data.intercostal_subcostal_recession} onChange={onChange} readOnly={readOnly} />
    </div>
  );
}

function EarExamStep({ data, onChange, readOnly }) {
  return (
    <div>
      <SectionLabel>Pinna & canal</SectionLabel>
      <YesNo name="pinna_deformity"         label="Pinna deformity"         value={data.pinna_deformity}         onChange={onChange} readOnly={readOnly} />
      <YesNo name="tragal_pinna_tenderness" label="Tragal/Pinna tenderness" value={data.tragal_pinna_tenderness} onChange={onChange} readOnly={readOnly} />
      <YesNo name="otorrhoea"               label="Otorrhoea"               value={data.otorrhoea}               onChange={onChange} readOnly={readOnly} />
      <SectionLabel>EAC findings</SectionLabel>
      <SideBySide>
        <Field label="Left"  name="eac_findings_left"  value={data.eac_findings_left}  onChange={onChange} readOnly={readOnly} rows={2} />
        <Field label="Right" name="eac_findings_right" value={data.eac_findings_right} onChange={onChange} readOnly={readOnly} rows={2} />
      </SideBySide>
      <SectionLabel>Tympanic membrane</SectionLabel>
      <SideBySide>
        <Field label="Left"  name="tm_findings_left"  value={data.tm_findings_left}  onChange={onChange} readOnly={readOnly} rows={2} />
        <Field label="Right" name="tm_findings_right" value={data.tm_findings_right} onChange={onChange} readOnly={readOnly} rows={2} />
      </SideBySide>
      <SectionLabel>Tuning fork tests</SectionLabel>
      <SideBySide>
        <Field label="Rinne's – Left"  name="rinnes_test_left"  value={data.rinnes_test_left}  onChange={onChange} readOnly={readOnly} rows={2} />
        <Field label="Rinne's – Right" name="rinnes_test_right" value={data.rinnes_test_right} onChange={onChange} readOnly={readOnly} rows={2} />
      </SideBySide>
      <Field label="Weber's test" name="webers_test" value={data.webers_test} onChange={onChange} readOnly={readOnly} rows={2} />
      <Field label="Other tuning fork findings" name="others" value={data.others} onChange={onChange} readOnly={readOnly} rows={2} />
      <SectionLabel>Facial nerve</SectionLabel>
      <YesNo name="left_facial_nerve_paralysis"  label="Left facial nerve paralysis"  value={data.left_facial_nerve_paralysis}  onChange={onChange} readOnly={readOnly} />
      <YesNo name="right_facial_nerve_paralysis" label="Right facial nerve paralysis" value={data.right_facial_nerve_paralysis} onChange={onChange} readOnly={readOnly} />
    </div>
  );
}

function NasalExamStep({ data, onChange, readOnly }) {
  return (
    <div>
      <SectionLabel>Nasal pyramid</SectionLabel>
      <YesNo name="nasal_pyramid_normal"   label="Normal"              value={data.nasal_pyramid_normal}   onChange={onChange} readOnly={readOnly} />
      <YesNo name="nasal_pyramid_deformed" label="Deformed"            value={data.nasal_pyramid_deformed} onChange={onChange} readOnly={readOnly} />
      <YesNo name="patent_nasal_cavity"    label="Patent nasal cavity" value={data.patent_nasal_cavity}    onChange={onChange} readOnly={readOnly} />
      <YesNo name="olfactory_intact"       label="Olfactory intact"    value={data.olfactory_intact}       onChange={onChange} readOnly={readOnly} />
      <SectionLabel>Septum</SectionLabel>
      <YesNo name="septum_central"  label="Central"  value={data.septum_central}  onChange={onChange} readOnly={readOnly} />
      <YesNo name="septum_deviated" label="Deviated" value={data.septum_deviated} onChange={onChange} readOnly={readOnly} />
      <SectionLabel>Bilateral findings</SectionLabel>
      {/*
        NOTE: form stores as "engorged_inferior_turbinates_left/right"
              buildPayload maps these to model's "engorged_inferior_turbinate_left/right"
      */}
      <BilateralYesNo name="engorged_inferior_turbinates" label="Engorged inferior turbinates" values={data} onChange={onChange} readOnly={readOnly} />
      <BilateralYesNo name="otorrhoea"    label="Otorrhoea"    values={data} onChange={onChange} readOnly={readOnly} />
      <BilateralYesNo name="nose_bleeding" label="Nose bleeding" values={data} onChange={onChange} readOnly={readOnly} />
      <BilateralYesNo name="nasal_polyps" label="Nasal polyps"  values={data} onChange={onChange} readOnly={readOnly} />
      <BilateralYesNo name="nasal_mass"   label="Nasal mass"   values={data} onChange={onChange} readOnly={readOnly} />
      <div className="mt-3">
        <Field label="Other findings (specify)" name="other_findings" value={data.other_findings} onChange={onChange} readOnly={readOnly} rows={2} />
      </div>
    </div>
  );
}

function OralExamStep({ data, onChange, readOnly }) {
  const fields = [
    ["good_oral_hygiene",                  "Good oral hygiene"],
    ["halitosis",                          "Halitosis"],
    ["free_labial_buccal_sulci",           "Free labial/buccal sulci"],
    ["free_retromolar_trigone",            "Free retromolar trigone"],
    ["tonsil_normal",                      "Tonsil normal"],
    ["hyperaemia",                         "Hyperaemia"],
    ["exudates",                           "Exudates"],
    ["granular_posterior_pharyngeal_wall", "Granular posterior pharyngeal wall"],
  ];
  return (
    <div>
      {fields.map(([name, label]) => (
        <YesNo key={name} name={name} label={label} value={data[name]} onChange={onChange} readOnly={readOnly} />
      ))}
      <div className="mt-3">
        {/* form key: grade_specify → buildPayload maps to model: grade */}
        <Field label="Grade (specify)" name="grade_specify" value={data.grade_specify} onChange={onChange} readOnly={readOnly} rows={2} />
      </div>
    </div>
  );
}

function NeckExamStep({ data, onChange, readOnly }) {
  return (
    <div>
      <Field label="Cervical lymph nodes – level (specify)" name="cervical_lymph_nodes_level" value={data.cervical_lymph_nodes_level} onChange={onChange} readOnly={readOnly} rows={2} />
      {/* form key: describe_lymph_nodes → buildPayload maps to: lymph_nodes_description */}
      <Field label="Describe lymph nodes" name="describe_lymph_nodes" value={data.describe_lymph_nodes} onChange={onChange} readOnly={readOnly} rows={2} />
      <YesNo name="laryngeal_framework_preserved" label="Laryngeal framework preserved" value={data.laryngeal_framework_preserved} onChange={onChange} readOnly={readOnly} />
      <YesNo name="anterior_neck_mass"            label="Anterior neck mass"            value={data.anterior_neck_mass}            onChange={onChange} readOnly={readOnly} />
      {data.anterior_neck_mass === true && (
        <div className="ml-2 pl-3 border-l-2 border-teal-200 mt-1">
          <Field label="Describe anterior neck mass" name="anterior_neck_mass_description" value={data.anterior_neck_mass_description} onChange={onChange} readOnly={readOnly} rows={2} />
        </div>
      )}
      <YesNo name="lateral_neck_mass" label="Lateral neck mass" value={data.lateral_neck_mass} onChange={onChange} readOnly={readOnly} />
      {data.lateral_neck_mass === true && (
        <div className="ml-2 pl-3 border-l-2 border-teal-200 mt-1">
          <Field label="Describe lateral neck mass" name="lateral_neck_mass_description" value={data.lateral_neck_mass_description} onChange={onChange} readOnly={readOnly} rows={2} />
        </div>
      )}
    </div>
  );
}

function DiagnosisStep({ data, onChange, readOnly }) {
  return (
    <div>
      <Field label="Diagnosis"      name="diagnosis"      value={data.diagnosis}      onChange={onChange} readOnly={readOnly} rows={4} placeholder="Clinical diagnosis…" />
      <Field label="Treatment plan" name="treatment_plan" value={data.treatment_plan} onChange={onChange} readOnly={readOnly} rows={5} placeholder="Management plan…" />
    </div>
  );
}

// ── Step router ───────────────────────────────────────────────────────────────

function renderStepContent({ stepId, data, onChange, readOnly }) {
  const props = { data, onChange, readOnly };
  switch (stepId) {
    case "presenting":   return <PresentingStep  {...props} />;
    case "otologic":     return <OtologicStep    {...props} />;
    case "rhinologic":   return <RhinologicStep  {...props} />;
    case "laryngology":  return <LaryngologyStep {...props} />;
    case "headneck":     return <HeadNeckStep    {...props} />;
    case "pastmedical":  return <PastMedicalStep {...props} />;
    case "drug":         return <DrugStep        {...props} />;
    case "general_exam": return <GeneralExamStep {...props} />;
    case "ear_exam":     return <EarExamStep     {...props} />;
    case "nasal_exam":   return <NasalExamStep   {...props} />;
    case "oral_exam":    return <OralExamStep    {...props} />;
    case "neck_exam":    return <NeckExamStep    {...props} />;
    case "diagnosis":    return <DiagnosisStep   {...props} />;
    default: return null;
  }
}


const ENTClerkingForm = ({
  patientId,
  submitting = false,
  onSubmit,
  onCancel,
  readOnly = false,
  initialData = null,
  isEditMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const [allData, setAllData] = useState(() => {
    if (initialData) {
      const drug = initialData.drug_history ?? {};
      const pastmed = initialData.past_medical_history ?? {};
      const earEx = initialData.ear_examination ?? {};
      const oralEx = initialData.oral_examination ?? {};
      const neckEx = initialData.neck_examination ?? {};
      const nasalEx = initialData.nasal_examination ?? {};
      const genEx = initialData.general_examination ?? {};
      const laryn = initialData.laryngology_history ?? {};

      const generalAppearance = [
        genEx.acutely_ill_looking     && "Acutely ill-looking",
        genEx.chronically_ill_looking && "Chronically ill-looking",
        genEx.dehydrated              && "Dehydrated",
        genEx.pallor                  && "Pallor",
        genEx.cyanosis                && "Cyanosis",
        genEx.lymph_node              && "Lymph node",
        genEx.jaundice                && "Jaundice",
        genEx.weight_loss             && "Weight loss",
        genEx.normal                  && "Normal",
      ].filter(Boolean);

      return {
        presenting: {
          presenting_complaint:            initialData.presenting_complaint            ?? "",
          history_of_presenting_complaint: initialData.history_of_presenting_complaint ?? "",
        },
        otologic:    initialData.otologic_history   ?? {},
        rhinologic:  { ...(initialData.rhinologic_history ?? {}), other: initialData.rhinologic_history?.others ?? "" },
        laryngology: {
          ...laryn,
          feeling_of_lump_in_throat: laryn.lump_in_throat,
        },
        headneck:    initialData.head_neck_history  ?? {},
        pastmedical: {
          ...pastmed,
          history_of_pudx:              pastmed.history_of_pud,
          history_of_hypertension:      pastmed.hypertension,
          history_of_diabetes:          pastmed.diabetes,
          history_of_allergy:           pastmed.allergy,
          history_of_migraine_headache: pastmed.migraine_headache,
          history_of_autoimmune_disease: pastmed.autoimmune_disease,
        },
        drug: {
          history_of_any_medications: drug.on_medications,
          medications_specify:        drug.medications_detail,
          any_drug_allergy:           drug.drug_allergy,
        },
        general_exam: {
          ...genEx,
          general_appearance: generalAppearance,
        },
        ear_exam: {
          ...earEx,
          rinnes_test_left:  earEx.rinne_test_left,
          rinnes_test_right: earEx.rinne_test_right,
          webers_test:       earEx.weber_test,
          others:            earEx.other_tuning_fork_findings,
        },
        nasal_exam: {
          ...nasalEx,
          engorged_inferior_turbinates_left:  nasalEx.engorged_inferior_turbinate_left,
          engorged_inferior_turbinates_right: nasalEx.engorged_inferior_turbinate_right,
        },
        oral_exam: {
          ...oralEx,
          grade_specify: oralEx.grade,
        },
        neck_exam: {
          ...neckEx,
          describe_lymph_nodes: neckEx.lymph_nodes_description,
        },
        diagnosis: {
          diagnosis:      initialData.diagnosis      ?? "",
          treatment_plan: initialData.treatment_plan ?? "",
        },
      };
    }

    // New blank form
    return {
      presenting:   { presenting_complaint: "", history_of_presenting_complaint: "" },
      otologic:     {}, rhinologic:  {}, laryngology: {}, headneck:     {},
      pastmedical:  {}, drug:        {}, general_exam:{}, ear_exam:     {},
      nasal_exam:   {}, oral_exam:   {}, neck_exam:   {}, diagnosis:    {},
    };
  });

  const step     = STEPS[currentStep];
  const isFirst  = currentStep === 0;
  const isLast   = currentStep === STEPS.length - 1;
  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100);

  const handleFieldChange = (field, value) => {
    setAllData(prev => ({
      ...prev,
      [step.id]: { ...prev[step.id], [field]: value },
    }));
  };

  // Build the correctly-mapped payload and pass to parent's onSubmit
  const handleSubmit = () => {
    if (onSubmit) {
      const payload = buildPayload(patientId, allData);
      onSubmit(payload);
    }
  };

  return (
    <div className="flex flex-col" style={{ maxHeight: "80vh" }}>

      {/* ── Step indicator ──────────────────────────────────────────────── */}
      <div className="px-1 pb-4 border-b border-blue-50 shrink-0">
        <div className="flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentStep(i)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                i === currentStep
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-sm"
                  : i < currentStep
                    ? "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300"
                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600"
              }`}
            >
              {i < currentStep && <span className="mr-1 text-teal-500">✓</span>}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Step content ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-5 px-1">
        <h3 className="text-base font-bold text-slate-800 mb-4">{step.label}</h3>
        {renderStepContent({
          stepId:   step.id,
          data:     allData[step.id],
          onChange: handleFieldChange,
          readOnly,
        })}
      </div>

      {/* ── Footer navigation ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 border-t border-blue-50 mt-1 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-medium rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {readOnly ? "Close" : "Cancel"}
        </button>

        <div className="flex items-center gap-2">
  {!isFirst && (
    <button
      type="button"
      onClick={() => setCurrentStep(s => s - 1)}
      disabled={submitting}
      className="px-5 py-2.5 text-slate-600 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 text-sm"
    >
      ← Back
    </button>
  )}

  {!isLast ? (
    <button
      type="button"
      onClick={() => setCurrentStep(s => s + 1)}
      disabled={submitting}
      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
    >
      Next →
    </button>
  ) : !readOnly ? (
    <button
      type="button"
      onClick={handleSubmit}
      disabled={submitting}
      className={`group flex items-center gap-2 px-7 py-2.5 font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm
        ${
          isEditMode
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        }
      `}
    >
      {submitting ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Saving…
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                isEditMode
                  ? "M5 13l4 4L19 7" // check icon (same)
                  : "M5 13l4 4L19 7"
              }
            />
          </svg>

          {isEditMode ? "Update Clerking" : "Submit Clerking"}
        </>
      )}
    </button>
  ) : null}
</div>
      </div>
    </div>
  );
};

export default ENTClerkingForm;