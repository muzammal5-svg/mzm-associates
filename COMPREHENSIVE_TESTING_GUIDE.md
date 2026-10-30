# 🧪 MZM Comprehensive Testing Guide
## Dashboard, Client Entry & Case Management

---

## 📋 TEST SETUP

### Step 1: Start Development Server
```bash
cd web
npm run dev
# Server runs at http://localhost:3000
```

### Step 2: Access the Application
- **URL**: http://localhost:3000/auth/sign-in
- **Recommended Test User**: `lawyer@mzm.pk` / `Lawyer1234!` (has full access)

### Step 3: Create/Access Firm
- Once logged in, you'll be taken to dashboard or firm setup
- Ensure you have an active subscription or trial

---

## ✅ TEST CHECKLIST

### Part 1: DASHBOARD (Landing & Overview)
**Location**: `/` (home page after login)

#### Visual Design ✨
- [ ] **Background Color**: Dark navy `#0F1117` - looks professional, not too bright
- [ ] **Card Styling**: Light surfaces `#1a1f2e` with white/5 borders
- [ ] **Gold Accents**: Numbers/CTAs in gold `#d4a960`
- [ ] **Text Contrast**: All text readable on dark background
- [ ] **Spacing**: Proper padding (16px, 24px, 32px) between sections
- [ ] **Icons**: All icons render correctly with gold color

#### Dashboard Stats Section
- [ ] "Today's Hearings" card shows correct count (or "No hearings scheduled")
- [ ] "Running Cases" card displays total count
- [ ] "Total Clients" card shows count
- [ ] "Upcoming Reminders" card visible
- [ ] Stat cards have proper hover effects (border changes to gold)
- [ ] Numbers are large and readable

#### Today's Cause List
- [ ] Table/list shows hearings for today
- [ ] Columns: Serial No., Case Ref., Parties, Court, Judge, Time
- [ ] Search functionality works (if data exists)
- [ ] "View All" button links to cause list page
- [ ] Empty state message if no hearings today

#### Responsive Design
- [ ] **Mobile (320-480px)**:
  - Stats stack vertically
  - Text is readable
  - Cards don't overlap
- [ ] **Tablet (640-1024px)**:
  - 2 columns of stats
  - Table/list scrollable horizontally
- [ ] **Desktop (1200px+)**:
  - 4 stats in row
  - Full table visible

---

### Part 2: SIDEBAR NAVIGATION ⬅️

#### Sidebar Appearance
- [ ] **Background**: Dark `#0F1117`
- [ ] **Hover Effect**: Items highlight with gold accent
- [ ] **Icons**: All visible with proper colors
- [ ] **Text**: Readable, not truncated (in expanded state)

#### Sidebar Links (Check Each)
- [ ] **Dashboard** - links to home
- [ ] **Cause List** - links to `/cause-list`
- [ ] **Cases** - shows submenu:
  - [ ] Running Cases
  - [ ] Decided Cases
  - [ ] New Case
- [ ] **Clients** - links to `/clients`
- [ ] **Documents** - links to `/documents`
- [ ] **Important Forms** - links to `/important-forms`
- [ ] **Case Laws** - links to `/case-laws`
- [ ] **Reminders** - links to `/reminders`
- [ ] **More** - links to `/more`
- [ ] **Settings** - links to `/settings`

#### Sidebar Collapse/Expand
- [ ] Sidebar expands to 280px on desktop
- [ ] Sidebar collapses to 80px
- [ ] Toggle button works
- [ ] Icons still visible when collapsed
- [ ] Smooth animation (not jarring)

#### Multi-Language Support (Sidebar)
- [ ] Urdu text displays properly in sidebar
- [ ] RTL alignment works when in Urdu mode
- [ ] No text truncation in Urdu

---

### Part 3: CLIENTS MANAGEMENT ➕

#### Adding a New Client
**Location**: Click sidebar → Clients → "Add New Client" button

