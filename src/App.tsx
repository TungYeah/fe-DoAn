import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ActivationResultPage from "./components/pages/ActivationResultPage";

import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./components/pages/DashboardPage";
import UsersPage from "./components/pages/UsersPage";
import DevicesPage from "./components/pages/DevicesPage";
import ImportDevicePage from "./components/pages/ImportDevicePage";
import ImportDataPage from "./components/pages/ImportDataPage";
import QueryPage from "./components/pages/QueryPage";
import RevenuePage from "./components/pages/RevenuePage";
import ChartsPage from "./components/pages/ChartsPage";
import ProfilePage from "./components/pages/ProfilePage";
import SettingsPage from "./components/pages/SettingsPage";
import NotificationsPage from "./components/pages/NotificationsPage";
import ChatPage from "./components/ChatPage";


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/login" element={<LoginPageWrapper />} />
        <Route path="/register" element={<RegisterPageWrapper />} />
        <Route path="/activation-result" element={<ActivationResultPage />} />

        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardRoutes />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/* WRAPPERS */

function LandingPageWrapper() {
  const navigate = useNavigate();
  return <LandingPage onNavigate={(v) => navigate("/" + v)} />;
}

function LoginPageWrapper() {
  const navigate = useNavigate();
  return (
    <LoginPage
      onNavigate={(v) => navigate("/" + v)}
      onLogin={() => navigate("/dashboard")}
    />
  );
}

function RegisterPageWrapper() {
  const navigate = useNavigate();
  return (
    <RegisterPage
      onNavigate={(v) => navigate("/" + v)}
      onRegister={() => navigate("/activation-result")}
    />
  );
}

/* DASHBOARD ROUTES */

function DashboardRoutes() {
  const navigate = useNavigate();
  const current = location.pathname.replace("/dashboard/", "") || "dashboard";
  return (
    <DashboardLayout
      currentPage={current}
      onNavigate={(page) => navigate(`/dashboard/${page}`)}
      onLogout={() => {
        localStorage.clear();
        navigate("/login");
      }}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="import-device" element={<ImportDevicePage />} />
        <Route path="import-data" element={<ImportDataPage />} />
        <Route path="query" element={<QueryPage />} />
        <Route path="revenue" element={<RevenuePage />} />
        <Route path="charts" element={<ChartsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="*" element={<Navigate to="/dashboard/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
