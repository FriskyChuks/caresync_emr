import React from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";

// Core
import Dashboard from "../pages/Dashboard";
import ChangePassword from "../pages/accounts/ChangePassword";
import UserManagement from "../pages/accounts/user_management/UserManagement";

// Appointments
import AppointmentList from "../pages/appointments/AppointmentList";

// Locations
import Clinics from "../pages/locations/outpatients/Clinics";
import ClinicDetails from "../pages/locations/outpatients/ClinicDetails";
import Wards from "../pages/locations/inpatients/Wards";
import WardDetails from "../pages/locations/inpatients/WardDetails";

// Triage & Clerking
import CreateTriage from "../pages/triage/CreateTriage";
import Clerking from "../pages/clerking/Clerking";

// Patients
import PatientRegistration from "../pages/patients/PatientRegistration";
import PatientUpdate from "../pages/patients/PatientUpdate";
import PatientDashboard from "../pages/patients/PatientDashboard";
// import PatientList from "../pages/patients/PatientList";
import PatientSummary from "../pages/patients/PatientSummary";
import PatientSearchResults from "../pages/patients/PatientsSearchResults";
import PatientFolder from "../pages/patients/PatientFolder";

// Laboratory
import LabTestManager from "../pages/lab/LabTestManager";
import LabDashboard from "../pages/lab/LabDashboard";
import EnterLabResults from "../pages/lab/EnterLabResults";
import ResultView from "../pages/lab/ResultView";

// Radiology
import RadiologyDashboard from "../pages/radiology/RadiologyDashboard";
import CreateRadiologyUnit from "../pages/radiology/CreateRadiologyUnit";
import InvestigationManagement from "../pages/radiology/InvestigationManagement";
import ResultEntry from "../pages/radiology/ResultEntry";

// Pharmacy
import PharmacyDashboard from "../pages/pharmacy/PharmacyDashboard";
import ProductManagement from "../pages/pharmacy/ProductManagement";
import BrandManagement from "../pages/pharmacy/BrandManagement";
import InventoryManagement from "../pages/pharmacy/InventoryManagement";
import PrescriptionManagement from "../pages/pharmacy/PrescriptionManagement";
import DispensaryManagement from "../pages/pharmacy/DispensaryManagement";
import SupplierManagement from "../pages/pharmacy/SupplierManagement";
import StockTransferManagement from "../pages/pharmacy/StockTransferManagement";

// Billing
import LabDeskOfficerBilling from "../pages/billing/LabDeskOfficerBilling";
import CashierDashboard from "../pages/billing/cashier/CashierDashboard";
import RadiologyBillingPage from "../pages/billing/RadiologyBillingPage";

// Antenatal
import AntenatalDashboard from "../pages/antenatal/AntenatalDashboard";
import AntenatalVitals from "../pages/antenatal/AntenatalVitals";
import AntenatalBookings from "../pages/antenatal/AntenatalBookings";
import AntenatalComplaints from "../pages/antenatal/AntenatalComplaints";
import AntenatalDelivery from "../pages/antenatal/AntenatalDelivery";
import AntenatalFollowUp from "../pages/antenatal/AntenatalFollowUp";
import AntenatalLabRequests from "../pages/antenatal/AntenatalLabRequests";
import AntenatalHistory from "../pages/antenatal/AntenatalHistory";
import AntenatalUltrasound from "../pages/antenatal/AntenatalUltrasound";

// ENT
import ENTClerking from "../pages/ent/EntClerking";

// Helper component to reduce repetition
const ProtectedRoute = ({ children }) => (
  <PrivateRoute>{children}</PrivateRoute>
);

