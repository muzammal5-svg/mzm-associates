# MZM & Associates — SaaS Audit & Production Readiness Checklist

## Executive Summary
MZM & Associates is a multi-tenant legal case management SaaS platform built on Next.js 14 (static export), Supabase PostgreSQL, and Capacitor mobile wrappers. This document outlines a comprehensive audit covering authentication, security, functionality, UI/UX, testing, and production readiness.

**Current Phase**: Pre-production validation  
**Scope**: Web (Next.js), Android (Capacitor), iOS (Capacitor), Backend (Supabase)  
**Date**: October 27, 2026  

---

## 1. AUTHENTICATION & AUTHORIZATION

### 1.1 Authentication Flows
- [ ] **Password login** — Test email + password sign-in
  - [ ] Verify redirect to dashboard on success
  - [ ] Verify error message on invalid credentials
  - [ ] Test remember-me persistence
  - [ ] Test expired/revoked JWT handling
- [ ] **OTP login** — Test SMS/phone-based OTP (if enabled)
  - [ ] Verify OTP send flow
  - [ ] Verify OTP verification
  - [ ] Test OTP expiration
- [ ] **Sign-up** — Test firm registration flow
  - [ ] Verify register_firm() RPC creates firm + profile + subscription
  - [ ] Verify trial period initialization (7 days default)
  - [ ] Verify is_owner flag set correctly
  - [ ] Verify role=admin on signup
  - [ ] Test email validation
  - [ ] Test password strength requirements
  - [ ] Test redirect to billing after signup
- [ ] **Password recovery** — Test forgot-password flow
  - [ ] Verify email reset link generation
  - [ ] Verify password reset works
  - [ ] Verify token expiration
- [ ] **Logout** — Test sign-out flow
  - [ ] Verify device token cleanup
  - [ ] Verify session destroyed
  - [ ] Verify redirect to login/landing
- [ ] **Session persistence** — Test browser refresh/tab switch
  - [ ] Verify session restored from storage
  - [ ] Verify JWT auto-refresh before expiry
  - [ ] Verify graceful fallback if token expired

### 1.2 Role-Based Access Control (RBAC)
- [ ] **Roles defined** — super_admin, admin, lawyer, clerk
  - [ ] Verify role hierarchy enforced
  - [ ] Test super_admin can access admin routes
  - [ ] Test admin cannot access super_admin routes
  - [ ] Test lawyer can access case/client pages
  - [ ] Test clerk can view but not delete
- [ ] **Protected routes** — useRequireAuth hook
  - [ ] Verify redirects to sign-in if no session
  - [ ] Verify redirects to /billing if subscription locked/expired
  - [ ] Verify role-based 403 redirect (allowedRoles prop)
  - [ ] Verify one-shot refresh of subscription state on pending/none
- [ ] **Firm isolation** — Multi-tenant boundaries
  - [ ] Verify users can only access their firm's data
  - [ ] Test changing firm_id in query string (IDOR test)
  - [ ] Verify RLS policies block cross-firm reads

### 1.3 Subscription Gating
- [ ] **Subscription states enforced**
  - [ ] trialing → full access
  - [ ] active → full access
  - [ ] grace → full access with warning banner
  - [ ] expired → redirect to /billing
  - [ ] suspended → redirect to /billing
  - [ ] pending → redirect to /billing (waiting for payment)
  - [ ] cancelled → redirect to /billing
- [ ] **Subscription state refresh** — SubscriptionProvider.refresh()
  - [ ] Verify refresh-on-window-focus works
  - [ ] Verify refresh-on-visibility-change works
  - [ ] Verify used for payment verification (post-gateway redirect)
- [ ] **Seat limits enforced**
  - [ ] Verify seats_used() function counts active users
  - [ ] Verify seat_limit() function returns plan max_users
  - [ ] Test cannot add users beyond limit
  - [ ] Test error message displayed

---

## 2. SECURITY

### 2.1 Row-Level Security (RLS)
- [ ] **All data tables have RLS enabled**
  - [ ] firms, profiles, clients, cases, hearings, documents
  - [ ] reminders, notifications, case_notes, case_activity_log
  - [ ] subscriptions, payments, payment_accounts, user_devices
- [ ] **Firm-scoped reads** — user can only read their firm's data
  - [ ] SELECT policies use `firm_id = current_firm_id()`
  - [ ] Test querying another firm's data fails with RLS error
- [ ] **Firm-scoped writes** — user can only write to their firm
  - [ ] INSERT/UPDATE policies use `firm_id = current_firm_id()`
  - [ ] Test creating data for another firm fails with RLS error
- [ ] **Admin-only operations** — super_admin bypass or special functions
  - [ ] Payment verification (verify_payment function)
  - [ ] Firm suspension/reactivation
  - [ ] Subscription extension
  - [ ] App settings management
- [ ] **Helper functions in RLS policies**
  - [ ] is_super_admin() — checks role='super_admin'
  - [ ] current_firm_id() — extracts firm_id from JWT
  - [ ] is_owner() — checks is_owner flag on profile

### 2.2 Sensitive Data Protection
- [ ] **Credentials never exposed in client code**
  - [ ] No service-role keys in .env.local or constants
  - [ ] No payment secrets in JavaScript
  - [ ] No private API keys visible
- [ ] **CNIC/Phone sanitization**
  - [ ] Test CNIC format validation (client + server)
  - [ ] Test phone format normalization
  - [ ] Verify no hardcoded test data visible
- [ ] **Legal document handling**
  - [ ] Verify documents stored in private bucket (not public)
  - [ ] Verify signed URLs have expiration (60 min)
  - [ ] Verify one firm cannot download another firm's documents
  - [ ] Test document deletion removes file from storage
