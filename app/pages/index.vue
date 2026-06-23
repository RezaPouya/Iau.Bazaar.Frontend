<script setup lang="ts">
import type { Product, ProductCategory } from '~/types/product'

// دریافت دسته‌بندی‌ها
const { data: categories, pending: categoriesPending } = await useFetch<ProductCategory[]>('/api/public/categories', {
  default: () => [],
  key: 'home-categories'
})

// دریافت محصولات ویژه
const { data: featuredProducts, pending: featuredPending } = await useFetch<GridDataSourceResult<Product>>('/api/public/products/featured', {
  default: () => ({ data: [] }),
  key: 'home-featured'
})

// دریافت محصولات جدید
const { data: newProducts, pending: newPending } = await useFetch<GridDataSourceResult<Product>>('/api/public/products/list', {
  method: 'POST',
  body: {
    page: 1,
    pageSize: 12,
    inputParams: {
      sort: { propertyName: 'createdAt', ascending: false }
    }
  },
  default: () => ({ data: [] }),
  key: 'home-new'
})
</script>

<template>
  <div class="space-y-10">
    <!-- اسلایدر (موقتاً با یک کاروسل ساده) -->
    <UCarousel
      v-slot="{ item }"
      :items="[
        { image: '/images/slide1.jpg', title: 'تخفیف ویژه', subtitle: 'تا ۵۰٪' },
        { image: '/images/slide2.jpg', title: 'محصولات جدید', subtitle: 'به روزترین محصولات' }
      ]"
      class="rounded-xl overflow-hidden"
    >
      <div class="relative aspect-[21/9] w-full bg-gradient-to-r from-primary-600 to-primary-400 flex items-center justify-center text-white text-center">
        <div>
          <h2 class="text-3xl md:text-5xl font-bold">{{ item.title }}</h2>
          <p class="text-lg mt-2">{{ item.subtitle }}</p>
        </div>
      </div>
    </UCarousel>

    <!-- دسته‌بندی‌ها -->
    <section>
      <h2 class="text-2xl font-bold mb-4">دسته‌بندی‌های محبوب</h2>
      <div v-if="categoriesPending" class="flex gap-4 overflow-x-auto pb-2">
        <USkeleton v-for="i in 8" :key="i" class="w-20 h-20 rounded-full shrink-0" />
      </div>
      <div v-else class="flex flex-wrap gap-4 justify-center">
        <NuxtLink
          v-for="cat in categories.slice(0, 8)"
          :key="cat.id"
          :to="`/products?categoryId=${cat.id}`"
          class="w-24 text-center hover:scale-105 transition-transform"
        >
          <div class="w-20 h-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl">
            📦
          </div>
          <span class="text-sm mt-1 block">{{ cat.name }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- محصولات ویژه -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">محصولات ویژه</h2>
        <NuxtLink to="/products?hasDiscount=true" class="text-primary-600 hover:underline">مشاهده همه</NuxtLink>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCardSkeleton v-if="featuredPending" v-for="i in 8" :key="i" />
        <ProductCard v-else v-for="product in featuredProducts.data" :key="product.id" :product="product" />
      </div>
    </section>

    <!-- محصولات جدید -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">جدیدترین محصولات</h2>
        <NuxtLink to="/products" class="text-primary-600 hover:underline">مشاهده همه</NuxtLink>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCardSkeleton v-if="newPending" v-for="i in 8" :key="i" />
        <ProductCard v-else v-for="product in newProducts.data" :key="product.id" :product="product" />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* استایل‌های سفارشی در صورت نیاز */
</style>
