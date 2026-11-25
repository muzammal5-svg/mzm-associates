# Case Form Visual Guide & Reference

**Updated**: October 27, 2026

---

## New Case Form Structure (`/cases/new`)

```
┌─────────────────────────────────────────────────────────────┐
│ MZM & Associates - New Case                        [<] [≡]  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CLIENTS                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Clients *                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🔍 Search clients...                            ] ✓     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CASE DETAILS                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Case No.                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [WP-1234/2024                                    ]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Case Type *                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Civil Case                              ▼]             │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Options:                                                     │
│   • Civil Case                                               │
│   • Criminal Case                                            │
│   • Constitutional Case                                      │
│   • Appeal                                                   │
│   • Execution                                                │
│   • Arbitration                                              │
│                                                               │
│ From / Representing *                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Plaintiff                                    ]         │ │
│ │ 📝 Datalist: Plaintiff, Defendant, ...                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Suggestions:                                                 │
│ [Plaintiff] [Defendant]                                      │
│                                                               │
│ Plaintiff *              │ Defendant *                        │
│ ┌──────────────────────┐ │ ┌──────────────────────┐          │
│ │ [Muhammad Aslam...] │ │ │ [Province of Punjab] │          │
│ └──────────────────────┘ │ └──────────────────────┘          │
│                                                               │
│ Court                    │ Fresh Diary                        │
│ ┌──────────────────────┐ │ ┌──────────────────────┐          │
│ │ [District Court...▼] │ │ │ [📅 24 Oct 2026]     │          │
│ │ 📝 Datalist: Courts  │ │ └──────────────────────┘          │
│ └──────────────────────┘ │                                    │
│ [Judicial Magistrate...]  │                                   │
│ [Lahore High Court...]     │                                   │
│                                                               │
│ Current Proceeding                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Current proceeding / today's order or notice...        │ │
│ │                                                          │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ FIRST HEARING ENTRY (Optional)                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Serial No.               │ Next Date                          │
│ ┌──────────────────────┐ │ ┌──────────────────────┐          │
│ │ [14                  ] │ │ [📅 ]                │          │
│ └──────────────────────┘ │ └──────────────────────┘          │
│                                                               │
│ Next Proceeding                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [                                                        │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Note: Reminder will auto-generate for next hearing date      │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ [           Cancel          ] [           Save           ]   │
└─────────────────────────────────────────────────────────────┘
```

---

## Edit Case Form Structure (`/cases/edit`)

**Same as New Case Form, but:**
- Client selector is replaced with read-only client name (linked)
- Fresh Diary loads existing value instead of defaulting to today
- All fields pre-populated with existing case data
- Form allows updating all fields

---

## Case Type & Party Label Mapping

### When User Selects Case Type:

```
BEFORE:                      AFTER:
┌──────────────────┐        ┌──────────────────┐
│ Case Type: Civil │        │ Case Type: Civil │
│ [Plaintiff field]│        │ [Plaintiff field]│
│ [Defendant field]│        │ [Defendant field]│
└──────────────────┘        └──────────────────┘
  ↓                            ↓
  Select: Criminal Case        ✨ LABELS UPDATE ✨
                               ↓
                        ┌──────────────────┐
                        │ Case Type: Crim. │
                        │ [State field]    │  ← Label changed
                        │ [Accused field]  │  ← Label changed
                        │ Offence field ↔ │  ← Shows now
                        └──────────────────┘
                               ↓
                        From suggestions update:
                        [State] [Accused]       ← New chips
```

### Party Label Updates by Case Type:

| Select Case Type | Primary Field | Secondary Field | From Chips |
|---|---|---|---|
| **Civil Case** | Plaintiff | Defendant | [Plaintiff] [Defendant] |
| **Criminal Case** | State | Accused | [State] [Accused] [Complainant]* |
| **Constitutional Case** | Petitioner | Respondent | [Petitioner] [Respondent] |
| **Appeal** | Appellant | Respondent | [Appellant] [Respondent] |
| **Execution** | Decree-holder | Judgment-debtor | [Decree-holder] [Judgment-debtor] |
| **Arbitration** | Claimant | Respondent | [Claimant] [Respondent] |

*Criminal Case includes additional suggested roles

---

## Chip Selection Behavior

```
STEP 1: User clicks "State" chip
     ↓
┌──────────────────────────┐
│ [Plaintiff] [Defendant]  │  ← Normal appearance
│ [State]  ← Clicked       │
│ [Accused]                │
└──────────────────────────┘

STEP 2: Chip becomes selected (highlighted)
     ↓
┌──────────────────────────────┐
│ [Plaintiff] [Defendant]      │  ← Unselected: light gray
│ [State - Selected]           │  ← Selected: dark navy/gold
│ [Accused]                    │  ← Unselected: light gray
└──────────────────────────────┘

STEP 3: "From" field updates
     ↓
┌─────────────────────┐
│ State               │  ← Field updated
└─────────────────────┘

STEP 4: If client selected, party field auto-fills
     ↓
┌──────────────────────┐
│ State field: "State" │  ← Filled with selected role or client name
│ Accused field: ""    │  ← Emptied/cleared
└──────────────────────┘
```

---

## Fresh Diary Field - Date Picker

