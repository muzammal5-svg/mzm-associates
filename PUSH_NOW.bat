@echo off
REM Dark Theme Implementation - Push to Git
REM October 27, 2026

cd /d c:\dev\mzm

echo Configuring git...
git config user.name "MZM Developer"
git config user.email "dev@mzm.pk"

echo.
echo Adding files...
git add web/components/ui/Card.tsx
git add web/components/layout/BottomNav.tsx
git add web/components/layout/MobileHeader.tsx
git add web/components/ui/Modal.tsx
git add web/components/ui/Input.tsx
git add web/app/globals.css
git add web/components/ui/Toast.tsx
git add web/components/ui/EmptyState.tsx
git add web/components/ui/Skeleton.tsx
git add web/components/ui/Badge.tsx
git add web/components/ui/Button.tsx
git add DARK_THEME_FIXES.md
git add PUSH_INSTRUCTIONS.md
git add CHANGES_SUMMARY.txt

echo.
echo Checking status...
git status --short

echo.
echo Committing changes...
git commit -m "fix: implement dark theme across all UI components

- Card: Dark variant with #1a1f2e background, white text
- BottomNav: Dark background #0F1117, gold active indicator
- MobileHeader: Dark header/drawer, white text, improved contrast
- Modal: Dark backgrounds #1a1f2e with white text
- Input/Form: Dark inputs bg-white/10, white text, proper contrast
- Toast: Dark notifications with white text
- EmptyState: Gold icons on dark background, white text
- Skeleton: Dark shimmer gradients from white/10 to white/20
- Badge: All variants updated for dark theme
- Button: Secondary/ghost variants updated for dark theme

Implements complete dark theme for production launch."

echo.
echo Pushing to repository...
git push -u origin main

echo.
echo Done! Changes pushed successfully.
pause
