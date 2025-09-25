import React, { useRef } from 'react';
import { Upload, Download } from 'lucide-react';

const ImportMembersPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = (): void => {
    const csvContent = "ชื่อ,เบอร์โทร,อีเมล\nสมชาย ใจดี,081-234-5678,somchai@email.com\nสมหญิง รักสุขภาพ,082-345-6789,somying@email.com";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'member_template.csv';
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      alert('อัพโหลดไฟล์: ' + e.target.files[0].name);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">นำเข้าข้อมูลสมาชิก</h2>
      
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            เลือกไฟล์
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">ดาวน์โหลดแม่แบบ</h3>
          <p className="text-sm text-gray-600 mb-4">
            ดาวน์โหลดแม่แบบไฟล์ Excel เพื่อกรอกข้อมูลสมาชิกและอัพโหลดกลับเข้าระบบ
          </p>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            ดาวน์โหลดแม่แบบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportMembersPage;