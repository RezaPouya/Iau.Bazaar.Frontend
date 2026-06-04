// app/types/growth-center.ts
export interface GrowthCenter {
  id: number
  title: string
  description: string
  universityId: number
  universityName: string
  provinceId: number
  provinceName: string
  isActive: boolean
  createdAt: string
  createdAtPersian: string
}

export interface GrowthCenterUser {
  userId: number
  fullName: string
  userName: string
  phoneNumber: string
  isActive: boolean
  joinedAtPersian: string
}

export interface CreateGrowthCenterInput {
  title: string
  description?: string
  universityId: number
  isActive: boolean
}

export interface UpdateGrowthCenterInput extends CreateGrowthCenterInput {
  id: number
}