- [ ] **Audit logging for sensitive actions**
  - [ ] Case creation/deletion logged in case_activity_log
  - [ ] Payment verification logged in billing_events
  - [ ] Account deletion logged
  - [ ] Firm suspension/reactivation logged

### 2.3 Input Validation & XSS Prevention
- [ ] **Client-side validation**
  - [ ] Forms use react-hook-form + zod schemas
  - [ ] Email, phone, CNIC patterns validated
  - [ ] Case numbers/reference numbers sanitized
  - [ ] Rich text editor (if used) sanitizes HTML
- [ ] **Server-side validation**
  - [ ] Supabase RLS prevents invalid firm_id writes
  - [ ] Edge Functions validate request payloads
  - [ ] No unsafe eval or exec
- [ ] **XSS prevention**
  - [ ] No dangerouslySetInnerHTML used
  - [ ] i18n strings properly escaped (interpolation: { escapeValue: true })
  - [ ] No user input rendered as HTML without sanitization

### 2.4 CSRF & CORS
- [ ] **CORS headers configured** in Supabase
  - [ ] Verify `next.config.js` does not override
  - [ ] Test POST requests from trusted origins only
- [ ] **CSRF tokens** (if applicable for API routes)
  - [ ] Not applicable — static export, no API routes
- [ ] **Same-site cookies** enforced by Supabase auth

### 2.5 Rate Limiting & Abuse Prevention
- [ ] **Auth endpoint rate limiting** (Supabase)
  - [ ] Test brute-force attempt on login
  - [ ] Test OTP rate limiting (if applicable)
- [ ] **Payment submission throttling**
  - [ ] Verify cannot spam payment submissions
  - [ ] Verify duplicate reference numbers rejected

### 2.6 Secure Communication
- [ ] **HTTPS enforced** (Supabase + hosting)
  - [ ] Verify no HTTP traffic in production
  - [ ] Verify HSTS headers present
- [ ] **TLS certificate valid**
- [ ] **Secure cookie handling**
  - [ ] Supabase auth cookies marked HttpOnly, Secure, SameSite

---

## 3. CORE FUNCTIONALITY TESTING

### 3.1 Dashboard
- [ ] **Greeting displays correctly**
  - [ ] Correct time-of-day (morning/afternoon/evening)
  - [ ] User first name displayed
  - [ ] Today's date displayed (Karachi timezone)
- [ ] **Statistics cards**
  - [ ] useDashboardCounts query works
  - [ ] Today's hearings count accurate
  - [ ] Running cases count accurate
  - [ ] Total clients count accurate
  - [ ] Upcoming reminders count accurate
- [ ] **Services grid**
  - [ ] All 10 service links present
  - [ ] Badge counts displayed (where applicable)
  - [ ] Links navigate to correct pages
  - [ ] Mobile responsive (2 columns on xs, 3 on sm, etc.)
- [ ] **Today's hearings preview**
  - [ ] useTodayHearings query works
  - [ ] Shows hearings for today only (Karachi timezone)
  - [ ] Case reference, parties, court displayed
  - [ ] Links to case detail page work
  - [ ] Empty state shown if no hearings

### 3.2 Case Management
#### Create Case
- [ ] **Case creation form**
  - [ ] Case reference number auto-generated
  - [ ] Plaintiff/defendant fields required
  - [ ] Case type dropdown populated from firm's types
  - [ ] Court dropdown populated from firm's courts
  - [ ] Filing date picker works
  - [ ] Status defaults to "running"
- [ ] **Hearing creation on case create**
  - [ ] At least one hearing required
  - [ ] Hearing court, next_date required
  - [ ] Multiple hearings can be added
  - [ ] Hearings linked to case correctly
- [ ] **Database record creation**
  - [ ] Case row created with correct firm_id
  - [ ] Hearing rows created with case_id
  - [ ] Activity log entry created (case_created event)
  - [ ] Reminders generated for next_date (if applicable)

#### View Case
- [ ] **Case detail page displays**
  - [ ] All case fields correct
  - [ ] Linked client name/contact displayed
  - [ ] Hearings history shown (chronological)
  - [ ] Case notes shown (including soft-deleted)
  - [ ] Activity log shown
- [ ] **Case edit link works**
- [ ] **Hearing list editable**
  - [ ] Can add/edit/delete hearings
  - [ ] Delete shows confirmation
  - [ ] Next date change triggers reminder regeneration

#### Search & Filter
- [ ] **Case search by reference/parties**
- [ ] **Case filtering by status (running/decided)**
- [ ] **Case filtering by type, court, date range**

#### Archive/Mark Decided
- [ ] **Mark case as decided**
  - [ ] Status changed to "decided"
  - [ ] Outcome field required
  - [ ] Decision date captured
  - [ ] Decision document option
  - [ ] Activity log recorded
  - [ ] Reminders retired for decided case
- [ ] **Reopen case**
  - [ ] Status back to "running"
  - [ ] New hearing can be added
  - [ ] Activity log recorded
  - [ ] Reminders may be regenerated

### 3.3 Client Management
#### Create Client
- [ ] **Client form**
  - [ ] Name required
  - [ ] CNIC optional but validated if provided
  - [ ] Phone optional, normalized (remove spaces/dashes)
  - [ ] Email optional
  - [ ] WhatsApp checkbox optional
  - [ ] City optional
- [ ] **Database record**
  - [ ] Client row created with correct firm_id
  - [ ] is_active defaults to true

#### View Client
- [ ] **Client detail page**
  - [ ] All fields displayed
  - [ ] Case history shown (linked to client)
  - [ ] Case count displayed
- [ ] **Client edit link works**
  - [ ] All fields editable
  - [ ] Changes saved to database

#### Search & Filter
- [ ] **Client search by name/CNIC/phone**
- [ ] **Client list pagination (if > 50)**

