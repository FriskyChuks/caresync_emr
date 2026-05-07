import React, { useState, useEffect } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useMessage } from "../../../context/MessageProvider";
import useAuth from "../../../hooks/useAuth";

const PatientServices = ({ patient, routes }) => {
  const { user } = useAuth();
  const { showMessage } = useMessage();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState({});
  const [activeTab, setActiveTab] = useState("available");
  const [selected, setSelected] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedServices, setDisplayedServices] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const SERVICES_LIMIT = 20;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axiosInstance.get("/servicesapi/");
        setServices(res.data);
        setCategories([
          "All",
          ...new Set(res.data.map((s) => s.category_name || "Uncategorized")),
        ]);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    let filtered = services;
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter((s) => s.category_name === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.category_name && s.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (!showAll && filtered.length > SERVICES_LIMIT) {
      filtered = filtered.slice(0, SERVICES_LIMIT);
    }
    
    setDisplayedServices(filtered);
  }, [services, selectedCategory, searchTerm, showAll]);

  const fetchRequests = async () => {
    if (!patient?.id) return;
    try {
      const res = await axiosInstance.get(
        `/servicesapi/patient_service_requests/${patient.id}/`
      );
      setRequests(res.data || {});
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    if (patient?.id) fetchRequests();
  }, [patient]);

  const toggleService = (service) => {
    setSelected((prev) => {
      const exists = prev[service.id];
      if (exists) {
        const newSel = { ...prev };
        delete newSel[service.id];
        return newSel;
      }
      return { ...prev, [service.id]: { qty: 1, service } };
    });
  };

  const changeQty = (id, qty) =>
    setSelected((prev) => ({
      ...prev,
      [id]: { ...prev[id], qty: Math.max(1, qty) },
    }));

  const handleSubmit = async () => {
    if (!patient || Object.keys(selected).length === 0) return;
    setSubmitting(true);

    try {
      const totalAmount = Object.values(selected).reduce(
        (sum, { qty, service }) => sum + service.price * qty,
        0
      );

      const payload = {
        patient: patient.id,
        requested_by: user.id || "Unknown",
        encounter_route: routes?.[0]?.id || null,
        total_amount: totalAmount,
        details: Object.values(selected).map(({ qty, service }) => ({
          service: service.id,
          description: service.name,
          quantity: qty,
          unit_price: service.price,
          amount: service.price * qty,
        })),
      };
      console.log("Submitting payload:", payload);
      await axiosInstance.post("/servicesapi/requests/", payload);

      showMessage(
        `✅ ${Object.keys(selected).length} service(s) requested`,
        "success"
      );
      setSelected({});
      fetchRequests();
    } catch (err) {
      console.error("Error submitting requests:", err);
      showMessage("❌ Failed to submit service request", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-3 text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  const totalSelected = Object.keys(selected).length;
  const totalAmount = Object.values(selected).reduce(
    (sum, { qty, service }) => sum + service.price * qty,
    0
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <span className="text-white">🏥</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Medical Services</h3>
              <p className="text-xs text-white/80">
                {patient?.user_info?.first_name} {patient?.user_info?.last_name}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-white/10 backdrop-blur-sm p-0.5">
            <button
              onClick={() => setActiveTab("available")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === "available" 
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="mr-1">🆕</span>
              Available
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === "history" 
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="mr-1">📜</span>
              History
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === "available" ? (
        <div className="p-3">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500">
              {displayedServices.length} of {services.length} services
            </span>
            {services.length > SERVICES_LIMIT && !searchTerm && selectedCategory === "All" && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showAll ? `Show Less` : `Show All (${services.length})`}
              </button>
            )}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {displayedServices.map((service) => {
              const isSelected = !!selected[service.id];
              const qty = selected[service.id]?.qty || 1;
              return (
                <div
                  key={service.id}
                  className={`rounded-lg border p-2 cursor-pointer transition-all ${
                    isSelected 
                      ? "border-blue-500 bg-blue-50 shadow-sm" 
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => toggleService(service)}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-gray-900 mb-1 line-clamp-2">
                        {service.name}
                      </h4>
                      <span className="text-[10px] text-gray-500">
                        {service.category_name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-bold text-blue-600">
                        ₦{service.price?.toLocaleString()}
                      </span>
                      {isSelected && (
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => changeQty(service.id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border rounded px-1 py-0.5 text-xs"
                        />
                      )}
                    </div>
                    <button
                      className={`mt-2 w-full text-xs py-1 rounded ${
                        isSelected
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleService(service);
                      }}
                    >
                      {isSelected ? "Remove" : "Select"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {displayedServices.length === 0 && (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <span className="text-xl">🔍</span>
              </div>
              <p className="text-gray-500 text-sm">
                {searchTerm 
                  ? `No services found for "${searchTerm}"`
                  : "No services available"
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Service History
          </h4>
          {/* History content would go here */}
          <div className="text-center py-4">
            <span className="text-gray-400">📊</span>
            <p className="text-sm text-gray-500 mt-2">Service history would appear here</p>
          </div>
        </div>
      )}

      {/* Sticky Cart */}
      {totalSelected > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="p-3">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🛒</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {totalSelected} selected
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-700">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>
              
              <div className="text-xs text-gray-600 mb-3">
                {Object.values(selected).slice(0, 2).map(({ service }, idx) => (
                  <div key={idx} className="truncate">
                    • {service.name}
                  </div>
                ))}
                {totalSelected > 2 && (
                  <div className="text-gray-400">+{totalSelected - 2} more</div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                    Submitting...
                  </span>
                ) : (
                  `Request ${totalSelected} Service${totalSelected !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientServices;