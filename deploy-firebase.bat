@echo off
echo Deploying YELO Dashboard to Firebase...
firebase deploy --only hosting
echo Deployment complete!
pause