# Marketing Pages Testing Checklist

## ✅ Build Status
- [x] TypeScript Check (`npm run typecheck`): Pass - 0 errors
- [x] ESLint Check (`npm run lint`): Pass - 0 errors

## Pages Created & Ready for Testing

### 1. Features Page (`/features`)
**Location**: `/web/app/features/page.tsx`

#### Elements to Test:
- [ ] Hero section displays correctly
  - [ ] Title "Powerful Features Built for Modern Legal Practice"
  - [ ] Subtitle visible
- [ ] Feature Cards (8 cards total)
  - [ ] Icons display correctly
  - [ ] Titles show proper English text (not translation keys)
  - [ ] Descriptions visible
  - [ ] Benefits list shows with icons
- [ ] Feature Comparison Table
  - [ ] All 3 columns show (Starter/Professional/Enterprise)
  - [ ] All 8 features listed
  - [ ] Check marks display correctly
- [ ] CTA buttons
  - [ ] "View Plans" button links to /pricing
  - [ ] "Start Free Trial" button links to /register
- [ ] Responsive Design
  - [ ] Mobile (320px): 1 column cards
  - [ ] Tablet (768px): 2 columns cards
  - [ ] Desktop (1200px): 3 columns cards

### 2. FAQ Page (`/faq`)
**Location**: `/web/app/faq/page.tsx`

#### Elements to Test:
- [ ] Hero section displays
  - [ ] Title visible
  - [ ] Subtitle visible
- [ ] Search Bar
  - [ ] Type and filter FAQs
  - [ ] Show "No results" when no matches
  - [ ] Clears properly
- [ ] FAQ Accordion
  - [ ] 4 categories (General, Features, Pricing, Security & Support)
  - [ ] Questions display as text (not translation keys)
  - [ ] Answers display as text
  - [ ] Click to expand/collapse
  - [ ] Chevron rotates on expand
- [ ] "Still have questions?" CTA
  - [ ] "Contact Support" button links to /contact
- [ ] Responsive Design
  - [ ] Mobile: stacked layout
  - [ ] Tablet/Desktop: proper spacing

### 3. Pricing Page (`/pricing`)
**Location**: `/web/app/pricing/page.tsx`

#### Elements to Test:
- [ ] Hero section
  - [ ] Title displays
  - [ ] Subtitle displays
- [ ] Plan Cards
  - [ ] All plans loaded from database
  - [ ] Plan names display
  - [ ] Prices show correctly (Rs format)
  - [ ] "Most Popular" badge on annual plan
  - [ ] Monthly equivalent calculation correct
  - [ ] Features list shows
  - [ ] "Get Started" buttons clickable
- [ ] Feature Comparison Table
  - [ ] All features listed
  - [ ] All plans have check marks
  - [ ] Responsive (scrolls on mobile)
- [ ] CTAs
  - [ ] "Read FAQ" button links to /faq
  - [ ] "Contact Sales" button links to /contact
- [ ] Responsive Design
  - [ ] Mobile: 1 column
  - [ ] Tablet: 2 columns
  - [ ] Desktop: 3 columns

### 4. Contact Page (`/contact`)
**Location**: `/web/app/contact/page.tsx`

#### Elements to Test:
- [ ] Hero section
  - [ ] Title "Get in Touch" visible
  - [ ] Subtitle visible
- [ ] Contact Channels (3 cards)
  - [ ] WhatsApp card
    - [ ] Green color (#22c55e)
    - [ ] Icon displays
    - [ ] "Chat Now" button works
  - [ ] Email card
    - [ ] Blue color
    - [ ] Icon displays
    - [ ] "Send Email" button works
  - [ ] Office card
    - [ ] Gold color
    - [ ] Icon displays
    - [ ] Address shows
- [ ] Contact Form
  - [ ] Name field
  - [ ] Email field (validates)
  - [ ] Phone field
  - [ ] Subject dropdown (5 options)
  - [ ] Message textarea
  - [ ] Submit button
  - [ ] Form submission shows success message
  - [ ] Form clears after submission
- [ ] Responsive Design
  - [ ] Mobile: stacked cards
  - [ ] Tablet/Desktop: 3 column layout

## Multi-Language Testing

### English (Default)
- [ ] All pages display English text by default
- [ ] No translation keys visible (e.g., "features.title" should NOT appear)
- [ ] All fallback text displays

### Urdu (When Implemented)
- [ ] Language switcher changes pages to Urdu
- [ ] Urdu text displays in RTL format
- [ ] All features work in Urdu

## Styling & Design Consistency

### Color Scheme
- [x] Background: #0F1117 (dark navy)
- [x] Surface: #1a1f2e (lighter navy)
- [x] Accent: Gold (#d4a960)
- [x] Text: White with opacity levels

### Typography
- [x] Headings use font-heading
- [x] Body text uses font-body
- [x] Proper font sizing hierarchy

### Responsive Breakpoints
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)

## Performance & Accessibility

- [ ] Page load time < 3 seconds
- [ ] All images have alt text
- [ ] Links have proper aria-labels
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA standards
- [ ] Forms are properly labeled

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Known Translation Keys in en.json

All the following translation keys are now available in `/web/i18n/locales/en.json`:

### Features Section
- features.caseManagementTitle, caseManagementDesc
- features.clientPortalTitle, clientPortalDesc
- features.remindersTitle, remindersDesc
- features.documentsTitle, documentsDesc
- features.analyticsTitle, analyticsDesc
- features.securityTitle, securityDesc
- features.automationTitle, automationDesc
- features.multiLanguageTitle, multiLanguageDesc
- features.benefit_* (24 benefit keys)
- features.compare_* (8 comparison keys)

### FAQ Section
- faq.q1-q15, faq.a1-a15
- faq.searchPlaceholder, noResults, stillNeed, contactSupport

### Pricing Section
- pricing.mostPopular, billedEvery, months, getCta, includes
- pricing.fullAccess, support, dataBackup, featureComparison

### Contact Section
- contact.title, subtitle, whatsapp, email, office
- contact.sendMessage, formDesc, success, name, email, phone, subject, message

## Status
- ✅ Code compiles successfully
- ✅ No TypeScript errors
- ✅ No ESLint errors
- 🔄 Ready for browser testing
- ⏳ Urdu translations to be added

## Testing Instructions

1. Start dev server: `cd web && npm run dev`
2. Navigate to each page:
   - http://localhost:3000/features
   - http://localhost:3000/faq
   - http://localhost:3000/pricing
   - http://localhost:3000/contact
3. Check each item in the checklist above
4. Test responsive design using DevTools
5. Test language switching (when English works)
6. Report any issues

