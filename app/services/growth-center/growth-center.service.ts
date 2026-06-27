// app/services/growth-center/growth-center.service.ts
import type { ApiResponse } from '~/types/api'
import type { GridDataSourceRequest, GridDataSourceResult } from '~/types/grid'
import type { Company, CompanyUser, CreateCompanyInput, UpdateCompanyInput } from '~/types/company'
import type { Product, ProductApprovalRequest } from '~/types/product'
import type { ProductFile, ProductLegalDocument } from '~/types/product-file'
import type { OrderSummary, InvoiceDetail } from '~/types/order'
import type { User } from '~/types/user'
import type { GrowthCenterDashboardStats } from '~/types/dashboard'

export const useGrowthCenterService = () => {
  const { $api } = useNuxtApp()

  // ========== Companies ==========
  const getCompaniesList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<Company>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<Company>>>('growth-center/companies/list', request)
    return response.data.data
  }

  const getCompanyById = async (id: number): Promise<Company> => {
    const response = await $api.get<ApiResponse<Company>>(`growth-center/companies/${id}`)
    return response.data.data
  }

  const createCompany = async (data: CreateCompanyInput): Promise<Company> => {
    const response = await $api.post<ApiResponse<Company>>('growth-center/companies', data)
    return response.data.data
  }

  const updateCompany = async (id: number, data: UpdateCompanyInput): Promise<Company> => {
    const response = await $api.put<ApiResponse<Company>>(`growth-center/companies/${id}`, data)
    return response.data.data
  }

  const deleteCompany = async (id: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`growth-center/companies/${id}`)
  }

  const toggleCompanyActive = async (id: number): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`growth-center/companies/${id}/toggle-active`)
  }

  // ========== Company Users ==========
  const getCompanyUsers = async (companyId: number, request: GridDataSourceRequest): Promise<GridDataSourceResult<CompanyUser>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<CompanyUser>>>(
      `growth-center/companies/${companyId}/users/list`,
      request
    )
    return response.data.data
  }

  const addUserToCompany = async (companyId: number, userId: number): Promise<void> => {
    await $api.post<ApiResponse<void>>(`growth-center/companies/${companyId}/users/add/${userId}`)
  }

  const removeUserFromCompany = async (companyId: number, userId: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`growth-center/companies/${companyId}/users/${userId}`)
  }

  const toggleCompanyUserActive = async (companyId: number, userId: number, isActive: boolean): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`growth-center/companies/${companyId}/users/${userId}/toggle-active`, isActive)
  }

  // ========== Users ==========
  const getUsersList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<User>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<User>>>('growth-center/users/list', request)
    return response.data.data
  }

  // ========== Products ==========
  const getProductsList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<Product>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<Product>>>('growth-center/products/list', request)
    return response.data.data
  }

  const getProductById = async (id: number): Promise<Product> => {
    const response = await $api.get<ApiResponse<Product>>(`growth-center/products/${id}`)
    return response.data.data
  }

  const toggleProductApproval = async (productId: number, approved: boolean, rejectionReason?: string): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`growth-center/products/${productId}/approve`, {
      approved,
      rejectionReason: approved ? null : rejectionReason
    })
  }

  const toggleProductImageApproval = async (imageId: number, approved: boolean, rejectionReason?: string): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`growth-center/products/images/${imageId}/approve`, {
      approved,
      rejectionReason: approved ? null : rejectionReason
    })
  }

  // ========== Product Files ==========
  const getProductFiles = async (productId: number, request: GridDataSourceRequest): Promise<GridDataSourceResult<ProductFile>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<ProductFile>>>(
      `growth-center/product-files/${productId}/list`,
      request
    )
    return response.data.data
  }

  const toggleProductFileApproval = async (fileId: number, approved: boolean, rejectionReason?: string): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`growth-center/product-files/files/${fileId}/approve`, {
      approved,
      rejectionReason: approved ? null : rejectionReason
    })
  }

  const toggleLegalDocumentApproval = async (documentId: number, approved: boolean, rejectionReason?: string): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`growth-center/product-files/legal/${documentId}/approve`, {
      approved,
      rejectionReason: approved ? null : rejectionReason
    })
  }

  const getLegalDocuments = async (productId: number, request: GridDataSourceRequest): Promise<GridDataSourceResult<ProductLegalDocument>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<ProductLegalDocument>>>(
      `growth-center/product-files/${productId}/legal/list`,
      request
    )
    return response.data.data
  }

  // ========== Orders ==========
  const getOrdersList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<OrderSummary>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<OrderSummary>>>('growth-center/orders/list', request)
    return response.data.data
  }

  const getOrderInvoice = async (orderId: number): Promise<InvoiceDetail> => {
    const response = await $api.get<ApiResponse<InvoiceDetail>>(`growth-center/orders/${orderId}/invoice`)
    return response.data.data
  }

  const getDashboardStats = async (): Promise<GrowthCenterDashboardStats> => {
    const response = await $api.get<ApiResponse<GrowthCenterDashboardStats>>('growth-center/dashboard/stats')
    return response.data.data
  }

  return {
    // Companies
    getCompaniesList,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    toggleCompanyActive,
    // Company Users
    getCompanyUsers,
    addUserToCompany,
    removeUserFromCompany,
    toggleCompanyUserActive,
    // Users
    getUsersList,
    // Products
    getProductsList,
    getProductById,
    toggleProductApproval,
    toggleProductImageApproval,
    // Product Files
    getProductFiles,
    toggleProductFileApproval,
    toggleLegalDocumentApproval,
    getLegalDocuments,
    // Orders
    getOrdersList,
    getOrderInvoice,
    getDashboardStats
  }
}


