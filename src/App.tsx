import React, { useState, useEffect, type JSX } from 'react';
import type { User, Member, Coupon, PageType } from './types/index.tsx';
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
import './App.css'

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [members, setMembers] = useState([
    {
      id: 'M001',
      name: 'สมชาย ใจดี',
      phone: '081-234-5678',
      email: 'somchai@email.com',
      points: 250,
      joinDate: '2024-01-15',
      qrCode: 'M001-QR-DATA'
    },
    {
      id: 'M002',
      name: 'สมหญิง รักสุขภาพ',
      phone: '082-345-6789',
      email: 'somying@email.com',
      points: 180,
      joinDate: '2024-02-10',
      qrCode: 'M002-QR-DATA'
    }
  ]);
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 'C001',
      name: 'ส่วนลด 10% การตรวจสุขภาพ',
      pointsRequired: 100,
      description: 'รับส่วนลด 10% สำหรับการตรวจสุขภาพทั่วไป',
      validUntil: '2024-12-31',
      isActive: true
    },
    {
      id: 'C002',
      name: 'ฟรีการปรึกษาแพทย์',
      pointsRequired: 200,
      description: 'รับการปรึกษาแพทย์ฟรี 1 ครั้ง',
      validUntil: '2024-11-30',
      isActive: true
    }
  ]);


  useEffect(() => {
    const savedUser = localStorage.getItem('clinicUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('clinicUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Login handler
  const handleLogin = (userData: User): void => {
    setUser(userData);
    localStorage.setItem('clinicUser', JSON.stringify(userData));
  };

  // Logout handler
  const handleLogout = (): void => {
    setUser(null);
    localStorage.removeItem('clinicUser');
    setCurrentPage('dashboard');
  };

  // Show loading screen
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

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Access control message
  const AccessDenied: React.FC = () => (
    <div className="text-center text-gray-600 py-8">
      <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
    </div>
  );

  // Render current page
  const renderCurrentPage = (): JSX.Element => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage members={members} coupons={coupons} />;
      case 'members':
        return (
          <MembersPage
            members={members}
            setSelectedMember={setSelectedMember}
            selectedMember={selectedMember}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'create-member':
        return <CreateMemberPage members={members} setMembers={setMembers} />;
      case 'import-members':
        return user.role === 'admin' ? <ImportMembersPage /> : <AccessDenied />;
      case 'manage-points':
        return <PointsManagementPage members={members} setMembers={setMembers} />;
      case 'create-coupon':
        return user.role === 'admin' ? (
          <CreateCouponPage coupons={coupons} setCoupons={setCoupons} />
        ) : (
          <AccessDenied />
        );
      case 'use-coupon':
        return <UseCouponPage members={members} setMembers={setMembers} coupons={coupons} />;
      case 'coupon-history':
        return <CouponHistoryPage />;
      case 'print-card':
        return <PrintCardPage members={members} />;
      case 'users':
        return user.role === 'admin' ? <UsersManagementPage /> : <AccessDenied />;
      default:
        return <DashboardPage members={members} coupons={coupons} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} onLogout={handleLogout} />
      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          userRole={user.role}
        />
        <main className="flex-1 p-6">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default App;