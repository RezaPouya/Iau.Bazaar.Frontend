// types/user.ts
export interface User {
  id: number // Changed from userId
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
  role: string
  universityId: number | null
  growthCenterId: number | null
  companyId: number | null
  createdAt: string
  // Add these if they exist
  createdAtPersian?: string
  lastLoginAtPersian?: string
}
export interface CreateUserInput {
  fullName: string
  userName: string
  phoneNumber: string
  email?: string
  nationalCode?: string
  password: string
  role: string
  isActive: boolean
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  userId: number
}

export interface UserRole {
  id: number
  name: string
  nameFa: string
}
