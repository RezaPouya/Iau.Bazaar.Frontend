<script setup lang="ts">
const auth = useAuthStore()
const { logout } = useLogout()
const colorMode = useColorMode()

const userMenuItems = computed(() => [
  [
    { label: 'پروفایل', icon: 'i-lucide-user', to: '/profile' },
    { label: 'سفارشات', icon: 'i-lucide-shopping-bag', to: '/orders' },
  ],
  [
    { label: 'خروج', icon: 'i-lucide-log-out', onSelect: logout },
  ],
])

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
      <!-- لوگو -->
      <NuxtLink to="/" class="text-2xl font-bold text-primary-600 dark:text-primary-400 shrink-0">
        بازار دانشگاه
      </NuxtLink>

      <!-- جستجو -->
      <SearchBar class="flex-1 hidden md:block" />

      <!-- دسته‌بندی‌ها (دسکتاپ) -->
      <CategoryMenu class="hidden lg:block" />

      <!-- عملیات کاربر -->
      <div class="flex items-center gap-2">
        <!-- دکمه تغییر تم -->
        <UButton color="neutral" variant="ghost" @click="toggleTheme">
          <UIcon :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'" class="size-5" />
        </UButton>

        <!-- سبد خرید (فعلاً placeholder) -->
        <UButton color="neutral" variant="ghost" to="/cart">
          <UIcon name="i-lucide-shopping-cart" class="size-5" />
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
              <UAvatar :alt="auth.user?.fullName" size="sm" />
              <span class="hidden sm:inline text-sm">{{ auth.user?.fullName }}</span>
            </UButton>
          </UDropdownMenu>
        </template>
      </div>
    </div>

    <!-- نوار جستجو در موبایل -->
    <div class="px-4 pb-3 md:hidden">
      <SearchBar />
    </div>
  </header>
</template>
