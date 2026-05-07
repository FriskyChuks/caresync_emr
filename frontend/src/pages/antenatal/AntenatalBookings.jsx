// AntenatalBookings.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import AntenatalLayout from './AntenatalLayout';

/* ─── Utility ─── */
const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const calcEDD = (lmp) => addDays(lmp, 280);

const calcGestationalAge = (lmp) => {
  if (!lmp) return { weeks: 0, days: 0, totalDays: 0 };
  const today = new Date();
  const lmpDate = new Date(lmp);
  const totalDays = Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24));
  return {
    weeks: Math.max(0, Math.floor(totalDays / 7)),
    days: Math.max(0, totalDays % 7),
    totalDays: Math.max(0, totalDays),
  };
};

const calcGestationalWeeks = (lmp) => calcGestationalAge(lmp).weeks;

/* ─── Step config ─── */
const STEPS = [
  { label: 'Obstetric History',  color: 'blue',   icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { label: 'Menstrual & Gynae',  color: 'emerald',icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Medical & Family',   color: 'amber',  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Current Pregnancy',  color: 'rose',   icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

const COLOR = {
  blue:    { ring: 'ring-blue-400',    bg: 'bg-blue-600',    light: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700' },
  emerald: { ring: 'ring-emerald-400', bg: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  amber:   { ring: 'ring-amber-400',   bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  dot: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700' },
  rose:    { ring: 'ring-rose-400',    bg: 'bg-rose-600',    light: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',   dot: 'bg-rose-500',    badge: 'bg-rose-100 text-rose-700' },
};

/* ─── Reusable field components ─── */
const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1">{children}</label>
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white ${className}`}
    {...props}
  />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea
    rows={3}
    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white resize-none ${className}`}
    {...props}
  />
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </div>
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

/* ─── Step Components ─── */
const StepObstetric = ({ data, onChange, errors = {} }) => {
  const field = (key) => ({ value: data[key] ?? '', onChange: (e) => onChange(key, e.target.value) });
  const toggle = (key) => ({ checked: !!data[key], onChange: (val) => onChange(key, val) });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Gravida <span className="text-red-400">*</span></Label>
          <Input
            type="number" min="0" placeholder="Total pregnancies"
            {...field('gravida')}
            className={errors.gravida ? 'border-red-400 focus:ring-red-300' : ''}
          />
          {errors.gravida && <p className="text-xs text-red-500 mt-1">{errors.gravida}</p>}
        </div>
        <div>
          <Label>Para <span className="text-red-400">*</span></Label>
          <Input
            type="number" min="0"
            max={data.gravida !== '' && data.gravida !== undefined ? parseInt(data.gravida) : undefined}
            placeholder="Births ≥ 24 wks"
            value={data.para ?? ''}
            onChange={(e) => onChange('para', e.target.value)}
            className={errors.para ? 'border-red-400 focus:ring-red-300' : ''}
          />
          {errors.para && <p className="text-xs text-red-500 mt-1">{errors.para}</p>}
          {data.gravida !== '' && data.gravida !== undefined && (
            <p className="text-xs text-gray-400 mt-1">Max: {data.gravida} (cannot exceed Gravida)</p>
          )}
        </div>
        <div>
          <Label>Abortions</Label>
          <Input type="number" min="0" placeholder="0" {...field('abortions')} />
        </div>
        <div>
          <Label>Living Children</Label>
          <Input type="number" min="0" placeholder="0" {...field('living_children')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Toggle label="Previous C-Section"      {...toggle('previous_c_section')} />
        <Toggle label="Previous Stillbirth"     {...toggle('previous_stillbirth')} />
        <Toggle label="Previous Neonatal Death" {...toggle('previous_neonatal_death')} />
      </div>
      <div>
        <Label>Pregnancy Complications</Label>
        <Textarea placeholder="Describe any previous complications..." {...field('pregnancy_complications')} />
      </div>
      <div>
        <Label>Inter-Pregnancy Interval</Label>
        <Input placeholder="e.g. 2 years" {...field('inter_pregnancy_interval')} />
      </div>
    </div>
  );
};

const StepMenstrual = ({ data, onChange, errors = {} }) => {
  const field = (key) => ({ value: data[key] ?? '', onChange: (e) => onChange(key, e.target.value) });
  const toggle = (key) => ({ checked: !!data[key], onChange: (val) => onChange(key, val) });

  const handleLMP = (e) => {
    const lmp = e.target.value;
    onChange('last_menstrual_period', lmp);
    if (lmp) onChange('estimated_due_date', calcEDD(lmp));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Last Menstrual Period (LMP) <span className="text-red-400">*</span></Label>
          <Input
            type="date" value={data.last_menstrual_period ?? ''} onChange={handleLMP}
            max={new Date().toISOString().split('T')[0]}
            className={errors.last_menstrual_period ? 'border-red-400 focus:ring-red-300' : ''}
          />
          {errors.last_menstrual_period && <p className="text-xs text-red-500 mt-1">{errors.last_menstrual_period}</p>}
        </div>
        <div>
          <Label>Estimated Due Date (EDD)</Label>
          <div className="relative">
            <Input
              type="date" value={data.estimated_due_date ?? ''} readOnly
              className="bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold cursor-not-allowed"
            />
            {data.estimated_due_date && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-medium">Auto</span>
            )}
          </div>
          {data.last_menstrual_period && (() => {
            const ga = calcGestationalAge(data.last_menstrual_period);
            return <p className="text-xs text-emerald-600 mt-1">Gestational age: <strong>{ga.weeks}w {ga.days}d</strong></p>;
          })()}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Cycle Length (days)</Label>
          <Input type="number" min="21" max="45" placeholder="28" {...field('cycle_length')} />
        </div>
        <div className="flex items-end pb-1">
          <Toggle label="Regular Cycle" {...toggle('cycle_regular')} />
        </div>
      </div>
      <div>
        <Label>Contraceptive History</Label>
        <Textarea placeholder="e.g. Previously on combined OCP for 3 years..." {...field('contraceptive_history')} />
      </div>
      <div>
        <Label>Gynecological Conditions</Label>
        <Textarea placeholder="e.g. PCOS, fibroids, endometriosis..." {...field('gynecological_conditions')} />
      </div>
    </div>
  );
};

const StepMedicalFamily = ({ data, onChange }) => {
  const field = (key) => ({ value: data[key] ?? '', onChange: (e) => onChange(key, e.target.value) });
  const toggle = (key) => ({ checked: !!data[key], onChange: (val) => onChange(key, val) });

  return (
    <div className="space-y-4">
      <div>
        <Label>Family Conditions</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { key: 'hypertension', label: 'Hypertension' },
            { key: 'diabetes',     label: 'Diabetes' },
            { key: 'asthma',       label: 'Asthma' },
            { key: 'heart_disease',label: 'Heart Disease' },
          ].map(c => <Toggle key={c.key} label={c.label} {...toggle(c.key)} />)}
        </div>
      </div>
      <div>
        <Label>Allergies</Label>
        <Textarea placeholder="Known drug or food allergies..." {...field('allergies')} />
      </div>
      <div>
        <Label>Family Genetic Disorders</Label>
        <Textarea placeholder="e.g. Sickle cell, Down syndrome in family..." {...field('family_genetic_disorders')} />
      </div>
      <div>
        <Label>Other Medical Conditions</Label>
        <Textarea placeholder="Any other significant medical history..." {...field('other_medical_conditions')} />
      </div>
    </div>
  );
};

const StepCurrentPregnancy = ({ data, onChange, lmp }) => {
  const field = (key) => ({ value: data[key] ?? '', onChange: (e) => onChange(key, e.target.value) });
  const toggle = (key) => ({ checked: !!data[key], onChange: (val) => onChange(key, val) });

  const autoWeeks = lmp ? calcGestationalWeeks(lmp) : null;

  useEffect(() => {
    if (autoWeeks !== null && !data.gestational_age_weeks) {
      onChange('gestational_age_weeks', autoWeeks);
    }
  }, [autoWeeks]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Gestational Age (weeks)</Label>
          <div className="relative">
            <Input
              type="number" min="0" max="45"
              value={data.gestational_age_weeks ?? autoWeeks ?? ''}
              onChange={(e) => onChange('gestational_age_weeks', e.target.value)}
              className={autoWeeks !== null ? 'bg-rose-50 border-rose-200' : ''}
            />
            {autoWeeks !== null && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-rose-500">Auto</span>
            )}
          </div>
          {autoWeeks !== null && (() => {
            const ga = calcGestationalAge(lmp);
            return <p className="text-xs text-rose-500 mt-1">{ga.weeks}w {ga.days}d from LMP. You can override.</p>;
          })()}
        </div>
        <div>
          <Label>Number of Fetuses</Label>
          <Input type="number" min="1" max="8" placeholder="1" {...field('number_of_fetuses')} />
        </div>
      </div>
      <div>
        <Label>Presenting Complaints</Label>
        <Textarea placeholder="e.g. Nausea, vomiting, swelling..." {...field('presenting_complaints')} />
      </div>
      <div>
        <Label>Current Medications</Label>
        <Textarea placeholder="List any current medications..." {...field('medications')} />
      </div>
      <div>
        <Label>Supplements</Label>
        <Textarea placeholder="e.g. Folic acid, iron, calcium..." {...field('supplements')} />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-1">
        <Toggle label="Smoking"     {...toggle('smoking')} />
        <Toggle label="Alcohol Use" {...toggle('alcohol')} />
      </div>
    </div>
  );
};

/* ─── Review Summary ─── */
const ReviewRow = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  return (
    <div className="flex justify-between items-start py-1 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 shrink-0 w-44">{label}</span>
      <span className="text-xs text-gray-800 font-medium text-right">{display}</span>
    </div>
  );
};

/* ─── Main Component ─── */
const AntenatalBookings = () => {
  const { pid } = useParams();
  const navigate = useNavigate();

  const [step, setStep]           = useState(0);
  const [patient, setPatient]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');
  const [stepErrors, setStepErrors] = useState({});

  // ── GATE: checked on mount — if patient already has an active booking, block the form ──
  const [bookingBlocked, setBookingBlocked] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(true);

  const [obstetric, setObstetric] = useState({
    abortions: 0, living_children: 0,
    previous_c_section: false, previous_stillbirth: false, previous_neonatal_death: false,
  });
  const [menstrual, setMenstrual]   = useState({ cycle_regular: true });
  const [medFamily, setMedFamily]   = useState({ hypertension: false, diabetes: false, asthma: false, heart_disease: false });
  const [pregnancy, setPregnancy]   = useState({ number_of_fetuses: 1, smoking: false, alcohol: false });

  const setters = [
    (k, v) => setObstetric(p => ({ ...p, [k]: v })),
    (k, v) => setMenstrual(p => ({ ...p, [k]: v })),
    (k, v) => setMedFamily(p => ({ ...p, [k]: v })),
    (k, v) => setPregnancy(p => ({ ...p, [k]: v })),
  ];

  // ── Fetch patient info AND check for an active booking on mount ──
  useEffect(() => {
    if (!pid) return;
    const patient_id = parseInt(pid);

    Promise.all([
      axiosInstance.get(`/patientsapi/patient_detail/${patient_id}/`),
      axiosInstance.get(`/anc_specialtyapi/obstetric-history/?patient=${patient_id}`).catch(() => ({ data: [] })),
    ]).then(([patRes, obsRes]) => {
      setPatient(patRes.data);

      const allObs = Array.isArray(obsRes.data)
        ? obsRes.data
        : obsRes.data?.results ?? [];

      const hasActive = allObs.some((o) => o.is_active === true);
      setBookingBlocked(hasActive);
    }).catch(console.error).finally(() => setCheckingBooking(false));
  }, [pid]);

  const isLastStep = step === STEPS.length - 1;

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      const gravida = parseInt(obstetric.gravida);
      const para    = parseInt(obstetric.para);
      if (obstetric.gravida === '' || obstetric.gravida === undefined || isNaN(gravida))
        errs.gravida = 'Gravida is required.';
      if (obstetric.para === '' || obstetric.para === undefined || isNaN(para))
        errs.para = 'Para is required.';
      else if (!isNaN(gravida) && para > gravida)
        errs.para = `Para (${para}) cannot be greater than Gravida (${gravida}).`;
    }
    if (step === 1) {
      if (!menstrual.last_menstrual_period)
        errs.last_menstrual_period = 'LMP is required.';
    }
    setStepErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };
  console.log("patient", patient, "pid", pid);
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setError('');

    try {
      const patient_id = parseInt(pid);

      // ── Always POST — never PATCH for a new booking ──
      // The serializer will reject if an active booking already exists.
      await axiosInstance.post(`/anc_specialtyapi/obstetric-history/`, {
        patient:                 patient_id,
        gravida:                 parseInt(obstetric.gravida)         || 0,
        para:                    parseInt(obstetric.para)            || 0,
        abortions:               parseInt(obstetric.abortions)       || 0,
        living_children:         parseInt(obstetric.living_children) || 0,
        previous_c_section:      Boolean(obstetric.previous_c_section),
        previous_stillbirth:     Boolean(obstetric.previous_stillbirth),
        previous_neonatal_death: Boolean(obstetric.previous_neonatal_death),
        pregnancy_complications: obstetric.pregnancy_complications   || '',
        inter_pregnancy_interval:obstetric.inter_pregnancy_interval  || '',
        is_active:               true,
      });

      await axiosInstance.post(`/anc_specialtyapi/menstrual-history/`, {
        patient:                  patient_id,
        last_menstrual_period:    menstrual.last_menstrual_period,
        estimated_due_date:       menstrual.estimated_due_date || calcEDD(menstrual.last_menstrual_period),
        cycle_length:             menstrual.cycle_length ? parseInt(menstrual.cycle_length) : null,
        cycle_regular:            Boolean(menstrual.cycle_regular),
        contraceptive_history:    menstrual.contraceptive_history    || '',
        gynecological_conditions: menstrual.gynecological_conditions || '',
      });

      await axiosInstance.post(`/anc_specialtyapi/medical-history/`, {
        patient:                  patient_id,
        hypertension:             Boolean(medFamily.hypertension),
        diabetes:                 Boolean(medFamily.diabetes),
        asthma:                   Boolean(medFamily.asthma),
        heart_disease:            Boolean(medFamily.heart_disease),
        allergies:                medFamily.allergies                || '',
        family_genetic_disorders: medFamily.family_genetic_disorders || '',
        other_medical_conditions: medFamily.other_medical_conditions || '',
      });

      await axiosInstance.post(`/anc_specialtyapi/current-pregnancy/`, {
        patient:               patient_id,
        gestational_age_weeks: parseInt(pregnancy.gestational_age_weeks) ||
                               calcGestationalWeeks(menstrual.last_menstrual_period),
        number_of_fetuses:     parseInt(pregnancy.number_of_fetuses) || 1,
        presenting_complaints: pregnancy.presenting_complaints || '',
        medications:           pregnancy.medications           || '',
        supplements:           pregnancy.supplements           || '',
        smoking:               Boolean(pregnancy.smoking),
        alcohol:               Boolean(pregnancy.alcohol),
      });

      setSubmitted(true);

    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      const detail = err.response?.data;

      // Surface the "already has active booking" message prominently
      if (detail?.non_field_errors) {
        setError(detail.non_field_errors.join(' '));
      } else if (typeof detail === 'object' && detail !== null) {
        const msg = Object.entries(detail)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        setError(msg);
      } else {
        setError('Submission failed. Please check all fields and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Loading state while we check for active booking ─── */
  if (checkingBooking) {
    return (
      <AntenatalLayout>
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3">
          <div className="relative w-12 h-12">
            <div className="w-12 h-12 border-4 border-blue-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-blue-600 font-medium">Checking booking status…</p>
        </div>
      </AntenatalLayout>
    );
  }

  /* ─── BLOCKED: active booking already exists ─── */
  if (bookingBlocked) {
    return (
      <AntenatalLayout>
        <div className="max-w-lg mx-auto mt-10 text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg border border-amber-100">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Booking Already Exists</h2>
          <p className="text-sm text-gray-500">
            {patient?.first_name} {patient?.last_name} already has an <strong>active antenatal booking</strong>.
            A new booking can only be created after the current pregnancy has been delivered and the booking is closed.
          </p>
          <button
            onClick={() => navigate(`/antenatal-dashboard/${pid}`)}
            className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </AntenatalLayout>
    );
  }

  /* ─── SUCCESS screen ─── */
  if (submitted) {
    return (
      <AntenatalLayout>
        <div className="max-w-lg mx-auto mt-10 text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg border border-emerald-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Registration Complete</h2>
          <p className="text-sm text-gray-500">
            {patient?.first_name} {patient?.last_name} has been successfully registered for antenatal care.
          </p>
          <button
            onClick={() => navigate(`/antenatal-dashboard/${pid}`)}
            className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </AntenatalLayout>
    );
  }

  const stepColor = COLOR[STEPS[step].color];

  return (
    <AntenatalLayout>
      <div className="space-y-4 p-2">

        {/* Patient badge */}
        {patient && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              {patient.first_name?.[0]}{patient.last_name?.[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{patient.first_name} {patient.last_name}</p>
              <p className="text-xs text-gray-400">PID: {pid} · New Antenatal Registration</p>
            </div>
          </div>
        )}

        {/* Progress stepper */}
        <div className="flex items-center gap-1 px-1">
          {STEPS.map((s, i) => {
            const c = COLOR[s.color];
            const done   = i < step;
            const active = i === step;
            return (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${done ? c.bg + ' text-white' : active ? 'ring-2 ' + c.ring + ' ' + c.light + ' ' + c.text : 'bg-gray-100 text-gray-400'}`}>
                    {done
                      ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                      : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} /></svg>
                    }
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? c.text : done ? 'text-gray-500' : 'text-gray-300'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${i < step ? 'bg-blue-400' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form card */}
        <div className={`bg-white border ${stepColor.border} rounded-2xl shadow-sm overflow-hidden`}>
          <div className={`${stepColor.light} border-b ${stepColor.border} px-5 py-3 flex items-center gap-2`}>
            <div className={`p-1.5 ${stepColor.bg} rounded-lg`}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={STEPS[step].icon} />
              </svg>
            </div>
            <div>
              <h2 className={`text-sm font-bold ${stepColor.text}`}>Step {step + 1} of {STEPS.length}: {STEPS[step].label}</h2>
              <p className="text-xs text-gray-400">Fill in the details below</p>
            </div>
            <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${stepColor.badge}`}>
              {Math.round((step / STEPS.length) * 100)}% done
            </span>
          </div>

          <div className="p-5">
            {step === 0 && <StepObstetric        data={obstetric} onChange={setters[0]} errors={stepErrors} />}
            {step === 1 && <StepMenstrual        data={menstrual} onChange={setters[1]} errors={stepErrors} />}
            {step === 2 && <StepMedicalFamily    data={medFamily} onChange={setters[2]} />}
            {step === 3 && <StepCurrentPregnancy data={pregnancy} onChange={setters[3]} lmp={menstrual.last_menstrual_period} />}
          </div>
        </div>

        {/* Review summary – visible on last step */}
        {isLastStep && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Summary Review
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <p className="text-xs font-semibold text-blue-600 mb-1">Obstetric</p>
                <ReviewRow label="Gravida"                 value={obstetric.gravida} />
                <ReviewRow label="Para"                    value={obstetric.para} />
                <ReviewRow label="Abortions"               value={obstetric.abortions} />
                <ReviewRow label="Living Children"         value={obstetric.living_children} />
                <ReviewRow label="Previous C-Section"      value={obstetric.previous_c_section} />
                <ReviewRow label="Previous Stillbirth"     value={obstetric.previous_stillbirth} />
                <ReviewRow label="Previous Neonatal Death" value={obstetric.previous_neonatal_death} />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-600 mb-1">Menstrual</p>
                <ReviewRow label="LMP"           value={menstrual.last_menstrual_period} />
                <ReviewRow label="EDD"           value={menstrual.estimated_due_date} />
                <ReviewRow label="Cycle Regular" value={menstrual.cycle_regular} />
                <ReviewRow label="Cycle Length"  value={menstrual.cycle_length ? menstrual.cycle_length + ' days' : undefined} />
                <p className="text-xs font-semibold text-amber-600 mb-1 mt-3">Medical / Family</p>
                <ReviewRow label="Hypertension"  value={medFamily.hypertension} />
                <ReviewRow label="Diabetes"      value={medFamily.diabetes} />
                <ReviewRow label="Asthma"        value={medFamily.asthma} />
                <ReviewRow label="Heart Disease" value={medFamily.heart_disease} />
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-rose-600 mb-1">Current Pregnancy</p>
                <div className="grid grid-cols-2 gap-x-6">
                  <ReviewRow label="Gestational Age"   value={pregnancy.gestational_age_weeks ? pregnancy.gestational_age_weeks + ' weeks' : undefined} />
                  <ReviewRow label="Number of Fetuses" value={pregnancy.number_of_fetuses} />
                  <ReviewRow label="Smoking"           value={pregnancy.smoking} />
                  <ReviewRow label="Alcohol"           value={pregnancy.alcohol} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => { setStepErrors({}); setStep(s => s - 1); }}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Registration
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </AntenatalLayout>
  );
};

export default AntenatalBookings;