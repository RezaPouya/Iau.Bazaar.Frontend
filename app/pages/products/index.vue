<script setup lang="ts">
import type { Product, ProductCategory } from '~/types/product'
import { GridFilterOperation, type GridPropertyFilter } from '~/types/grid'

const route = useRoute()
const router = useRouter()

// State
const products = ref<Product[]>([])
const totals = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const loading = ref(false)

// فیلترها
const searchQuery = ref(route.query.q as string || '')
const selectedCategoryId = ref<number | null>(route.query.categoryId ? Number(route.query.categoryId) : null)
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const hasDiscount = ref(route.query.hasDiscount === 'true')
const inStock = ref(false)
const sortBy = ref<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest')

// دریافت دسته‌بندی‌ها برای فیلتر
const { data: categories } = await useFetch<ProductCategory[]>('/api/public/categories', {
  default: () => [],
  key: 'filter-categories'
})

// تابع بارگذاری محصولات
const loadProducts = async () => {
  loading.value = true
  try {
    const filters: GridPropertyFilter[] = []

    if (searchQuery.value.trim()) {
      filters.push({
        propertyName: 'title',
        operation: GridFilterOperation.Contains,
        value: searchQuery.value.trim()
      })
    }

    if (selectedCategoryId.value) {
      filters.push({
        propertyName: 'categoryId',
        operation: GridFilterOperation.Equals,
        value: String(selectedCategoryId.value)
      })
    }

    if (minPrice.value !== null) {
      filters.push({
        propertyName: 'minPrice',
        operation: GridFilterOperation.GreaterThanOrEqual,
        value: String(minPrice.value)
      })
    }
    if (maxPrice.value !== null) {
      filters.push({
        propertyName: 'maxPrice',
        operation: GridFilterOperation.LessThanOrEqual,
        value: String(maxPrice.value)
      })
    }

    if (hasDiscount.value) {
      filters.push({
        propertyName: 'hasDiscount',
        operation: GridFilterOperation.BooleanEquals,
        value: 'true'
      })
    }

    if (inStock.value) {
      filters.push({
        propertyName: 'inStock',
        operation: GridFilterOperation.BooleanEquals,
        value: 'true'
      })
    }

    // مرتب‌سازی
    let sort = null
    switch (sortBy.value) {
      case 'newest':
        sort = { propertyName: 'createdAt', ascending: false }
        break
      case 'price-asc':
        sort = { propertyName: 'finalPrice', ascending: true }
        break
      case 'price-desc':
        sort = { propertyName: 'finalPrice', ascending: false }
        break
      case 'popular':
        sort = { propertyName: 'soldCount', ascending: false }
        break
    }

    const response = await $fetch('/api/public/products/list', {
      method: 'POST',
      body: {
        page: currentPage.value,
        pageSize: pageSize.value,
        inputParams: {
          filters,
          sort
        }
      }
    })

    const result = response.data as GridDataSourceResult<Product>
    products.value = result.data
    totals.value = result.totals
    currentPage.value = result.page
    pageSize.value = result.pageSize
  } catch (error) {
    console.error('Error loading products:', error)
  } finally {
    loading.value = false
  }
}

// تغییر صفحه
const setPage = (page: number) => {
  currentPage.value = page
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// اعمال فیلترها
const applyFilters = () => {
  currentPage.value = 1
  // به‌روزرسانی Query String (اختیاری)
  const query: any = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (selectedCategoryId.value) query.categoryId = selectedCategoryId.value
  if (hasDiscount.value) query.hasDiscount = 'true'
  router.push({ query })
  loadProducts()
}

// ریست فیلترها
const resetFilters = () => {
  searchQuery.value = ''
  selectedCategoryId.value = null
  minPrice.value = null
  maxPrice.value = null
  hasDiscount.value = false
  inStock.value = false
  sortBy.value = 'newest'
  currentPage.value = 1
  router.push({ query: {} })
  loadProducts()
}

// بارگذاری اولیه
onMounted(() => {
  loadProducts()
})

// محاسبه تعداد صفحات
const totalPages = computed(() => Math.ceil(totals.value / pageSize.value))
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <!-- فیلترهای جانبی -->
    <aside class="md:col-span-1 space-y-4">
      <UCard class="sticky top-24">
        <h3 class="font-bold mb-3">فیلترها</h3>

        <UFormField label="جستجو" class="mb-3">
          <UInput v-model="searchQuery" placeholder="جستجو..." @keyup.enter="applyFilters" />
        </UFormField>

        <UFormField label="دسته‌بندی" class="mb-3">
          <USelect
            v-model="selectedCategoryId"
            :items="[{ label: 'همه', value: null }, ...categories.map(c => ({ label: c.name, value: c.id }))]"
          />
        </UFormField>

        <UFormField label="محدوده قیمت" class="mb-3">
          <div class="flex gap-2">
            <UInput v-model.number="minPrice" type="number" placeholder="از" class="w-1/2" />
            <UInput v-model.number="maxPrice" type="number" placeholder="تا" class="w-1/2" />
          </div>
        </UFormField>

        <UFormField label="تخفیف‌دار" class="mb-2">
          <USwitch v-model="hasDiscount" />
        </UFormField>

        <UFormField label="فقط موجود" class="mb-3">
          <USwitch v-model="inStock" />
        </UFormField>

        <div class="flex gap-2">
          <UButton size="sm" @click="applyFilters">اعمال</UButton>
          <UButton size="sm" color="neutral" variant="ghost" @click="resetFilters">پاک کردن</UButton>
        </div>
      </UCard>
    </aside>

    <!-- لیست محصولات -->
    <section class="md:col-span-3">
      <div class="flex justify-between items-center mb-4">
        <span class="text-sm text-dimmed">{{ totals }} محصول</span>
        <USelect
          v-model="sortBy"
          :items="[
            { label: 'جدیدترین', value: 'newest' },
            { label: 'ارزان‌ترین', value: 'price-asc' },
            { label: 'گران‌ترین', value: 'price-desc' },
            { label: 'پرفروش‌ترین', value: 'popular' }
          ]"
          size="sm"
          class="w-40"
          @update:model-value="loadProducts"
        />
      </div>

      <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <ProductCardSkeleton v-for="i in pageSize" :key="i" />
      </div>
      <div v-else-if="products.length === 0" class="text-center py-10 text-dimmed">
        <UIcon name="i-lucide-package-open" class="size-12 mx-auto" />
        <p class="mt-2">محصولی یافت نشد</p>
      </div>
      <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>

      <!-- صفحه‌بندی -->
      <div v-if="totalPages > 1" class="flex justify-center mt-6">
        <UPagination v-model="currentPage" :page-count="pageSize" :total="totals" @update:model-value="setPage" />
      </div>
    </section>
  </div>
</template>
