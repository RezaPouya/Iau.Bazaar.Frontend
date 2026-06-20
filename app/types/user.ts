// types/user.ts
export interface User {
  id: number
  firstName: string
  lastName: string
  userName: string
  phoneNumber: string
  email: string
  nationalCode: string
  isActive: boolean
  isLockedOut: boolean
  lockoutEnd: string | null
  role: string // یا number بسته به نوع برگشتی از بک‌اند
  universityId: number | null
  growthCenterId: number | null
  companyId: number | null
  createdAt: string
  // فیلدهای اضافی برای نمایش
  fullName?: string // برای نمایش ترکیبی در UI (اختیاری)
}

export interface CreateUserInput {
  userName: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  nationalCode?: string
  role: number
  universityId?: number | null
  growthCenterId?: number | null
  companyId?: number | null
}

export interface UpdateUserInput {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  nationalCode?: string
  isActive: boolean
  role: number
  universityId?: number | null
  growthCenterId?: number | null
  companyId?: number | null
}

export interface UserRole {
  id: number
  name: string
  nameFa: string
}
