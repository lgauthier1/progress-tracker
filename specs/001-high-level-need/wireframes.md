# Wireframes - Personal Progress Tracker

**Created**: 2025-10-25  
**Purpose**: Low-fidelity wireframes to guide implementation architecture  
**Note**: These are functional descriptions, not pixel-perfect designs. Use shadcn-vue components + Tailwind for actual UI.

---

## 1. Dashboard (Home Page)

**Route**: `/`  
**User Story**: P1 - View all goals and habits at a glance

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Habits Tracker              [User Menu ▼]           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Dashboard                                                   │
│                                                              │
│  [+ New Goal]  [+ New Habit]    [Filter: All ▼] [Search🔍]  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Active Goals (3)                                      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │  💰 Save for Vacation              [Health Category]  │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%               │  │
│  │  $2,250 / $5,000  •  125 days left                    │  │
│  │                                          [View Details →]│  │
│  │                                                        │  │
│  │  🏃 Days Without Alcohol           [Health Category]  │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 23 days           │  │
│  │  Continuous counter  •  Started Oct 2                 │  │
│  │                                          [View Details →]│  │
│  │                                                        │  │
│  │  📚 Read 50 Books                  [Lifestyle]        │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 18%               │  │
│  │  9 / 50 books  •  240 days left                       │  │
│  │                                          [View Details →]│  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Active Habits (2)                                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                        │  │
│  │  🧘 Morning Meditation (Daily)                        │  │
│  │  🔥 Streak: 12 days                                   │  │
│  │  This week: ✅✅✅✅❌✅✅ (6/7)                          │  │
│  │                          [Log Today] [View Details →]  │  │
│  │                                                        │  │
│  │  💪 Gym Workout (3x per week)                         │  │
│  │  🔥 Streak: 4 weeks                                   │  │
│  │  This week: ✅❌✅❌❌❌❌ (2/3)                          │  │
│  │                          [Log Today] [View Details →]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Components needed**:
- Header with nav
- Goal card (compact) - shows progress bar, key metrics
- Habit card (compact) - shows streak, week status
- Filter dropdown
- Search input
- Action buttons

---

## 2. Create Goal Form

**Route**: `/goals/new`  
**User Story**: P1 - Create target-based or continuous counter goal

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Create New Goal                                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │  Goal Type *                                           │  │
│  │  ○ Target-based (reach a specific target by deadline) │  │
│  │  ○ Continuous counter (track ongoing progress)        │  │
│  │                                                        │  │
│  │  ────────────────────────────────────────────────────  │  │
│  │                                                        │  │
│  │  Goal Title *                                          │  │
│  │  [_________________________________]                   │  │
│  │  e.g., "Save for vacation"                            │  │
│  │                                                        │  │
│  │  Unit *                                                │  │
│  │  [_________________________________]                   │  │
│  │  e.g., "dollars", "days", "books"                     │  │
│  │                                                        │  │
│  │  ──── If Target-based selected ────                   │  │
│  │                                                        │  │
│  │  Target Value *                                        │  │
│  │  [_________________________________]                   │  │
│  │                                                        │  │
│  │  Deadline *                                            │  │
│  │  [____/____/________] 📅                              │  │
│  │                                                        │  │
│  │  ──── Optional ────                                    │  │
│  │                                                        │  │
│  │  Category                                              │  │
│  │  [Select category ▼]                                   │  │
│  │                                                        │  │
│  │  Starting Value (optional)                             │  │
│  │  [_________________________________]                   │  │
│  │  If you already have progress                         │  │
│  │                                                        │  │
│  │                          [Cancel]  [Create Goal]       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Components needed**:
- Form with radio buttons (goal type)
- Text inputs (title, unit, target)
- Date picker
- Dropdown (category)
- Conditional fields based on goal type
- Form validation

---

## 3. Goal Detail Page (Target-based)

**Route**: `/goals/:id`  
**User Story**: P1 - View progress + P2 - View chart

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                           [⋮ More Menu] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  💰 Save for Vacation                     [Health Category] │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Progress Overview                                     │  │
│  │                                                        │  │
│  │      $2,250 / $5,000                                   │  │
│  │      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%            │  │
│  │                                                        │  │
│  │      $2,750 remaining  •  125 days left               │  │
│  │      On track: Need $22/day to reach goal ✅          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Progress Over Time                    [View: 1M ▼]   │  │
│  │                                                        │  │
│  │    5000 ┤                                         ╱   │  │
│  │         ┤                                    ╱────    │  │
│  │    4000 ┤                              ╱────          │  │
│  │         ┤                         ╱────               │  │
│  │    3000 ┤                    ╱────                    │  │
│  │         ┤               ╱────                         │  │
│  │    2000 ┤          ╱────                              │  │
│  │         ┤     ╱────                                   │  │
│  │    1000 ┤╱────                                        │  │
│  │         └────────────────────────────────────────     │  │
│  │         Jun    Jul    Aug    Sep    Oct    Nov        │  │
│  │                                                        │  │
│  │  ━━━ Actual progress    ┄┄┄ Projected (on pace)      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Progress History                            [+ Log Progress]│
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Oct 24, 2025  •  +$250                              ⋮ │  │
│  │  Total: $2,250                                         │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Oct 17, 2025  •  +$500                              ⋮ │  │
│  │  Total: $2,000                                         │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Oct 10, 2025  •  +$300                              ⋮ │  │
│  │  Total: $1,500                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Components needed**:
- Progress card with large metrics
- Line chart (Chart.js via abstraction)
- Time range selector
- Progress history list
- Log progress button/modal
- Edit/delete menu

