@echo off
echo Adding login page and deploying...

git add .
git commit -m "Add login.html - fix 404 error"
git push origin main

echo.
echo Deploying to GitHub Pages...
npm run deploy

echo.
echo Login page added! 
echo Admin: admin / admin123
echo User: user / user123
pause