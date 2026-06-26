// app/types/product.ts
export interface ProductImage {
  id: number
  url: string
  width: number | null
  height: number | null
  altText: string | null
  isPrimary: boolean
  displayOrder: number
}

export interface Product {
  id: number
  title: string
  slug: string
  shortDescription: string | null
  description: string | null
  sku: string
  price: number
  vat: number
  finalPrice: number
  discountPercent: number | null
  discountStartDate: string | null
  discountEndDate: string | null
  inventoryCount: number
  reservedCount: number
  enumerationUnitId: number
  enumerationUnitName: string
  weightInGrams: number | null
  state: number
  stateTitle: string
  companyId: number
  companyName: string
  approvalStatus: number
  approvalStatusTitle: string
  rejectionReason?: string
  averageRating: number
  totalPurchases: number
  createdAt: string
  createdAtPersian: string
  soldCount: number
  images: ProductImage[]
  categoryIds: number[]
  categoryNames: string[]
}

export interface Company {
  id: number
  title: string
}

export interface ProductCategory {
  id: number
  name: string
  priority: number
}

export interface EnumerationUnit {
  id: number
  name: string
  symbol: string
}

/**
 * این تایپ باید دقیقاً با ProductListFilterDto سمت بک‌اند یکی باشد.
 * نکته مهم: searchTerm / categoryId / minPrice / maxPrice / hasDiscount / inStock
 * باید به صورت فیلدهای سطح بالا (top-level) ارسال شوند، نه داخل inputParams.filters
 * چون ProductCoreService.GetProductsAsync مستقیماً همین Property های strongly-typed
 * را می‌خواند و آرایه‌ی عمومی filters را برای این فیلدها اصلاً بررسی نمی‌کند.
 */
export interface ProductListFilter {
  page: number
  pageSize: number
  searchTerm?: string | null
  companyId?: number | null
  state?: number | null
  approvalStatus?: number | null
  categoryId?: number | null
  minPrice?: number | null
  maxPrice?: number | null
  hasDiscount?: boolean | null
  inStock?: boolean | null
  inputParams?: {
    filters: never[]
    sort: { propertyName: string, ascending: boolean } | null
  }
}


