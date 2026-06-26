// app/services/company/company.service.ts
import type { ApiResponse } from '~/types/api'
import type { GridDataSourceRequest, GridDataSourceResult } from '~/types/grid'
import type { Product, CreateProductInput, UpdateProductInput, ProductImage } from '~/types/product'
import type { ProductFile, ProductLegalDocument } from '~/types/product-file'
import type { OrderSummary, InvoiceDetail } from '~/types/order'

export const useCompanyService = () => {
  const { $api } = useNuxtApp()

  // ========== Products ==========
  const getProductsList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<Product>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<Product>>>('company/products/list', request)
    return response.data.data
  }

  const getProductById = async (id: number): Promise<Product> => {
    const response = await $api.get<ApiResponse<Product>>(`company/products/${id}`)
    return response.data.data
  }

  const createProduct = async (data: FormData): Promise<Product> => {
    const response = await $api.post<ApiResponse<Product>>('company/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.data
  }

  const updateProduct = async (id: number, data: FormData): Promise<Product> => {
    const response = await $api.put<ApiResponse<Product>>(`company/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.data
  }

  const deleteProduct = async (id: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`company/products/${id}`)
  }

  const changeProductStatus = async (id: number, status: number): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`company/products/${id}/status`, { status })
  }

  // ========== Product Images ==========
  const uploadProductImages = async (productId: number, files: FormData): Promise<ProductImage[]> => {
    const response = await $api.post<ApiResponse<ProductImage[]>>(
      `company/products/${productId}/images/upload`,
      files,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data.data
  }

  const deleteProductImage = async (imageId: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`company/products/images/${imageId}`)
  }

  const setPrimaryImage = async (productId: number, imageId: number): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`company/products/${productId}/images/set-primary/${imageId}`)
  }

  const reorderImages = async (productId: number, orderedImageIds: number[]): Promise<void> => {
    await $api.post<ApiResponse<void>>(`company/products/${productId}/images/reorder`, orderedImageIds)
  }

  // ========== Product Categories ==========
  const updateProductCategories = async (productId: number, categoryIds: number[]): Promise<void> => {
    await $api.patch<ApiResponse<void>>(`company/products/${productId}/categories`, categoryIds)
  }

  // ========== Product Files ==========
  const getProductFiles = async (productId: number, request: GridDataSourceRequest): Promise<GridDataSourceResult<ProductFile>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<ProductFile>>>(
      `company/product-files/${productId}/list`,
      request
    )
    return response.data.data
  }

  const uploadProductFiles = async (data: FormData): Promise<ProductFile[]> => {
    const response = await $api.post<ApiResponse<ProductFile[]>>('company/product-files/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.data
  }

  const updateProductFile = async (fileId: number, data: any): Promise<ProductFile> => {
    const response = await $api.put<ApiResponse<ProductFile>>(`company/product-files/${fileId}`, data)
    return response.data.data
  }

  const deleteProductFile = async (fileId: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`company/product-files/${fileId}`)
  }

  const downloadProductFile = async (fileId: number): Promise<Blob> => {
    const response = await $api.get(`company/product-files/download/${fileId}`, {
      responseType: 'blob'
    })
    return response.data
  }

  // ========== Legal Documents ==========
  const getLegalDocuments = async (productId: number, request: GridDataSourceRequest): Promise<GridDataSourceResult<ProductLegalDocument>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<ProductLegalDocument>>>(
      `company/product-files/${productId}/legal/list`,
      request
    )
    return response.data.data
  }

  const uploadLegalDocument = async (data: FormData): Promise<ProductLegalDocument[]> => {
    const response = await $api.post<ApiResponse<ProductLegalDocument[]>>('company/product-files/legal/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.data
  }

  const updateLegalDocument = async (documentId: number, data: any): Promise<ProductLegalDocument> => {
    const response = await $api.put<ApiResponse<ProductLegalDocument>>(`company/product-files/legal/${documentId}`, data)
    return response.data.data
  }

  const deleteLegalDocument = async (documentId: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`company/product-files/legal/${documentId}`)
  }

  // ========== Orders ==========
  const getOrdersList = async (request: GridDataSourceRequest): Promise<GridDataSourceResult<OrderSummary>> => {
    const response = await $api.post<ApiResponse<GridDataSourceResult<OrderSummary>>>('company/orders/list', request)
    return response.data.data
  }

  const getOrderInvoice = async (orderId: number): Promise<InvoiceDetail> => {
    const response = await $api.get<ApiResponse<InvoiceDetail>>(`company/orders/${orderId}/invoice`)
    return response.data.data
  }

  return {
    // Products
    getProductsList,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    changeProductStatus,
    // Product Images
    uploadProductImages,
    deleteProductImage,
    setPrimaryImage,
    reorderImages,
    // Product Categories
    updateProductCategories,
    // Product Files
    getProductFiles,
    uploadProductFiles,
    updateProductFile,
    deleteProductFile,
    downloadProductFile,
    // Legal Documents
    getLegalDocuments,
    uploadLegalDocument,
    updateLegalDocument,
    deleteLegalDocument,
    // Orders
    getOrdersList,
    getOrderInvoice
  }
}


