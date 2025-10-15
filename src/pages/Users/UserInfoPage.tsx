import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Member } from '@/types/index.tsx';

const UserInfoPage: React.FC = () => {
  const { userid } = useParams<{ userid: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`http://localhost:8888/api/user/${userid}`);
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
    return <p className="text-center mt-10 text-gray-600">กำลังโหลดข้อมูล...</p>;
  }

  if (error || !member) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500 mb-4">{error || 'ไม่พบข้อมูลผู้ใช้'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">{member.firstname} {member.lastname}</h2>
      <p><strong>เบอร์โทร:</strong> {member.mobile_no}</p>
      <p><strong>แต้มสะสม:</strong> {member.point}</p>
      <p><strong>วันที่สมัคร:</strong> {new Date(member.created_at).toLocaleDateString()}</p>
    </div>
  );
};

export default UserInfoPage;
