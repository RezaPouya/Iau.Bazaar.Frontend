<!-- app/components/admin/product/ProductViewModal.vue -->
<script setup lang="ts">
import type { Product } from '~/types/product'
import ProductStatusBadge from './ProductStatusBadge.vue'

const props = defineProps<{
  open: boolean
  product: Product | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

const closeModal = () => {
  emit('update:open', false)
}
</script>

<template>
  <UModal :open="open" title="جزئیات محصول" class="max-w-4xl" @update:open="closeModal">
    <template #body>
      <div v-if="product" class="space-y-4">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-dimmed">شناسه</div>
            <div class="font-medium">{{ product.id }}</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">نام محصول</div>
            <div class="font-medium">{{ product.title }}</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">slug</div>
            <div class="font-medium text-sm">{{ product.slug }}</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">SKU</div>
            <div class="font-medium">{{ product.sku }}</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">شرکت</div>
            <div class="font-medium">{{ product.companyName }}</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">واحد شمارش</div>
            <div class="font-medium">{{ product.enumerationUnitName }}</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">قیمت پایه</div>
            <div class="font-medium">{{ formatPrice(product.price) }}</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">مالیات (%)</div>
            <div class="font-medium">{{ product.vat }}%</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">قیمت نهایی</div>
            <div class="font-medium text-primary-600">{{ formatPrice(product.finalPrice) }}</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">تخفیف</div>
            <div class="font-medium">{{ product.discountPercent || 0 }}%</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">موجودی</div>
            <div class="font-medium">{{ product.inventoryCount }}</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">تعداد فروش</div>
            <div class="font-medium">{{ product.soldCount }}</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">وزن (گرم)</div>
            <div class="font-medium">{{ product.weightInGrams || '—' }}</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">امتیاز متوسط</div>
            <div class="font-medium">{{ product.averageRating || 0 }} / 5</div>
          </div>
          <div>
            <div class="text-sm text-dimmed">وضعیت تایید</div>
            <div>
              <ProductStatusBadge type="approval" :value="product.approvalStatus" />
            </div>
          </div>
          <div>
            <div class="text-sm text-dimmed">وضعیت انتشار</div>
            <div>
              <ProductStatusBadge type="state" :value="product.state" />
            </div>
          </div>
          <div>
            <div class="text-sm text-dimmed">تاریخ ایجاد</div>
            <div class="font-medium">{{ product.createdAtPersian }}</div>
          </div>
        </div>

        <!-- Categories -->
        <div v-if="product.categoryNames?.length">
          <div class="text-sm text-dimmed mb-1">دسته‌بندی‌ها</div>
          <div class="flex flex-wrap gap-1">
            <UBadge v-for="cat in product.categoryNames" :key="cat" color="neutral" variant="subtle" size="sm">
              {{ cat }}
            </UBadge>
          </div>
        </div>

        <!-- Short Description -->
        <div v-if="product.shortDescription">
          <div class="text-sm text-dimmed mb-1">توضیح کوتاه</div>
          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
            {{ product.shortDescription }}
          </div>
        </div>

        <!-- Full Description -->
        <div v-if="product.description">
          <div class="text-sm text-dimmed mb-1">توضیحات کامل</div>
          <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg prose prose-sm max-w-none" v-html="product.description" />
        </div>

        <!-- Images -->
        <div v-if="product.images?.length">
          <div class="text-sm text-dimmed mb-1">تصاویر محصول</div>
          <div class="flex flex-wrap gap-2">
            <div v-for="img in product.images" :key="img.id" class="relative w-20 h-20 rounded-lg overflow-hidden border">
              <img :src="img.url" :alt="img.altText || product.title" class="w-full h-full object-cover" />
              <div v-if="img.isPrimary" class="absolute top-0 right-0">
                <UBadge size="xs" color="primary" class="rounded-tl-none rounded-br-none">اصلی</UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <UButton color="neutral" variant="ghost" @click="closeModal">بستن</UButton>
    </template>
  </UModal>
</template>

<style scoped>
.prose {
  max-width: none;
}
.prose img {
  max-width: 100%;
  height: auto;
}
</style>