```
DESKTOP:
┌──────────────────────────────┐
│ Fresh Diary                  │
│ ┌──────────────────────────┐ │
│ │ 📅 24 Oct 2026         │ │  ← Click to open picker
│ └──────────────────────────┘ │
└──────────────────────────────┘
     ↓ Click
┌──────────────────────────────────────┐
│ October 2026                 ◄ 2026 ►│
│                                      │
│ Su Mo Tu We Th Fr Sa                │
│           1  2  3  4  5             │
│  6  7  8  9 10 11 12                │
│ 13 14 15 16 17 18 19                │
│ 20 21 22 23 [24]* 25 26  ← Today   │
│ 27 28 29 30 31                      │
│                                      │
│ [Clear] [Set to Today] [Confirm]   │
└──────────────────────────────────────┘

MOBILE:
┌─────────────────────────┐
│ Fresh Diary             │
│ ┌───────────────────┐   │
│ │ 24 Oct 2026   📅 │   │  ← Opens native picker
│ └───────────────────┘   │
└─────────────────────────┘
     ↓ Tap
  [OS Date Picker Opens]
  (iOS: Scroll wheel or calendar)
  (Android: Calendar picker)
```

---

## Current Proceeding Field - Textarea

```
DESKTOP:
┌────────────────────────────────────────┐
│ Current Proceeding                     │
│ ┌────────────────────────────────────┐ │
│ │ Current proceeding / today's order │ │
│ │ or notice...                       │ │
│ │                                    │ │
│ │ [User can type multi-line text]   │ │
│ │                                    │ │
│ │ [Max 2000 characters]             │ │
│ └────────────────────────────────────┘ │
│ Character count: 145 / 2000             │
└────────────────────────────────────────┘

MOBILE:
(Same as desktop, optimized for touch)
```

---

## Form Validation - Error States

```
MISSING REQUIRED FIELD:
┌──────────────────────────┐
│ Plaintiff *              │
│ ┌──────────────────────┐ │
│ │ [                  ] │
│ └──────────────────────┘ │
│ ⚠️ Primary party name is │
│    required              │
└──────────────────────────┘

INVALID DATE:
┌──────────────────────────┐
│ Next Date                │
│ ┌──────────────────────┐ │
│ │ 📅 20 Oct 2026      │
│ └──────────────────────┘ │
│ ⚠️ Next date cannot be   │
│    in the past           │
└──────────────────────────┘

DUPLICATE CASE REFERENCE:
┌──────────────────────────────────┐
│ Case No.                         │
│ ┌──────────────────────────────┐ │
│ │ WP-1234/2024               │ │
│ └──────────────────────────────┘ │
│ ⚠️ 🔔 Case "WP-1234/2024"      │
│ already exists: Ahmed Khan vs    │
│ Province of Punjab              │
└──────────────────────────────────┘
```

---

## Field Mapping Summary

### In Edit Case Form:

| Database Column | Form Field Name | UI Label | Component |
|---|---|---|---|
| `judge_name` | `fresh_diary` | Fresh Diary | DatePicker |
| `description` | `description` | Current Proceeding | Textarea |
| `plaintiff_name` | `plaintiff_name` | [Dynamic: Plaintiff/Petitioner/State] | Input |
| `defendant_name` | `defendant_name` | [Dynamic: Defendant/Respondent/Accused] | Input |
| `From`/`representing` | `From` | From / Representing | Input + Chips |
| `case_type_id` | `case_type_id` | Case Type | Select |

---

## Translation Keys Used

| Key | English Value | Used In |
|---|---|---|
| `cases.freshDiary` | Fresh Diary | DatePicker label |
| `cases.currentProceedingCase` | Current Proceeding | Textarea label |
| `cases.caseType` | Case Type | Dropdown label |
| `cases.From` | From | Input label |
| `cases.fromPlaceholder` | e.g. Plaintiff, Defendant... | Input placeholder |
| `cases.court` | Court | Input label |
| `cases.offence` | Offence | Input label (conditional) |
| `cases.caseDetails` | Case Details | Card header |
| `cases.firstHearing` | First Hearing Entry | Card header |
| `hearings.serialNo` | Serial No. | Input label |
| `hearings.nextDate` | Next Date | DatePicker label |
| `hearings.nextProceeding` | Next Proceeding | Textarea label |
| `common.optional` | Optional | Section subtitle |

---

## Mobile Responsiveness

```
DESKTOP (md and up):
┌─────────────────────────────────────┐
│ Plaintiff        │ Defendant        │  ← 2 columns
│ [          ]     │ [          ]     │
└─────────────────────────────────────┘

MOBILE (below md):
┌──────────────────┐
│ Plaintiff        │
│ [          ]     │  ← Stacked single column
└──────────────────┘
┌──────────────────┐
│ Defendant        │
│ [          ]     │
└──────────────────┘
```

---

## Dark Theme Application

All form elements apply dark theme from `web/app/globals.css`:

```
Input (Fresh Diary, Court, etc.):
  Background: bg-white/10        (semi-transparent on dark)
  Border:     border-white/20    (subtle)
  Text:       text-white         (high contrast)
  Focus:      ring-gold          (gold highlight)

DatePicker:
  Calendar:   bg-[#1a1f2e]       (dark surface)
  Text:       text-white         (high contrast)
  Selected:   bg-gold            (gold highlight)

Textarea (Current Proceeding):
  Background: bg-white/10        (consistent with inputs)
  Border:     border-white/20
  Text:       text-white
  Focus:      ring-gold

Buttons:
  Primary:    bg-gold, text-white, shadow-gold
  Secondary:  bg-white/10, text-white, border-white/20

Labels:
  Color:      text-white/80      (secondary text)

Errors:
  Color:      text-danger        (red, high contrast on dark)
```

---

**Reference Guide Complete**  
**Last Updated**: October 27, 2026
