// app/types/profile.ts

// شکل دقیق پاسخ GET api/profile (یک anonymous object در ProfileController سمت بک‌اند)
export interface Profile {
  id: number
  userName: string
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  email: string | null
  nationalCode: string | null
  isActive: boolean
}

// باید دقیقاً منطبق با UpdateProfileInputDto بک‌اند باشد
export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  email?: string
  nationalCode?: string
}
