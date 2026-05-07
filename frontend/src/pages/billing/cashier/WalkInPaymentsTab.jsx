import React, { useState, useRef } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useMessage } from "../../../context/MessageProvider";

const WalkInPaymentsTab = () => {
  const { showMessage } = useMessage();
  const [saving, setSaving] = useState(false);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const patientSearchRef = useRef(null);
  const serviceSearchRef = useRef(null);
  const [serviceQuery, setServiceQuery] = useState("");

  const [form, setForm] = useState({
    patient: "",
    walkin_name: "",
    walkin_phone: "",
    selectedServices: [],
    payment_method: "",
    notes: "",
  });

  // Search functions
  const handlePatientSearch = (query) => {
    clearTimeout(patientSearchRef.current);
    if (!query) return setPatients([]);
    patientSearchRef.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(`/patientsapi/patient_search/?q=${query}`);
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  const handleServiceSearch = (query) => {
    clearTimeout(serviceSearchRef.current);
    if (!query) return setServices([]);
    serviceSearchRef.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(`/servicesapi/search/?q=${query}`);
        setServices(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  // Service management
  const handleSelectService = (srv) => {
    const alreadyAdded = form.selectedServices.find((s) => s.id === srv.id);
    if (alreadyAdded) return showMessage("Service already added", "info");

    const updated = [...form.selectedServices, { 
      id: srv.id, 
      name: srv.name, 
      price: Number(srv.price) 
    }];

    setForm({
      ...form,
      selectedServices: updated,
      notes: `Payment for ${updated.map((s) => s.name).join(", ")}`,
    });
    setServices([]);
    setServiceQuery("");
  };

  const handleRemoveService = (id) => {
    const updated = form.selectedServices.filter((s) => s.id !== id);
    setForm({
      ...form,
      selectedServices: updated,
      notes: updated.length > 0 ? `Payment for ${updated.map((s) => s.name).join(", ")}` : "",
    });
  };

  const totalAmount = form.selectedServices.reduce((sum, s) => sum + s.price, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.selectedServices.length === 0 || !form.payment_method) {
      showMessage("Select service & payment method", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        patient: form.patient || null,
        walkin_name: !form.patient ? form.walkin_name : null,
        walkin_phone: !form.patient ? form.walkin_phone : null,
        services: form.selectedServices.map((s) => ({
          description: s.name,
          amount: s.price,
        })),
        payment_method: form.payment_method,
        notes: form.notes,
      };

      await axiosInstance.post(`/billsapi/walkin-payment/`, payload);
      showMessage("✅ Payment recorded", "success");

      setForm({
        patient: "",
        walkin_name: "",
        walkin_phone: "",
        selectedServices: [],
        payment_method: "",
        notes: "",
      });
      setServiceQuery("");
    } catch (err) {
      showMessage("❌ Payment failed", "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
          <span className="text-white text-sm">💰</span>
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">Walk-In Payments</h3>
          <p className="text-xs text-gray-600">Process instant payments</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Patient Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
            Patient Info
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Search Patient</label>
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-400 text-xs">👤</span>
                <input
                  type="text"
                  className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Name..."
                  value={form.walkin_name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, walkin_name: val, patient: "" });
                    handlePatientSearch(val);
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Phone</label>
              <input
                type="text"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Phone..."
                readOnly={!!form.patient}
                value={form.walkin_phone}
                onChange={(e) => {
                  if (!form.patient) setForm({ ...form, walkin_phone: e.target.value });
                }}
              />
            </div>
          </div>

          {/* Patient Results */}
          {patients.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded max-h-32 overflow-y-auto">
              {patients.map((pt) => (
                <div
                  key={pt.id}
                  className="px-2 py-1.5 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                  onClick={() => {
                    setForm({
                      ...form,
                      patient: pt.id,
                      walkin_name: `${pt.first_name} ${pt.last_name}`,
                      walkin_phone: pt.patient_data?.phone || "",
                    });
                    setPatients([]);
                  }}
                >
                  <div className="font-medium text-gray-800">
                    {pt.first_name} {pt.last_name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {pt.patient_data?.phone || "No phone"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Service Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
            Services
          </div>
          
          <div className="mb-2">
            <label className="block text-xs text-gray-600 mb-1">Add Service</label>
            <div className="relative">
              <span className="absolute left-2 top-2 text-gray-400 text-xs">🔍</span>
              <input
                type="text"
                className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search services..."
                value={serviceQuery}
                onChange={(e) => {
                  setServiceQuery(e.target.value);
                  handleServiceSearch(e.target.value);
                }}
              />
            </div>
          </div>

          {/* Service Results */}
          {services.length > 0 && (
            <div className="mb-2 border border-gray-200 rounded max-h-32 overflow-y-auto">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="px-2 py-1.5 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex justify-between"
                  onClick={() => handleSelectService(srv)}
                >
                  <span className="font-medium text-gray-800">{srv.name}</span>
                  <span className="font-semibold text-blue-600">
                    ₦{Number(srv.price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Selected Services */}
          {form.selectedServices.length > 0 && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">Selected</label>
              <div className="space-y-1">
                {form.selectedServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded px-2 py-1 text-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-blue-800">{srv.name}</span>
                      <span className="text-xs font-bold text-emerald-700">
                        ₦{srv.price.toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 text-xs"
                      onClick={() => handleRemoveService(srv.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
            Payment
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Total</label>
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-400 text-xs">₦</span>
                <input
                  type="text"
                  className="w-full pl-6 pr-2 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded font-bold text-emerald-700"
                  value={totalAmount.toLocaleString()}
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Method</label>
              <select
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                required
              >
                <option value="">Select...</option>
                <option value="cash">Cash</option>
                <option value="pos">POS</option>
                <option value="transfer">Transfer</option>
                <option 
                  value="wallet" 
                  className={!form.patient ? "text-gray-400" : ""}
                  disabled={!form.patient}
                >
                  Wallet
                </option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Notes</label>
            <textarea
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="1"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Payment notes..."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || form.selectedServices.length === 0 || !form.payment_method}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              saving || form.selectedServices.length === 0 || !form.payment_method
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]'
            }`}
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span>💾</span>
                <span>Record Payment</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WalkInPaymentsTab;