@echo off
echo.
echo 🚀 Starting GitHub Pages project update...
cd /d C:\project\Yelo

echo 👉 Switching to main branch...
git checkout main

echo 🔄 Pulling latest updates from GitHub...
git pull origin main --rebase

echo ➕ Adding modified files (images, HTML, CSS...)...
git add .

echo 💬 Committing the update...
git commit -m "Website image update"

echo 📤 Pushing update to GitHub...
git push origin main

echo 📁 Ignoring .rar files in future commits...
echo *.rar>>.gitignore

echo ✅ Update complete! Open: https://moalamir52.github.io/Yelo/
pause
