# 🔧 Troubleshooting Guide

## Common Issues & Solutions

---

## ❌ CLIENT NOT BEING ADDED

### Symptom
"Add New Client" form appears to work but client doesn't save.

### Diagnosis

#### Step 1: Check Browser Console
```
Press F12 → Console tab
Look for red error messages
```

**Common errors**:

#### Error: "Write permission denied" or "RLS Policy Violation"
**Cause**: User role is not `lawyer` or `admin`

**Solution**:
1. Log out (`/auth/sign-out`)
2. Log back in as: `lawyer@mzm.pk` / `Lawyer1234!`
3. Try adding client again

**Why**: RLS policy requires:
```sql
firm_id = current_firm_id() 
AND write_access(firm_id) 
AND is_lawyer_or_above()
```

---

#### Error: "Invalid phone format"
**Cause**: Phone number doesn't match Pakistani format

**Solution**:
Use one of these formats:
- `03001234567` (without + and country code)
- `003001234567` (with 00 prefix)
- `+923001234567` (with + and country code)

**❌ Don't use**: `1234567`, `0123456`, `923001234567` (no leading 0)

---

#### Error: "CNIC already exists" or "Phone already exists"
**Cause**: Duplicate data

**Solution**:
1. Use different CNIC or phone number
2. Check if client already exists in list
3. If you want to add anyway → Ignore warning and save

---

#### Error: "Email is not valid"
**Cause**: Invalid email format

**Solution**:
Use proper email: `firstname.lastname@domain.com`

---

#### Error: "Network error" or "Failed to fetch"
**Cause**: Connection issue or server down

**Solution**:
1. Check internet connection
2. Refresh page (`F5`)
3. Check if dev server is running (`npm run dev`)
4. Restart server if needed

---

### Step 2: Check User Profile
```
Go to Settings → My Profile
Verify:
- Firm is assigned
- Role shows "Lawyer" or "Admin"
- Not showing as "Viewer" or "Secretary"
```

---

### Step 3: Verify Database (Advanced)
If error messages don't help:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run:
```sql
SELECT * FROM public.profiles 
WHERE id = current_user_id();
```

Check:
- `firm_id` is NOT null
- `role` is `lawyer` or `admin`

---

## ❌ CASE NOT BEING ADDED

### Symptom
Case form submits but case doesn't appear in list.

### Solution
Same as Client issues above:

1. **Check console for errors** (F12)
2. **Verify user role** (Settings → Profile)
3. **Try different data** (use simpler case title)

### Case-Specific Checks

#### Fields Required
- ✅ Case Reference
- ✅ Case Title  
- ✅ Case Type
- ✅ Court
- ✅ Plaintiff
- ✅ Defendant
- ✅ First Hearing Date

If any are empty → Error shows on field

#### Date Issues
- Date must be in future
- Date format depends on browser locale
- Use date picker (not manual typing)

---

## ❌ SIDEBAR NOT DISPLAYING PROPERLY

### Symptom
Sidebar text is cut off or overlapping

### Causes & Solutions

#### Issue: Text Truncation (Urdu)
**Cause**: Urdu text is wider than English

**Solution**:
- This is expected and OK
- Expanded sidebar shows full text
- Hover shows tooltip with full name

#### Issue: Sidebar Not Opening
**Cause**: JavaScript issue or CSS conflict

**Solution**:
1. Refresh page (`F5`)
2. Clear cache (`Ctrl+Shift+Delete`)
3. Restart dev server

#### Issue: Z-Index Problem (Drawer over page)
**Cause**: Sidebar appearing under page content

**Solution**:
Already fixed in recent builds. If still broken:
1. Check browser DevTools → Elements tab
2. Verify z-index values
3. Clear cache and rebuild

---

## ❌ FORMS NOT SUBMITTING

### Symptom
Click "Save" but nothing happens

### Causes

#### Issue 1: Validation Errors
**Check**: Red error messages on form
**Solution**: Fix all errors before submitting

#### Issue 2: Long Loading
**Check**: Look for loading spinner
**Expected**: Usually takes 1-2 seconds
**Solution**: Wait a bit, then try again

#### Issue 3: Silent Failure
**Check**: Open console (F12) for error messages
**Solution**: Report error message to support

---

## ❌ SEARCH NOT WORKING

### Symptom
Type search term but results don't filter

### Causes

#### Issue 1: Debounce Delay
**Cause**: Search intentionally waits 500ms before searching
**Solution**: Wait a moment after typing

#### Issue 2: Empty Results
**Cause**: No matches for search term
**Solution**: Try different search term or clear search

#### Issue 3: Search Index Not Updated
**Cause**: Very rare - cache issue
**Solution**: Refresh page

---

## ❌ RESPONSIVE DESIGN BROKEN

### Symptom
Page looks bad on mobile

