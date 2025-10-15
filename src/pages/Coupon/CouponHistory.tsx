import React, { useEffect, useState } from 'react';

interface HistoryItem {
  userid: number;
  firstname: string;
  lastname: string;
  points: string;
  created_at: string;
  created_by?: string | null;
  title?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

const CouponHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'add' | 'use'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8888/api/historypoint');
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

  const filteredHistory = history
    .filter((item) =>
      `${item.firstname} ${item.lastname}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((item) => {
      const pointsNumber = parseInt(item.points, 10);
      if (filterType === 'all') return true;
      if (filterType === 'add') return pointsNumber > 0;
      if (filterType === 'use') return pointsNumber < 0;
      return true;
    });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIdx, startIdx + itemsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (loading) {
    return <p className="text-gray-500 text-center py-10">กำลังโหลดข้อมูล...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        ประวัติการใช้งาน
      </h2>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          placeholder="ค้นหาชื่อผู้ใช้..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="relative inline-block w-48">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as 'all' | 'add' | 'use');
              setCurrentPage(1);
            }}
            className="appearance-none w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:bg-blue-50 transition"
          >
            <option value="all">ทั้งหมด</option>
            <option value="add">เพิ่มแต้ม</option>
            <option value="use">ใช้คูปอง</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

      </div>

      {paginatedHistory.length > 0 ? (
        <>
          <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    ชื่อผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    รายการ
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    รายละเอียด
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    คะแนน
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 uppercase tracking-wider">
                    โดย
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedHistory.map((item, idx) => {
                  const pointsNumber = parseInt(item.points, 10);
                  const isAdd = pointsNumber > 0;

                  return (
                    <tr
                      key={`${item.userid}-${idx}-${item.created_at}`}
                      className={`transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-100`}
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {item.firstname} {item.lastname}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {item.title || (isAdd ? 'เพิ่มแต้ม' : 'ใช้คูปอง')}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.description || '-'}
                      </td>
                      <td
                        className={`px-6 py-4 text-center font-bold ${isAdd ? 'text-green-600' : 'text-red-600'
                          }`}
                      >
                        {isAdd ? `+${pointsNumber}` : pointsNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {item.created_by}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg border ${currentPage === 1
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-white hover:bg-blue-100'
                }`}
            >
              &lt;
            </button>
            <span className="px-3 py-2 border rounded-lg bg-gray-50">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg border ${currentPage === totalPages
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-white hover:bg-blue-100'
                }`}
            >
              &gt;
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-16">
          <p className="text-lg">ไม่พบข้อมูลประวัติแต้ม</p>
        </div>
      )}
    </div>
  );
};

export default CouponHistoryPage;
