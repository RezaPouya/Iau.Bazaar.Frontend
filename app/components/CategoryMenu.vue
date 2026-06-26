<script setup lang="ts">
import { useProductService } from '~/services/product.service'

// نکته: نسخه قبلی این کامپوننت با useFetch('/api/public/categories') داده می‌گرفت.
// چون این مسیر نسبی است و از axios instance ($api) که baseURL واقعی بک‌اند را دارد
// عبور نمی‌کند، عملاً هیچ‌وقت داده‌ی واقعی برنمی‌گشت (درخواست به خود سرور Nuxt می‌رفت
// و چنین مسیری در آن وجود ندارد). به همین دلیل منوی دسته‌بندی همیشه خالی بود.
const { getCategories } = useProductService()

const { data: categories, pending } = await useAsyncData(
  'categories-menu',
  () => getCategories(),
  { default: () => [] }
)

const isOpen = ref(false)
</script>

<template>
  <div class="relative" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
    <UButton color="neutral" variant="ghost" class="gap-1">
      <UIcon name="i-lucide-menu" class="size-5" />
      <span>دسته‌بندی‌ها</span>
      <UIcon name="i-lucide-chevron-down" class="size-4 transition-transform" :class="isOpen ? 'rotate-180' : ''" />
    </UButton>

    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 p-2 max-h-96 overflow-y-auto"
      >
        <div v-if="pending" class="p-4 text-center text-dimmed text-sm">در حال بارگذاری...</div>
        <div v-else-if="categories.length === 0" class="p-4 text-center text-dimmed text-sm">
          دسته‌بندی‌ای ثبت نشده است
        </div>
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/products?categoryId=${cat.id}`"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          @click="isOpen = false"
        >
          <UIcon name="i-lucide-tag" class="size-4 opacity-60" />
          {{ cat.name }}
        </NuxtLink>
      </div>
    </Transition>
  </div>
</template>


