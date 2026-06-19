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
  hasPassword?: boolean;
  internalNotes?: string;
  favorites?: any[];
  recentlyViewed?: any[];
}

