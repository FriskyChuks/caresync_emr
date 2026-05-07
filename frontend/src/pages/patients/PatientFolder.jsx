import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import PatientOverview from "./folderComponents/PatientOverview";
import PatientPharmacy from "./folderComponents/PatientPharmacy";
import PatientBilling from "./folderComponents/PatientBilling";
import PatientEncounterRoute from "./folderComponents/PatientEncounterRoute";
import PatientVitals from "./folderComponents/PatientVitals";
import PatientServices from "./folderComponents/PatientServices";
import Clerking from "../clerking/Clerking";
import PatientRadiology from "./folderComponents/PatientRadiology";
import PatientLab from "./folderComponents/PatientLab";
import PatientFluidBalance from "./folderComponents/PatientFluidBalance";
import { DiagnosisList, DiagnosisSearchModal, DiagnosisSummary } from "../diagnosis";

const PatientFolder = () => {
  const { pid } = useParams();
  const [activeTab, setActiveTab] = useState("diagnosis");
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [refreshDiagnoses, setRefreshDiagnoses] = useState(0);
  const [refreshSummary, setRefreshSummary] = useState(0);
  const [isTabCollapsed, setIsTabCollapsed] = useState(false);
  
  const tabsContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Compact tab definitions with icons and labels
  const tabs = [
    { id: "diagnosis", label: "Dx", fullLabel: "Diagnosis", icon: "🩺", color: "blue" },
    { id: "vitals", label: "Vitals", fullLabel: "Vital Signs", icon: "❤️", color: "red" },
    { id: "fluid", label: "Fluid", fullLabel: "Fluid Balance", icon: "💧", color: "cyan" },
    { id: "notes", label: "Notes", fullLabel: "Clinical Notes", icon: "📝", color: "gray" },
    { id: "services", label: "Svc", fullLabel: "Services", icon: "🏥", color: "purple" },
    { id: "lab", label: "Lab", fullLabel: "Laboratory", icon: "🔬", color: "green" },
    { id: "radiology", label: "X-ray", fullLabel: "Radiology", icon: "📷", color: "orange" },
    { id: "pharmacy", label: "Pharm", fullLabel: "Pharmacy", icon: "💊", color: "pink" },
    { id: "billing", label: "Bill", fullLabel: "Billing", icon: "💰", color: "yellow" },
    { id: "encounter", label: "Visit", fullLabel: "Encounter", icon: "🚶", color: "indigo" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, vitalsRes] = await Promise.all([
          axiosInstance.get(`/patientsapi/patient_detail/${pid}/`),
          axiosInstance.get(`/triageapi/patients/${pid}/`),
        ]);
        setPatient(patientRes.data);
        setVitals(vitalsRes.data);
      } catch (err) {
        console.error("Error fetching patient folder data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (pid) fetchData();
  }, [pid]);

  // Check scroll position for arrows
  const checkScroll = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const routes = patient?.active_visit?.routes;
  const currentEncounterRoute = routes?.[0]?.id;
  const patient_id = patient?.id;

  const refreshAllDiagnoses = () => {
    setRefreshDiagnoses(prev => prev + 1);
    setRefreshSummary(prev => prev + 1);
  };

  const handleDiagnosisAdded = () => refreshAllDiagnoses();
  const handleDiagnosisUpdated = () => setRefreshSummary(prev => prev + 1);
  const handleDiagnosisResolved = () => refreshAllDiagnoses();
  const handleDiagnosisConfirmed = () => refreshAllDiagnoses();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-gray-500">Loading patient folder...</p>
        </div>
      </div>
    );
  }

  const getTabColor = (color) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 data-[active=true]:bg-blue-600 data-[active=true]:text-white",
      red: "bg-red-50 text-red-600 data-[active=true]:bg-red-600 data-[active=true]:text-white",
      cyan: "bg-cyan-50 text-cyan-600 data-[active=true]:bg-cyan-600 data-[active=true]:text-white",
      purple: "bg-purple-50 text-purple-600 data-[active=true]:bg-purple-600 data-[active=true]:text-white",
      green: "bg-green-50 text-green-600 data-[active=true]:bg-green-600 data-[active=true]:text-white",
      orange: "bg-orange-50 text-orange-600 data-[active=true]:bg-orange-600 data-[active=true]:text-white",
      pink: "bg-pink-50 text-pink-600 data-[active=true]:bg-pink-600 data-[active=true]:text-white",
      yellow: "bg-yellow-50 text-yellow-600 data-[active=true]:bg-yellow-600 data-[active=true]:text-white",
      indigo: "bg-indigo-50 text-indigo-600 data-[active=true]:bg-indigo-600 data-[active=true]:text-white",
      gray: "bg-gray-50 text-gray-600 data-[active=true]:bg-gray-600 data-[active=true]:text-white",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-20">
      {/* Patient Overview - Compact */}
      <PatientOverview patient={patient} vitals={vitals} />

      {/* Tabs Section - Collapsible & Scrollable */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab Header with Collapse Toggle */}
        <div className="border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between px-3 py-2">
            <button
              onClick={() => setIsTabCollapsed(!isTabCollapsed)}
              className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              <svg className={`w-4 h-4 transition-transform ${isTabCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>{tabs.find(t => t.id === activeTab)?.fullLabel || activeTab}</span>
            </button>
            
            {/* Quick Stats when collapsed */}
            {isTabCollapsed && activeTab === "diagnosis" && (
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Active</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Resolved</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Tabs (shown when not collapsed) */}
        {!isTabCollapsed && (
          <div className="relative border-b border-gray-100 bg-white">
            {/* Left Scroll Arrow */}
            {showLeftArrow && (
              <button
                onClick={() => scrollTabs('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur rounded-r-lg p-1 shadow-md hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {/* Tabs Container */}
            <div
              ref={tabsContainerRef}
              onScroll={checkScroll}
              className="flex overflow-x-auto scrollbar-hide gap-1 px-3 py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  data-active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${getTabColor(tab.color)} data-[active=true]:shadow-md`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.fullLabel}</span>
                  <span className="sm:hidden">{tab.label}</span>
                </button>
              ))}
            </div>
            
            {/* Right Scroll Arrow */}
            {showRightArrow && (
              <button
                onClick={() => scrollTabs('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur rounded-l-lg p-1 shadow-md hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Tab Content - Compact */}
        <div className="p-3 sm:p-4">
          {/* Diagnosis Tab */}
          {activeTab === "diagnosis" && (
            <div className="space-y-3">
              {/* Diagnosis Summary - Compact & Collapsible */}
              <DiagnosisSummary 
                patientId={patient_id} 
                refreshTrigger={refreshSummary}
              />
              
              {/* Add Diagnosis Button - Floating Action Button style for mobile */}
              <div className="sticky top-0 z-10 bg-white py-2 -mt-1">
                <button
                  onClick={() => setShowDiagnosisModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-xl shadow-md transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Diagnosis
                </button>
              </div>
              
              {/* Diagnosis List */}
              <DiagnosisList
                patientId={patient_id}
                encounterRouteId={currentEncounterRoute}
                refreshTrigger={refreshDiagnoses}
                onDiagnosisAdded={handleDiagnosisAdded}
                onDiagnosisUpdated={handleDiagnosisUpdated}
                onDiagnosisResolved={handleDiagnosisResolved}
                onDiagnosisConfirmed={handleDiagnosisConfirmed}
              />
            </div>
          )}

          {/* Other Tabs - Compact View */}
          {activeTab === "vitals" && <PatientVitals vitals={vitals} patient={patient} />}
          {activeTab === "fluid" && <PatientFluidBalance patient={patient} />}
          {activeTab === "notes" && <Clerking />}
          {activeTab === "services" && <PatientServices patient={patient} routes={routes} />}
          {activeTab === "lab" && <PatientLab patient={patient} />}
          {activeTab === "radiology" && <PatientRadiology patient={patient} />}
          {activeTab === "pharmacy" && <PatientPharmacy patient={patient} />}
          {activeTab === "billing" && <PatientBilling patient_id={patient_id} />}
          {activeTab === "encounter" && <PatientEncounterRoute routes={routes} />}
        </div>
      </div>

      {/* Diagnosis Modal */}
      <DiagnosisSearchModal
        show={showDiagnosisModal}
        onClose={() => setShowDiagnosisModal(false)}
        patientId={patient_id}
        encounterRouteId={currentEncounterRoute}
        onDiagnosisAdded={handleDiagnosisAdded}
        patientName={patient ? `${patient.user_info?.first_name} ${patient.user_info?.last_name}` : ""}
      />
    </div>
  );
};

export default PatientFolder;