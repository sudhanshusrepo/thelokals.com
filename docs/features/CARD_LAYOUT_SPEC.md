# Service Card Layout Optimization - Technical Specification

## Overview
This document details the specific CSS and layout changes needed to optimize service card layouts on the homepage and group detail pages.

## Current State Analysis

### Homepage (`packages/client/components/HomePage.tsx`)

**Current Layout (Lines 91-92):**
```tsx
<div className="w-full px-2 sm:px-4">  {/* ← Side padding wastes space */}
  <div className="grid grid-cols-3 gap-2 sm:gap-4">  {/* ← Gap could be optimized */}
```

**Current Card (Lines 109-120):**
```tsx
className={`
  relative flex flex-col items-center p-2 sm:p-6
  bg-white dark:bg-slate-800
  rounded-xl sm:rounded-2xl
  shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
  hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.4)]
  border border-slate-100 dark:border-slate-700
  hover:border-teal-500/50 dark:hover:border-teal-400/50
  group overflow-hidden
  min-h-[100px] sm:min-h-[160px] justify-center  {/* ← Could be taller */}
  transform-gpu perspective-1000
`}
```

**Issues:**
- ❌ Container has `px-2 sm:px-4` - wastes 8px-16px on each side
- ❌ Grid gap `gap-2 sm:gap-4` - could be tighter
- ❌ Card padding `p-2` on mobile - too small
- ❌ Min height `min-h-[100px]` - cards could be taller

### Group Detail Page (`packages/client/components/GroupDetailPage.tsx`)

**Current Layout (Line 36):**
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
```

**Current Card (Line 42):**
```tsx
className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 p-4 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-600/50 transition-all duration-300 h-28 sm:h-32 group shadow-md hover:shadow-lg hover:-translate-y-1 border border-slate-100 dark:border-slate-700"
```

**Issues:**
- ❌ Inconsistent grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
- ❌ Different styling than homepage
- ❌ Different gap spacing
- ❌ Fixed height `h-28 sm:h-32` instead of min-height
- ❌ Different hover effects

## Proposed Changes

### 1. Homepage Optimization

#### Container Changes
```tsx
// BEFORE
<div className="w-full px-2 sm:px-4">
  <div className="grid grid-cols-3 gap-2 sm:gap-4">

// AFTER
<div className="w-full px-0">
  <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
```

**Rationale:**
- Remove side padding to maximize card width
- Reduce gap from 8px→6px (mobile) and 16px→12px (desktop)
- Extra space goes to card size

#### Card Changes
```tsx
// BEFORE
className={`
  relative flex flex-col items-center p-2 sm:p-6
  ...
  min-h-[100px] sm:min-h-[160px] justify-center
  ...
`}

// AFTER
className={`
  relative flex flex-col items-center p-3 sm:p-6
  ...
  min-h-[120px] sm:min-h-[180px] justify-center
  ...
`}
```

**Rationale:**
- Increase mobile padding from 8px→12px (compensate for removed container margin)
- Increase min-height by 20px for better proportions
- Better touch targets

### 2. Group Detail Page Standardization

#### Layout Changes
```tsx
// BEFORE
<div className="animate-fade-in-up px-4">
  {/* ... */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">

// AFTER
<div className="animate-fade-in-up px-0">
  {/* ... */}
  <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
```

**Rationale:**
- Match homepage: 3 columns consistently
- Remove container padding
- Use same gap spacing as homepage

#### Card Styling Unification
```tsx
// BEFORE
className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 p-4 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-600/50 transition-all duration-300 h-28 sm:h-32 group shadow-md hover:shadow-lg hover:-translate-y-1 border border-slate-100 dark:border-slate-700"

// AFTER
className="relative flex flex-col items-center justify-center p-3 sm:p-6
  bg-white dark:bg-slate-800
  rounded-xl sm:rounded-2xl
  shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
  hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.4)]
  border border-slate-100 dark:border-slate-700
  hover:border-teal-500/50 dark:hover:border-teal-400/50
  group overflow-hidden
  min-h-[120px] sm:min-h-[180px]
  transform-gpu perspective-1000
  hover:scale-105 hover:-translate-y-2
  transition-all duration-300"
```

**Rationale:**
- Match homepage card styling exactly
- Same shadows, borders, hover effects
- Consistent animations
- Use min-height instead of fixed height

#### Add Background Gradient Effect
```tsx
{/* Add inside card button */}
<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-900/10"></div>
```

#### Update Icon and Text Styling
```tsx
// Icon
<span className="relative z-10 text-3xl sm:text-4xl mb-2 sm:mb-3 text-teal-600 dark:text-teal-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
  {CATEGORY_ICONS[category as WorkerCategory]}
