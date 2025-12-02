# Mobile Header CSS Fixes - Technical Specification

## Problem Analysis

### Current Issues

#### 1. Fixed Height Without Safe Area
```css
/* CURRENT - PROBLEMATIC */
.header {
  height: 56px; /* h-14 on mobile */
  position: sticky;
  top: 0;
}
```

**Problems:**
- On iPhone with notch: Header starts at 0px, overlaps with status bar (44px)
- On iPhone with Dynamic Island: Header overlaps with island area
- Content below header gets hidden behind it
- No accounting for safe areas

#### 2. Absolute Title Positioning
```tsx
/* CURRENT - PROBLEMATIC */
<div className="absolute left-1/2 -translate-x-1/2">
  <h1>{title}</h1>
</div>
```

**Problems:**
- On 320px screens, title can overlap with logo and buttons
- No max-width constraint
- No truncation for long titles

### Solution Architecture

## CSS Changes Required

### 1. Header Container with Safe Area Support

```css
/* NEW - SOLUTION */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  
  /* Safe area support for iOS */
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  
  /* Fallback for browsers without safe-area support */
  padding-top: 0;
  padding-top: env(safe-area-inset-top);
}

.header-inner {
  /* Use min-height instead of fixed height */
  min-height: 56px;
  
  /* Add vertical padding for breathing room */
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

@media (min-width: 640px) {
  .header-inner {
    min-height: 64px;
  }
}
```

### 2. Responsive Title Positioning

```css
/* NEW - SOLUTION */
.header-title-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  
  /* Prevent overlap on small screens */
  max-width: 40%;
  
  /* Prevent interaction blocking */
  pointer-events: none;
}

@media (min-width: 640px) {
  .header-title-container {
    max-width: none;
    pointer-events: auto;
  }
}

.header-title {
  /* Ensure long titles don't break layout */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 3. Content Offset for Fixed Header

```css
/* NEW - SOLUTION */
.main-content {
  /* Account for header height + safe area */
  padding-top: calc(env(safe-area-inset-top) + 56px + 1.5rem);
}

