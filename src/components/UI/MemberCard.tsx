import React from 'react';
import type { MemberCardProps } from '../../types/index.tsx';

const MemberCard: React.FC<MemberCardProps> = ({ member, showPrint = false }) => {
  return (
    <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 ${
      showPrint ? 'print-card w-92 h-56' : 'w-full max-w-md'
    } shadow-lg flex flex-col justify-between`}>
      <div className="flex flex-row justify-between h-full">
        <div className="flex-1 pr-2">
          <h3 className="text-lg font-bold">{member.title} {member.firstname} {member.lastname}</h3>
          <p className="text-sm opacity-90">รหัสสมาชิก: {member.userid}</p>
          <p className="text-sm opacity-90">คะแนน: {member.points} แต้ม</p>
        </div>
        <div className="flex-1 flex items-center justify-center bg-white rounded overflow-hidden">
          <img 
            /*src={generateQRCode(member.qrCode)} */
            alt="QR Code" 
            className="w-100 h-full object-contain"
          />
        </div>
      </div>
      <div className="mt-4 text-xs opacity-80">
        <p>Dental Clinic</p>
        <p>โทร: 02-123-4567</p>
      </div>
    </div>
  );
};

export default MemberCard;