##### Step 1 Form (Personal Info)
**Fields to Fill**:
```
Full Name*: Muhammad Ali Khan (required, 2-120 chars)
Father/Husband Name: (optional, max 120 chars)
CNIC: 35201-1234567-1 (optional, format validation)
Phone*: 03001234567 (required, must be Pakistani mobile)
WhatsApp: [Auto-fills from phone]
Email: example@test.com (optional, email validation)
Address: 123 Street, Lahore (optional, max 300 chars)
City: (optional, dropdown)
```

**Test Case 1: Valid Client Entry**
- [ ] Fill all required fields correctly
- [ ] Click "Save & Continue" button
- [ ] **Expected**: Success toast "Muhammad Ali Khan added."
- [ ] **Check**:
  - Form clears
  - Navigate to Step 2 (document upload)
  - OR if no docs, go to client view page
- [ ] **If fails**: Check browser console for error message

**Test Case 2: Form Validation**
- [ ] Leave Full Name empty → "Minimum 2 characters" error shows
- [ ] Leave Phone empty → "Phone is required" error shows
- [ ] Enter invalid phone → "Enter a valid Pakistani mobile number" error shows
- [ ] Enter invalid email → "Invalid email" error shows
- [ ] Enter invalid CNIC → "Format: 35201-1234567-1" error shows
- [ ] Fix errors → button becomes enabled

**Test Case 3: Phone Normalization**
- [ ] Enter `03001234567` → Should normalize to `+92 300 1234567`
- [ ] Enter `003001234567` → Should work
- [ ] Enter `+923001234567` → Should work
- [ ] Invalid format `1234567` → Should error

