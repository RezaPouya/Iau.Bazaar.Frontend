<!-- app/pages/growth-center/index.vue -->
<script setup lang="ts">
import { useGrowthCenterService } from '~/services/growth-center/growth-center.service'

// نکته: نسخه قبلی این صفحه (داشبورد اصلی مرکز رشد) فقط یک پیام خوش‌آمدگویی ساده بود
// و هیچ آمار/داده‌ای نشان نمی‌داد. همچنین layout آن به اشتباه 'university' بود (یعنی
// کاربر مرکز رشد، ناوبری/قالب دانشگاه را می‌دید) و middleware آن فقط 'auth' بود
// (یعنی هر کاربر لاگین‌کرده، نه فقط نقش مرکز رشد، می‌توانست این صفحه را ببیند).
definePageMeta({
  layout: 'growth-center',
  middleware: 'growth-center',
  title: 'داشبورد مرکز رشد'
})

const auth = useAuthStore()
const { $api } = useNuxtApp()
const toast = useToast()
const { getDashboardStats } = useGrowthCenterService()

const stats = ref({
  totalCompanies: 0,
  totalProducts: 0,
  pendingProducts: 0,
  totalOrders: 0,
  pendingFiles: 0
})

const loading = ref(false)
const recentOrders = ref<any[]>([])
const recentCompanies = ref<any[]>([])

const loadDashboardData = async () => {
  loading.value = true
  try {
    stats.value = await getDashboardStats()

    const ordersResponse = await $api.post('growth-center/orders/list', {
      page: 1,
      pageSize: 5,
      inputParams: { filters: [], sort: { propertyName: 'orderDate', ascending: false } }
    })
    recentOrders.value = ordersResponse.data.data?.data ?? []

    const companiesResponse = await $api.post('growth-center/companies/list', {
      page: 1,
      pageSize: 5,
      inputParams: { filters: [], sort: { propertyName: 'createdAt', ascending: false } }
    })
    recentCompanies.value = companiesResponse.data.data?.data ?? []
  } catch (error: any) {
    console.error('Error loading dashboard:', error)
    toast.add({ title: 'خطا در دریافت اطلاعات داشبورد', color: 'error' })
  } finally {
    loading.value = false
  }
}

const formatPrice = (price: number) => (price ?? 0).toLocaleString() + ' تومان'

onMounted(loadDashboardData)
useHead({ title: 'داشبورد مرکز رشد' })
</script>

