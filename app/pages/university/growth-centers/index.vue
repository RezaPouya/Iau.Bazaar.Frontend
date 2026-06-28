<script setup lang="ts">
import type { GrowthCenter } from '~/types/growth-center'
import { useUniversityService } from '~/services/university/university.service'

// نکته‌ی مهم درباره‌ی این فایل: نسخه‌ی قبلی این صفحه (که زیر مسیر /university/growth-centers
// قرار دارد) عیناً کپی‌شده‌ی داشبورد داخلی خودِ یک مرکز رشد بود (همان فایل
// pages/growth-center/index.vue) - یعنی:
//   ۱) layout/middleware آن 'growth-center' بود، یعنی فقط نقش GrowthCenterUser اجازه
//      ورود داشت و کاربر واقعی دانشگاه با ریدایرکت و پیام «دسترسی غیرمجاز» مواجه می‌شد.
//   ۲) حتی اگر دسترسی هم می‌داشت، API هایی که صدا می‌زد (سفارشات/محصولات مرکز رشد)
//      برای نقش دانشگاه معنا/مجوز نداشت.
// این نسخه به یک صفحه‌ی واقعی «فهرست مراکز رشد زیرمجموعه‌ی دانشگاه» تبدیل شده که از
// university.service.ts استفاده می‌کند، و الان فرم ایجاد/ویرایش هم دارد (قبلاً اصلاً
// ساخته نشده بود، چون فرانت‌اند راهی برای دانستن شناسه‌ی دانشگاه کاربر فعلی نداشت —
// این مشکل با افزودن universityId به پاسخ ورود (Login) برطرف شد).
definePageMeta({
  layout: 'university',
  middleware: 'university',
  title: 'مراکز رشد'
})

const { getGrowthCentersList, toggleGrowthCenterActive, createGrowthCenter, updateGrowthCenter } = useUniversityService()
const toast = useAppToast()
const auth = useAuthStore()

const growthCenters = ref<GrowthCenter[]>([])
const totals = ref(0)
const loading = ref(false)
const togglingId = ref<number | null>(null)

const loadGrowthCenters = async () => {
  loading.value = true
  try {
    const result = await getGrowthCentersList({
      page: 1,
      pageSize: 50,
      inputParams: { filters: [], sort: { propertyName: 'title', ascending: true } }
    })
    growthCenters.value = result.data
    totals.value = result.totals
  } catch (err: any) {
    toast.error('خطا در دریافت لیست مراکز رشد', err?.response?.data?.message)
  } finally {
    loading.value = false
  }
}

const onToggleActive = async (gc: GrowthCenter) => {
  togglingId.value = gc.id
  try {
    await toggleGrowthCenterActive(gc.id)
    gc.isActive = !gc.isActive
    toast.success(gc.isActive ? 'مرکز رشد فعال شد' : 'مرکز رشد غیرفعال شد')
  } catch (err: any) {
    toast.error('خطا', err?.response?.data?.message)
  } finally {
    togglingId.value = null
  }
}

// ---------- فرم ایجاد/ویرایش ----------
const modalOpen = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  title: '',
  description: '',
  isActive: true
})

const openCreateModal = () => {
  editingId.value = null
  form.title = ''
  form.description = ''
  form.isActive = true
  modalOpen.value = true
}

const openEditModal = (gc: GrowthCenter) => {
  editingId.value = gc.id
  form.title = gc.title
  form.description = gc.description ?? ''
  form.isActive = gc.isActive
  modalOpen.value = true
}

const saveGrowthCenter = async () => {
  if (!form.title.trim()) {
    toast.error('خطا', 'عنوان مرکز رشد الزامی است')
    return
  }
  if (!auth.user?.universityId && !editingId.value) {
    toast.error('خطا', 'شناسه دانشگاه شما یافت نشد. لطفاً دوباره وارد شوید.')
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await updateGrowthCenter(editingId.value, {
        title: form.title.trim(),
        description: form.description,
        universityId: auth.user!.universityId!,
        isActive: form.isActive
      })
      toast.success('مرکز رشد ویرایش شد')
    } else {
      await createGrowthCenter({
        title: form.title.trim(),
        description: form.description,
        universityId: auth.user!.universityId!,
        isActive: form.isActive
      })
      toast.success('مرکز رشد جدید ایجاد شد')
    }
    modalOpen.value = false
    await loadGrowthCenters()
  } catch (err: any) {
    toast.error('خطا', err?.response?.data?.message || 'ذخیره با خطا مواجه شد')
  } finally {
    saving.value = false
  }
}

onMounted(loadGrowthCenters)
useHead({ title: 'مراکز رشد' })
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">مراکز رشد</h1>
        <p class="text-sm text-dimmed mt-1">{{ totals }} مرکز رشد زیرمجموعه‌ی این دانشگاه</p>
      </div>
      <UButton color="primary" icon="i-lucide-plus" @click="openCreateModal">مرکز رشد جدید</UButton>
    </div>

    <UCard>
      <div v-if="loading" class="flex justify-center py-10">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-primary-500" />
      </div>
      <div v-else-if="growthCenters.length === 0" class="text-center py-10 text-dimmed">
        هیچ مرکز رشدی برای این دانشگاه ثبت نشده است
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-right text-dimmed border-b border-gray-200 dark:border-gray-700">
            <th class="py-2 px-2 font-medium">عنوان</th>
            <th class="py-2 px-2 font-medium hidden md:table-cell">توضیحات</th>
            <th class="py-2 px-2 font-medium">وضعیت</th>
            <th class="py-2 px-2 font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-for="gc in growthCenters" :key="gc.id">
            <td class="py-3 px-2 font-medium">{{ gc.title }}</td>
            <td class="py-3 px-2 text-dimmed hidden md:table-cell max-w-xs truncate">{{ gc.description }}</td>
            <td class="py-3 px-2">
              <UBadge :color="gc.isActive ? 'success' : 'neutral'" variant="subtle" size="sm">
                {{ gc.isActive ? 'فعال' : 'غیرفعال' }}
              </UBadge>
            </td>
            <td class="py-3 px-2">
              <div class="flex items-center gap-2">
                <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-pencil" @click="openEditModal(gc)">
                  ویرایش
                </UButton>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  :loading="togglingId === gc.id"
                  @click="onToggleActive(gc)"
                >
                  {{ gc.isActive ? 'غیرفعال کردن' : 'فعال کردن' }}
                </UButton>
                <UButton size="xs" color="primary" variant="ghost" :to="`/university/companies?growthCenterId=${gc.id}`">
                  شرکت‌ها
                </UButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <!-- مودال ایجاد/ویرایش -->
    <UModal v-model:open="modalOpen" :title="editingId ? 'ویرایش مرکز رشد' : 'مرکز رشد جدید'">
      <template #body>
        <div class="space-y-4">
          <UFormField label="عنوان" required>
            <UInput v-model="form.title" placeholder="مثلاً: مرکز رشد فناوری اطلاعات" class="w-full" />
          </UFormField>
          <UFormField label="توضیحات">
            <RichTextEditor v-model="form.description" />
          </UFormField>
          <div class="flex items-center justify-between">
            <span class="text-sm">فعال باشد</span>
            <USwitch v-model="form.isActive" />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton color="neutral" variant="ghost" @click="modalOpen = false">انصراف</UButton>
            <UButton color="primary" :loading="saving" @click="saveGrowthCenter">ذخیره</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
