<template>
  <footer class="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
    <div class="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
      <div>
        <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-2">درباره ما</h4>
        <p class="text-gray-600 dark:text-gray-400">بازار دانشگاه، پلتفرم خرید و فروش محصولات دانشگاه‌ها و مراکز رشد</p>
      </div>
      <div>
        <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-2">دسترسی سریع</h4>
        <ul class="space-y-1">
          <li><NuxtLink to="/products" class="text-gray-600 dark:text-gray-400 hover:text-primary-600">محصولات</NuxtLink></li>
          <li><NuxtLink to="/categories" class="text-gray-600 dark:text-gray-400 hover:text-primary-600">دسته‌بندی‌ها</NuxtLink></li>
          <li><NuxtLink to="/about" class="text-gray-600 dark:text-gray-400 hover:text-primary-600">تماس با ما</NuxtLink></li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-2">شبکه‌های اجتماعی</h4>
        <div class="flex gap-3">
          <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-600"><UIcon name="i-simple-icons-instagram" class="size-6" /></a>
          <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-600"><UIcon name="i-simple-icons-telegram" class="size-6" /></a>
          <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-600"><UIcon name="i-simple-icons-whatsapp" class="size-6" /></a>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 dark:border-gray-700 text-center py-4 text-xs text-gray-500">
      تمامی حقوق متعلق به دانشگاه آزاد اسلامی است.
    </div>
  </footer>
</template>