// Route constants for consistency
const ROUTES = {
  // Core
  DASHBOARD: "/dashboard",
  CHANGE_PASSWORD: "/change-password",
  USER_MANAGEMENT: "/user-management",
  
  // Appointments
  APPOINTMENTS: "/appointment-list",
  
  // Locations
  CLINICS: "/clinics",
  CLINIC_DETAILS: "/clinic-details/:id",
  WARDS: "/wards",
  WARD_DETAILS: "/ward-details/:id",
  
  // Triage
  CREATE_TRIAGE: "/create-triage/:pid",
  CLERKING: "/clerking/:pid?",
  
  // Patients
  // PATIENT_LIST: "/patient-list",
  PATIENT_DASHBOARD: "/patient-dashboard",
  PATIENT_REGISTRATION: "/patient-registration",
  PATIENT_UPDATE: "/patient-update/:patientId",
  PATIENT_SUMMARY: "/patient-summary/:patientId",
  PATIENT_SEARCH: "/patient/search",
  PATIENT_FOLDER: "/patient/folder/:pid",
  
  // Lab
  LAB_TEST_MANAGER: "/lab-test-manager",
  LAB_DASHBOARD: "/lab/dashboard",
  LAB_ENTER_RESULTS: "/lab/enter-results/:request_id",
  LAB_RESULT_SUMMARY: "/lab/result-summary/:id",
  
  // Radiology
  RADIOLOGY_DASHBOARD: "/radiology-dashboard",
  CREATE_RADIOLOGY_UNIT: "/create-radiology-unit",
  CREATE_RADIOLOGY_INVESTIGATION: "/create-radiology-investigation",
  RADIOLOGY_RESULT_ENTRY: "/radiology/result-entry/:requestId",
  
  // Pharmacy
  PHARMACY_DASHBOARD: "/pharmacy/dashboard",
  PHARMACY_PRODUCTS: "/pharmacy/products",
  PHARMACY_BRANDS: "/pharmacy/brands",
  PHARMACY_INVENTORY: "/pharmacy/inventory",
  PHARMACY_PRESCRIPTIONS: "/pharmacy/prescriptions",
  PHARMACY_PRESCRIPTIONS_PATIENT: "/pharmacy/prescriptions/:patientId",
  PHARMACY_DISPENSARY: "/pharmacy/dispensary",
  PHARMACY_SUPPLIERS: "/pharmacy/suppliers",
  PHARMACY_TRANSFERS: "/pharmacy/transfers",
  
  // Billing
  BILLING_LAB_OFFICER: "/billing/lab-desk-officer/:pid",
  BILLING_CASHIER: "/billing/cashier-dashboard",
  BILLING_RADIOLOGY: "/radiology/billing/:patientId",

  // ---------------- SPECIALITY CLINICS ----------------  
  // Antenatal
  ANTENATAL_DASHBOARD: "/antenatal-dashboard/:pid",
  ANTENATAL_VITALS: "/antenatal-vitals/:pid",
  ANTENATAL_BOOKINGS: "/antenatal-bookings/:pid",
  ANTENATAL_FOLLOWUP: "/antenatal-followup/:pid",
  ANTENATAL_LABS: "/antenatal-labs/:pid",
  ANTENATAL_COMPLAINTS: "/antenatal-complaints/:pid",
  ANTENATAL_DELIVERY: "/antenatal-delivery/:pid",
  ANTENATAL_HISTORY: "/antenatal-history/:pid",
  ANTENATAL_ULTRASOUND: "/antenatal-Ultrasound/:pid",

  // ENT
  ENTCLERKING: "/ent/entclerking/:pid?"
};

