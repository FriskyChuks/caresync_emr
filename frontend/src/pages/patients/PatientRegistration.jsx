import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useMessage } from '../../context/MessageProvider';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const PatientRegistration = ({ baseURL }) => {
  const { user } = useAuth();
  const { showMessage } = useMessage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    other_name: '',
    email: '',
    gender: '',
    password: 'default123',
    re_password: 'default123',
  });

  const [patientInfo, setPatientInfo] = useState({
    date_of_birth: '',
    age: '',
    phone: '',
    occupation: '',
    marital_status: '',
    religion: '',
    status: 'adult',
  });

  const [residentialAddress, setResidentialAddress] = useState({
    country: '',
    national_id: '',
    state_of_origin: '',
    local_government_area: '',
    address: '',
    town: '',
  });

  const [permanentAddress, setPermanentAddress] = useState({
    address: '',
    state_of_residence: '',
    local_government_area_of_residence: '',
    town: '',
  });

  const [nextOfKin, setNextOfKin] = useState({
    full_names: '',
    phone_no: '',
    address: '',
    email: '',
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState('');

  const [genders, setGenders] = useState([]);
  const [maritalStatuses, setMaritalStatuses] = useState([]);
  const [religions, setReligions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const statusChoices = [
    { value: 'adult', label: 'Adult' },
    { value: 'neonate', label: 'Neonate' },
    { value: 'child', label: 'Child' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          gendersRes,
          maritalRes,
          religionsRes,
          countriesRes,
          statesRes,
          lgasRes
        ] = await Promise.all([
          axiosInstance.get(`/accountapi/gender/`),
          axiosInstance.get(`/accountapi/marital_status`),
          axiosInstance.get(`/accountapi/religion/`),
          axiosInstance.get(`/contactsapi/countries/`),
          axiosInstance.get(`/contactsapi/states/`),
          axiosInstance.get(`/contactsapi/lgas/`)
        ]);
        
        setGenders(gendersRes.data);
        setMaritalStatuses(maritalRes.data);
        setReligions(religionsRes.data);
        setCountries(countriesRes.data);
        setStates(statesRes.data);
        setLgas(lgasRes.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [baseURL]);

  // ── Derived filtered LGA lists ─────────────────────────────────────────────
  // LGAs filtered by the selected state_of_origin (Residential Address)
  const residentialFilteredLgas = residentialAddress.state_of_origin
    ? lgas.filter((lga) => String(lga.state) === String(residentialAddress.state_of_origin))
    : [];

  // LGAs filtered by the selected state_of_residence (Permanent Address)
  const permanentFilteredLgas = permanentAddress.state_of_residence
    ? lgas.filter((lga) => String(lga.state) === String(permanentAddress.state_of_residence))
    : [];

  const generateUsername = async (firstName, lastName) => {
    if (!firstName || !lastName) return '';
    
    const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase().charAt(0)}`;
    let username = baseUsername;
    let counter = 1;
    
    try {
      while (counter < 100) {
        const response = await axiosInstance.get(`/auth/check-username/?username=${username}`);
        if (response.data.exists) {
          username = `${baseUsername}${counter}`;
          counter++;
        } else {
          break;
        }
      }
    } catch (error) {
      console.error('Error checking username:', error);
      username = `${baseUsername}_${Date.now().toString().slice(-4)}`;
    }
    
    return username;
  };

  function calculateAgeFromDOB(dateOfBirth) {
    if (!dateOfBirth) return '';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age >= 0 ? age : '';
  }

  function calculateDOBFromAge(age) {
    if (!age || age === '' || isNaN(age)) return '';
    const today = new Date();
    const birthYear = today.getFullYear() - parseInt(age);
    const birthDate = new Date(birthYear, today.getMonth(), today.getDate());
    return birthDate.toISOString().split('T')[0];
  }

  function getStatusFromAge(age) {
    if (age === '' || age === null || isNaN(age)) return 'adult';
    const numericAge = parseInt(age);
    if (numericAge < 1) return 'neonate';
    if (numericAge >= 1 && numericAge < 18) return 'child';
    if (numericAge >= 18) return 'adult';
    return 'adult';
  }

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date_of_birth') {
      const age = calculateAgeFromDOB(value);
      const status = getStatusFromAge(age);
      setPatientInfo((prev) => ({ ...prev, [name]: value, age, status }));
    } else if (name === 'age') {
      const dob = calculateDOBFromAge(value);
      const status = getStatusFromAge(value);
      setPatientInfo((prev) => ({ ...prev, [name]: value, date_of_birth: dob, status }));
    } else {
      setPatientInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleResidentialAddressChange = (e) => {
    const { name, value } = e.target;
    setResidentialAddress((prev) => ({ ...prev, [name]: value }));
  };

  // When state_of_origin changes, reset the LGA field
  const handleResidentialStateChange = (e) => {
    const { value } = e.target;
    setResidentialAddress((prev) => ({
      ...prev,
      state_of_origin: value,
      local_government_area: '',
    }));
  };

  const handlePermanentAddressChange = (e) => {
    const { name, value } = e.target;
    setPermanentAddress((prev) => ({ ...prev, [name]: value }));
  };

  // When state_of_residence changes, reset the LGA field
  const handlePermanentStateChange = (e) => {
    const { value } = e.target;
    setPermanentAddress((prev) => ({
      ...prev,
      state_of_residence: value,
      local_government_area_of_residence: '',
    }));
  };

  const handleNextOfKinChange = (e) => {
    const { name, value } = e.target;
    setNextOfKin((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmergencyChange = (e) => {
    const checked = e.target.checked;
    setIsEmergency(checked);
    if (checked) {
      setUserInfo((prev) => ({ ...prev, other_name: '', email: '' }));
      setPatientInfo((prev) => ({ ...prev, occupation: '', marital_status: '', religion: '' }));
      setCurrentStep(1);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoError('');
    
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Invalid file type. Please upload JPG, PNG, or GIF images.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('File size too large. Maximum size is 5MB.');
      return;
    }

    setPhoto(file);

    const reader = new FileReader();
    reader.onload = (evt) => setPhotoPreview(evt.target.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError('');
    const fileInput = document.getElementById('photo');
    if (fileInput) fileInput.value = '';
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!userInfo.first_name.trim()) newErrors.first_name = 'Required';
      if (!userInfo.last_name.trim()) newErrors.last_name = 'Required';
      if (!patientInfo.phone.trim()) newErrors.phone = 'Required';
      if (!patientInfo.date_of_birth.trim() && !patientInfo.age.trim()) {
        newErrors.date_of_birth = 'Either Date of Birth or Age is required';
        newErrors.age = 'Either Date of Birth or Age is required';
      }
      if (!userInfo.gender.trim()) newErrors.gender = 'Required';
    } 
    else if (step === 2 && !isEmergency) {
      if (!residentialAddress.address.trim()) newErrors.residential_address = 'Required';
      if (!permanentAddress.address.trim()) newErrors.permanent_address = 'Required';
    } 
    else if (step === 3 && !isEmergency) {
      if (!nextOfKin.full_names.trim()) newErrors.full_names = 'Required';
      if (!nextOfKin.phone_no.trim()) newErrors.phone_no = 'Required';
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

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const buildPayload = async () => {
    let generatedUsername;
    if (!isEmergency) {
      generatedUsername = await generateUsername(userInfo.first_name, userInfo.last_name);
    } else {
      const timestamp = Date.now().toString().slice(-6);
      generatedUsername = `emergency_${timestamp}`;
    }

    const base = {
      username: generatedUsername,
      first_name: userInfo.first_name,
      last_name: userInfo.last_name,
      gender: userInfo.gender || undefined,
      other_name: isEmergency ? undefined : userInfo.other_name,
      email: isEmergency ? undefined : userInfo.email,
      password: userInfo.password || 'default123',
      re_password: userInfo.re_password || userInfo.password || 'default123',

      patient: {
        date_of_birth: patientInfo.date_of_birth || undefined,
        age: patientInfo.age || undefined,
        phone: patientInfo.phone,
        occupation: isEmergency ? undefined : patientInfo.occupation || undefined,
        status: patientInfo.status || 'adult',
        created_by_id: user?.id ? parseInt(user.id) : undefined,  // Ensure it's a number
        religion: isEmergency ? undefined : patientInfo.religion || undefined,
        marital_status: isEmergency ? undefined : patientInfo.marital_status || undefined,
      },
    };

    if (!isEmergency) {
      base.residential_address = {
        country: residentialAddress.country || undefined,
        national_id: residentialAddress.national_id || undefined,
        state_of_origin: residentialAddress.state_of_origin || undefined,
        local_government_area: residentialAddress.local_government_area || undefined,
        address: residentialAddress.address || undefined,
        town: residentialAddress.town || undefined,
      };

      base.permanent_address = {
        address: permanentAddress.address || undefined,
        state_of_residence: permanentAddress.state_of_residence || undefined,
        local_government_area_of_residence: permanentAddress.local_government_area_of_residence || undefined,
        town: permanentAddress.town || undefined,
      };

      base.next_of_kin = {
        full_names: nextOfKin.full_names || undefined,
        phone_no: nextOfKin.phone_no || undefined,
        address: nextOfKin.address || undefined,
        email: nextOfKin.email || undefined,
      };
    }

    return compactDeep(base);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const payload = await buildPayload();

      // Add photo as base64 if present
      if (photo) {
        try {
          const photoBase64 = await fileToBase64(photo);
          // Add to patient object
          if (!payload.patient) {
            payload.patient = {};
          }
          payload.patient.photo_base64 = photoBase64;
        } catch (photoError) {
          console.error('Error converting photo to base64:', photoError);
          showMessage('Error processing photo. Please try again.', 'error');
          setIsSubmitting(false);
          return;
        }
      }

      // Send everything as JSON in a single request
      const { data: created } = await axiosInstance.post('/auth/users/', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      showMessage('Registration successful!', 'success');
      navigate(`/patient-summary/${created.patient_data.id}/`);

      // Reset form after successful submission
      setTimeout(() => {
        setCurrentStep(1);
        setUserInfo({ first_name: '', last_name: '', other_name: '', email: '', gender: '', password: 'default123', re_password: 'default123' });
        setPatientInfo({ date_of_birth: '', age: '', phone: '', occupation: '', marital_status: '', religion: '', status: 'adult' });
        setResidentialAddress({ country: '', national_id: '', state_of_origin: '', local_government_area: '', address: '', town: '' });
        setPermanentAddress({ address: '', state_of_residence: '', local_government_area_of_residence: '', town: '' });
        setNextOfKin({ full_names: '', phone_no: '', address: '', email: '' });
        setPhoto(null);
        setPhotoPreview(null);
        setPhotoError('');
        setIsEmergency(false);
        setErrors({});
      }, 300);

    } catch (error) {
      console.error('Registration failed:', error);
      const apiErrors = error?.response?.data;
      let msg = 'Registration failed. Please check the form.';
      
      if (apiErrors) {
        const lines = [];
        Object.entries(apiErrors).forEach(([k, v]) => {
          if (Array.isArray(v)) v.forEach((m) => lines.push(`${k}: ${m}`));
          else if (v && typeof v === 'object') {
            Object.entries(v).forEach(([nk, nv]) => {
              if (Array.isArray(nv)) nv.forEach((m) => lines.push(`${k}.${nk}: ${m}`));
            });
          }
        });
        if (lines.length) msg = lines.join(' | ');
      }
      showMessage(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-4 px-3">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              (isEmergency && step === 1) || (!isEmergency && currentStep >= step)
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}>
              {step}
            </div>
            <span className="mt-0.5 text-[10px] font-medium text-gray-500 truncate max-w-[60px]">
              {step === 1 && 'Personal'}
              {step === 2 && 'Address'}
              {step === 3 && 'Kin'}
            </span>
          </div>
          {step < 3 && (
            <div className={`flex-1 h-0.5 mx-1 ${
              (isEmergency && step === 1) || (!isEmergency && currentStep > step)
                ? 'bg-gradient-to-r from-blue-300 to-indigo-300' 
                : 'bg-gray-200'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-4 px-4">
      {/* Emergency Toggle */}
      <div className="flex items-center justify-between p-1.5 bg-gradient-to-r from-rose-50 to-orange-50 rounded-lg border border-rose-300 mb-2 hover:shadow-sm transition-all duration-300 group">
        <div className="flex items-center space-x-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="isEmergency"
              checked={isEmergency}
              onChange={handleEmergencyChange}
              className="sr-only peer"
            />
            <div className="w-7 h-3.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-orange-500 transition-all duration-300">
              <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all duration-300 ${
                isEmergency ? 'translate-x-3.5' : 'translate-x-0'
              }`}></div>
            </div>
          </label>
          <label htmlFor="isEmergency" className="font-semibold text-xs cursor-pointer">
            <span className="flex items-center space-x-1.5">
              <span className={`transition-all duration-300 ${isEmergency ? 'text-rose-600 scale-110' : 'text-gray-600'}`}>
                🚑
              </span>
              <span className={isEmergency ? 'text-rose-700 font-bold' : 'text-gray-800'}>
                Emergency
              </span>
            </span>
          </label>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all duration-300 ${
          isEmergency 
            ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          {isEmergency ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* Basic Identity */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <span className="text-blue-600 mr-2">👤</span>
          Basic Identity
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={userInfo.first_name}
              onChange={handleUserInfoChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                errors.first_name ? 'border-rose-300 bg-rose-50' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="First name"
            />
            {errors.first_name && <p className="mt-1 text-xs text-rose-600">{errors.first_name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Last Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={userInfo.last_name}
              onChange={handleUserInfoChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                errors.last_name ? 'border-rose-300 bg-rose-50' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Last name"
            />
            {errors.last_name && <p className="mt-1 text-xs text-rose-600">{errors.last_name}</p>}
          </div>

          {!isEmergency && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Other Name</label>
              <input
                type="text"
                name="other_name"
                value={userInfo.other_name}
                onChange={handleUserInfoChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
                placeholder="Middle name"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              name="gender"
              value={userInfo.gender}
              onChange={handleUserInfoChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                errors.gender ? 'border-rose-300 bg-rose-50' : 'border-gray-300 focus:border-blue-500'
              }`}
            >
              <option value="">Select Gender</option>
              {genders.map((gender) => (
                <option key={gender.id} value={gender.id}>{gender.title}</option>
              ))}
            </select>
            {errors.gender && <p className="mt-1 text-xs text-rose-600">{errors.gender}</p>}
          </div>
        </div>
      </div>

      {/* Date of Birth & Age */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <span className="text-blue-600 mr-2">📅</span>
          Date of Birth & Age
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={patientInfo.date_of_birth}
              onChange={handlePatientInfoChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                errors.date_of_birth ? 'border-rose-300 bg-rose-50' : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.date_of_birth && <p className="mt-1 text-xs text-rose-600">{errors.date_of_birth}</p>}
            <p className="text-xs text-gray-500 mt-1">Enter DOB or Age below</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={patientInfo.age}
              onChange={handlePatientInfoChange}
              min="0"
              max="120"
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                errors.age ? 'border-rose-300 bg-rose-50' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Years"
            />
            {errors.age && <p className="mt-1 text-xs text-rose-600">{errors.age}</p>}
            <p className="text-xs text-gray-500 mt-1">Will auto-calculate DOB</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={patientInfo.status}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-gray-100 text-gray-600"
              disabled
            >
              <option value="">Auto-determined</option>
              {statusChoices.map((choice) => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Based on age</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Phone <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={patientInfo.phone}
              onChange={handlePatientInfoChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                errors.phone ? 'border-rose-300 bg-rose-50' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Phone number"
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {!isEmergency && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <span className="text-blue-600 mr-2">ℹ️</span>
            Additional Information & Contact
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleUserInfoChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
                placeholder="Email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={patientInfo.occupation}
                onChange={handlePatientInfoChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
                placeholder="Occupation"
              />
            </div>

            {maritalStatuses.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  name="marital_status"
                  value={patientInfo.marital_status}
                  onChange={handlePatientInfoChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select</option>
                  {maritalStatuses.map((ms) => (
                    <option key={ms.id} value={ms.id}>{ms.title}</option>
                  ))}
                </select>
              </div>
            )}

            {religions.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Religion</label>
                <select
                  name="religion"
                  value={patientInfo.religion}
                  onChange={handlePatientInfoChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Religion</option>
                  {religions.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photo Upload */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Patient Photo <span className="text-gray-500">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                id="photo"
                onChange={handlePhotoChange}
                accept="image/*"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
              {photoError && <p className="mt-1 text-xs text-rose-600">{photoError}</p>}
            </div>
          </div>
          {photoPreview && (
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white shadow-lg overflow-hidden">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-600 transition-colors shadow-sm"
                title="Remove photo"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="space-y-6 px-4">
      {/* Residential Address */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <span className="text-blue-600 mr-2">🏠</span>
          Residential Address
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={residentialAddress.address}
              onChange={handleResidentialAddressChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                errors.residential_address ? 'border-rose-300 bg-rose-50' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Street address"
            />
            {errors.residential_address && <p className="mt-1 text-xs text-rose-600">{errors.residential_address}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Town/City</label>
            <input
              type="text"
              name="town"
              value={residentialAddress.town}
              onChange={handleResidentialAddressChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
              placeholder="Town or city"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
            <select
              name="country"
              value={residentialAddress.country}
              onChange={handleResidentialAddressChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>{country.title}</option>
              ))}
            </select>
          </div>

          {/* State of Origin — uses dedicated handler to reset LGA */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">State of Origin</label>
            <select
              name="state_of_origin"
              value={residentialAddress.state_of_origin}
              onChange={handleResidentialStateChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>{state.title}</option>
              ))}
            </select>
          </div>

          {/* LGA — filtered by state_of_origin */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Local Government</label>
            <select
              name="local_government_area"
              value={residentialAddress.local_government_area}
              onChange={handleResidentialAddressChange}
              disabled={!residentialAddress.state_of_origin}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="">
                {residentialAddress.state_of_origin ? 'Select LGA' : 'Select a state first'}
              </option>
              {residentialFilteredLgas.map((lga) => (
                <option key={lga.id} value={lga.id}>{lga.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">National ID</label>
            <input
              type="text"
              name="national_id"
              value={residentialAddress.national_id}
              onChange={handleResidentialAddressChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
              placeholder="National ID"
            />
          </div>
        </div>
      </div>

      {/* Permanent Address */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
          <span className="text-emerald-600 mr-2">📍</span>
          Permanent Address
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={permanentAddress.address}
              onChange={handlePermanentAddressChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
                errors.permanent_address ? 'border-rose-300 bg-rose-50' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Permanent address"
            />
            {errors.permanent_address && <p className="mt-1 text-xs text-rose-600">{errors.permanent_address}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Town/City</label>
            <input
              type="text"
              name="town"
              value={permanentAddress.town}
              onChange={handlePermanentAddressChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
              placeholder="Town or city"
            />
          </div>

          {/* State of Residence — uses dedicated handler to reset LGA */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">State of Residence</label>
            <select
              name="state_of_residence"
              value={permanentAddress.state_of_residence}
              onChange={handlePermanentStateChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>{state.title}</option>
              ))}
            </select>
          </div>

          {/* LGA — filtered by state_of_residence */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Local Government</label>
            <select
              name="local_government_area_of_residence"
              value={permanentAddress.local_government_area_of_residence}
              onChange={handlePermanentAddressChange}
              disabled={!permanentAddress.state_of_residence}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="">
                {permanentAddress.state_of_residence ? 'Select LGA' : 'Select a state first'}
              </option>
              {permanentFilteredLgas.map((lga) => (
                <option key={lga.id} value={lga.id}>{lga.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNextOfKinInfo = () => (
    <div className="space-y-4 px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="full_names"
            value={nextOfKin.full_names}
            onChange={handleNextOfKinChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
              errors.full_names ? 'border-rose-300 bg-rose-50' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Full name"
          />
          {errors.full_names && <p className="mt-1 text-xs text-rose-600">{errors.full_names}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Phone <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            name="phone_no"
            value={nextOfKin.phone_no}
            onChange={handleNextOfKinChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
              errors.phone_no ? 'border-rose-300 bg-rose-50' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Phone number"
          />
          {errors.phone_no && <p className="mt-1 text-xs text-rose-600">{errors.phone_no}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={nextOfKin.email}
            onChange={handleNextOfKinChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors"
            placeholder="Email"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            value={nextOfKin.address}
            onChange={handleNextOfKinChange}
            rows="2"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 transition-colors resize-none"
            placeholder="Full address"
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    if (isEmergency) return renderPersonalInfo();
    switch (currentStep) {
      case 1: return renderPersonalInfo();
      case 2: return renderAddressInfo();
      case 3: return renderNextOfKinInfo();
      default: return renderPersonalInfo();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-2xl shadow-blue-500/10 border border-blue-200 overflow-hidden mx-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/60"></div>
                <h2 className="text-sm font-semibold text-white truncate">
                  {isEmergency ? '🚨 Emergency Registration' : `Patient Registration - Step ${currentStep}`}
                </h2>
              </div>
              <div className="text-xs px-2 py-0.5 bg-white/20 rounded text-white">
                {isEmergency ? 'Quick Mode' : `${currentStep}/${totalSteps}`}
              </div>
            </div>
          </div>

          {!isEmergency && renderStepIndicator()}

          <div className="pb-6">
            {renderCurrentStep()}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 px-4">
              {isEmergency ? (
                <div className="w-full text-center">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🚨</span>
                        <span>Register Emergency Patient</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                      currentStep === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <span>←</span>
                    <span>Previous</span>
                  </button>

                  <div className="text-center">
                    <span className="text-sm text-gray-500">
                      Fields with <span className="text-rose-500">*</span> are required
                    </span>
                  </div>

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2"
                    >
                      <span>Next Step</span>
                      <span>→</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          <span>Complete Registration</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            {isEmergency && (
              <div className="mt-4 mx-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-600">⚠️</span>
                  <p className="text-sm text-amber-700">
                    <span className="font-medium">Emergency Mode:</span> Only essential fields are required. Additional information can be updated later from patient summary.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 mx-2">
          <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="text-lg font-bold text-blue-600">1-3 min</div>
            <div className="text-xs text-gray-600">Average time</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
            <div className="text-lg font-bold text-emerald-600">98%</div>
            <div className="text-xs text-gray-600">Success rate</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="text-lg font-bold text-purple-600">24/7</div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;