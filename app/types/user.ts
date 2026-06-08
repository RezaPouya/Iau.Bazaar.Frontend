// app/types/user.ts
export interface User {
  userId: number
  fullName: string
  userName: string
  phoneNumber: string
  email?: string
  nationalCode?: string
  role: string
  isActive: boolean
  createdAt: string
  createdAtPersian?: string
  lastLoginAt?: string
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
  id: string
  name: string
  nameFa: string
}
