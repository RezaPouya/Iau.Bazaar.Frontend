// app/services/checkout.service.ts
import type { ApiResponse } from '~/types/api'
import type {
  CheckoutAddressInput,
  CheckoutPreview,
  CreateOrderInput,
  OrderConfirmation,
  PaymentCallbackResult
} from '~/types/checkout'

export const useCheckoutService = () => {
  const { $api } = useNuxtApp()

  const getPreview = async (address: CheckoutAddressInput): Promise<CheckoutPreview> => {
    const response = await $api.post<ApiResponse<CheckoutPreview>>('checkout/preview', address)
    return response.data.data
  }

  const createOrder = async (input: CreateOrderInput): Promise<OrderConfirmation> => {
    const response = await $api.post<ApiResponse<OrderConfirmation>>('checkout', input)
    return response.data.data
  }

  // نکته: این درخواست از صفحه‌ی نتیجه (بعد از بازگشت از درگاه) صدا زده می‌شود، با همان
  // query string ای که درگاه به ReturnUrl اضافه کرده (orderId, transactionId, status و...)
  const confirmPaymentCallback = async (orderId: number, query: Record<string, string>): Promise<PaymentCallbackResult> => {
    const response = await $api.get<ApiResponse<PaymentCallbackResult>>(`checkout/${orderId}/callback`, { params: query })
    return response.data.data
  }

  return { getPreview, createOrder, confirmPaymentCallback }
}
