import React, { useState } from 'react';
import { User, LogIn, Lock } from 'lucide-react';
import type { User as UserType, LoginData } from '../../types/index.tsx';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      // Demo users
      const users: Record<string, { password: string; role: 'admin' | 'manager'; name: string }> = {
        'admin': { password: 'admin123', role: 'admin', name: 'ผู้ดูแลระบบ' },
        'manager': { password: 'manager123', role: 'manager', name: 'ผู้จัดการ' }
      };

      const user = users[loginData.username];
      if (user && user.password === loginData.password) {
        onLogin({
          username: loginData.username,
          role: user.role,
          name: user.name
        });
      } else {
        setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (field: keyof LoginData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setLoginData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ระบบจัดการสมาชิกคลินิก</h1>
          <p className="text-gray-600 mt-2">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อผู้ใช้งาน
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={loginData.username}
                onChange={handleInputChange('username')}
                placeholder="admin หรือ staff"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={loginData.password}
                onChange={handleInputChange('password')}
                placeholder="admin123 หรือ staff123"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">บัญชีทดสอบ:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Manager:</strong> manager / manager123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;