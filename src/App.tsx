import React from "react";
import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
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

type View = "landing" | "login" | "register" | "dashboard";

export default function App() {
  // Load trạng thái từ localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [currentView, setCurrentView] = useState<View>(() => {
    return (localStorage.getItem("currentView") as View) || "landing";
  });

  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("currentPage") || "dashboard";
  });

  // Mỗi khi state thay đổi → lưu vào localStorage
  useEffect(() => {
    localStorage.setItem("isLoggedIn", String(isLoggedIn));
    localStorage.setItem("currentView", currentView);
    localStorage.setItem("currentPage", currentPage);
  }, [isLoggedIn, currentView, currentPage]);

  const handleNavigate = (view: string) => {
    // Nếu chưa login → chỉ được vào landing/login/register
    if (!isLoggedIn) {
      if (view === "landing" || view === "login" || view === "register") {
        setCurrentView(view);
        return;
      }
      return;
    }

    // Nếu đã login → điều hướng dashboard
    setCurrentPage(view);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView("dashboard");
    setCurrentPage("dashboard");
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    setCurrentView("dashboard");
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView("landing");
    setCurrentPage("dashboard");
    localStorage.clear(); // Xóa token + trạng thái
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "users":
        return <UsersPage />;
      case "devices":
        return <DevicesPage />;
      case "import-device":
        return <ImportDevicePage />;
      case "import-data":
        return <ImportDataPage />;
      case "query":
        return <QueryPage />;
      case "revenue":
        return <RevenuePage />;
      case "charts":
        return <ChartsPage />;
      case "profile":
        return <ProfilePage />;
      case "settings":
        return <SettingsPage />;
      case "notifications":
        return <NotificationsPage />;
      case "chat":
        return <ChatPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="size-full">
      {!isLoggedIn ? (
        <>
          {currentView === "landing" && (
            <LandingPage onNavigate={handleNavigate} />
          )}
          {currentView === "login" && (
            <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
          )}
          {currentView === "register" && (
            <RegisterPage
              onNavigate={handleNavigate}
              onRegister={handleRegister}
            />
          )}
        </>
      ) : (
        <DashboardLayout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        >
          {renderPageContent()}
        </DashboardLayout>
      )}
    </div>
  );
}