### 3.4 Hearings & Reminders
#### Hearing Management
- [ ] **Hearing dates captured in Asia/Karachi timezone**
  - [ ] Verify all dates stored as timestamptz
  - [ ] Verify client displays in user's timezone
- [ ] **Hearing status transitions**
  - [ ] upcoming → held (when next_date passes)
  - [ ] Related case can be marked decided on held hearing
- [ ] **Next date tracking**
  - [ ] Hearing.next_date field tracks subsequent hearing
  - [ ] Circular references prevented
  - [ ] All hearings linked chronologically
- [ ] **Related case linking**
  - [ ] Hearing can link to related case (subsequent hearing in related case)

#### Reminders
- [ ] **Reminder generation** — generate_reminders() runs daily at 01:00 UTC (06:00 Karachi)
  - [ ] Verify cron job scheduled in Supabase
  - [ ] Manual trigger works: `SELECT public.generate_reminders();`
- [ ] **Reminder deduplication**
  - [ ] Running both generate_reminders() calls doesn't duplicate
  - [ ] Same-day notifications deduplicated per user/reminder
- [ ] **Reminder window**
  - [ ] Default: 10 days before hearing
  - [ ] User preference: custom days
  - [ ] Firm default: 10 days (app_settings)
- [ ] **Reminder retirement**
  - [ ] Reminders for past dates retired
  - [ ] Reminders for decided cases retired
  - [ ] Reminders for deleted cases retired
  - [ ] Reminders superseded by related hearing retired
- [ ] **Reminder UI**
  - [ ] /reminders page shows upcoming reminders
  - [ ] Can mark reminder done (dismiss)
  - [ ] Can view linked case
  - [ ] Notification badge shows count

#### Notifications
- [ ] **In-app notifications**
  - [ ] /notifications page shows inbox
  - [ ] Can mark as read
  - [ ] Can delete
  - [ ] Read/unread state persisted
- [ ] **Daily summary**
  - [ ] send_daily_summary() runs at 01:00 UTC
  - [ ] Groups hearings for next 10 days
  - [ ] Notification created with summary
- [ ] **Web Push notifications**
  - [ ] Requires VAPID keys configured
  - [ ] Service worker registered
  - [ ] User grants permission
  - [ ] Notifications delivered for reminders
  - [ ] Click opens case detail

### 3.5 Documents
#### Upload
- [ ] **Document upload form**
  - [ ] File picker works
  - [ ] File size limit enforced (50 MiB)
  - [ ] Allowed file types checked
  - [ ] Progress indicator shown during upload
  - [ ] Success message shown
- [ ] **File storage**
  - [ ] File uploaded to private documents bucket
  - [ ] Path: `{firm_id}/{timestamp}-{random}.{ext}`
  - [ ] Metadata row created in documents table
  - [ ] Case linked if applicable

#### Download
- [ ] **Signed URL generation**
  - [ ] createSignedUrl() creates 60-min expiry URL
  - [ ] Download works via signed URL
  - [ ] Link expires after 60 minutes
- [ ] **Access control**
  - [ ] RLS prevents other firms downloading
  - [ ] Only firm members can download

#### Delete
- [ ] **Document deletion**
  - [ ] Soft delete (marked as deleted, not removed from storage)
  - [ ] File can be restored by admin
  - [ ] Activity logged

#### Search
- [ ] **/documents page**
  - [ ] Firm-wide document search
  - [ ] Filter by case, type, date
  - [ ] List all firm documents

---

## 4. SUBSCRIPTION & BILLING

### 4.1 Plans & Pricing
- [ ] **Plans table populated**
  - [ ] Verify plans exist: Basic, Pro, Enterprise (or configured names)
  - [ ] All fields correct: code, name, duration_months, price_pkr, max_users
  - [ ] is_active=true for active plans
  - [ ] sort_order for display order
- [ ] **Plan selection on signup**
  - [ ] Plan preselection via URL param: `/register?plan=pro`
  - [ ] Plan card shows price, duration, features
  - [ ] Plan selection updates amount field

### 4.2 Subscription Lifecycle
- [ ] **Trial initialization**
  - [ ] register_firm() creates subscription with status='trialing'
  - [ ] ends_at = now + 7 days (app_settings.trial_days)
  - [ ] Trial period shows in billing page
- [ ] **Payment submission**
  - [ ] /billing page shows plan options
  - [ ] Payment methods displayed (bank_transfer, jazzcash, easypaisa, card, other)
  - [ ] Transaction ID required (6+ chars)
  - [ ] Amount editable (but defaults to plan price)
  - [ ] Receipt upload optional
  - [ ] submitPayment() creates payment row with status='pending'
- [ ] **Payment verification** (super admin only)
  - [ ] Admin payments page lists pending payments
  - [ ] Can approve payment (creates subscription with status='active')
  - [ ] Can reject payment (with optional note)
  - [ ] verify_payment() function extends subscription based on plan duration
  - [ ] Subscription end_at = max(current end_at, now) + (plan.duration_months months)
- [ ] **Subscription state transitions**
  - [ ] active → grace (when end_at passed, within grace_days)
  - [ ] grace → expired (when grace_until passed)
  - [ ] trialing → grace/expired (same logic as active)
  - [ ] update_subscription_states() function runs daily at 01:00 UTC
- [ ] **Grace period**
  - [ ] Default 3 days (app_settings.grace_days)
  - [ ] Users can still access during grace
  - [ ] Warning banner shown
  - [ ] Renewal reminder sent 7 days before expiry
- [ ] **Renewal reminder notifications**
  - [ ] Event type: 'renewal_reminder'
  - [ ] Idempotent via billing_events table
  - [ ] Notification sent 7 days before ends_at

### 4.3 Billing & Payment Accounts
- [ ] **Payment accounts configured** (super admin)
  - [ ] Bank account(s) added with instructions
  - [ ] JazzCash account (if applicable)
  - [ ] EasyPaisa account (if applicable)
  - [ ] Card gateway account (if implemented)
  - [ ] Each account has instructions for payment
