import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import type { User } from "./types/index.tsx";
import useAuthCheck from "./utils/useAuthCheck.tsx";
import LoginPage from "./components/Auth/LoginPage.tsx";
import Header from "./components/Layouts/Header.tsx";
import Sidebar from "./components/Layouts/Sidebar.tsx";
import DashboardPage from "./pages/Dashboard/Dashboard.tsx";
import MembersPage from "./pages/Member/Member.tsx";
import CreateMemberPage from "./pages/Member/CreateMemberPage.tsx";
import ImportMembersPage from "./pages/Member/ImportMember.tsx";
import PrintCardPage from "./pages/Member/PrintCardPage.tsx";
import PointsManagementPage from "./pages/Points/PointManagePage.tsx";
import CreateCouponPage from "./pages/Coupon/CreateCoupon.tsx";
import UseCouponPage from "./pages/Coupon/UseCouponPage.tsx";
import CouponHistoryPage from "./pages/Coupon/CouponHistory.tsx";
import UsersManagementPage from "./pages/Users/UserManagement.tsx";
import UserInfoPage from "./pages/Users/UserInfoPage.tsx";
import ScanQRPage from "./pages/QRCode/QrScanPage.tsx";
import "./App.css";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useAuthCheck();

  useEffect(() => {
    const savedUser = localStorage.getItem("clinicUser");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("clinicUser");
        localStorage.removeItem("clinicToken");
      }
    }

    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User, token?: string): void => {
    setUser(userData);
    if (token) {
      localStorage.setItem("clinicUser", JSON.stringify(userData));
      localStorage.setItem("clinicToken", token);
    }
  };

  const handleLogout = (): void => {
    setUser(null);
    localStorage.removeItem("clinicUser");
    localStorage.removeItem("clinicToken");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const AccessDenied: React.FC = () => (
    <div className="text-center text-gray-600 py-8">
      <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
    </div>
  );

  const isManagerOrAdmin = user?.role === "manager";

  if (!user) {
    return (
      <>
        <Routes>
          <Route path="/userinfo/:userid" element={<UserInfoPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <Header user={user} onLogout={handleLogout} />
        <div className="flex">
          <Sidebar user={user} onLogout={handleLogout} />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/create-member" element={<CreateMemberPage />} />
              <Route
                path="/import-members"
                element={isManagerOrAdmin ? <ImportMembersPage /> : <AccessDenied />}
              />
              <Route path="/scan-qr" element={<ScanQRPage />} />
              <Route path="/manage-points" element={<PointsManagementPage />} />
              <Route
                path="/create-coupon"
                element={isManagerOrAdmin ? <CreateCouponPage /> : <AccessDenied />}
              />
              <Route path="/use-coupon" element={<UseCouponPage />} />
              <Route path="/coupon-history" element={<CouponHistoryPage />} />
              <Route path="/print-card" element={<PrintCardPage />} />
              <Route
                path="/users"
                element={isManagerOrAdmin ? <UsersManagementPage /> : <AccessDenied />}
              />
              <Route path="/userinfo/:userid" element={<UserInfoPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
};

export default App;
