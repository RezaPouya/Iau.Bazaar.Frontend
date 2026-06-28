// app/types/company.ts
export interface Company {
  id: number
  title: string
  shortDescription: string
  description: string
  growthCenterId: number
  growthCenterName: string
  growthCenterCommission: number
  isActive: boolean
  // اضافه شد: مبدأ ارسال و هزینه پستی (برای قابلیت تفکیک سفارش/ارسال جدا هر شرکت)
  provinceId?: number | null
  provinceName?: string | null
  sameProvinceShippingCost: number
  otherProvinceShippingCost: number
  createdAt: string
  createdAtPersian: string
}

export interface CompanyUser {
  userId: number
  fullName: string
  userName: string
  phoneNumber: string
  isActive: boolean
  joinedAtPersian: string
}

export interface CreateCompanyInput {
  title: string
  shortDescription?: string
  description?: string
  growthCenterId: number
  growthCenterCommission: number
  provinceId?: number | null
  sameProvinceShippingCost: number
  otherProvinceShippingCost: number
  isActive: boolean
}

export interface UpdateCompanyInput extends CreateCompanyInput {
  id: number
}


