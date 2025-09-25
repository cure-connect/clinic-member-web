import React, { useState } from 'react';
import type { Member, Coupon } from '@/types/index.tsx';

interface UseCouponPageProps {
  members: Member[];
  setMembers: (members: Member[]) => void;
  coupons: Coupon[];
}

const UseCouponPage: React.FC<UseCouponPageProps> = ({ members, setMembers, coupons }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const selectedMember = members.find(m => m.id === selectedMemberId);
  const availableCoupons = coupons.filter(coupon => 
    coupon.isActive && 
    selectedMember && 
    selectedMember.points >= coupon.pointsRequired
  );

  const useCoupon = (coupon: Coupon): void => {
    if (selectedMember && selectedMember.points >= coupon.pointsRequired) {
      setMembers(members.map(member =>
        member.id === selectedMemberId
          ? { ...member, points: member.points - coupon.pointsRequired }
          : member
      ));
      alert(`ใช้คูปอง "${coupon.name}" เรียบร้อยแล้ว`);
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
              <option key={member.id} value={member.id}>
                {member.name} ({member.id}) - {member.points} แต้ม
              </option>
            ))}
          </select>
        </div>

        {selectedMember && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              คูปองที่ใช้ได้สำหรับ {selectedMember.name} ({selectedMember.points} แต้ม)
            </h3>
            
            {availableCoupons.length === 0 ? (
              <p className="text-gray-600">ไม่มีคูปองที่สามารถใช้ได้</p>
            ) : (
              <div className="grid gap-4">
                {availableCoupons.map(coupon => (
                  <div key={coupon.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-800">{coupon.name}</h4>
                      <p className="text-sm text-gray-600">{coupon.description}</p>
                      <p className="text-sm text-blue-600">ใช้ {coupon.pointsRequired} แต้ม</p>
                      {coupon.validUntil && (
                        <p className="text-xs text-gray-500">หมดอายุ: {coupon.validUntil}</p>
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