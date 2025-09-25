import React from 'react';

const UsersManagementPage: React.FC = () => (
  <div className="bg-white rounded-lg shadow border p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">จัดการผู้ใช้งาน</h2>
    
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-800">ผู้ดูแลระบบ</p>
          <p className="text-sm text-gray-600">admin@clinic.com</p>
        </div>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
          Admin
        </span>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-800">เจ้าหน้าที่</p>
          <p className="text-sm text-gray-600">staff@clinic.com</p>
        </div>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          Staff
        </span>
      </div>
    </div>
  </div>
);

export default UsersManagementPage;