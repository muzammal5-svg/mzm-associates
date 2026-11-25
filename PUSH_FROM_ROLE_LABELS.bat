@echo off
REM Push FROM Role Dynamic Labels Implementation
REM October 27, 2026

cd /d c:\dev\mzm

echo Configuring git...
git config user.name "MZM Developer"
git config user.email "dev@mzm.pk"

echo.
echo Adding files...
git add web/lib/caseTypeConfig.ts
git add web/app/cases/new/page.tsx

echo.
echo Checking status...
git status --short

echo.
echo Committing changes...
git commit -m "feat: implement dynamic party labels when clicking FROM suggestion chips

- Add FromRolePair interface and FROM_ROLE_PAIR_MAP configuration
- Map all 12 FROM roles to corresponding party label pairs
- Include English + Urdu translations for all roles
- Add getPartyPairForFromRole() helper function
- Update New Case form to display dynamic labels based on FROM selection
- When user clicks FROM chip: party labels update instantly
- If client selected: auto-fills appropriate party field
- Preserve existing validation, submission, and database mappings
- Centralized config makes adding/updating roles easy
- All UI/UX design and spacing maintained"

echo.
echo Pushing to main...
git push -u origin main

echo.
echo Done! Changes pushed successfully.
pause
