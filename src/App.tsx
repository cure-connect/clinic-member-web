import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { User, Member, Coupon } from './types/index.tsx';
import LoginPage from '../src/components/Auth/LoginPage.tsx';
import Header from '../src/components/Layouts/Header.tsx';
import Sidebar from '../src/components/Layouts/Sidebar.tsx';
import DashboardPage from '../src/pages/Dashboard/Dashboard.tsx';
import MembersPage from '../src/pages/Member/Member.tsx';
import CreateMemberPage from '../src/pages/Member/CreateMemberPage.tsx';
import ImportMembersPage from '../src/pages/Member/ImportMember.tsx';
import PrintCardPage from '../src/pages/Member/PrintCardPage.tsx';
import PointsManagementPage from '../src/pages/Points/PointManagePage.tsx';
import CreateCouponPage from '../src/pages/Coupon/CreateCoupon.tsx';
import UseCouponPage from '../src/pages/Coupon/UseCouponPage.tsx';
import CouponHistoryPage from '../src/pages/Coupon/CouponHistory.tsx';
import UsersManagementPage from '../src/pages/Users/UserManagement.tsx';
import './App.css';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('clinicUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('clinicUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User, token?: string): void => {
    setUser(userData);
    localStorage.setItem('clinicUser', JSON.stringify(userData));
    if (token) localStorage.setItem('clinicToken', token);
  };

  const handleLogout = (): void => {
    setUser(null);
    localStorage.removeItem('clinicUser');
    localStorage.removeItem('clinicToken');
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

  return (
    <>
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="min-h-screen bg-gray-100">
          <Header user={user} onLogout={handleLogout} />
          <div className="flex">
            <Sidebar userRole={user.role} currentPage="members" setCurrentPage={() => {}} />
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage members={members} coupons={coupons} />} />
                <Route
                  path="/members"
                  element={
                    <MembersPage
                      members={members}
                      setSelectedMember={setSelectedMember}
                      selectedMember={selectedMember}
                      setCurrentPage={() => {}}
                    />
                  }
                />
                <Route path="/create-member" element={<CreateMemberPage members={members} setMembers={setMembers} />} />
                <Route
                  path="/import-members"
                  element={user.role === 'admin' ? <ImportMembersPage /> : <AccessDenied />}
                />
                <Route path="/manage-points" element={<PointsManagementPage members={members} setMembers={setMembers} />} />
                <Route
                  path="/create-coupon"
                  element={user.role === 'admin' ? <CreateCouponPage coupons={coupons} setCoupons={setCoupons} /> : <AccessDenied />}
                />
                <Route path="/use-coupon" element={<UseCouponPage members={members} setMembers={setMembers} coupons={coupons} />} />
                <Route path="/coupon-history" element={<CouponHistoryPage />} />
                <Route path="/print-card" element={<PrintCardPage members={members} />} />
                <Route path="/users" element={user.role === 'admin' ? <UsersManagementPage /> : <AccessDenied />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