- [ ] **Payment accounts displayed**
  - [ ] /billing page shows all active payment_accounts
  - [ ] Tabs or dropdown to select payment method
  - [ ] Account details and instructions shown

### 4.4 Seat Limits
- [ ] **Seat tracking**
  - [ ] seats_used(firm_id) counts active profiles
  - [ ] seat_limit(firm_id) returns plan.max_users
- [ ] **Seat enforcement**
  - [ ] Cannot add user beyond limit
  - [ ] Error message shown
  - [ ] Seat usage displayed in billing page

### 4.5 Admin Controls
- [ ] **Extend subscription** (super admin)
  - [ ] admin_extend_subscription(firm_id, days)
  - [ ] Extends ends_at by X days
  - [ ] Marked as 'active'
  - [ ] Logged in billing_events
- [ ] **Suspend firm** (super admin)
  - [ ] admin_suspend_firm(firm_id, note)
  - [ ] Sets subscription status='suspended'
  - [ ] Users redirected to /billing
  - [ ] Logged in billing_events
- [ ] **Reactivate firm** (super admin)
  - [ ] admin_reactivate_firm(firm_id)
  - [ ] Resets subscription status to 'active'
  - [ ] Clears grace_until
  - [ ] Logged in billing_events

---

## 5. UI/UX & DESIGN

