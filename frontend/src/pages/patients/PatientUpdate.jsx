import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useMessage } from '../../context/MessageProvider';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

  const FormInput = ({ label, name, value, onChange, type = 'text', placeholder, required = false, error, icon, className = '', selectOptions }) => (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-xs font-medium text-gray-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors">
            {icon}
          </div>
        )}
        {selectOptions ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
              icon ? 'pl-10' : ''
            } ${error ? 'border-rose-300 bg-rose-50/50' : 'border-gray-300 hover:border-blue-400'}`}
          >
            <option value="">Select {label}</option>
            {selectOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.title}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
              icon ? 'pl-10' : ''
            } ${error ? 'border-rose-300 bg-rose-50/50' : 'border-gray-300 hover:border-blue-400'}`}
          />
        )}
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
      </div>
    </div>
  );

  // Reusable cascading LGA select — matches FormInput styling exactly
  const LGASelect = ({ name, value, onChange, disabled, filteredLgas, icon = '🏘️' }) => (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">Local Government</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 group-hover:text-blue-600 transition-colors pointer-events-none">
          {icon}
        </div>
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 border-gray-300 hover:border-blue-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <option value="">
            {disabled ? 'Select a state first' : 'Select Local Government'}
          </option>
          {filteredLgas.map((lga) => (
            <option key={lga.id} value={lga.id}>{lga.title}</option>
          ))}
        </select>
      </div>
    </div>
  );
  
