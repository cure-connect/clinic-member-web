import React, { useState, useEffect, useRef } from 'react';
import type { Member, Coupon } from '@/types/index.tsx';

const UseCouponPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [searchMember, setSearchMember] = useState<string>('');
  const [searchCoupon, setSearchCoupon] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalCoupon, setModalCoupon] = useState<Coupon | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmCoupon, setConfirmCoupon] = useState<Coupon | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedMember = members.find(m => String(m.userid) === String(selectedMemberId));

  const couponsToShow = selectedMember
    ? coupons.filter(c => selectedMember.point >= c.point_require)
    : coupons;

  const filteredCoupons = couponsToShow.filter(
    c =>
      c.title.toLowerCase().includes(searchCoupon.toLowerCase()) ||
      (c.description?.toLowerCase().includes(searchCoupon.toLowerCase()) ?? false)
  );

  const filteredMembers = members.filter(
    m =>
      m.firstname.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.lastname.toLowerCase().includes(searchMember.toLowerCase()) ||
      String(m.userid).includes(searchMember)
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const useCoupon = async (coupon: Coupon) => {
    if (!selectedMember) {
      alert('กรุณาเลือกสมาชิกก่อนใช้คูปอง');
      return;
    }

    if (selectedMember.point < coupon.point_require) {
      alert('แต้มไม่เพียงพอในการใช้คูปองนี้');
      return;
    }

    const storedUser = localStorage.getItem("clinicUser");
    if (!storedUser) {
      alert('กรุณาเข้าสู่ระบบก่อนใช้คูปอง');
      return;
    }
    const username = JSON.parse(storedUser).username;

    try {
      const body = {
        userid: selectedMember.userid,
        rewardid: coupon.rewardid,
        point_used: coupon.point_require,
        created_by: username,
        used_at: new Date().toISOString(),
        status: 'used',
      };

      const res = await fetch('http://localhost:8888/api/rewardused', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to record coupon usage');

      setMembers(prev =>
        prev.map(m =>
          String(m.userid) === String(selectedMemberId)
            ? { ...m, point: m.point - coupon.point_require }
            : m
        )
      );

      showNotification(`ใช้คูปอง "${coupon.title}" เรียบร้อยแล้ว`);
    } catch (err) {
      console.error('Error using coupon:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกการใช้คูปอง');
    }
  };

  const openModal = (coupon: Coupon) => {
    setModalCoupon(coupon);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalCoupon(null);
  };

  const openConfirm = (coupon: Coupon) => {
    setConfirmCoupon(coupon);
    setShowConfirm(true);
  };

  const closeConfirm = () => {
    setConfirmCoupon(null);
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6">
      {showToast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg pointer-events-auto transition-all">
            {toastMessage}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">ใช้คูปอง</h2>

        <div className="mb-6 relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">เลือกสมาชิก</label>
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือรหัสสมาชิก..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMember ? `${selectedMember.firstname} ${selectedMember.lastname} (${selectedMember.userid})` : searchMember}
            onChange={(e) => {
              setSearchMember(e.target.value);
              setShowDropdown(true);
              setSelectedMemberId('');
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filteredMembers.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border rounded-lg shadow max-h-48 overflow-y-auto mt-1">
              {filteredMembers.map(member => (
                <li
                  key={member.userid}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                  onClick={() => {
                    setSelectedMemberId(String(member.userid));
                    setSearchMember('');
                    setShowDropdown(false);
                  }}
                >
                  {member.firstname} {member.lastname} ({member.userid}) - {member.point} แต้ม
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <h3 className="text-lg font-medium text-gray-800">
            {selectedMember
              ? `คูปองที่ใช้ได้สำหรับ ${selectedMember.firstname} (${selectedMember.point} แต้ม)`
              : 'รายการคูปองทั้งหมด'}
          </h3>
          <input
            type="text"
            placeholder="ค้นหาคูปอง..."
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchCoupon}
            onChange={(e) => setSearchCoupon(e.target.value)}
          />
        </div>

        {filteredCoupons.length === 0 ? (
          <p className="text-gray-600">ไม่มีคูปองที่ตรงกับการค้นหา</p>
        ) : (
          <div className="grid gap-4">
            {filteredCoupons.map(coupon => (
              <div
                key={coupon.rewardid}
                className="border rounded-xl p-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <h4 className="font-medium text-gray-800">{coupon.title}</h4>
                  <p className="text-sm text-blue-600 font-semibold mt-1">ใช้ {coupon.point_require} แต้ม</p>
                  <p className="text-sm text-green-600 font-semibold mt-1">
                    จำนวนที่เหลือ {coupon.limit_per_user ?? "ไม่จำกัดจำนวน"}
                  </p>
                  <p className="text-sm text-gray-600 font-semibold mt-1">
                    หมดอายุ: {coupon.end_date
                      ? (() => {
                        const parts = (coupon.end_date as unknown as string).split("/");
                        if (parts.length === 3) {
                          const day = parts[0].padStart(2, "0");
                          const month = parts[1].padStart(2, "0");
                          const year = parts[2];
                          return `${day}/${month}/${year}`;
                        }
                        return "Invalid Date";
                      })()
                      : "ไม่จำกัดอายุใช้งาน"}
                  </p>
                </div>

                {selectedMember ? (
                  <button
                    onClick={() => openConfirm(coupon)}
                    className={`px-4 py-2 rounded-lg text-white font-medium transition ${selectedMember.point >= coupon.point_require
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    disabled={selectedMember.point < coupon.point_require}
                  >
                    ใช้คูปอง
                  </button>
                ) : (
                  <button
                    onClick={() => openModal(coupon)}
                    className="px-4 py-2 rounded-lg text-white font-medium bg-blue-500 hover:bg-blue-600 transition"
                  >
                    ดูรายละเอียด
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && modalCoupon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{modalCoupon.title}</h3>
            <p className="text-gray-700 mb-4">{modalCoupon.description ?? "ไม่มีรายละเอียด"}</p>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {showConfirm && confirmCoupon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(3px)' }}
        >
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ยืนยันการใช้คูปอง</h3>
            <p className="text-gray-700 mb-6">
              คุณต้องการใช้คูปอง "{confirmCoupon.title}" ใช้ {confirmCoupon.point_require} แต้มหรือไม่?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  closeConfirm();
                  useCoupon(confirmCoupon);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
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

export default UseCouponPage;
