# MZM & Associates — Launch Preparation Guide

**Purpose**: Step-by-step actions to complete before commercial launch  
**Priority**: Complete items in this order  
**Estimated Time**: 4–8 hours

---

## Phase 1: Critical Setup (2–3 hours)

### 1. Web Push Configuration

**What**: Setup VAPID keys for web push notifications

**Steps**:

```bash
# Step 1: Generate VAPID keys (if not already done)
cd web
npx web-push generate-vapid-keys

# Output will show:
# Public Key: <long_base64_string>
# Private Key: <long_base64_string>

# Step 2: Store public key in .env.local
echo "NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public_key>" >> .env.local

# Step 3: Configure Supabase secrets
supabase secrets set VAPID_PUBLIC_KEY="<public_key>"
supabase secrets set VAPID_PRIVATE_KEY="<private_key>"
supabase secrets set VAPID_SUBJECT="mailto:admin@mzmassociates.com"

# Step 4: Deploy Edge Function
supabase functions deploy send-push

# Step 5: Verify deployment
supabase functions list
# Should show: send-push (ACTIVE)
```

**Testing**:
```bash
# Start dev server
npm run dev

# Open http://localhost:3000 in browser
# Check browser console for service worker registration
# Accept notification permission prompt
# Test notification sending (manual trigger in admin dashboard)
```

**Verification Checklist**:
- [ ] VAPID keys generated and stored
- [ ] Public key in .env.local
- [ ] Secrets set in Supabase dashboard
- [ ] send-push Edge Function deployed
- [ ] Service worker registered (check browser console)
- [ ] Notification permission prompt working

---

### 2. Environment Configuration

**Supabase Production Project**:

```bash
# Create separate production project in Supabase dashboard
# (Do NOT use development project)

# Update web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-prod>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your-vapid-public-key>

# Apply migrations to production database
supabase db push --db-url "postgresql://user:password@prod-db:5432/postgres"
# OR use Supabase SQL Editor to run migrations manually

# Verify migrations applied
supabase db list-columns --db-url "postgresql://user:password@prod-db:5432/postgres"
```

**Hosting Setup** (Choose one):

**Option A: Vercel (Recommended)**
```bash
# 1. Push to GitHub repository
git remote add origin https://github.com/your-org/mzm-case-management.git
git push -u origin main

# 2. Connect to Vercel
# Go to https://vercel.com/new
# Import GitHub repository
# Set environment variables:
#   NEXT_PUBLIC_SUPABASE_URL=<prod-url>
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
#   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<vapid-public>

# 3. Deploy
# Vercel auto-deploys on push

# 4. Configure custom domain
# Dashboard → Settings → Domains
# Add DNS CNAME record pointing to Vercel
```

**Option B: AWS S3 + CloudFront**
```bash
# 1. Build static export
npm run build
# Creates: web/out directory with all static files

# 2. Upload to S3
aws s3 sync web/out s3://your-bucket/ --delete

# 3. Configure CloudFront
# Create CloudFront distribution pointing to S3 bucket
# Set default root object: index.html
# Add CNAME: app.mzmassociates.com

# 4. Add custom domain in DNS
# Create CNAME record pointing to CloudFront domain
```

**Verification Checklist**:
- [ ] Production Supabase project created
- [ ] Migrations applied to production database
- [ ] Hosting configured (Vercel or S3+CloudFront)
- [ ] Environment variables set
- [ ] Custom domain configured (DNS propagated)
- [ ] HTTPS working (verify in browser)

---

### 3. Database Initialization

**Create Initial Data** (Super Admin, Plans):

