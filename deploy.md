# دليل الرفع على GitHub

## 1. إعداد Git
```bash
git init
git add .
git commit -m "Initial commit"
```

## 2. ربط المشروع بـ GitHub
```bash
git remote add origin https://github.com/USERNAME/yelo-dashboard.git
git branch -M main
git push -u origin main
```

## 3. رفع التحديثات
```bash
git add .
git commit -m "وصف التحديث"
git push
```

## 4. نشر على GitHub Pages
```bash
npm install --save-dev gh-pages
npm run deploy
```

## 5. إعداد package.json للنشر
أضف هذا السطر في scripts:
```json
"deploy": "gh-pages -d ."
```

## نصائح الأمان:
- لا ترفع ملفات التكوين الحساسة
- استخدم متغيرات البيئة للمفاتيح
- فعل المصادقة الثنائية على GitHub