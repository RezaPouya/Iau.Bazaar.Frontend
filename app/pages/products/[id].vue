<script setup lang="ts">
import { useProductService } from '~/services/product.service'
import { useCartService } from '~/services/cart.service'

const route = useRoute()
const productId = Number(route.params.id)
const { getProductById } = useProductService()
const { addToCart } = useCartService()
const { isAuthenticated } = useAuth()
const toast = useAppToast()

// نکته: نسخه قبلی این صفحه با useFetch('/api/public/products/...') داده می‌گرفت
// که هیچ‌وقت به بک‌اند واقعی نمی‌رسید. الان از طریق productService ($api) می‌گیریم.
const { data: product, pending, error } = await useAsyncData(
  `product-${productId}`,
  () => getProductById(productId)
)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'محصول یافت نشد', fatal: true })
}

useHead({ title: product.value?.title || 'محصول' })

const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price) + ' تومان'

const selectedImage = ref<string>('')
const mainImage = computed(() => selectedImage.value || product.value?.images?.[0]?.url || '/images/placeholder.png')

const quantity = ref(1)
const addingToCart = ref(false)

const handleAddToCart = async () => {
  if (!product.value) return

  if (!isAuthenticated.value) {
    toast.info('برای افزودن به سبد خرید ابتدا وارد شوید')
    await navigateTo(`/account/login?redirect=/products/${productId}`)
    return
  }

  addingToCart.value = true
  try {
    await addToCart(product.value.id, quantity.value)
    toast.success('به سبد خرید اضافه شد', product.value.title)
  } catch (err: any) {
    toast.error('خطا', err?.response?.data?.message || 'افزودن به سبد خرید با خطا مواجه شد')
  } finally {
    addingToCart.value = false
  }
}

const discountValidNow = computed(() => {
  if (!product.value?.discountPercent) return false
  const now = new Date()
  if (product.value.discountStartDate && new Date(product.value.discountStartDate) > now) return false
  if (product.value.discountEndDate && new Date(product.value.discountEndDate) < now) return false
  return true
})
</script>

<template>
  <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
    <USkeleton class="aspect-square rounded-xl" />
    <div class="space-y-4">
      <USkeleton class="h-8 w-3/4" />
      <USkeleton class="h-4 w-1/3" />
      <USkeleton class="h-28 rounded-xl" />
      <USkeleton class="h-10 w-full" />
    </div>
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
          class="w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all shrink-0"
          :class="(selectedImage || product.images[0]?.url) === img.url ? 'border-primary-600' : 'border-transparent hover:border-gray-300'"
          @click="selectedImage = img.url"
        >
      </div>
    </div>

    <!-- اطلاعات -->
    <div class="space-y-4">
      <div>
        <div v-if="product.categoryNames?.length" class="flex flex-wrap gap-2 mb-2">
          <UBadge v-for="cat in product.categoryNames" :key="cat" color="neutral" variant="subtle" size="sm">
            {{ cat }}
          </UBadge>
        </div>
        <h1 class="text-2xl font-bold">{{ product.title }}</h1>
        <p class="text-sm text-dimmed mt-1">فروشنده: {{ product.companyName }}</p>
      </div>

      <div class="flex items-center gap-2 text-yellow-500">
        <UIcon name="i-lucide-star" class="size-5 fill-current" />
        <span class="font-semibold">{{ product.averageRating?.toFixed(1) || '۰' }}</span>
        <span class="text-sm text-dimmed">({{ product.totalPurchases }} خرید موفق)</span>
      </div>

      <p v-if="product.shortDescription" class="text-gray-600 dark:text-gray-300">
        {{ product.shortDescription }}
      </p>

      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-2">
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-primary-600">{{ formatPrice(product.finalPrice) }}</span>
          <span v-if="discountValidNow" class="text-sm text-gray-400 line-through">{{ formatPrice(product.price) }}</span>
          <UBadge v-if="discountValidNow" color="error" size="sm">{{ product.discountPercent }}٪ تخفیف</UBadge>
        </div>
        <div class="text-sm">
          موجودی:
          <span :class="product.inventoryCount > 0 ? 'text-success' : 'text-error'">
            {{ product.inventoryCount > 0 ? `${product.inventoryCount} ${product.enumerationUnitName || 'عدد'}` : 'ناموجود' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UInputNumber v-model="quantity" :min="1" :max="Math.max(product.inventoryCount, 1)" :disabled="product.inventoryCount <= 0" class="w-28" />
        <UButton color="primary" size="lg" class="flex-1" :loading="addingToCart" :disabled="product.inventoryCount <= 0" @click="handleAddToCart">
          <UIcon name="i-lucide-shopping-cart" class="ml-2" />
          {{ product.inventoryCount > 0 ? 'افزودن به سبد خرید' : 'ناموجود' }}
        </UButton>
      </div>

      <div v-if="product.description" class="prose dark:prose-invert max-w-none pt-2 border-t border-gray-100 dark:border-gray-800">
        <h3 class="font-bold mt-4 text-base">توضیحات محصول</h3>
        <div v-html="product.description" />
      </div>
    </div>
  </div>
</template>
