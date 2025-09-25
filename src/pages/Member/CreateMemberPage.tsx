import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Member } from '@/types/index.tsx';

interface CreateMemberPageProps {
  members: Member[];
  setMembers: (members: Member[]) => void;
}

interface NewMember {
  name: string;
  phone: string;
  email: string;
  linePermission: boolean;
}

const CreateMemberPage: React.FC<CreateMemberPageProps> = ({ members, setMembers }) => {
  const [newMember, setNewMember] = useState<NewMember>({
    name: '',
    phone: '',
    email: '',
    linePermission: false
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const newId = `M${String(members.length + 1).padStart(3, '0')}`;
    const member: Member = {
      ...newMember,
      id: newId,
      points: 0,
      joinDate: new Date().toISOString().split('T')[0],
      qrCode: `${newId}-QR-DATA`
    };
    setMembers([...members, member]);
    setNewMember({ name: '', phone: '', email: '', linePermission: false });
    alert('สร้างสมาชิกเรียบร้อยแล้ว');
  };

  const handleInputChange = (field: keyof NewMember) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = field === 'linePermission' ? e.target.checked : e.target.value;
    setNewMember(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">สร้างสมาชิกใหม่</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMember.name}
            onChange={handleInputChange('name')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
          <input
            type="tel"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMember.phone}
            onChange={handleInputChange('phone')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMember.email}
            onChange={handleInputChange('email')}
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            สร้างสมาชิก
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMemberPage;