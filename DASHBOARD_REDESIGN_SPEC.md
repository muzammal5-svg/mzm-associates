# Dashboard Redesign Specification

## Overview
Complete redesign of the MZM dashboard to match modern admin panel aesthetics. Dark professional theme with expandable/collapsible sidebar, clean typography, and organized layout.

---

## Design System

### Color Palette

#### Primary Colors
- **Background (Dark)**: `#0F1117` (very dark gray/almost black)
- **Surface (Cards)**: `#1a1f2e` (dark navy/charcoal)
- **Surface Hover**: `#242d3f` (lighter charcoal)
- **Accent (Gold)**: `#d4a960` (warm gold - keep from current)
- **Accent (Cyan)**: `#0ea5e9` (sky blue accent)

#### Text Colors
- **Primary Text**: `#ffffff` (white)
- **Secondary Text**: `#a0aec0` (light gray)
- **Tertiary Text**: `#64748b` (muted gray)
- **Disabled Text**: `#475569` (darker gray)

#### Status/Alert Colors
- **Success**: `#10b981` (green)
- **Warning**: `#f59e0b` (amber)
- **Danger**: `#ef4444` (red)
- **Info**: `#0ea5e9` (cyan)

### Typography
- **Headings**: `font-heading` (existing)
- **Body**: `font-sans` (existing)
- **Font Weights**: 
  - Regular: 400
  - Medium: 500
  - Semibold: 600
  - Bold: 700

### Spacing
- Base unit: 4px
- Sidebar width: 280px (expanded), 80px (collapsed)
- Sidebar transition: 300ms

---

## Layout Architecture

### Desktop Layout (≥768px)
```
┌────────────────────────────────────────────────┐
│ Sidebar (280px | 80px)  │  Main Content       │
│ - Logo (with name)      │  ┌─────────────────┐│
│ - Search (expanded)     │  │ TopBar (sticky) ││
│ - Nav Menu              │  │ - Breadcrumb    ││
│ - Collapse Toggle       │  │ - Search        ││
│ - Theme Toggle          │  │ - User Profile  ││
│ - User Profile          │  └─────────────────┘│
│ - Sign Out              │  ┌─────────────────┐│
└────────────────────────────────────────────────┘│
                           │  Content Area      ││
                           │  (with animations) ││
                           └─────────────────────┘
```

### Mobile Layout (<768px)
```
┌─────────────────────────┐
│ MobileHeader (top)      │
│ - Menu Toggle           │
│ - Search                │
│ - User Profile          │
└─────────────────────────┘
┌─────────────────────────┐
│                         │
│ Content Area            │
│                         │
│                         │
└─────────────────────────┘
┌─────────────────────────┐
│ BottomNav (5 icons)     │
└─────────────────────────┘
```

---

## Component Specifications

### 1. Sidebar (Enhanced)

#### Expanded State (280px)
```
┌─────────────────────────────┐
│ ┌─ Logo Section ──────────┐ │ ← height: 60px, gap: 12px
│ │ [Logo] MZM & Associates  │ │
│ │ case management system   │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤ ← divider
│ ┌─ Search Box ─────────────┐ │
│ │ 🔍 Search...              │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ MAIN                         │
│ ✓ Overview                   │ ← active: gold accent
│ 🤖 AI Assistant              │
│ 👥 Users                     │
│ 📋 Projects                  │
├──────────────────────────────┤
│ ADMIN                        │
│ 👤 Admin Management          │
│ 🔐 Admin Roles               │
│ ⚙️ Settings                   │
├──────────────────────────────┤
│ DEMO                         │
│ 🎨 UI Component              │
├──────────────────────────────┤
│ ☀️ [Theme Toggle]  [→ X]     │ ← collapse button at end
└─────────────────────────────┘
User Profile Section (bottom)
│ [Avatar] Name               │
│ Role Badge                  │
│ ☎️ Contact                   │
│ 🚪 Sign Out                  │
```

#### Collapsed State (80px)
- Icons only
- Tooltip on hover
- Toggle button transforms

#### Styling
- **Background**: `bg-[#0F1117]` (very dark)
- **Hover**: `hover:bg-[#1a1f2e]`
- **Border**: `border-r border-white/5`
- **Active Link**: `bg-gold/10 text-gold border-l-2 border-gold`
- **Font Size**: `text-sm` (expanded), `text-xs` (labels)
- **Padding**: `px-4 py-3` per item
- **Rounded**: `rounded-lg` (items)
- **Icons**: `w-5 h-5`

### 2. AppShell (Updated)

#### Changes
- Sidebar width variable (280px | 80px)
- Smooth sidebar transition (300ms)
- Main content margin based on sidebar state
- Dark background for entire layout

### 3. DesktopTopBar (New Design)

```
┌───────────────────────────────────────────────────┐
│ Breadcrumb  │  [Search...] (centered)  │  Profile │
│ Dashboard > │  🔍                      │  [Avatar]│
│ Overview    │  Type to search...       │  Notify  │
└───────────────────────────────────────────────────┘
```

