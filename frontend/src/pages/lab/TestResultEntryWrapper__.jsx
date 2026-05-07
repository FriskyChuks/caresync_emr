import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import TestResultEntry from "./TestResultEntry";
import useAuth from "../../hooks/useAuth";
import { useMessage } from "../../context/MessageProvider";

const TestResultEntryWrapper = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showMessage } = useMessage();

  const [request, setRequest] = useState(null);
  const [allTests, setAllTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ✅ Fetch only the needed data
        const [reqRes, testsRes] = await Promise.all([
          axiosInstance.get(`/labapi/test-requests-details/${requestId}/`),
          axiosInstance.get(`/labapi/tests/create/`), // adjust later if you add a dedicated list endpoint
        ]);

        setRequest(reqRes.data);
        setAllTests(testsRes.data);
      } catch (error) {
        console.error("Error loading data:", error);
        showMessage("Failed to load test request or tests", "danger");
      } finally {
        setLoading(false);
      }
    };

    if (requestId) fetchData();
  }, [requestId, showMessage]);

  const handleSubmit = async (
    requestObj,
    resultValues,
    remarkValues,
    extraFields,
    validatedBy,
    selectedRanges
  ) => {
    try {
      const payload = {
        test_request: requestObj.id,
        results: [],
      };

      requestObj.tests.forEach((testId) => {
        const testDetails = allTests.find((t) => t.id === testId);
        const isSimple = !testDetails?.sub_tests || testDetails.sub_tests.length === 0;

        if (isSimple) {
          payload.results.push({
            test: testId,
            result_value: resultValues[testId] || "",
            remark: remarkValues[testId] || "",
            is_critical: extraFields[testId]?.is_critical || false,
            needs_retest: extraFields[testId]?.needs_retest || false,
            reference_range: selectedRanges[testId] || null,
            validated_by: user?.id,
          });
        } else {
          testDetails.sub_tests
            .filter((st) => requestObj.sub_tests?.includes(st.id))
            .forEach((subtest) => {
              payload.results.push({
                test: testId,
                sub_test: subtest.id,
                result_value: resultValues[subtest.id] || "",
                is_critical: extraFields[subtest.id]?.is_critical || false,
                needs_retest: extraFields[subtest.id]?.needs_retest || false,
                reference_range: selectedRanges[subtest.id] || null,
                validated_by: user?.id,
              });
            });
        }
      });

      await axiosInstance.post(`/labapi/lab-results/`, payload);

      await axiosInstance.patch(`/labapi/test-requests-details/${requestObj.id}/`, {
        status: "completed",
      });

      showMessage("Lab results submitted successfully", "success");
      navigate("/lab/dashboard");
    } catch (error) {
      console.error("Error submitting results:", error);
      showMessage("Error submitting results", "danger");
    }
  };

  if (loading) return <p>Loading request data...</p>;
  if (!request) return <p>Request not found.</p>;

  return (
    <TestResultEntry
      request={request}
      allTests={allTests}
      users={[]} // kept empty to satisfy props, but unused
      user={user}
      onSubmit={handleSubmit}
      onBack={() => navigate("/lab/dashboard")}
    />
  );
};

export default TestResultEntryWrapper;
