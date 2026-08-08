export type AuthMode = 'login' | 'register' | 'roles';

export interface AdminLoginCredentials {
  adminId: string;
  password: string;
}

export interface IndianState {
  code: string;
  name: string;
}

export const INDIAN_STATES: IndianState[] = [
  { code: '27', name: 'Maharashtra' },
  { code: '07', name: 'Delhi' },
  { code: '29', name: 'Karnataka' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '19', name: 'West Bengal' },
  { code: '24', name: 'Gujarat' },
  { code: '36', name: 'Telangana' },
  { code: '32', name: 'Kerala' },
  { code: '03', name: 'Punjab' },
  { code: '10', name: 'Bihar' },
  { code: '08', name: 'Rajasthan' },
  { code: '06', name: 'Haryana' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '21', name: 'Odisha' },
  { code: '18', name: 'Assam' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '30', name: 'Goa' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '20', name: 'Jharkhand' },
  { code: '05', name: 'Uttarakhand' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '31', name: 'Lakshadweep' },
  { code: '25', name: 'Daman & Diu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '04', name: 'Chandigarh' },
  { code: '26', name: 'Dadra & Nagar Haveli' },
  { code: '38', name: 'Ladakh' },
];

export interface RestaurantRegisterPayload {
  restaurantName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstNumber: string;
  fssaiNumber: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  country: string;
  employeeRange: string;
  totalTables: number;
  cuisineType?: string;
  invoicePrefix?: string;
}

export interface AuthSessionResponse {
  success: boolean;
  message?: string;
  token?: string;
  role?: 'owner' | 'manager' | 'waiter' | 'kitchen' | 'guest';
  restaurantId?: string;
  restaurantName?: string;
}
