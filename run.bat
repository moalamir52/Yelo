@echo off
echo.
echo 🚀 بدء تحديث مشروع GitHub Pages...
cd /d C:\project\Yelo

echo 👉 التأكد من أنك على فرع main...
git checkout main

echo 🔄 سحب آخر التحديثات من GitHub...
git pull origin main --rebase

echo ➕ إضافة التعديلات (صور، HTML، CSS...)...
git add .

echo 💬 إدخال تعليق التحديث...
git commit -m "تحديث صورة الموقع"

echo 📤 رفع التحديث إلى GitHub...
git push origin main

echo 📁 تجاهل ملفات .rar في المستقبل...
echo *.rar>>.gitignore

echo ✅ التحديث اكتمل! افتح: https://moalamir52.github.io/Yelo/
pause
