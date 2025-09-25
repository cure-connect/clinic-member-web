import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { Member } from '@/types/index.tsx';

interface PointsManagementPageProps {
  members: Member[];
  setMembers: (members: Member[]) => void;
}

const PointsManagementPage: React.FC<PointsManagementPageProps> = ({ members, setMembers }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const updatePoints = (memberId: string, change: number): void => {
    setMembers(members.map(member =>
      member.id === memberId
        ? { ...member, points: Math.max(0, member.points + change) }
        : member
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">จัดการคะแนนสมาชิก</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เลือกสมาชิก</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              <option value="">เลือกสมาชิก</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.id}) - {member.points} แต้ม
                </option>
              ))}
            </select>
          </div>

          {selectedMemberId && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">จัดการคะแนน</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => updatePoints(selectedMemberId, -10)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    title="ลด 10 แต้ม"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold">
                    {members.find(m => m.id === selectedMemberId)?.points || 0} แต้ม
                  </span>
                  <button
                    onClick={() => updatePoints(selectedMemberId, 10)}
                    className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                    title="เพิ่ม 10 แต้ม"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {[-1, -5, -10].map(amount => (
                  <button
                    key={amount}
                    onClick={() => updatePoints(selectedMemberId, amount)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    {amount}
                  </button>
                ))}
                {[1, 5, 10, 20].map(amount => (
                  <button
                    key={amount}
                    onClick={() => updatePoints(selectedMemberId, amount)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsManagementPage;