import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingOverlay from "./components/LoadingOverlay";
import Sidebar from "./components/Sidebar";
import AppLayout from "./layouts/AppLayout";
import { MessageProvider } from "./context/MessageProvider";
import { AuthProvider } from "./context/AuthProvider";
import Login from "./pages/accounts/Login";
import Register from "./pages/accounts/Register";
import ChangePassword from "./pages/accounts/ChangePassword";
import ResetPassword from "./pages/accounts/ResetPassword";
import AppRoute from "./routes/AppRoute";

function App() {
  return (
    // MessageProvider first so AuthProvider (and everyone) can call useMessage()
    <MessageProvider>
      <AuthProvider>
        <BrowserRouter>
          <LoadingOverlay />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected layout */}
            <Route
              path="/"
              element={
                <div className="page-wrapper">
                  <div className="main-container">
                    <Sidebar />
                    <AppLayout />
                  </div>
                </div>
              }
            >
              {AppRoute()}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MessageProvider>
  );
}

export default App;
