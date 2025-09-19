@echo off
echo Updating protection URLs in all projects...

set FIREBASE_URL=https://yelo-dashboard.firebaseapp.com

echo Updating Operations Portal...
powershell -Command "(Get-Content 'd:\project\Operations Portal\yelo-protection.js') -replace 'https://moalamir52.github.io/Yelo/', '%FIREBASE_URL%/' | Set-Content 'd:\project\Operations Portal\yelo-protection.js'"

echo Updating Contract Matcher...
powershell -Command "(Get-Content 'd:\project\Contract Matcher\yelo-protection.js') -replace 'https://moalamir52.github.io/Yelo/', '%FIREBASE_URL%/' | Set-Content 'd:\project\Contract Matcher\yelo-protection.js'"

echo Updating Staff...
powershell -Command "(Get-Content 'd:\project\Staff\yelo-protection.js') -replace 'https://moalamir52.github.io/Yelo/', '%FIREBASE_URL%/' | Set-Content 'd:\project\Staff\yelo-protection.js'"

echo Updating contracts...
powershell -Command "(Get-Content 'd:\project\contracts\yelo-protection.js') -replace 'https://moalamir52.github.io/Yelo/', '%FIREBASE_URL%/' | Set-Content 'd:\project\contracts\yelo-protection.js'"

echo Updating maintenance...
powershell -Command "(Get-Content 'd:\project\maintenance\yelo-protection.js') -replace 'https://moalamir52.github.io/Yelo/', '%FIREBASE_URL%/' | Set-Content 'd:\project\maintenance\yelo-protection.js'"

echo Updating car report...
powershell -Command "(Get-Content 'd:\project\car report\yelo-protection.js') -replace 'https://moalamir52.github.io/Yelo/', '%FIREBASE_URL%/' | Set-Content 'd:\project\car report\yelo-protection.js'"

echo Updating Summary...
powershell -Command "(Get-Content 'd:\project\Summary\yelo-protection.js') -replace 'https://moalamir52.github.io/Yelo/', '%FIREBASE_URL%/' | Set-Content 'd:\project\Summary\yelo-protection.js'"

echo All protection files updated!
pause