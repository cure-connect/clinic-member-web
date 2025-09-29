import React, { useEffect, useState } from 'react';
import { Users, Star, Gift, FileText } from 'lucide-react';
import type { Member, Coupon } from '../../types/index.tsx';
import StatsCard from '../../components/UI/StatCard.tsx';

const DashboardPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const membersRes = await fetch('http://localhost:8888/api/user');
        const membersData: Member[] = await membersRes.json();
        setMembers(membersData);

        const couponsRes = await fetch('http://localhost:8888/api/reward');
        const couponsData: Coupon[] = await couponsRes.json();
        setCoupons(couponsData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard 
          title="สมาชิกทั้งหมด" 
          value={members.length} 
          icon={Users} 
          color="blue" 
        />
        <StatsCard 
          title="คะแนนรวม" 
          value={members.reduce((sum, m) => sum + m.points, 0)} 
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
          title="คูปองที่ใช้งานได้" 
          value={coupons.filter(c => c.isActive).length} 
          icon={FileText} 
          color="purple" 
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">สมาชิกล่าสุด</h2>
        <div className="space-y-3">
          {members.slice(0, 5).map(member => (
            <div key={member.userid} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-800">{member.firstname}</p>
                <p className="text-sm text-gray-600">{member.userid} • {member.mobile_no}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {member.points} แต้ม
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
