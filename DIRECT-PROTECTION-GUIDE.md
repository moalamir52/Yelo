# دليل الحماية المباشرة للمشاريع

## 🎯 الهدف
حماية المشاريع من الوصول المباشر حتى لو كان المستخدم يملك الرابط العادي محفوظ في المتصفح.

## 🛡️ كيفية التطبيق

### الخطوة 1: إضافة الحماية لكل مشروع
أضف هذا الكود في بداية ملف `index.html` لكل مشروع:

```html
<!-- في بداية <head> مباشرة بعد <meta charset> -->
<script src="https://moalamir52.github.io/Yelo/direct-protection.js"></script>
```

### الخطوة 2: قائمة المشاريع المطلوب حمايتها

#### ✅ المشاريع التي تحتاج حماية:
1. **Operations** - `https://moalamir52.github.io/Operations/`
2. **Contracts** - `https://moalamir52.github.io/Contracts/`
3. **Maintenance** - `https://moalamir52.github.io/Maintenance/`
4. **Reports** - `https://moalamir52.github.io/Reports/`
5. **Staff** - `https://moalamir52.github.io/Staff/`
6. **Summary** - `https://moalamir52.github.io/Summary/`

#### ❌ المشاريع المستثناة:
- **glogo** - غير محمي (حسب الطلب)

## 🔧 مثال التطبيق

### في مشروع Operations:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <script src="https://moalamir52.github.io/Yelo/direct-protection.js"></script>
    <title>Operations Portal</title>
    <!-- باقي الكود... -->
</head>
```

### في مشروع Summary:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <script src="https://moalamir52.github.io/Yelo/direct-protection.js"></script>
    <title>Maintenance Summary</title>
    <!-- باقي الكود... -->
</head>
```

## 🎭 كيف يعمل النظام

### عند الوصول المباشر:
1. **فحص المصادقة**: هل المستخدم مسجل دخول في YELO؟
2. **فحص الصلاحية**: هل له صلاحية لهذا المشروع؟
3. **السماح أو المنع**: حسب النتيجة

### الرسائل التي ستظهر:
- 🚫 **Access Denied**: إذا لم يكن مسجل دخول
- ⏰ **Session Expired**: إذا انتهت صلاحية الجلسة
- 🚫 **No Permission**: إذا لم يكن له صلاحية للمشروع

### شريط الأمان:
- يظهر في أعلى الصفحة
- يعرض اسم المستخدم والمشروع
- يحتوي على أزرار Dashboard و Logout

## 📊 المراقبة والتسجيل

### الأنشطة المسجلة:
- `unauthorized_direct_access`: محاولة وصول غير مصرح بها
- `direct_project_access`: وصول مباشر ناجح

### مراجعة السجلات:
- اذهب للوحة الإدارة في YELO
- قسم "مراقبة الأنشطة"
- ابحث عن الأنشطة المشبوهة

## ⚠️ ملاحظات مهمة

### المميزات:
- ✅ حماية فورية عند تحميل الصفحة
- ✅ يعمل مع الروابط المحفوظة
- ✅ تسجيل جميع محاولات الوصول
- ✅ واجهة مستخدم واضحة

### القيود:
- ⚠️ يعتمد على JavaScript (يمكن تعطيله)
- ⚠️ حماية من جانب العميل وليس الخادم
- ⚠️ للحماية الكاملة يحتاج خادم حقيقي

## 🚀 التطبيق السريع

### لتطبيق الحماية على جميع المشاريع:
1. افتح كل مشروع على GitHub
2. عدل ملف `index.html`
3. أضف السطر في بداية `<head>`
4. احفظ التغييرات

### النتيجة النهائية:
- جميع المشاريع محمية
- لا يمكن الوصول بدون مصادقة
- تسجيل كامل للأنشطة
- تجربة مستخدم محسنة