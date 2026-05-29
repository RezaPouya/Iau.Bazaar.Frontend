// app/types/auth.ts
export interface AuthUser {
  userId: number;
  role: string;
  panelUrl: string;
  fullName: string;
  userName: string;
  phoneNumber: string;
}

export interface LoginResponse {
  userId: number;
  accessToken: string;
  refreshToken: string;
  expirationTime: string;
  role: string;
  panelUrl: string;
  fullName: string;
  userName: string;
  phoneNumber: string;
}
