import React from "react";

const PatientEncounterRoute = ({ routes }) => {
  const visitNo = routes?.length > 0 ? routes[0].visit : null;

  const encounters =
    routes?.map((r) => {
      const isWard = !!r.in_patient_transfer;
      const isClinic = !isWard;
      const isTransfer = r.transferred_by && r.transferred_by !== "System";
      
      // Determine icon and color
      let icon, bgGradient, textColor, locationType;
      
      if (isWard) {
        icon = "🏥";
        bgGradient = "from-purple-500 to-indigo-600";
        textColor = "text-purple-100";
        locationType = "Ward";
      } else if (isClinic && r.location?.includes("Triage")) {
        icon = "🚑";
        bgGradient = "from-red-500 to-orange-500";
        textColor = "text-red-100";
        locationType = "Triage";
      } else if (isClinic && r.location?.includes("Emergency")) {
        icon = "⚠️";
        bgGradient = "from-red-600 to-pink-600";
        textColor = "text-red-100";
        locationType = "Emergency";
      } else if (isClinic) {
        icon = "🏛️";
        bgGradient = "from-blue-500 to-cyan-500";
        textColor = "text-blue-100";
        locationType = "Clinic";
      }

      return {
        date: new Date(r.date_created).toLocaleDateString("en-GB"),
        time: new Date(r.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clinic: r.location || "Unknown",
        action: isTransfer ? `By ${r.transferred_by}` : `Arrived`,
        isWard,
        isTransfer,
        icon,
        bgGradient,
        textColor,
        locationType,
        timestamp: new Date(r.date_created)
      };
    }) || [];

  // Get compact trajectory style
  const getTrajectoryStyle = (index) => {
    const colors = [
      "from-blue-400 to-purple-400",
      "from-purple-400 to-pink-400",
      "from-pink-400 to-red-400",
      "from-red-400 to-orange-400",
    ];
    return colors[index % colors.length];
  };

  // Get compact trajectory arrow
  const getTrajectoryArrow = (index) => {
    const arrows = ["➤", "➟", "⟼", "⇢"];
    return arrows[index % arrows.length];
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Compact Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20">
              <span className="text-white">📍</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Patient Journey</h3>
              <p className="text-xs text-white/80">Encounter route</p>
            </div>
          </div>
          {visitNo && (
            <div className="px-2 py-0.5 bg-white/20 rounded-full">
              <span className="text-xs font-semibold text-white">Visit #{visitNo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {encounters.length === 0 ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mb-2">
              <span className="text-xl">📍</span>
            </div>
            <h4 className="text-sm text-gray-900 font-medium">No journey recorded</h4>
            <p className="text-xs text-gray-500">Patient journey will appear here</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Connector */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-purple-300 to-pink-300"></div>

            {/* Compact Encounters */}
            <div className="space-y-4">
              {encounters.map((encounter, index) => (
                <div key={index} className="relative">
                  {/* Compact Row */}
                  <div className="flex items-start gap-3">
                    {/* Icon Badge */}
                    <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${encounter.bgGradient} flex items-center justify-center shadow-sm`}>
                      <span className="text-sm">{encounter.icon}</span>
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-gray-800 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-gray-900">{index + 1}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {encounter.clinic}
                            </h4>
                            <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${encounter.textColor} bg-opacity-20`}>
                              {encounter.locationType}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span>{encounter.date}</span>
                            <span>•</span>
                            <span>{encounter.time}</span>
                            <span>•</span>
                            <span className={`font-medium ${encounter.isTransfer ? 'text-blue-600' : 'text-green-600'}`}>
                              {encounter.action}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Trajectory */}
                  {index < encounters.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="relative">
                        <div className="flex items-center">
                          <div className={`w-16 h-0.5 ${getTrajectoryStyle(index)}`}></div>
                          <div className="px-1.5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full">
                            <span className="text-xs font-bold text-gray-700">
                              {getTrajectoryArrow(index)}
                            </span>
                          </div>
                          <div className={`w-16 h-0.5 ${getTrajectoryStyle(index)}`}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Compact Summary */}
            <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-base font-bold text-blue-600">{encounters.length}</div>
                  <div className="text-[10px] text-gray-500">Stops</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-purple-600">
                    {encounters.filter(e => e.isWard).length}
                  </div>
                  <div className="text-[10px] text-gray-500">Wards</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-green-600">
                    {encounters.filter(e => !e.isTransfer).length}
                  </div>
                  <div className="text-[10px] text-gray-500">Arrivals</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-orange-600">
                    {encounters.filter(e => e.isTransfer).length}
                  </div>
                  <div className="text-[10px] text-gray-500">Transfers</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compact Legend */}
      {encounters.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <span className="text-gray-600">Clinic</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600"></div>
              <span className="text-gray-600">Ward</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
              <span className="text-gray-600">Triage</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <span className="text-gray-600">Arrival</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientEncounterRoute;