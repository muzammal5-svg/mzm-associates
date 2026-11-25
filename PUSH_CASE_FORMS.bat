@echo off
REM Push Case Form Updates
REM October 27, 2026

cd /d c:\dev\mzm

echo Configuring git...
git config user.name "MZM Developer"
git config user.email "dev@mzm.pk"

echo.
echo Adding files...
git add web/app/cases/edit/page.tsx

echo.
echo Checking status...
git status --short

echo.
echo Committing changes...
git commit -m "feat: update edit case form with fresh diary and current proceeding fields

- Replace Judge/Bench field with Fresh Diary DatePicker
- Update Description label to Current Proceeding  
- Add DatePicker import for date selection
- Map fresh_diary form field to judge_name column
- Support dynamic case type party label updates
- All validation and functionality maintained
- UI/UX design and spacing intact
- Backwards compatible with existing cases"

echo.
echo Pushing to main...
git push -u origin main

echo.
echo Done! Changes pushed successfully.
pause
