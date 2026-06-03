<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = ref<Editor | null>(null)

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue || '',
    extensions: [StarterKit],
    onUpdate: ({ editor }) => {
      emit('update:modelValue', editor.getHTML())
    },
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue || '')
  }
})
</script>

<template>
  <div class="border rounded-lg overflow-hidden">
    <div v-if="editor" class="border-b p-2 flex gap-1 flex-wrap">
      <UButton size="xs" color="neutral" variant="ghost" @click="editor.chain().focus().toggleBold().run()" :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bold') }">
        <UIcon name="i-lucide-bold" />
      </UButton>
      <UButton size="xs" color="neutral" variant="ghost" @click="editor.chain().focus().toggleItalic().run()" :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('italic') }">
        <UIcon name="i-lucide-italic" />
      </UButton>
      <UButton size="xs" color="neutral" variant="ghost" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 2 }) }">
        H2
      </UButton>
      <UButton size="xs" color="neutral" variant="ghost" @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bulletList') }">
        <UIcon name="i-lucide-list" />
      </UButton>
      <UButton size="xs" color="neutral" variant="ghost" @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('orderedList') }">
        <UIcon name="i-lucide-list-ordered" />
      </UButton>
    </div>
    <EditorContent :editor="editor" class="p-3 min-h-[200px]" />
  </div>
</template>

<style>
.tiptap {
  outline: none;
  min-height: 200px;
}
.tiptap p {
  margin: 0.5em 0;
}
.tiptap ul, .tiptap ol {
  padding-right: 1.5em;
}
</style>
