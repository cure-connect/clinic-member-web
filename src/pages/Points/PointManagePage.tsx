import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QrCode, ArrowLeft, Search } from "lucide-react";
import type { Member, Coupon } from "@/types/index.tsx";
import api from '../../utils/axiosInstance.ts'

interface LocationState {
  userid: string | number;
  firstname: string;
  lastname: string;
  role?: string;
  fromQR?: boolean;
}

const apiUrl = import.meta.env.VITE_API_URL;

const PointsManagementPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const scannedUser = state || null;
  const isFromQR = state?.fromQR || false;

  const [members, setMembers] = useState<Member[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    scannedUser?.userid ? String(scannedUser.userid) : ""
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingPoints, setPendingPoints] = useState<number>(0);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [confirmCouponModal, setConfirmCouponModal] = useState<boolean>(false);
  const [couponToUse, setCouponToUse] = useState<Coupon | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showToast, setShowToast] = useState<boolean>(false);

  const token = localStorage.getItem("clinicToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMembers = await api.get(`${apiUrl}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const resCoupons = await api.get(`${apiUrl}/reward`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dataMembers: Member[] = await resMembers.data;
        const dataCoupons: Coupon[] = await resCoupons.data;
        setCoupons(dataCoupons);

        let mergedMembers = dataMembers;
        if (scannedUser && !dataMembers.find(m => String(m.userid) === String(scannedUser.userid))) {
          mergedMembers = [
            {
              userid: String(scannedUser.userid),
              firstname: scannedUser.firstname,
              lastname: scannedUser.lastname,
              point: 0,
            } as Member,
            ...dataMembers,
          ];
        }
        setMembers(mergedMembers);

        const storedUser = localStorage.getItem("clinicUser");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user.username);
        }
      } catch (err) {
        console.error(err);
        showNotification("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [scannedUser]);


  const applyPoints = async () => {
    if (!selectedMemberId || pendingPoints === 0) return;
    try {
      const token = localStorage.getItem("clinicToken");
      await api.post(
        `${apiUrl}/point`,
        {
          userid: Number(selectedMemberId),
          reward_used_id: null,
          score: pendingPoints,
          status: "active",
          created_by: currentUser,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMembers(prev =>
        prev.map(m =>
          String(m.userid) === String(selectedMemberId)
            ? { ...m, point: Math.max(0, (m.point || 0) + pendingPoints) }
            : m
        )
      );
      setPendingPoints(0);
      setConfirmModal(false);
      showNotification("อัปเดตคะแนนสำเร็จ!", "success");

    } catch (err) {
      console.error(err);
      showNotification("เกิดข้อผิดพลาดในการอัปเดตคะแนน", "error");

    }
  };

  const confirmUseCoupon = (coupon: Coupon) => {
    setCouponToUse(coupon);
    setConfirmCouponModal(true);
  };

  const useCoupon = async (): Promise<void> => {
    if (!couponToUse) return;
    const selectedMember = members.find(m => String(m.userid) === String(selectedMemberId));

    if (!selectedMember) {
      showNotification("กรุณาเลือกสมาชิกก่อนใช้คูปอง", "error");

      return;
    }

    if (selectedMember.point < couponToUse.point_require) {
      showNotification("แต้มไม่เพียงพอในการใช้คูปองนี้", "error");

      return;
    }

    try {
      const body = {
        userid: selectedMember.userid,
        rewardid: couponToUse.rewardid,
        point_used: couponToUse.point_require,
        created_by: currentUser,
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
        prev.map(member =>
          String(member.userid) === String(selectedMemberId)
            ? { ...member, point: member.point - couponToUse.point_require }
            : member
        )
      );

      showNotification(`ใช้คูปอง "${couponToUse.title}" เรียบร้อยแล้ว`, "success");

    } catch (err) {
      console.error("Error using coupon:", err);
      showNotification("เกิดข้อผิดพลาดในการบันทึกการใช้คูปอง", "error");

    } finally {
      setConfirmCouponModal(false);
      setCouponToUse(null);
    }
  };

  const selectedMember: Member | null =
    members.find(m => String(m.userid) === String(selectedMemberId)) || null;

  const filteredMembers = members.filter(m => {
    const fullName = `${m.firstname} ${m.lastname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const availableCoupons =
    selectedMember && coupons.length > 0
      ? coupons.filter(c => selectedMember.point >= c.point_require)
      : [];

  if (loading) return <div className="p-6">กำลังโหลดข้อมูล...</div>;

  const showNotification = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };


  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isFromQR && (
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h2 className="text-2xl font-semibold text-gray-800">จัดการคะแนนสมาชิก</h2>
        </div>
        {isFromQR && (
          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm">
            <QrCode className="w-4 h-4" />
            <span>จาก QR Scan</span>
          </div>
        )}
      </div>

      {isFromQR && scannedUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-medium text-blue-900">ข้อมูลจาก QR Code:</p>
          <p>{scannedUser.firstname} {scannedUser.lastname}</p>
          <p>ID: {scannedUser.userid}</p>
        </div>
      )}

      <div className="relative">
        <label className="block mb-2 font-medium text-gray-700">ค้นหาสมาชิก</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={isFromQR ? "ไม่สามารถค้นหาได้ (สแกนจาก QR)" : "พิมพ์ชื่อสมาชิกเพื่อค้นหา..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => !isFromQR && setOpenDropdown(true)}
            disabled={isFromQR}
            className={`w-full pl-10 pr-3 py-3 shadow rounded-lg bg-white focus:ring-2 focus:ring-blue-400 ${isFromQR ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
          />
        </div>

        {openDropdown && !isFromQR && (
          <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow max-h-60 overflow-y-auto">
            {filteredMembers.length > 0 ? (
              filteredMembers.map(m => (
                <div
                  key={m.userid}
                  onClick={() => {
                    setSelectedMemberId(String(m.userid));
                    setSearchTerm(`${m.firstname} ${m.lastname}`);
                    setOpenDropdown(false);
                    setPendingPoints(0);
                  }}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedMemberId === String(m.userid) ? "bg-blue-100" : ""
                    }`}
                >
                  {m.firstname} {m.lastname} ({m.point ?? 0} แต้ม)
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">ไม่พบข้อมูลสมาชิก</div>
            )}
          </div>
        )}
      </div>

      {selectedMember && (
        <div className="bg-blue-50 p-6 rounded-lg shadow space-y-6">
          <div className="flex items-center justify-between">
            <span>คะแนนปัจจุบัน</span>
            <span>{selectedMember.point ?? 0} แต้ม</span>
          </div>
          <div className="flex items-center justify-center gap-6">
            <button onClick={() => setPendingPoints(p => p - 1)} className="p-4 bg-red-500 text-white rounded-full">-</button>
            <span>{pendingPoints > 0 ? "+" + pendingPoints : pendingPoints}</span>
            <button onClick={() => setPendingPoints(p => p + 1)} className="p-4 bg-green-500 text-white rounded-full">+</button>
          </div>
          <button disabled={pendingPoints === 0} onClick={() => setConfirmModal(true)} className="w-full bg-blue-600 text-white p-3 rounded">ยืนยันการอัปเดต</button>
        </div>
      )}

      {selectedMember && (
        <div className="bg-white border rounded-xl p-6 shadow space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            คูปองที่ใช้ได้สำหรับ {selectedMember.firstname} {selectedMember.lastname}
          </h3>
          {availableCoupons.length > 0 ? (
            <div className="grid gap-4">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.rewardid}
                  className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <h4 className="font-medium">{coupon.title}</h4>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                    <p className="text-sm text-blue-600 mt-1">
                      ใช้ {coupon.point_require} แต้ม
                    </p>
                  </div>
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    onClick={() => confirmUseCoupon(coupon)}
                  >
                    ใช้คูปอง
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">ยังไม่มีคูปองที่สามารถใช้ได้</p>
          )}
        </div>
      )}

      {confirmModal && selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-sm w-full border border-white/40">
            <h3 className="font-semibold mb-4 text-gray-800 text-lg">ยืนยันการอัปเดตคะแนน</h3>
            <p className="text-gray-700">
              คุณต้องการ{" "}
              <span className={pendingPoints > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {pendingPoints > 0 ? "เพิ่ม" : "ลด"} {Math.abs(pendingPoints)} คะแนน
              </span>{" "}
              ให้กับ{" "}
              <span className="font-medium">
                {selectedMember.firstname} {selectedMember.lastname}
              </span>
              ?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={applyPoints}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal ยืนยันใช้คูปอง */}
      {confirmCouponModal && couponToUse && selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-sm w-full border border-white/40">
            <h3 className="font-semibold mb-4 text-gray-800 text-lg">ยืนยันการใช้คูปอง</h3>
            <p className="text-gray-700">
              คุณต้องการใช้คูปอง{" "}
              <span className="font-medium text-blue-600">{couponToUse.title}</span>{" "}
              ซึ่งต้องใช้{" "}
              <span className="font-medium text-red-600">{couponToUse.point_require}</span> แต้ม{" "}
              กับ{" "}
              <span className="font-medium">
                {selectedMember.firstname} {selectedMember.lastname}
              </span>{" "}
              หรือไม่?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmCouponModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={useCoupon}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition"
              >
                ยืนยันใช้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsManagementPage;
