import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface NewReward {
  title: string;
  description: string;
  point_require: number;
  limit_per_user: number;
  start_date: string;
  end_date: string;
  status_campaign: string;
  created_by: string;
}

const CreateCouponPage: React.FC = () => {
  const [newReward, setNewReward] = useState<NewReward>({
    title: '',
    description: '',
    point_require: 0,
    limit_per_user: 0,
    start_date: '',
    end_date: '',
    status_campaign: 'active',
    created_by: 'earth'
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof NewReward) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewReward(prev => ({
      ...prev,
      [field]:
        field === 'point_require' || field === 'limit_per_user'
          ? Number(e.target.value)
          : e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8888/api/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReward)
      });

      if (!res.ok) throw new Error('Failed to create reward');
      const data = await res.json();

      alert('สร้างคูปองเรียบร้อยแล้ว!');
      console.log('✅ Reward created:', data);

      // reset form
      setNewReward({
        title: '',
        description: '',
        point_require: 0,
        limit_per_user: 0,
        start_date: '',
        end_date: '',
        status_campaign: 'active',
        created_by: 'earth'
      });
    } catch (error) {
      console.error('❌ Error creating reward:', error);
      alert('เกิดข้อผิดพลาดในการสร้างคูปอง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">สร้างคูปอง</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อคูปอง</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newReward.title}
            onChange={handleInputChange('title')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
          <textarea
            required
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newReward.description}
            onChange={handleInputChange('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">คะแนนที่ต้องใช้</label>
            <input
              type="number"
              required
              min={1}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newReward.point_require}
              onChange={handleInputChange('point_require')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนที่จำกัดต่อคน</label>
            <input
              type="number"
              required
              min={1}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newReward.limit_per_user}
              onChange={handleInputChange('limit_per_user')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">วันเริ่มต้น</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newReward.start_date}
              onChange={handleInputChange('start_date')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">วันหมดอายุ</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newReward.end_date}
              onChange={handleInputChange('end_date')}
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
            {loading ? 'กำลังสร้าง...' : 'สร้างคูปอง'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCouponPage;
