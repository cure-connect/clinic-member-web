import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import api from "../../utils/axiosInstance.ts";

interface NewReward {
  title: string;
  description: string;
  point_require: number | string;
  limit_per_user: number | string;
  start_date?: string;
  end_date?: string;
  status_campaign: string;
  created_by: string;
}

const CreateCouponPage: React.FC = () => {
  const [newReward, setNewReward] = useState<NewReward>({
    title: "",
    description: "",
    point_require: "",
    limit_per_user: "",
    start_date: "",
    end_date: "",
    status_campaign: "active",
    created_by: "",
  });

  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  const token = localStorage.getItem("clinicToken");

  useEffect(() => {
    const userData = localStorage.getItem("clinicUser");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setNewReward((prev) => ({
        ...prev,
        created_by: parsedUser.username || "unknown",
      }));
    }
  }, []);

  const handleInputChange =
    (field: keyof NewReward) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let value: string | number = e.target.value;

      if (field === "point_require" || field === "limit_per_user") {
        value = value.replace(/[^0-9]/g, "");
      }

      setNewReward((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = {
        ...newReward,
        point_require: Number(newReward.point_require) || 0,
        limit_per_user:
          newReward.limit_per_user === ""
            ? null
            : Number(newReward.limit_per_user),
      };

      const res = await api.post("/reward", body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      await res.data;

      setModal({
        open: true,
        message: "สร้างคูปองเรียบร้อยแล้ว!",
        type: "success",
      });

      setNewReward((prev) => ({
        ...prev,
        title: "",
        description: "",
        point_require: "",
        limit_per_user: "",
        start_date: "",
        end_date: "",
        status_campaign: "active",
      }));
    } catch (error) {
      console.error("Error creating reward:", error);

      setModal({
        open: true,
        message: "เกิดข้อผิดพลาดในการสร้างคูปอง",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          สร้างคูปอง
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อคูปอง
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newReward.title}
              onChange={handleInputChange("title")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียด
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newReward.description}
              onChange={handleInputChange("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                คะแนนที่ต้องใช้
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="กรอกเฉพาะตัวเลข"
                required
                className="w-full px-3 py-2 shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newReward.point_require}
                onChange={handleInputChange("point_require")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จำนวนที่จำกัดต่อคน (ไม่จำเป็น)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="กรอกเฉพาะตัวเลข"
                className="w-full px-3 py-2 shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newReward.limit_per_user}
                onChange={handleInputChange("limit_per_user")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันเริ่มต้น (ไม่จำเป็น)
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newReward.start_date}
                onChange={handleInputChange("start_date")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันหมดอายุ (ไม่จำเป็น)
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 shadow rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newReward.end_date}
                onChange={handleInputChange("end_date")}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {loading ? "กำลังสร้าง..." : "สร้างคูปอง"}
            </button>
          </div>
        </form>
      </div>

      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg w-80 p-6 text-center">
            <h3
              className={`text-lg font-semibold mb-4 ${
                modal.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {modal.type === "success"
                ? "สำเร็จ"
                : "เกิดข้อผิดพลาด"}
            </h3>

            <p className="text-gray-700 mb-6">{modal.message}</p>

            <button
              onClick={() =>
                setModal((prev) => ({ ...prev, open: false }))
              }
              className={`px-4 py-2 rounded-lg text-white ${
                modal.type === "success"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCouponPage;
