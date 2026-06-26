// app/services/cart.service.ts
import type { ApiResponse } from '~/types/api'
import type { CartDto } from '~/types/cart'

export const useCartService = () => {
  const { $api } = useNuxtApp()

  const getCart = async (): Promise<CartDto> => {
    const response = await $api.get<ApiResponse<CartDto>>('cart')
    return response.data.data
  }

  const addToCart = async (productId: number, quantity = 1): Promise<void> => {
    await $api.post<ApiResponse<void>>('cart/items', { productId, quantity })
  }

  const updateCartItem = async (itemId: number, quantity: number): Promise<void> => {
    await $api.put<ApiResponse<void>>(`cart/items/${itemId}`, { quantity })
  }

  const removeFromCart = async (itemId: number): Promise<void> => {
    await $api.delete<ApiResponse<void>>(`cart/items/${itemId}`)
  }

  return {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart
  }
}
