import React, { useState, useEffect } from 'react';
import { Plus, Minus, UserCircle2 } from 'lucide-react';
import type { Member } from '@/types/index.tsx';

const PointsManagementPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingPoints, setPendingPoints] = useState<number>(0);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);

  const redirectToLogin = () => {
    localStorage.removeItem('clinicToken');
    window.location.href = '/login';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMembers = await fetch('http://localhost:8888/api/user');
        if (!resMembers.ok) throw new Error('โหลดข้อมูลสมาชิกไม่สำเร็จ');
        const dataMembers: Member[] = await resMembers.json();
        setMembers(dataMembers);

        const token = localStorage.getItem('clinicToken');
        if (token) {
          const resMe = await fetch('http://localhost:8888/api/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (resMe.status === 401) {
            alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
            redirectToLogin();
            return;
          }

          const dataMe = await resMe.json();
          if (dataMe?.error?.includes('expired') || dataMe?.message?.includes('expired')) {
            alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
            redirectToLogin();
            return;
          }

          setCurrentUser(dataMe.username);
        }
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const applyPoints = async () => {
    if (!selectedMemberId || pendingPoints === 0) return;
    try {
      const token = localStorage.getItem('clinicToken');
      const res = await fetch('http://localhost:8888/api/point', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userid: Number(selectedMemberId),
          reward_used_id: null,
          score: pendingPoints,
          status: 'active',
          created_by: currentUser,
        }),
      });

      if (res.status === 401) {
        alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
        redirectToLogin();
        return;
      }

      if (!res.ok) throw new Error('อัปเดตคะแนนไม่สำเร็จ');

      setMembers(prev =>
        prev.map(m =>
          String(m.userid) === String(selectedMemberId)
            ? { ...m, point: Math.max(0, (m.point || 0) + pendingPoints) }
            : m
        )
      );

      setPendingPoints(0);
      setConfirmModal(false);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการอัปเดตคะแนน');
    }
  };

  const selectedMember = members.find(m => String(m.userid) === String(selectedMemberId));

  if (loading) return <div className="p-6">กำลังโหลดข้อมูลสมาชิก...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">จัดการคะแนนสมาชิก</h2>

      {/* ✅ Custom dropdown */}
      <div className="relative">
        <label className="block mb-2 font-medium text-gray-700">เลือกสมาชิก</label>

        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className="w-full flex justify-between items-center px-4 py-2 border rounded-lg shadow-sm bg-white hover:border-blue-400 focus:ring-2 focus:ring-blue-300 transition"
        >
          {selectedMember ? (
            <span className="flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-gray-500" />
              <span>{selectedMember.firstname} {selectedMember.lastname}</span>
              <span className="text-sm text-gray-500 ml-2">({selectedMember.point ?? 0} แต้ม)</span>
            </span>
          ) : (
            <span className="text-gray-500">-- เลือกสมาชิก --</span>
          )}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${
              openDropdown ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {openDropdown && (
          <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {members.map((m) => (
              <div
                key={m.userid}
                onClick={() => {
                  setSelectedMemberId(String(m.userid));
                  setOpenDropdown(false);
                }}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                  selectedMemberId === String(m.userid) ? 'bg-blue-100' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCircle2 className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-800">
                    {m.firstname} {m.lastname}
                  </span>
                </div>
                <span className="text-sm text-blue-600">{m.point ?? 0} แต้ม</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMember ? (
        <div className="bg-gray-50 p-4 rounded-lg shadow space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">คะแนนปัจจุบัน</span>
            <span className="text-lg font-bold text-blue-600">
              {selectedMember.point ?? 0} แต้ม
            </span>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setPendingPoints(prev => prev - 1)}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              >
                <Minus className="w-6 h-6" />
              </button>

              <span
                className={`text-2xl font-bold ${
                  pendingPoints > 0
                    ? 'text-green-600'
                    : pendingPoints < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {pendingPoints > 0 ? `+${pendingPoints}` : pendingPoints}
              </span>

              <button
                onClick={() => setPendingPoints(prev => prev + 1)}
                className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              disabled={pendingPoints === 0}
              onClick={() => setConfirmModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              ยืนยันการอัปเดต
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">กรุณาเลือกสมาชิกก่อน</div>
      )}

      {/* Modal */}
      {confirmModal && selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">ยืนยันการอัปเดตคะแนน</h3>
            <p className="mb-6">
              คุณต้องการ {pendingPoints > 0 ? 'เพิ่ม' : 'ลด'}{' '}
              {Math.abs(pendingPoints)} คะแนนให้กับ{' '}
              <span className="font-medium">
                {selectedMember.firstname} {selectedMember.lastname}
              </span>{' '}
              หรือไม่?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={applyPoints}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsManagementPage;
