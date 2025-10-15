import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users, UserPlus, Upload, Scan, Star, Gift, FileText, History, Settings, Menu, X
} from 'lucide-react';
import type { User } from '../../types/index.tsx';
import type { NavigationItem } from '../../types/index.tsx';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Users, roles: ['admin', 'manager'] },
    { id: 'members', label: 'จัดการสมาชิก', icon: Users, roles: ['admin', 'manager'] },
    // { id: 'create-member', label: 'สร้างสมาชิก', icon: UserPlus, roles: ['admin', 'manager'] },
    // { id: 'import-members', label: 'นำเข้าข้อมูล', icon: Upload, roles: ['admin', 'manager'] },
    { id: 'scan-qr', label: 'สแกน QR', icon: Scan, roles: ['admin', 'manager'] },
    { id: 'manage-points', label: 'จัดการคะแนน', icon: Star, roles: ['admin', 'manager'] },
    { id: 'create-coupon', label: 'สร้างคูปอง', icon: Gift, roles: ['admin', 'manager'] },
    { id: 'use-coupon', label: 'ใช้คูปอง', icon: FileText, roles: ['admin', 'manager'] },
    { id: 'coupon-history', label: 'ประวัติการใช้งาน', icon: History, roles: ['admin', 'manager'] },
    { id: 'users', label: 'จัดการผู้ใช้', icon: Settings, roles: ['admin', 'manager'] }
  ];

  const allowedItems = navigationItems.filter(item => item.roles.includes(user.role));

  const handleNavigate = (path: string) => {
    navigate(`/${path}`);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white shadow-sm border-r min-h-screen flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="flex-1 p-4 space-y-2 mt-16 lg:mt-0">
          {allowedItems.map(item => {
            const Icon = item.icon;
            const isActive =
              location.pathname === `/${item.id}` ||
              (item.id === 'dashboard' && location.pathname === '/');
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;