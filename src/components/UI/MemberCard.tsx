import React from 'react';
import type { MemberCardProps } from '../../types/index.tsx';

const MemberCard: React.FC<MemberCardProps> = ({ member, showPrint = false }) => {
  console.log('member', member)
  return (
    <div
      className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg flex flex-col justify-between ${showPrint ? 'print-card' : ''
        }`}
      style={{
        width: '10.5cm',
        height: '6.3cm',
        padding: '0.4cm',
        boxSizing: 'border-box'
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: '0.45cm', lineHeight: '0.5cm' }}
          >
            Dental Clinic
          </h2>
          <p
            className="opacity-90"
            style={{ fontSize: '0.28cm', lineHeight: '0.32cm' }}
          >
            Member Card
          </p>
        </div>
      </div>

      <div className="flex flex-row h-full items-center gap-3">
        <div className="flex flex-col justify-center flex-1">
          <p 
            className="mb-5"
            style={{ fontSize: '0.33cm', lineHeight: '0.50cm' }}
          >
            <span className="opacity-80">ID:</span> {member.userid}
          </p>

          <div className="space-y-4">
            <div className="mb-5">
              <p
                className="opacity-80 mb-0.5"
                style={{ fontSize: '0.33cm', lineHeight: '0.40cm' }}
              >
                ชื่อ-นามสกุล
              </p>
              <h3
                className="font-bold"
                style={{ fontSize: '0.48cm', lineHeight: '0.55cm' }}
              >
                {member.title} {member.firstname} {member.lastname}
              </h3>
            </div>
            <p style={{ fontSize: '0.33cm', lineHeight: '0.38cm' }}>
              <span className="opacity-80">Tel:</span> {member.mobile_no}
            </p>
          </div>
        </div>

        <div
          className="bg-gray rounded-lg overflow-hidden flex items-center justify-center p-0.5"
          style={{
            width: '3.3cm',
            height: '3.4cm',
            flexShrink: 0
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
        className="mt-2 border-t border-white/30 pt-1.5 flex justify-between items-end"
      >
        <div>
          <p
            className="opacity-90"
            style={{ fontSize: '0.28cm', lineHeight: '0.32cm' }}
          >
            📞 02-123-4567
          </p>
          <p
            className="opacity-90"
            style={{ fontSize: '0.28cm', lineHeight: '0.32cm' }}
          >
            Bangkok, Thailand
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