### 5.1 Visual Design
- [ ] **Brand consistency**
  - [ ] Navy (#0B1B3A) used for primary elements
  - [ ] Gold (#8A6414) used for accents, CTAs
  - [ ] Off-white (#F7F7F4) for backgrounds
  - [ ] Consistent typography (Playfair Display, Cormorant, Inter)
- [ ] **Professional appearance**
  - [ ] No hardcoded demo data visible in production
  - [ ] Components use consistent spacing
  - [ ] Borders, shadows, rounded corners consistent
  - [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] **Loading states**
  - [ ] Skeleton loaders used for cards, tables
  - [ ] Shimmer animation on skeletons
  - [ ] Spinners shown for submit buttons during loading
- [ ] **Empty states**
  - [ ] Meaningful messages when no data
  - [ ] Icons/illustrations provided
  - [ ] Call-to-action shown (Create new, etc.)
- [ ] **Error states**
  - [ ] Error toast notifications appear
  - [ ] Error details logged, not exposed to users
  - [ ] Retry options provided
- [ ] **Success states**
  - [ ] Success toast with brief message
  - [ ] Optional redirect or refresh

### 5.2 Responsive Layout
- [ ] **Mobile (320px–639px)**
  - [ ] Single column layout
  - [ ] Touch targets ≥44px × 44px
  - [ ] Forms stack vertically
  - [ ] Tables scroll horizontally or adapt to cards
  - [ ] Navigation (BottomNav) visible, Sidebar hidden
- [ ] **Tablet (640px–1023px)**
  - [ ] 2–3 column layout
  - [ ] Sidebar visible with collapse option
  - [ ] Tables with horizontal scroll
- [ ] **Desktop (1024px+)**
  - [ ] Multi-column layout
  - [ ] Sidebar fixed, full height
  - [ ] Tables full width
  - [ ] Modals centered with appropriate widths

### 5.3 Navigation
- [ ] **Sidebar (desktop)**
  - [ ] Logo + MZM branding
  - [ ] 5 main nav items (Cases, Clients, Documents, Reminders, Settings)
  - [ ] Role-based items visible (Admin sees admin link)
  - [ ] Active route highlighted
  - [ ] Collapse/expand toggle
  - [ ] Current user/firm name shown
- [ ] **BottomNav (mobile)**
  - [ ] 5 items visible in bottom bar
  - [ ] Icons + labels
  - [ ] Active indicator
  - [ ] Touch-friendly spacing
- [ ] **TopBar (mobile)**
  - [ ] Logo/title on left
  - [ ] Notification bell on right
  - [ ] Menu/settings accessible
- [ ] **Breadcrumbs** (if applicable)
  - [ ] Show current page path
  - [ ] Clickable parent links

### 5.4 Forms & Inputs
- [ ] **Input fields**
  - [ ] Labels clear and associated with inputs
  - [ ] Placeholder text helpful but not label replacement
  - [ ] Focus states visible (ring/outline)
  - [ ] Error states show clear messages
  - [ ] Disabled state visually distinct
- [ ] **Text inputs**
  - [ ] Phone number inputs normalized
  - [ ] Email inputs use type="email"
  - [ ] Date inputs use date picker or masked input
  - [ ] CNIC inputs formatted/validated
- [ ] **Dropdowns/Selects**
  - [ ] Options legible
  - [ ] Search/filter available for large lists
  - [ ] Selected option highlighted
  - [ ] Keyboard navigation works (arrow keys)
- [ ] **Checkboxes/Radios**
  - [ ] Labels clickable
  - [ ] Checked state clear
  - [ ] Groups labeled
- [ ] **Buttons**
  - [ ] Primary action obvious (color, size, position)
  - [ ] Secondary actions less prominent
  - [ ] Destructive actions (delete) red
  - [ ] Disabled state clear
  - [ ] Loading state shows spinner + text
  - [ ] Hover/active states defined

### 5.5 Tables & Data Display
- [ ] **Table structure**
  - [ ] Headers clear and sortable (if applicable)
  - [ ] Rows scannable, good vertical spacing
  - [ ] Alternating row colors optional but okay
  - [ ] Density appropriate (not too cramped)
- [ ] **Pagination**
  - [ ] Shows current page + total
  - [ ] Previous/Next buttons
  - [ ] Jump-to-page input
- [ ] **Sorting**
  - [ ] Click header to sort
  - [ ] Arrow indicator (up/down) shown
  - [ ] Sort order remembered
- [ ] **Filtering**
  - [ ] Filter options visible or in dropdown
  - [ ] Active filters shown as chips/badges
  - [ ] Easy to clear filters
- [ ] **Mobile tables**
  - [ ] Horizontal scroll, or
  - [ ] Convert to cards/list view
  - [ ] Key columns always visible

### 5.6 Modals & Overlays
- [ ] **Modal dialogs**
  - [ ] Title clear
  - [ ] Body scrollable if long
  - [ ] Actions (OK/Cancel) in footer
  - [ ] Close button (X) on top-right
  - [ ] Focus trapped inside modal
  - [ ] Backdrop click closes (optional)
  - [ ] Keyboard ESC closes
- [ ] **Confirmation dialogs**
  - [ ] Destructive action highlighted (red)
  - [ ] Warning message clear
  - [ ] Cancel option prominent (not destructive)
- [ ] **Sheet/Drawer** (mobile)
  - [ ] Slides in from bottom or side
  - [ ] Swipe to dismiss
  - [ ] Touch-friendly close button

### 5.7 Notifications & Toasts
- [ ] **Toast notifications**
  - [ ] Auto-dismiss after 5–10 seconds
  - [ ] Clear, brief message
  - [ ] Appropriate icon (check, x, warning, info)
  - [ ] Color-coded (green success, red error, yellow warning, blue info)
  - [ ] Stack if multiple
  - [ ] Dismiss button
- [ ] **Alerts/Banners**
  - [ ] Status banners (lock, grace warning) prominent
  - [ ] Color-coded (red for critical, yellow for warning)
  - [ ] Optional close button
  - [ ] Accessible text (role="alert")

### 5.8 Accessibility (a11y)
- [ ] **Color contrast**
  - [ ] Text ≥ 4.5:1 for normal (WCAG AA)
  - [ ] Text ≥ 3:1 for large (18pt+)
  - [ ] Icons/UI ≥ 3:1
- [ ] **Keyboard navigation**
  - [ ] All interactive elements reachable via Tab
  - [ ] Tab order logical
  - [ ] No focus trap (except modals)
  - [ ] Focus indicator visible
  - [ ] Shortcut keys documented (optional)
- [ ] **Screen reader support**
  - [ ] Semantic HTML (button, a, form, etc.)
  - [ ] Labels associated with inputs (for/id)
  - [ ] ARIA labels for icon buttons
  - [ ] ARIA live regions for dynamic content
  - [ ] ARIA roles for custom components
  - [ ] Headings hierarchy (h1 → h2 → h3)
- [ ] **Reduced motion**
  - [ ] Respect prefers-reduced-motion
  - [ ] CSS animations have instant alternatives
  - [ ] No auto-playing videos

---

## 6. TESTING & QUALITY ASSURANCE

### 6.1 Build & Compilation
- [ ] **TypeScript strict mode**
  - [ ] `npm run typecheck` passes with 0 errors
  - [ ] No `any` escape hatches (except justified)
- [ ] **ESLint**
  - [ ] `npm run lint` passes with 0 errors
  - [ ] No disabled rules (unless documented)
- [ ] **Production build**
  - [ ] `npm run build` completes successfully
  - [ ] Static export generates all 32 pages
  - [ ] No missing static routes
  - [ ] Out directory contains HTML files for all routes
- [ ] **Next.js static export validation**
  - [ ] No server actions used (all client-side)
  - [ ] No dynamic routes without generateStaticParams
  - [ ] No API routes

### 6.2 Unit & Integration Tests
- [ ] **Test framework setup**
  - [ ] Vitest configured (`npm test` runs)
  - [ ] Jest/React Testing Library available
- [ ] **Authentication tests**
  - [ ] Test login flow (happy path + errors)
  - [ ] Test session persistence
  - [ ] Test logout
- [ ] **Authorization tests**
  - [ ] Test RBAC (role-based redirects)
  - [ ] Test subscription gating
  - [ ] Test useRequireAuth hook
- [ ] **Subscription tests**
  - [ ] Test subscription state transitions
  - [ ] Test seat limit enforcement
  - [ ] Test payment submission
- [ ] **Data fetching tests**
  - [ ] Test React Query hooks
  - [ ] Test RLS policies (via Supabase client)
  - [ ] Test error handling

### 6.3 End-to-End Tests (Playwright)
- [ ] **Test suite runs**
  - [ ] `npm run test:e2e` completes
  - [ ] All tests pass
- [ ] **User journey tests**
  - [ ] Sign-up → trial starts
  - [ ] Sign-in → dashboard loads
  - [ ] Create case → case appears in list
  - [ ] Create client → client appears in list
  - [ ] Add hearing → reminder generated
  - [ ] Submit payment → payment pending
  - [ ] Admin approves payment → subscription active
- [ ] **Responsive tests**
  - [ ] Mobile (375px) layout tested
  - [ ] Tablet (768px) layout tested
  - [ ] Desktop (1920px) layout tested
- [ ] **Accessibility tests**
  - [ ] Headings hierarchy correct
  - [ ] Form labels present
  - [ ] Keyboard navigation works
  - [ ] Color contrast adequate

### 6.4 Manual Testing Checklist
#### Authentication
- [ ] Sign up with new email → trial activated
- [ ] Sign in with existing account → dashboard loads
- [ ] Forgot password → reset email works
- [ ] Remember-me checkbox works
- [ ] Expired session → graceful re-auth

#### Dashboard
- [ ] Statistics cards load and reflect real data
- [ ] Today's hearings preview populated correctly
- [ ] Service grid all links functional
- [ ] Notifications bell shows count

#### Cases
- [ ] Create case with hearings → case appears in list
- [ ] Edit case → changes saved
- [ ] Search/filter cases works
- [ ] Mark case decided → status changed
- [ ] Reopen case → status changed back
- [ ] Case detail page complete and editable

#### Clients
- [ ] Create client with CNIC/phone → validated
- [ ] Edit client → changes saved
- [ ] Search clients works
- [ ] Client case history linked correctly

#### Billing
- [ ] Trial shows correct end date
- [ ] Plan selection updates amount
- [ ] Payment submission creates pending payment
- [ ] Admin can approve/reject payment
- [ ] Approved payment → subscription active
- [ ] Grace period shows warning banner

#### Mobile
- [ ] App loads on mobile browser
- [ ] Navigation via BottomNav works
- [ ] Forms are touch-friendly
- [ ] Tables render as cards
- [ ] Modals full-screen appropriate

---

## 7. SECURITY AUDIT DETAILS

### 7.1 Tenant Isolation Tests
**Setup**: Create 2 test firms (Firm A, Firm B) with users (User A, User B)

- [ ] **Cross-firm case access**
  - [ ] User A cannot view User B's cases
  - [ ] Query with firm_id != current_firm_id fails with RLS error
  - [ ] Direct URL to case by ID redirects or shows 403
- [ ] **Cross-firm client access**
  - [ ] User A cannot query User B's clients
  - [ ] RLS policy blocks read
- [ ] **Cross-firm document access**
  - [ ] User A cannot download User B's documents
  - [ ] Signed URL works only for firm's documents
  - [ ] Storage bucket policy enforces firm_id
- [ ] **Cross-firm subscription access**
  - [ ] User A cannot view User B's subscription
  - [ ] RLS policy blocks read
  - [ ] Admin can read all subscriptions (is_super_admin bypass)
- [ ] **Cross-firm payment access**
  - [ ] User A cannot view User B's payments
  - [ ] Only super_admin can view/verify payments

### 7.2 IDOR (Insecure Direct Object References) Tests
- [ ] **Change case ID in URL** — /cases/view?id=<OTHER_FIRM_CASE_ID>
  - [ ] Page redirects to cases list or shows 403
  - [ ] No case data exposed
- [ ] **Change client ID in query** — /clients/view?id=<OTHER_FIRM_CLIENT_ID>
  - [ ] RLS prevents data fetch
  - [ ] Error shown
- [ ] **Change subscription ID** — via API (if exposed)
  - [ ] RLS prevents read
- [ ] **Change document ID** — direct storage URL
  - [ ] Access denied without valid signed URL
  - [ ] Signed URL expired or invalid → 403

### 7.3 Privilege Escalation Tests
- [ ] **Non-admin user cannot access admin routes**
  - [ ] /admin/* redirects to / or shows 403
- [ ] **Non-super_admin cannot verify payments**
  - [ ] Calling verify_payment() RPC fails with "Not authorized"
- [ ] **Non-owner cannot manage firm settings**
  - [ ] Cannot change firm name, subscription, etc.
- [ ] **Lawyer cannot add users**
  - [ ] Only admin/super_admin can invite
  - [ ] API call fails with RLS error

### 7.4 Data Integrity Tests
- [ ] **Cannot modify firm_id on insert/update**
  - [ ] RLS policy blocks writes to other firm's firm_id
- [ ] **Cannot modify timestamps after creation**
  - [ ] created_at immutable (RLS blocks UPDATE)
  - [ ] updated_at auto-maintained by trigger
- [ ] **Foreign key constraints**
  - [ ] Deleting firm cascades to subscriptions, profiles, etc.
  - [ ] Orphaned records impossible due to FKs
- [ ] **Unique constraints**
  - [ ] Duplicate device registration → upsert works
  - [ ] Duplicate payment reference → database prevents (if constraint exists)

---

## 8. MOBILE APPS (ANDROID & iOS)

### 8.1 Android (Capacitor)
- [ ] **Project structure**
  - [ ] `/web/android` directory exists
  - [ ] `capacitor.config.ts` configured
  - [ ] App ID: `pk.mzm.casemanagement`
  - [ ] `android/app/build.gradle` updated
- [ ] **Build setup**
  - [ ] JDK installed and JAVA_HOME set
  - [ ] Android SDK tools installed
  - [ ] Gradle wrapper works
- [ ] **APK build**
  - [ ] `npm run build && npx cap copy android && npx cap sync android` succeeds
  - [ ] Open Android Studio: `npx cap open android`
  - [ ] Build APK: Build → Make Project (Ctrl+F9)
  - [ ] Generate signed APK for release
- [ ] **Runtime behavior**
  - [ ] App loads web assets correctly
  - [ ] Navigation via BottomNav works
  - [ ] Forms functional
  - [ ] File uploads work
  - [ ] Offline mode graceful (banner shown)
  - [ ] Back button (hardware) navigates or exits appropriately
  - [ ] Status bar style correct (Supabase dark)
  - [ ] Keyboard shows/hides appropriately on form focus
  - [ ] Safe areas respected (notch, home button)
- [ ] **Permissions**
  - [ ] Camera permission (if photo upload enabled)
  - [ ] File system permission (if needed)
  - [ ] Push notification permission
- [ ] **Push notifications**
  - [ ] FCM tokens registered
  - [ ] Web push notifications delivered on Android
  - [ ] Notification click opens app and navigates to case
- [ ] **Authentication**
  - [ ] Session persisted across app restarts
  - [ ] Auto-login if session valid
  - [ ] Logout clears session

### 8.2 iOS (Capacitor)
- [ ] **Project structure**
  - [ ] `/web/ios` directory exists
  - [ ] `capacitor.config.ts` configured for iOS
  - [ ] `ios/App/App.xcodeproj` exists
- [ ] **Xcode setup** (requires macOS + Xcode)
  - [ ] Xcode installed (15.0+)
  - [ ] Team ID/signing credentials configured
  - [ ] Bundle ID matches app config
- [ ] **Build**
  - [ ] `npm run build && npx cap copy ios && npx cap sync ios` succeeds
  - [ ] Open Xcode: `npx cap open ios`
  - [ ] Build for Simulator: ⌘B
  - [ ] Build for Device: ⌘B (with device connected)
  - [ ] Archive for release: ⌘⇧B
- [ ] **Runtime behavior**
  - [ ] App loads web assets correctly
  - [ ] Navigation works
  - [ ] Forms functional
  - [ ] File uploads work
  - [ ] Offline graceful
  - [ ] Status bar style correct
  - [ ] Safe areas respected (notch, home indicator, Dynamic Island)
  - [ ] Keyboard behavior smooth
- [ ] **Permissions**
  - [ ] Camera permission requested and working
  - [ ] Notifications permission requested
  - [ ] Storage permission (if needed)
- [ ] **Push notifications**
  - [ ] APNs certificate configured
  - [ ] Device tokens registered
  - [ ] Notifications delivered
  - [ ] Click behavior works
- [ ] **Authentication**
  - [ ] Session persisted
  - [ ] Auto-login works
  - [ ] Logout clears session

### 8.3 Capacitor Plugins & Integrations
- [ ] **Push Notifications** (@capacitor/push-notifications)
  - [ ] Android: FCM token registration works
  - [ ] iOS: APNs token registration works
  - [ ] Notification handler receives and processes events
- [ ] **Storage** (@capacitor/filesystem)
  - [ ] File read/write for app data
  - [ ] Cache management
- [ ] **Camera** (@capacitor/camera)
  - [ ] Photo/gallery picker works
  - [ ] Image compressed before upload
- [ ] **Status Bar** (@capacitor/status-bar)
  - [ ] Style set (dark/light)
  - [ ] Color matches theme
- [ ] **Keyboard** (@capacitor/keyboard)
  - [ ] Show/hide behavior correct
  - [ ] Input events work

---

## 9. PRODUCTION READINESS

### 9.1 Environment & Configuration
- [ ] **Environment variables**
  - [ ] `.env.local` populated with real Supabase URL + anon key
  - [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` set for web push
  - [ ] `.env.local` not committed to git
  - [ ] `.env.local.example` provided with placeholders
- [ ] **Secrets management**
  - [ ] VAPID private key stored in Supabase Edge Function secrets
  - [ ] Service account key not in client code
  - [ ] Database URL not exposed
- [ ] **Database**
  - [ ] All migrations applied (`supabase db push`)
  - [ ] RLS policies enabled on all tables
  - [ ] Indexes created for frequently queried columns
  - [ ] Backups enabled in Supabase dashboard
- [ ] **Storage**
  - [ ] Private documents bucket created
  - [ ] Payment slips bucket created
  - [ ] Public avatars bucket (if used) read-only for public
  - [ ] Bucket policies enforce firm_id
- [ ] **Edge Functions**
  - [ ] send-push function deployed
  - [ ] VAPID keys configured as secrets
  - [ ] JWT verification enabled
  - [ ] Error handling in place

### 9.2 Performance & Optimization
- [ ] **Build output**
  - [ ] Static export optimizes bundle size
  - [ ] CSS minified
  - [ ] JavaScript tree-shaken
  - [ ] Images optimized (via Sharp)
- [ ] **Data fetching**
  - [ ] React Query configured with appropriate stale times
  - [ ] Pagination implemented for large datasets
  - [ ] No N+1 queries (audit logs)
  - [ ] Proper query invalidation on mutations
- [ ] **Database**
  - [ ] Indexes on firm_id, user_id, case_id, client_id
  - [ ] Indexes on frequently filtered columns (status, created_at)
  - [ ] Query plans analyzed for slow queries
- [ ] **Caching**
  - [ ] Browser cache headers set
  - [ ] Static assets cached (service worker)
  - [ ] Supabase client caching leveraged

### 9.3 Logging & Monitoring
- [ ] **Client-side logging**
  - [ ] Errors logged to console (dev) or external service (prod)
  - [ ] Sensitive data not logged
  - [ ] No verbose logging in production
- [ ] **Server-side logging** (Supabase)
  - [ ] RLS violations logged
  - [ ] Edge Function logs accessible
  - [ ] Database slow query logs reviewed
- [ ] **Error tracking** (optional but recommended)
  - [ ] Sentry or similar configured
  - [ ] Production errors tracked
  - [ ] Alerts configured for critical errors
- [ ] **Audit logs**
  - [ ] Sensitive actions logged (payment verification, firm suspension)
  - [ ] Logs retained for compliance period

### 9.4 Backups & Disaster Recovery
- [ ] **Database backups**
  - [ ] Automated daily backups enabled
  - [ ] Point-in-time recovery possible
  - [ ] Backups tested (restoration procedure documented)
- [ ] **Document storage backups**
  - [ ] Supabase Storage auto-replicates
  - [ ] No manual backup needed (cloud provider responsibility)
- [ ] **Configuration backups**
  - [ ] Migration files version-controlled
  - [ ] App settings can be exported/imported
- [ ] **Disaster recovery plan**
  - [ ] Recovery procedures documented
  - [ ] RTO/RPO defined

### 9.5 Compliance & Privacy
- [ ] **Privacy policy**
  - [ ] Published on website
  - [ ] Links from app (settings page)
  - [ ] Covers data collection, usage, retention, deletion
- [ ] **Terms of service**
  - [ ] Published on website
  - [ ] Linked from signup page
  - [ ] Covers liability, usage restrictions, payment terms
- [ ] **GDPR/PDPA compliance** (if applicable to market)
  - [ ] Right to access data (export)
  - [ ] Right to delete data (account deletion)
  - [ ] Data processing agreements in place (with Supabase)
  - [ ] Consent flows for tracking/marketing
- [ ] **Data retention**
  - [ ] Audit logs retained 1–3 years
  - [ ] Deleted firm data purged after X days
  - [ ] Deleted account data purged after X days

### 9.6 Deployment & Infrastructure
- [ ] **Web hosting**
  - [ ] Static export deployed to Vercel, Netlify, or S3 + CloudFront
  - [ ] HTTPS enforced
  - [ ] HSTS headers enabled
  - [ ] CDN in use for fast global delivery
- [ ] **Supabase project**
  - [ ] Production project separate from staging
  - [ ] Read replicas for read-heavy workloads (optional)
  - [ ] Connection pooling enabled
  - [ ] Resource limits configured
- [ ] **Mobile distribution**
  - [ ] Android APK signed with production key
  - [ ] Uploaded to Google Play Console
  - [ ] iOS IPA signed with production certificate
  - [ ] Uploaded to App Store Connect
  - [ ] Release notes prepared
- [ ] **DNS & domains**
  - [ ] Domain registered and renewed
  - [ ] DNS records configured (A, CNAME, MX)
  - [ ] Email (if used for support) working

### 9.7 User Support & Documentation
- [ ] **Help / Support**
  - [ ] In-app help link (settings or ?)
  - [ ] Email support address provided
  - [ ] Support ticket system or FAQ
- [ ] **User guide / Onboarding**
  - [ ] Welcome email sent to new admins
  - [ ] In-app onboarding (optional walkthrough)
  - [ ] Video tutorials (optional)
- [ ] **API documentation** (if third-party integrations)
  - [ ] API endpoints documented
  - [ ] Auth instructions provided
  - [ ] Code examples provided
- [ ] **Admin documentation**
  - [ ] User management guide
  - [ ] Settings guide
  - [ ] Troubleshooting guide

---

## 10. FINAL RELEASE CHECKLIST

### Critical Blockers
- [ ] Authentication flows tested and working ✓/✗
- [ ] Tenant isolation verified (cross-firm access prevented) ✓/✗
- [ ] Subscription gating enforced ✓/✗
- [ ] RLS policies enabled on all tables ✓/✗
- [ ] Payment verification in place (manual or automated) ✓/✗
- [ ] TypeScript compiles with 0 errors ✓/✗
- [ ] Production build successful (32 pages exported) ✓/✗
- [ ] All e2e tests pass ✓/✗

### High Priority
- [ ] Dashboard displays real data (no hardcoded demo data) ✓/✗
- [ ] Case CRUD operations work end-to-end ✓/✗
- [ ] Client management functional ✓/✗
- [ ] Hearings and reminders generating correctly ✓/✗
- [ ] Documents upload/download secure ✓/✗
- [ ] Billing page fully functional ✓/✗
- [ ] UI responsive on mobile, tablet, desktop ✓/✗
- [ ] No console errors on any page ✓/✗

### Medium Priority
- [ ] Android APK builds and runs ✓/✗/BLOCKED
- [ ] iOS app builds (requires macOS + Xcode) ✓/✗/BLOCKED
- [ ] Web push notifications configured (VAPID keys) ✓/✗/BLOCKED
- [ ] Email support address working ✓/✗
- [ ] Privacy policy and ToS published ✓/✗
- [ ] Deployment pipeline tested ✓/✗

### Low Priority (Can defer to post-launch)
- [ ] Advanced analytics / reporting ✓/✗
- [ ] Custom reminder preferences UI ✓/✗
- [ ] Dark mode ✓/✗
- [ ] Internationalization for more languages ✓/✗
- [ ] API integration (third-party case sync, etc.) ✓/✗

---

## Audit Execution Plan

### Phase 1: Code Review & Setup (Day 1)
- Read all critical files
- Set up local environment
- Verify dependencies
- Review migrations

### Phase 2: Security Audit (Day 2)
- RLS policy inspection
- Tenant isolation tests
- IDOR tests
- Privilege escalation tests
- Data validation tests

### Phase 3: Authentication & Authorization (Day 2–3)
- Sign-up flow
- Sign-in flow
- Password recovery
- Session persistence
- RBAC enforcement
- Subscription gating

### Phase 4: Core Functionality Testing (Day 3–5)
- Dashboard
- Cases (create, view, edit, delete, mark decided)
- Clients (create, view, edit, search)
- Hearings & reminders
- Documents
- Billing & payments

### Phase 5: UI/UX Review (Day 5–6)
- Visual design consistency
- Responsive layout testing
- Navigation & usability
- Accessibility compliance
- Form validation & errors

### Phase 6: Testing & Build (Day 6)
- TypeScript compilation
- ESLint
- Vitest
- Playwright e2e
- Production build
- Static export validation

### Phase 7: Mobile & Deployment (Day 7)
- Android build (if JDK available)
- iOS build (if macOS available)
- Deployment procedures
- Documentation

### Phase 8: Final Report (Day 7)
- Issues discovered + severity
- Changes made + rationale
- Test results
- Remaining blockers
- Go/no-go recommendation

---

## Notes & Known Limitations

- **iOS testing**: Requires macOS + Xcode. If unavailable, will document blockers.
- **Android build**: Requires JDK + Android SDK. If unavailable, will document blockers.
- **Payment gateway**: Manual payment workflow implemented. Automated gateway (card, Stripe, etc.) in Phase B but not integrated. Tests will cover manual workflow only.
- **Push notifications**: Web push requires VAPID key setup + Edge Function deployment. Tests will verify setup, not actual FCM delivery.
- **Demo data**: Initial seed uses demo firms/users for testing. Must be removed or marked clearly before production.

---

**Audit Status**: Ready to begin  
**Assigned To**: [You]  
**Start Date**: October 27, 2026  
**Target Completion**: November 3, 2026  

