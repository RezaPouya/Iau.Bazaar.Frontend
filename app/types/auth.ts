// app/types/auth.ts
export interface AuthUser {
  userId: number
  role: string
  panelUrl: string
  fullName: string
  userName: string
  phoneNumber: string
  // اضافه شد: شناسه‌ی دانشگاه/مرکز رشد/شرکت خودِ کاربر فعلی (هرکدام فقط برای نقش
  // مرتبط مقداردهی می‌شود، بقیه null هستند)
  universityId?: number | null
  growthCenterId?: number | null
  companyId?: number | null
}

export interface LoginResponse {
  userId: number
  accessToken: string
  refreshToken: string
  expirationTime: string
  role: string
  panelUrl: string
  fullName: string
  userName: string
  phoneNumber: string
  universityId?: number | null
  growthCenterId?: number | null
  companyId?: number | null
}


