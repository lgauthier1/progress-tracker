# Spec Alignment Check - MVP Phase 1-3

**Date**: 2025-10-27  
**Status**: Post-MVP validation before Phase 4

---

## ✅ Goal Management (FR-001 to FR-008)

| FR | Requirement | Status | Notes |
|----|-------------|--------|-------|
| FR-001 | Create goals with title, unit, goal type | ✅ DONE | GoalForm with type selector |
| FR-001a | Target-based: require target + deadline | ✅ DONE | Conditional validation in form |
| FR-001b | Continuous: no target/deadline required | ✅ DONE | Discriminated union in types |
| FR-002 | Display goal list with progress indicators | ✅ DONE | Dashboard with GoalCard |
| FR-003 | Edit goal details | ⚠️ PARTIAL | **Missing edit goal UI** (backend ready) |
| FR-004 | Delete goals | ✅ DONE | Delete button in GoalDetail |
| FR-005 | Auto-complete target-based at 100% | ❌ MISSING | Status stays ACTIVE |
| FR-005a | Manual complete/reset for continuous | ❌ MISSING | No UI for this |
| FR-006 | Support multiple unit types | ✅ DONE | Free text unit field |
| FR-007 | Display days remaining for target-based | ✅ DONE | In ProgressOverview |
| FR-007a | Display days elapsed for continuous | ✅ DONE | In ProgressOverview |
| FR-008 | Persist all data | ✅ DONE | PostgreSQL + Prisma |

**Critical Missing**: FR-005 (auto-complete), FR-003 (edit goal UI)

---

## ✅ Progress Logging (FR-009 to FR-014)

| FR | Requirement | Status | Notes |
|----|-------------|--------|-------|
| FR-009 | Log progress with amount and date | ✅ DONE | Add progress form with date picker |
| FR-009a | Continuous: increment or reset | ⚠️ PARTIAL | Can log negative values (manual reset) |
| FR-010 | Target: show % and current/target | ✅ DONE | ProgressOverview component |
| FR-010a | Continuous: show count + days elapsed | ✅ DONE | ProgressOverview component |
| FR-011 | Chronological history | ✅ DONE | ProgressHistory component |
| FR-012 | Edit/delete progress entries | ✅ DONE | Edit modal + delete button |
| FR-012a | Deleting reset restores streak | ❌ N/A | No explicit "reset" entry type |
| FR-013 | Calculate cumulative progress | ✅ DONE | Backend recalculates on each change |
| FR-014 | Incremental progress logging | ✅ DONE | Users enter amount added, not total |

**Critical Missing**: None (FR-012a not applicable with current design)

---

## ❌ Data Visualization (FR-015 to FR-018) - PHASE 4

| FR | Requirement | Status | Notes |
|----|-------------|--------|-------|
| FR-015 | Line chart showing progress over time | ❌ TODO | **Phase 4 - Charts** |
| FR-016 | Target: projection/pace indicator | ❌ TODO | **Phase 4 - Charts** |
| FR-016a | Continuous: growth chart (no projection) | ❌ TODO | **Phase 4 - Charts** |
| FR-017 | Dashboard summarizing active goals | ✅ DONE | Dashboard view exists |
| FR-018 | Responsive charts | ❌ TODO | **Phase 4 - Charts** |

**Expected**: All visualization FRs are Phase 4 scope ✅

---

## ❌ Habit Tracking (FR-019 to FR-024) - PHASE 5

| FR | Requirement | Status | Notes |
|----|-------------|--------|-------|
| FR-019 | Create habits with flexible frequency | ❌ TODO | **Phase 5 - Habits** |
| FR-019a | Multiple completions per day option | ❌ TODO | **Phase 5 - Habits** |
| FR-020 | Log habit completions | ❌ TODO | **Phase 5 - Habits** |
| FR-021 | Calculate current streak | ❌ TODO | **Phase 5 - Habits** |
| FR-022 | Reset streak on miss | ❌ TODO | **Phase 5 - Habits** |
| FR-023 | Show completion status for period | ❌ TODO | **Phase 5 - Habits** |
| FR-024 | Calendar view of completions | ❌ TODO | **Phase 5 - Habits** |

**Expected**: All habit FRs are Phase 5 scope ✅

