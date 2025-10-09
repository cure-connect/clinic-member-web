import React, { useState, useEffect, useRef } from 'react';
import { Search, Eye, Edit, Trash2, Printer, Plus, X, Upload, Download } from 'lucide-react';
import type { Member } from '../../types/index.tsx';
import MemberCard from '../../components/UI/MemberCard.tsx';

interface NewMember {
  title: string;
  firstname: string;
  lastname: string;
  mobile_no: string;
  created_by: string;
  linePermission: boolean;
}

const MembersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [newMember, setNewMember] = useState<NewMember>({
    title: '',
    firstname: '',
    lastname: '',
    mobile_no: '',
    created_by: '',
    linePermission: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editMember, setEditMember] = useState<{ userid: number; firstname: string; lastname: string; mobile_no: string } | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch('http://localhost:8888/api/user');
        if (!res.ok) throw new Error('Failed to fetch members');
        const data: Member[] = await res.json();
        setMembers(data);
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member =>
    `${member.firstname || ''} ${member.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.userid?.toString().includes(searchTerm) ||
    member.mobile_no?.includes(searchTerm)
  );

  const user = JSON.parse(localStorage.getItem("clinicUser") || "{}");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...newMember,
        created_by: user.username || "admin",
      };

      const response = await fetch('http://localhost:8888/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('ไม่สามารถสร้างสมาชิกได้');

      await response.json();
      setNewMember({
        title: '',
        firstname: '',
        lastname: '',
        mobile_no: '',
        created_by: '',
        linePermission: false
      });
      alert('สร้างสมาชิกเรียบร้อยแล้ว');
      setIsModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewMember) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const value = field === 'linePermission' ? (e.target as HTMLInputElement).checked : e.target.value;
    setNewMember(prev => ({ ...prev, [field]: value }));
  };

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

  const handleEditClick = (member: Member): void => {
    setEditMember({
      userid: parseInt(member.userid),
      firstname: member.firstname,
      lastname: member.lastname,
      mobile_no: member.mobile_no
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!editMember) return;

    setIsLoading(true);
    try {
      const payload = {
        firstname: editMember.firstname,
        lastname: editMember.lastname,
        mobile_no: editMember.mobile_no
      };

      const response = await fetch(`http://localhost:8888/api/update/${editMember.userid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('ไม่สามารถแก้ไขข้อมูลได้');

      alert('แก้ไขข้อมูลเรียบร้อยแล้ว');
      setIsEditModalOpen(false);
      setEditMember(null);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInputChange = (field: 'firstname' | 'lastname' | 'mobile_no') => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (!editMember) return;
    setEditMember(prev => prev ? { ...prev, [field]: e.target.value } : null);
  };

  const handleImportFile = async (): Promise<void> => {
    if (!selectedFile) {
      alert("กรุณาเลือกไฟล์ก่อน");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("http://localhost:8888/api/user/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert("เกิดข้อผิดพลาด: " + err.message);
        return;
      }

      const data = await res.json();
      alert(`นำเข้าข้อมูลสำเร็จ! จำนวนสมาชิก: ${data.data.length}`);
      setIsImportModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error importing file:", error);
      alert("เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const handlePrintCard = async (member: Member): Promise<void> => {
    try {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      const html2canvasModule = await import('html2canvas');
      const html2canvas = (html2canvasModule.default as unknown) as (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;

      const cardHTML = `
      <div style="
        width: 10.5cm;
        height: 6.3cm;
        padding: 0.4cm;
        box-sizing: border-box;
        background: linear-gradient(to right, rgb(59, 130, 246), rgb(37, 99, 235));
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
          <div>
            <h2 style="font-size: 0.45cm; line-height: 0.5cm; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">
              Dental Clinic
            </h2>
            <p style="font-size: 0.28cm; line-height: 0.32cm; opacity: 0.9; margin: 0;">
              Member Card
            </p>
          </div>
        </div>

        <div style="display: flex; flex-direction: row; flex: 1; align-items: center; gap: 0.75rem;">
          <div style="display: flex; flex-direction: column; justify-content: center; flex: 1;">
            <p style="font-size: 0.33cm; line-height: 0.50cm; margin-bottom: 1.25rem;">
              <span style="opacity: 0.8;">ID:</span> ${member.userid}
            </p>

            <div style="margin-bottom: 1.25rem;">
              <p style="opacity: 0.8; margin-bottom: 0.125rem; font-size: 0.33cm; line-height: 0.40cm;">
                ชื่อ-นามสกุล
              </p>
              <h3 style="font-weight: bold; font-size: 0.48cm; line-height: 0.55cm; margin: 0;">
                ${member.title} ${member.firstname} ${member.lastname}
              </h3>
            </div>
            
            <p style="font-size: 0.33cm; line-height: 0.38cm; margin: 0;">
              <span style="opacity: 0.8;">Tel:</span> ${member.mobile_no}
            </p>
          </div>

          <div style="
            background: white;
            border-radius: 0.5rem;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0.125rem;
            width: 3.3cm;
            height: 3.4cm;
            flex-shrink: 0;
          ">
            <img
              src="${member.qrcode || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${member.userid}`}"
              alt="QR Code"
              style="width: 100%; height: 100%; object-fit: contain;"
            />
          </div>
        </div>

        <div style="
          margin-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          padding-top: 0.375rem;
          display: flex;
          justify-content: space-between;
          align-items: end;
        ">
          <div>
            <p style="opacity: 0.9; font-size: 0.28cm; line-height: 0.32cm; margin: 0;">
              📞 02-123-4567
            </p>
            <p style="opacity: 0.9; font-size: 0.28cm; line-height: 0.32cm; margin: 0;">
              Bangkok, Thailand
            </p>
          </div>
        </div>
      </div>
    `;

      container.innerHTML = cardHTML;

      const qrImage = container.querySelector('img');
      if (qrImage) {
        await new Promise((resolve) => {
          qrImage.onload = resolve;
          qrImage.onerror = resolve;
        });
      }

      const canvas = await html2canvas(container, {
        scale: 3,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      document.body.removeChild(container);

      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `member-card-${member.userid}-${member.firstname}-${member.lastname}.png`;
          link.click();
          URL.revokeObjectURL(url);
          alert('ดาวน์โหลดบัตรสมาชิกเรียบร้อยแล้ว');
        }
      }, 'image/png');

    } catch (error) {
      console.error('Error printing card:', error);
      alert('ไม่สามารถพิมพ์บัตรได้ กรุณาลองใหม่');
    }
  };



  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">จัดการข้อมูลสมาชิก</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-2 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            เพิ่มสมาชิก
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 text-sm sm:text-base bg-green-500 hover:bg-green-600 text-white rounded-lg shadow flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            นำเข้าข้อมูล
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาสมาชิก..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-6">กำลังโหลดข้อมูล...</div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    {['รหัสสมาชิก', 'ชื่อ - นามสกุล', 'เบอร์โทร / ผู้สร้าง', 'บทบาท', 'วันที่สมัคร', 'จัดการ'].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider bg-blue-200"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-400">
                  {filteredMembers.map((member) => (
                    <tr key={member.userid} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-gray-700">{member.userid}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{member.title} {member.firstname} {member.lastname}</td>
                      <td className="px-4 py-3 text-sm">
                        <div>{member.mobile_no}</div>
                        <div className="text-gray-500 text-xs">{member.created_by}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                          {member.role === 'user' ? 'สมาชิก' : member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(member.created_at).toLocaleDateString("th-TH", {
                          weekday: "long",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm justify-center space-x-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="p-2 rounded-lg hover:bg-blue-200 transition"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleEditClick(member)}
                          className="p-2 rounded-lg hover:bg-yellow-200 transition"
                        >
                          <Edit className="w-5 h-5 text-yellow-600" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-200 transition">
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                        <button
                          onClick={() => handlePrintCard(member)}
                          className="p-2 rounded-lg hover:bg-green-200 transition"
                        >
                          <Printer className="w-5 h-5 text-green-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {filteredMembers.map((member) => (
              <div
                key={member.userid}
                className="bg-white p-4 rounded-lg shadow flex flex-col gap-3"
              >
                <div className="text-sm text-gray-600">
                  <span className="text-gray-400">ชื่อ - นามสกุล: </span>
                  <span className="font-medium text-gray-800">
                    {member.title} {member.firstname} {member.lastname}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-gray-400">รหัสสมาชิก: </span>
                  {member.userid}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-gray-400">เบอร์โทรศัพท์: </span>
                  {member.mobile_no}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-gray-400">ผู้สร้าง: </span>
                  {member.created_by}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-gray-400">บทบาท: </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                    {member.role === 'user' ? 'สมาชิก' : member.role}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-gray-400">วันที่สร้าง: </span>
                  {new Date(member.created_at).toLocaleDateString("th-TH", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <div className="flex justify-around border-t pt-3">
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="p-2 rounded-full hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Eye className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleEditClick(member)}
                    className="p-2 rounded-full hover:bg-yellow-100 transition-colors duration-200"
                  >
                    <Edit className="w-5 h-5 text-yellow-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-red-100 transition-colors duration-200">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                  <button
                    onClick={() => handlePrintCard(member)}
                    className="p-2 rounded-full hover:bg-green-100 transition-colors duration-200"
                  >
                    <Printer className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">สร้างสมาชิกใหม่</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คำนำหน้า</label>
                <select
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={newMember.title}
                  onChange={handleInputChange('title')}
                >
                  <option value="">-- เลือกคำนำหน้า --</option>
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="ชื่อ"
                required
                value={newMember.firstname}
                onChange={handleInputChange('firstname')}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="text"
                placeholder="นามสกุล"
                required
                value={newMember.lastname}
                onChange={handleInputChange('lastname')}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="tel"
                placeholder="เบอร์โทรศัพท์"
                required
                value={newMember.mobile_no}
                onChange={handleInputChange('mobile_no')}
                className="w-full px-3 py-2 border rounded-lg"
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="linePermission"
                  className="mr-2"
                  checked={newMember.linePermission}
                  onChange={handleInputChange('linePermission')}
                />
                <label htmlFor="linePermission" className="text-sm text-gray-700">
                  ยินยอมให้เก็บข้อมูลในระบบ LINE
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                <Plus className="w-4 h-4" />
                {isLoading ? 'กำลังสร้าง...' : 'สร้างสมาชิก'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ ส่วน modal import file ที่แก้ใหม่ */}
      {isImportModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsImportModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">นำเข้าข้อมูลสมาชิก</h2>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              >
                <Upload className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  เลือกไฟล์
                </button>

                {/* ✅ แสดงชื่อไฟล์ */}
                {selectedFile && (
                  <div className="mt-4 text-sm text-gray-700">
                    📄 <strong>{selectedFile.name}</strong>
                  </div>
                )}
              </div>

              {/* ✅ ปุ่มยืนยัน */}
              <button
                onClick={handleImportFile}
                disabled={!selectedFile || isLoading}
                className={`w-full flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-white ${!selectedFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {isLoading ? 'กำลังนำเข้า...' : 'ยืนยันนำเข้า'}
              </button>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">ดาวน์โหลดแม่แบบ</h3>
                <p className="text-sm text-gray-600 mb-4">
                  ดาวน์โหลดแม่แบบไฟล์ Excel เพื่อกรอกข้อมูลสมาชิกและอัพโหลดกลับเข้าระบบ
                </p>
                <button
                  onClick={() => {
                    const csvContent =
                      "title,firstname,lastname,mobile_no,role\nนาย,สมชาย,ใจดี,081-234-5678,user\nนาง,สมหญิง,รักสุขภาพ,082-345-6789,user";
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'member_template.csv';
                    link.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลดแม่แบบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editMember && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full p-6 z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">แก้ไขข้อมูลสมาชิก</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสสมาชิก
                </label>
                <input
                  type="text"
                  value={editMember.userid}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ
                </label>
                <input
                  type="text"
                  placeholder="ชื่อ"
                  required
                  value={editMember.firstname}
                  onChange={handleEditInputChange('firstname')}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  นามสกุล
                </label>
                <input
                  type="text"
                  placeholder="นามสกุล"
                  required
                  value={editMember.lastname}
                  onChange={handleEditInputChange('lastname')}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  placeholder="เบอร์โทรศัพท์"
                  required
                  value={editMember.mobile_no}
                  onChange={handleEditInputChange('mobile_no')}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
              >
                <Edit className="w-4 h-4" />
                {isLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setSelectedMember(null)}
          ></div>
          <div className="relative bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">บัตรสมาชิก</h3>
            <MemberCard member={selectedMember} />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-gray-600"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;