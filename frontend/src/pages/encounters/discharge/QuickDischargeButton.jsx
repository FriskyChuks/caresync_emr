import axiosInstance from "../../api/axiosInstance";
import { useMessage } from "../../context/MessageProvider";

const QuickDischargeButton = ({ visitId, onSuccess }) => {
  const { showMessage } = useMessage();

  const handleDischarge = async () => {
    try {
      await axiosInstance.patch(`/encounterapi/discharge/${visitId}/`, { visit_status: false });
      showMessage("Patient discharged from clinic", "success");
      onSuccess?.();
    } catch {
      showMessage("Failed to discharge patient", "error");
    }
  };

  return (
    <button onClick={handleDischarge} className="btn btn-warning">
      Discharge Patient
    </button>
  );
};

export default QuickDischargeButton;
