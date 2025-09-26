import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Member } from '@/types/index.tsx';

interface CreateMemberPageProps {
  members: Member[];
  setMembers: (members: Member[]) => void;
}

interface NewMember {
  title: string;
  firstname: string;
  lastname: string;
  mobile_no: string;
  created_by: string;
  linePermission: boolean;
}

const CreateMemberPage: React.FC<CreateMemberPageProps> = ({ members, setMembers }) => {
  const [newMember, setNewMember] = useState<NewMember>({
    title: '',
    firstname: '',
    lastname: '',
    mobile_no: '',
    created_by: '',
    linePermission: false
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8888/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถสร้างสมาชิกได้');
      }

      const data = await response.json();

      const newId = `M${String(members.length + 1).padStart(3, '0')}`;
      const member: Member = {
        id: newId,
        name: `${newMember.title}${newMember.firstname} ${newMember.lastname}`,
        phone: newMember.mobile_no,
        created_by: newMember.created_by,
        points: 0,
        joinDate: new Date().toISOString().split('T')[0],
        qrCode: `${newId}-QR-DATA`
      };

      setMembers([...members, member]);
      setNewMember({
        title: '',
        firstname: '',
        lastname: '',
        mobile_no: '',
        created_by: '',
        linePermission: false
      });

      alert('สร้างสมาชิกเรียบร้อยแล้ว');
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

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">สร้างสมาชิกใหม่</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">คำนำหน้า</label>
          <select
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMember.title}
            onChange={handleInputChange('title')}
          >
            <option value="">-- เลือกคำนำหน้า --</option>
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
            <option value="นางสาว">นางสาว</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMember.firstname}
            onChange={handleInputChange('firstname')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMember.lastname}
            onChange={handleInputChange('lastname')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
          <input
            type="tel"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMember.mobile_no}
            onChange={handleInputChange('mobile_no')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">สร้างโดย</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMember.created_by}
            onChange={handleInputChange('created_by')}
          />
        </div>

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

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            {isLoading ? 'กำลังสร้าง...' : 'สร้างสมาชิก'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMemberPage;