function AppRoute() {
  return (
    <Routes>
      {/* Dashboard & Account */}
      <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path={ROUTES.CHANGE_PASSWORD} element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path={ROUTES.USER_MANAGEMENT} element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />

      {/* Appointments */}
      <Route path={ROUTES.APPOINTMENTS} element={<ProtectedRoute><AppointmentList /></ProtectedRoute>} />

      {/* Locations - Clinics & Wards */}
      <Route path={ROUTES.CLINICS} element={<ProtectedRoute><Clinics /></ProtectedRoute>} />
      <Route path={ROUTES.CLINIC_DETAILS} element={<ProtectedRoute><ClinicDetails /></ProtectedRoute>} />
      <Route path={ROUTES.WARDS} element={<ProtectedRoute><Wards /></ProtectedRoute>} />
      <Route path={ROUTES.WARD_DETAILS} element={<ProtectedRoute><WardDetails /></ProtectedRoute>} />

      {/* Triage & Clerking */}
      <Route path={ROUTES.CREATE_TRIAGE} element={<ProtectedRoute><CreateTriage /></ProtectedRoute>} />
      <Route path={ROUTES.CLERKING} element={<ProtectedRoute><Clerking /></ProtectedRoute>} />

      {/* Patient Management */}
      {/* <Route path={ROUTES.PATIENT_LIST} element={<ProtectedRoute><PatientList /></ProtectedRoute>} /> */}
      <Route path={ROUTES.PATIENT_DASHBOARD} element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.PATIENT_REGISTRATION} element={<ProtectedRoute><PatientRegistration /></ProtectedRoute>} />
      <Route path={ROUTES.PATIENT_UPDATE} element={<ProtectedRoute><PatientUpdate /></ProtectedRoute>} />
      <Route path={ROUTES.PATIENT_SUMMARY} element={<ProtectedRoute><PatientSummary /></ProtectedRoute>} />
      <Route path={ROUTES.PATIENT_SEARCH} element={<ProtectedRoute><PatientSearchResults /></ProtectedRoute>} />
      <Route path={ROUTES.PATIENT_FOLDER} element={<ProtectedRoute><PatientFolder /></ProtectedRoute>} />

      {/* Laboratory */}
      <Route path={ROUTES.LAB_TEST_MANAGER} element={<ProtectedRoute><LabTestManager /></ProtectedRoute>} />
      <Route path={ROUTES.LAB_DASHBOARD} element={<ProtectedRoute><LabDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.LAB_ENTER_RESULTS} element={<ProtectedRoute><EnterLabResults /></ProtectedRoute>} />
      <Route path={ROUTES.LAB_RESULT_SUMMARY} element={<ProtectedRoute><ResultView /></ProtectedRoute>} />

      {/* Radiology */}
      <Route path={ROUTES.RADIOLOGY_DASHBOARD} element={<ProtectedRoute><RadiologyDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.CREATE_RADIOLOGY_UNIT} element={<ProtectedRoute><CreateRadiologyUnit /></ProtectedRoute>} />
      <Route path={ROUTES.CREATE_RADIOLOGY_INVESTIGATION} element={<ProtectedRoute><InvestigationManagement /></ProtectedRoute>} />
      <Route path={ROUTES.RADIOLOGY_RESULT_ENTRY} element={<ProtectedRoute><ResultEntry /></ProtectedRoute>} />

      {/* Pharmacy */}
      <Route path={ROUTES.PHARMACY_DASHBOARD} element={<ProtectedRoute><PharmacyDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.PHARMACY_PRODUCTS} element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
      <Route path={ROUTES.PHARMACY_BRANDS} element={<ProtectedRoute><BrandManagement /></ProtectedRoute>} />
      <Route path={ROUTES.PHARMACY_INVENTORY} element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
      <Route path={ROUTES.PHARMACY_PRESCRIPTIONS} element={<ProtectedRoute><PrescriptionManagement /></ProtectedRoute>} />
      <Route path={ROUTES.PHARMACY_PRESCRIPTIONS_PATIENT} element={<ProtectedRoute><PrescriptionManagement /></ProtectedRoute>} />
      <Route path={ROUTES.PHARMACY_DISPENSARY} element={<ProtectedRoute><DispensaryManagement /></ProtectedRoute>} />
      <Route path={ROUTES.PHARMACY_SUPPLIERS} element={<ProtectedRoute><SupplierManagement /></ProtectedRoute>} />
      <Route path={ROUTES.PHARMACY_TRANSFERS} element={<ProtectedRoute><StockTransferManagement /></ProtectedRoute>} />

      {/* Billing */}
      <Route path={ROUTES.BILLING_LAB_OFFICER} element={<ProtectedRoute><LabDeskOfficerBilling /></ProtectedRoute>} />
      <Route path={ROUTES.BILLING_CASHIER} element={<ProtectedRoute><CashierDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.BILLING_RADIOLOGY} element={<ProtectedRoute><RadiologyBillingPage /></ProtectedRoute>} />

      {/* Antenatal (All Protected) */}
      <Route path={ROUTES.ANTENATAL_DASHBOARD} element={<ProtectedRoute><AntenatalDashboard /></ProtectedRoute>} />
      <Route path={ROUTES.ANTENATAL_VITALS} element={<ProtectedRoute><AntenatalVitals /></ProtectedRoute>} />
      <Route path={ROUTES.ANTENATAL_BOOKINGS} element={<ProtectedRoute><AntenatalBookings /></ProtectedRoute>} />
      <Route path={ROUTES.ANTENATAL_FOLLOWUP} element={<ProtectedRoute><AntenatalFollowUp /></ProtectedRoute>} />
      <Route path={ROUTES.ANTENATAL_LABS} element={<ProtectedRoute><AntenatalLabRequests /></ProtectedRoute>} />
      <Route path={ROUTES.ANTENATAL_COMPLAINTS} element={<ProtectedRoute><AntenatalComplaints /></ProtectedRoute>} />
      <Route path={ROUTES.ANTENATAL_DELIVERY} element={<ProtectedRoute><AntenatalDelivery /></ProtectedRoute>} />
      <Route path={ROUTES.ANTENATAL_HISTORY} element={<ProtectedRoute><AntenatalHistory /></ProtectedRoute>} />
      <Route path={ROUTES.ANTENATAL_ULTRASOUND} element={<ProtectedRoute><AntenatalUltrasound /></ProtectedRoute>} />

      {/* ENT */}
      <Route path={ROUTES.ENTCLERKING} element={<ProtectedRoute><ENTClerking /></ProtectedRoute>} />
    </Routes>
  );
}

export default AppRoute;