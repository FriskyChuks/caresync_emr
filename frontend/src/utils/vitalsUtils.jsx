// utils/vitalsUtils.js

// --- Abnormal checks ---
export const checkAbnormalBP = (bp) => {
  if (!bp) return false;
  const [sys, dia] = bp.split("/").map(Number);
  return sys < 90 || sys > 140 || dia < 60 || dia > 90;
};

export const checkAbnormalTemp = (temp) => {
  if (temp == null) return false;
  return temp > 37.5 || temp < 36;
};

export const checkAbnormalPulse = (pulse) => {
  if (pulse == null) return false;
  return pulse < 60 || pulse > 100;
};

export const calcBMI = (w, h) => (w && h ? (w / (h / 100) ** 2).toFixed(1) : null);

export const checkAbnormalBMI = (bmi) => {
  if (!bmi) return false;
  return bmi < 18.5 || bmi > 24.9;
};

// --- Formatting ---
export const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

// --- Vital Status (color coding) ---
export const getVitalStatus = (vital, value) => {
  if (value == null) return "";
  const numValue = parseFloat(value);

  switch (vital) {
    case "temp":
      return numValue >= 36.1 && numValue <= 37.2
        ? "text-success"
        : numValue >= 37.3 && numValue <= 38.0
        ? "text-warning"
        : "text-danger";
    case "spo2":
      return numValue >= 95 ? "text-success" : numValue >= 90 ? "text-warning" : "text-danger";
    case "pulse":
      return numValue >= 60 && numValue <= 100
        ? "text-success"
        : numValue >= 50 && numValue <= 120
        ? "text-warning"
        : "text-danger";
    case "bp":
      const [systolic, diastolic] = value.split("/").map(Number);
      if (!systolic || !diastolic) return "";
      if (systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80) return "text-success";
      if ((systolic >= 121 && systolic <= 139) || (diastolic >= 81 && diastolic <= 89)) return "text-warning";
      return "text-danger";
    default:
      return "";
  }
};
