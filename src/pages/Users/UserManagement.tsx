import React, { useEffect, useState } from "react";

interface Staff {
  userid: string;
  username: string;
  firstname: string;
  lastname: string;
  role: string;
}

const UsersManagementPage: React.FC = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const res = await fetch("http://localhost:8888/api/staff");
        if (!res.ok) throw new Error("โหลดข้อมูลผู้ใช้งานไม่สำเร็จ");
        const data = await res.json();
        setStaffs(data);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffs();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border p-6 text-center text-gray-600">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow border p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">จัดการผู้ใช้งาน</h2>

      {staffs.length === 0 ? (
        <p className="text-gray-600 text-center">ไม่มีข้อมูลผู้ใช้งาน</p>
      ) : (
        <div className="space-y-4">
          {staffs.map((user) => (
            <div
              key={user.userid}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {user.username} {user.firstname} {user.lastname}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  user.role === "admin"
                    ? "bg-green-100 text-green-800"
                    : user.role === "manager"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;