**Test Case 4: Duplicate Detection**
- [ ] After adding first client, try adding same phone number
- [ ] **Expected**: Warning appears "Phone already exists"
- [ ] **Warning can be dismissed**: Form still allows save (it's just a warning)

**Test Case 5: localStorage Draft Save**
- [ ] Fill form partially
- [ ] Close tab/navigate away
- [ ] Come back to clients/new
- [ ] **Expected**: Draft values preserved (if saved recently)

#### Step 2: Document Upload (Optional)
- [ ] Upload button visible
- [ ] Accepts PDF, Images, Word docs
- [ ] Max 50MB per file
- [ ] Multiple files can be uploaded
- [ ] Progress bar shows upload progress
- [ ] "Skip" button to skip upload
- [ ] "Done" button to complete

#### Viewing Added Clients
**Location**: `/clients` page

- [ ] **New client appears in list**
- [ ] Client name visible
- [ ] Phone number shown
- [ ] Case count shows (0 for new client)
- [ ] Search works (type client name)
- [ ] Filters work (Active/Inactive)
- [ ] Pagination works (if 20+ clients)
- [ ] Click client → Goes to client detail page

#### Client Detail Page
- [ ] All client info displays
- [ ] Edit button → Edit form
- [ ] View cases tab → Shows associated cases
- [ ] Documents tab → Shows uploaded docs
- [ ] Activity log → Shows changes

---

### Part 4: CASE ENTRY 📋

#### Adding a New Case
**Location**: Click sidebar → Cases → "New Case" OR Dashboard → "New Case Entry"

##### Case Form Fields
```
Case Reference*: 123/2024 (required)
Case Title*: Muhammad vs Government (required)
Case Type*: (dropdown - Criminal, Civil, etc.)
Court*: (dropdown - High Court, District Court, etc.)
Court Number: 5 (optional)
Judge Name: Justice Ali (optional)
Plaintiff*: Muhammad Ahmed Khan
Defendant*: Government of Pakistan
First Hearing Date*: (date picker)
Current Proceeding: Details of today's proceedings (optional)
Description: Case description (optional)
```

**Test Case 1: Valid Case Entry**
- [ ] Fill all required fields
- [ ] Click "Save" button
- [ ] **Expected**: Success toast "Case created successfully"
- [ ] Case appears in "Running Cases"
- [ ] Reminder auto-set for 10 days before next hearing

**Test Case 2: Form Validation**
- [ ] Leave Case Reference empty → Error
- [ ] Leave Plaintiff empty → Error
- [ ] Leave Defendant empty → Error
- [ ] Submit form with errors → No submission, errors highlighted

**Test Case 3: Add Multiple Cases**
- [ ] Create 3-5 test cases with different data
- [ ] All appear in Running Cases list
- [ ] Search works (by case ref, plaintiff, defendant)
- [ ] Filter by court/judge works
- [ ] Pagination works

#### Viewing Cases in List
**Location**: `/cases`

- [ ] All running cases displayed
- [ ] Columns: Ref, Title, Court, Judge, Next Date, Status
- [ ] **Search works for**: Case ref, plaintiff, defendant, case type
- [ ] **Filter by**:
  - [ ] Court
  - [ ] Judge
  - [ ] Date range (Next Date From/To)
  - [ ] Status
- [ ] **Sorting**:
  - [ ] By reference number
  - [ ] By next date (ascending/descending)
- [ ] Pagination (20 per page)
- [ ] Click row → Goes to case detail

#### Case Detail View
**Location**: Click on any case

- [ ] **Overview Tab**:
  - [ ] All case info displayed
  - [ ] Parties shown clearly
  - [ ] Court/Judge info visible
  - [ ] Edit button works
- [ ] **Hearings Tab**:
  - [ ] List of all hearings (first + updates)
  - [ ] Serial numbers, dates, proceedings
  - [ ] "Add Hearing Update" button
  - [ ] Shows next date clearly
- [ ] **Documents Tab**:
  - [ ] Upload documents
  - [ ] View/Download uploaded files
  - [ ] Delete files
- [ ] **Notes Tab**:
  - [ ] View case notes
  - [ ] Add new notes
  - [ ] Edit/delete notes
  - [ ] Shows who added note + timestamp
- [ ] **Activity Tab**:
  - [ ] Shows all changes/updates
  - [ ] Who changed what + timestamp

#### Update Hearing Date
**Location**: Case Detail → Hearings Tab → "Add Hearing Update"

- [ ] **Next Hearing Date field**: Picker works
- [ ] **Current Proceeding**: Text field for today's summary
- [ ] **Next Proceeding**: Text field for what's expected
- [ ] Click "Save Update"
- [ ] **Expected**:
  - New hearing row created
  - Reminder auto-set for 10 days
  - Activity log updated
  - Success toast shows

#### Mark Case as Decided
**Location**: Case Detail → Overview Tab

- [ ] **Decision Date**: Picker works
- [ ] **Outcome**: Dropdown (Won/Lost/Dismissed/Settled/Withdrawn)
- [ ] **Decision Notes**: Text area for summary
- [ ] **Upload Final Order**: File upload
- [ ] Click "Mark as Decided"
- [ ] **Expected**:
  - Case moves to "Decided Cases"
  - All reminders dismissed
  - Activity log updated
  - Can reopen if needed

---

### Part 5: REMINDERS & NOTIFICATIONS 🔔

#### Auto-Generated Reminders
- [ ] After adding case with hearing date → Reminder created 10 days before
- [ ] After updating hearing date → New reminder set for 10 days
- [ ] Reminders page shows all upcoming reminders
- [ ] Reminders sorted by date (nearest first)

#### Reminders Management
**Location**: `/reminders`

- [ ] **Upcoming Tab**: Shows future reminders
- [ ] **Done Tab**: Shows completed reminders
- [ ] **Dismissed Tab**: Shows ignored reminders
- [ ] Each reminder shows:
  - [ ] Case reference
  - [ ] Hearing date
  - [ ] Days left countdown
  - [ ] Mark Done button
  - [ ] Dismiss button

#### Reminder Notifications
- [ ] Push notifications (if enabled in browser)
- [ ] Email reminders (if configured)
- [ ] In-app notification badges

---

### Part 6: CAUSE LIST 📅

#### Daily Cause List View
**Location**: `/cause-list`

- [ ] **Date Picker**: Select date to view hearings
- [ ] **Default**: Today's hearings shown
- [ ] **List Columns**: Serial, Case Ref, Parties, Court, Judge, Time
- [ ] **Total Cases**: Shows count of today's hearings
- [ ] **Export to PDF**:
  - [ ] Button visible
  - [ ] Downloads PDF
  - [ ] PDF contains all hearings
  - [ ] PDF is formatted nicely
- [ ] **Share Feature**:
  - [ ] Copy to clipboard works
  - [ ] Share link works (if enabled)

#### Navigation
- [ ] Previous Day button works
- [ ] Next Day button works
- [ ] "Today" button returns to current date
- [ ] Date picker jumps to selected date

---

### Part 7: RESPONSIVE DESIGN TEST 📱

#### Mobile (iPhone/Android)
- [ ] All pages load properly
- [ ] Text is readable (no tiny fonts)
- [ ] Buttons are large enough to tap (min 44x44px)
- [ ] Forms are single column
- [ ] Tables/lists scroll horizontally
- [ ] No horizontal overflow
- [ ] Sidebar drawer works
- [ ] Navigation drawer opens/closes

#### Tablet (iPad)
- [ ] Two-column layout works
- [ ] Stats in 2x2 grid
- [ ] Tables partially visible (scroll to see all)
- [ ] Forms comfortable width

#### Desktop (1200px+)
- [ ] Full layout with sidebar
- [ ] Tables fully visible
- [ ] 3-4 column grids
- [ ] Stats in 4-column row

---

### Part 8: DESIGN CONSISTENCY ✨

#### Color Scheme Verification
- [ ] **Background**: `#0F1117` (used on main pages)
- [ ] **Surface**: `#1a1f2e` (cards, inputs)
- [ ] **Border**: `white/5` opacity (subtle borders)
- [ ] **Text**: `white` with opacity (white/70, white/60, white/50)
- [ ] **Accent**: Gold `#d4a960` (links, buttons, highlights)
- [ ] **Success**: Green (confirmations)
- [ ] **Error**: Red (errors, warnings)
- [ ] **Warning**: Amber (cautions)

#### Typography
- [ ] **Headings**: Font-heading, bold, larger sizes
- [ ] **Body**: Font-body, readable size, line-height
- [ ] **Labels**: Small, muted color
- [ ] **Mono**: Code/reference numbers in monospace
- [ ] **Urdu**: Different font (font-urdu if applicable)

#### Components
- [ ] **Buttons**:
  - [ ] Primary (Gold background)
  - [ ] Secondary (Border + text)
  - [ ] Tertiary (Ghost/minimal)
  - [ ] Hover effects smooth
  - [ ] Active state clear
- [ ] **Inputs**:
  - [ ] Background `#1a1f2e`
  - [ ] Border `white/10`
  - [ ] Focus border gold
  - [ ] Placeholder text visible
  - [ ] Error state red
- [ ] **Cards**:
  - [ ] Rounded corners
  - [ ] Subtle shadows
  - [ ] Hover lift effect
  - [ ] Consistent padding
- [ ] **Tables**:
  - [ ] Header bold, muted
  - [ ] Rows alternate stripe (subtle)
  - [ ] Hover highlights row
  - [ ] Borders visible but not heavy

#### Spacing
- [ ] Sections have consistent gutters
- [ ] Cards have proper internal padding
- [ ] Lists have consistent item height
- [ ] Buttons have proper internal padding

---

### Part 9: PERFORMANCE & SPEED ⚡

- [ ] **Page Load**: Dashboard loads in < 2 seconds
- [ ] **Client Add**: Form submits in < 2 seconds
- [ ] **Case Add**: Form submits in < 2 seconds
- [ ] **List Load**: Cases/Clients list renders in < 1 second
- [ ] **Search**: Results appear as you type (no lag)
- [ ] **Filter**: Filters apply immediately
- [ ] **No Console Errors**: Check DevTools → Console (should be clean)

---

### Part 10: ERROR HANDLING & EDGE CASES 🛡️

#### Form Errors
- [ ] Validation errors show clearly
- [ ] Error messages are helpful (not cryptic)
- [ ] Multiple errors can be shown
- [ ] Errors disappear when fixed

#### Network Errors
- [ ] No internet → Error message shown
- [ ] Network timeout → Retry button appears
- [ ] Server error (500) → User-friendly message

#### Empty States
- [ ] No clients → "Get started by adding your first client" message
- [ ] No cases → "No running cases yet" message
- [ ] No reminders → "No upcoming reminders" message
- [ ] Empty search results → "No clients match..." message

#### Authentication
- [ ] Logged out → Redirected to login
- [ ] Session expired → Re-login prompt
- [ ] Permission denied → Error message

---

## 🐛 ISSUE TRACKING

### Known Issues to Check

#### Issue 1: Client Not Adding (RLS Policy)
**If client add fails**:
1. Check browser console → Network tab
2. Look for 403 Forbidden or "RLS" error
3. **Solution**: User might be in `viewer` role, needs `lawyer` or higher
4. Verify: Log in as `lawyer@mzm.pk` (has lawyer role)

#### Issue 2: Sidebar Text Truncation (Urdu)
**If Urdu text cuts off in sidebar**:
1. This is expected for long words
2. Hover tooltip should show full text
3. Expanded sidebar shows full text

#### Issue 3: Reminder Not Auto-Creating
**If no reminder created after case added**:
1. Check if hearing date is in future
2. Check if next_date is set on case
3. Verify user has access to cases table

---

## 📝 TEST LOG TEMPLATE

```markdown
### Test: [Test Name]
**Date**: YYYY-MM-DD
**Tester**: [Your Name]
**User Role**: [Admin/Lawyer/Clerk]

#### Results
- [ ] Feature works as expected
- [ ] Design looks good
- [ ] No errors in console
- [ ] Responsive on mobile

#### Issues Found
1. [Issue description]
2. [Issue description]

#### Screenshots
[Attach any relevant screenshots]

#### Status
- [ ] PASS
- [ ] FAIL (needs fix)
- [ ] PARTIAL (some features work)
```

---

## 🎯 SUCCESS CRITERIA

### Dashboard ✅
- [ ] Loads without errors
- [ ] All stats display correctly
- [ ] Responsive on mobile
- [ ] Design matches spec (#0F1117 bg, gold accents)

### Client Management ✅
- [ ] Can add new client
- [ ] Form validation works
- [ ] New client appears in list
- [ ] Search/filter works
- [ ] Responsive

### Case Management ✅
- [ ] Can add new case
- [ ] Case appears in list
- [ ] Can update hearing date
- [ ] Can mark as decided
- [ ] Reminders auto-create

### UI/UX ✅
- [ ] Dark theme applied consistently
- [ ] Gold accents used correctly
- [ ] No text truncation (unless intentional)
- [ ] Buttons work as expected
- [ ] Forms are intuitive

### Performance ✅
- [ ] No console errors
- [ ] Pages load quickly
- [ ] Forms submit smoothly
- [ ] No memory leaks (extended testing)

---

## 🚀 NEXT STEPS

After completing all tests:
1. **Document findings** in TEST_RESULTS.md
2. **Create GitHub issues** for any bugs found
3. **Create pull requests** for any fixes needed
4. **Request code review** before merging
5. **Deploy to staging** for QA testing
6. **Prepare release notes** for production

---

**Happy Testing! 🎉**

Report any issues or improvements to: [Support Channel]
