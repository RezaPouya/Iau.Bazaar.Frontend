// app/types/user.ts

export interface User {
  id: number
  userName: string
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  nationalCode: string
  isActive: boolean
  isLockedOut: boolean
  lockoutEnd: string | null
  role: string // نام نقش به صورت رشته - خروجی UserOutputDto.Role (مثل "Admin", "CompanyUser")
  universityId: number | null
  growthCenterId: number | null
  companyId: number | null
  createdAt: string
}

// ورودی ایجاد کاربر - باید دقیقاً منطبق با CreateUserInputDto بک‌اند باشد

export interface CreateUserInput {
  userName: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  nationalCode?: string
  role: number // مقدار AppUserRoleEnum
  universityId?: number | null
  growthCenterId?: number | null
  companyId?: number | null
}

// ورودی ویرایش کاربر - باید دقیقاً منطبق با UpdateUserInputDto بک‌اند باشد
// توجه: این DTO فیلد رمز عبور یا نام کاربری ندارد
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

// خروجی GET panel/admin/users/roles - شکل دقیق IdNameDto<AppUserRoleEnum> در بک‌اند: { id, name }
export interface UserRole {
  id: number
  name: string
}
