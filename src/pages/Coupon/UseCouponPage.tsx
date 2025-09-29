import React, { useState, useEffect } from 'react';
import type { Member, Coupon } from '@/types/index.tsx';

const UseCouponPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const selectedMember = members.find(m => m.userid === selectedMemberId);
  const availableCoupons = coupons.filter(
    coupon => selectedMember && selectedMember.points >= coupon.point_require
  );

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

    const fetchCoupons = async () => {
      try {
        const res = await fetch('http://localhost:8888/api/reward');
        if (!res.ok) throw new Error('Failed to fetch coupons');
        const data = await res.json();
        setCoupons(data);
      } catch (err) {
        console.error('Error fetching coupons:', err);
      }
    };

    fetchMembers();
    fetchCoupons();
  }, []);

  const useCoupon = (coupon: Coupon): void => {
    if (selectedMember && selectedMember.points >= coupon.point_require) {
      setMembers(members.map(member =>
        member.userid === selectedMemberId
          ? { ...member, points: member.points - coupon.point_require }
          : member
      ));
      alert(`ใช้คูปอง "${coupon.title}" เรียบร้อยแล้ว`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">ใช้คูปอง</h2>
        
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
                {member.firstname} ({member.userid}) - {member.points} แต้ม
              </option>
            ))}
          </select>
        </div>

        {selectedMember && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              คูปองที่ใช้ได้สำหรับ {selectedMember.firstname} ({selectedMember.points} แต้ม)
            </h3>
            
            {availableCoupons.length === 0 ? (
              <p className="text-gray-600">ไม่มีคูปองที่สามารถใช้ได้</p>
            ) : (
              <div className="grid gap-4">
                {availableCoupons.map(coupon => (
                  <div key={coupon.rewardid} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{coupon.title}</h4>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                      <p className="text-sm text-blue-600">ใช้ {coupon.point_require} แต้ม</p>
                      {coupon.end_date && (
                        <p className="text-xs text-gray-500">หมดอายุ: {coupon.end_date instanceof Date ? coupon.end_date.toLocaleDateString() : coupon.end_date}</p>
                      )}
                    </div>
                    <button
                      onClick={() => useCoupon(coupon)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      ใช้คูปอง
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UseCouponPage;
