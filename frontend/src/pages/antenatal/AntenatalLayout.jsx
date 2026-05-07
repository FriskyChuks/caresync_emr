// AntenatalLayout.jsx
// Tabs are gated: only Dashboard, Bookings, and History are always active.
// All other tabs require an active booking to be accessible.
import React, { useState, useEffect, createContext, useContext } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

/* ── Booking context so child pages can also read it ── */
export const BookingContext = createContext(null);
export const useBooking = () => useContext(BookingContext);

const NAV = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    path: (pid) => `/antenatal-dashboard/${pid}`,
    gated: false,
  },
  // {
  //   key: "bookings",
  //   label: "Bookings",
  //   icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  //   path: (pid) => `/antenatal-bookings/${pid}`,
  //   gated: false,
  // },
  {
    key: "vitals",
    label: "Vitals",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    path: (pid) => `/antenatal-vitals/${pid}`,
    gated: true,
  },
  {
    key: "followup",
    label: "Follow-up",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    path: (pid) => `/antenatal-followup/${pid}`,
    gated: true,
  },
  {
    key: "labs",
    label: "Labs",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    path: (pid) => `/antenatal-labs/${pid}`,
    gated: true,
  },
  {
    key: "complaints",
    label: "Notes",
    icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
    path: (pid) => `/antenatal-complaints/${pid}`,
    gated: true,
  },
  {
    key: "delivery",
    label: "Delivery",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    path: (pid) => `/antenatal-delivery/${pid}`,
    gated: true,
  },
  {
    key: "history",
    label: "History",
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    path: (pid) => `/antenatal-history/${pid}`,
    gated: false,
  },
];

const AntenatalLayout = ({ children }) => {
  const { pid } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(null);      // active ObstetricHistory
  const [bookingLoading, setBookingLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* Fetch active booking to decide which tabs to unlock */
  useEffect(() => {
    if (!pid) { setBookingLoading(false); return; }
    axiosInstance
      .get(`/anc_specialtyapi/obstetric-history/?patient=${pid}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setBooking(data?.id ? data : null);
      })
      .catch(() => setBooking(null))
      .finally(() => setBookingLoading(false));
  }, [pid]);

  const hasBooking = !!booking;

  const isActive = (tab) => {
    const p = tab.path(pid);
    return location.pathname === p || location.pathname.startsWith(p + "/");
  };

  const currentTab = NAV.find(isActive);

  return (
    <BookingContext.Provider value={booking}>
      <div className="min-h-screen bg-gray-50">

        {/* ── Top Nav Bar ── */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-3">

            {/* Mobile header */}
            <div className="flex items-center justify-between py-2 md:hidden">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-800">ANC</span>
                {currentTab && (
                  <span className="text-xs text-indigo-600 font-medium">/ {currentTab.label}</span>
                )}
              </div>
              <button
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>

            {/* Desktop tabs */}
            <div className="hidden md:flex items-center gap-0.5 overflow-x-auto py-1 scrollbar-hide">
              {NAV.map((tab) => {
                const locked = tab.gated && !hasBooking && !bookingLoading;
                const active = isActive(tab);
                if (locked) {
                  return (
                    <div
                      key={tab.key}
                      title="Register a booking first"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-300 cursor-not-allowed select-none"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      {tab.label}
                      <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  );
                }
                return (
                  <Link
                    key={tab.key}
                    to={tab.path(pid)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                      ${active
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    {tab.label}
                  </Link>
                );
              })}

              {/* Booking status badge */}
              {!bookingLoading && (
                <div className="ml-auto flex items-center gap-1.5 pl-3 border-l border-gray-100">
                  <div className={`w-2 h-2 rounded-full ${hasBooking ? "bg-green-400 animate-pulse" : "bg-gray-300"}`} />
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {hasBooking ? "Active booking" : "No booking"}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile dropdown */}
            {mobileMenuOpen && (
              <div className="md:hidden pb-2 space-y-0.5">
                {NAV.map((tab) => {
                  const locked = tab.gated && !hasBooking && !bookingLoading;
                  const active = isActive(tab);
                  if (locked) {
                    return (
                      <div key={tab.key}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-300 cursor-not-allowed">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                          </svg>
                          {tab.label}
                        </div>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    );
                  }
                  return (
                    <Link key={tab.key} to={tab.path(pid)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${active ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── No booking warning banner (gated page) ── */}
        {!bookingLoading && !hasBooking && currentTab?.gated && (
          <div className="max-w-5xl mx-auto px-3 pt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">No active booking found</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Register the patient for antenatal care first before accessing this section.
                </p>
                <Link to={`/antenatal-bookings/${pid}`}
                  className="inline-block mt-2 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors">
                  Go to Bookings →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Page content ── */}
        <div className="max-w-5xl mx-auto px-3 py-4">
          {children}
        </div>
      </div>
    </BookingContext.Provider>
  );
};

export default AntenatalLayout;