// app/types/dashboard.ts
// این تایپ‌ها باید دقیقاً با CompanyDashboardStatsDto / GrowthCenterDashboardStatsDto /
// UniversityDashboardStatsDto سمت بک‌اند یکی باشند.

export interface CompanyDashboardStats {
  totalProducts: number
  pendingProducts: number
  totalOrders: number
  totalRevenue: number
  totalFiles: number
  pendingFiles: number
}

export interface GrowthCenterDashboardStats {
  totalCompanies: number
  totalProducts: number
  pendingProducts: number
  totalOrders: number
  pendingFiles: number
}

export interface UniversityDashboardStats {
  totalGrowthCenters: number
  totalCompanies: number
  totalProducts: number
  totalOrders: number
}
