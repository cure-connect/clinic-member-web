import React from 'react';
import type { MemberCardProps } from '../../types/index.tsx';

const MemberCard: React.FC<MemberCardProps> = ({ member, showPrint = false }) => {
  return (
    <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 ${
      showPrint ? 'print-card w-92 h-56' : 'w-full max-w-md'
    } shadow-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold">{member.firstname} {member.lastname}</h3>
          <p className="text-sm opacity-90">รหัสสมาชิก: {member.userid}</p>
          <p className="text-sm opacity-90">คะแนน: {member.points} แต้ม</p>
        </div>
        <div className="bg-white p-2 rounded">
          <img 
            /*src={generateQRCode(member.qrCode)} */
            alt="QR Code" 
            className="w-20 h-22" 
          />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs opacity-80">คลินิกสุขภาพดี</p>
        <p className="text-xs opacity-80">โทร: 02-123-4567</p>
      </div>
    </div>
  );
};

export default MemberCard;