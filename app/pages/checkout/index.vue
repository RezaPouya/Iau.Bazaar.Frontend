<script setup lang="ts">
import type { CheckoutAddressInput, CheckoutPreview } from '~/types/checkout'
import { useCheckoutService } from '~/services/checkout.service'
import { useLocationService, type IdName } from '~/services/location.service'

definePageMeta({ middleware: 'auth', layout: 'default' })

const { getPreview, createOrder } = useCheckoutService()
const { getProvinces, getCities } = useLocationService()
const toast = useAppToast()
const router = useRouter()

// ---------- فرم آدرس ----------
const form = reactive<CheckoutAddressInput>({
  recipientFullName: '',
  recipientPhoneNumber: '',
  provinceId: 0,
  cityId: 0,
  address: '',
  postalCode: ''
})

const provinces = ref<IdName[]>([])
const cities = ref<IdName[]>([])
const loadingCities = ref(false)

const { data: provincesData } = await useAsyncData('checkout-provinces', () => getProvinces(), { default: () => [] })
provinces.value = provincesData.value

watch(() => form.provinceId, async (newProvinceId) => {
  form.cityId = 0
  cities.value = []
  if (!newProvinceId) return
  loadingCities.value = true
  try {
    cities.value = await getCities(newProvinceId)
  } finally {
    loadingCities.value = false
  }
})

// ---------- پیش‌نمایش سفارش (تفکیک بسته‌ها + هزینه ارسال) ----------
const preview = ref<CheckoutPreview | null>(null)
const previewLoading = ref(false)
const previewError = ref('')

const isAddressReadyForPreview = computed(() =>
  !!form.provinceId && !!form.cityId && form.address.trim().length > 5
)

const loadPreview = async () => {
  if (!isAddressReadyForPreview.value) {
    preview.value = null
    return
  }
  previewLoading.value = true
  previewError.value = ''
  try {
    preview.value = await getPreview(form)
  } catch (err: any) {
    previewError.value = err?.response?.data?.message || 'دریافت پیش‌نمایش سفارش با خطا مواجه شد'
    preview.value = null
  } finally {
    previewLoading.value = false
  }
}

// با تغییر آدرس مقصد (که هزینه ارسال به آن وابسته است)، پیش‌نمایش را به‌روز کن
watch(() => form.provinceId, loadPreview)

const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price) + ' تومان'

// ---------- ثبت نهایی سفارش ----------
const placingOrder = ref(false)

const placeOrder = async () => {
  if (!form.recipientFullName.trim() || !form.recipientPhoneNumber.trim() || !form.address.trim() || !form.provinceId || !form.cityId) {
    toast.error('فرم ناقص است', 'لطفاً همه‌ی فیلدهای آدرس را تکمیل کنید')
    return
  }

  placingOrder.value = true
  try {
    // نکته: ReturnUrl باید به یک صفحه‌ی واقعی فرانت‌اند اشاره کند (نه مستقیماً به API)،
    // چون درگاه پرداخت کاربر را با مرورگر به این آدرس برمی‌گرداند و باید یک صفحه‌ی
    // قابل‌نمایش باشد، نه پاسخ JSON خام.
    const returnUrl = `${window.location.origin}/checkout/result`
    const confirmation = await createOrder({ address: form, returnUrl })

    // ریدایرکت به درگاه پرداخت (در حالت Sandbox فعلی، این آدرس مستقیماً به همان
    // returnUrl با status=success برمی‌گردد تا کل مسیر قابل تست باشد)
    window.location.href = confirmation.paymentRedirectUrl
  } catch (err: any) {
    toast.error('خطا در ثبت سفارش', err?.response?.data?.message || 'لطفاً دوباره تلاش کنید')
  } finally {
    placingOrder.value = false
  }
}

