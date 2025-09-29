import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Printer } from 'lucide-react';
import type { Member, PageType } from '../../types/index.tsx';
import MemberCard from '../../components/UI/MemberCard.tsx';

const MembersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>('members');

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
    `${member.firstname} ${member.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.userid.toString().includes(searchTerm) ||
    member.mobile_no.includes(searchTerm)
  );

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl font-semibold text-gray-800">จัดการข้อมูลสมาชิก</h2>
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
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">รหัส/ชื่อ</th>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">ติดต่อ</th>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">บทบาท</th>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">วันที่สมัคร</th>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map(member => (
                  <tr key={member.userid}>
                    <td className="px-4 py-2 text-sm sm:text-base">
                      <div>{member.title} {member.firstname} {member.lastname}</div>
                      <div className="text-gray-500 text-xs sm:text-sm">{member.userid}</div>
                    </td>
                    <td className="px-4 py-2 text-sm sm:text-base">
                      <div>{member.mobile_no}</div>
                      <div className="text-gray-500 text-xs sm:text-sm">{member.created_by}</div>
                    </td>
                    <td className="px-4 py-2 text-sm sm:text-base">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm">{member.role}</span>
                    </td>
                    <td className="px-4 py-2 text-sm sm:text-base text-gray-500">
                      {new Date(member.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-4 py-2 text-sm sm:text-base flex space-x-2">
                      <button onClick={() => setSelectedMember(member)} className="text-blue-600 hover:text-blue-900 p-2 rounded-lg">
                        <Eye className="w-6 h-6" />
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg">
                        <Edit className="w-6 h-6" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-2 rounded-lg">
                        <Trash2 className="w-6 h-6" />
                      </button>
                      <button onClick={() => setCurrentPage('print-card')} className="text-green-600 hover:text-green-900 p-2 rounded-lg">
                        <Printer className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filteredMembers.map(member => (
              <div key={member.userid} className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{member.title} {member.firstname} {member.lastname}</p>
                    <p className="text-gray-500 text-sm">{member.userid} • {member.mobile_no}</p>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mt-1 inline-block">{member.role}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setSelectedMember(member)} className="text-blue-600 hover:text-blue-900 p-2 rounded-lg">
                      <Eye className="w-6 h-6" />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg">
                      <Edit className="w-6 h-6" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 p-2 rounded-lg">
                      <Trash2 className="w-6 h-6" />
                    </button>
                    <button onClick={() => setCurrentPage('print-card')} className="text-green-600 hover:text-green-900 p-2 rounded-lg">
                      <Printer className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                <div className="text-gray-500 text-xs">{member.created_by}</div>
                <div className="text-gray-500 text-xs">{new Date(member.created_at).toLocaleDateString('th-TH')}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white p-6 rounded-lg max-w-md w-full mx-4 pointer-events-auto shadow-lg">
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
