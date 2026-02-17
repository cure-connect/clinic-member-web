import React, { useState, useEffect, useRef } from 'react';
import type { Member, Coupon } from '@/types/index.tsx';
import api from '../../utils/axiosInstance.ts';

const apiUrl = import.meta.env.VITE_API_URL;

const UseCouponPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [searchMember, setSearchMember] = useState<string>('');
  const [searchCoupon, setSearchCoupon] = useState<string>('');
  const [couponFilter, setCouponFilter] = useState<'all' | 'usable' | 'expired' | 'outOfStock'>('all');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalCoupon, setModalCoupon] = useState<Coupon | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmCoupon, setConfirmCoupon] = useState<Coupon | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const token = localStorage.getItem("clinicToken");

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedMember = Array.isArray(members)
    ? members.find(m => String(m.userid) === String(selectedMemberId))
    : null;

  const couponsToShow = selectedMember
    ? coupons.filter(c => selectedMember.point >= c.point_require)
    : coupons;

  const filteredCoupons = Array.isArray(couponsToShow)
    ? couponsToShow.filter(c => {
      const titleMatch = c.title.toLowerCase().includes(searchCoupon.toLowerCase());
      const descMatch = (c.description?.toLowerCase().includes(searchCoupon.toLowerCase()) ?? false);

      let isExpired = false;
      if (c.end_date) {
        const parts = (c.end_date as unknown as string).split("/");
        if (parts.length === 3) {
          const day = Number(parts[0]);
          const month = Number(parts[1]) - 1;
          let year = Number(parts[2]);
          if (year > 2500) year -= 543;
          const expDate = new Date(year, month, day);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          expDate.setHours(0, 0, 0, 0);
          isExpired = expDate < today;
        }
      }

      const isOutOfStock = c.limit_per_user !== null && c.limit_per_user !== undefined && c.limit_per_user <= 0;
      const isUsable = !isExpired && !isOutOfStock;

      if (couponFilter === 'usable' && !isUsable) return false;
      if (couponFilter === 'expired' && !isExpired) return false;
      if (couponFilter === 'outOfStock' && !isOutOfStock) return false;

      return titleMatch || descMatch;
    })
    : [];

  const filteredMembers = Array.isArray(members)
    ? members.filter(
      m =>
        m.firstname.toLowerCase().includes(searchMember.toLowerCase()) ||
        m.lastname.toLowerCase().includes(searchMember.toLowerCase()) ||
        String(m.userid).includes(searchMember)
    )
    : [];

  const fetchMembers = async () => {
    try {
      const res = await api.get(`${apiUrl}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data ?? res.data;
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) { }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get(`${apiUrl}/reward`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data ?? res.data;
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    }
  };

  useEffect(() => {
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

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const useCoupon = async (coupon: Coupon) => {
    if (!selectedMember) {
      showNotification('กรุณาเลือกสมาชิกก่อนใช้คูปอง', 'error');
      return;
    }

    if (selectedMember.point < coupon.point_require) {
      showNotification('แต้มไม่เพียงพอในการใช้คูปองนี้', 'error');
      return;
    }

    const storedUser = localStorage.getItem("clinicUser");
    if (!storedUser) {
      showNotification('กรุณาเข้าสู่ระบบก่อนใช้คูปอง', 'error');
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
        status: "used",
      };

      await api.post("/rewardused", body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setMembers(prev =>
        prev.map(m =>
          String(m.userid) === String(selectedMemberId)
            ? { ...m, point: m.point - coupon.point_require }
            : m
        )
      );

      showNotification(`ใช้คูปอง "${coupon.title}" เรียบร้อยแล้ว`, 'success');

      fetchCoupons();
    } catch (err) {
      console.error('Error using coupon:', err);
      showNotification('เกิดข้อผิดพลาดในการบันทึกการใช้คูปอง', 'error');
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

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [editPoint, setEditPoint] = useState<number>(0);
  const [editLimit, setEditLimit] = useState<number | null>(null);
  const [editEndDate, setEditEndDate] = useState<string>('');

  const openEditModal = (coupon: Coupon) => {
    setEditCoupon(coupon);
    setEditPoint(coupon.point_require);
    setEditLimit(coupon.limit_per_user ?? null);
    setEditEndDate(coupon.end_date ? String(coupon.end_date) : '');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditCoupon(null);
  };

  const saveCouponEdit = async () => {
    if (!editCoupon) return;
    let formattedEndDate: Date | null = null;
    if (editEndDate) {
      const [day, month, year] = editEndDate.split("/");
      formattedEndDate = new Date(`${year}-${month}-${day}`);
    }

    try {
      const body = {
        description: editCoupon.description,
        point_require: editPoint,
        limit_per_user: editLimit,
        end_date: formattedEndDate,
      };

      await api.patch(`${apiUrl}/reward/${editCoupon.rewardid}`, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      showNotification(`แก้ไขคูปอง "${editCoupon.title}" เรียบร้อยแล้ว`, 'success');
      closeEditModal();
      fetchCoupons();
    } catch (err) {
      console.error("Error updating coupon:", err);
      showNotification("เกิดข้อผิดพลาดในการบันทึกข้อมูล", 'error');
    }
  };

  return (
    <div className="space-y-6">
      {showToast && (
        <div className="fixed inset-0 flex items-start justify-end px-4 py-6 pointer-events-none sm:p-6 z-50">
          <div className="w-full max-w-sm pointer-events-auto">
            <div className="rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">

                  <div className="flex-shrink-0">
                    {toastType === 'success' ? (
                      <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>

                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {toastType === 'success' ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {toastMessage}
                    </p>
                  </div>

                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      onClick={() => setShowToast(false)}
                      className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 
                    111.414 1.414L11.414 10l4.293 4.293a1 1 
                    01-1.414 1.414L10 11.414l-4.293 4.293a1 1 
                    01-1.414-1.414L8.586 10 4.293 5.707a1 1 
                    010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">ใช้คูปอง</h2>

        <div className="mb-6 relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">เลือกสมาชิก</label>
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือรหัสสมาชิก..."
            className="w-full px-3 py-2 shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMember ? `${selectedMember.firstname} ${selectedMember.lastname}` : searchMember}
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
                  {member.firstname} {member.lastname} - {member.point} แต้ม
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
            className="px-3 py-2 shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchCoupon}
            onChange={(e) => setSearchCoupon(e.target.value)}
          />
        </div>

        {/* Filter select */}
        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">กรองคูปอง:</label>
          <select
            value={couponFilter}
            onChange={(e) => setCouponFilter(e.target.value as any)}
            className="border px-2 py-1 rounded-lg"
          >
            <option value="all">ทั้งหมด</option>
            <option value="usable">ใช้งานได้ / ไม่มีข้อจำกัด / ไม่มีวันหมดอายุ</option>
            <option value="expired">หมดอายุแล้ว</option>
            <option value="outOfStock">หมดแล้ว (จำนวนหมด)</option>
          </select>
        </div>

        {filteredCoupons.length === 0 ? (
          <p className="text-gray-600">ไม่มีคูปองที่ตรงกับการค้นหา</p>
        ) : (
          <div className="grid gap-4">
            {filteredCoupons.map(coupon => {
              const isExpired = (() => {
                if (!coupon.end_date) return false;
                const parts = (coupon.end_date as unknown as string).split("/");
                if (parts.length === 3) {
                  const day = Number(parts[0]);
                  const month = Number(parts[1]) - 1;
                  let year = Number(parts[2]);
                  if (year > 2500) year -= 543;
                  const expDate = new Date(year, month, day);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  expDate.setHours(0, 0, 0, 0);
                  return expDate < today;
                }
                return false;
              })();

              const formattedEndDate = (() => {
                if (!coupon.end_date) return "ไม่จำกัดอายุใช้งาน";
                const parts = (coupon.end_date as unknown as string).split("/");
                if (parts.length === 3) {
                  const day = parts[0].padStart(2, "0");
                  const month = parts[1].padStart(2, "0");
                  const year = parts[2];
                  return `${day}/${month}/${year}`;
                }
                return "Invalid Date";
              })();

              const isOutOfStock =
                coupon.limit_per_user !== null &&
                coupon.limit_per_user !== undefined &&
                coupon.limit_per_user <= 0;

              const isDisabled = isExpired || isOutOfStock;

              return (
                <div
                  key={coupon.rewardid}
                  className={`shadow rounded-xl p-4 flex justify-between items-center relative transition ${isDisabled ? 'opacity-60 bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                >
                  {(isDisabled) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                      <span className="text-white text-lg font-semibold">
                        {isExpired ? "คูปองหมดอายุ" : "จำนวนคูปองหมด"}
                      </span>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-800">{coupon.title}</h4>
                    <p className="text-sm text-blue-600 font-semibold mt-1">
                      ใช้ {coupon.point_require} แต้ม
                    </p>
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      จำนวนที่เหลือ {coupon.limit_per_user ?? "ไม่จำกัดจำนวน"}
                    </p>
                    <p className="text-sm text-gray-600 font-semibold mt-1">
                      หมดอายุ: {formattedEndDate}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {selectedMember ? (
                      <button
                        onClick={() => openConfirm(coupon)}
                        className={`px-4 py-2 rounded-lg text-white font-medium transition ${selectedMember.point >= coupon.point_require && !isDisabled
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        disabled={selectedMember.point < coupon.point_require || isDisabled}
                      >
                        ใช้คูปอง
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openModal(coupon)}
                          className="px-4 py-2 rounded-lg text-white font-medium bg-blue-500 hover:bg-blue-600 transition"
                        >
                          ดูรายละเอียด
                        </button>
                        {!selectedMember && !isDisabled && (
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="px-4 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 rounded-lg text-gray-800 font-medium transition"
                          >
                            แก้ไข
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && modalCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{modalCoupon.title}</h3>
            <p className="text-gray-700 mb-4">{modalCoupon.description ?? "ไม่มีรายละเอียด"}</p>
            <button onClick={closeModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              ปิด
            </button>
          </div>
        </div>
      )}

      {showConfirm && confirmCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(3px)' }}>
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ยืนยันการใช้คูปอง</h3>
            <p className="text-gray-700 mb-6">
              คุณต้องการใช้คูปอง "{confirmCoupon.title}" ใช้ {confirmCoupon.point_require} แต้มหรือไม่?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={closeConfirm}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">
                ยกเลิก
              </button>
              <button onClick={() => { closeConfirm(); useCoupon(confirmCoupon); }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editCoupon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(3px)' }}
        >
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              แก้ไขคูปอง: {editCoupon.title}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">รายละเอียดคูปอง</label>
                <textarea
                  value={editCoupon.description}
                  onChange={(e) =>
                    setEditCoupon({ ...editCoupon, description: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                  placeholder="กรอกรายละเอียดคูปอง"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">แต้มที่ใช้</label>
                <input
                  type="text"
                  value={editPoint === 0 ? '' : editPoint}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setEditPoint(val === '' ? 0 : Number(val));
                    }
                  }}
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                  placeholder="กรอกจำนวนแต้มที่ใช้"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">จำนวนจำกัด</label>
                <input
                  type="text"
                  value={editLimit === null ? '' : editLimit}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setEditLimit(val === '' ? null : Number(val));
                    }
                  }}
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                  placeholder="ไม่จำกัดจำนวน"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  วันที่หมดอายุ (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg mt-1"
                  placeholder="เช่น 31/12/2025"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={saveCouponEdit}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UseCouponPage;
