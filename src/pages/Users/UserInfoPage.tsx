import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Member } from '@/types/index.tsx';
import { User, Phone, Star, Calendar } from 'lucide-react';


const UserInfoPage: React.FC = () => {
  const { userid } = useParams<{ userid: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`https://bizrate-makers-root-fascinating.trycloudflare.com/api/users/${userid}`);
        if (!res.ok) throw new Error('ไม่พบผู้ใช้');
        const data = await res.json();
        setMember(data);
      } catch (err) {
        console.error(err);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
      } finally {
        setLoading(false);
      }
    };

    if (userid) fetchMember();
  }, [userid]);

  if (loading) {
    return <p className="text-center mt-20 text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>;
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 px-4 min-h-[60vh]">
        <p className="text-red-500 mb-4 text-center text-lg">{error || 'ไม่พบข้อมูลผู้ใช้'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition w-full max-w-xs text-center"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <User className="w-16 h-16 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {member.firstname} {member.lastname}
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl shadow-sm">
            <Phone className="w-5 h-5 text-blue-500" />
            <span className="text-gray-700 text-sm sm:text-base">เบอร์โทร: {member.mobile_no}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl shadow-sm">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-gray-700 text-sm sm:text-base">แต้มสะสม: {member.point}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl shadow-sm">
            <Calendar className="w-5 h-5 text-green-500" />
            <span className="text-gray-700 text-sm sm:text-base">
              วันที่สมัคร: {new Date(member.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;
