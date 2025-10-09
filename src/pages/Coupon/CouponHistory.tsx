import React, { useEffect, useState } from 'react';

interface RewardHistory {
  reward_used_id: number;
  firstname: string;
  lastname: string;
  title: string;
  description: string;
  points_to_used: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

const CouponHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<RewardHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8888/api/historyreward');
        if (!res.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
        const data = await res.json();
        setHistory(data);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  const filteredHistory = history.filter((item) =>
    `${item.firstname} ${item.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <p className="text-gray-500 text-center py-10">กำลังโหลดข้อมูล...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        ประวัติการใช้คูปอง
      </h2>

      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="ค้นหาชื่อผู้ใช้..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredHistory.length > 0 ? (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  ชื่อคูปอง
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  รายละเอียด
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  คะแนนที่ใช้
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  ชื่อผู้ใช้
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  ใช้เมื่อ
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900 uppercase tracking-wider">
                  หมดอายุ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredHistory.map((item, idx) => (
                <tr
                  key={item.reward_used_id}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                >
                  <td className="px-6 py-4 text-gray-800 font-medium">{item.title}</td>
                  <td className="px-6 py-4 text-gray-600">{item.description}</td>
                  <td className="px-6 py-4 text-center text-red-600 font-bold">-{item.points_to_used}</td>
                  <td className="px-6 py-4 text-gray-800">{item.firstname} {item.lastname}</td>
                  <td className="px-6 py-4 text-gray-400">{formatDate(item.created_at)}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{item.end_date ? formatDate(item.end_date) : 'ไม่มีวันหมดอายุ'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-16">
          <p className="text-lg">ไม่พบข้อมูลตามการค้นหา</p>
        </div>
      )}
    </div>
  );
};

export default CouponHistoryPage;