@media (min-width: 640px) {
  .main-content {
    padding-top: calc(env(safe-area-inset-top) + 64px + 1.5rem);
  }
}
```

## Tailwind CSS Implementation

### Before (Current)

```tsx
// packages/client/components/Header.tsx
<header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-14 sm:h-16">
      {/* Logo */}
      <div className="flex-shrink-0">...</div>
      
      {/* Title - PROBLEMATIC */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none sm:pointer-events-auto">
        <h1 className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">
          {title}
        </h1>
      </div>
      
      {/* Actions */}
      <nav>...</nav>
    </div>
  </div>
</header>
```

### After (Fixed)

```tsx
// packages/client/components/Header.tsx
<header 
  className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm"
  style={{
    paddingTop: 'env(safe-area-inset-top)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  }}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between min-h-[56px] sm:min-h-[64px] py-2">
      {/* Logo - with min-width to prevent squishing */}
      <div className="flex-shrink-0 min-w-[80px] sm:min-w-[120px]">...</div>
      
      {/* Title - FIXED */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none sm:pointer-events-auto max-w-[40%] sm:max-w-none px-2">
        <h1 className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base truncate">
          {title}
        </h1>
      </div>
      
      {/* Actions - with min-width to prevent squishing */}
      <nav className="flex items-center gap-2 sm:gap-4 min-w-[80px] sm:min-w-[120px] justify-end">...</nav>
    </div>
  </div>
</header>
```

### Main Content Update

```tsx
// packages/client/App.tsx
<main 
  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
  style={{
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px + 1.5rem)',
  }}
>
  {children}
</main>

// For sm breakpoint and up
@media (min-width: 640px) {
  main {
    padding-top: calc(env(safe-area-inset-top, 0px) + 64px + 1.5rem);
  }
}
```

## Viewport Meta Tag

### Before

```html
<!-- Might be missing or incomplete -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### After

```html
<!-- Required for safe-area-inset support -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

## Testing Checklist

### Visual Tests

#### iPhone SE (320px width)
- [ ] Header doesn't overlap status bar
- [ ] Title is visible (not hidden by logo/buttons)
- [ ] All buttons are tappable
- [ ] No horizontal scroll

#### iPhone 12/13 (390px width)
- [ ] Safe area insets applied correctly
- [ ] Title centered properly
- [ ] Dynamic Island area clear

#### iPhone 14 Pro Max (428px width)
- [ ] All elements properly spaced
- [ ] Title has room to breathe
- [ ] Safe areas respected

#### iPad (768px width)
- [ ] Desktop layout kicks in
- [ ] Full title visible
- [ ] Proper spacing maintained

### Functional Tests

- [ ] Sticky header stays at top when scrolling
- [ ] Header backdrop blur works
- [ ] Dark mode transitions smoothly
- [ ] Touch targets are 44x44px minimum
- [ ] No layout shift on page load

### Browser Tests

- [ ] iOS Safari 15+
- [ ] iOS Chrome
- [ ] Android Chrome
- [ ] Android Firefox
- [ ] Desktop Chrome (for comparison)

## Breakpoint Strategy

```css
/* Mobile First Approach */

/* Base: 320px - 639px (Mobile) */
.header-inner {
  min-height: 56px;
  padding: 0.5rem 0;
}

.header-title-container {
  max-width: 40%;
}

.header-logo,
.header-actions {
  min-width: 80px;
}

/* sm: 640px+ (Large Mobile / Tablet) */
@media (min-width: 640px) {
  .header-inner {
    min-height: 64px;
  }
  
  .header-title-container {
    max-width: none;
  }
  
  .header-logo,
  .header-actions {
    min-width: 120px;
  }
}

/* md: 768px+ (Tablet / Desktop) */
@media (min-width: 768px) {
  /* Desktop-specific adjustments if needed */
}
```

## Performance Considerations

### CSS Custom Properties for Safe Areas

```css
:root {
  /* Define fallbacks */
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
  
  /* Header heights */
  --header-height-mobile: 56px;
  --header-height-desktop: 64px;
}

/* Usage */
.header {
  padding-top: var(--safe-area-inset-top);
}

.main-content {
  padding-top: calc(var(--safe-area-inset-top) + var(--header-height-mobile) + 1.5rem);
}
```

## Browser Support

### Safe Area Insets
- ✅ iOS Safari 11+
- ✅ iOS Chrome 11+
- ✅ Android Chrome 69+
- ⚠️ Older browsers: Graceful degradation with fallback values

### CSS env() Function
- ✅ All modern browsers (2018+)
- ⚠️ IE11: Not supported (use fallback)

### Fallback Strategy

```css
/* Progressive Enhancement */
.header {
  /* Fallback for old browsers */
  padding-top: 0;
  
  /* Modern browsers with safe-area support */
  padding-top: env(safe-area-inset-top);
}
```

## Common Pitfalls to Avoid

### ❌ Don't Do This

```tsx
// Fixed height without safe area
<div className="h-14">

// No max-width on centered title
<div className="absolute left-1/2 -translate-x-1/2">

// Forgetting viewport-fit
<meta name="viewport" content="width=device-width, initial-scale=1.0">

// No padding on main content
<main className="pt-6">
```

### ✅ Do This Instead

```tsx
// Min-height with safe area
<div className="min-h-[56px]" style={{ paddingTop: 'env(safe-area-inset-top)' }}>

// Max-width constraint on title
<div className="absolute left-1/2 -translate-x-1/2 max-w-[40%] sm:max-w-none">

// Include viewport-fit
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

// Account for header + safe area
<main style={{ paddingTop: 'calc(env(safe-area-inset-top) + 56px + 1.5rem)' }}>
```

## Validation Tools

1. **Chrome DevTools Device Mode**
   - Test all breakpoints
   - Simulate safe areas

2. **iOS Simulator**
   - Test on actual iOS devices
   - Verify safe area behavior

3. **BrowserStack**
   - Real device testing
   - Multiple iOS/Android versions

4. **Lighthouse**
   - Mobile usability score
   - Touch target sizes

## Success Metrics

- ✅ 0 visual overlaps on tested devices
- ✅ 100% title visibility across breakpoints
- ✅ 44px minimum touch target size
- ✅ <100ms layout shift on load
- ✅ Lighthouse mobile score >90
