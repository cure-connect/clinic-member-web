import React from 'react';
import { User, LogOut } from 'lucide-react';
import type { User as UserType } from '../../types/index.tsx';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => (
  <header className="bg-white shadow border-b">
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">ระบบจัดการสมาชิกคลินิก</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">คลินิกสุขภาพดี</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{user.username}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                user.role === 'manager' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role === 'manager' ? 'manager' : 'admin'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default Header;