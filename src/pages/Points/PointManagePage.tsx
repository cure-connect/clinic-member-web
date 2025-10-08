import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Minus, QrCode, ArrowLeft, Search } from "lucide-react";
import type { Member } from "@/types/index.tsx";

interface LocationState {
  userid: string | number;
  firstname: string;
  lastname: string;
  role?: string;
  fromQR?: boolean;
}

const PointsManagementPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const scannedUser = state || null;
  const isFromQR = state?.fromQR || false;

  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    scannedUser?.userid ? String(scannedUser.userid) : ""
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingPoints, setPendingPoints] = useState<number>(0);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);

  const redirectToLogin = () => {
    localStorage.removeItem("clinicToken");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMembers = await fetch("http://localhost:8888/api/user");
        if (!resMembers.ok) throw new Error("โหลดข้อมูลสมาชิกไม่สำเร็จ");
        const dataMembers: Member[] = await resMembers.json();

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

        const token = localStorage.getItem("clinicToken");
        if (token) {
          const resMe = await fetch("http://localhost:8888/api/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resMe.status === 401) {
            alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
            redirectToLogin();
            return;
          }
          const dataMe = await resMe.json();
          if (dataMe?.error?.includes("expired") || dataMe?.message?.includes("expired")) {
            alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
            redirectToLogin();
            return;
          }
          setCurrentUser(dataMe.username);
        }
      } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
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
      const res = await fetch("http://localhost:8888/api/point", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userid: Number(selectedMemberId),
          reward_used_id: null,
          score: pendingPoints,
          status: "active",
          created_by: currentUser,
        }),
      });

      if (res.status === 401) {
        alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        redirectToLogin();
        return;
      }
      if (!res.ok) throw new Error("อัปเดตคะแนนไม่สำเร็จ");

      setMembers(prev =>
        prev.map(m =>
          String(m.userid) === String(selectedMemberId)
            ? { ...m, point: Math.max(0, (m.point || 0) + pendingPoints) }
            : m
        )
      );
      setPendingPoints(0);
      setConfirmModal(false);
      alert("อัปเดตคะแนนสำเร็จ!");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดตคะแนน");
    }
  };

  const selectedMember: Member | null =
    members.find(m => String(m.userid) === String(selectedMemberId)) || null;

  const filteredMembers = members.filter(m => {
    const fullName = `${m.firstname} ${m.lastname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="p-6">กำลังโหลดข้อมูลสมาชิก...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
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

      {/* ช่องค้นหาสมาชิก */}
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
            className={`w-full pl-10 pr-3 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-400 ${
              isFromQR ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* Dropdown แสดงผลลัพธ์การค้นหา */}
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
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                    selectedMemberId === String(m.userid) ? "bg-blue-100" : ""
                  }`}
                >
                  {m.title ? m.title + " " : ""}{m.firstname} {m.lastname} ({m.point ?? 0} แต้ม)
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">ไม่พบข้อมูลสมาชิก</div>
            )}
          </div>
        )}
      </div>

      {/* แสดงข้อมูลสมาชิกที่เลือก */}
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

      {/* Modal ยืนยัน */}
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
    </div>
  );
};

export default PointsManagementPage;
