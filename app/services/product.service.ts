// app/services/product.service.ts
//
// این سرویس برای ارتباط با اندپوینت‌های عمومی محصولات (PublicController سمت بک‌اند) است.
// نکته مهم: باید همیشه از طریق $api (instance آماده‌شده با axios در app/plugins/api.ts)
// فراخوانی شود، نه useFetch/$fetch خام. چون:
//   ۱) baseURL واقعی بک‌اند (https://localhost:7139/api) فقط داخل $api تنظیم شده است.
//   ۲) توکن احراز هویت (در صورت لاگین بودن کاربر) فقط توسط $api به هدر Authorization اضافه می‌شود.
// همچنین آدرس‌ها هرگز با "/api/" شروع نمی‌شوند، چون baseURL از قبل شامل "/api" است
// و در غیر این صورت آدرس نهایی به اشتباه ".../api/api/..." می‌شود.
import type { ApiResponse } from '~/types/api'
import type { GridDataSourceResult } from '~/types/grid'
import type { Product, ProductCategory, ProductListFilter } from '~/types/product'

export const useProductService = () => {
  const { $api } = useNuxtApp()

  const getProductsList = async (filter: ProductListFilter): Promise<GridDataSourceResult<Product>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<Product>>>('public/products/list', filter)
    return response.data.data
  }

  const getProductById = async (id: number): Promise<Product> => {
    const response = await $api.get<ApiResponse<Product>>(`public/products/${id}`)
    return response.data.data
  }

  const getFeaturedProducts = async (): Promise<GridDataSourceResult<Product>> => {
    const response = await $api.get<ApiResponse<GridDataSourceResult<Product>>>('public/products/featured')
    return response.data.data
  }

  const getCategories = async (): Promise<ProductCategory[]> => {
    const response = await $api.get<ApiResponse<ProductCategory[]>>('public/categories')
    return response.data.data
  }

  return {
    getProductsList,
    getProductById,
    getFeaturedProducts,
    getCategories
  }
}
