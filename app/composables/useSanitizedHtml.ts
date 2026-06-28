// app/composables/useSanitizedHtml.ts
//
// چرا این فایل لازم است:
// توضیحات محصول/شرکت/مرکز رشد/دانشگاه به‌صورت HTML خام در دیتابیس ذخیره و با v-html
// در صفحات مختلف نمایش داده می‌شود. تا الان هیچ پاکسازی (Sanitize) ای روی این HTML
// انجام نمی‌شد. اگر یک کاربر (شرکت، یا یک اکانت هک‌شده) به‌جای استفاده از خودِ ادیتور،
// مستقیماً درخواست API بفرستد، می‌تواند کد جاوااسکریپت مخرب (XSS) درون توضیحات محصول
// تزریق کند که برای هر کاربری که آن صفحه را باز می‌کند اجرا می‌شود. این کامپوزبل با
// DOMPurify فقط تگ‌ها و ویژگی‌های لازم برای محتوای ادیتور متن غنی (FeatureRichTextEditor)
// را مجاز می‌کند و بقیه (script, iframe, onClick و امثال آن) را حذف می‌کند.
//
// نکته: این یک لایه‌ی دفاعی سمت کلاینت است. توصیه می‌شود سمت بک‌اند هم یک Sanitizer
// (مثلاً پکیج NuGet به‌نام HtmlSanitizer) روی Description در لحظه‌ی ذخیره اضافه شود
// تا دفاع دو لایه (Defense in Depth) داشته باشیم.
import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark', 'code', 'pre',
  'ul', 'ol', 'li',
  'blockquote',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td'
]

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
  'colspan', 'rowspan', 'width', 'height'
]

export const useSanitizedHtml = () => {
  const sanitize = (dirtyHtml: string | null | undefined): string => {
    if (!dirtyHtml) return ''
    return DOMPurify.sanitize(dirtyHtml, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      // جلوگیری از href="javascript:..." و امثال آن
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
    })
  }

  return { sanitize }
}
