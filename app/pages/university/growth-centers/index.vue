<!-- app/pages/growth-center/index.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'growth-center',
  middleware: 'growth-center',
  title: 'داشبورد مرکز رشد'
})

const auth = useAuthStore()
const { $api } = useNuxtApp()
const toast = useToast()

// ========== State ==========
const stats = ref({
  totalCompanies: 0,
  totalProducts: 0,
  pendingProducts: 0,
  totalOrders: 0,
  pendingFiles: 0
})

const loading = ref(false)
const recentOrders = ref<any[]>([])
const pendingProductsList = ref<any[]>([])

// ========== Load Dashboard Data ==========
const loadDashboardData = async () => {
  loading.value = true

  // نکته: این endpoint (dashboard/stats) در بک‌اند فعلی وجود ندارد. جدا try/catch شده
  // تا نبود این یک endpoint مانع لود شدن ویجت‌های دیگر (که endpoint واقعی دارند) نشود.
  try {
    const statsResponse = await $api.get('/api/growth-center/dashboard/stats')
    stats.value = statsResponse.data.data
  } catch (error) {
    console.error('Error loading dashboard stats (endpoint not implemented yet):', error)
  }

  try {
    // دریافت سفارشات اخیر
    const ordersResponse = await $api.post('/api/growth-center/orders/list', {
      page: 1,
      pageSize: 5,
      inputParams: { filters: [], sort: { propertyName: 'orderDate', ascending: false } }
    })
    // پاسخ اکنون ApiResponse<GridDataSourceResult<T>> است؛ یک لایه .data بیشتر لازم است
    recentOrders.value = ordersResponse.data.data?.data ?? []

    // دریافت محصولات در انتظار تایید
    const productsResponse = await $api.post('/api/growth-center/products/list', {
      page: 1,
      pageSize: 5,
      inputParams: {
        filters: [{ propertyName: 'approvalStatus', operation: 'equals', value: '0' }],
        sort: { propertyName: 'createdAt', ascending: false }
      }
    })
    pendingProductsList.value = productsResponse.data.data?.data ?? []
  } catch (error: any) {
    console.error('Error loading dashboard:', error)
    toast.add({ title: 'خطا در دریافت اطلاعات داشبورد', color: 'error' })
  } finally {
    loading.value = false
  }
}

// ========== Format Price ==========
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

// ========== Lifecycle ==========
onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <ClientOnly>
    <div class="space-y-6">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-l from-primary-600 to-primary-400 dark:from-primary-800 dark:to-primary-600 rounded-lg p-6 text-white">
        <h1 class="text-2xl font-bold">خوش آمدید، {{ auth.user?.fullName }}</h1>
        <p class="text-primary-100 mt-1">از اینجا می‌توانید شرکت‌ها، محصولات و سفارشات زیر مجموعه خود را مدیریت کنید.</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard class="text-center hover:shadow-md transition-shadow">
          <div class="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
            <UIcon name="i-lucide-building" class="size-6" />
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
          <div class="text-sm text-dimmed">در انتظار تایید</div>
        </UCard>

        <UCard class="text-center hover:shadow-md transition-shadow">
          <div class="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
            <UIcon name="i-lucide-shopping-cart" class="size-6" />
          </div>
          <div class="text-2xl font-bold mt-2">{{ stats.totalOrders }}</div>
          <div class="text-sm text-dimmed">سفارشات</div>
        </UCard>
      </div>

      <!-- Pending Products Alert -->
      <UAlert
        v-if="stats.pendingProducts > 0"
        color="warning"
        variant="subtle"
        icon="i-lucide-alert-triangle"
        :title="`${stats.pendingProducts} محصول در انتظار تایید شما هستند`"
      >
        <template #description>
          <NuxtLink to="/growth-center/products" class="text-primary-600 hover:underline">
            مشاهده و بررسی محصولات
          </NuxtLink>
        </template>
      </UAlert>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Pending Products -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-semibold">محصولات در انتظار تایید</h3>
              <NuxtLink to="/growth-center/products" class="text-sm text-primary-600 hover:underline">
                مشاهده همه
              </NuxtLink>
            </div>
          </template>
          <div v-if="loading" class="flex justify-center py-4">
            <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
          </div>
          <div v-else-if="pendingProductsList.length === 0" class="text-center text-dimmed py-4">
            هیچ محصول در انتظار تاییدی وجود ندارد
          </div>
          <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <div v-for="product in pendingProductsList" :key="product.id" class="py-2 flex justify-between items-center">
              <div>
                <div class="font-medium text-sm">{{ product.title }}</div>
                <div class="text-xs text-dimmed">{{ product.companyName }}</div>
              </div>
              <UBadge color="warning" variant="subtle" size="sm">در انتظار</UBadge>
            </div>
          </div>
        </UCard>

        <!-- Recent Orders -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-semibold">سفارشات اخیر</h3>
              <NuxtLink to="/growth-center/orders" class="text-sm text-primary-600 hover:underline">
                مشاهده همه
              </NuxtLink>
            </div>
          </template>
          <div v-if="loading" class="flex justify-center py-4">
            <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
          </div>
          <div v-else-if="recentOrders.length === 0" class="text-center text-dimmed py-4">
            سفارشی یافت نشد
          </div>
          <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <div v-for="order in recentOrders" :key="order.id" class="py-2 flex justify-between items-center">
              <div>
                <div class="font-medium text-sm">#{{ order.orderNumber }}</div>
                <div class="text-xs text-dimmed">{{ order.orderDate }}</div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold">{{ order.totalAmount.toLocaleString() }} تومان</span>
                <UBadge
                  :color="
                    order.status === 1 ? 'warning' :
                    order.status === 2 ? 'success' :
                    order.status === 3 ? 'info' :
                    order.status === 4 ? 'primary' :
                    'error'
                  "
                  variant="subtle"
                  size="sm"
                >
                  {{ order.statusTitle }}
                </UBadge>
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
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NuxtLink to="/growth-center/companies" class="p-4 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <UIcon name="i-lucide-building" class="size-8 text-primary-600 mx-auto" />
            <div class="text-sm mt-2">مدیریت شرکت‌ها</div>
          </NuxtLink>
          <NuxtLink to="/growth-center/company-users" class="p-4 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <UIcon name="i-lucide-users" class="size-8 text-primary-600 mx-auto" />
            <div class="text-sm mt-2">کاربران شرکت‌ها</div>
          </NuxtLink>
          <NuxtLink to="/growth-center/products" class="p-4 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <UIcon name="i-lucide-box" class="size-8 text-primary-600 mx-auto" />
            <div class="text-sm mt-2">مدیریت محصولات</div>
          </NuxtLink>
          <NuxtLink to="/growth-center/product-files" class="p-4 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <UIcon name="i-lucide-files" class="size-8 text-primary-600 mx-auto" />
            <div class="text-sm mt-2">مدیریت مدارک</div>
          </NuxtLink>
        </div>
      </UCard>
    </div>
  </ClientOnly>
</template>


