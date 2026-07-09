export type UserRole = "owner" | "manager" | "staff" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
  role: UserRole;
  permissions?: string[];
  isActive?: boolean;
  points?: number;
  avatar?: string;
  dob?: Date | string;
  gender?: "male" | "female" | "other";
  addresses?: any[];
  hasOnlineAccount?: boolean;
  internalNotes?: string;
  favorites?: any[];
  recentlyViewed?: any[];
  citizenId?: string;
  startDate?: string | Date;
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  homeAddress?: string;
  employeeId?: string;
  status?: "working" | "probation" | "suspended" | "resigned";
  contractType?: "fulltime" | "parttime" | "probationary" | "internship";
  workingShift?: "morning" | "afternoon" | "night" | "full";
  salaryInfo?: {
    baseSalary: number;
    allowance: number;
    commissionRate: number;
  };
}
