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
}

const CouponHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<RewardHistory[]>([]);
  const [loading, setLoading] = useState(true);

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
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return <p className="text-gray-500 text-center py-10">กำลังโหลดข้อมูล...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        🧾 ประวัติการใช้คูปอง
      </h2>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div
              key={item.reward_used_id}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                  -{item.points_to_used} แต้ม
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-1">{item.description}</p>

              <div className="mt-4 border-t border-gray-100 pt-3 text-sm">
                <p className="text-gray-700 font-medium">
                  {item.firstname} {item.lastname}
                </p>
                <p className="text-gray-500 mt-1">
                  ใช้เมื่อ: {formatDate(item.start_date)}
                </p>
                {item.end_date && (
                  <p className="text-gray-400 text-xs">
                    หมดอายุคูปอง: {formatDate(item.end_date)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-16">
          <p className="text-lg">ยังไม่มีประวัติการใช้คูปอง</p>
        </div>
      )}
    </div>
  );
};

export default CouponHistoryPage;
