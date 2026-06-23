<script setup lang="ts">
import type { Product } from '~/types/product'

const route = useRoute()
const productId = Number(route.params.id)

const { data: product, pending, error } = await useFetch<Product>(`/api/public/products/${productId}`, {
  key: `product-${productId}`
})

if (error.value) {
  throw createError({ statusCode: 404, message: 'محصول یافت نشد' })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

const selectedImage = ref<string>('')
const mainImage = computed(() => selectedImage.value || product.value?.images?.[0]?.url || '/images/placeholder.png')
</script>

<template>
  <div v-if="pending" class="flex justify-center py-12">
    <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin" />
  </div>
  <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- تصاویر -->
    <div class="space-y-4">
      <div class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
        <NuxtImg :src="mainImage" :alt="product.title" class="w-full h-full object-cover" />
      </div>
      <div v-if="product.images?.length > 1" class="flex gap-2 overflow-x-auto">
        <img
          v-for="img in product.images"
          :key="img.id"
          :src="img.url"
          :alt="product.title"
          class="w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all"
          :class="selectedImage === img.url ? 'border-primary-600' : 'border-transparent hover:border-gray-300'"
          @click="selectedImage = img.url"
        />
      </div>
    </div>

    <!-- اطلاعات -->
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">{{ product.title }}</h1>
      <div class="flex items-center gap-2 text-yellow-500">
        <UIcon name="i-lucide-star" class="size-5" />
        <span class="font-semibold">{{ product.averageRating?.toFixed(1) || '۰' }}</span>
        <span class="text-sm text-dimmed">({{ product.totalPurchases }} نظر)</span>
      </div>

      <div v-if="product.shortDescription" class="text-gray-600 dark:text-gray-300">
        {{ product.shortDescription }}
      </div>

      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-2">
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-primary-600">{{ formatPrice(product.finalPrice) }}</span>
          <span v-if="product.discountPercent" class="text-sm text-gray-400 line-through">{{ formatPrice(product.price) }}</span>
        </div>
        <div v-if="product.discountPercent" class="text-sm text-error">
          تخفیف {{ product.discountPercent }}% تا {{ product.discountEndDate }}
        </div>
        <div class="text-sm">
          موجودی: <span :class="product.inventoryCount > 0 ? 'text-success' : 'text-error'">
            {{ product.inventoryCount > 0 ? `${product.inventoryCount} عدد` : 'ناموجود' }}
          </span>
        </div>
      </div>

      <UButton color="primary" size="lg" block :disabled="product.inventoryCount <= 0">
        <UIcon name="i-lucide-shopping-cart" class="ml-2" />
        افزودن به سبد خرید
      </UButton>

      <div v-if="product.description" class="prose max-w-none">
        <h3 class="font-bold mt-4">توضیحات</h3>
        <div v-html="product.description" />
      </div>

      <div v-if="product.categoryNames?.length" class="flex flex-wrap gap-2">
        <UBadge v-for="cat in product.categoryNames" :key="cat" color="neutral" variant="subtle">
          {{ cat }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
