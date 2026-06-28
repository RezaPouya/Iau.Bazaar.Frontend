<script setup lang="ts">
import type { ContactUsMessageDto } from '~/types/contact-us-message'
import { ContactUsMessageState, ContactUsMessageStateConfig } from '~/types/contact-us-message'
import { useAdminContactUsMessageService } from '~/services/admin/contact-us-message.service'

const props = defineProps<{
  open: boolean
  message: ContactUsMessageDto | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'message-updated', message: ContactUsMessageDto): void
  (e: 'message-deleted', id: number): void
}>()

const toast = useToast()
const messageService = useAdminContactUsMessageService()

const adminNote = ref('')
const saving = ref(false)
const deleting = ref(false)

// نکته: نسخه قبلی این کامپوننت از فیلدهای فرضی isSeen/isAnswered/fullName/phoneNumber/
// subject/text/answeredAt استفاده می‌کرد که هیچ‌کدام در ContactUsMessageDto واقعی بک‌اند
// وجود ندارند (واقعی: state عددی با ۳ مقدار، name، phone، subjectTitle، content،
// noteAddedAt). به همین خاطر این کامپوننت کاملاً بازنویسی شد.

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.message && props.message.state === ContactUsMessageState.NotSeen) {
      try {
        const updated = await messageService.markAsSeen(props.message.id)
        emit('message-updated', updated)
      } catch (error) {
        console.error('Error marking as seen:', error)
      }
    }
    if (!isOpen) {
      adminNote.value = ''
    }
  }
)

watch(
  () => props.message,
  (newMessage) => {
    adminNote.value = newMessage?.adminNote ?? ''
  },
  { immediate: true }
)

const formatDate = (date?: string | null) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const saveAnswer = async () => {
  if (!props.message) return
  saving.value = true
  try {
    const updated = await messageService.answerMessage(props.message.id, adminNote.value)
    toast.add({ title: 'پاسخ با موفقیت ثبت شد', color: 'success' })
    emit('message-updated', updated)
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در ثبت پاسخ', color: 'error' })
  } finally {
    saving.value = false
  }
}

const markUnseen = async () => {
  if (!props.message) return
  try {
    const updated = await messageService.updateMessage({ id: props.message.id, state: ContactUsMessageState.NotSeen, adminNote: props.message.adminNote })
    toast.add({ title: 'پیام به عنوان مشاهده‌نشده علامت‌گذاری شد', color: 'success' })
    emit('message-updated', updated)
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در تغییر وضعیت', color: 'error' })
  }
}

const deleteMessage = async () => {
  if (!props.message) return
  deleting.value = true
  try {
    await messageService.deleteMessage(props.message.id)
    toast.add({ title: 'پیام با موفقیت حذف شد', color: 'success' })
    emit('message-deleted', props.message.id)
    emit('update:open', false)
  } catch (error: any) {
    toast.add({ title: error.response?.data?.message || 'خطا در حذف', color: 'error' })
  } finally {
    deleting.value = false
  }
}

const closeModal = () => {
  emit('update:open', false)
}

const confirmDelete = () => {
  toast.add({
    title: 'تأیید حذف',
    description: 'آیا از حذف این پیام اطمینان دارید؟',
    color: 'error',
    actions: [
      { label: 'بله', onClick: deleteMessage },
      { label: 'خیر', onClick: () => {} }
    ]
  })
}

const stateBadge = computed(() => {
  if (!props.message) return ContactUsMessageStateConfig[ContactUsMessageState.NotSeen]
  return ContactUsMessageStateConfig[props.message.state] || ContactUsMessageStateConfig[ContactUsMessageState.NotSeen]
})
</script>

<template>
  <UModal :open="open" title="مشاهده پیام" class="max-w-4xl" @update:open="closeModal">
    <template #body>
      <div v-if="message" class="space-y-4">
        <!-- Header -->
        <div class="flex flex-wrap justify-between items-start gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap gap-2">
            <UBadge :color="stateBadge.color" variant="subtle" size="sm">
              <UIcon :name="stateBadge.icon" class="ml-1 size-3" />
              {{ message.stateTitle }}
            </UBadge>
            <UButton
              v-if="message.state !== ContactUsMessageState.NotSeen"
              size="xs"
              color="neutral"
              variant="outline"
              @click="markUnseen"
            >
              علامت‌گذاری به‌عنوان مشاهده‌نشده
            </UButton>
          </div>
          <div class="flex gap-1">
            <UButton size="sm" color="error" variant="ghost" :loading="deleting" @click="confirmDelete">
              <UIcon name="i-lucide-trash" class="size-4" />
            </UButton>
          </div>
        </div>

        <!-- Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div><span class="text-dimmed">نام فرستنده:</span> <span class="mr-2 font-medium">{{ message.name }}</span></div>
          <div><span class="text-dimmed">ایمیل:</span> <span class="mr-2 font-medium" dir="ltr">{{ message.email }}</span></div>
          <div v-if="message.phone"><span class="text-dimmed">شماره تماس:</span> <span class="mr-2 font-medium" dir="ltr">{{ message.phone }}</span></div>
          <div><span class="text-dimmed">تاریخ ارسال:</span> <span class="mr-2 font-medium">{{ message.createdAtPersian || formatDate(message.createdAt) }}</span></div>
          <div v-if="message.noteAddedAt"><span class="text-dimmed">تاریخ یادداشت:</span> <span class="mr-2 font-medium">{{ formatDate(message.noteAddedAt) }}</span></div>
        </div>

        <!-- Subject -->
        <div>
          <h3 class="text-base font-semibold mb-2">موضوع:</h3>
          <p class="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{{ message.subjectTitle }}</p>
        </div>

        <!-- Body -->
        <div>
          <h3 class="text-base font-semibold mb-2">متن پیام:</h3>
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg min-h-[150px] whitespace-pre-wrap">{{ message.content }}</div>
        </div>

        <!-- Note / Answer -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 class="text-base font-semibold mb-3">یادداشت ادمین</h3>
          <div v-if="message.adminNote" class="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-lucide-check-check" class="size-4 text-primary-600" />
              <span class="text-sm font-medium">یادداشت ثبت‌شده:</span>
              <span v-if="message.noteAddedAt" class="text-xs text-dimmed">{{ formatDate(message.noteAddedAt) }}</span>
            </div>
            <p class="text-sm whitespace-pre-wrap">{{ message.adminNote }}</p>
          </div>
          <div class="space-y-3">
            <UTextarea v-model="adminNote" placeholder="یادداشت/پاسخ خود را بنویسید..." rows="4" class="w-full" />
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="ghost" @click="closeModal">انصراف</UButton>
              <UButton color="primary" :loading="saving" :disabled="!adminNote.trim()" @click="saveAnswer">
                <UIcon name="i-lucide-send" class="ml-1 size-4" />
                ثبت یادداشت
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
