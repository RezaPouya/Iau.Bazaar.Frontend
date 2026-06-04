<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight'
import 'highlight.js/styles/github-dark.css'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = ref<Editor | null>(null)

// Register common languages for code highlighting
import js from 'highlight.js/lib/languages/javascript'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import python from 'highlight.js/lib/languages/python'

lowlight.registerLanguage('js', js)
lowlight.registerLanguage('javascript', js)
lowlight.registerLanguage('html', html)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('json', json)
lowlight.registerLanguage('bash', bash)
lowlight.registerLanguage('python', python)

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue || '',
    extensions: [
      StarterKit.configure({
        codeBlock: false // We'll use CodeBlockLowlight instead
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      }),
      Placeholder.configure({
        placeholder: props.placeholder || 'متن خود را اینجا بنویسید...'
      }),
      TextStyle,
      Color,
      Highlight,
      Typography,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript'
      })
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      emit('update:modelValue', editor.getHTML())
    }
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value && newValue !== editor.value.getHTML()) {
      editor.value.commands.setContent(newValue || '')
    }
  }
)

// Toolbar buttons helpers
const setLink = () => {
  const url = window.prompt('لینک را وارد کنید:')
  if (url && editor.value) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}

const addImage = () => {
  const url = window.prompt('آدرس تصویر را وارد کنید:')
  if (url && editor.value) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}
</script>

<template>
  <div class="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
    <!-- Toolbar -->
    <div v-if="editor" class="border-b p-2 flex gap-1 flex-wrap bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
      <!-- Text formatting -->
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bold') }"
      >
        <UIcon name="i-lucide-bold" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('italic') }"
      >
        <UIcon name="i-lucide-italic" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('underline') }"
      >
        <UIcon name="i-lucide-underline" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('strike') }"
      >
        <UIcon name="i-lucide-strikethrough" />
      </UButton>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <!-- Headings -->
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 1 }) }"
      >
        H1
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 2 }) }"
      >
        H2
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 3 }) }"
      >
        H3
      </UButton>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <!-- Lists -->
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bulletList') }"
      >
        <UIcon name="i-lucide-list" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('orderedList') }"
      >
        <UIcon name="i-lucide-list-ordered" />
      </UButton>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <!-- Text alignment -->
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive({ textAlign: 'left' }) }"
      >
        <UIcon name="i-lucide-align-left" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive({ textAlign: 'center' }) }"
      >
        <UIcon name="i-lucide-align-center" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive({ textAlign: 'right' }) }"
      >
        <UIcon name="i-lucide-align-right" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().setTextAlign('justify').run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive({ textAlign: 'justify' }) }"
      >
        <UIcon name="i-lucide-align-justify" />
      </UButton>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <!-- Blocks -->
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('blockquote') }"
      >
        <UIcon name="i-lucide-quote" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('codeBlock') }"
      >
        <UIcon name="i-lucide-code" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleHighlight().run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('highlight') }"
      >
        <UIcon name="i-lucide-highlighter" />
      </UButton>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <!-- Links & Images -->
      <UButton size="xs" color="neutral" variant="ghost" @click="setLink" :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('link') }">
        <UIcon name="i-lucide-link" />
      </UButton>
      <UButton size="xs" color="neutral" variant="ghost" @click="addImage">
        <UIcon name="i-lucide-image" />
      </UButton>
      <UButton size="xs" color="neutral" variant="ghost" @click="editor.chain().focus().setHorizontalRule().run()">
        <UIcon name="i-lucide-minus" />
      </UButton>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <!-- Undo/Redo -->
      <UButton size="xs" color="neutral" variant="ghost" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()">
        <UIcon name="i-lucide-undo" />
      </UButton>
      <UButton size="xs" color="neutral" variant="ghost" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()">
        <UIcon name="i-lucide-redo" />
      </UButton>

      <!-- Clear formatting -->
      <UButton size="xs" color="neutral" variant="ghost" @click="editor.chain().focus().clearNodes().unsetAllMarks().run()">
        <UIcon name="i-lucide-eraser" />
      </UButton>
    </div>

    <!-- Editor Content -->
    <EditorContent :editor="editor" class="p-4 min-h-[300px] prose max-w-none focus:outline-none" />
  </div>
</template>

<style>
/* TipTap editor styles */
.tiptap {
  outline: none;
  min-height: 300px;
}
.tiptap p {
  margin: 1em 0;
}
.tiptap h1 {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
}
.tiptap h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.83em 0;
}
.tiptap h3 {
  font-size: 1.17em;
  font-weight: bold;
  margin: 1em 0;
}
.tiptap ul,
.tiptap ol {
  padding-right: 1.5em;
  margin: 1em 0;
}
.tiptap blockquote {
  border-right: 4px solid #ddd;
  padding-right: 1rem;
  margin: 1em 0;
  color: #666;
  font-style: italic;
}
.tiptap code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: monospace;
}
.tiptap pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}
.tiptap pre code {
  background: none;
  color: inherit;
  padding: 0;
}
.tiptap a {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
}
.tiptap img {
  max-width: 100%;
  height: auto;
  margin: 1em 0;
  border-radius: 8px;
}
.tiptap .highlight {
  background-color: #fef08a;
  color: #000;
}
.tiptap hr {
  margin: 2rem 0;
}
</style>
