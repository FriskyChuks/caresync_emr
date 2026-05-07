// components/Investigation.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";
import { useMessage } from "../../context/MessageProvider";

const Investigation = () => {
  const [units, setUnits] = useState([]);
  const [hasViews, setHasViews] = useState(false);
  const { user } = useAuth();
  const { showMessage } = useMessage();
  const [loading, setLoading] = useState(false);
  const [investigation, setInvestigation] = useState({
    title: "",
    units: "",
    price: "",
  });

  const [subInvestigations, setSubInvestigations] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/radiologyapi/units/")
      .then((response) => {
        setUnits(response.data);
      })
      .catch((error) => {
        showMessage("There was an error fetching the Radiology Units!", "error");
      });
  }, [showMessage]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvestigation((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleToggle = (e) => {
    setHasViews(e.target.checked);
  };

  const handleAddSubInvestigation = () => {
    setSubInvestigations([...subInvestigations, { title: "", price: "" }]);
  };

  const handleSubChange = (index, field, value) => {
    const updated = [...subInvestigations];
    updated[index][field] = value;
    setSubInvestigations(updated);
  };

  const handleRemoveSub = (index) => {
    const updated = [...subInvestigations];
    updated.splice(index, 1);
    setSubInvestigations(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parentResp = await axiosInstance.post("/radiologyapi/investigations/", {
        title: investigation.title,
        radiology_unit_id: +investigation.units,
        has_views: hasViews,
        price: parseFloat(investigation.price),
      });

      const parentId = parentResp.data.id;

      if (hasViews && subInvestigations.length > 0) {
        await Promise.all(
          subInvestigations.map((sub) =>
            axiosInstance.post("/radiologyapi/views/", {
              investigation_id: +parentId,
              title: sub.title,
              price: parseFloat(sub.price),
              created_by: user.id,
            })
          )
        );
      }

      showMessage("Investigation created successfully!", "success");

      setInvestigation({ title: "", units: "", price: "" });
      setHasViews(false);
      setSubInvestigations([]);

    } catch (error) {
      showMessage("Failed to create investigation", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-200 shadow-sm">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600">🔬</span>
          <h3 className="text-sm font-bold text-gray-800">Create Investigation</h3>
        </div>
      </div>

      {/* Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          {/* Main Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {/* Investigation Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Investigation Name
              </label>
              <input
                type="text"
                placeholder="Enter test name"
                value={investigation.title}
                name="title"
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
            </div>

            {/* Radiology Units */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Radiology Units
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-500 text-sm">
                  🏥
                </div>
                <select
                  name="units"
                  value={investigation.units}
                  onChange={handleChange}
                  required
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors appearance-none"
                >
                  <option value="">-- Select Unit --</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  ▼
                </div>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Price (₦)
              </label>
              <div className="relative">
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-emerald-500 text-sm">
                  💰
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={investigation.price}
                  name="price"
                  onChange={handleChange}
                  required
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Has Views Toggle */}
          <div className="mb-3">
            <div className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="hasViewCheck"
                  name="hasView"
                  onChange={handleToggle}
                  checked={hasViews}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500"></div>
              </label>
              <label htmlFor="hasViewCheck" className="text-sm text-gray-700 cursor-pointer">
                Has Multiple Views
              </label>
            </div>
          </div>

          {/* Views Section */}
          {hasViews && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">👁️</span>
                  <h4 className="text-sm font-medium text-gray-800">Views Configuration</h4>
                </div>
                <button
                  type="button"
                  onClick={handleAddSubInvestigation}
                  className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                >
                  <span className="mr-1">+</span>
                  Add View
                </button>
              </div>

              <div className="space-y-2">
                {subInvestigations.map((sub, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                        placeholder="View title (e.g., AP, Lateral)"
                        value={sub.title}
                        onChange={(e) => handleSubChange(index, "title", e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                        placeholder="Price"
                        step="0.01"
                        value={sub.price}
                        onChange={(e) => handleSubChange(index, "price", e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      onClick={() => handleRemoveSub(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="mr-2">💾</span>
                  Save Investigation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Investigation;