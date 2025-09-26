export interface User {
  username: string;
  role: 'manager' | 'admin';
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  created_by: string;
  points: number;
  joinDate: string;
  qrCode: string;
}

export interface Coupon {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
  validUntil?: string;
  isActive: boolean;
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