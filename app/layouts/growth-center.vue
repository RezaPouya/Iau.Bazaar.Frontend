<!-- app/layouts/growth-center.vue -->
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useLogout } from '~/composables/useLogout'

const auth = useAuthStore()
const { logout } = useLogout()
const route = useRoute()
const colorMode = useColorMode()
const pageTitle = computed(() => route.meta.title || 'پنل مرکز رشد')

const isSidebarCollapsed = ref(false)

// Navigation items
const navigation = [
  {
    label: 'داشبورد',
    icon: 'i-lucide-layout-dashboard',
    to: '/growth-center',
    exact: true
  },
  {
    label: 'مدیریت شرکت‌ها',
    icon: 'i-lucide-building',
    to: '/growth-center/companies'
  },
  {
    label: 'مدیریت کاربران شرکت‌ها',
    icon: 'i-lucide-users',
    to: '/growth-center/company-users'
  },
  {
    label: 'مشاهده کاربران',
    icon: 'i-lucide-user-list',
    to: '/growth-center/users'
  },
  {
    label: 'مدیریت محصولات',
    icon: 'i-lucide-box',
    to: '/growth-center/products'
  },
  {
    label: 'مدیریت مدارک',
    icon: 'i-lucide-files',
    to: '/growth-center/product-files'
  },
  {
    label: 'مشاهده سفارشات',
    icon: 'i-lucide-shopping-cart',
    to: '/growth-center/orders'
  }
]

// User dropdown items
const userDropdownItems = [
  [
    {
      label: 'پروفایل',
      icon: 'i-lucide-user',
      to: '/growth-center/profile'
    },
    {
      label: 'تنظیمات',
      icon: 'i-lucide-settings',
      to: '/growth-center/settings'
    }
  ],
  [
    {
      label: 'خروج',
      icon: 'i-lucide-log-out',
      onSelect: () => logout()
    }
  ]
]

function isActive(item: any) {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}

definePageMeta({
  ssr: false // Disable server-side rendering for this page
})
</script>

<template>
  <ClientOnly>
    <div class="growth-center-panel">
      <div class="flex h-screen w-full overflow-hidden">
        <!-- Sidebar -->
        <aside
          class="flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 transition-all duration-300"
          :class="isSidebarCollapsed ? 'w-20' : 'w-64'"
        >
          <!-- Logo -->
          <div class="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-800">
            <span
              class="text-xl font-bold text-primary-600 whitespace-nowrap overflow-hidden transition-all"
              :class="isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
            >
              پنل مرکز رشد
            </span>
            <UButton icon="i-lucide-panel-left-close" color="neutral" variant="ghost" size="sm" @click="isSidebarCollapsed = !isSidebarCollapsed" />
          </div>

          <!-- Navigation -->
          <nav class="flex-1 overflow-y-auto py-4">
            <ULink
              v-for="item in navigation"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md transition-colors"
              :class="[
                isActive(item)
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
            >
              <UIcon :name="item.icon" class="size-5 shrink-0" />
              <span class="text-sm whitespace-nowrap transition-all" :class="isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'">
                {{ item.label }}
              </span>
            </ULink>
          </nav>

          <!-- Footer -->
          <div class="border-t border-gray-200 dark:border-gray-800 p-3">
            <UDropdownMenu :items="userDropdownItems" :content="{ align: 'end' }">
              <UButton color="neutral" variant="ghost" class="w-full justify-start gap-3 px-2 py-2" :class="isSidebarCollapsed ? 'justify-center' : ''">
                <UAvatar :alt="auth.user?.fullName || 'کاربر'" size="sm" />
                <div v-if="!isSidebarCollapsed" class="flex-1 text-right overflow-hidden">
                  <p class="text-sm font-medium truncate">{{ auth.user?.fullName }}</p>
                  <p class="text-xs text-dimmed truncate">مرکز رشد</p>
                </div>
                <UIcon v-if="!isSidebarCollapsed" name="i-lucide-chevron-left" class="size-4 text-dimmed shrink-0" />
              </UButton>
            </UDropdownMenu>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
          <!-- Top Navbar -->
          <header class="flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-center gap-2">
              <UButton icon="i-lucide-menu" color="neutral" variant="ghost" class="lg:hidden" @click="isSidebarCollapsed = !isSidebarCollapsed" />
              <span class="text-lg font-semibold">{{ pageTitle }}</span>
            </div>

            <div class="flex items-center gap-2">
              <UDropdownMenu
                :items="[
                  [
                    {
                      label: 'روشن',
                      icon: 'i-lucide-sun',
                      type: 'checkbox',
                      checked: colorMode.value === 'light',
                      onSelect: () => (colorMode.preference = 'light')
                    },
                    {
                      label: 'تاریک',
                      icon: 'i-lucide-moon',
                      type: 'checkbox',
                      checked: colorMode.value === 'dark',
                      onSelect: () => (colorMode.preference = 'dark')
                    },
                    {
                      label: 'سیستم',
                      icon: 'i-lucide-monitor',
                      type: 'checkbox',
                      checked: colorMode.value === 'system',
                      onSelect: () => (colorMode.preference = 'system')
                    }
                  ]
                ]"
              >
                <UButton icon="i-lucide-palette" color="neutral" variant="ghost" />
              </UDropdownMenu>

              <UButton icon="i-lucide-bell" color="neutral" variant="ghost" />

              <UDropdownMenu :items="userDropdownItems">
                <UAvatar :alt="auth.user?.fullName || 'کاربر'" size="sm" />
              </UDropdownMenu>
            </div>
          </header>

          <!-- Page Content -->
          <main class="flex-1 overflow-y-auto p-4 sm:p-6">
            <slot />
          </main>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.rtl .i-lucide-panel-left-close {
  transform: rotate(180deg);
}
</style>
