<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{
  product: Product
}>()

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}
</script>

<template>
  <NuxtLink :to="`/products/${product.id}`" class="block group">
    <UCard class="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-900">
      <div class="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg">
        <NuxtImg
          :src="product.images?.[0]?.url || '/images/placeholder.png'"
          :alt="product.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <UBadge v-if="product.discountPercent && product.discountPercent > 0" color="error" class="absolute top-2 right-2">
          تخفیف {{ product.discountPercent }}%
        </UBadge>
        <UBadge v-if="product.inventoryCount <= 0" color="neutral" class="absolute bottom-2 left-2">
          ناموجود
        </UBadge>
      </div>
      <div class="p-3 space-y-1">
        <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {{ product.title }}
        </h3>
        <div class="flex items-center justify-between mt-1">
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
              {{ formatPrice(product.finalPrice) }}
            </span>
            <span v-if="product.discountPercent && product.discountPercent > 0" class="text-xs text-gray-400 line-through">
              {{ formatPrice(product.price) }}
            </span>
          </div>
          <div class="flex items-center gap-1 text-yellow-500">
            <UIcon name="i-lucide-star" class="size-4" />
            <span class="text-sm font-medium">{{ product.averageRating?.toFixed(1) || '۰' }}</span>
          </div>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
