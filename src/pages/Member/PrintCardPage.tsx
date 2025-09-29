import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import type { Member } from '../../types/index.tsx';
import MemberCard from '../../components/UI/MemberCard.tsx';

const PrintCardPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const selectedMember = members.find(m => m.userid === selectedMemberId);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch('http://localhost:8888/api/user');
        if (!res.ok) throw new Error('Failed to fetch members');
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        console.error('Error fetching members:', err);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">พิมพ์บัตรสมาชิก</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">เลือกสมาชิก</label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
          >
            <option value="">เลือกสมาชิก</option>
            {members.map(member => (
              <option key={member.userid} value={member.userid}>
                {member.firstname} ({member.userid})
              </option>
            ))}
          </select>
        </div>

        {selectedMember && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">ขนาดบัตร: 9.2 x 5.6 cm</p>
              <div className="flex justify-center">
                <MemberCard member={selectedMember} showPrint={true} />
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Printer className="w-4 h-4" />
                พิมพ์บัตร
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintCardPage;
