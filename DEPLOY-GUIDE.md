# دليل الرفع على GitHub و Firebase

## 🚀 الرفع على GitHub

### 1. إعداد Git
```bash
cd d:\project\Yelo
git init
git add .
git commit -m "Initial commit - YELO Auth System"
```

### 2. ربط GitHub Repository
```bash
git remote add origin https://github.com/yourusername/Yelo.git
git branch -M main
git push -u origin main
```

### 3. الملفات المحمية
هذه الملفات لن ترفع على GitHub (محمية بـ .gitignore):
- `firebase-config.js`
- `.env`
- `admin-config.js`

---

## 🔥 الرفع على Firebase

### 1. تثبيت Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. تسجيل الدخول
```bash
firebase login
```

### 3. إعداد المشروع
```bash
firebase init hosting
```

### 4. الرفع
```bash
firebase deploy
```

---

## 🔧 الإعداد بعد الرفع

### 1. إنشاء ملف firebase-config.js
- انسخ `firebase-config.example.js` إلى `firebase-config.js`
- أدخل بيانات Firebase الحقيقية من Console

### 2. اختبار النظام
- اذهب إلى الرابط المنشور
- جرب تسجيل الدخول: `admin` / `admin123`
- تأكد من عمل جميع الوظائف

---

## 📋 قائمة التحقق

### قبل الرفع:
- [ ] تأكد من وجود `.gitignore`
- [ ] تأكد من عدم وجود بيانات حساسة في الكود
- [ ] اختبر النظام محلياً

### بعد الرفع:
- [ ] أنشئ `firebase-config.js` مع البيانات الحقيقية
- [ ] اختبر تسجيل الدخول
- [ ] اختبر صلاحيات المستخدمين
- [ ] اختبر لوحة الإدارة

---

## 🌐 الروابط المتوقعة

### GitHub:
`https://yourusername.github.io/Yelo/`

### Firebase:
`https://your-project-id.web.app/`

---

## 🔐 بيانات تسجيل الدخول الافتراضية
- **اسم المستخدم**: `admin`
- **كلمة المرور**: `admin123`

⚠️ **مهم**: غير كلمة المرور الافتراضية بعد الرفع!