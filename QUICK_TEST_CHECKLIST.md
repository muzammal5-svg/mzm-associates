# ⚡ QUICK TEST CHECKLIST - 30 Min Version

## 🔐 Login
- User: `lawyer@mzm.pk`
- Password: `Lawyer1234!`

---

## 📊 DASHBOARD CHECK (2 min)

### Visual Design
- [ ] Dark background `#0F1117` ✓
- [ ] Cards are `#1a1f2e` ✓
- [ ] Gold accents visible ✓
- [ ] No glaring text issues ✓

### Stats Cards
- [ ] Today's Hearings count
- [ ] Running Cases count
- [ ] Total Clients count
- [ ] Upcoming Reminders count

### Functionality
- [ ] Cause list displays (or "no hearings" message)
- [ ] "View All" buttons work
- [ ] Responsive on mobile

---

## 👥 ADD CLIENT TEST (5 min)

### Form Fields
Fill with real-looking data:
```
Full Name: Muhammad Ali Khan
Father Name: Ahmed Khan
CNIC: 35201-1234567-1
Phone: 03001234567
WhatsApp: (auto-fills)
Email: muhammadali@example.com
Address: 123 Main Street, Lahore
City: Lahore
```

### Submit
- [ ] **CLICK "Save & Continue"**
- [ ] **SUCCESS**: Toast says "Muhammad Ali Khan added."
  - If YES ✅ → Proceed to next test
  - If NO ❌ → **Check browser console for error**

### If Error Appears
Error type | Likely cause | Fix
--- | --- | ---
"Write permission denied" | User role issue | Log in as `lawyer@mzm.pk`
"Invalid phone" | Bad format | Use `03001234567` or `+923001234567`
"CNIC already exists" | Duplicate | Use different CNIC
"Network error" | Connection | Refresh page, try again

### After Success
- [ ] Navigate to `/clients` page
- [ ] New client appears in list
- [ ] Client name visible
- [ ] Case count shows "0"

---

## 📋 ADD CASE TEST (5 min)

### Form Fields
Fill with test data:
```
Case Reference: 123/2024
Case Title: Muhammad vs Government
Case Type: Criminal
Court: High Court
Court Number: 5
Judge Name: Justice Ali
Plaintiff: Muhammad Ahmed Khan
Defendant: Government of Pakistan
First Hearing Date: [Select future date]
```

### Submit
- [ ] **CLICK "Save"**
- [ ] **SUCCESS**: Case created message
  - If YES ✅ → Proceed to next test
  - If NO ❌ → Check console error

### After Success
- [ ] Go to `/cases`
- [ ] New case appears in Running Cases
- [ ] Case reference visible
- [ ] Court and judge shown

---

## 🔔 REMINDERS TEST (2 min)

### Check Auto-Reminder
- [ ] Go to `/reminders`
- [ ] You should see new reminder (for case from above)
- [ ] **If YES**: Auto-reminder system works ✅
- [ ] **If NO**: ❌ Flag as issue

---

## 📱 MOBILE TEST (5 min)

### DevTools Mobile Mode
1. Press `F12` → Toggle device toolbar (`Ctrl+Shift+M`)
2. Select "iPhone 12" size

### Check Each Page
- [ ] Dashboard (Mobile view)
  - Stats stack vertically
  - Text readable
  - No overflow
- [ ] Clients list
  - Single column
  - Buttons large enough
  - Search works
- [ ] Cases list
  - Single column
  - Scrollable table
  - Clickable rows

### Responsive Verdict
- [ ] All pages look good on mobile ✅
- [ ] Something broken ❌

---

## 🎨 DESIGN CHECK (3 min)

### Color Verification
- [ ] Background dark (not bright) ✓
- [ ] Cards visible on background ✓
- [ ] Gold buttons stand out ✓
- [ ] Text readable (no color contrast issues) ✓

### Typography
- [ ] Headings are bold/large ✓
- [ ] Body text readable ✓
- [ ] Labels are small/muted ✓

### Spacing
- [ ] Cards have proper padding ✓
- [ ] Sections have gaps ✓
- [ ] Not cramped ✓

### Hover Effects
- [ ] Buttons highlight on hover ✓
- [ ] Cards slightly change on hover ✓
- [ ] Smooth (not instant) ✓

---

## 🛡️ ERROR HANDLING (3 min)

### Test Each Scenario

#### 1. Empty Form Submit
- [ ] Click "Save" with empty form
- [ ] **Expected**: Error messages show ✓

#### 2. Invalid Phone
- [ ] Type phone as `1234567`
- [ ] **Expected**: "Invalid Pakistani mobile" error ✓

#### 3. Search with No Results
- [ ] Go to Clients
- [ ] Search for "xyzabc"
- [ ] **Expected**: "No clients found" message ✓

#### 4. Empty Client/Case Lists
- [ ] Add new user (or clear data)
- [ ] **Expected**: "Get started..." message ✓

---

## 🚀 PERFORMANCE (2 min)

### Load Times
Open DevTools → Network tab:

- [ ] Dashboard loads in < 2s ✓
- [ ] Form submits in < 2s ✓
- [ ] Client list loads in < 1s ✓
- [ ] No 404 or 500 errors ✓

### Console Check
- [ ] Press `F12` → Console tab
- [ ] **Expected**: No red error messages
- [ ] Some yellow warnings are OK (not critical)

---

## ✅ FINAL VERIFICATION

### Dashboard Status
- [ ] Design looks professional
- [ ] All stats work
- [ ] Responsive
- [ ] **OVERALL**: ✅ PASS / ❌ FAIL

### Client Feature Status
- [ ] Can add clients
- [ ] Clients appear in list
- [ ] Search/filter work
- [ ] **OVERALL**: ✅ PASS / ❌ FAIL

### Case Feature Status
- [ ] Can add cases
- [ ] Cases appear in list
- [ ] Reminders auto-create
- [ ] **OVERALL**: ✅ PASS / ❌ FAIL

### Design Status
- [ ] Dark theme applied
- [ ] Gold accents correct
- [ ] Responsive design works
- [ ] **OVERALL**: ✅ PASS / ❌ FAIL

### Performance Status
- [ ] Fast loading
- [ ] No console errors
- [ ] Smooth interactions
- [ ] **OVERALL**: ✅ PASS / ❌ FAIL

---

## 📌 ISSUES FOUND

### Issue #1
**What**: [Describe the problem]
**Where**: [Page/Feature]
**Severity**: 🔴 Critical / 🟡 Medium / 🟢 Low
**Steps to Reproduce**: [How to see it]

### Issue #2
[Same format]

### Issue #3
[Same format]

---

## 🎯 TESTING RESULT

```
┌─────────────────────────────────┐
│  OVERALL STATUS                 │
├─────────────────────────────────┤
│ Dashboard:      ✅ / ❌        │
│ Clients:        ✅ / ❌        │
│ Cases:          ✅ / ❌        │
│ Design:         ✅ / ❌        │
│ Performance:    ✅ / ❌        │
├─────────────────────────────────┤
│ READY FOR PRODUCTION: ✅ / ❌  │
└─────────────────────────────────┘
```

---

## 🔗 Quick Links

- **Dev Server**: http://localhost:3000
- **Full Testing Guide**: COMPREHENSIVE_TESTING_GUIDE.md
- **Demo Credentials**: docs/demo-credentials.md
- **Marketing Pages**: /features, /faq, /pricing, /contact

---

**Time Estimate**: 30 minutes
**Test Date**: _______________
**Tester Name**: _______________
