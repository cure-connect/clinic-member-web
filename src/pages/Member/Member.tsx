import React, { useState, useEffect, useRef } from 'react';
import { Search, Eye, Edit, Trash2, Printer, Plus, X, Upload, Download } from 'lucide-react';
import type { Member } from '../../types/index.tsx';
import MemberCard from '../../components/UI/MemberCard.tsx';
import api from '../../utils/axiosInstance.ts'

interface NewMember {
  title: string;
  firstname: string;
  lastname: string;
  mobile_no: string;
  created_by: string;
  linePermission: boolean;
}

const apiUrl = import.meta.env.VITE_API_URL;

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const token = localStorage.getItem("clinicToken");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get(`${apiUrl}/user`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data: Member[] = await res.data;
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

  const handleDeleteClick = (member: Member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    try {
      const res = await fetch(`${apiUrl}/users/${memberToDelete.userid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "เกิดข้อผิดพลาดในการลบสมาชิก");
        return;
      }

      setMembers((prev) => prev.filter((m) => m.userid !== memberToDelete.userid));
      setShowDeleteModal(false);
      setMemberToDelete(null);
      showNotification("ลบสมาชิกเรียบร้อยแล้ว", "success");
    } catch (error: any) {
      console.error("Error deleting member:", error);
      showNotification(error.message || "เกิดข้อผิดพลาดในการลบสมาชิก", "error");
    }
  };

  const user = JSON.parse(localStorage.getItem("clinicUser") || "{}");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...newMember,
        created_by: user.username || "admin",
      };

      const response = await fetch(`${apiUrl}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('ไม่สามารถสร้างสมาชิกได้');

      const createdMember = await response.json();

      setMembers(prev => [...prev, createdMember]);

      setNewMember({
        title: '',
        firstname: '',
        lastname: '',
        mobile_no: '',
        created_by: '',
        linePermission: false
      });

      showNotification('สร้างสมาชิกเรียบร้อยแล้ว', 'success');
      setIsModalOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      showNotification(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
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

      const response = await fetch(`${apiUrl}/update/${editMember.userid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('ไม่สามารถแก้ไขข้อมูลได้');

      setIsEditModalOpen(false);
      setEditMember(null);
      showNotification('แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
    } catch (err: any) {
      showNotification(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
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
      showNotification("กรุณาเลือกไฟล์ก่อน", "error");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`${apiUrl}/user/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        showNotification("เกิดข้อผิดพลาด: " + err.message, "error");

        return;
      }

      const data = await res.json();
      showNotification(`นำเข้าข้อมูลสำเร็จ! จำนวนสมาชิก: ${data.data.length}`, "success");
      setIsImportModalOpen(false);
    } catch (error) {
      console.error("Error importing file:", error);
      showNotification("เกิดข้อผิดพลาดในการนำเข้าข้อมูล", "error");
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePrintCard = (member: Member): void => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) return;

    const html = `
  <html>
    <head>
      <title>Member Card - ${member.firstname} ${member.lastname}</title>
      <style>
        @page {
          size: A4;
          margin: 1cm;
        }

        body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: white;
          margin: 0;
          padding: 0.5cm;
        }

        .card {
          width: 8.56cm;
          height: 5.39cm;
          padding: 0.3cm;
          box-sizing: border-box;
          background: linear-gradient(to right, rgb(59, 130, 246), rgb(37, 99, 235));
          color: white;
          border-radius: 0.3rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }

        .header h2 {
          font-size: 0.38cm;
          line-height: 0.42cm;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 0.1cm 0;
        }

        .header p {
          font-size: 0.24cm;
          line-height: 0.28cm;
          opacity: 0.9;
          margin: 0;
        }

        .content {
          display: flex;
          flex-direction: row;
          flex: 1;
          align-items: center;
          gap: 0.5cm;
          min-height: 0;
        }

        .info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          min-width: 0;
        }

        .info-row {
          font-size: 0.28cm;
          line-height: 0.32cm;
          margin-bottom: 0.2cm;
        }

        .label {
          opacity: 0.8;
        }

        .name-label {
          font-size: 0.24cm;
          line-height: 0.28cm;
          opacity: 0.8;
          margin-bottom: 0.05cm;
        }

        .info h3 {
          font-weight: bold;
          font-size: 0.36cm;
          line-height: 0.40cm;
          margin: 0 0 0.15cm 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .qr {
          background: white;
          border-radius: 0.3rem;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.4cm;
          height: 2.4cm;
          flex-shrink: 0;
        }

        .qr img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .footer {
          margin-top: 0.2cm;
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          padding-top: 0.15cm;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .footer-text {
          font-size: 0.24cm;
          line-height: 0.28cm;
          opacity: 0.9;
          margin: 0;
        }

        @media print {
          body {
            background: white;
            padding: 0;
          }
          .card {
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <h2>Wanna Clinic</h2>
            <p>Member Card</p>
          </div>
        </div>
        <div class="content">
          <div class="info">
            <div style="margin-bottom:0.15cm;">
              <p class="name-label">ชื่อ-นามสกุล</p>
              <h3>${member.title} ${member.firstname} ${member.lastname}</h3>
            </div>
            <p class="info-row">
              <span class="label">โทรศัพท์:</span> <strong>${member.mobile_no}</strong>
            </p>
          </div>
          <div class="qr">
            <img src="${member.qrcode || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${member.userid}`
      }" alt="QR Code" />
          </div>
        </div>
        <div class="footer">
          <div>
            <p class="footer-text">เบอร์โทรศัพท์: 099-394-9365</p>
            <p class="footer-text">697 80 ถนน สุรชัย ตำบล มะขามหย่ง อำเภอเมืองชลบุรี ชลบุรี 20000</p>
          </div>
        </div>
      </div>
      <script>
        window.onload = () => {
          window.print();
          window.onafterprint = () => window.close();
        };
      </script>
    </body>
  </html>
  `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };


  return (
    <div className="space-y-4 p-4 sm:p-6">
      {showToast && (
        <div className="fixed inset-0 flex items-start justify-end px-4 py-6 pointer-events-none sm:p-6 z-50">
          <div className="w-full max-w-sm pointer-events-auto">
            <div className="rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">

                  <div className="flex-shrink-0">
                    {toastType === 'success' ? (
                      <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>

                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {toastType === 'success' ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {toastMessage}
                    </p>
                  </div>

                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      onClick={() => setShowToast(false)}
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 
                    111.414 1.414L11.414 10l4.293 4.293a1 1 
                    01-1.414 1.414L10 11.414l-4.293 4.293a1 1 
                    01-1.414-1.414L8.586 10 4.293 5.707a1 1 
                    010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="ค้นหาสมาชิก..."
            className="pl-10 pr-4 py-2 w-full shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                    {['รหัสสมาชิก', 'ชื่อ - นามสกุล', 'คะแนนคงเหลือ', 'เบอร์โทร / ผู้สร้าง', 'บทบาท', 'วันที่สมัคร', 'จัดการ'].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider bg-blue-200"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => (
                    <tr key={member.userid} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-gray-700">{member.userid}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{member.title} {member.firstname} {member.lastname}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{member.point}</td>
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
                        <button
                          onClick={() => handleDeleteClick(member)}
                          className="p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
                        >
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
                  <span className="text-gray-400">รหัสสมาชิก: </span>
                  <span className="font-medium text-gray-800">
                    {member.userid}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-gray-400">ชื่อ - นามสกุล: </span>
                  {member.title} {member.firstname} {member.lastname}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="text-gray-400">คะแนนคงเหลือ: </span>
                  {member.point}
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
                  <button
                    onClick={() => handleDeleteClick(member)}
                    className="p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
                  >
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

      {showDeleteModal && memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowDeleteModal(false)}
          ></div>

          <div className="relative bg-white rounded-xl shadow-xl p-6 w-96 z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                ยืนยันการลบสมาชิก
              </h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-700 mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิก
              <strong className="text-red-600">
                {memberToDelete.firstname} {memberToDelete.lastname}
              </strong>{" "}
              ?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

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

                {selectedFile && (
                  <div className="mt-4 text-sm text-gray-700">
                    📄 <strong>{selectedFile.name}</strong>
                  </div>
                )}
              </div>

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
          <div className="relative bg-white p-4 rounded-xl shadow-2xl flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">บัตรสมาชิก</h3>
            <MemberCard member={selectedMember} showPrint />
            <button
              onClick={() => setSelectedMember(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MembersPage;