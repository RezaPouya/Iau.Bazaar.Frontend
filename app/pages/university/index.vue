<!-- app/pages/university/index.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'university',
  middleware: 'university',
  title: 'داشبورد دانشگاه'
})

const auth = useAuthStore()
const { $api } = useNuxtApp()
const toast = useToast()

// ========== State ==========
const stats = ref({
  totalGrowthCenters: 0,
  totalCompanies: 0,
  totalProducts: 0,
  totalOrders: 0,
  pendingProducts: 0
})

const loading = ref(false)
const recentOrders = ref<any[]>([])
const recentProducts = ref<any[]>([])

// ========== Load Dashboard Data ==========
const loadDashboardData = async () => {
  loading.value = true
  try {
    // دریافت آمار
    const statsResponse = await $api.get('/api/university/dashboard/stats')
    stats.value = statsResponse.data.data

    // دریافت سفارشات اخیر
    const ordersResponse = await $api.post('/api/university/orders/list', {
      page: 1,
      pageSize: 5,
      inputParams: { filters: [], sort: { propertyName: 'orderDate', ascending: false } }
    })
    recentOrders.value = ordersResponse.data.data ?? []

    // دریافت محصولات اخیر
    const productsResponse = await $api.post('/api/university/products/list', {
      page: 1,
      pageSize: 5,
      inputParams: { filters: [], sort: { propertyName: 'createdAt', ascending: false } }
    })
    recentProducts.value = productsResponse.data.data ?? []
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
        <p class="text-primary-100 mt-1">از اینجا می‌توانید مراکز رشد، شرکت‌ها و محصولات زیر مجموعه خود را مدیریت کنید.</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard class="text-center hover:shadow-md transition-shadow">
          <div class="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
            <UIcon name="i-lucide-trending-up" class="size-6" />
          </div>
          <div class="text-2xl font-bold mt-2">{{ stats.totalGrowthCenters }}</div>
          <div class="text-sm text-dimmed">مراکز رشد</div>
        </UCard>

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
          <div class="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
            <UIcon name="i-lucide-shopping-cart" class="size-6" />
          </div>
          <div class="text-2xl font-bold mt-2">{{ stats.totalOrders }}</div>
          <div class="text-sm text-dimmed">سفارشات</div>
        </UCard>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Recent Products -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-semibold">محصولات جدید</h3>
              <NuxtLink to="/university/products" class="text-sm text-primary-600 hover:underline">
                مشاهده همه
              </NuxtLink>
            </div>
          </template>
          <div v-if="loading" class="flex justify-center py-4">
            <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin" />
          </div>
          <div v-else-if="recentProducts.length === 0" class="text-center text-dimmed py-4">
            محصولی یافت نشد
          </div>
          <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <div v-for="product in recentProducts" :key="product.id" class="py-2 flex justify-between items-center">
              <div>
                <div class="font-medium text-sm">{{ product.title }}</div>
                <div class="text-xs text-dimmed">{{ product.companyName }}</div>
              </div>
              <div class="text-sm font-semibold text-primary-600">{{ formatPrice(product.finalPrice) }}</div>
            </div>
          </div>
        </UCard>

        <!-- Recent Orders -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-semibold">سفارشات اخیر</h3>
              <NuxtLink to="/university/orders" class="text-sm text-primary-600 hover:underline">
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
          <NuxtLink to="/university/growth-centers" class="p-4 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <UIcon name="i-lucide-trending-up" class="size-8 text-primary-600 mx-auto" />
            <div class="text-sm mt-2">مدیریت مراکز رشد</div>
          </NuxtLink>
          <NuxtLink to="/university/growth-center-users" class="p-4 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <UIcon name="i-lucide-users" class="size-8 text-primary-600 mx-auto" />
            <div class="text-sm mt-2">کاربران مراکز رشد</div>
          </NuxtLink>
          <NuxtLink to="/university/companies" class="p-4 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <UIcon name="i-lucide-building" class="size-8 text-primary-600 mx-auto" />
            <div class="text-sm mt-2">مشاهده شرکت‌ها</div>
          </NuxtLink>
          <NuxtLink to="/university/products" class="p-4 text-center border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <UIcon name="i-lucide-box" class="size-8 text-primary-600 mx-auto" />
            <div class="text-sm mt-2">مشاهده محصولات</div>
          </NuxtLink>
        </div>
      </UCard>
    </div>
  </ClientOnly>
</template>
