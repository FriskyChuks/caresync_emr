import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import dayjs from "dayjs";

const LabResultEntry = () => {
  const { id } = useParams(); // lab request ID
  const navigate = useNavigate();

  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState({}); // key: detailId, value: result_value

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/labapi/test-requests/${id}/`);
      setRequestData(res.data);

      // Initialize results state
      const initialResults = {};
      res.data.details?.forEach((d) => {
        initialResults[d.id] = d.result_value || "";
      });
      setResults(initialResults);
    } catch (err) {
      console.error("Error fetching lab request:", err);
      alert("Unable to load lab request.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (detailId, value) => {
    setResults((prev) => ({ ...prev, [detailId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = Object.keys(results).map((detailId) => ({
        id: detailId,
        result_value: results[detailId],
      }));

      await axiosInstance.patch(`/labapi/test-requests/${id}/enter-results/`, {
        results: payload,
      });

      alert("Results saved successfully!");
      navigate("/lab"); // redirect to dashboard
    } catch (err) {
      console.error("Error saving results:", err);
      alert("Failed to save results. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading lab request...</div>;

  if (!requestData) return <div>No lab request found.</div>;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-gradient text-white fw-semibold">
        Enter Lab Results
      </div>
      <div className="card-body">
        <p>
          <strong>Patient:</strong>{" "}
          {requestData.patient?.user_info?.fullname || "N/A"}
        </p>
        <p>
          <strong>Patient ID:</strong> {requestData.patient?.id || "N/A"}
        </p>
        <p>
          <strong>Date Requested:</strong>{" "}
          {dayjs(requestData.request_date).format("DD/MM/YYYY hh:mm A")}
        </p>
        <hr />

        <form onSubmit={handleSubmit}>
          {requestData.details?.map((detail) => (
            <div
              key={detail.id}
              className="mb-3 p-2 border rounded shadow-sm"
            >
              <label className="form-label fw-semibold">
                {detail.test?.name || "Test"}
              </label>
              <input
                type="text"
                className="form-control"
                value={results[detail.id]}
                onChange={(e) => handleChange(detail.id, e.target.value)}
                disabled={detail.status === "pending"} // disabled if pending
                placeholder={
                  detail.status === "pending"
                    ? "Pending prerequisite..."
                    : "Enter result"
                }
              />
              {detail.subtests?.length > 0 && (
                <div className="ms-3 mt-2">
                  {detail.subtests.map((sub) => (
                    <div key={sub.id} className="mb-2">
                      <label className="form-label">{sub.name}</label>
                      <input
                        type="text"
                        className="form-control"
                        value={results[sub.id] || ""}
                        onChange={(e) => handleChange(sub.id, e.target.value)}
                        disabled={sub.status === "pending"}
                        placeholder={
                          sub.status === "pending"
                            ? "Pending..."
                            : "Enter subtest result"
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Results"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LabResultEntry;
