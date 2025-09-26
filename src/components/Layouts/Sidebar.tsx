import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users, UserPlus, Upload, Scan, Star, Gift, FileText, History, Settings
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

  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Users, roles: ['admin', 'manager'] },
    { id: 'members', label: 'จัดการสมาชิก', icon: Users, roles: ['admin', 'manager'] },
    { id: 'create-member', label: 'สร้างสมาชิก', icon: UserPlus, roles: ['admin', 'manager'] },
    { id: 'import-members', label: 'นำเข้าข้อมูล', icon: Upload, roles: ['admin', 'manager'] },
    { id: 'scan-qr', label: 'สแกน QR', icon: Scan, roles: ['admin', 'manager'] },
    { id: 'manage-points', label: 'จัดการคะแนน', icon: Star, roles: ['admin', 'manager'] },
    { id: 'create-coupon', label: 'สร้างคูปอง', icon: Gift, roles: ['admin', 'manager'] },
    { id: 'use-coupon', label: 'ใช้คูปอง', icon: FileText, roles: ['admin', 'manager'] },
    { id: 'coupon-history', label: 'ประวัติคูปอง', icon: History, roles: ['admin', 'manager'] },
    { id: 'users', label: 'จัดการผู้ใช้', icon: Settings, roles: ['admin', 'manager'] }
  ];

  const allowedItems = navigationItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-white shadow-sm border-r min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {allowedItems.map(item => {
          const Icon = item.icon;
          const isActive =
            location.pathname === `/${item.id}` ||
            (item.id === 'dashboard' && location.pathname === '/');
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
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
  );
};

export default Sidebar;
