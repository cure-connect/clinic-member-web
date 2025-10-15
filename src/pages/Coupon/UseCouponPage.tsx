import React, { useState, useEffect, useRef } from 'react';
import type { Member, Coupon } from '@/types/index.tsx';

const UseCouponPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [search, setSearch] = useState<string>(''); // ช่องค้นหา
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // แสดง dropdown

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedMember = members.find(
    (m) => String(m.userid) === String(selectedMemberId)
  );

  const availableCoupons = selectedMember
    ? coupons.filter((coupon) => selectedMember.point >= coupon.point_require)
    : coupons;

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

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const useCoupon = async (coupon: Coupon): Promise<void> => {
    if (!selectedMember) {
      alert('กรุณาเลือกสมาชิกก่อนใช้คูปอง');
      return;
    }

    if (selectedMember.point < coupon.point_require) {
      alert('แต้มไม่เพียงพอในการใช้คูปองนี้');
      return;
    }

    try {
      const body = {
        userid: selectedMember.userid,
        rewardid: coupon.rewardid,
        point_used: coupon.point_require,
        used_at: new Date().toISOString(),
        status: 'used',
      };

      const res = await fetch('http://localhost:8888/api/rewardused', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to record coupon usage');

      setMembers((prev) =>
        prev.map((member) =>
          String(member.userid) === String(selectedMemberId)
            ? { ...member, point: member.point - coupon.point_require }
            : member
        )
      );

      alert(`ใช้คูปอง "${coupon.title}" เรียบร้อยแล้ว`);
    } catch (err) {
      console.error('Error using coupon:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกการใช้คูปอง');
    }
  };

  // กรองสมาชิกตามคำค้น
  const filteredMembers = members.filter(
    (m) =>
      m.firstname.toLowerCase().includes(search.toLowerCase()) ||
      m.lastname.toLowerCase().includes(search.toLowerCase()) ||
      String(m.userid).includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">ใช้คูปอง</h2>

        {/* 🔍 ช่องค้นหา + Dropdown */}
        <div className="mb-6 relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เลือกสมาชิก
          </label>
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือรหัสสมาชิก..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={
              selectedMember
                ? `${selectedMember.firstname} ${selectedMember.lastname} (${selectedMember.userid})`
                : search
            }
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
              setSelectedMemberId('');
            }}
            onFocus={() => setShowDropdown(true)}
          />

          {showDropdown && filteredMembers.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border rounded-lg shadow max-h-48 overflow-y-auto mt-1">
              {filteredMembers.map((member) => (
                <li
                  key={member.userid}
                  onClick={() => {
                    setSelectedMemberId(String(member.userid));
                    setSearch('');
                    setShowDropdown(false);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                >
                  {member.firstname} {member.lastname} ({member.userid}) - {member.point} แต้ม
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {selectedMember
              ? `คูปองที่ใช้ได้สำหรับ ${selectedMember.firstname} (${selectedMember.point} แต้ม)`
              : 'รายการคูปองทั้งหมด'}
          </h3>

          {availableCoupons.length === 0 ? (
            <p className="text-gray-600">ไม่มีคูปองที่สามารถใช้ได้</p>
          ) : (
            <div className="grid gap-4">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.rewardid}
                  className="border rounded-xl p-4 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">{coupon.title}</h4>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                    <p className="text-sm text-blue-600 font-semibold mt-1">
                      ใช้ {coupon.point_require} แต้ม
                    </p>
                    {coupon.end_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        หมดอายุ:{' '}
                        {coupon.end_date instanceof Date
                          ? coupon.end_date.toLocaleDateString()
                          : coupon.end_date}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => useCoupon(coupon)}
                    className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                      selectedMember
                        ? selectedMember.point >= coupon.point_require
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {selectedMember ? 'ใช้คูปอง' : 'ดูรายละเอียด'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UseCouponPage;
