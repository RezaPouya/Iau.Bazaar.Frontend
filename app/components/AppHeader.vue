<script setup lang="ts">
import type { CartDto } from '~/types/cart'

const auth = useAuthStore()
const { logout } = useLogout()
const colorMode = useColorMode()
const router = useRouter()

// دریافت تعداد آیتم‌های سبد خرید (فقط در صورت احراز هویت)
const { data: cart, refresh } = await useFetch<CartDto>('/api/cart', {
  key: 'cart-badge',
  default: () => ({ items: [] }),
  immediate: auth.isAuthenticated,
  watch: [auth.isAuthenticated]
})

const cartCount = computed(() => cart.value?.items?.length || 0)

// منوی کاربری
const userMenuItems = computed(() => [
  [
    { label: 'پروفایل', icon: 'i-lucide-user', to: '/profile' },
    { label: 'سفارشات من', icon: 'i-lucide-shopping-bag', to: '/orders' },
    { label: 'سبد خرید', icon: 'i-lucide-shopping-cart', to: '/cart' },
  ],
  [
    { label: 'خروج', icon: 'i-lucide-log-out', onSelect: logout },
  ],
])

// تغییر تم
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// برای نمایش/عدم نمایش منوی موبایل
const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// پس از تغییر مسیر، منوی موبایل را ببند
watch(() => router.currentRoute.value.path, () => {
  isMobileMenuOpen.value = false
})

// در صورت تغییر وضعیت احراز هویت، سبد خرید را به‌روز کن
watch(() => auth.isAuthenticated, (isAuth) => {
  if (isAuth) {
    refresh()
  }
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <!-- لوگو -->
      <NuxtLink to="/" class="text-2xl font-bold text-primary-600 dark:text-primary-400 shrink-0">
        بازار دانشگاه
      </NuxtLink>

      <!-- نوار جستجو (دسکتاپ) -->
      <SearchBar class="flex-1 hidden md:block" />

      <!-- دکمه منوی موبایل -->
      <UButton color="neutral" variant="ghost" class="md:hidden" @click="toggleMobileMenu">
        <UIcon name="i-lucide-menu" class="size-6" />
      </UButton>

      <!-- بخش سمت راست (دسکتاپ) -->
      <div class="hidden md:flex items-center gap-2">
        <!-- دسته‌بندی‌ها -->
        <CategoryMenu class="hidden lg:block" />

        <!-- تغییر تم -->
        <UButton color="neutral" variant="ghost" @click="toggleTheme">
          <UIcon :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'" class="size-5" />
        </UButton>

        <!-- سبد خرید -->
        <UButton color="neutral" variant="ghost" to="/cart" class="relative">
          <UIcon name="i-lucide-shopping-cart" class="size-5" />
          <UBadge
            v-if="cartCount > 0"
            class="absolute -top-2 -right-2 text-xs"
            color="primary"
            size="xs"
            rounded
          >
            {{ cartCount }}
          </UBadge>
        </UButton>

        <!-- ورود / پروفایل -->
        <template v-if="!auth.isAuthenticated">
          <UButton to="/account/login" color="primary" variant="outline" size="sm">
            ورود
          </UButton>
          <UButton to="/account/register" color="primary" size="sm">
            ثبت‌نام
          </UButton>
        </template>
        <template v-else>
          <UDropdownMenu :items="userMenuItems" :content="{ align: 'end' }">
            <UButton color="neutral" variant="ghost" class="flex items-center gap-2">
              <UAvatar :alt="auth.user?.fullName || auth.user?.userName" size="sm" />
              <span class="hidden sm:inline text-sm max-w-[100px] truncate">
                {{ auth.user?.fullName || auth.user?.userName }}
              </span>
            </UButton>
          </UDropdownMenu>
        </template>
      </div>
    </div>

    <!-- نوار جستجو در موبایل (زیر هدر) -->
    <div class="px-4 pb-3 md:hidden">
      <SearchBar />
    </div>

    <!-- منوی موبایل (اسلاید از راست) -->
    <USlideover v-model:open="isMobileMenuOpen" title="منو" class="md:hidden">
      <template #body>
        <div class="flex flex-col space-y-4 mt-4">
          <!-- لینک‌های اصلی -->
          <NuxtLink to="/" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" @click="isMobileMenuOpen = false">
            <UIcon name="i-lucide-home" class="size-5" />
            <span>خانه</span>
          </NuxtLink>
          <NuxtLink to="/products" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" @click="isMobileMenuOpen = false">
            <UIcon name="i-lucide-package" class="size-5" />
            <span>محصولات</span>
          </NuxtLink>
          <NuxtLink to="/categories" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" @click="isMobileMenuOpen = false">
            <UIcon name="i-lucide-tags" class="size-5" />
            <span>دسته‌بندی‌ها</span>
          </NuxtLink>
          <NuxtLink to="/cart" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" @click="isMobileMenuOpen = false">
            <UIcon name="i-lucide-shopping-cart" class="size-5" />
            <span>سبد خرید</span>
            <UBadge v-if="cartCount > 0" color="primary" size="xs" rounded>{{ cartCount }}</UBadge>
          </NuxtLink>

          <hr class="border-gray-200 dark:border-gray-700" />

          <!-- بخش کاربر -->
          <template v-if="!auth.isAuthenticated">
            <NuxtLink to="/account/login" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" @click="isMobileMenuOpen = false">
              <UIcon name="i-lucide-log-in" class="size-5" />
              <span>ورود</span>
            </NuxtLink>
            <NuxtLink to="/account/register" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" @click="isMobileMenuOpen = false">
              <UIcon name="i-lucide-user-plus" class="size-5" />
              <span>ثبت‌نام</span>
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/profile" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" @click="isMobileMenuOpen = false">
              <UIcon name="i-lucide-user" class="size-5" />
              <span>پروفایل</span>
            </NuxtLink>
            <button @click="logout" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-right">
              <UIcon name="i-lucide-log-out" class="size-5" />
              <span>خروج</span>
            </button>
          </template>

          <hr class="border-gray-200 dark:border-gray-700" />

          <!-- تغییر تم در موبایل -->
          <button @click="toggleTheme" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-right">
            <UIcon :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'" class="size-5" />
            <span>{{ colorMode.value === 'dark' ? 'حالت روشن' : 'حالت تاریک' }}</span>
          </button>
        </div>
      </template>
    </USlideover>
  </header>
</template>

<style scoped>
/* برای نمایش صحیح Badge روی آیکون سبد خرید */
.relative .ubadge {
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.25rem;
}
</style>
