import React, { useState } from "react";
import LabTestRequest from "./LabTestRequest"
import LabTestRequest from "./LabTestRequest"
import LabTestRequest from "./LabTestRequest"
import ViewTests from "./viewCreatedTest";
import VitalsForm from "../triage/VitalsForm";

const PatientLabManager = () => {
  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'view' | 'vitals'

  return (
    <div className="row gx-4">
      <div className="col-xl-12">
        <div className="card">
          <div className="card-body">
            <div className="custom-tabs-container">
              <ul className="nav nav-tabs" id="customTab2" role="tablist">
                {/* Create Tab */}
                <li className="nav-item" role="presentation">
                  <a
                    className={`nav-link ${activeTab === "create" ? "active" : ""}`}
                    onClick={() => setActiveTab("create")}
                    id="tab-create"
                    data-bs-toggle="tab"
                    role="tab"
                    aria-controls="create"
                    aria-selected={activeTab === "create"}
                  >
                    <i className="ri-temp-cold-line"></i> Create Test
                  </a>
                </li>

                {/* View Tab */}
                <li className="nav-item" role="presentation">
                  <a
                    className={`nav-link ${activeTab === "view" ? "active" : ""}`}
                    onClick={() => setActiveTab("view")}
                    id="tab-view"
                    data-bs-toggle="tab"
                    role="tab"
                    aria-controls="view"
                    aria-selected={activeTab === "view"}
                  >
                    <i className="ri-eye-line"></i> View Tests
                  </a>
                </li>

                {/* Vitals Tab (example third tab) */}
                <li className="nav-item" role="presentation">
                  <a
                    className={`nav-link ${activeTab === "vitals" ? "active" : ""}`}
                    onClick={() => setActiveTab("vitals")}
                    id="tab-vitals"
                    data-bs-toggle="tab"
                    role="tab"
                    aria-controls="vitals"
                    aria-selected={activeTab === "vitals"}
                  >
                    <i className="ri-heart-pulse-line"></i> Vitals
                  </a>
                </li>
              </ul>

              {/* Tab Content */}
              <div className="mt-3">
                {activeTab === "create" && <CreateLabTest />}
                {activeTab === "view" && <ViewTests />}
                {activeTab === "vitals" && <VitalsForm />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLabManager;
