<script setup lang="ts">
import type { ProductCategory } from '~/types/product'

const { data: categories, pending } = await useFetch<ProductCategory[]>('/api/public/categories', {
  default: () => [],
  key: 'categories-menu'
})

const isOpen = ref(false)
</script>

<template>
  <div class="relative" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
    <UButton color="neutral" variant="ghost" class="gap-1">
      <UIcon name="i-lucide-menu" class="size-5" />
      <span>دسته‌بندی‌ها</span>
      <UIcon name="i-lucide-chevron-down" class="size-4" />
    </UButton>

    <div
      v-if="isOpen"
      class="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-2"
    >
      <div v-if="pending" class="p-4 text-center text-dimmed">در حال بارگذاری...</div>
      <NuxtLink
        v-for="cat in categories"
        :key="cat.id"
        :to="`/products?categoryId=${cat.id}`"
        class="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        @click="isOpen = false"
      >
        {{ cat.name }}
      </NuxtLink>
    </div>
  </div>
</template>
