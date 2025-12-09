import React from "react";
import ForbiddenPage from "./components/pages/ForbiddenPage";

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
import HistoryPage from "./components/pages/HistoryPage";
import ImportDataPage from "./components/pages/ImportDataPage";
import QueryPage from "./components/pages/QueryPage";
import RevenuePage from "./components/pages/RevenuePage";
import ChartsPage from "./components/pages/ChartsPage";
import ProfilePage from "./components/pages/ProfilePage";
import SettingsPage from "./components/pages/SettingsPage";
import NotificationsPage from "./components/pages/NotificationsPage";
import ChatPage from "./components/ChatPage";
import AIPage from "./components/pages/AIPage";
import ResetPasswordPage from "./components/pages/ResetPasswordPage";


import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

type View = "landing" | "login" | "register" | "dashboard" | "about" | "contact" | "faq" | "help" | "terms" | "privacy";

// =========================
// ProtectedRoute — yêu cầu login
// =========================
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// =========================
// AdminRoute — yêu cầu ADMIN
// =========================
function AdminRoute({ children }: { children: React.ReactNode }) {
  const role = localStorage.getItem("role");
  if (role !== "ADMIN") return <Navigate to="/403" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LANDING PAGE */}
        <Route path="/" element={<LandingPageWrapper />} />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/dashboard/" replace />
              : <LoginPageWrapper />
          }
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/dashboard/" replace />
              : <RegisterPageWrapper />
          }
        />
        {/* PUBLIC INFO PAGES */}
        <Route path="/about" element={<AboutPageWrapper />} />
        <Route path="/contact" element={<ContactPageWrapper />} />
        <Route path="/faq" element={<FAQPageWrapper />} />
        <Route path="/terms" element={<TermsPageWrapper />} />
        <Route path="/privacy" element={<PrivacyPageWrapper />} />
        <Route path="/activation-result" element={<ActivationResultPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* 403 */}
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Dashboard */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardRoutes />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
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
      onLogin={() => navigate("/dashboard/")}
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
// PUBLIC PAGE WRAPPERS
function AboutPageWrapper() {
  const navigate = useNavigate();
  return <AboutPage onNavigate={(v) => navigate("/" + v)} />;
}

function ContactPageWrapper() {
  const navigate = useNavigate();
  return <ContactPage onNavigate={(v) => navigate("/" + v)} />;
}

function FAQPageWrapper() {
  const navigate = useNavigate();
  return <FAQPage onNavigate={(v) => navigate("/" + v)} />;
}


function TermsPageWrapper() {
  const navigate = useNavigate();
  return <TermsPage onNavigate={(v) => navigate("/" + v)} />;
}

function PrivacyPageWrapper() {
  const navigate = useNavigate();
  return <PrivacyPage onNavigate={(v) => navigate("/" + v)} />;
}


/* =========================
    DASHBOARD ROUTING
========================= */
function DashboardRoutes() {
  const navigate = useNavigate();
  const current = location.pathname.replace("/dashboard/", "") || "dashboard";

  return (
    <DashboardLayout
      currentPage={current}
      onNavigate={(page) => navigate(`/dashboard/${page}`)}
      onLogout={() => {
        localStorage.clear();
        window.location.href = "/login";  // hard redirect, nhanh nhất
      }}

    >
      <Routes>

        {/* USER + ADMIN */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="import-data" element={<ImportDataPage />} />
        <Route path="query" element={<QueryPage />} />
        <Route path="charts" element={<ChartsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="ai" element={<AIPage />} />

        {/* ADMIN ONLY */}
        <Route
          path="users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />

        <Route
          path="devices"
          element={
            <AdminRoute>
              <DevicesPage />
            </AdminRoute>
          }
        />

        <Route
          path="import-device"
          element={
            <AdminRoute>
              <ImportDevicePage />
            </AdminRoute>
          }
        />

        <Route
          path="revenue"
          element={
            <AdminRoute>
              <RevenuePage />
            </AdminRoute>
          }
        />
        <Route
          path="history"
          element={
            <AdminRoute>
              <HistoryPage />
            </AdminRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard/" replace />} />

      </Routes>
    </DashboardLayout>
  );
}
