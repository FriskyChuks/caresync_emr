import React, { useMemo } from 'react';

const TestResultViewer = ({ request, allTests, users, allResults, onClose }) => {
  const requestResults = allResults.filter(result => result.test_request === request.id);
  
  return (
    <div className="test-result-viewer">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Test Results - Request {patient.user_info?.first_name}{" "}
          {patient.user_info?.last_name} | PID-{patient.id}</h5>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      
      {requestResults.length === 0 ? (
        <div className="alert alert-warning">
          No results found for this request.
        </div>
      ) : (
        requestResults.map(result => {
          const testDetails = allTests.find(t => t.id === result.test);
          const hasSubTests = testDetails?.sub_tests?.length > 0;
          
          return (
            <div key={result.id} className="card mb-3">
              <div className="card-header">
                <h6>{testDetails?.name || `Test ID: ${result.test}`}</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <strong>Result:</strong> {result.result_value || 'N/A'}
                  </div>
                  <div className="col-md-6">
                    <strong>Reference Range:</strong> {result.reference_range || 'N/A'}
                  </div>
                </div>
                
                {result.remark && (
                  <div className="mt-2">
                    <strong>Remark:</strong> {result.remark}
                  </div>
                )}
                
                {/* Display flags */}
                <div className="mt-2">
                  {result.is_critical && (
                    <span className="badge bg-danger me-2">Critical</span>
                  )}
                  {result.needs_retest && (
                    <span className="badge bg-warning">Needs Retest</span>
                  )}
                </div>
                
                {/* Sub-test results */}
                {hasSubTests && result.sub_test_results && result.sub_test_results.length > 0 && (
                  <div className="mt-3">
                    <h6>Sub-test Results:</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Sub-test</th>
                            <th>Result</th>
                            <th>Reference Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.sub_test_results.map((subResult, index) => {
                            const subTestDetail = testDetails?.sub_tests?.find(st => st.id === subResult.sub_test);
                            return (
                              <tr key={index}>
                                <td>{subTestDetail?.name || `Sub-test ID: ${subResult.sub_test}`}</td>
                                <td>{subResult.result_value || 'N/A'}</td>
                                <td>{subResult.reference_range || 'N/A'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Debug info - remove in production */}
                <details className="mt-3">
                  <summary className="text-muted small">Debug Info</summary>
                  <pre className="small text-muted mt-2">
                    {JSON.stringify({
                      testId: result.test,
                      hasSubTests,
                      subTestCount: result.sub_test_results?.length || 0,
                      testDetails: testDetails?.name,
                      subTests: testDetails?.sub_tests?.map(st => ({ id: st.id, name: st.name }))
                    }, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
export default TestResultViewer;