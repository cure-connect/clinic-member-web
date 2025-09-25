import React, { useState } from 'react';
import { Search, Eye, Edit, Trash2, Printer } from 'lucide-react';
import type { Member, PageType } from '../../types/index.tsx';
import MemberCard from '../../components/UI/MemberCard';

interface MembersPageProps {
    members: Member[];
    setSelectedMember: (member: Member | null) => void;
    selectedMember: Member | null;
    setCurrentPage: (page: PageType) => void;
}

const MembersPage: React.FC<MembersPageProps> = ({
    members,
    setSelectedMember,
    selectedMember,
    setCurrentPage
}) => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">จัดการข้อมูลสมาชิก</h2>
            </div>

            <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาสมาชิก..."
                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    รหัส/ชื่อ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ติดต่อ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    คะแนน
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    วันที่สมัคร
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    จัดการ
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.map(member => (
                                <tr key={member.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                            <div className="text-sm text-gray-500">{member.id}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{member.phone}</div>
                                        <div className="text-sm text-gray-500">{member.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                            {member.points} แต้ม
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {member.joinDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => setSelectedMember(member)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="ดูบัตรสมาชิก"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="text-yellow-600 hover:text-yellow-900" title="แก้ไข">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900" title="ลบ">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage('print-card')}
                                            className="text-green-600 hover:text-green-900"
                                            title="พิมพ์บัตร"
                                        >
                                            <Printer className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">บัตรสมาชิก</h3>
                        <MemberCard member={selectedMember} />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default MembersPage;