---

## ❌ Organization (FR-025 to FR-028) - PHASE 6

| FR | Requirement | Status | Notes |
|----|-------------|--------|-------|
| FR-025 | Create custom categories | ❌ TODO | **Phase 6 - Categories** |
| FR-026 | Assign category to goal/habit | ❌ TODO | **Phase 6 - Categories** |
| FR-027 | Filter by category | ❌ TODO | **Phase 6 - Categories** |
| FR-028 | Aggregate stats per category | ❌ TODO | **Phase 6 - Categories** |

**Expected**: All category FRs are Phase 6 scope ✅

---

## ✅ User Management (FR-033 to FR-036)

| FR | Requirement | Status | Notes |
|----|-------------|--------|-------|
| FR-033 | Require authentication | ✅ DONE | JWT auth with guards |
| FR-034 | Users see only their own data | ✅ DONE | Backend filters by userId |
| FR-035 | Account creation with email/password | ✅ DONE | Register view with validation |
| FR-036 | Allow logout | ✅ DONE | Logout button in header |

**Critical Missing**: None ✅

---

## 🔍 Summary: MVP Phase 1-3 Alignment

### ✅ Implemented (Core MVP)
- **Goal CRUD**: Create, read, delete ✅
- **Goal types**: Target-based + Continuous counter ✅
- **Progress CRUD**: Create, read, update, delete ✅
- **Date picker**: Custom dates for progress entries ✅
- **Progress calculation**: Incremental + auto-recalc ✅
- **Authentication**: Register, login, logout ✅
- **Authorization**: User data isolation ✅
- **Progress display**: %, count, days remaining/elapsed ✅

### ⚠️ Partially Implemented
- **FR-003 (Edit goal)**: Backend ready, UI missing
- **FR-009a (Reset continuous)**: Can use negative values (workaround)

### ❌ Missing from MVP Scope (Expected)
- **FR-005**: Auto-complete target-based goals at 100%
- **FR-005a**: Manual complete/reset UI for continuous goals
- **All FR-015 to FR-018**: Charts (Phase 4 scope)
- **All FR-019 to FR-024**: Habits (Phase 5 scope)
- **All FR-025 to FR-028**: Categories (Phase 6 scope)

---

## 🚨 Critical Gaps for MVP

### Priority 1 - Should fix before Phase 4
1. **FR-005**: Auto-complete target-based goals when currentValue >= targetValue
   - **Impact**: Goals stay ACTIVE even when completed
   - **Fix**: Add logic in `progress-entries.service.ts` after recalculation
   - **Effort**: 10 min

2. **FR-003**: Add Edit Goal UI
   - **Impact**: Can't fix mistakes in goal settings
   - **Fix**: Add edit modal in GoalDetail (similar to edit progress)
   - **Effort**: 15 min

### Priority 2 - Nice to have (can defer)
3. **FR-005a**: Manual complete/reset for continuous counters
   - **Impact**: Workaround exists (negative progress)
   - **Fix**: Add "Complete" and "Reset" buttons
   - **Effort**: 10 min

---

## 📊 Recommendation

### Option A: Fix critical gaps now (25 min)
✅ Fix FR-005 (auto-complete)  
✅ Fix FR-003 (edit goal UI)  
✅ Then run tests  
✅ Then Phase 4  

### Option B: Run tests first, fix if blocking (15 min)
✅ Run contract tests  
✅ Fix only if tests fail  
⏭️ Defer FR-003/FR-005 to post-Phase 4  
✅ Phase 4 immediately  

### Option C: Skip to Phase 4 (0 min)
⏭️ Defer all fixes  
✅ Phase 4 Charts  
❓ Risk: Incomplete behavior might confuse chart implementation  

**My recommendation**: **Option A**  
- FR-005 is critical (completed goals should show as completed)
- FR-003 is important UX (users will want to edit goals)
- 25 min investment now = cleaner Phase 4
- Tests will validate the fixes

---

## ✅ Next Steps

Based on your choice:
1. **If Option A**: Implement FR-005 + FR-003, then tests, then Phase 4
2. **If Option B**: Run tests now, fix critical failures, then Phase 4
3. **If Option C**: Phase 4 immediately

**What do you choose?** A, B, or C?