```bash
# Option A: Using Supabase SQL Editor

# Create super admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'admin@mzmassociates.com',
  crypt('SecurePassword123!', gen_salt('bf')),
  now()
);

# Get user ID
SELECT id FROM auth.users WHERE email='admin@mzmassociates.com';

# Create super admin profile
INSERT INTO public.profiles (id, full_name, email, role, is_owner, is_active)
VALUES (
  '<user_id>',
  'Admin User',
  'admin@mzmassociates.com',
  'super_admin',
  TRUE,
  TRUE
);

# Create sample firms
INSERT INTO public.firms (name, owner_id)
VALUES ('Test Firm 1', '<user_id>');

# Create plans
INSERT INTO public.plans (code, name, duration_months, price_pkr, max_users, sort_order)
VALUES
  ('starter', 'Starter', 1, 3000, 5, 1),
  ('pro', 'Professional', 3, 7500, 10, 2),
  ('enterprise', 'Enterprise', 12, 25000, 50, 3);

# Create payment accounts
INSERT INTO public.payment_accounts (method, account_title, account_number, bank_name, instructions, sort_order)
VALUES
  ('bank_transfer', 'Primary Bank', '1234-5678-9999', 'ABC Bank', 'Transfer instructions here', 1),
  ('jazzcash', 'JazzCash', '03001234567', NULL, 'Send money to this JazzCash number', 2),
  ('easypaisa', 'EasyPaisa', '03009876543', NULL, 'Send money to this EasyPaisa number', 3);

# Set app settings
INSERT INTO public.app_settings (key, value)
VALUES
  ('trial_days', '7'),
  ('grace_days', '3'),
  ('reminder_days', '7'),
  ('trial_enabled', 'true');
```

**Or use provided seed script**:
```bash
# If seed script exists (supabase/seed-production.sql)
psql -h prod-host -U postgres -d postgres -f supabase/seed-production.sql
```

**Verification Checklist**:
- [ ] Super admin account created
- [ ] Plans created (Starter, Pro, Enterprise)
- [ ] Payment accounts configured
- [ ] App settings initialized
- [ ] Test login works with admin credentials

---

## Phase 2: Legal & Compliance (1–2 hours)

### 1. Privacy Policy

**Create file**: `web/app/privacy/privacy.md` (or fetch from content management)

**Minimum content**:
- Data collection practices
- Data usage (case management, notifications, reminders)
- User rights (access, deletion, export)
- Data retention periods
- Cookie/session policy
- Third-party services (Supabase, payment processors)
- Contact information for privacy inquiries

**Recommendation**: Consult with legal advisor for Pakistan/applicable jurisdiction

### 2. Terms of Service

**Create file**: `web/app/terms/terms.md`

**Minimum content**:
- Use restrictions (permitted and prohibited uses)
- Subscription and billing terms
- Payment and refund policy
- Warranty disclaimers
- Limitation of liability
- Intellectual property rights
- Termination clause
- Dispute resolution

### 3. Refund Policy

**Create file**: `web/app/refund-policy/refund-policy.md`

**Minimum content**:
- Trial period refund terms
- Payment refund procedures
- Cancellation process
- Timeframe for refunds

**Verification Checklist**:
- [ ] Privacy Policy reviewed by legal counsel
- [ ] Terms of Service finalized
- [ ] Refund Policy clear and published
- [ ] Pages live and linked from footer + signup
- [ ] Accept Terms checkbox on registration page

---

## Phase 3: Mobile Apps (If Launching Simultaneously) (2–3 hours)

### Android APK Build

**Prerequisites**:
- JDK 11+ installed
- JAVA_HOME environment variable set
- Android SDK installed (via Android Studio)

```bash
# Step 1: Build production web bundle
npm run build

# Step 2: Copy to Android
npx cap copy android

# Step 3: Sync dependencies
npx cap sync android

# Step 4: Build APK using Android Studio
npx cap open android

# In Android Studio:
# - Build → Generate Signed Bundle / APK
# - Choose "APK" option
# - Use your signing key (create one if first time)
# - Select "Release" build type
# - Build completes in ~5 min

# Output: android/app/release/app-release.apk

# Step 5: Test on Android emulator or device
# adb install android/app/release/app-release.apk

# Step 6: Verify app functionality
# - Test sign-in
# - Create test case
# - Test notification permissions
# - Check offline banner
```

