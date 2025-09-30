import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, Printer } from 'lucide-react';
import type { Member, PageType } from '../../types/index.tsx';
import MemberCard from '../../components/UI/MemberCard.tsx';

const MembersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [_, setCurrentPage] = useState<PageType>('members');

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
            <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider bg-blue-200">
                      รหัสสมาชิก
                    </th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider bg-blue-200">
                      ชื่อ - นามสกุล
                    </th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider bg-blue-200">
                      เบอร์โทร / ผู้สร้าง
                    </th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider bg-blue-200">
                      บทบาท
                    </th>
                    <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider bg-blue-200">
                      วันที่สมัคร
                    </th>
                    <th className="px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider bg-blue-200">
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-400">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.userid}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 text-sm sm:text-base text-gray-700">{member.userid}</td>
                      <td className="px-4 py-3 text-sm sm:text-base text-gray-800">
                        {member.title} {member.firstname} {member.lastname}
                      </td>
                      <td className="px-4 py-3 text-sm sm:text-base">
                        <div>{member.mobile_no}</div>
                        <div className="text-gray-500 text-xs sm:text-sm">{member.created_by}</div>
                      </td>
                      <td className="px-4 py-3 text-sm sm:text-base">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm">
                          {member.role === 'user' ? 'สมาชิก' : member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm sm:text-base text-gray-500">
                        {new Date(member.created_at).toLocaleDateString("th-TH", {
                          weekday: "long",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm sm:text-base flex justify-center space-x-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="p-2 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-yellow-200 transition-colors duration-200">
                          <Edit className="w-5 h-5 text-yellow-600" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-200 transition-colors duration-200">
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                        <button
                          onClick={() => setCurrentPage("print-card")}
                          className="p-2 rounded-lg hover:bg-green-200 transition-colors duration-200"
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
                  <span className="text-gray-400">บทบาท: </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                    {member.role}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="text-gray-400">ผู้สร้าง: </span>
                  {member.created_by}
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
                  <button className="p-2 rounded-full hover:bg-yellow-100 transition-colors duration-200">
                    <Edit className="w-5 h-5 text-yellow-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-red-100 transition-colors duration-200">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                  <button
                    onClick={() => setCurrentPage("print-card")}
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
