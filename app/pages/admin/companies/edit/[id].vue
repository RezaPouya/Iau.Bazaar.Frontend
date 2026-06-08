<!-- app/pages/admin/companies/edit/[id].vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: 'ویرایش شرکت'
})

const route = useRoute()
const router = useRouter()
const companyId = computed(() => parseInt(route.params.id as string))

const { $api } = useNuxtApp()
const toast = useToast()

// Form state
const form = reactive({
  title: '',
  shortDescription: '',
  description: '',
  growthCenterId: 0,
  growthCenterCommission: 0,
  isActive: true
})

const growthCenters = ref<{ id: number; title: string; universityName?: string }[]>([])
const loading = ref(true)
const saving = ref(false)

// Fetch company data
const fetchCompany = async () => {
  try {
    const response = await $api.get(`panel/admin/companies/${companyId.value}`)
    const data = response.data.data || response.data
    form.title = data.title
    form.shortDescription = data.shortDescription || ''
    form.description = data.description || ''
    form.growthCenterId = data.growthCenterId
    form.growthCenterCommission = data.growthCenterCommission || 0
    form.isActive = data.isActive
  } catch (error) {
    console.error('خطا در دریافت اطلاعات شرکت', error)
    toast.add({ title: 'خطا در دریافت اطلاعات', color: 'error' })
  } finally {
    loading.value = false
  }
}

// Fetch growth centers
const fetchGrowthCenters = async () => {
  try {
    const response = await $api.post('panel/admin/growth-centers/list', {
      page: 1,
      pageSize: 1000,
      inputParams: { filters: [], sort: null }
    })
    growthCenters.value = response.data.data?.map((gc: any) => ({
      id: gc.id,
      title: gc.title,
      universityName: gc.universityName
    })) || []
  } catch (error) {
    console.error('خطا در دریافت مراکز رشد', error)
  }
}

// Save changes
const saveCompany = async () => {
  saving.value = true
  try {
    await $api.put(`panel/admin/companies/${companyId.value}`, form)
    toast.add({ title: 'بروزرسانی موفق', color: 'success' })
    router.push('/admin/companies')
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ذخیره', color: 'error' })
  } finally {
    saving.value = false
  }
}

// Cancel
const cancel = () => {
  router.push('/admin/companies')
}

onMounted(async () => {
  await Promise.all([fetchCompany(), fetchGrowthCenters()])
})
</script>

<template>
  <ClientOnly>
    <div class="max-w-4xl mx-auto">
      <div class="mb-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">ویرایش شرکت</h1>
        <div class="flex gap-2">
          <UButton color="neutral" variant="ghost" @click="cancel">انصراف</UButton>
          <UButton color="primary" :loading="saving" @click="saveCompany">ذخیره تغییرات</UButton>
        </div>
      </div>

      <UCard v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin mx-auto" />
      </UCard>

      <UCard v-else>
        <UForm :state="form" class="space-y-4">
          <UFormField label="نام شرکت" required>
            <UInput v-model="form.title" class="w-full text-right" />
          </UFormField>

          <UFormField label="مرکز رشد" required>
            <USelect
              v-model="form.growthCenterId"
              :items="growthCenters.map((gc) => ({
                label: gc.title + (gc.universityName ? ` (${gc.universityName})` : ''),
                value: gc.id
              }))"
              class="w-full"
              :popper="{ placement: 'bottom-end' }"
            />
          </UFormField>

          <UFormField label="توضیح کوتاه">
            <UTextarea v-model="form.shortDescription" rows="2" class="w-full text-right" />
          </UFormField>

          <UFormField label="توضیحات کامل">
            <FeatureRichTextEditor v-model="form.description" placeholder="توضیحات شرکت را وارد کنید..." />
          </UFormField>

          <UFormField label="کمیسیون مرکز رشد (%)">
            <div class="flex items-center gap-2">
              <UInput v-model.number="form.growthCenterCommission" type="number" step="0.5" min="0" max="100" class="flex-1 text-left" />
              <span class="text-sm text-gray-500">درصد</span>
            </div>
          </UFormField>

          <UFormField label="فعال" class="flex-1">
            <USwitch v-model="form.isActive" />
          </UFormField>

          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="cancel">انصراف</UButton>
            <UButton color="primary" :loading="saving" @click="saveCompany">ذخیره</UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </ClientOnly>
</template>
