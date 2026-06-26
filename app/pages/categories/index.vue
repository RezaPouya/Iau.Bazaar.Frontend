<script setup lang="ts">
import { useProductService } from '~/services/product.service'

// نکته: نسخه قبلی این صفحه با useFetch('/api/public/categories') کار می‌کرد که
// به سرور واقعی بک‌اند نمی‌رسید (به همین دلیل صفحه همیشه خالی/در حال بارگذاری بود).
const { getCategories } = useProductService()

const { data: categories, pending } = await useAsyncData(
  'all-categories',
  () => getCategories(),
  { default: () => [] }
)

useHead({ title: 'دسته‌بندی‌ها' })

// رنگ‌های متفاوت برای آیکون هر دسته‌بندی، فقط برای زیباتر شدن نمایش
const colorClasses = [
  'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400',
  'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
  'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
  'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400'
]
const colorFor = (index: number) => colorClasses[index % colorClasses.length]
</script>

<template>
  <div>
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold">دسته‌بندی محصولات</h1>
      <p class="text-dimmed mt-2">محصول مورد نظر خود را از بین دسته‌بندی‌های زیر پیدا کنید</p>
    </div>

    <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <USkeleton v-for="i in 8" :key="i" class="h-36 rounded-xl" />
    </div>

    <div v-else-if="categories.length === 0" class="text-center py-16 text-dimmed">
      <UIcon name="i-lucide-folder-open" class="size-12 mx-auto" />
      <p class="mt-2">هنوز هیچ دسته‌بندی‌ای ثبت نشده است</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <NuxtLink
        v-for="(cat, index) in categories"
        :key="cat.id"
        :to="`/products?categoryId=${cat.id}`"
        class="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      >
        <div
          class="size-16 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl transition-colors"
          :class="colorFor(index)"
        >
          <UIcon name="i-lucide-package" class="size-7" />
        </div>
        <span class="font-medium block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {{ cat.name }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>
