export type UserRole = "admin" | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone: string;
  created_at: Date;
  updated_at: Date;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export type VehicleType = "car" | "bike" | "truck" | "other";
export type VehicleAvailabilityStatus = "available" | "booked";

export interface Vehicle {
  vehicle_name: string;
  type: VehicleType;
  registration_number: string;
  daily_rent_price: number;
  availability_status: VehicleAvailabilityStatus;
}
