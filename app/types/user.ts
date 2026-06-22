// app/types/user.ts

// مقادیر دقیقاً منطبق با AppUserRoleEnum در بک‌اند - این اعداد را تغییر ندهید
export enum AppUserRole {
  Admin = 1,
  Operator = 2,
  Customer = 3,
  LegalCustomer = 4,
  UniversityUser = 10,
  GrowthCenterUser = 20,
  CompanyUser = 30
}

// نقش‌هایی که برای ایجاد/ویرایش به انتخاب نهاد مرتبط نیاز دارند
export const ROLES_REQUIRING_UNIVERSITY = [AppUserRole.UniversityUser]
export const ROLES_REQUIRING_GROWTH_CENTER = [AppUserRole.GrowthCenterUser]
export const ROLES_REQUIRING_COMPANY = [AppUserRole.CompanyUser]

export interface User {
  id: number
  userName: string
  firstName: string
  lastName: string
  fullName: string
  phoneNumber: string
  email: string
  nationalCode: string
  isActive: boolean
  isLockedOut: boolean
  lockoutEnd: string | null
  role: string // نام نقش به صورت رشته - خروجی UserOutputDto.Role
  universityId: number | null
  growthCenterId: number | null
  companyId: number | null
  createdAt: string
}

// ورودی ایجاد کاربر - منطبق با CreateUserInputDto بک‌اند
export interface CreateUserInput {
  userName: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  nationalCode?: string
  role: AppUserRole
  universityId?: number | null
  growthCenterId?: number | null
  companyId?: number | null
}

// ورودی ویرایش کاربر - منطبق با UpdateUserInputDto بک‌اند (بدون پسورد و نام کاربری)
export interface UpdateUserInput {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  nationalCode?: string
  isActive: boolean
  role: AppUserRole
  universityId?: number | null
  growthCenterId?: number | null
  companyId?: number | null
}

// خروجی GET panel/admin/users/roles - شکل دقیق IdNameDto<AppUserRoleEnum>
export interface UserRole {
  id: AppUserRole
  name: string
}

export interface ResetUserPasswordInput {
  newPassword: string
}