#### Styling
- **Background**: `bg-[#1a1f2e]/50` (semi-transparent)
- **Backdrop**: `backdrop-blur-sm`
- **Height**: `h-16`
- **Sticky**: `sticky top-0 z-20`
- **Divider**: `border-b border-white/5`

#### Components
1. **Breadcrumb**: Navigation path
2. **Search Bar**: Searchable content (centered)
3. **User Profile**: Avatar + notifications + dropdown

### 4. Dashboard Home (New Layout)

#### Header Section
```
┌─ Welcome Banner ─────────────────────────┐
│ Good Morning, Ahmed                       │
│ 📅 Monday, 27 Oct 2026 · 09:15 AM        │
│                          [Quick Action]  │
└──────────────────────────────────────────┘
```

#### Stats Section (4 Column Grid)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Cases  │ Active Cases │ Total Clients│ Reminders    │
│     245      │      89      │      156     │      23      │
│ ↑ 12% today  │ ↓ 3% week    │ ↑ 8% month   │ 5 overdue    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Service Cards Grid (2x5 or 3x4 responsive)
```
┌─────────────────────────────────────────────┐
│ 📋 Add New Case      │ 👥 Add New Client    │
│ Create a new legal.. │ Register a new...    │
└─────────────────────────────────────────────┘
... (icon + title + description per card)
```

#### Recent Activity Section
```
┌─ Recent Cases ────────────────────────────┐
│ [Avatar] Ahmed v. John Smith               │
│          Case #2024-0891                   │
│          Court: High Court, Karachi        │
│          Status: Hearing Pending           │
├───────────────────────────────────────────┤
│ ... (more items)
└──────────────────────────────────────────┘
```

### 5. Stat Card Style

```
┌─────────────────────────┐
│ 📊 Label                │
│                         │
│ 245                     │
│                         │
│ ↑ 12% since last week   │
└─────────────────────────┘
```

**Styling:**
- **Background**: `bg-[#1a1f2e]`
- **Border**: `border border-white/5`
- **Hover**: `hover:border-white/10 hover:shadow-lg`
- **Rounded**: `rounded-xl`
- **Padding**: `p-6`
- **Shadow**: `shadow-lg shadow-black/20`

### 6. Service Card Style

```
┌─────────────────────────┐
│ 📋                      │  ← Icon large
│                         │
│ Add New Case            │  ← Title
│ Create a new legal      │  ← Description
│ case quickly            │
└─────────────────────────┘
```

**Styling:**
- **Background**: `bg-gradient-to-br from-[#1a1f2e] to-[#0F1117]`
- **Border**: `border border-white/10`
- **Hover**: `hover:border-gold/50 hover:shadow-gold/20 hover:scale-105`
- **Rounded**: `rounded-xl`
- **Padding**: `p-6`
- **Icon Size**: `w-10 h-10`

---

## Animations

### Sidebar Toggle
```css
transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover Effects
```css
transition: all 200ms ease-out;
```

### Page Load
```css
animation: slideDown 400ms ease-out;
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Icon Set
- Overview: `LayoutDashboard`
- AI: `Sparkles` or `Zap`
- Users: `Users`
- Projects: `Briefcase`
- Admin Management: `ShieldCheck`
- Admin Roles: `Lock`
- Settings: `Settings`
- Notifications: `Bell`
- Search: `Search`
- Menu: `Menu`
- Close: `X`
- Collapse: `ChevronLeft`
- Expand: `ChevronRight`

---

## Responsive Behavior

### Breakpoints
- **Mobile**: < 768px (md)
  - Sidebar hidden (mobile drawer on menu click)
  - Bottom navigation visible
  - Full-width content
  
- **Tablet**: 768px - 1024px (md to lg)
  - Sidebar can be collapsed by default
  - Top bar visible
  - 2-column layouts
  
- **Desktop**: > 1024px (lg)
  - Sidebar expanded by default
  - Full layouts
  - 3+ column grids

---

## Color Implementation in Tailwind

Add to `tailwind.config.ts`:
```ts
extend: {
  colors: {
    'dashboard-bg': '#0F1117',
    'dashboard-surface': '#1a1f2e',
    'dashboard-surface-hover': '#242d3f',
    'dashboard-accent': '#0ea5e9',
  },
  spacing: {
    'sidebar-expanded': '280px',
    'sidebar-collapsed': '80px',
  },
}
```

---

## Implementation Order

1. **Sidebar** - Core navigation, collapsible state
2. **AppShell** - Layout adjustment for collapsible sidebar
3. **DesktopTopBar** - New search and profile section
4. **Dashboard Page** - New stat cards and layout
5. **Global Styles** - Dark theme backgrounds
6. **Testing** - TypeScript, Lint, Visual

---

## Accessibility

- **Keyboard Navigation**: Arrow keys to navigate sidebar
- **ARIA Labels**: All interactive elements labeled
- **Color Contrast**: Text colors meet WCAG AA standards
- **Focus States**: Clear focus indicators on all buttons
- **Reduced Motion**: Respect `prefers-reduced-motion`

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Notes

- Maintain existing functionality (all routes, actions)
- Keep responsive design for mobile
- Preserve language switching capability
- Keep theme toggle (light/dark mode option)
- Maintain all badges and notifications
- Smooth transitions and animations for UX
