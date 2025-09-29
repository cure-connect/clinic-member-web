import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { Member } from '@/types/index.tsx';

const PointsManagementPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingPoints, setPendingPoints] = useState<number>(0);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>('');

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
          if (!resMe.ok) throw new Error('โหลดข้อมูลผู้ใช้งานไม่สำเร็จ');
          const dataMe = await resMe.json();
          console.log('datame', dataMe)
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
      const res = await fetch('http://localhost:8888/api/point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userid: Number(selectedMemberId),
          reward_used_id: null,
          score: pendingPoints,
          status: 'active',
          created_by: currentUser,
        }),
      });

      if (!res.ok) throw new Error('อัปเดตคะแนนไม่สำเร็จ');

      setMembers(prev =>
        prev.map(m =>
          String(m.userid) === String(selectedMemberId)
            ? { ...m, points: Math.max(0, (m.points || 0) + pendingPoints) }
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
      <h2 className="text-xl font-semibold">จัดการคะแนนสมาชิก</h2>

      <div>
        <label className="block mb-2 font-medium text-gray-700">เลือกสมาชิก</label>
        <select
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedMemberId}
          onChange={e => {
            setSelectedMemberId(e.target.value);
            setPendingPoints(0);
          }}
        >
          <option value="">-- เลือกสมาชิก --</option>
          {members.map(m => (
            <option key={m.userid} value={String(m.userid)}>
              {m.firstname} {m.lastname} - {m.points ?? 0} แต้ม
            </option>
          ))}
        </select>
      </div>

      {selectedMember ? (
        <div className="bg-gray-50 p-4 rounded-lg shadow space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">คะแนนปัจจุบัน</span>
            <span className="text-lg font-bold text-blue-600">
              {selectedMember.points ?? 0} แต้ม
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">แต้มที่รอการอัปเดต</span>
            <span className="text-lg font-bold text-orange-600">
              {pendingPoints >= 0 ? `+${pendingPoints}` : pendingPoints} แต้ม
            </span>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setPendingPoints(prev => prev - 10)}
              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            >
              <Minus className="w-6 h-6" />
            </button>
            <button
              onClick={() => setPendingPoints(prev => prev + 10)}
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {[-10, -5, -1].map(amount => (
              <button
                key={amount}
                onClick={() => setPendingPoints(prev => prev + amount)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                {amount}
              </button>
            ))}
            {[1, 5, 10, 20].map(amount => (
              <button
                key={amount}
                onClick={() => setPendingPoints(prev => prev + amount)}
                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                +{amount}
              </button>
            ))}
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