<template>
  <div class="space-y-6">
    <div class="bg-gradient-to-l from-primary-600 to-primary-400 dark:from-primary-800 dark:to-primary-600 rounded-lg p-6 text-white">
      <h1 class="text-2xl font-bold">خوش آمدید، {{ auth.user?.fullName }}</h1>
      <p class="text-primary-100 mt-1">از اینجا می‌توانید شرکت‌ها، محصولات و سفارشات زیرمجموعه خود را مدیریت کنید.</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <UCard class="text-center hover:shadow-md transition-shadow">
        <div class="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
          <UIcon name="i-lucide-building-2" class="size-6" />
        </div>
        <div class="text-2xl font-bold mt-2">{{ stats.totalCompanies }}</div>
        <div class="text-sm text-dimmed">شرکت‌ها</div>
      </UCard>

      <UCard class="text-center hover:shadow-md transition-shadow">
        <div class="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
          <UIcon name="i-lucide-box" class="size-6" />
        </div>
        <div class="text-2xl font-bold mt-2">{{ stats.totalProducts }}</div>
        <div class="text-sm text-dimmed">محصولات</div>
      </UCard>

      <UCard class="text-center hover:shadow-md transition-shadow">
        <div class="flex items-center justify-center gap-2 text-warning-600 dark:text-warning-400">
          <UIcon name="i-lucide-clock" class="size-6" />
        </div>
        <div class="text-2xl font-bold mt-2">{{ stats.pendingProducts }}</div>
        <div class="text-sm text-dimmed">محصول در انتظار تایید</div>
      </UCard>

      <UCard class="text-center hover:shadow-md transition-shadow">
        <div class="flex items-center justify-center gap-2 text-success-600 dark:text-success-400">
          <UIcon name="i-lucide-shopping-cart" class="size-6" />
        </div>
        <div class="text-2xl font-bold mt-2">{{ stats.totalOrders }}</div>
        <div class="text-sm text-dimmed">سفارشات</div>
      </UCard>

      <UCard class="text-center hover:shadow-md transition-shadow">
        <div class="flex items-center justify-center gap-2 text-warning-600 dark:text-warning-400">
          <UIcon name="i-lucide-file-clock" class="size-6" />
        </div>
        <div class="text-2xl font-bold mt-2">{{ stats.pendingFiles }}</div>
        <div class="text-sm text-dimmed">مدارک در انتظار تایید</div>
      </UCard>
    </div>

    <UAlert
      v-if="stats.pendingProducts > 0 || stats.pendingFiles > 0"
      color="warning"
      variant="subtle"
      icon="i-lucide-alert-triangle"
      title="موارد در انتظار بررسی"
    >
      <template #description>
        <span class="text-sm">
          {{ stats.pendingProducts }} محصول و {{ stats.pendingFiles }} مدرک از شرکت‌های زیرمجموعه منتظر بررسی شما هستند.
        </span>
      </template>
    </UAlert>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Recent Companies -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="font-semibold">شرکت‌های جدید</h3>
            <NuxtLink to="/growth-center/companies" class="text-sm text-primary-600 hover:underline">مشاهده همه</NuxtLink>
          </div>
        </template>
        <div v-if="loading" class="flex justify-center py-4">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
        </div>
        <div v-else-if="recentCompanies.length === 0" class="text-center text-dimmed py-4">شرکتی یافت نشد</div>
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="company in recentCompanies" :key="company.id" class="py-2 flex justify-between items-center">
            <div>
              <div class="font-medium text-sm">{{ company.title }}</div>
              <div class="text-xs text-dimmed">{{ company.createdAtPersian }}</div>
            </div>
            <UBadge :color="company.isActive ? 'success' : 'neutral'" variant="subtle" size="sm">
              {{ company.isActive ? 'فعال' : 'غیرفعال' }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- Recent Orders -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="font-semibold">سفارشات اخیر</h3>
            <NuxtLink to="/growth-center/orders" class="text-sm text-primary-600 hover:underline">مشاهده همه</NuxtLink>
          </div>
        </template>
        <div v-if="loading" class="flex justify-center py-4">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
        </div>
        <div v-else-if="recentOrders.length === 0" class="text-center text-dimmed py-4">سفارشی یافت نشد</div>
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div v-for="order in recentOrders" :key="order.id" class="py-2 flex justify-between items-center">
            <div>
              <div class="font-medium text-sm">#{{ order.orderNumber }}</div>
              <div class="text-xs text-dimmed">{{ order.orderDate }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold">{{ formatPrice(order.totalAmount) }}</span>
              <UBadge color="neutral" variant="subtle" size="sm">{{ order.statusTitle }}</UBadge>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <UCard>
      <template #header>
        <h3 class="font-semibold">دسترسی سریع</h3>
      </template>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <NuxtLink to="/growth-center/companies" class="p-4 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <UIcon name="i-lucide-building-2" class="size-8 text-primary-600 mx-auto" />
          <div class="text-sm mt-2">مدیریت شرکت‌ها</div>
        </NuxtLink>
        <NuxtLink to="/growth-center/products" class="p-4 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <UIcon name="i-lucide-box" class="size-8 text-primary-600 mx-auto" />
          <div class="text-sm mt-2">بررسی محصولات</div>
        </NuxtLink>
        <NuxtLink to="/growth-center/orders" class="p-4 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <UIcon name="i-lucide-shopping-cart" class="size-8 text-primary-600 mx-auto" />
          <div class="text-sm mt-2">مشاهده سفارشات</div>
        </NuxtLink>
      </div>
    </UCard>
  </div>
</template>
