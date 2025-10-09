import React, { useRef, useState, DragEvent } from 'react';
import { Upload, Download, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

const ImportMembersPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    count: number;
    message: string;
  } | null>(null);

  const downloadTemplate = (): void => {
    const csvContent =
      "title,firstname,lastname,mobile_no,role\nนาย,สมชาย,ใจดี,081-234-5678,user\nนาง,สมหญิง,รักสุขภาพ,082-345-6789,user";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'member_template.csv';
    link.click();
  };

  const handleFileSelect = (file: File) => {
    // ตรวจสอบนามสกุลไฟล์
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      alert('กรุณาเลือกไฟล์ CSV หรือ Excel เท่านั้น');
      return;
    }

    // ตรวจสอบขนาดไฟล์ (จำกัดที่ 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์มีขนาดใหญ่เกิน 5MB');
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('http://localhost:8888/api/user/import', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setImportResult({
          success: false,
          count: 0,
          message: err.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล'
        });
        return;
      }

      const data = await res.json();
      setImportResult({
        success: true,
        count: data.data?.length || 0,
        message: `นำเข้าข้อมูลสำเร็จ! จำนวนสมาชิก: ${data.data?.length || 0} คน`
      });
      
      console.log('Imported members:', data.data);
      
      // รีเซ็ตไฟล์หลังจาก import สำเร็จ
      setTimeout(() => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 3000);

    } catch (error) {
      console.error('Error importing file:', error);
      setImportResult({
        success: false,
        count: 0,
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์'
      });
    } finally {
      setLoading(false);
      setDragOver(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">นำเข้าข้อมูลสมาชิก</h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        รองรับไฟล์ CSV และ Excel (xlsx, xls) ขนาดไม่เกิน 5MB
      </p>

      {/* Upload Area */}
      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            dragOver 
              ? 'border-blue-400 bg-blue-50 scale-105' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <Upload className={`mx-auto w-12 h-12 mb-4 transition ${
            dragOver ? 'text-blue-500' : 'text-gray-400'
          }`} />
          <p className="text-gray-600 mb-4">
            {dragOver ? 'วางไฟล์ที่นี่...' : 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            เลือกไฟล์
          </button>
          <p className="text-xs text-gray-500 mt-3">
            รองรับ: CSV, XLSX, XLS (สูงสุด 5MB)
          </p>
        </div>
      ) : (
        // File Preview
        <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-blue-500 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 hover:bg-red-100 rounded-full transition"
              disabled={loading}
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>

          {/* Import Button */}
          <div className="flex gap-3">
            <button
              onClick={handleRemoveFile}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
            >
              เลือกไฟล์ใหม่
            </button>
            <button
              onClick={uploadFile}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>กำลังนำเข้าข้อมูล...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>นำเข้าข้อมูล</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
          importResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {importResult.success ? (
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              importResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {importResult.success ? 'สำเร็จ!' : 'เกิดข้อผิดพลาด'}
            </p>
            <p className={`text-sm ${
              importResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {importResult.message}
            </p>
            {importResult.success && importResult.count > 0 && (
              <p className="text-xs text-green-600 mt-1">
                ข้อมูลถูกเพิ่มเข้าระบบเรียบร้อยแล้ว
              </p>
            )}
          </div>
        </div>
      )}

      {/* Download Template */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-1">ดาวน์โหลดแม่แบบ</h3>
            <p className="text-sm text-gray-600 mb-3">
              ดาวน์โหลดไฟล์ตัวอย่างเพื่อดูรูปแบบการกรอกข้อมูลที่ถูกต้อง
            </p>
            <button
              onClick={downloadTemplate}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
            >
              ดาวน์โหลดแม่แบบ CSV
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📋 วิธีการใช้งาน</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>ดาวน์โหลดไฟล์แม่แบบ</li>
          <li>กรอกข้อมูลสมาชิกลงในไฟล์ตามรูปแบบ</li>
          <li>อัปโหลดไฟล์กลับเข้าระบบ</li>
          <li>ตรวจสอบผลการนำเข้าข้อมูล</li>
        </ol>
        <div className="mt-3 text-xs text-blue-700">
          <p className="font-medium mb-1">⚠️ คำแนะนำ:</p>
          <ul className="space-y-0.5 list-disc list-inside ml-2">
            <li>ต้องมีหัวข้อ: title, firstname, lastname, mobile_no, role</li>
            <li>title: นาย, นาง, นางสาว</li>
            <li>role: user (สมาชิกทั่วไป) หรือ admin (ผู้ดูแลระบบ)</li>
            <li>mobile_no: ระบุในรูปแบบ 0XX-XXX-XXXX</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImportMembersPage;