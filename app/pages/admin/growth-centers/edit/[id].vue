<!-- app/pages/admin/growth-centers/edit/[id].vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'ویرایش مرکز رشد'
})

const route = useRoute()
const router = useRouter()
const growthCenterId = computed(() => parseInt(route.params.id as string))

const { $api } = useNuxtApp()
const toast = useToast()

// Form state
const form = reactive({
  title: '',
  description: '',
  universityId: 0,
  isActive: true
})

const universities = ref<{ id: number; title: string }[]>([])
const loading = ref(true)
const saving = ref(false)

// Fetch growth center data
const fetchGrowthCenter = async () => {
  try {
    const response = await $api.get(`panel/admin/growth-centers/${growthCenterId.value}`)
    // این الگوی fallback از قبل با هر دو حالت (پاسخ wrap‌شده یا خام) کار می‌کند، دست نخورده باقی ماند
    const data = response.data.data || response.data
    form.title = data.title
    form.description = data.description || ''
    form.universityId = data.universityId
    form.isActive = data.isActive
  } catch (error) {
    console.error('خطا در دریافت اطلاعات مرکز رشد', error)
    toast.add({ title: 'خطا در دریافت اطلاعات', color: 'error' })
  } finally {
    loading.value = false
  }
}

// Fetch universities
const fetchUniversities = async () => {
  try {
    const response = await $api.post('panel/admin/universities/list', {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    })
    // AdminUniversitiesController.GetList اکنون ApiResponse<GridDataSourceResult<T>> برمی‌گرداند
    universities.value = response.data.data?.data?.map((u: any) => ({ id: u.id, title: u.title })) || []
  } catch (error) {
    console.error('خطا در دریافت دانشگاه‌ها', error)
  }
}

// Save changes
const saveGrowthCenter = async () => {
  saving.value = true
  try {
    await $api.put(`panel/admin/growth-centers/${growthCenterId.value}`, form)
    toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    router.push('/admin/growth-centers')
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ذخیره', color: 'error' })
  } finally {
    saving.value = false
  }
}

// Cancel
const cancel = () => {
  router.push('/admin/growth-centers')
}

onMounted(async () => {
  await Promise.all([fetchGrowthCenter(), fetchUniversities()])
})
</script>

<template>
  <ClientOnly>
    <div class="max-w-4xl mx-auto">
      <div class="mb-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">ویرایش مرکز رشد</h1>
        <div class="flex gap-2">
          <UButton color="neutral" variant="ghost" @click="cancel">انصراف</UButton>
          <UButton color="primary" :loading="saving" @click="saveGrowthCenter">ذخیره تغییرات</UButton>
        </div>
      </div>

      <UCard v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin mx-auto" />
      </UCard>

      <UCard v-else>
        <UForm :state="form" class="space-y-4">
          <UFormField label="نام مرکز رشد" required>
            <UInput v-model="form.title" class="w-full text-right" />
          </UFormField>

          <UFormField label="دانشگاه" required>
            <USelect
              v-model="form.universityId"
              :items="universities.map((u) => ({ label: u.title, value: u.id }))"
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>

          <UFormField label="توضیحات">
            <FeatureRichTextEditor v-model="form.description" placeholder="توضیحات مرکز رشد را وارد کنید..." />
          </UFormField>

          <UFormField label="فعال" class="flex-1">
            <USwitch v-model="form.isActive" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="cancel">انصراف</UButton>
            <UButton color="primary" :loading="saving" @click="saveGrowthCenter">ذخیره</UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </ClientOnly>
</template>
