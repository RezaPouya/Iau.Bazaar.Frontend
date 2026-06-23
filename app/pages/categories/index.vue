<script setup lang="ts">
import type { ProductCategory } from '~/types/product'

const { data: categories, pending } = await useFetch<ProductCategory[]>('/api/public/categories', {
  default: () => [],
  key: 'all-categories'
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">دسته‌بندی‌ها</h1>
    <div v-if="pending" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <USkeleton v-for="i in 8" :key="i" class="h-32 rounded-lg" />
    </div>
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <NuxtLink
        v-for="cat in categories"
        :key="cat.id"
        :to="`/products?categoryId=${cat.id}`"
        class="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg text-center hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
      >
        <div class="text-4xl mb-2">📁</div>
        <span class="font-medium">{{ cat.name }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
