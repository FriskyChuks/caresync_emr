import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useMessage } from '../../context/MessageProvider';
import { data, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const PatientRegistration = ({ baseURL }) => {
  const { user } = useAuth();
  const { showMessage } = useMessage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [basicInfo, setBasicInfo] = useState({
    first_name: '',last_name: '',other_name: '',username: '',email: '',phone: '',
    date_of_birth: '',age: '',maturity: '',occupation: '',gender: '',marital_status: '',
    religion: '',password: 'default123',re_password: 'default123',
  });

  const [contactDetails, setContactDetails] = useState({
    phone1: '',
    phone2: '',
    country: '',
    national_id: '',
    state_of_origin: '',
    local_government_area: '',
    address: '',
    town: '',
    permanent_address: '',
    state_of_residence: '',
    local_government_area_of_residence: '',
    permanent_town: '',
  });

  const [nextOfKin, setNextOfKin] = useState({
    full_names: '',
    phone_no: '',
    address: '',
    email: '',
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [genders, setGenders] = useState([]);
  const [maritalStatuses, setMaritalStatuses] = useState([]);
  const [religions, setReligions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const maturityChoices = [
    { value: 'adult', label: 'Adult' },
    { value: 'neonate', label: 'Neonate' },
    { value: 'child', label: 'Child' },
  ];

  useEffect(() => {
    const apiBase = baseURL || 'http://127.0.0.1:8000';

    axiosInstance
      .get(`${apiBase}/accountapi/gender/`)
      .then((res) => setGenders(res.data))
      .catch((err) => console.error('Error fetching genders:', err));

    axiosInstance
      .get(`${apiBase}/accountapi/marital_status`)
      .then((res) => setMaritalStatuses(res.data))
      .catch((err) => console.error('Error fetching marital statuses:', err));

    axiosInstance
      .get(`${apiBase}/accountapi/religion/`)
      .then((res) => setReligions(res.data))
      .catch((err) => console.error('Error fetching religions:', err));

    axiosInstance
      .get(`${apiBase}/contactsapi/countries/`)
      .then((res) => setCountries(res.data))
      .catch((err) => console.error('Error fetching countries:', err));

    axiosInstance
      .get(`${apiBase}/contactsapi/states/`)
      .then((res) => setStates(res.data))
      .catch((err) => console.error('Error fetching states:', err));

    axiosInstance
      .get(`${apiBase}/contactsapi/lgas/`)
      .then((res) => setLgas(res.data))
      .catch((err) => console.error('Error fetching lgas:', err));
  }, [baseURL]);

  // ---------- helpers ----------
  function getMaturity(age) {
    if (age === '' || age === null) return '';
    if (age < 1) return 'neonate';
    if (age >= 1 && age < 18) return 'child';
    if (age >= 18) return 'adult';
    return '';
  }

  // Recursively remove undefined/null/"" (but keep false/0)
  const compactDeep = (value) => {
    if (Array.isArray(value)) {
      const arr = value.map(compactDeep).filter((v) => v !== undefined);
      return arr.length ? arr : undefined;
    }
    if (value && typeof value === 'object') {
      const out = {};
      Object.entries(value).forEach(([k, v]) => {
        const next = compactDeep(v);
        if (next !== undefined && next !== null && next !== '') out[k] = next;
      });
      return Object.keys(out).length ? out : undefined;
    }
    if (value === '') return undefined;
    return value;
  };

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date_of_birth') {
      const birthDate = new Date(value);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }

      const maturity = getMaturity(age);

      setBasicInfo((prev) => ({
        ...prev,
        date_of_birth: value,
        age: age >= 0 ? age : '',
        maturity,
      }));
    } else {
      setBasicInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleContactDetailsChange = (e) => {
    const { name, value } = e.target;
    setContactDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextOfKinChange = (e) => {
    const { name, value } = e.target;
    setNextOfKin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setPhotoPreview(evt.target.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleEmergencyChange = (e) => {
    const checked = e.target.checked;
    setIsEmergency(checked);

    if (checked) {
      setBasicInfo((prev) => ({
        ...prev,
        other_name: '',
        username: '',
        email: '',
        occupation: '',
        gender: '',
        marital_status: '',
        religion: '',
        maturity: 'adult',
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!basicInfo.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!basicInfo.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!basicInfo.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!basicInfo.date_of_birth.trim()) newErrors.date_of_birth = 'Date of birth is required';
      if (!isEmergency && !basicInfo.username.trim()) newErrors.username = 'Username is required';
    } else if (step === 2) {
      if (!isEmergency) {
        if (!contactDetails.address.trim()) newErrors.address = 'Residential address is required';
        if (!contactDetails.permanent_address.trim())
          newErrors.permanent_address = 'Permanent address is required';
        if (!contactDetails.state_of_residence)
          newErrors.state_of_residence = 'State of residence is required';
      }
    } else if (step === 3) {
      if (!isEmergency) {
        if (!nextOfKin.full_names.trim()) newErrors.full_names = 'Full name is required';
        if (!nextOfKin.phone_no.trim()) newErrors.phone_no = 'Phone number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      setErrors({});
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const buildPayload = () => {
    // username for emergency if not provided
    const emergencyUsername =
      basicInfo.first_name?.trim()
        ? `${basicInfo.first_name.toLowerCase()}_emergency_${Date.now().toString().slice(-4)}`
        : `emergency_${Date.now().toString().slice(-6)}`;

    const base = {
      username: isEmergency ? basicInfo.username || emergencyUsername : basicInfo.username,
      first_name: basicInfo.first_name,
      last_name: basicInfo.last_name,
      other_name: isEmergency ? undefined : basicInfo.other_name,
      email: isEmergency ? undefined : basicInfo.email,
      password: basicInfo.password || 'default123',
      re_password: basicInfo.re_password || basicInfo.password || 'default123',
      gender: isEmergency ? undefined : basicInfo.gender || undefined,

      patient: {
        date_of_birth: basicInfo.date_of_birth || undefined,
        age: basicInfo.age || undefined,
        phone: basicInfo.phone,
        occupation: isEmergency ? undefined : basicInfo.occupation || undefined,
        status: (isEmergency ? 'adult' : basicInfo.maturity) || 'adult',
        created_by: user?.id || undefined,
        religion: isEmergency ? undefined : basicInfo.religion || undefined,
        marital_status: isEmergency ? undefined : basicInfo.marital_status || undefined,
      },
    };

    if (!isEmergency) {
      base.residential_address = {
        phone1: contactDetails.phone1 || undefined,
        phone2: contactDetails.phone2 || undefined,
        country: contactDetails.country || undefined,
        // Keep national_id as string to preserve leading zeros
        national_id: contactDetails.national_id || undefined,
        state_of_origin: contactDetails.state_of_origin || undefined,
        local_government_area: contactDetails.local_government_area || undefined,
        address: contactDetails.address || undefined,
        town: contactDetails.town || undefined,
      };

      base.permanent_address = {
        address: contactDetails.permanent_address || undefined,
        state_of_residence: contactDetails.state_of_residence || undefined,
        local_government_area_of_residence:
          contactDetails.local_government_area_of_residence || undefined,
        town: contactDetails.permanent_town || undefined,
      };

      base.next_of_kin = {
        full_names: nextOfKin.full_names || undefined,
        phone_no: nextOfKin.phone_no || undefined,
        address: nextOfKin.address || undefined,
        email: nextOfKin.email || undefined,
      };
    }

    // remove empties/undefined/null
    return compactDeep(base);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const payload = buildPayload();

      // DEBUG if needed:
      // console.log('Submitting payload:', JSON.stringify(payload, null, 2));

      const { data: created } = await axiosInstance.post('/auth/users/', payload);

      // `created` should be hydrated with:
      //  - patient_data (always)
      //  - residential_address_data, permanent_address_data, next_of_kin_data (when provided)

      // You can use `created` immediately here (e.g., navigate or store it)
      // console.log('Created user:', created);
      // console.log('Created patient data:', created.patient_data);
      showMessage('Registration successful!', 'success');
      navigate(`/patient-summary/${created.patient_data.id}/`);

      // reset
      setTimeout(() => {
        setCurrentStep(1);
        setBasicInfo({
          first_name: '',
          last_name: '',
          other_name: '',
          username: '',
          email: '',
          phone: '',
          date_of_birth: '',
          age: '',
          maturity: '',
          occupation: '',
          gender: '',
          marital_status: '',
          religion: '',
          password: 'default123',
          re_password: 'default123',
        });
        setContactDetails({
          phone1: '',
          phone2: '',
          country: '',
          national_id: '',
          state_of_origin: '',
          local_government_area: '',
          address: '',
          town: '',
          permanent_address: '',
          state_of_residence: '',
          local_government_area_of_residence: '',
          permanent_town: '',
        });
        setNextOfKin({
          full_names: '',
          phone_no: '',
          address: '',
          email: '',
        });
        setPhoto(null);
        setPhotoPreview(null);
        setIsEmergency(false);
        setErrors({});
      }, 300);
    } catch (error) {
      console.error('Registration failed:', error);
      const apiErrors = error?.response?.data;

      // try to surface nested errors nicely
      let msg = 'Registration failed. Please check the form.';
      if (apiErrors) {
        const lines = [];

        // top-level errors
        Object.entries(apiErrors).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            v.forEach((m) => lines.push(`${k}: ${m}`));
          } else if (v && typeof v === 'object') {
            // nested object (patient, addresses, etc.)
            Object.entries(v).forEach(([nk, nv]) => {
              if (Array.isArray(nv)) nv.forEach((m) => lines.push(`${k}.${nk}: ${m}`));
            });
          }
        });

        if (lines.length) msg = lines.join(' | ');
      }

      showMessage(msg, 'error');
      setErrors((prev) => ({ ...prev, api: apiErrors || { detail: 'Unknown error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- UI renderers ----------
  const renderStepIndicator = () => (
    <div className="mb-4">
      <div className="row">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="col-3">
            <div className="text-center">
              <div
                className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                  currentStep >= step ? 'bg-primary text-white' : 'bg-light text-muted'
                }`}
                style={{ width: '40px', height: '40px' }}
              >
                {step}
              </div>
              <div
                className={`mt-2 small ${
                  currentStep >= step ? 'text-primary fw-bold' : 'text-muted'
                }`}
              >
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Contact Details'}
                {step === 3 && 'Next of Kin'}
                {step === 4 && 'Upload Photo'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div key="basic-info">
      {/* Emergency Checkbox */}
      <div className="mb-4">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="isEmergency"
            checked={isEmergency}
            onChange={handleEmergencyChange}
          />
          <label className="form-check-label fw-bold text-danger" htmlFor="isEmergency">
            Is Emergency
          </label>
        </div>
      </div>

      <div className="row gx-4">
        {/* First Name */}
        <div className="col-xxl-3 col-lg-4 col-sm-6">
          <div className="mb-3">
            <label className="form-label" htmlFor="first_name">
              First Name <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ri-account-circle-line"></i>
              </span>
              <input
                type="text"
                className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                id="first_name"
                name="first_name"
                value={basicInfo.first_name}
                onChange={handleBasicInfoChange}
                placeholder="Enter First Name"
                required
              />
              {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
            </div>
          </div>
        </div>

        {/* Last Name */}
        <div className="col-xxl-3 col-lg-4 col-sm-6">
          <div className="mb-3">
            <label className="form-label" htmlFor="last_name">
              Last Name <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ri-account-circle-line"></i>
              </span>
              <input
                type="text"
                className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                id="last_name"
                name="last_name"
                value={basicInfo.last_name}
                onChange={handleBasicInfoChange}
                placeholder="Enter Last Name"
                required
              />
              {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
            </div>
          </div>
        </div>

        {/* Other Name */}
        {!isEmergency && (
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="other_name">
                Other Name
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-account-circle-line"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="other_name"
                  name="other_name"
                  value={basicInfo.other_name}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter Other Name"
                />
              </div>
            </div>
          </div>
        )}

        {/* Username */}
        {!isEmergency && (
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="username">
                Username <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-secure-payment-line"></i>
                </span>
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  id="username"
                  name="username"
                  value={basicInfo.username}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter Username"
                  required
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Email */}
        {!isEmergency && (
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="email">
                Email ID{' '}
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-mail-open-line"></i>
                </span>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={basicInfo.email}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter Email ID"
                  required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Phone */}
        <div className="col-xxl-3 col-lg-4 col-sm-6">
          <div className="mb-3">
            <label className="form-label" htmlFor="phone">
              Phone Number <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ri-phone-line"></i>
              </span>
              <input
                type="tel"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                id="phone"
                name="phone"
                value={basicInfo.phone}
                onChange={handleBasicInfoChange}
                placeholder="Enter Phone Number"
                required
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="col-xxl-3 col-lg-4 col-sm-6">
          <div className="mb-3">
            <label className="form-label" htmlFor="date_of_birth">
              Date of Birth <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ri-flower-line"></i>
              </span>
              <input
                type="date"
                className={`form-control ${errors.date_of_birth ? 'is-invalid' : ''}`}
                id="date_of_birth"
                name="date_of_birth"
                value={basicInfo.date_of_birth}
                onChange={handleBasicInfoChange}
                required
              />
              {errors.date_of_birth && <div className="invalid-feedback">{errors.date_of_birth}</div>}
            </div>
          </div>
        </div>

        {/* Age */}
        <div className="col-xxl-3 col-lg-4 col-sm-6">
          <div className="mb-3">
            <label className="form-label" htmlFor="age">Age</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ri-calendar-2-line"></i>
              </span>
              <input
                type="number"
                min="0"
                className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                id="age"
                name="age"
                value={basicInfo.age}
                onChange={handleBasicInfoChange}
                placeholder="Enter Age"
                required
                disabled
              />
              {errors.age && <div className="invalid-feedback">{errors.age}</div>}
            </div>
          </div>
        </div>

        {/* Maturity */}
        <div className="col-xxl-3 col-lg-4 col-sm-6">
          <div className="mb-3">
            <label className="form-label" htmlFor="maturity">Maturity</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ri-user-2-line"></i>
              </span>
              <select
                className={`form-select ${errors.maturity ? 'is-invalid' : ''}`}
                id="maturity"
                name="maturity"
                value={basicInfo.maturity}
                onChange={handleBasicInfoChange}
                required
                disabled
              >
                <option key="placeholder" value="">Select Maturity</option>
                {maturityChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
              {errors.maturity && <div className="invalid-feedback">{errors.maturity}</div>}
            </div>
          </div>
        </div>

        {/* Occupation */}
        {!isEmergency && (
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="occupation">Occupation</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-copper-diamond-line"></i>
                </span>
                <input
                  type="text"
                  className={`form-control ${errors.occupation ? 'is-invalid' : ''}`}
                  id="occupation"
                  name="occupation"
                  value={basicInfo.occupation}
                  onChange={handleBasicInfoChange}
                  placeholder="Enter Occupation"
                />
                {errors.occupation && <div className="invalid-feedback">{errors.occupation}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Gender */}
        {!isEmergency && (
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label">Gender</label>
              <div className="m-0">
                {genders.map((gender) => (
                  <div className="form-check form-check-inline" key={gender.id}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id={`gender${gender.id}`}
                      value={gender.id}
                      checked={String(basicInfo.gender) === String(gender.id)}
                      onChange={handleBasicInfoChange}
                    />
                    <label className="form-check-label" htmlFor={`gender${gender.id}`}>
                      {gender.title}
                    </label>
                  </div>
                ))}
              </div>
              {errors.gender && <div className="text-danger small">{errors.gender}</div>}
            </div>
          </div>
        )}

        {/* Marital Status */}
        {!isEmergency && maritalStatuses.length > 0 && (
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="marital_status">Marital Status</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-vip-crown-2-line"></i>
                </span>
                <select
                  className={`form-select ${errors.marital_status ? 'is-invalid' : ''}`}
                  id="marital_status"
                  name="marital_status"
                  value={basicInfo.marital_status}
                  onChange={handleBasicInfoChange}
                >
                  <option key="placeholder" value="">Select Marital Status</option>
                  {maritalStatuses.map((ms) => (
                    <option key={ms.id} value={ms.id}>
                      {ms.title}
                    </option>
                  ))}
                </select>
                {errors.marital_status && (
                  <div className="invalid-feedback">{errors.marital_status}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Religion */}
        {!isEmergency && (
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="religion">Religion</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-vip-crown-2-line"></i>
                </span>
                <select
                  className="form-select"
                  id="religion"
                  name="religion"
                  value={basicInfo.religion}
                  onChange={handleBasicInfoChange}
                >
                  <option key="placeholder" value="">Select Religion</option>
                  {religions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderContactDetails = () => (
    <div key="contact-details">
      {/* Residential Address */}
      <div className="mb-5">
        <h5 className="mb-3 text-primary">Residential Address</h5>
        <div className="row gx-4">
          {/* Country */}
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="country">Country</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-global-line"></i>
                </span>
                {countries.length > 0 ? (
                  <select
                    className={`form-select ${errors.country ? 'is-invalid' : ''}`}
                    id="country"
                    name="country"
                    value={contactDetails.country}
                    onChange={handleContactDetailsChange}
                    required
                  >
                    <option key="country-placeholder" value="">
                      Select Country
                    </option>
                    {countries.map((country) => (
                      <option key={`country-${country.value}`} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select className="form-select" disabled>
                    <option>Loading countries...</option>
                  </select>
                )}
                {errors.country && <div className="invalid-feedback">{errors.country}</div>}
              </div>
            </div>
          </div>

          {/* State of Origin */}
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="state_of_origin">
                State<span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-map-pin-line"></i>
                </span>
                {states.length > 0 ? (
                  <select
                    className={`form-select ${errors.state_of_origin ? 'is-invalid' : ''}`}
                    id="state_of_origin"
                    name="state_of_origin"
                    value={contactDetails.state_of_origin}
                    onChange={handleContactDetailsChange}
                    required
                  >
                    <option key="residential-placeholder" value="">
                      Select State
                    </option>
                    {states.map((state) => (
                      <option key={`residential-${state.id}`} value={state.id}>
                        {state.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select className="form-select" disabled>
                    <option>Loading states...</option>
                  </select>
                )}
                {errors.state_of_origin && (
                  <div className="invalid-feedback">{errors.state_of_origin}</div>
                )}
              </div>
            </div>
          </div>

          {/* LGA */}
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="local_government_area_of_residence">
                Local Government Area <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-community-line"></i>
                </span>
                {lgas.length > 0 ? (
                  <select
                    className="form-select"
                    id="local_government_area_of_residence"
                    name="local_government_area_of_residence"
                    value={contactDetails.local_government_area_of_residence}
                    onChange={handleContactDetailsChange}
                  >
                    <option key="residential-lga-placeholder" value="">
                      Select LGA
                    </option>
                    {lgas.map((lga) => (
                      <option key={`residential-lga-${lga.id}`} value={lga.id}>
                        {lga.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select className="form-select" disabled>
                    <option>Loading LGAs...</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Town */}
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="town">Town</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-building-line"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="town"
                  name="town"
                  value={contactDetails.town}
                  onChange={handleContactDetailsChange}
                  placeholder="Enter town"
                />
              </div>
            </div>
          </div>

          {/* National ID */}
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="national_id">
                National ID <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-fingerprint-line"></i>
                </span>
                <input
                  type="text"
                  className={`form-control ${errors.national_id ? 'is-invalid' : ''}`}
                  id="national_id"
                  name="national_id"
                  value={contactDetails.national_id}
                  onChange={handleContactDetailsChange}
                  placeholder="Enter National ID"
                  required
                />
                {errors.national_id && <div className="invalid-feedback">{errors.national_id}</div>}
              </div>
            </div>
          </div>

          {/* Phone 1 */}
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="phone1">
                Phone 1 <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-fingerprint-line"></i>
                </span>
                <input
                  type="text"
                  className={`form-control ${errors.phone1 ? 'is-invalid' : ''}`}
                  id="phone1"
                  name="phone1"
                  value={contactDetails.phone1}
                  onChange={handleContactDetailsChange}
                  placeholder="Enter your Phone number 1"
                  required
                />
                {errors.phone1 && <div className="invalid-feedback">{errors.phone1}</div>}
              </div>
            </div>
          </div>

          {/* Phone 2 */}
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="phone2">Phone 2</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-fingerprint-line"></i>
                </span>
                <input
                  type="text"
                  className={`form-control ${errors.phone2 ? 'is-invalid' : ''}`}
                  id="phone2"
                  name="phone2"
                  value={contactDetails.phone2}
                  onChange={handleContactDetailsChange}
                  placeholder="Enter Phone number 2"
                />
                {errors.phone2 && <div className="invalid-feedback">{errors.phone2}</div>}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="col-xxl-6 col-lg-8 col-sm-12">
            <div className="mb-3">
              <label className="form-label" htmlFor="address">
                Address <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-home-line"></i>
                </span>
                <input
                  type="text"
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  id="address"
                  name="address"
                  value={contactDetails.address}
                  onChange={handleContactDetailsChange}
                  placeholder="Enter residential address"
                  required
                />
                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div className="mb-5">
        <h5 className="mb-3 text-primary">Permanent Address</h5>
        <div className="row gx-4">
          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="state_of_residence">
                State<span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-map-pin-2-line"></i>
                </span>
                {states.length > 0 ? (
                  <select
                    className={`form-select ${errors.state_of_residence ? 'is-invalid' : ''}`}
                    id="state_of_residence"
                    name="state_of_residence"
                    value={contactDetails.state_of_residence}
                    onChange={handleContactDetailsChange}
                    required
                  >
                    <option key="permanent-placeholder" value="">
                      Select State
                    </option>
                    {states.map((state) => (
                      <option key={`permanent-${state.id}`} value={state.id}>
                        {state.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select className="form-select" disabled>
                    <option>Loading states...</option>
                  </select>
                )}
                {errors.state_of_residence && (
                  <div className="invalid-feedback">{errors.state_of_residence}</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="local_government_area">
                Local Government Area
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-community-line"></i>
                </span>
                {lgas.length > 0 ? (
                  <select
                    className="form-select"
                    id="local_government_area"
                    name="local_government_area"
                    value={contactDetails.local_government_area}
                    onChange={handleContactDetailsChange}
                  >
                    <option key="permanent-lga-placeholder" value="">
                      Select LGA
                    </option>
                    {lgas.map((lga) => (
                      <option key={`permanent-${lga.id}`} value={lga.id}>
                        {lga.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select className="form-select" disabled>
                    <option>Loading lgas...</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-lg-4 col-sm-6">
            <div className="mb-3">
              <label className="form-label" htmlFor="permanent_town">Town</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-building-2-line"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="permanent_town"
                  name="permanent_town"
                  value={contactDetails.permanent_town}
                  onChange={handleContactDetailsChange}
                  placeholder="Enter town"
                />
              </div>
            </div>
          </div>

          <div className="col-xxl-6 col-lg-8 col-sm-12">
            <div className="mb-3">
              <label className="form-label" htmlFor="permanent_address">
                Address <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="ri-home-2-line"></i>
                </span>
                <input
                  type="text"
                  className={`form-control ${errors.permanent_address ? 'is-invalid' : ''}`}
                  id="permanent_address"
                  name="permanent_address"
                  value={contactDetails.permanent_address}
                  onChange={handleContactDetailsChange}
                  placeholder="Enter permanent address"
                  required
                />
                {errors.permanent_address && (
                  <div className="invalid-feedback">{errors.permanent_address}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNextOfKin = () => (
    <div key="next-of-kin">
      <div className="row gx-4">
        {/* Full Names */}
        <div className="col-xxl-4 col-lg-4 col-sm-12">
          <div className="mb-3">
            <label className="form-label" htmlFor="full_names">
              Full Names <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ri-user-line"></i>
              </span>
              <input
                type="text"
                className={`form-control ${errors.full_names ? 'is-invalid' : ''}`}
                id="full_names"
                name="full_names"
                value={nextOfKin.full_names}
                onChange={handleNextOfKinChange}
                placeholder="Enter full names"
                required
                disabled={isEmergency}
              />
              {errors.full_names && <div className="invalid-feedback">{errors.full_names}</div>}
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="col-xxl-4 col-lg-4 col-sm-12">
          <div className="mb-3">
            <label className="form-label" htmlFor="phone_no">
              Phone Number <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ri-phone-line"></i>
              </span>
              <input
                type="tel"
                className={`form-control ${errors.phone_no ? 'is-invalid' : ''}`}
                id="phone_no"
                name="phone_no"
                value={nextOfKin.phone_no}
                onChange={handleNextOfKinChange}
                placeholder="Enter phone number"
                required
                disabled={isEmergency}
              />
              {errors.phone_no && <div className="invalid-feedback">{errors.phone_no}</div>}
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="col-xxl-4 col-lg-4 col-sm-12">
          <div className="mb-3">
            <label className="form-label" htmlFor="kin_email">
              Email <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ri-mail-line"></i>
              </span>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="kin_email"
                name="email"
                value={nextOfKin.email}
                onChange={handleNextOfKinChange}
                placeholder="Enter email"
                required
                disabled={isEmergency}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="col-12">
          <div className="mb-3">
            <label className="form-label" htmlFor="address">
              Address <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ri-home-3-line"></i>
              </span>
              <textarea
                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                id="address"
                name="address"
                value={nextOfKin.address}
                onChange={handleNextOfKinChange}
                placeholder="Enter address"
                rows="3"
                required
                disabled={isEmergency}
              />
              {errors.address && <div className="invalid-feedback">{errors.address}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhotoUpload = () => (
    <div key="photo-upload">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label" htmlFor="photo">Patient Photo (Optional)</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ri-image-line"></i>
              </span>
              <input
                type="file"
                className="form-control"
                id="photo"
                name="photo"
                onChange={handlePhotoChange}
                accept="image/*"
              />
            </div>
            <small className="form-text text-muted">
              Accepted formats: JPG, PNG, GIF. Max size: 5MB
            </small>
          </div>

          {photoPreview && (
            <div className="text-center mt-3">
              <img
                src={photoPreview}
                alt="Preview"
                className="img-thumbnail"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
              <div className="mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                    document.getElementById('photo').value = '';
                  }}
                >
                  Remove Photo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderContactDetails();
      case 3:
        return renderNextOfKin();
      case 4:
        return renderPhotoUpload();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          {!isEmergency && renderStepIndicator()}

          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between mt-4">
            {isEmergency ? (
              <div className="w-100 text-center">
                <button
                  type="button"
                  className="btn btn-success btn-lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{ minWidth: '200px' }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting...
                    </>
                  ) : (
                    <>Submit</>
                  )}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <i className="ri-arrow-left-line me-1"></i>
                  Previous
                </button>

                <div className="text-center">
                  <span className="text-muted">Step {currentStep} of {totalSteps}</span>
                </div>

                {currentStep < totalSteps ? (
                  <button type="button" className="btn btn-primary" onClick={handleNext}>
                    Next
                    <i className="ri-arrow-right-line ms-1"></i>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{ minWidth: '150px' }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="ri-check-line me-1"></i>
                        Submit
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