---

## 4. Goal Detail Page (Continuous Counter)

**Route**: `/goals/:id` (continuous type)  
**User Story**: P1 - Track continuous counter like "days without alcohol"

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                           [⋮ More Menu] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🏃 Days Without Alcohol                  [Health Category] │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Current Streak                                        │  │
│  │                                                        │  │
│  │              🔥  23 days                               │  │
│  │                                                        │  │
│  │         Started: October 2, 2025                       │  │
│  │         Keep going strong! 💪                          │  │
│  │                                                        │  │
│  │         [✅ Log Today]              [🔄 Reset]         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Progress Over Time                                    │  │
│  │                                                        │  │
│  │     25 ┤                                          ╱    │  │
│  │        ┤                                     ╱────     │  │
│  │     20 ┤                                ╱────          │  │
│  │        ┤                           ╱────               │  │
│  │     15 ┤                      ╱────                    │  │
│  │        ┤                 ╱────                         │  │
│  │     10 ┤            ╱────                              │  │
│  │        ┤       ╱────                                   │  │
│  │      5 ┤  ╱────                                        │  │
│  │        └────────────────────────────────────────       │  │
│  │        Oct 2    Oct 9    Oct 16   Oct 23              │  │
│  │                                                        │  │
│  │  No deadline - continuous tracking                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  History                                                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Oct 24, 2025  •  ✅ Day logged                      ⋮ │  │
│  │  Streak: 23 days                                       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Oct 23, 2025  •  ✅ Day logged                      ⋮ │  │
│  │  Streak: 22 days                                       │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Oct 22, 2025  •  ✅ Day logged                      ⋮ │  │
│  │  Streak: 21 days                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Components needed**:
- Large streak display with emoji/celebration
- Action buttons (log today, reset)
- Line chart showing count growth (no projection)
- History list showing daily logs
- Different visual treatment than target-based

---

## 5. Log Progress Modal/Dialog

**Triggered from**: Goal detail page  
**User Story**: P1 - Log incremental progress

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│         ┌───────────────────────────────────────┐           │
│         │  Log Progress                        │           │
│         │                                       │           │
│         │  Goal: Save for Vacation              │           │
│         │  Current: $2,250 / $5,000             │           │
│         │                                       │           │
│         │  Amount Added *                       │           │
│         │  $ [___________________]              │           │
│         │                                       │           │
│         │  Date *                               │           │
│         │  [____/____/________] 📅             │           │
│         │  (defaults to today)                  │           │
│         │                                       │           │
│         │  Note (optional)                      │           │
│         │  [___________________________]        │           │
│         │  [___________________________]        │           │
│         │                                       │           │
│         │  New total: $2,250 + entered = ?     │           │
│         │                                       │           │
│         │           [Cancel]  [Save Progress]   │           │
│         └───────────────────────────────────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Components needed**:
- Modal/dialog (shadcn Dialog)
- Number input with currency/unit symbol
- Date picker (default to today)
- Text area for notes
- Live calculation preview
- Form validation

---

## 6. Create Habit Form

**Route**: `/habits/new`  
**User Story**: P3 - Create habit with flexible frequency

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Create New Habit                                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │  Habit Title *                                         │  │
│  │  [_________________________________]                   │  │
│  │  e.g., "Morning meditation"                           │  │
│  │                                                        │  │
│  │  Frequency Pattern *                                   │  │
│  │  [Select pattern ▼]                                    │  │
│  │    • Daily                                             │  │
│  │    • Weekly (X times per week)                        │  │
│  │    • Custom interval (every N days)                   │  │
│  │    • Monthly (X times per month)                      │  │
│  │    • Advanced (complex patterns)                      │  │
│  │                                                        │  │
│  │  ──── If "Weekly" selected ────                       │  │
│  │                                                        │  │
│  │  Times per week *                                      │  │
│  │  [___] times                                           │  │
│  │                                                        │  │
│  │  Specific days (optional)                              │  │
│  │  ☐ Mon ☐ Tue ☐ Wed ☐ Thu ☐ Fri ☐ Sat ☐ Sun          │  │
│  │                                                        │  │
│  │  ──── Optional ────                                    │  │
│  │                                                        │  │
│  │  Category                                              │  │
│  │  [Select category ▼]                                   │  │
│  │                                                        │  │
│  │  ☐ Allow multiple completions per day                 │  │
│  │                                                        │  │
│  │                          [Cancel]  [Create Habit]      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Components needed**:
- Form with dropdown (frequency pattern)
- Conditional inputs based on pattern
- Number input (times per week/month)
- Day selector (checkboxes)
- Checkbox (multiple per day)
- Form validation