useHead({ title: 'تسویه حساب' })
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <h1 class="text-2xl font-bold mb-6">تسویه حساب</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- فرم آدرس -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">آدرس ارسال</h2>
        </template>
        <div class="space-y-4">
          <UFormField label="نام و نام خانوادگی گیرنده" required>
            <UInput v-model="form.recipientFullName" class="w-full" />
          </UFormField>
          <UFormField label="شماره موبایل گیرنده" required>
            <UInput v-model="form.recipientPhoneNumber" type="tel" dir="ltr" class="w-full text-left" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="استان" required>
              <USelect
                v-model="form.provinceId"
                :items="[{ label: 'انتخاب کنید', value: 0 }, ...provinces.map(p => ({ label: p.name, value: p.id }))]"
                class="w-full"
              />
            </UFormField>
            <UFormField label="شهر" required>
              <USelect
                v-model="form.cityId"
                :disabled="!form.provinceId || loadingCities"
                :items="[{ label: 'انتخاب کنید', value: 0 }, ...cities.map(c => ({ label: c.name, value: c.id }))]"
                class="w-full"
              />
            </UFormField>
          </div>
          <UFormField label="آدرس کامل" required>
            <UTextarea v-model="form.address" rows="3" class="w-full" placeholder="خیابان، کوچه، پلاک، واحد..." @blur="loadPreview" />
          </UFormField>
          <UFormField label="کد پستی">
            <UInput v-model="form.postalCode" dir="ltr" class="w-full text-left" />
          </UFormField>
        </div>
      </UCard>

      <!-- پیش‌نمایش سفارش -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">جزئیات سفارش</h2>
        </template>

        <div v-if="!isAddressReadyForPreview" class="text-center text-dimmed py-10 text-sm">
          برای مشاهده‌ی جزئیات سفارش و هزینه ارسال، آدرس را تکمیل کنید
        </div>

        <div v-else-if="previewLoading" class="flex justify-center py-10">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-primary-500" />
        </div>

        <div v-else-if="previewError" class="text-center text-error py-10 text-sm">{{ previewError }}</div>

        <div v-else-if="preview" class="space-y-4">
          <!-- نکته: چون امکان تجمیع و ارسال یک‌جای سفارش وجود ندارد، سفارش به چند
               «بسته»‌ی جدا (بر اساس شرکت فروشنده) تقسیم می‌شود؛ هر بسته هزینه ارسال
               مستقل خودش را دارد. -->
          <div v-for="shipment in preview.shipments" :key="shipment.companyId" class="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-sm flex items-center gap-1">
                <UIcon name="i-lucide-store" class="size-4 text-primary-600" />
                {{ shipment.companyTitle }}
              </span>
              <UBadge size="sm" color="neutral" variant="subtle">
                {{ shipment.isSameProvinceAsDestination ? 'ارسال داخل استان' : 'ارسال بین‌استانی' }}
              </UBadge>
            </div>
            <div v-for="item in shipment.items" :key="item.productId" class="flex justify-between text-sm text-dimmed py-0.5">
              <span>{{ item.productTitle }} × {{ item.quantity }}</span>
              <span>{{ formatPrice(item.totalPrice) }}</span>
            </div>
            <div class="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
              <span>هزینه ارسال این بسته</span>
              <span class="font-medium">{{ shipment.shippingCost > 0 ? formatPrice(shipment.shippingCost) : 'رایگان' }}</span>
            </div>
          </div>

          <div class="space-y-1.5 text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
            <div class="flex justify-between"><span>جمع کالاها</span><span>{{ formatPrice(preview.itemsSubtotal) }}</span></div>
            <div class="flex justify-between"><span>مجموع هزینه ارسال ({{ preview.shipments.length }} بسته)</span><span>{{ formatPrice(preview.totalShippingCost) }}</span></div>
            <div class="flex justify-between font-bold text-base pt-1">
              <span>قابل پرداخت</span>
              <span class="text-primary-600">{{ formatPrice(preview.grandTotal) }}</span>
            </div>
          </div>

          <UButton color="primary" size="lg" block :loading="placingOrder" @click="placeOrder">
            پرداخت و ثبت سفارش
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
