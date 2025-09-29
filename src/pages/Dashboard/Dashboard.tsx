import React, { useState, useEffect } from 'react';
import { Users, Star, Gift, FileText } from 'lucide-react';

interface Member {
  userid: string;
  firstname: string;
  mobile_no: string;
  points?: number;
}

interface Coupon {
  id: string;
  end_date: string;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: any;
  color: 'blue' | 'yellow' | 'green' | 'purple';
}


const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
        </div>
        <div className={`${colorClasses[color]} p-2 sm:p-3 rounded-lg`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMembers = await fetch('http://localhost:8888/api/user');
        if (!resMembers.ok) throw new Error('Failed to fetch members');
        const dataMembers: Member[] = await resMembers.json();
        setMembers(dataMembers);

        const resCoupons = await fetch('http://localhost:8888/api/reward');
        if (!resCoupons.ok) throw new Error('Failed to fetch coupons');
        const dataCoupons: Coupon[] = await resCoupons.json();
        setCoupons(dataCoupons);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard 
            title="สมาชิกทั้งหมด" 
            value={members.length} 
            icon={Users} 
            color="blue" 
          />
          <StatsCard 
            title="คะแนนรวม" 
            value={members.reduce((sum, m) => sum + (m.points ?? 0), 0)} 
            icon={Star} 
            color="yellow" 
          />
          <StatsCard 
            title="คูปองทั้งหมด" 
            value={coupons.length} 
            icon={Gift} 
            color="green" 
          />
          <StatsCard 
            title="คูปองใช้งานได้" 
            value={coupons.filter(c => c.end_date).length} 
            icon={FileText} 
            color="purple" 
          />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
            สมาชิกล่าสุด
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {members.slice(0, 5).map(member => (
              <div 
                key={member.userid} 
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded gap-2 sm:gap-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                    {member.firstname}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    {member.userid} • {member.mobile_no}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded text-xs sm:text-sm font-medium self-start sm:self-auto whitespace-nowrap">
                  {(member.points ?? 0).toLocaleString()} แต้ม
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