### Diagnosis

#### Check What's Broken
```
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
Select: iPhone 12 or iPad
Scroll horizontally → Is there overflow?
```

#### Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Text too small | Font size too large | Zoom out in DevTools |
| Horizontal scroll | Fixed width table | Reduce table columns or add scroll |
| Buttons too small | Padding issue | Add min-height: 44px |
| Card overlap | Flex wrapping issue | Check grid/flex settings |

#### Solution Steps
1. Open browser DevTools (F12)
2. Inspect element causing issue
3. Check CSS in Styles tab
4. Look for `width`, `flex`, `grid` properties
5. Adjust breakpoints in Tailwind config

---

## ❌ STYLES NOT SHOWING

### Symptom
Dark theme not applied, or colors look wrong

### Causes

#### Issue 1: CSS Not Loaded
**Solution**:
1. Hard refresh (`Ctrl+F5`)
2. Clear cache
3. Rebuild (`npm run dev`)

#### Issue 2: Class Not Applied
**Check**: Inspect element (F12)
Look for `class="..."` on element

#### Issue 3: Tailwind Config Issue
**Check**: `tailwind.config.ts`
Verify color definitions exist

---

## ❌ FEATURES PAGE SHOWS TRANSLATION KEYS

### Symptom
Page displays `features.caseManagement` instead of "Case Management"

### Cause
Translation key not found in `en.json`

### Solution
Check if translation keys are in file:
```
Open: web/i18n/locales/en.json
Search for: features.caseManagement
Expected: Should find "caseManagement": "Case Management"
```

If not found:
- Add key to en.json
- Rebuild (`npm run dev`)
- Refresh browser

---

## ✅ DEBUGGING TIPS

### Useful Shortcuts

```javascript
// In browser console (F12)

// Check current user
console.log(localStorage.getItem('supabase.auth.token'))

// Check current language
console.log(localStorage.getItem('i18nextLng'))

// Check query cache
// In React DevTools: Queries tab

// Check errors
// Network tab: Look for failed requests (red)
```

### Debug Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (add client, add case, etc.)
4. Look for failed requests (red text)
5. Click request → Response tab for error details

### Check Component State

1. Install React DevTools (Chrome extension)
2. Go to Components tab
3. Select component
4. Check Props and Hooks in right panel

---

## 🆘 STILL STUCK?

### Information to Gather

Before reporting issue, collect:

1. **Browser**: Chrome, Firefox, Safari, Edge?
2. **Device**: Desktop, Mobile, Tablet?
3. **Error message**: Copy exact error (F12 Console)
4. **Steps to reproduce**: How to see the issue?
5. **Screenshots**: Visual proof of problem
6. **Network tab**: Any failed requests?
7. **Console errors**: Any red messages?

### Report Template

```markdown
### Issue Title
[One-line description]

### Environment
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile]
- URL: [http://localhost:3000/page]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Error Message
[Console error, if any]

### Screenshots
[Attach image]
```

### Contact Support
- **Discord**: [Channel link]
- **Email**: support@mzm.pk
- **WhatsApp**: [Support number]

---

## 🎯 QUICK FIX COMMANDS

```bash
# Clear cache and rebuild
npm run dev

# Kill server and restart
# Ctrl+C → npm run dev

# Hard refresh browser
Ctrl+F5 (or Cmd+Shift+R on Mac)

# Clear browser cache
F12 → Settings → Storage → Clear site data

# Check TypeScript
npm run typecheck

# Check linting
npm run lint

# View Supabase logs
supabase functions list
```

---

## 📊 Status Page Reference

Check if services are down:

- **Supabase**: https://status.supabase.com
- **Vercel**: https://www.vercel-status.com
- **GitHub**: https://www.githubstatus.com

---

## 🔄 Reset to Clean State

If everything is broken:

```bash
# Stop dev server
Ctrl+C

# Clear node modules cache
npm cache clean --force

# Reinstall dependencies
npm install

# Restart dev server
npm run dev

# Hard refresh browser
Ctrl+F5
```

---

## 📝 Common Error Messages & Meanings

| Message | Meaning | Solution |
|---------|---------|----------|
| "Write permission denied" | RLS policy rejected | Check user role |
| "Invalid phone format" | Phone doesn't match pattern | Use correct format |
| "CNIC already exists" | Duplicate CNIC | Use different CNIC |
| "Network error" | Connection issue | Check internet |
| "Failed to fetch" | API error | Restart server |
| "TypeError: cannot read property" | Null reference error | Check if data exists |
| "404 Not Found" | Page doesn't exist | Check URL |
| "500 Internal Server Error" | Server error | Restart server |

---

**Last Updated**: October 2026
**Version**: 1.0

Still need help? See COMPREHENSIVE_TESTING_GUIDE.md for detailed testing steps.
