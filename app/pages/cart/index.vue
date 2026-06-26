<script setup lang="ts">
import type { CartDto } from '~/types/cart'
import { useCartService } from '~/services/cart.service'

definePageMeta({ middleware: 'auth', layout: 'default' })

// نکته: نسخه قبلی این صفحه با useFetch('/api/cart') داده می‌گرفت (که اصلاً به بک‌اند
// واقعی نمی‌رسید) و برای ویرایش/حذف از $api.put/delete('/api/cart/...') استفاده می‌کرد
// (که به‌خاطر پیشوند تکراری «/api» باعث آدرس غلط .../api/api/cart/... می‌شد).
// الان همه چیز از طریق useCartService انجام می‌شود.
const { getCart, updateCartItem, removeFromCart } = useCartService()
const toast = useAppToast()
const loading = ref(false)

const { data: cart, pending, refresh } = await useAsyncData<CartDto>(
  'cart',
  () => getCart(),
  { default: () => ({ items: [], subtotal: 0, taxAmount: 0, totalAmount: 0 }) }
)

const updateQuantity = async (itemId: number, quantity: number) => {
  if (quantity < 1) return
  loading.value = true
  try {
    await updateCartItem(itemId, quantity)
    await refresh()
  } catch (err: any) {
    toast.error('خطا', err?.response?.data?.message)
  } finally {
    loading.value = false
  }
}

const removeItem = async (itemId: number) => {
  loading.value = true
  try {
    await removeFromCart(itemId)
    await refresh()
    toast.success('حذف شد')
  } catch (err: any) {
    toast.error('خطا', err?.response?.data?.message)
  } finally {
    loading.value = false
  }
}

const isClearing = ref(false)
const clearCart = async () => {
  if (!cart.value.items.length) return
  isClearing.value = true
  loading.value = true
  try {
    // درخواست‌های حذف به‌صورت موازی برای هر آیتم (اندپوینت پاک‌کردن کامل سبد
    // در سرویس فعلی استفاده نشده تا تأیید کاربر برای هر مرحله حفظ شود)
    await Promise.all(cart.value.items.map(item => removeFromCart(item.id)))
    await refresh()
    toast.success('سبد خرید خالی شد')
  } catch (err: any) {
    toast.error('خطا', err?.response?.data?.message)
  } finally {
    loading.value = false
    isClearing.value = false
  }
}

const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price) + ' تومان'

useHead({ title: 'سبد خرید' })
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">سبد خرید</h1>
      <UButton v-if="cart?.items?.length" size="sm" color="error" variant="ghost" :loading="isClearing" @click="clearCart">
        خالی کردن
      </UButton>
    </div>

    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary-500" />
    </div>

    <div v-else-if="!cart?.items?.length" class="text-center py-16 text-dimmed border border-dashed rounded-xl">
      <UIcon name="i-lucide-shopping-cart" class="size-14 mx-auto" />
      <p class="mt-4">سبد خرید شما خالی است</p>
      <UButton to="/products" variant="outline" class="mt-3">مشاهده محصولات</UButton>
    </div>

    <div v-else class="space-y-4" :class="loading ? 'opacity-60 pointer-events-none' : ''">
      <UCard v-for="item in cart.items" :key="item.id" class="flex flex-col md:flex-row items-center gap-4">
        <img :src="item.productImageUrl || '/images/placeholder.png'" :alt="item.productTitle" class="w-24 h-24 object-cover rounded-lg">
        <div class="flex-1 text-center md:text-right">
          <NuxtLink :to="`/products/${item.productId}`" class="font-semibold hover:text-primary-600">{{ item.productTitle }}</NuxtLink>
          <div class="text-sm text-dimmed mt-1">{{ formatPrice(item.unitPrice) }}</div>
        </div>
        <div class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
          <UButton size="xs" color="neutral" variant="ghost" :disabled="item.quantity <= 1" @click="updateQuantity(item.id, item.quantity - 1)">−</UButton>
          <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
          <UButton size="xs" color="neutral" variant="ghost" @click="updateQuantity(item.id, item.quantity + 1)">+</UButton>
        </div>
        <div class="font-bold text-primary-600 min-w-[110px] text-center">{{ formatPrice(item.totalPrice) }}</div>
        <UButton size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" @click="removeItem(item.id)" />
      </UCard>

      <UCard class="mt-6">
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span>جمع کل</span><span>{{ formatPrice(cart.subtotal) }}</span></div>
          <div class="flex justify-between"><span>مالیات بر ارزش افزوده</span><span>{{ formatPrice(cart.taxAmount) }}</span></div>
          <div class="flex justify-between font-bold text-lg border-t border-gray-200 dark:border-gray-700 pt-2">
            <span>قابل پرداخت</span>
            <span class="text-primary-600">{{ formatPrice(cart.totalAmount) }}</span>
          </div>
        </div>
        <!-- توجه: صفحه‌ی پرداخت/تسویه‌حساب هنوز در پروژه ساخته نشده (خارج از فاز اول).
             تا زمانی که آن صفحه ساخته شود، این دکمه غیرفعال نمایش داده می‌شود تا
             به یک مسیر ناموجود لینک نشود. -->
        <UButton color="primary" block size="lg" class="mt-4" disabled>
          پرداخت و ثبت سفارش (به‌زودی)
        </UButton>
      </UCard>
    </div>
  </div>
</template>
