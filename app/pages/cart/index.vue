<script setup lang="ts">
import type { CartDto, CartItemDto } from '~/types/cart'

definePageMeta({ middleware: 'auth', layout: 'default' })

const { $api } = useNuxtApp()
const toast = useToast()
const loading = ref(false)

// دریافت سبد خرید
const { data: cart, pending, refresh } = await useFetch<CartDto>('/api/cart', {
  key: 'cart',
  default: () => ({ items: [], subtotal: 0, taxAmount: 0, totalAmount: 0 })
})

const updateQuantity = async (itemId: number, quantity: number) => {
  if (quantity < 1) return
  loading.value = true
  try {
    await $api.put(`/api/cart/items/${itemId}`, { quantity })
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'خطا', description: err.response?.data?.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const removeItem = async (itemId: number) => {
  loading.value = true
  try {
    await $api.delete(`/api/cart/items/${itemId}`)
    await refresh()
    toast.add({ title: 'حذف شد', color: 'success' })
  } catch (err: any) {
    toast.add({ title: 'خطا', description: err.response?.data?.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const clearCart = async () => {
  if (!confirm('آیا از خالی کردن سبد خرید اطمینان دارید؟')) return
  loading.value = true
  try {
    await $api.delete('/api/cart')
    await refresh()
    toast.add({ title: 'سبد خرید خالی شد', color: 'success' })
  } catch (err: any) {
    toast.add({ title: 'خطا', description: err.response?.data?.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">سبد خرید</h1>
      <UButton v-if="cart?.items?.length" size="sm" color="error" variant="ghost" @click="clearCart">خالی کردن</UButton>
    </div>

    <div v-if="pending || loading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" />
    </div>

    <div v-else-if="!cart?.items?.length" class="text-center py-12 text-dimmed">
      <UIcon name="i-lucide-shopping-cart" class="size-16 mx-auto" />
      <p class="mt-4">سبد خرید شما خالی است</p>
      <NuxtLink to="/products" class="text-primary-600 mt-2 inline-block">مشاهده محصولات</NuxtLink>
    </div>

    <div v-else class="space-y-4">
      <UCard v-for="item in cart.items" :key="item.id" class="flex flex-col md:flex-row items-center gap-4">
        <img :src="item.productImageUrl || '/images/placeholder.png'" :alt="item.productTitle" class="w-24 h-24 object-cover rounded" />
        <div class="flex-1">
          <NuxtLink :to="`/products/${item.productId}`" class="font-semibold hover:text-primary-600">{{ item.productTitle }}</NuxtLink>
          <div class="text-sm text-dimmed">{{ formatPrice(item.unitPrice) }}</div>
        </div>
        <div class="flex items-center gap-2">
          <UButton size="xs" color="neutral" variant="ghost" @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</UButton>
          <span class="w-8 text-center">{{ item.quantity }}</span>
          <UButton size="xs" color="neutral" variant="ghost" @click="updateQuantity(item.id, item.quantity + 1)">+</UButton>
        </div>
        <div class="font-bold text-primary-600 min-w-[100px] text-center">{{ formatPrice(item.totalPrice) }}</div>
        <UButton size="sm" color="error" variant="ghost" @click="removeItem(item.id)">حذف</UButton>
      </UCard>

      <UCard class="mt-6">
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span>جمع کل</span><span>{{ formatPrice(cart.subtotal) }}</span></div>
          <div class="flex justify-between"><span>مالیات ({{ 10 }}%)</span><span>{{ formatPrice(cart.taxAmount) }}</span></div>
          <div class="flex justify-between font-bold text-lg border-t pt-2"><span>قابل پرداخت</span><span class="text-primary-600">{{ formatPrice(cart.totalAmount) }}</span></div>
        </div>
        <UButton color="primary" block size="lg" class="mt-4">پرداخت و ثبت سفارش</UButton>
      </UCard>
    </div>
  </div>
</template>

