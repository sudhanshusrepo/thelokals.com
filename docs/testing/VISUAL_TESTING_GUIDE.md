# Visual Testing Guide - UI Improvements

## Quick Start

Both development servers are running:
- **Client App**: http://localhost:3000/
- **Provider App**: http://localhost:5173/

## Testing with Browser DevTools

### 1. Mobile Responsive Testing

#### Chrome DevTools
1. Open http://localhost:3000/
2. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Click the device toolbar icon (or press `Ctrl+Shift+M`)
4. Test these device presets:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPhone 14 Pro Max (430x932)
   - iPad (768x1024)

#### Test Safe Area Insets (iOS Notch)
1. In DevTools, select "iPhone 12 Pro" or "iPhone 14 Pro"
2. Open the "..." menu → "More tools" → "Sensors"
3. The safe area should be visible at the top
4. Verify header doesn't overlap with notch area

### 2. Header Testing Checklist

Open each app and verify:

#### Client App (http://localhost:3000/)
```
✓ Header has proper spacing from top
✓ Logo is visible and clickable
✓ Page title doesn't overflow
✓ Search icon is accessible
✓ User avatar (if logged in) is visible
✓ Content below header is not hidden
```

#### Provider App (http://localhost:5173/)
```
✓ Header has proper spacing from top
✓ Logo is visible and clickable
✓ Page title doesn't overflow
✓ Sign in button is accessible
✓ Auto-saving indicator works
✓ Content below header is not hidden
```

### 3. Card Layout Testing

#### Homepage Cards (Client App)
1. Go to http://localhost:3000/
2. Scroll to service cards section
3. Verify:
   ```
   ✓ Cards extend to screen edges (no side margins)
   ✓ 3 columns visible
   ✓ Cards are larger than before
   ✓ Hover effects work (desktop)
   ✓ Icons are properly sized
   ✓ Text is readable
   ```

#### Group Detail Cards
1. Click any service category card
2. Verify:
   ```
   ✓ Same 3-column layout as homepage
   ✓ Same card styling (shadows, borders)
   ✓ Same gap spacing
   ✓ Gradient overlay on hover
   ✓ Icon animations work
   ```

### 4. Authentication Modal Testing

#### Client App
1. Click "Sign In" in the header
2. Verify modal appearance:
   ```
   ✓ Modal centers properly
   ✓ Close button (X) works
   ✓ Title and subtitle visible
   ✓ Google OAuth button styled correctly
   ✓ Email field styled correctly
   ✓ Password field styled correctly
   ✓ Submit button styled correctly
   ✓ Toggle to "Sign Up" works
   ```

#### Provider App
1. Go to http://localhost:5173/
2. Click "Sign In" button
3. Verify same styling as client app
4. Check provider-specific copy:
   ```
   ✓ Title: "Provider Sign In" or "Become a Partner"
   ✓ Subtitle mentions provider/business
   ✓ Success screen shows after signup
   ```

### 5. Dark Mode Testing

1. Open DevTools Console
2. Run: `document.documentElement.classList.toggle('dark')`
3. Verify:
   ```
   ✓ Header colors invert correctly
   ✓ Card backgrounds change
   ✓ Text contrast is sufficient
   ✓ Auth modal looks good
   ✓ Hover states work in dark mode
   ```

### 6. Accessibility Testing

#### Keyboard Navigation
1. Press `Tab` to navigate through elements
2. Verify:
   ```
   ✓ Focus indicators visible
   ✓ Logical tab order
   ✓ Can open auth modal with keyboard
   ✓ Can close modal with Escape
   ✓ Can submit form with Enter
   ```

#### Screen Reader (Optional)
1. Enable screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)
2. Navigate through the page
3. Verify all elements are announced properly

### 7. Performance Testing

#### Lighthouse Audit
1. Open DevTools
2. Go to "Lighthouse" tab
3. Select:
   - ☑ Performance
   - ☑ Accessibility
   - ☑ Best Practices
   - ☑ SEO
   - Device: Mobile
4. Click "Analyze page load"
5. Target scores:
   - Performance: >90
   - Accessibility: 100
   - Best Practices: >90
   - SEO: >90

### 8. Network Testing

#### Check Shared Components
1. Open DevTools → Network tab
2. Reload the page
3. Filter by "JS"
4. Verify auth components are in a shared chunk (not duplicated)

#### Bundle Size
1. Run production build: `npm run build:client`
2. Check `dist/` folder
3. Compare sizes with previous build
4. Acceptable increase: <10%

## Common Issues & Solutions

### Issue: Header overlaps content
**Solution**: Check that `env(safe-area-inset-top)` is in the header style

### Issue: Cards have side margins
**Solution**: Verify container has `px-0` class

### Issue: Auth modal looks different in provider app
**Solution**: Ensure both apps import from `@core/components/auth`

### Issue: Dark mode doesn't work
**Solution**: Check that `dark:` variants are in Tailwind classes

## Screenshot Checklist

Take screenshots of:
1. ✓ Homepage - Mobile (375px)
2. ✓ Homepage - Desktop (1024px)
3. ✓ Group Detail - Mobile (375px)
4. ✓ Group Detail - Desktop (1024px)
5. ✓ Auth Modal - Mobile (375px)
6. ✓ Auth Modal - Desktop (1024px)
7. ✓ Header on iPhone 14 Pro (safe area visible)
8. ✓ Dark mode - All above screens

## Quick Commands

```bash
# Start dev servers
npm run dev:client    # Port 3000
npm run dev:provider  # Port 5173

# Run validation
node scripts/validate-ui-improvements.js

# Build for production
npm run build:client
npm run build:provider

# Run tests
npm run test:e2e
```

## Reporting Issues

If you find any issues:
1. Take a screenshot
2. Note the device/browser
3. Describe the expected vs actual behavior
4. Add to the "Issues Found" table in `TESTING_CHECKLIST.md`

---

**Happy Testing! 🚀**