</span>

// Text
<span className="relative z-10 text-sm sm:text-base font-bold text-center text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
  {CATEGORY_DISPLAY_NAMES[category as WorkerCategory]}
</span>
```

## Space Calculation

### Homepage - Mobile (375px width)

**BEFORE:**
```
Total width: 375px
Container padding: 8px × 2 = 16px
Available: 359px
Gap space: 8px × 2 = 16px
Card space: 343px
Per card: 343px ÷ 3 = 114px
```

**AFTER:**
```
Total width: 375px
Container padding: 0px × 2 = 0px
Available: 375px
Gap space: 6px × 2 = 12px
Card space: 363px
Per card: 363px ÷ 3 = 121px
```

**Gain:** +7px per card (6% larger)

### Homepage - Desktop (1024px width)

**BEFORE:**
```
Total width: 1024px
Container padding: 16px × 2 = 32px
Available: 992px
Gap space: 16px × 2 = 32px
Card space: 960px
Per card: 960px ÷ 3 = 320px
```

**AFTER:**
```
Total width: 1024px
Container padding: 0px × 2 = 0px
Available: 1024px
Gap space: 12px × 2 = 24px
Card space: 1000px
Per card: 1000px ÷ 3 = 333px
```

**Gain:** +13px per card (4% larger)

## Implementation Checklist

### HomePage.tsx Changes
- [ ] Line 91: Change `px-2 sm:px-4` to `px-0`
- [ ] Line 92: Change `gap-2 sm:gap-4` to `gap-1.5 sm:gap-3`
- [ ] Line 110: Change `p-2 sm:p-6` to `p-3 sm:p-6`
- [ ] Line 118: Change `min-h-[100px] sm:min-h-[160px]` to `min-h-[120px] sm:min-h-[180px]`

### GroupDetailPage.tsx Changes
- [ ] Line 21: Change `px-4` to `px-0`
- [ ] Line 36: Change `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6` to `grid-cols-3 gap-1.5 sm:gap-3`
- [ ] Lines 38-48: Replace entire button with homepage-style card
- [ ] Add background gradient effect
- [ ] Update icon styling with z-index and animations
- [ ] Update text styling with z-index and hover effects

## Testing Requirements

### Visual Tests
- [ ] Cards fill horizontal space on 320px
- [ ] Cards fill horizontal space on 375px
- [ ] Cards fill horizontal space on 414px
- [ ] Cards fill horizontal space on 768px
- [ ] Cards fill horizontal space on 1024px
- [ ] No horizontal scrolling at any breakpoint
- [ ] Consistent styling between homepage and detail page
- [ ] Hover effects work smoothly
- [ ] Animations are smooth (60fps)

### Functional Tests
- [ ] Cards are clickable/tappable
- [ ] Touch targets are adequate (44x44px+)
- [ ] Navigation works correctly
- [ ] No layout shift on page load
- [ ] Dark mode works correctly

### Accessibility Tests
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly

## Before/After Screenshots Needed

### Homepage
1. Mobile (375px) - Before
2. Mobile (375px) - After
3. Desktop (1024px) - Before
4. Desktop (1024px) - After

### Group Detail Page
1. Mobile (375px) - Before
2. Mobile (375px) - After
3. Desktop (1024px) - Before
4. Desktop (1024px) - After

## Performance Considerations

### CSS Optimizations
- Use `transform-gpu` for hardware acceleration
- Use `will-change` sparingly (only on hover)
- Avoid layout thrashing
- Use CSS transitions instead of JavaScript

### Bundle Size
- No additional dependencies needed
- Pure CSS changes
- No impact on bundle size

## Rollback Plan

If issues are found:
1. Revert container padding: `px-0` → `px-2 sm:px-4`
2. Revert gap spacing: `gap-1.5 sm:gap-3` → `gap-2 sm:gap-4`
3. Revert card padding: `p-3` → `p-2`
4. Revert min-height: `min-h-[120px]` → `min-h-[100px]`

All changes are CSS-only and easily reversible.

## Success Criteria

- ✅ Cards are 6-7% larger on mobile
- ✅ Cards are 4-5% larger on desktop
- ✅ Consistent 3-column layout
- ✅ Matching styling across pages
- ✅ No horizontal scrolling
- ✅ Smooth animations
- ✅ Better touch targets
- ✅ Professional appearance
- ✅ Positive user feedback
