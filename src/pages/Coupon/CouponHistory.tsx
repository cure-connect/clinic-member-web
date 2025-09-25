import React from 'react';

const CouponHistoryPage: React.FC = () => (
  <div className="bg-white rounded-lg shadow border p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">ประวัติการใช้คูปอง</h2>
    
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-800">ส่วนลด 10% การตรวจสุขภาพ</p>
          <p className="text-sm text-gray-600">สมชาย ใจดี (M001)</p>
          <p className="text-xs text-gray-500">2024-09-20 14:30</p>
        </div>
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
          -100 แต้ม
        </span>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-800">ฟรีการปรึกษาแพทย์</p>
          <p className="text-sm text-gray-600">สมหญิng รักสุขภาพ (M002)</p>
          <p className="text-xs text-gray-500">2024-09-19 10:15</p>
        </div>
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
          -200 แต้ม
        </span>
      </div>
    </div>
  </div>
);

export default CouponHistoryPage;