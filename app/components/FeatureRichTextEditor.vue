<!-- components/FeatureRichTextEditor.vue -->
<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { lowlight } from 'lowlight'
import 'highlight.js/styles/github-dark.css'

// Register languages for code highlighting
import js from 'highlight.js/lib/languages/javascript'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import python from 'highlight.js/lib/languages/python'
import ts from 'highlight.js/lib/languages/typescript'

lowlight.registerLanguage('js', js)
lowlight.registerLanguage('javascript', js)
lowlight.registerLanguage('ts', ts)
lowlight.registerLanguage('typescript', ts)
lowlight.registerLanguage('html', html)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('json', json)
lowlight.registerLanguage('bash', bash)
lowlight.registerLanguage('python', python)

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = ref<Editor | null>(null)

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue || '',
    extensions: [
      StarterKit.configure({
        codeBlock: false // handled by CodeBlockLowlight
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
      Highlight.configure({
        multicolor: true
      }),
      Typography,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript'
      }),
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 100,
        lastColumnResizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      Subscript,
      Superscript
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none max-w-none'
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

// Helper: add image via URL
const addImage = () => {
  const url = window.prompt('آدرس تصویر را وارد کنید:')
  if (url && editor.value) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}

// Helper: set link
const setLink = () => {
  const url = window.prompt('لینک را وارد کنید:')
  if (url && editor.value) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}

// Helper: insert table
const insertTable = () => {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

// Helper: add column after
const addColumnAfter = () => {
  editor.value?.chain().focus().addColumnAfter().run()
}

// Helper: add row after
const addRowAfter = () => {
  editor.value?.chain().focus().addRowAfter().run()
}

// Helper: delete current column
const deleteColumn = () => {
  editor.value?.chain().focus().deleteColumn().run()
}

// Helper: delete current row
const deleteRow = () => {
  editor.value?.chain().focus().deleteRow().run()
}

// Helper: delete table
const deleteTable = () => {
  editor.value?.chain().focus().deleteTable().run()
}

// Helper: toggle header row
const toggleHeaderRow = () => {
  editor.value?.chain().focus().toggleHeaderRow().run()
}

// Helper: set text color
const setTextColor = (color: string) => {
  editor.value?.chain().focus().setColor(color).run()
}

// Helper: unset color
const unsetColor = () => {
  editor.value?.chain().focus().unsetColor().run()
}

// Helper: clear formatting (reset marks)
const clearFormatting = () => {
  editor.value?.chain().focus().clearNodes().unsetAllMarks().run()
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
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleSubscript().run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('subscript') }"
      >
        <UIcon name="i-lucide-subscript" />
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleSuperscript().run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('superscript') }"
      >
        <UIcon name="i-lucide-superscript" />
      </UButton>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <!-- Headings -->
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 1 }) }"
        >H1</UButton
      >
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 2 }) }"
        >H2</UButton
      >
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('heading', { level: 3 }) }"
        >H3</UButton
      >

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

      <!-- Blocks: Blockquote, Code block, Highlight -->
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

      <!-- Table dropdown -->
      <UDropdownMenu
        :items="[
          [
            { label: 'درج جدول (3x3)', onSelect: insertTable, icon: 'i-lucide-table' },
            { label: 'افزودن ستون بعد', onSelect: addColumnAfter, icon: 'i-lucide-table-columns' },
            { label: 'افزودن سطر بعد', onSelect: addRowAfter, icon: 'i-lucide-table-rows' },
            { label: 'حذف ستون', onSelect: deleteColumn, icon: 'i-lucide-trash' },
            { label: 'حذف سطر', onSelect: deleteRow, icon: 'i-lucide-trash' },
            { label: 'حذف جدول', onSelect: deleteTable, icon: 'i-lucide-trash-2' },
            { label: 'ردیف سرصفحه', onSelect: toggleHeaderRow, icon: 'i-lucide-rows' }
          ]
        ]"
      >
        <UButton size="xs" color="neutral" variant="ghost">
          <UIcon name="i-lucide-grid-3x3" />
        </UButton>
      </UDropdownMenu>

      <!-- Color picker (simple) -->
      <UDropdownMenu
        :items="[
          [
            { label: 'قرمز', onSelect: () => setTextColor('#ef4444') },
            { label: 'سبز', onSelect: () => setTextColor('#22c55e') },
            { label: 'آبی', onSelect: () => setTextColor('#3b82f6') },
            { label: 'نارنجی', onSelect: () => setTextColor('#f97316') },
            { label: 'بنفش', onSelect: () => setTextColor('#a855f7') },
            { label: 'حذف رنگ', onSelect: unsetColor }
          ]
        ]"
      >
        <UButton size="xs" color="neutral" variant="ghost">
          <UIcon name="i-lucide-palette" />
        </UButton>
      </UDropdownMenu>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

      <!-- Undo/Redo -->
      <UButton size="xs" color="neutral" variant="ghost" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()">
        <UIcon name="i-lucide-undo" />
      </UButton>
      <UButton size="xs" color="neutral" variant="ghost" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()">
        <UIcon name="i-lucide-redo" />
      </UButton>

      <!-- Clear formatting -->
      <UButton size="xs" color="neutral" variant="ghost" @click="clearFormatting">
        <UIcon name="i-lucide-eraser" />
      </UButton>
    </div>

    <!-- Editor Content -->
    <EditorContent :editor="editor" class="p-4 min-h-[300px]" />
  </div>
</template>

<style>
/* General editor styles */
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
/* Table styles */
.tiptap table {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
  overflow-x: auto;
}
.tiptap td,
.tiptap th {
  border: 1px solid #ccc;
  padding: 0.5rem;
  vertical-align: top;
}
.tiptap th {
  background-color: #f3f4f6;
  font-weight: bold;
}
</style>
