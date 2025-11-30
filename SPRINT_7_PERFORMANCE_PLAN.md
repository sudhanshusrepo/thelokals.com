# Sprint 7: Performance Optimization Plan

## Objective
Improve application performance and Core Web Vitals based on Lighthouse report findings. The primary goal is to reduce main-thread work, optimize bundle sizes, and eliminate render-blocking resources.

## Lighthouse Findings Summary
- **Minimize Main-Thread Work**: 5.0s (Critical)
- **Reduce Unused JavaScript**: ~140 KiB potential savings
- **Render Blocking Requests**: ~160 ms delay
- **Long Main-Thread Tasks**: 11 tasks found, max 213ms

## Action Plan

### 1. Bundle Optimization (High Priority)
**Goal**: Reduce initial load size and split code effectively.

- [ ] **Route-Based Code Splitting**: Ensure all major routes in `App.tsx` are lazy-loaded using `React.lazy()` and `Suspense`.
- [ ] **Component Lazy Loading**: Identify heavy components (e.g., `MapComponent`, `ChatInput`, `LiveSearch`) and lazy load them if they are not immediately visible.
- [ ] **Analyze Bundle**: Use `rollup-plugin-visualizer` to analyze the build output and identify large dependencies.
- [ ] **Tree Shaking**: Review imports from large libraries (e.g., `date-fns`, `lodash`, icons). Ensure we are using named imports to allow tree-shaking.

### 2. Script & Resource Optimization
**Goal**: Reduce parsing time and network payload.

- [ ] **Modern Build Target**: Update `vite.config.ts` to target modern browsers (`esnext` or `es2020`) to avoid shipping unnecessary polyfills ("Avoid serving legacy JavaScript").
- [ ] **Defer Non-Critical Scripts**: Ensure third-party scripts (analytics, chat widgets) are loaded with `defer` or `async`, or loaded only after interaction.
- [ ] **Optimize Supabase**: The Supabase client chunk is large (~45KB). Verify if we are importing the full client unnecessarily or if it can be optimized.

### 3. Rendering Performance
**Goal**: Reduce main-thread blocking time.

- [ ] **Virtualization**: If displaying long lists (e.g., bookings, providers), implement `react-window` or `react-virtuoso` to render only visible items.
- [ ] **Memoization**: Audit `StickyChatCta`, `LiveSearch`, and `HomePage` for unnecessary re-renders. Use `useMemo` and `useCallback` for expensive calculations or callback functions.
- [ ] **Animation Optimization**: Ensure animations (framer-motion, CSS animations) are running on the compositor thread where possible (transform, opacity) rather than layout properties (width, height, top).

### 4. Asset Optimization
**Goal**: Reduce network transfer size.

- [ ] **Image Optimization**: Ensure all images use `WebP` format and have proper `width`/`height` attributes to prevent layout shifts.
- [ ] **Font Loading**: Use `font-display: swap` for web fonts to ensure text is visible during loading.

### 5. Map Optimization
**Goal**: Reduce the impact of the map library.

- [ ] **Lazy Load Map**: The `map-CLQTNqZj.js` chunk is significant. Ensure the Map component is only loaded when the user actually needs to view the map (e.g., on the "Live Search" or "Provider Location" screens), not on the home page initial load.

## Implementation Steps

1.  **Install Analyzer**: `npm install --save-dev rollup-plugin-visualizer`
2.  **Update Vite Config**: Configure build target and manual chunks.
3.  **Refactor Imports**: Audit and fix large imports.
4.  **Lazy Load Components**: Wrap heavy components in `Suspense`.
5.  **Verify**: Run Lighthouse again to measure improvements.

## Success Metrics
- **LCP (Largest Contentful Paint)**: < 2.5s
- **TBT (Total Blocking Time)**: < 200ms
- **Speed Index**: < 3.0s