const PatientUpdate = () => {
  const { user } = useAuth();
  const { showMessage } = useMessage();
  const navigate = useNavigate();
  const { patientId } = useParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const errorRef = useRef(null);
  
  const [patientData, setPatientData] = useState(null);
  
  const [userInfo, setUserInfo] = useState({
    first_name: '',
    last_name: '',
    other_name: '',
    email: '',
    gender: '',
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
  const [existingPhoto, setExistingPhoto] = useState(null);

  const [genders, setGenders] = useState([]);
  const [maritalStatuses, setMaritalStatuses] = useState([]);
  const [religions, setReligions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showStepErrors, setShowStepErrors] = useState(false);

  // ── Derived filtered LGA lists ─────────────────────────────────────────────
  const residentialFilteredLgas = residentialAddress.state_of_origin
    ? lgas.filter((lga) => String(lga.state) === String(residentialAddress.state_of_origin))
    : [];

  const permanentFilteredLgas = permanentAddress.state_of_residence
    ? lgas.filter((lga) => String(lga.state) === String(permanentAddress.state_of_residence))
    : [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          gendersRes,
          maritalRes,
          religionsRes,
          countriesRes,
          statesRes,
          lgasRes,
          patientRes
        ] = await Promise.all([
          axiosInstance.get(`/accountapi/gender/`),
          axiosInstance.get(`/accountapi/marital_status`),
          axiosInstance.get(`/accountapi/religion/`),
          axiosInstance.get(`/contactsapi/countries/`),
          axiosInstance.get(`/contactsapi/states/`),
          axiosInstance.get(`/contactsapi/lgas/`),
          axiosInstance.get(`/patientsapi/patient_detail/${patientId}/`)
        ]);
        
        setGenders(gendersRes.data);
        setMaritalStatuses(maritalRes.data);
        setReligions(religionsRes.data);
        setCountries(countriesRes.data);
        setStates(statesRes.data);
        setLgas(lgasRes.data);
        
        const data = patientRes.data;
        setPatientData(data);
        
        if (data) {
          setUserInfo({
            first_name: data.user_info.first_name || '',
            last_name: data.user_info.last_name || '',
            other_name: data.user_info.other_name || '',
            email: data.user_info.email || '',
            gender: data.user_info.gender?.id || '',
          });

          setPatientInfo({
            date_of_birth: data.date_of_birth || '',
            age: data.age || '',
            phone: data.phone || '',
            occupation: data.occupation || '',
            marital_status: data.marital_status?.id || '',
            religion: data.religion?.id || '',
            status: data.status || 'adult',
          });

          if (data.photo) setExistingPhoto(data.photo);

          if (data.residential_address_data) {
            const rad = data.residential_address_data;
            setResidentialAddress({
              country: rad.country?.id || '',
              national_id: rad.national_id || '',
              state_of_origin: rad.state_of_origin?.id || '',
              local_government_area: rad.local_government_area?.id || '',
              address: rad.address || '',
              town: rad.town || '',
            });
          }

          if (data.permanent_address_data) {
            const pad = data.permanent_address_data;
            setPermanentAddress({
              address: pad.address || '',
              state_of_residence: pad.state_of_residence?.id || '',
              local_government_area_of_residence: pad.local_government_area_of_residence?.id || '',
              town: pad.town || '',
            });
          }

          if (data.next_of_kin_data) {
            const nok = data.next_of_kin_data;
            setNextOfKin({
              full_names: nok.full_names || '',
              phone_no: nok.phone_no || '',
              address: nok.address || '',
              email: nok.email || '',
            });
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        showMessage('Failed to load patient data', 'error');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [patientId, showMessage]);

  const scrollToError = () => {
    if (errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const calculateAgeFromDOB = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
    return age >= 0 ? age : '';
  };

  const calculateDOBFromAge = (age) => {
    if (!age || age === '' || isNaN(age)) return '';
    const today = new Date();
    const birthYear = today.getFullYear() - parseInt(age);
    return new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  };

  const getStatusFromAge = (age) => {
    if (age === '' || age === null || isNaN(age)) return 'adult';
    const numericAge = parseInt(age);
    if (numericAge < 1) return 'neonate';
    if (numericAge >= 1 && numericAge < 18) return 'child';
    return 'adult';
  };

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));

    if (name === 'date_of_birth') {
      const age = calculateAgeFromDOB(value);
      const status = getStatusFromAge(age);
      setPatientInfo(prev => ({ ...prev, [name]: value, age, status }));
    } else if (name === 'age') {
      const dob = calculateDOBFromAge(value);
      const status = getStatusFromAge(value);
      setPatientInfo(prev => ({ ...prev, [name]: value, date_of_birth: dob, status }));
    } else {
      setPatientInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleResidentialAddressChange = (e) => {
    const { name, value } = e.target;
    setResidentialAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // Resets LGA when state of origin changes
  const handleResidentialStateChange = (e) => {
    const { value } = e.target;
    setResidentialAddress(prev => ({
      ...prev,
      state_of_origin: value,
      local_government_area: '',
    }));
    if (errors.state_of_origin) setErrors(prev => ({ ...prev, state_of_origin: null }));
  };

  const handlePermanentAddressChange = (e) => {
    const { name, value } = e.target;
    setPermanentAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // Resets LGA when state of residence changes
  const handlePermanentStateChange = (e) => {
    const { value } = e.target;
    setPermanentAddress(prev => ({
      ...prev,
      state_of_residence: value,
      local_government_area_of_residence: '',
    }));
    if (errors.state_of_residence) setErrors(prev => ({ ...prev, state_of_residence: null }));
  };

  const handleNextOfKinChange = (e) => {
    const { name, value } = e.target;
    setNextOfKin(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
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

  const removeExistingPhoto = () => {
    setExistingPhoto(null);
    setPhoto('DELETE');
  };

  const validateCurrentStepSync = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!userInfo.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!userInfo.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!patientInfo.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!patientInfo.date_of_birth.trim() && !patientInfo.age.trim()) {
        newErrors.date_of_birth = 'Either Date of Birth or Age is required';
      }
      if (!userInfo.gender || userInfo.gender === '') newErrors.gender = 'Gender is required';
    } 
    else if (currentStep === 2) {
      if (!residentialAddress.address.trim()) newErrors.residential_address = 'Residential address is required';
      if (!permanentAddress.address.trim()) newErrors.permanent_address = 'Permanent address is required';
    } 
    else if (currentStep === 3) {
      if (!nextOfKin.full_names.trim()) newErrors.full_names = 'Full name is required';
      if (!nextOfKin.phone_no.trim()) newErrors.phone_no = 'Phone number is required';
    }
    
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validateCurrentStepSync();
    if (Object.keys(newErrors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setShowStepErrors(false);
      setErrors({});
    } else {
      setErrors(newErrors);
      setShowStepErrors(true);
      setTimeout(() => scrollToError(), 100);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setShowStepErrors(false);
    setErrors({});
  };

  const validateStepForSubmit = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!userInfo.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!userInfo.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!patientInfo.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!patientInfo.date_of_birth.trim() && !patientInfo.age.trim()) {
        newErrors.date_of_birth = 'Either Date of Birth or Age is required';
      }
      if (!userInfo.gender || userInfo.gender === '') newErrors.gender = 'Gender is required';
    } else if (step === 2) {
      if (!residentialAddress.address.trim()) newErrors.residential_address = 'Residential address is required';
      if (!permanentAddress.address.trim()) newErrors.permanent_address = 'Permanent address is required';
    } else if (step === 3) {
      if (!nextOfKin.full_names.trim()) newErrors.full_names = 'Full name is required';
      if (!nextOfKin.phone_no.trim()) newErrors.phone_no = 'Phone number is required';
    }
    return newErrors;
  };

  const handleSubmit = async () => {
  const allErrors = {
    ...validateStepForSubmit(1),
    ...validateStepForSubmit(2),
    ...validateStepForSubmit(3),
  };
  
  if (Object.keys(allErrors).length > 0) {
    showMessage('Please fix all errors in the form before submitting', 'error');
    setErrors(allErrors);
    setShowStepErrors(true);
    setCurrentStep(1);
    setTimeout(() => scrollToError(), 100);
    return;
  }

  setIsSubmitting(true);
  try {
    // Update user info
    await axiosInstance.patch(`/auth/users/${patientData.user_info.id}/`, {
      first_name: userInfo.first_name,
      last_name: userInfo.last_name,
      other_name: userInfo.other_name || null,
      email: userInfo.email || null,
      gender: userInfo.gender || null,
    });

    // Prepare patient payload WITHOUT photo
    const patientPayload = {
      date_of_birth: patientInfo.date_of_birth || null,
      age: patientInfo.age || null,
      phone: patientInfo.phone,
      occupation: patientInfo.occupation || null,
      marital_status: patientInfo.marital_status || null,
      religion: patientInfo.religion || null,
      status: patientInfo.status,
    };

    // Handle photo based on state
    if (photo === 'DELETE') {
      // Case 1: Remove existing photo
      await axiosInstance.patch(
        `/patientsapi/patient_detail/${patientId}/`,
        { ...patientPayload, photo: null },
        { headers: { 'Content-Type': 'application/json' } }
      );
    } 
    else if (photo && photo instanceof File) {
      // Case 2: Upload new photo - USE FORMDATA
      const formData = new FormData();
      
      // Append the file first
      formData.append('photo', photo);
      
      // Append all other fields
      Object.entries(patientPayload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      await axiosInstance.patch(
        `/patientsapi/patient_detail/${patientId}/`,
        formData
      );
    } 
    else {
      // Case 3: No photo changes - send JSON
      await axiosInstance.patch(
        `/patientsapi/patient_detail/${patientId}/`,
        patientPayload,
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare address data WITHOUT user field
    const residentialData = {
      country: residentialAddress.country || null,
      national_id: residentialAddress.national_id || '',
      state_of_origin: residentialAddress.state_of_origin || null,
      local_government_area: residentialAddress.local_government_area || null,
      address: residentialAddress.address || '',
      town: residentialAddress.town || '',
    };

    const permanentData = {
      address: permanentAddress.address || '',
      state_of_residence: permanentAddress.state_of_residence || null,
      local_government_area_of_residence: permanentAddress.local_government_area_of_residence || null,
      town: permanentAddress.town || '',
    };

    const kinData = {
      full_names: nextOfKin.full_names || '',
      phone_no: nextOfKin.phone_no || '',
      address: nextOfKin.address || '',
      email: nextOfKin.email || '',
    };

    // Helper function to check if object has any non-empty values
    const hasData = (obj) => {
      return Object.values(obj).some(value => 
        value !== null && value !== '' && value !== undefined
      );
    };

    // In your handleSubmit function, replace the address/kin sections:

// Update residential address
if (residentialAddress.address || residentialAddress.town || residentialAddress.country) {
  console.log('Processing residential address...');
  console.log('User ID for residential:', patientData.user_info.id);
  
  const residentialData = {
    user: patientData.user_info.id,
    country: residentialAddress.country || null,
    national_id: residentialAddress.national_id || '',
    state_of_origin: residentialAddress.state_of_origin || null,
    local_government_area: residentialAddress.local_government_area || null,
    address: residentialAddress.address || '',
    town: residentialAddress.town || '',
  };
  
  console.log('Sending residential data:', residentialData);
  const response = await axiosInstance.post(
    `/contactsapi/patient/residential-address/`, 
    residentialData
  );
  console.log('Residential address response:', response.data);
}

// Update permanent address
if (permanentAddress.address || permanentAddress.town || permanentAddress.state_of_residence) {
  console.log('Processing permanent address...');
  console.log('User ID for permanent:', patientData.user_info.id);
  
  const permanentData = {
    user: patientData.user_info.id,
    address: permanentAddress.address || '',
    state_of_residence: permanentAddress.state_of_residence || null,
    local_government_area_of_residence: permanentAddress.local_government_area_of_residence || null,
    town: permanentAddress.town || '',
  };
  
  console.log('Sending permanent data:', permanentData);
  const response = await axiosInstance.post(
    `/contactsapi/patient/permanent-address/`, 
    permanentData
  );
  console.log('Permanent address response:', response.data);
}

// Update next of kin
if (nextOfKin.full_names || nextOfKin.phone_no) {
  console.log('Processing next of kin...');
  console.log('User ID for next of kin:', patientData.user_info.id);
  
  const kinData = {
    user: patientData.user_info.id,
    full_names: nextOfKin.full_names || '',
    phone_no: nextOfKin.phone_no || '',
    address: nextOfKin.address || '',
    email: nextOfKin.email || '',
  };
  
  console.log('Sending kin data:', kinData);
  const response = await axiosInstance.post(
    `/contactsapi/patient/next-of-kin/`, 
    kinData
  );
  console.log('Next of kin response:', response.data);
}
    
    showMessage('Patient updated successfully!', 'success');
    setTimeout(() => navigate(`/patient-summary/${patientId}/`), 1500);
    
  } catch (error) {
    console.error('Update failed:', error);
    const apiErrors = error?.response?.data;
    let msg = 'Update failed. Please check the form.';
    
    if (apiErrors) {
      const lines = [];
      Object.entries(apiErrors).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((m) => lines.push(`${k}: ${m}`));
        else if (typeof v === 'string') lines.push(`${k}: ${v}`);
        else if (v && typeof v === 'object') {
          Object.entries(v).forEach(([nk, nv]) => {
            if (Array.isArray(nv)) nv.forEach((m) => lines.push(`${k}.${nk}: ${m}`));
            else if (typeof nv === 'string') lines.push(`${k}.${nk}: ${nv}`);
          });
        }
      });
      if (lines.length) msg = lines.join(' | ');
    }
    
    showMessage(msg, 'error');
    
    if (apiErrors) {
      const fieldErrors = {};
      Object.entries(apiErrors).forEach(([key, value]) => {
        if (typeof value === 'string') fieldErrors[key] = value;
        else if (Array.isArray(value) && value.length > 0) fieldErrors[key] = value[0];
      });
      setErrors(fieldErrors);
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-3 px-2">
      {[
        { step: 1, icon: '👤', label: 'Personal' },
        { step: 2, icon: '🏠', label: 'Address' },
        { step: 3, icon: '❤️', label: 'Next of Kin' }
      ].map(({ step, icon, label }) => (
        <React.Fragment key={step}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCurrentStep(step)}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                currentStep >= step
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {icon}
            </button>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <span className={`text-[9px] font-medium whitespace-nowrap ${
                currentStep >= step ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </div>
          </div>
          {step < 3 && (
            <div className={`w-4 h-0.5 mx-0.5 rounded-full transition-all duration-200 ${
              currentStep > step ? 'bg-gradient-to-r from-blue-400 to-indigo-400' : 'bg-gray-200'
            }`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderPhotoSection = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <span className="text-white text-sm">📷</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Patient Photo</h3>
            <p className="text-xs text-gray-600">Upload or update profile picture</p>
          </div>
        </div>
        {(existingPhoto || photoPreview) && (
          <button
            type="button"
            onClick={existingPhoto ? removeExistingPhoto : removePhoto}
            className="px-3 py-1.5 text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all duration-300"
          >
            Remove
          </button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white shadow-sm overflow-hidden">
            {existingPhoto ? (
              <img src={existingPhoto} alt="Patient" className="w-full h-full object-cover" />
            ) : photoPreview ? (
              <img src={photoPreview} alt="New" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-400">
                <span className="text-2xl">👤</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <input
            type="file"
            id="photo"
            onChange={handlePhotoChange}
            accept="image/*"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 hover:border-blue-400 transition-all duration-300 file:mr-3 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-xs file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500 file:text-white hover:file:shadow-md"
          />
          {photoError && <p className="mt-1 text-xs text-rose-600">{photoError}</p>}
          <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl border border-blue-200/50 p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <span className="text-white text-sm">👤</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">
              {userInfo.first_name || 'Patient'} {userInfo.last_name || 'Name'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">PID: {patientId}</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">{patientInfo.status}</span>
            </div>
          </div>
        </div>
      </div>

      {showStepErrors && Object.keys(errors).length > 0 && (
        <div ref={errorRef} className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200 p-3">
          <div className="flex items-start space-x-2">
            <div className="p-1.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
              <span className="text-white text-sm">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-rose-700 mb-1">Required fields missing:</p>
              <ul className="text-xs text-rose-600 space-y-0.5">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormInput label="First Name" name="first_name" value={userInfo.first_name} onChange={handleUserInfoChange} placeholder="First name" required error={errors.first_name} icon="👤" className="sm:col-span-2 lg:col-span-1" />
        <FormInput label="Last Name" name="last_name" value={userInfo.last_name} onChange={handleUserInfoChange} placeholder="Last name" required error={errors.last_name} icon="👥" className="sm:col-span-2 lg:col-span-1" />
        <FormInput label="Other Name" name="other_name" value={userInfo.other_name} onChange={handleUserInfoChange} placeholder="Middle name" icon="✨" className="sm:col-span-2 lg:col-span-1" />
        <FormInput label="Gender" name="gender" value={userInfo.gender} onChange={handleUserInfoChange} required error={errors.gender} icon="⚤" selectOptions={genders} className="sm:col-span-2 lg:col-span-1" />
        <FormInput label="Date of Birth" name="date_of_birth" value={patientInfo.date_of_birth} onChange={handlePatientInfoChange} type="date" error={errors.date_of_birth} icon="📅" className="sm:col-span-2 lg:col-span-1" />
        <FormInput label="Age" name="age" value={patientInfo.age} onChange={handlePatientInfoChange} type="number" placeholder="Years" error={errors.age} icon="🎂" className="sm:col-span-2 lg:col-span-1" />
        <FormInput label="Phone" name="phone" value={patientInfo.phone} onChange={handlePatientInfoChange} type="tel" placeholder="Phone number" required error={errors.phone} icon="📱" className="sm:col-span-2 lg:col-span-1" />
        <FormInput label="Email" name="email" value={userInfo.email} onChange={handleUserInfoChange} type="email" placeholder="Email address" icon="✉️" className="sm:col-span-2 lg:col-span-1" />
        <FormInput label="Occupation" name="occupation" value={patientInfo.occupation} onChange={handlePatientInfoChange} placeholder="Occupation" icon="💼" className="sm:col-span-2 lg:col-span-1" />
        {maritalStatuses.length > 0 && (
          <FormInput label="Marital Status" name="marital_status" value={patientInfo.marital_status} onChange={handlePatientInfoChange} icon="💍" selectOptions={maritalStatuses} className="sm:col-span-2 lg:col-span-1" />
        )}
        {religions.length > 0 && (
          <FormInput label="Religion" name="religion" value={patientInfo.religion} onChange={handlePatientInfoChange} icon="🕊️" selectOptions={religions} className="sm:col-span-2 lg:col-span-1" />
        )}
      </div>

      {renderPhotoSection()}
    </div>
  );

  const renderAddressInfo = () => (
    <div className="space-y-6">
      {showStepErrors && Object.keys(errors).length > 0 && (
        <div ref={errorRef} className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200 p-3">
          <div className="flex items-start space-x-2">
            <div className="p-1.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
              <span className="text-white text-sm">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-rose-700 mb-1">Required fields missing:</p>
              <ul className="text-xs text-rose-600 space-y-0.5">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Residential Address */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <span className="text-white text-sm">🏠</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Residential Address</h3>
            <p className="text-xs text-gray-600">Current living address</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <FormInput
              label="Address" name="address" value={residentialAddress.address}
              onChange={handleResidentialAddressChange} placeholder="Street address"
              required error={errors.residential_address} icon="📍"
            />
          </div>

          <FormInput
            label="Town/City" name="town" value={residentialAddress.town}
            onChange={handleResidentialAddressChange} placeholder="Town or city" icon="🏙️"
          />

          {/* State — dedicated handler resets LGA on change */}
          <FormInput
            label="Country" name="country" value={residentialAddress.country}
            onChange={handleResidentialAddressChange} icon="🌍" selectOptions={countries}
          />
          
          <FormInput
            label="State of Origin" name="state_of_origin"
            value={residentialAddress.state_of_origin}
            onChange={handleResidentialStateChange}
            icon="🗺️" selectOptions={states}
          />

          {/* LGA — filtered by selected state */}
          <LGASelect
            name="local_government_area"
            value={residentialAddress.local_government_area}
            onChange={handleResidentialAddressChange}
            disabled={!residentialAddress.state_of_origin}
            filteredLgas={residentialFilteredLgas}
          />


          <FormInput
            label="National ID" name="national_id" value={residentialAddress.national_id}
            onChange={handleResidentialAddressChange} placeholder="National ID number" icon="🆔"
          />
        </div>
      </div>

      {/* Permanent Address */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <span className="text-white text-sm">📍</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Permanent Address</h3>
            <p className="text-xs text-gray-600">Home/permanent address</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <FormInput
              label="Address" name="address" value={permanentAddress.address}
              onChange={handlePermanentAddressChange} placeholder="Permanent address"
              required error={errors.permanent_address} icon="🏡"
            />
          </div>

          <FormInput
            label="Town/City" name="town" value={permanentAddress.town}
            onChange={handlePermanentAddressChange} placeholder="Town or city" icon="🏘️"
          />

          {/* State — dedicated handler resets LGA on change */}
          <FormInput
            label="State of Residence" name="state_of_residence"
            value={permanentAddress.state_of_residence}
            onChange={handlePermanentStateChange}
            icon="🗺️" selectOptions={states}
          />

          {/* LGA — filtered by selected state */}
          <LGASelect
            name="local_government_area_of_residence"
            value={permanentAddress.local_government_area_of_residence}
            onChange={handlePermanentAddressChange}
            disabled={!permanentAddress.state_of_residence}
            filteredLgas={permanentFilteredLgas}
          />
        </div>
      </div>
    </div>
  );

  const renderNextOfKinInfo = () => (
    <div className="space-y-6">
      {showStepErrors && Object.keys(errors).length > 0 && (
        <div ref={errorRef} className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200 p-3">
          <div className="flex items-start space-x-2">
            <div className="p-1.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
              <span className="text-white text-sm">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-rose-700 mb-1">Required fields missing:</p>
              <ul className="text-xs text-rose-600 space-y-0.5">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
            <span className="text-white text-sm">❤️</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Next of Kin Information</h3>
            <p className="text-xs text-gray-600">Emergency contact details</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <FormInput label="Full Name" name="full_names" value={nextOfKin.full_names} onChange={handleNextOfKinChange} placeholder="Full name" required error={errors.full_names} icon="👤" />
          </div>
          <FormInput label="Phone" name="phone_no" value={nextOfKin.phone_no} onChange={handleNextOfKinChange} type="tel" placeholder="Phone number" required error={errors.phone_no} icon="📱" />
          <FormInput label="Email" name="email" value={nextOfKin.email} onChange={handleNextOfKinChange} type="email" placeholder="Email address" icon="✉️" />
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Address</label>
              <div className="relative group">
                <div className="absolute left-3 top-3 text-blue-500 group-hover:text-blue-600 transition-colors">🏡</div>
                <textarea
                  name="address"
                  value={nextOfKin.address}
                  onChange={handleNextOfKinChange}
                  rows="2"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 resize-none"
                  placeholder="Full address"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderPersonalInfo();
      case 2: return renderAddressInfo();
      case 3: return renderNextOfKinInfo();
      default: return renderPersonalInfo();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full"></div>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-700">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
        <div className="max-w-sm p-6 bg-white rounded-2xl shadow-lg border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
              <span className="text-white">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Patient Not Found</h3>
              <p className="text-sm text-gray-600">Patient record doesn't exist</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/patient-summary')}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
          >
            ← Back to Patient List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Updating Patient
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">PID-{patientId}</span>
                <span className="text-xs text-gray-500">|</span>
                <span className="text-xs text-gray-600 truncate max-w-[120px]">
                  {userInfo.first_name} {userInfo.last_name}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/patient-summary/${patientId}`)}
              className="px-2.5 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1"
            >
              <span>←</span>
              <span>Back</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-200">
            {renderStepIndicator()}
          </div>

          <div className="p-5 md:p-6">
            {renderCurrentStep()}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-5 py-2 text-sm rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <span>←</span>
                <span>Previous</span>
              </button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Step <span className="font-bold text-blue-600">{currentStep}</span> of <span className="font-bold text-blue-600">{totalSteps}</span>
                </p>
              </div>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Update Patient</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="text-sm font-bold text-blue-600">PID-{patientId}</div>
                <div className="text-xs text-gray-600">Patient ID</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <div className="text-sm font-bold text-emerald-600">
                  {patientData.active_visit ? 'Active' : 'Inactive'}
                </div>
                <div className="text-xs text-gray-600">Status</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="text-sm font-bold text-purple-600">
                  {new Date(patientData.date_created).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-600">Registered</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            <span className="font-medium text-blue-600">Patient ID:</span> PID-{patientId}
            <span className="mx-2">•</span>
            <span className="font-medium text-emerald-600">Last Updated:</span> {new Date().toLocaleDateString()}
            <span className="mx-2">•</span>
            <span className="font-medium text-purple-600">Required fields marked with *</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientUpdate;