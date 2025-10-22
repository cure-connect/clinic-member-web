import React, { useEffect, useState } from "react";
import { Search, Trash2, Plus, CheckCircle } from "lucide-react";

interface Staff {
  userid: string;
  username: string;
  firstname: string;
  lastname: string;
  role: string;
}

const apiUrl = import.meta.env.VITE_API_URL;

const UsersManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userToDelete, setUserToDelete] = useState<Staff | null>(null);

  const [newUser, setNewUser] = useState({
    title: "",
    username: "",
    password: "",
    firstname: "",
    lastname: "",
    mobile_no: "",
    role: "manager",
  });

  const token = localStorage.getItem("clinicToken");
  const clinicUser = localStorage.getItem("clinicUser");
  const parsedUser = clinicUser ? JSON.parse(clinicUser) : null;
  const currentRole = parsedUser?.role || "";
  const isManager = currentRole === "manager";

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStaffs(data);
    } catch (err) {
      console.error("Error fetching staffs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaffs = staffs.filter((staff) =>
    `${staff.firstname} ${staff.lastname} ${staff.username}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (staff: Staff) => {
    setUserToDelete(staff);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    if (userToDelete.role === "manager") {
      alert("ไม่สามารถลบ Manager ได้");
      setShowDeleteModal(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/users/${userToDelete.userid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const result = await res.json();
        alert(result.message || "เกิดข้อผิดพลาดในการลบผู้ใช้");
        return;
      }

      setStaffs((prev) => prev.filter((s) => s.userid !== userToDelete.userid));
      setShowDeleteModal(false);
      setUserToDelete(null);

      setSuccessMessage("ลบผู้ใช้เรียบร้อยแล้ว");
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("ไม่สามารถลบผู้ใช้ได้");
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      alert("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    try {
      const currentUser = clinicUser ? JSON.parse(clinicUser) : null;
      const res = await fetch(`${apiUrl}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newUser,
          created_by: currentUser?.username || "system",
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        alert(result.message || "เกิดข้อผิดพลาดในการสร้างผู้ใช้");
        return;
      }

      setShowCreateModal(false);
      setNewUser({
        title: "",
        username: "",
        password: "",
        firstname: "",
        lastname: "",
        mobile_no: "",
        role: "manager",
      });

      setSuccessMessage("สร้างผู้ใช้ใหม่สำเร็จ");
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2000);

      fetchStaffs();
    } catch (error) {
      console.error("Error creating user:", error);
      alert("ไม่สามารถสร้างผู้ใช้ได้");
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl font-semibold text-gray-800">จัดการผู้ใช้งาน</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {isManager && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              สร้างผู้ใช้
            </button>
          )}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-6">กำลังโหลดข้อมูล...</div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  {["ชื่อผู้ใช้", "ชื่อ", "นามสกุล", "บทบาท", "จัดการ"].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider bg-blue-200"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {filteredStaffs.map((user) => (
                  <tr key={user.userid} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-700">{user.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{user.firstname}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{user.lastname}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${user.role === "admin"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="justify-center items-center h-full">
                        {isManager && user.role !== "manager" && (
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 rounded-full hover:bg-red-100 transition-all duration-200"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filteredStaffs.map((user) => (
              <div
                key={user.userid}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">
                      {user.firstname} {user.lastname}
                    </h3>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                  {isManager && user.role !== "manager" && (
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="p-2 rounded-full hover:bg-red-100 transition-all duration-200 ml-2"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">บทบาท</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setShowCreateModal(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl p-6 z-10 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">สร้างผู้ใช้ใหม่</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="ชื่อผู้ใช้"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="รหัสผ่าน"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="คำนำหน้า"
                value={newUser.title}
                onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="ชื่อ"
                value={newUser.firstname}
                onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="นามสกุล"
                value={newUser.lastname}
                onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="เบอร์โทรศัพท์"
                value={newUser.mobile_no}
                onChange={(e) => setNewUser({ ...newUser, mobile_no: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="manager">manager</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl p-6 z-10 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              ยืนยันการลบผู้ใช้
            </h3>
            <p className="text-center text-gray-600 mb-5">
              คุณต้องการลบผู้ใช้{" "}
              <span className="font-semibold text-red-600">{userToDelete?.username}</span>{" "}
              หรือไม่?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="bg-white rounded-xl shadow-2xl p-8 z-10 flex flex-col items-center text-center transform transition-all scale-100 animate-bounce-in max-w-sm w-full">
            <div className="bg-green-100 rounded-full p-3 mb-4">
              <CheckCircle className="text-green-600 w-12 h-12" />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-1">{successMessage}</p>
            <p className="text-sm text-gray-500">ดำเนินการเรียบร้อยแล้ว</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;