<script setup lang="ts">
import { useProductService } from '~/services/product.service'

// نکته مهم: نسخه قبلی این صفحه با useFetch('/api/public/...') داده می‌گرفت.
// این مسیر نسبی، نه baseURL واقعی بک‌اند (https://localhost:7139/api) را دارد و
// نه توکن احراز هویت را ست می‌کند؛ یعنی همیشه با سرور خود Nuxt مواجه می‌شد که
// چنین مسیری ندارد. به همین دلیل صفحه‌ی اصلی همیشه خالی به نظر می‌رسید.
// همه‌ی درخواست‌ها اینجا از طریق productService (که از $api استفاده می‌کند) انجام می‌شود.
const { getCategories, getFeaturedProducts, getProductsList } = useProductService()

const { data: categories, pending: categoriesPending } = await useAsyncData(
  'home-categories',
  () => getCategories(),
  { default: () => [] }
)

const { data: featuredProducts, pending: featuredPending } = await useAsyncData(
  'home-featured',
  () => getFeaturedProducts(),
  { default: () => ({ data: [], page: 1, pageSize: 12, totals: 0, totalPages: 0 }) }
)

const { data: newProducts, pending: newPending } = await useAsyncData(
  'home-new',
  () => getProductsList({
    page: 1,
    pageSize: 12,
    inputParams: { filters: [], sort: { propertyName: 'createdAt', ascending: false } }
  }),
  { default: () => ({ data: [], page: 1, pageSize: 12, totals: 0, totalPages: 0 }) }
)

useHead({ title: 'بازار دانشگاه' })
</script>

<template>
  <div class="space-y-12">
    <!-- اسلایدر -->
    <UCarousel
      v-slot="{ item }"
      :items="[
        { title: 'تخفیف ویژه دانشجویی', subtitle: 'تا ۵۰٪ تخفیف روی محصولات منتخب شرکت‌های مستقر در مراکز رشد', cta: 'مشاهده تخفیف‌ها', link: '/products?hasDiscount=true' },
        { title: 'از ایده تا بازار', subtitle: 'محصولات نوآورانه‌ی استارتاپ‌های دانشگاهی، مستقیم از مراکز رشد', cta: 'کاوش در محصولات', link: '/products' }
      ]"
      class="rounded-2xl overflow-hidden shadow-lg"
      arrows
      dots
    >
      <div class="relative aspect-[21/9] md:aspect-[3/1] w-full flex items-center overflow-hidden bg-gradient-to-l from-brand-800 via-brand-700 to-brand-500">
        <!-- نقش زینتی «رشد» — چند شکل ارگانیک محو در پس‌زمینه، الهام‌گرفته از مفهوم
             «مرکز رشد»، به‌جای یک گرادیان تخت و بی‌هویت -->
        <svg class="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 280 C 90 180, 60 120, 110 60 C 140 90, 130 140, 150 200" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" />
          <circle cx="112" cy="55" r="10" fill="white" />
          <path d="M700 290 C 660 200, 690 150, 650 90 C 625 120, 635 160, 615 210" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" />
          <circle cx="648" cy="86" r="9" fill="white" />
          <circle cx="780" cy="40" r="35" fill="white" opacity="0.5" />
          <circle cx="40" cy="30" r="22" fill="white" opacity="0.4" />
        </svg>

        <div class="relative z-10 text-white px-8 md:px-16 max-w-xl">
          <h2 class="text-2xl md:text-4xl font-extrabold">{{ item.title }}</h2>
          <p class="text-sm md:text-lg mt-3 opacity-90 leading-relaxed">{{ item.subtitle }}</p>
          <UButton :to="item.link" color="secondary" variant="solid" size="lg" class="mt-5 font-semibold">
            {{ item.cta }}
          </UButton>
        </div>
      </div>
    </UCarousel>

    <!-- دسته‌بندی‌ها -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl md:text-2xl font-bold">دسته‌بندی‌های محبوب</h2>
        <NuxtLink to="/categories" class="text-sm text-primary-600 hover:underline">همه دسته‌بندی‌ها</NuxtLink>
      </div>
      <div v-if="categoriesPending" class="flex gap-4 overflow-x-auto pb-2">
        <USkeleton v-for="i in 8" :key="i" class="w-20 h-20 rounded-full shrink-0" />
      </div>
      <div v-else-if="categories.length === 0" class="text-sm text-dimmed text-center py-4">
        دسته‌بندی‌ای برای نمایش وجود ندارد
      </div>
      <div v-else class="flex flex-wrap gap-4 justify-center">
        <NuxtLink
          v-for="cat in categories.slice(0, 8)"
          :key="cat.id"
          :to="`/products?categoryId=${cat.id}`"
          class="w-24 text-center group"
        >
          <div class="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/40 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 transition-all group-hover:scale-105">
            <UIcon name="i-lucide-package" class="size-7" />
          </div>
          <span class="text-sm mt-1 block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ cat.name }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- محصولات ویژه -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl md:text-2xl font-bold">محصولات ویژه</h2>
        <NuxtLink to="/products?hasDiscount=true" class="text-sm text-primary-600 hover:underline">مشاهده همه</NuxtLink>
      </div>
      <div v-if="featuredPending" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCardSkeleton v-for="i in 8" :key="i" />
      </div>
      <div v-else-if="featuredProducts.data.length === 0" class="text-sm text-dimmed text-center py-8 border border-dashed rounded-xl">
        فعلاً محصول تخفیف‌داری برای نمایش وجود ندارد
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCard v-for="product in featuredProducts.data" :key="product.id" :product="product" />
      </div>
    </section>

    <!-- محصولات جدید -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl md:text-2xl font-bold">جدیدترین محصولات</h2>
        <NuxtLink to="/products" class="text-sm text-primary-600 hover:underline">مشاهده همه</NuxtLink>
      </div>
      <div v-if="newPending" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCardSkeleton v-for="i in 8" :key="i" />
      </div>
      <div v-else-if="newProducts.data.length === 0" class="text-sm text-dimmed text-center py-8 border border-dashed rounded-xl">
        هنوز محصولی ثبت نشده است
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCard v-for="product in newProducts.data" :key="product.id" :product="product" />
      </div>
    </section>
  </div>
</template>
