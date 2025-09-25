import React from 'react';
import type { StatsCardProps } from '@/types/index.tsx';

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <Icon className={`text-${color}-500 w-8 h-8`} />
    </div>
  </div>
);

export default StatsCard;