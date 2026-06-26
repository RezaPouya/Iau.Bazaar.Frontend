<script setup lang="ts">
import type { Company } from '~/types/company'
import { useUniversityService } from '~/services/university/university.service'

// نکته: نسخه‌ی قبلی این صفحه عیناً کپی‌شده‌ی داشبورد داخلی یک شرکت بود (همان فایل
// pages/companies/index.vue) با layout/middleware اشتباه ('company' به‌جای 'university')
// که باعث می‌شد کاربر دانشگاه با پیام «دسترسی غیرمجاز» از این صفحه بیرون پرتاب شود.
// این نسخه یک فهرست واقعی و read-only از شرکت‌های زیرمجموعه‌ی دانشگاه است
// (مطابق همان محدودیت read-only که در university.service.ts برای Companies وجود دارد).
definePageMeta({
  layout: 'university',
  middleware: 'university',
  title: 'شرکت‌ها'
})

const route = useRoute()
const { getCompaniesList } = useUniversityService()
const toast = useAppToast()

const companies = ref<Company[]>([])
const totals = ref(0)
const loading = ref(false)

const loadCompanies = async () => {
  loading.value = true
  try {
    const result = await getCompaniesList({
      page: 1,
      pageSize: 50,
      inputParams: { filters: [], sort: { propertyName: 'title', ascending: true } }
    })
    companies.value = result.data
    totals.value = result.totals
  } catch (err: any) {
    toast.error('خطا در دریافت لیست شرکت‌ها', err?.response?.data?.message)
  } finally {
    loading.value = false
  }
}

// اگر از صفحه‌ی «مراکز رشد» با یک growthCenterId مشخص وارد شده باشیم، فقط شرکت‌های
// همان مرکز رشد را نشان بده (فیلتر سمت کلاینت، چون لیست کلی شرکت‌های دانشگاه معمولاً
// عدد بزرگی نیست)
const growthCenterIdFilter = computed(() => route.query.growthCenterId ? Number(route.query.growthCenterId) : null)
const visibleCompanies = computed(() => {
  if (!growthCenterIdFilter.value) return companies.value
  return companies.value.filter(c => c.growthCenterId === growthCenterIdFilter.value)
})

const formatPercent = (value: number) => `${value}٪`

onMounted(loadCompanies)
useHead({ title: 'شرکت‌ها' })
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">شرکت‌ها</h1>
        <p class="text-sm text-dimmed mt-1">{{ visibleCompanies.length }} از {{ totals }} شرکت زیرمجموعه‌ی این دانشگاه</p>
      </div>
      <UButton v-if="growthCenterIdFilter" size="sm" color="neutral" variant="ghost" to="/university/companies">
        حذف فیلتر مرکز رشد
      </UButton>
    </div>

    <UCard>
      <div v-if="loading" class="flex justify-center py-10">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-primary-500" />
      </div>
      <div v-else-if="visibleCompanies.length === 0" class="text-center py-10 text-dimmed">
        شرکتی برای نمایش وجود ندارد
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-right text-dimmed border-b border-gray-200 dark:border-gray-700">
            <th class="py-2 px-2 font-medium">عنوان شرکت</th>
            <th class="py-2 px-2 font-medium hidden md:table-cell">مرکز رشد</th>
            <th class="py-2 px-2 font-medium hidden md:table-cell">کمیسیون مرکز رشد</th>
            <th class="py-2 px-2 font-medium">وضعیت</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="company in visibleCompanies" :key="company.id">
            <td class="py-3 px-2 font-medium">{{ company.title }}</td>
            <td class="py-3 px-2 text-dimmed hidden md:table-cell">{{ company.growthCenterName }}</td>
            <td class="py-3 px-2 text-dimmed hidden md:table-cell">{{ formatPercent(company.growthCenterCommission) }}</td>
            <td class="py-3 px-2">
              <UBadge :color="company.isActive ? 'success' : 'neutral'" variant="subtle" size="sm">
                {{ company.isActive ? 'فعال' : 'غیرفعال' }}
              </UBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>
  </div>
</template>
