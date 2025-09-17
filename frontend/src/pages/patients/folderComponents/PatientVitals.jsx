// folderComponents/PatientVitals.jsx
import React, { useState } from "react";
import ReusableModal from "../../../components/common/ReusableModal";
import VitalsForm from "../../triage/VitalsForm";
import axiosInstance from "../../../api/axiosInstance";
import { useMessage } from "../../../context/MessageProvider";
import useAuth from "../../../hooks/useAuth";

const PatientVitals = ({ vitals, loading, patient, onVitalsAdded }) => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    temp: "",
    weight: "",
    height: "",
    bp: "",
    spo2: "",
    pulse: "",
  });
  const [saving, setSaving] = useState(false);

  const { showMessage } = useMessage();
  const { user } = useAuth();

  if (loading) return <p className="text-muted">Loading vitals...</p>;
  if (!vitals || !vitals.length)
    return (
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body text-center py-5">
          <h6 className="text-muted">
            No vitals found for this patient.  
            <br />
            <small>Click the button below to add new vitals.</small>
          </h6>
          <button
            className="btn btn-primary mt-3"
            onClick={() => setShowModal(true)}
          >
            <i className="ri-add-line me-1"></i> Add Vitals
          </button>
        </div>

        {/* Modal */}
        <ReusableModal
          show={showModal}
          onClose={() => setShowModal(false)}
          title="Add New Vitals"
          size="lg"
        >
          {patient && (
            <div className="alert alert-info small">
              <strong>Patient:</strong> {patient.name} ({patient.hospital_id}){" "}
              | <strong>Age:</strong> {patient.age} | <strong>Sex:</strong>{" "}
              {patient.sex}
            </div>
          )}

          <form onSubmit={(e) => handleSaveVitals(e)}>
            <VitalsForm
              formData={formData}
              onChange={handleInputChange}
              disabled={saving}
            />
            <div className="text-end mt-3">
              <button
                type="button"
                className="btn btn-light me-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Vitals"}
              </button>
            </div>
          </form>
        </ReusableModal>
      </div>
    );

  // ---- filtering ----
  const filtered = vitals.filter((v) => {
    const bpMatch = v.bp ? v.bp.includes(search) : false;
    const pulseMatch = v.pulse ? String(v.pulse).includes(search) : false;
    const spo2Match = v.spo2 ? String(v.spo2).includes(search) : false;
    const dateMatch = v.date_recorded
      ? new Date(v.date_recorded)
          .toLocaleDateString()
          .toLowerCase()
          .includes(search.toLowerCase())
      : false;
    return bpMatch || pulseMatch || spo2Match || dateMatch;
  });

  // ---- helpers ----
  const checkAbnormalBP = (bp) => {
    if (!bp) return false;
    const [sys, dia] = bp.split("/").map(Number);
    return sys < 90 || sys > 140 || dia < 60 || dia > 90;
  };

  const calcBMI = (w, h) =>
    w && h ? (w / (h / 100) ** 2).toFixed(1) : null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { temp, weight, height, bp, spo2, pulse } = formData;
    if (![temp, weight, height, bp, spo2, pulse].some((v) => v !== "")) {
      alert("Please enter at least one vital sign before submitting.");
      return false;
    }
    if (bp && !/^\d{2,3}\/\d{2,3}$/.test(bp)) {
      alert("Blood pressure must be in format XXX/XX (e.g., 120/80)");
      return false;
    }
    if (temp && (temp < 30 || temp > 45)) {
      alert("Temperature should be between 30–45°C");
      return false;
    }
    if (spo2 && (spo2 < 0 || spo2 > 100)) {
      alert("SpO₂ should be between 0–100%");
      return false;
    }
    if (pulse && (pulse < 30 || pulse > 200)) {
      alert("Pulse should be between 30–200 bpm");
      return false;
    }
    return true;
  };
  console.log("patient:", patient)
  const handleSaveVitals = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const response = await axiosInstance.post(
        `/triageapi/patients/${patient.id}/`,
        {
          temp: formData.temp ? parseFloat(formData.temp) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          bp: formData.bp || null,
          spo2: formData.spo2 ? parseFloat(formData.spo2) : null,
          pulse: formData.pulse ? parseFloat(formData.pulse) : null,
          pid: patient.id,
          created_by: user.id,
        }
      );

      if (typeof onVitalsAdded === "function") {
        onVitalsAdded(response.data);
      }

      setFormData({
        temp: "",
        weight: "",
        height: "",
        bp: "",
        spo2: "",
        pulse: "",
      });
      setShowModal(false);

      showMessage("Vitals saved successfully", "success");
    } catch (err) {
      console.error("Error saving vitals:", err);
      showMessage("Failed to save vitals", "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center border-0">
        <h5 className="mb-0 fw-bold">🩺 Vitals History</h5>
        <div className="d-flex gap-2 align-items-center">
          <input
            type="text"
            placeholder="Search vitals..."
            className="form-control form-control-sm"
            style={{ width: "200px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn btn-sm btn-primary d-flex align-items-center"
            onClick={() => setShowModal(true)}
          >
            <i className="ri-add-line me-1"></i> New Vitals
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Temp (°C)</th>
                <th>Weight (Kg)</th>
                <th>Height (cm)</th>
                <th>BP</th>
                <th>SpO₂ (%)</th>
                <th>Pulse</th>
                <th>BMI (kg/m²)</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const bmi = calcBMI(v.weight, v.height);
                return (
                  <tr key={v.id}>
                    <td>
                      {v.date_recorded
                        ? new Date(v.date_recorded).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td
                      className={
                        v.temp != null && (v.temp > 37.5 || v.temp < 36)
                          ? "text-danger fw-bold"
                          : ""
                      }
                    >
                      {v.temp ?? "—"}
                    </td>
                    <td>{v.weight ?? "—"}</td>
                    <td>{v.height ?? "—"}</td>
                    <td
                      className={
                        v.bp && checkAbnormalBP(v.bp)
                          ? "text-danger fw-bold"
                          : ""
                      }
                    >
                      {v.bp || "—"}
                    </td>
                    <td
                      className={
                        v.spo2 != null && v.spo2 < 95
                          ? "text-danger fw-bold"
                          : ""
                      }
                    >
                      {v.spo2 ?? "—"}
                    </td>
                    <td
                      className={
                        v.pulse != null && (v.pulse < 60 || v.pulse > 100)
                          ? "text-warning fw-bold"
                          : ""
                      }
                    >
                      {v.pulse ?? "—"}
                    </td>
                    <td
                      className={
                        bmi && (bmi < 18.5 || bmi > 24.9)
                          ? "text-warning fw-bold"
                          : ""
                      }
                    >
                      {bmi || "—"}
                    </td>
                    <td>{v.recorded_by || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-muted text-center py-3">
              No vitals match search.
            </p>
          )}
        </div>
      </div>

      {/* Modal for adding new vitals */}
      <ReusableModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Vitals"
        size="lg"
      >
        {patient && (
          <div className="alert alert-info small">
            <strong>Patient:</strong> {patient.name} ({patient.hospital_id}) |{" "}
            <strong>Age:</strong> {patient.age} | <strong>Sex:</strong>{" "}
            {patient.sex}
          </div>
        )}
        <form onSubmit={handleSaveVitals}>
          <VitalsForm
            formData={formData}
            onChange={handleInputChange}
            disabled={saving}
          />
          <div className="text-end mt-3">
            <button
              type="button"
              className="btn btn-light me-2"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Vitals"}
            </button>
          </div>
        </form>
      </ReusableModal>
    </div>
  );
};

export default PatientVitals;
