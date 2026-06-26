<script setup lang="ts">
import type { Product, ProductCategory } from '~/types/product'
import { useProductService } from '~/services/product.service'

const route = useRoute()
const router = useRouter()
const { getProductsList, getCategories } = useProductService()

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
const { data: categories } = await useAsyncData<ProductCategory[]>(
  'filter-categories',
  () => getCategories(),
  { default: () => [] }
)

// تابع بارگذاری محصولات
const loadProducts = async () => {
  loading.value = true
  try {
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

    // نکته مهم: این فیلدها باید سطح بالا (top-level) ارسال شوند، نه داخل
    // inputParams.filters. زیرا ProductCoreService.GetProductsAsync سمت بک‌اند
    // مستقیماً همین Property های strongly-typed را از روی ProductListFilterDto می‌خواند.
    // نسخه‌ی قبلی این فیلدها را به شکل یک آرایه‌ی فیلتر عمومی ارسال می‌کرد که اصلاً
    // توسط بک‌اند خوانده نمی‌شد؛ یعنی جستجو/دسته‌بندی/قیمت/تخفیف/موجودی هیچ اثری
    // روی نتیجه نداشتند (فقط مرتب‌سازی کار می‌کرد).
    const result = await getProductsList({
      page: currentPage.value,
      pageSize: pageSize.value,
      searchTerm: searchQuery.value.trim() || null,
      categoryId: selectedCategoryId.value,
      minPrice: minPrice.value,
      maxPrice: maxPrice.value,
      hasDiscount: hasDiscount.value || null,
      inStock: inStock.value || null,
      inputParams: { filters: [], sort }
    })

    products.value = result.data
    totals.value = result.totals
    currentPage.value = result.page
    pageSize.value = result.pageSize
  } catch (error) {
    console.error('خطا در بارگذاری محصولات:', error)
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
  const query: Record<string, string> = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (selectedCategoryId.value) query.categoryId = String(selectedCategoryId.value)
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

useHead({ title: 'محصولات' })
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <!-- فیلترهای جانبی -->
    <aside class="md:col-span-1 space-y-4">
      <UCard class="sticky top-24">
        <h3 class="font-bold mb-3 flex items-center gap-2">
          <UIcon name="i-lucide-sliders-horizontal" class="size-4" />
          فیلترها
        </h3>

        <UFormField label="جستجو" class="mb-3">
          <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="نام محصول..." @keyup.enter="applyFilters" />
        </UFormField>

        <UFormField label="دسته‌بندی" class="mb-3">
          <USelect
            v-model="selectedCategoryId"
            :items="[{ label: 'همه', value: null }, ...categories.map(c => ({ label: c.name, value: c.id }))]"
          />
        </UFormField>

        <UFormField label="محدوده قیمت (تومان)" class="mb-3">
          <div class="flex gap-2">
            <UInput v-model.number="minPrice" type="number" placeholder="از" class="w-1/2" />
            <UInput v-model.number="maxPrice" type="number" placeholder="تا" class="w-1/2" />
          </div>
        </UFormField>

        <div class="flex items-center justify-between mb-2">
          <span class="text-sm">فقط تخفیف‌دار</span>
          <USwitch v-model="hasDiscount" />
        </div>

        <div class="flex items-center justify-between mb-3">
          <span class="text-sm">فقط موجود</span>
          <USwitch v-model="inStock" />
        </div>

        <div class="flex gap-2">
          <UButton size="sm" block @click="applyFilters">اعمال فیلتر</UButton>
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
      <div v-else-if="products.length === 0" class="text-center py-16 text-dimmed border border-dashed rounded-xl">
        <UIcon name="i-lucide-package-open" class="size-12 mx-auto" />
        <p class="mt-2">محصولی با این فیلترها یافت نشد</p>
        <UButton size="sm" variant="ghost" class="mt-2" @click="resetFilters">پاک کردن فیلترها</UButton>
      </div>
      <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>

      <!-- صفحه‌بندی -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <UPagination v-model="currentPage" :page-count="pageSize" :total="totals" @update:model-value="setPage" />
      </div>
    </section>
  </div>
</template>