**Upload to Google Play**:
```bash
# 1. Create Google Play account / developer console
# https://play.google.com/console

# 2. Create new app
# Package name: pk.mzm.casemanagement
# Category: Business / Productivity

# 3. Fill out app information
# - App name, description, screenshots, privacy policy
# - Rating questionnaire

# 4. Upload APK
# Internal Testing Track → Upload APK → select app-release.apk

# 5. Fill out release notes

# 6. Submit for review
# Review typically takes 2–3 hours for first submission
# May request changes (permissions, privacy policy, etc.)
```

### iOS Build

**Prerequisites** (macOS only):
- macOS 12+
- Xcode 13+
- Apple Developer account ($99/year)
- Provisioning profiles + signing certificate

```bash
# Step 1: Build production web bundle
npm run build

# Step 2: Copy to iOS
npx cap copy ios

# Step 3: Sync dependencies
npx cap sync ios

# Step 4: Build in Xcode
npx cap open ios

# In Xcode:
# - Select target "App"
# - Build for iOS Device
# - Product → Archive
# - Organizer window opens → Distribute App
# - Select "App Store Connect"
# - Follow prompts to upload

# Output: Uploaded to App Store Connect

# Step 5: Fill out App Store Connect information
# - App name, description, screenshots
# - Privacy policy, support email
# - Rating questionnaire

# Step 6: Submit for review
# Review typically takes 24–48 hours
```

**Verification Checklist**:
- [ ] Android APK builds and installs
- [ ] Android app tested on emulator/device
- [ ] iOS app builds in Xcode
- [ ] iOS app tested on simulator
- [ ] Google Play Console app created
- [ ] App Store Connect app created
- [ ] Release notes prepared
- [ ] Screenshots added to stores

---

## Phase 4: Final Testing (1 hour)

### Pre-Launch Test Checklist

```bash
# 1. Production Build
npm run build
# ✅ Verify: All 46 pages exported without errors

# 2. TypeScript Check
npm run typecheck
# ✅ Verify: 0 errors

# 3. Lint Check
npm run lint
# ✅ Verify: 0 errors

# 4. Unit Tests
npm run test
# ✅ Verify: All tests pass

# 5. Manual Testing (Production Environment)
# - Sign up as new user (should start trial)
# - Sign in with credentials
# - Create test case with hearing
# - Check dashboard statistics
# - View today's hearings preview
# - Create test client
# - Upload test document
# - Access billing page (should show trial status)
# - Navigate all menu items
# - Test language switching (English/Urdu)
# - Check responsive layout (mobile view)
# - Verify no console errors (DevTools)

# 6. Admin Testing
# - Login as super admin
# - Access admin dashboard
# - View payments (should be empty or test payments)
# - View firms (should show test firms)
# - View audit logs

# 7. Payment Testing
# - Submit payment with test details
# - Verify payment appears in admin dashboard
# - Approve payment
# - Verify subscription becomes active
# - Check billing page reflects active status
```

**Verification Checklist**:
- [ ] Production build successful
- [ ] All pre-flight tests pass
- [ ] Manual testing complete
- [ ] No console errors
- [ ] Performance acceptable (Core Web Vitals)
- [ ] Mobile layout responsive
- [ ] All features tested end-to-end

---

## Phase 5: Go-Live (30 minutes)

### Pre-Flight

```bash
# 1. Backup production database
# (Supabase automated backups enabled)

# 2. Enable HSTS header
# (If using custom domain, verify HTTPS + HSTS)
```

### Launch

