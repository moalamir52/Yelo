# حماية المشاريع الخارجية

## 🛡️ المشكلة
المشاريع الخارجية مثل Summary يمكن الوصول إليها مباشرة بدون مصادقة.

## ✅ الحلول المتاحة

### الحل الأول: استخدام project-guard.js
أضف هذا الكود في بداية أي مشروع خارجي:

```html
<!-- في <head> -->
<script src="https://moalamir52.github.io/Yelo/js/project-guard.js"></script>

<!-- في نهاية <body> -->
<script>
  initProjectGuard('summary'); // اسم المشروع
</script>
```

### الحل الثاني: صفحة حماية منفصلة
استخدم رابط الحماية بدلاً من الرابط المباشر:
```
https://moalamir52.github.io/Yelo/summary-protection.html
```

### الحل الثالث: تحديث الروابط في YELO Dashboard
غير الروابط في لوحة التحكم لتشير لصفحات الحماية:

```javascript
// بدلاً من:
checkPermissionAndNavigate('summary', 'https://moalamir52.github.io/Summary/');

// استخدم:
checkPermissionAndNavigate('summary', 'https://moalamir52.github.io/Yelo/summary-protection.html');
```

## 🔧 تطبيق الحماية على Summary

### الخطوة 1: تحديث index.html في مشروع Summary
أضف في بداية الملف:
```html
<script src="https://moalamir52.github.io/Yelo/js/project-guard.js"></script>
<script>
  // فحص إذا كان الوصول محمي
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get('protected')) {
    initProjectGuard('summary');
  }
</script>
```

### الخطوة 2: تحديث الروابط في YELO
غير جميع الروابط للمشاريع الخارجية لتستخدم صفحات الحماية.

## 📋 قائمة المشاريع المحمية

| المشروع | الرابط المحمي |
|---------|---------------|
| Summary | `https://moalamir52.github.io/Yelo/summary-protection.html` |
| Operations | يحتاج حماية |
| Contracts | يحتاج حماية |
| Maintenance | يحتاج حماية |
| Reports | يحتاج حماية |

## ⚠️ ملاحظات مهمة
1. هذه الحماية تعتمد على JavaScript وليست حماية خادم
2. المستخدمون المتقدمون يمكنهم تجاوزها
3. للحماية الكاملة، يجب استخدام خادم مع مصادقة حقيقية
4. هذا الحل مناسب للحماية الأساسية فقط

## 🔄 التحديث التلقائي
عند تحديث هذا النظام، جميع المشاريع المحمية ستحصل على التحديثات تلقائياً.