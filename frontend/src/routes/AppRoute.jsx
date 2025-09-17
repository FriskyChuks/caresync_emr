import React from "react";
import { Route } from "react-router-dom"; // ✅ important
import Dashboard from "../pages/Dashboard";
import PatientList from "../pages/patients/PatientList";
import PatientDashboard from "../pages/patients/PatientDashboard";
import AppointmentList from "../pages/appointments/AppointmentList";
import CreateLabTest from "../pages/lab/CreateLabTest";
import PrivateRoute from "../components/PrivateRoute";
import PatientRegistration from "../pages/patients/PatientRegistration";
import Clinics from "../pages/locations/outpatients/Clinics";
import Wards from "../pages/locations/inpatients/Wards";
import ClinicDetails from "../pages/locations/outpatients/ClinicDetails";
import WardDetails from "../pages/locations/inpatients/WardDetails";
import CreateTriage from "../pages/triage/CreateTriage";
import PatientSummary from "../pages/patients/PatientSummary";
import PatientSearchResults from "../pages/patients/PatientsSearchResults";
import PatientFolder from "../pages/patients/PatientFolder";
import LabTestRequest from "../pages/lab/LabTestRequest";

function AppRoute() {
  return (
    <>
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

      {/* LOCATIONS --> Clinics and Wards */}
      <Route path="/clinics" element={<PrivateRoute><Clinics /></PrivateRoute>} />
      <Route path="/clinic-details/:id" element={<PrivateRoute><ClinicDetails /></PrivateRoute>} />
      <Route path="/wards" element={<PrivateRoute><Wards /></PrivateRoute>} />
      <Route path="/ward-details/:id" element={<PrivateRoute><WardDetails /></PrivateRoute>} />

      {/* Patients */}
      <Route path="/patient-list" element={<PrivateRoute><PatientList /></PrivateRoute>} />
      <Route path="/patient-dashboard" element={<PrivateRoute><PatientDashboard /></PrivateRoute>} />
      <Route path="/patient-registration" element={<PrivateRoute><PatientRegistration /></PrivateRoute>} />
      <Route path="/patient-summary/:patientId" element={<PrivateRoute><PatientSummary /></PrivateRoute>} />
      <Route path="/patient/search" element={<PrivateRoute><PatientSearchResults /></PrivateRoute>} />
      <Route path="/patient/folder/:pid" element={<PrivateRoute><PatientFolder /></PrivateRoute>} />

      <Route path="/appointment-list" element={<PrivateRoute><AppointmentList /></PrivateRoute>} />

      {/* LABS */}
      <Route path="/create-lab-test" element={<PrivateRoute><CreateLabTest /></PrivateRoute>} />
      <Route path="/labtest-request/:pid" element={<PrivateRoute><LabTestRequest /></PrivateRoute>} />

      {/* TRIAGE */}
      <Route path="/create-triage/:pid" element={<PrivateRoute><CreateTriage /></PrivateRoute>} />
    </>
  );
}

export default AppRoute;





// import { Routes, Route } from "react-router-dom";
// import Dashboard from "../pages/Dashboard";
// import PatientList from "../pages/patients/PatientList";
// import PatientDashboard from "../pages/patients/PatientDashboard";
// import AppointmentList from "../pages/appointments/AppointmentList";
// import CreateLabTest from "../pages/lab/CreateLabTest";
// import PrivateRoute from "../components/PrivateRoute";

// function AppRoute() {
//   return (
//     <div className="app-body">
//       <Routes>
//         <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
//         <Route path="/patient-list" element={<PrivateRoute><PatientList /></PrivateRoute>} />
//         <Route path="/patient-dashboard" element={<PrivateRoute><PatientDashboard /></PrivateRoute>} />
//         <Route path="/appointment-list" element={<PrivateRoute><AppointmentList /></PrivateRoute>} />
//         <Route path="/create-lab-test" element={<PrivateRoute><CreateLabTest /></PrivateRoute>} />
//       </Routes>
//     </div>
//   );
// }

// export default AppRoute;