```bash
# 1. Deploy to production
git push origin main
# (Auto-deploys to Vercel if configured)

# 2. Verify deployment
# Visit https://app.mzmassociates.com
# Check that site loads without errors

# 3. Smoke test key flows
# - Sign-up → New account created
# - Sign-in → Dashboard loads
# - Create case → Appears in list
# - Submit payment → Appears in admin

# 4. Monitor for errors
# Check Supabase logs for RLS errors
# Check browser console for client errors
# Check email for error alerts (if configured)

# 5. Announce launch
# Email to early users, post on social, etc.
```

**Verification Checklist**:
- [ ] Production site accessible
- [ ] No deployment errors
- [ ] Smoke tests pass
- [ ] Team verified and notified
- [ ] Launch announcement sent

---

## Troubleshooting

### VAPID Setup Issues
```
Error: VAPID keys not configured
Solution:
1. Generate new keys: npx web-push generate-vapid-keys
2. Set in Supabase secrets: supabase secrets set VAPID_PRIVATE_KEY="..."
3. Set in .env.local: NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
4. Redeploy send-push function: supabase functions deploy send-push
```

### Android Build Issues
```
Error: JAVA_HOME not set
Solution:
# Windows
set JAVA_HOME=C:\Program Files\Java\jdk-11
npm run build:mobile

# macOS
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
npm run build:mobile

# Linux
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk
npm run build:mobile
```

### iOS Build Issues
```
Error: Developer account not configured
Solution: 
1. Open Xcode
2. Preferences → Accounts
3. Add Apple ID
4. Select team
5. Automatic provisioning profile creation enabled
```

### Database Migration Issues
```
Error: Migration fails on production
Solution:
1. Check Supabase dashboard for error details
2. Apply migration manually via SQL Editor if needed
3. Verify RLS policies are enabled
4. Test queries with sample data
```

---

## Rollback Plan

If critical issue discovered post-launch:

```bash
# Option 1: Revert to previous deployment
# Vercel: Go to Deployments tab, click "Redeploy" on previous version
# S3: Upload previous out/ folder to S3 bucket

# Option 2: Disable subscriptions temporarily
# SQL: UPDATE subscriptions SET status='active' WHERE status != 'active'
# (Allows all users to continue while issue is fixed)

# Option 3: Downtime announcement
# Add maintenance banner in AppShell
# Display message: "Maintenance in progress, check back soon"
```

---

## Post-Launch (First 48 Hours)

- [ ] Monitor error logs (Supabase, hosting provider)
- [ ] Check for user support emails
- [ ] Verify payments being processed
- [ ] Monitor database performance
- [ ] Check backup completion
- [ ] Prepare incident response plan

---

## Success Criteria

✅ **Launch is successful if**:
- Site accessible at custom domain with HTTPS
- Sign-up flow works (new user can create account)
- Dashboard loads with real data (no hardcoded values)
- Admin can approve payments
- No critical errors in logs (within first 24h)
- Users can access all major features
- Mobile apps (if launched) install and work
- Web push notifications send successfully (if setup complete)

❌ **Launch is unsuccessful if**:
- Site unreachable
- Auth doesn't work
- Database errors prevent data access
- Payments cannot be submitted/verified
- Critical security issue discovered

---

## Checklist Summary

```
CRITICAL (Must Complete):
[ ] Web Push VAPID setup
[ ] Environment variables configured
[ ] Database migrations applied
[ ] Production hosting deployed
[ ] Privacy Policy published
[ ] Terms of Service published

HIGH PRIORITY (Complete Before Marketing):
[ ] Mobile apps built and tested
[ ] Super admin account created
[ ] Plans and payment accounts configured
[ ] Manual smoke testing passed
[ ] Error monitoring (optional but recommended)

MEDIUM PRIORITY (Can Defer):
[ ] Urdu translations completed
[ ] Payment gateway automation (Phase B)
[ ] Advanced features (analytics, bulk ops)
```

---

**Document Generated**: October 27, 2026  
**Last Updated**: Ready for Production  
**Next Step**: Execute Phase 1–3 in order

