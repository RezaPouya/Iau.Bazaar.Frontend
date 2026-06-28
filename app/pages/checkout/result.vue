<script setup lang="ts">
import { useCheckoutService } from '~/services/checkout.service'

definePageMeta({ middleware: 'auth', layout: 'default' })

const route = useRoute()
const { confirmPaymentCallback } = useCheckoutService()

const loading = ref(true)
const result = ref<{ isSuccessful: boolean, invoiceNumber?: string, failureReason?: string } | null>(null)
const errorMessage = ref('')

onMounted(async () => {
  const orderId = Number(route.query.orderId)
  if (!orderId) {
    errorMessage.value = 'شناسه سفارش نامعتبر است.'
    loading.value = false
    return
  }

  // تمام query params برگشتی از درگاه (orderId, transactionId, status و هر چیز دیگری
  // که درگاه واقعی اضافه کند) عیناً به بک‌اند برای تأیید نهایی پاس داده می‌شود.
  const query = Object.fromEntries(
    Object.entries(route.query).map(([k, v]) => [k, String(v)])
  )

  try {
    result.value = await confirmPaymentCallback(orderId, query)
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'تأیید پرداخت با خطا مواجه شد.'
  } finally {
    loading.value = false
  }
})

useHead({ title: 'نتیجه پرداخت' })
</script>

<template>
  <div class="max-w-md mx-auto py-16 text-center">
    <div v-if="loading" class="space-y-3">
      <UIcon name="i-lucide-loader-circle" class="size-10 animate-spin text-primary-500 mx-auto" />
      <p class="text-dimmed">در حال تأیید نتیجه پرداخت...</p>
    </div>

    <div v-else-if="errorMessage" class="space-y-3">
      <UIcon name="i-lucide-circle-alert" class="size-14 text-error mx-auto" />
      <h1 class="text-xl font-bold">خطا</h1>
      <p class="text-dimmed">{{ errorMessage }}</p>
      <UButton to="/cart" class="mt-2">بازگشت به سبد خرید</UButton>
    </div>

    <div v-else-if="result?.isSuccessful" class="space-y-3">
      <UIcon name="i-lucide-circle-check" class="size-14 text-success mx-auto" />
      <h1 class="text-xl font-bold">پرداخت با موفقیت انجام شد</h1>
      <p class="text-dimmed">شماره فاکتور: {{ result.invoiceNumber }}</p>
      <UButton to="/" class="mt-2">بازگشت به صفحه اصلی</UButton>
    </div>

    <div v-else class="space-y-3">
      <UIcon name="i-lucide-circle-x" class="size-14 text-error mx-auto" />
      <h1 class="text-xl font-bold">پرداخت ناموفق بود</h1>
      <p class="text-dimmed">{{ result?.failureReason || 'مشکلی در پرداخت رخ داد.' }}</p>
      <UButton to="/cart" class="mt-2">بازگشت به سبد خرید</UButton>
    </div>
  </div>
</template>
