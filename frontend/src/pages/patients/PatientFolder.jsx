import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

import PatientOverview from "./folderComponents/PatientOverview";
import PatientVisits from "./folderComponents/PatientVisits";
import PatientReports from "./folderComponents/PatientReports";
import PatientPharmacy from "./folderComponents/PatientPharmacy";
import PatientBilling from "./folderComponents/PatientBilling";
import PatientTimeline from "./folderComponents/PatientTimeline";
import PatientEncounterRoute from "./folderComponents/PatientEncounterRoute";
import QuickServicePoints from "./folderComponents/QuickServicePoints";
import PatientVitals from "./folderComponents/PatientVitals";
import PatientServices from "./folderComponents/PatientServices";

const PatientFolder = () => {
  const { pid } = useParams();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // patient data states
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [visits, setVisits] = useState([]);
  const [reports, setReports] = useState([]);
  const [pharmacy, setPharmacy] = useState([]);
  const [billing, setBilling] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          patientRes,
          vitalsRes,
          visitsRes,
          reportsRes,
          pharmacyRes,
          billingRes,
          timelineRes,
          encountersRes,
          servicesRes,
        ] = await Promise.all([
          axiosInstance.get(`/patientsapi/patient_detail/${pid}/`),
          axiosInstance.get(`/triageapi/patients/${pid}/`),
        //   axiosInstance.get(`/visitsapi/patients/${pid}/`),
        //   axiosInstance.get(`/reportsapi/patients/${pid}/`),
        //   axiosInstance.get(`/pharmacyapi/patient_orders/${pid}/`),
        //   axiosInstance.get(`/billingapi/patients/${pid}/`),
        //   axiosInstance.get(`/encountersapi/patient_timeline/${pid}/`),
        //   axiosInstance.get(`/encountersapi/patient_route/${pid}/`),
        //   axiosInstance.get(`/servicesapi/patients/${pid}/`),
        ]);

        setPatient(patientRes.data);
        setVitals(vitalsRes.data);
        // setVisits(visitsRes.data);
        // setReports(reportsRes.data);
        // setPharmacy(pharmacyRes.data);
        // setBilling(billingRes.data);
        // setTimeline(timelineRes.data);
        // setEncounters(encountersRes.data);
        // setServices(servicesRes.data);
      } catch (err) {
        console.error("Error fetching patient folder data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (pid) fetchData();
  }, [pid]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "ri-user-3-line" },
    { id: "vitals", label: "Vital Signs", icon: "ri-heart-pulse-line" },
    { id: "services", label: "Services", icon: "ri-hospital-line" },
    { id: "visits", label: "Visits", icon: "ri-stethoscope-line" },
    { id: "reports", label: "Reports", icon: "ri-file-list-3-line" },
    { id: "pharmacy", label: "Pharmacy", icon: "ri-capsule-line" },
    { id: "billing", label: "Billing", icon: "ri-wallet-3-line" },
    { id: "timeline", label: "Timeline", icon: "ri-timeline-view" },
    { id: "encounter", label: "Encounter Route", icon: "ri-route-line" },
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading patient folder...</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* Overview always on top */}
      <PatientOverview patient={patient} vitals={vitals} />

      {/* Tabs */}
      <ul className="nav nav-pills mb-3 gap-2 flex-wrap">
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.id}>
            <button
              className={`btn btn-light shadow-sm d-flex align-items-center px-3 py-2 rounded-3 ${
                activeTab === tab.id ? "active btn-primary text-white" : "btn-light"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`${tab.icon} me-2`}></i>
              <span>{tab.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Quick Service Points (optional) */}
      {/* <QuickServicePoints /> */}

      {/* Tab Content */}
      {activeTab === "overview" && <p className="text-muted">Patient details at a glance...</p>}
      {activeTab === "vitals" && <PatientVitals patient={patient} vitals={vitals} />}
      {activeTab === "services" && <PatientServices services={services} />}
      {activeTab === "visits" && <PatientVisits visits={visits} />}
      {activeTab === "reports" && <PatientReports reports={reports} />}
      {activeTab === "pharmacy" && <PatientPharmacy pharmacy={pharmacy} />}
      {activeTab === "billing" && <PatientBilling billing={billing} />}
      {activeTab === "timeline" && <PatientTimeline timeline={timeline} />}
      {activeTab === "encounter" && <PatientEncounterRoute encounters={encounters} />}
    </div>
  );
};

export default PatientFolder;
