import React from 'react';
import type { MemberCardProps } from '../../types/index.tsx';

const MemberCard: React.FC<MemberCardProps> = ({ member, showPrint = false }) => {
  return (
    <div
      className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg flex flex-col justify-between ${showPrint ? 'print-card' : ''
        }`}
      style={{
        width: '8.56cm',
        height: '5.4cm',
        padding: '0.3cm',
        boxSizing: 'border-box'
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: '0.38cm', lineHeight: '0.42cm' }}
          >
            Wanna Clinic
          </h2>
          <p
            className="opacity-90"
            style={{ fontSize: '0.24cm', lineHeight: '0.28cm' }}
          >
            Member Card
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center gap-2 flex-1">
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <div className="space-y-5">
            <div>
              <p
                className="opacity-80 mb-1"
                style={{ fontSize: '0.24cm', lineHeight: '0.28cm' }}
              >
                ชื่อ-นามสกุล
              </p>
              <h3
                className="font-bold truncate"
                style={{ fontSize: '0.36cm', lineHeight: '0.40cm' }}
              >
                {member.title} {member.firstname} {member.lastname}
              </h3>
            </div>
            <p style={{ fontSize: '0.26cm', lineHeight: '0.30cm' }}>
              <span className="opacity-80">โทรศัพท์:</span> <span className="font-semibold">{member.mobile_no}</span>
            </p>
          </div>
        </div>

        <div
          className="bg-gray rounded overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{
            width: '2.4cm',
            height: '2.4cm'
          }}
        >
          <img
            src={member.qrcode}
            alt="QR Code"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
<div
  className="mt-2 border-t border-white/30 pt-2 flex justify-between items-end"
>
  <div className="space-y-0.5">
    <p
      className="opacity-90"
      style={{ fontSize: '0.24cm', lineHeight: '0.32cm' }}
    >
      เบอร์โทรศัพท์: 099-394-9365
    </p>
    <p
      className="opacity-90"
      style={{ fontSize: '0.24cm', lineHeight: '0.32cm' }}
    >
      697 80 ถนน สุรชัย ตำบล มะขามหย่ง อำเภอเมืองชลบุรี ชลบุรี 20000
    </p>
  </div>
</div>

    </div>
  );
};

export default MemberCard;