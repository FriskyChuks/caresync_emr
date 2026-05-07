export const getVitalStatus = (vital, value) => {
  if (value === null || value === undefined || value === "") return "text-gray-400";

  const numValue = parseFloat(value);

  switch (vital) {
    case "temp":
      if (numValue >= 36.1 && numValue <= 37.2) return "text-emerald-600 font-bold";
      if (numValue >= 37.3 && numValue <= 38.0) return "text-amber-600 font-bold";
      return "text-red-600 font-bold";

    case "spo2":
      if (numValue >= 95) return "text-emerald-600 font-bold";
      if (numValue >= 90) return "text-amber-600 font-bold";
      return "text-red-600 font-bold";

    case "pulse":
      if (numValue >= 60 && numValue <= 100) return "text-emerald-600 font-bold";
      if (numValue >= 50 && numValue <= 120) return "text-amber-600 font-bold";
      return "text-red-600 font-bold";

    case "bp":
      const [systolic, diastolic] = String(value)
        .split("/")
        .map((n) => parseFloat(n));
      if (!systolic || !diastolic) return "text-gray-400";
      if (systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80)
        return "text-emerald-600 font-bold";
      if (
        (systolic >= 121 && systolic <= 139) ||
        (diastolic >= 81 && diastolic <= 89)
      )
        return "text-amber-600 font-bold";
      return "text-red-600 font-bold";

    default:
      return "text-gray-700";
  }
};

export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const bmi = weight / (height / 100) ** 2;
  return parseFloat(bmi.toFixed(1));
};

export const getBMIStatus = (weight, height) => {
  const bmi = calculateBMI(weight, height);
  if (!bmi) return "text-gray-400";
  if (bmi < 18.5 || bmi > 24.9) return "text-amber-600 font-bold";
  return "text-emerald-600 font-bold";
};

export const getVitalColor = (vital, value) => {
  if (value === null || value === undefined || value === "") return "bg-gray-100";
  
  const numValue = parseFloat(value);
  
  switch (vital) {
    case "temp":
      if (numValue >= 36.1 && numValue <= 37.2) return "bg-emerald-100 border-emerald-300";
      if (numValue >= 37.3 && numValue <= 38.0) return "bg-amber-100 border-amber-300";
      return "bg-red-100 border-red-300";
      
    case "spo2":
      if (numValue >= 95) return "bg-emerald-100 border-emerald-300";
      if (numValue >= 90) return "bg-amber-100 border-amber-300";
      return "bg-red-100 border-red-300";
      
    case "pulse":
      if (numValue >= 60 && numValue <= 100) return "bg-emerald-100 border-emerald-300";
      if (numValue >= 50 && numValue <= 120) return "bg-amber-100 border-amber-300";
      return "bg-red-100 border-red-300";
      
    default:
      return "bg-blue-100 border-blue-300";
  }
};