---

## 7. Habit Detail Page

**Route**: `/habits/:id`  
**User Story**: P3 - View habit streak and calendar

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                           [⋮ More Menu] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🧘 Morning Meditation                    [Health Category] │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Current Streak                                        │  │
│  │                                                        │  │
│  │              🔥  12 days                               │  │
│  │                                                        │  │
│  │         Frequency: Daily                               │  │
│  │         This week: 6/7 days completed                  │  │
│  │                                                        │  │
│  │              [✅ Log Completion]                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  This Week                                             │  │
│  │                                                        │  │
│  │  Mon    Tue    Wed    Thu    Fri    Sat    Sun        │  │
│  │  ✅     ✅     ✅     ✅     ❌     ✅     ✅          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Completion Calendar           [< October 2025 >]     │  │
│  │                                                        │  │
│  │  Sun  Mon  Tue  Wed  Thu  Fri  Sat                    │  │
│  │        1✅   2✅   3✅   4✅   5❌   6✅               │  │
│  │   7✅   8✅   9✅  10✅  11✅  12✅  13✅              │  │
│  │  14✅  15✅  16✅  17✅  18✅  19❌  20✅              │  │
│  │  21✅  22✅  23✅  24✅  25⚪  26⚪  27⚪              │  │
│  │  28⚪  29⚪  30⚪  31⚪                                 │  │
│  │                                                        │  │
│  │  ✅ Completed    ❌ Missed    ⚪ Future/No data        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Recent Activity                                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Oct 24, 2025  •  ✅ Completed                       ⋮ │  │
│  │  7:30 AM                                               │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Oct 23, 2025  •  ✅ Completed                       ⋮ │  │
│  │  7:15 AM                                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Components needed**:
- Streak display
- Current week mini-view
- Calendar component (month view with status indicators)
- Month navigation
- Completion history list
- Log completion button/modal

---

## Design System Notes

**Colors** (using Tailwind/shadcn defaults):
- Primary: Blue/Purple for actions
- Success: Green for completed, on-track
- Warning: Orange for at-risk
- Danger: Red for missed, off-track
- Neutral: Gray for secondary info

**Typography**:
- Large numbers for key metrics (progress %, streak count)
- Clear hierarchy (h1 for page title, h2 for sections)

**Spacing**:
- Generous whitespace
- Card-based layout
- Mobile-first responsive

**Icons**:
- Use emojis for goal/habit avatars (simple, no custom icon library needed for V1)
- shadcn-vue includes Lucide icons for UI elements

**Charts** (P2):
- Line charts with simple, clean styling
- Projection lines as dashed
- Clear axis labels
- Responsive to container width

---

## Component Inventory

Based on these wireframes, we need:

**Layout**:
- `AppHeader.vue` - Navigation, user menu
- `AppLayout.vue` - Main layout wrapper
- `PageHeader.vue` - Page title + actions

**Cards**:
- `GoalCard.vue` - Compact goal display
- `HabitCard.vue` - Compact habit display
- `ProgressOverview.vue` - Large metrics display
- `StreakDisplay.vue` - Large streak display

**Forms**:
- `GoalForm.vue` - Create/edit goal
- `HabitForm.vue` - Create/edit habit
- `LogProgressDialog.vue` - Modal for logging progress

**Charts** (via abstraction):
- `ProgressLineChart.vue` - Line chart for goal progress
- `HabitCalendar.vue` - Calendar view for habit completions

**Lists**:
- `ProgressHistory.vue` - List of progress entries
- `HabitHistory.vue` - List of habit completions

**Utilities**:
- Progress bar component (shadcn Progress)
- Date picker (shadcn Calendar)
- Dropdown (shadcn Select)
- Modal/Dialog (shadcn Dialog)

---

## Responsive Considerations

**Desktop (>1024px)**:
- Dashboard: 2-column layout (goals left, habits right)
- Detail pages: Chart takes 2/3 width, history sidebar 1/3

**Tablet (768-1024px)**:
- Dashboard: Single column, stacked
- Detail pages: Chart full width, history below

**Mobile (<768px)**:
- All single column
- Charts: Simplified view, tap to expand
- Navigation: Hamburger menu
- Actions: Floating action button for "Log Progress"

---

**Next Step**: These wireframes will inform the component structure in `/speckit.plan`. Ready to proceed! 🚀

