export interface User {
  username: string;
  role: 'manager' | 'admin';
}

export interface Member {
  userid: string;
  title: string;
  firstname: string;
  lastname: string;
  mobile_no: string;
  role: string;
  created_by: string;
  created_at: string;
  point: number;
  joinDate: string;
  qrcode: string;
}

export interface Coupon {
  rewardid: string;
  title: string,
  description: string,
  point_require: number,
  limit_per_user: number,
  start_date: Date,
  end_date: Date,
  status_campaign: string,
  created_at: Date,
  updated_at: Date,
  created_by: string
}

export interface LoginData {
  username: string;
  password: string;
  role: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  roles: ('admin' | 'manager')[];
}

export interface StatsCardProps {
  title: string;
  value: number;
  icon: any;
  color: string;
}

export interface MemberCardProps {
  member: Member;
  showPrint?: boolean;
}

export type PageType = 
  | 'dashboard'
  | 'members'
  | 'create-member'
  | 'import-members'
  | 'scan-qr'
  | 'manage-points'
  | 'create-coupon'
  | 'use-coupon'
  | 'coupon-history'
  | 'print-card'
  | 'users';